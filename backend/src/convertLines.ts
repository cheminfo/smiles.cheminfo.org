import { writeMolecule } from '../../chemistry/describe.ts';
import { structureErrorMessage } from '../../chemistry/errorMessage.ts';
import { parseStructure } from '../../chemistry/parse.ts';
import type { ListEntry } from '../../chemistry/splitList.ts';
import type { InputFormat, OutputFormat } from '../../chemistry/types.ts';

/**
 * Structures read between two yields to the event loop.
 *
 * At roughly 0.12 ms a structure this is about 60 ms of work per turn, which is
 * short enough that a health check or another caller is never left waiting on
 * somebody else's list.
 */
const CHUNK = 500;

/** One converted line, as the API hands it back. */
export interface ConvertedLine {
  line: number;
  input: string;
  label?: string;
  fields?: Record<string, string>;
  output?: string;
  mf?: string;
  mw?: number;
  error?: string;
}

export interface ConvertedList {
  count: number;
  failed: number;
  entries: ConvertedLine[];
}

/**
 * Convert a whole list, handing the event loop back as it goes.
 *
 * A hundred thousand structures is twelve seconds of parsing. Done in one
 * synchronous pass that is twelve seconds in which the service answers nothing
 * at all — not another caller, not a health check — so the work is cut into
 * chunks with a yield between them. It takes exactly as long either way; the
 * difference is that everyone else is no longer blocked behind it.
 * @param lines - The list, already split.
 * @param from - How to read each structure.
 * @param to - How to write it back.
 * @returns Every line, with what it converted to or why it did not.
 */
export async function convertLines(
  lines: readonly ListEntry[],
  from: InputFormat,
  to: OutputFormat,
): Promise<ConvertedList> {
  const entries = new Array<ConvertedLine>(lines.length);
  let failed = 0;

  for (let index = 0; index < lines.length; index++) {
    const entry = lines[index];
    if (entry === undefined) continue;
    const converted = convertOne(entry, from, to);
    if (converted.error !== undefined) failed++;
    entries[index] = converted;

    if (index % CHUNK === CHUNK - 1) {
      // eslint-disable-next-line no-await-in-loop -- yielding is the point: the loop must not hold the event loop
      await yieldToEventLoop();
    }
  }

  return { count: entries.length, failed, entries };
}

/**
 * Read every line that can be read, as records for an SDF.
 *
 * Yields on the same schedule as {@link convertLines}, and for the same reason.
 * A line nobody can read is not a record — `/v1/batch` is where a caller finds
 * out which ones those were.
 * @param lines - The list, already split.
 * @param from - How to read each structure.
 * @returns One record per readable line.
 */
export async function buildRecords(
  lines: readonly ListEntry[],
  from: InputFormat,
): Promise<Array<Record<string, string>>> {
  const records: Array<Record<string, string>> = [];

  for (let index = 0; index < lines.length; index++) {
    const entry = lines[index];
    if (entry !== undefined) {
      const record = recordOf(entry, from);
      if (record) records.push(record);
    }

    if (index % CHUNK === CHUNK - 1) {
      // eslint-disable-next-line no-await-in-loop -- yielding is the point: the loop must not hold the event loop
      await yieldToEventLoop();
    }
  }

  return records;
}

function convertOne(
  entry: ListEntry,
  from: InputFormat,
  to: OutputFormat,
): ConvertedLine {
  // Whatever the file said about the molecule is handed back with it, so a
  // caller who sent a CSV of eight columns still has the eight.
  const read: ConvertedLine = {
    line: entry.line,
    input: entry.structure,
    ...(entry.label === undefined ? {} : { label: entry.label }),
    ...(entry.fields === undefined ? {} : { fields: entry.fields }),
  };

  try {
    const molecule = parseStructure(entry.structure, from);
    const formula = molecule.getMolecularFormula();
    return {
      ...read,
      output: writeMolecule(molecule, to),
      mf: formula.formula,
      mw: formula.relativeWeight,
    };
  } catch (error) {
    return { ...read, error: structureErrorMessage(error) };
  }
}

function recordOf(
  entry: ListEntry,
  from: InputFormat,
): Record<string, string> | null {
  try {
    const molecule = parseStructure(entry.structure, from);
    const formula = molecule.getMolecularFormula();
    return {
      ...entry.fields,
      molfile: molecule.toMolfile(),
      Name: entry.label ?? '',
      SMILES: molecule.toIsomericSmiles(),
      'Molecular Formula': formula.formula,
      'Molecular Weight': formula.relativeWeight.toFixed(4),
    };
  } catch {
    return null;
  }
}

/**
 * Hand the event loop back for one turn.
 * @returns A promise resolved on the next macrotask.
 */
function yieldToEventLoop(): Promise<void> {
  return new Promise((resolve) => {
    setImmediate(resolve);
  });
}
