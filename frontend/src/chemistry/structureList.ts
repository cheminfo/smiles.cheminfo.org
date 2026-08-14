import * as OCL from 'openchemlib';
import { MoleculesDB } from 'openchemlib-utils';

import { structureErrorMessage } from '../../../chemistry/errorMessage.ts';
import { readStructure } from '../../../chemistry/parse.ts';
import type { ListLayout } from '../../../chemistry/splitList.ts';
import { parseList } from '../../../chemistry/splitList.ts';
import type { InputFormat } from '../../../chemistry/types.ts';

/** One line of a list, read. */
export interface ListRow {
  /** Where it was in the text, which is how a failure is pointed at. */
  line: number;
  input: string;
  /** What named it in the file, when anything did. */
  label?: string;
  /** The other columns of its row, under the names the file gave them. */
  fields?: Record<string, string>;
  /** Present when the line was read. */
  molecule?: OCL.Molecule;
  /** Absent on a query, which has no formula of its own. */
  mf?: string;
  mw?: number;
  /** Present when the line could not be read. */
  error?: string;
}

export interface ReadListResult {
  rows: ListRow[];
  /** The same molecules, indexed so the list can be searched. */
  database: MoleculesDB;
  /** How many lines were read; the others carry their error. */
  read: number;
  /** How the text turned out to be written, so the page can say what it read. */
  layout: ListLayout;
}

export interface ReadListOptions {
  /**
   * What the lines are read as.
   * @default 'auto'
   */
  from?: InputFormat;
  /** Called with how many lines have been read, to move a progress bar. */
  onStep?: (done: number, total: number) => void;
  /** Stop early — a list of ten thousand takes a while to read. */
  signal?: AbortSignal;
}

/** Lines read between two looks at the clock. */
const CHUNK = 200;

/**
 * How long the loop may hold the thread before handing it back. A yield costs
 * a task of its own, so a list of half a million cannot afford one every 200
 * rows; a frame's worth of work between them keeps the page answering the
 * mouse without paying for a timer per chunk.
 */
const SLICE_MS = 40;

/**
 * Read a list of structures, converting and indexing it in the same pass.
 *
 * Converting a list and searching it are the same reading: the molecules that
 * fill the table are the molecules the query runs over, so the text is parsed
 * once and the screening index `openchemlib-utils` needs is built as the rows
 * are made. The work is cut into chunks with a yield between them, because ten
 * thousand structures is several seconds of parsing and a page that stops
 * answering the mouse for several seconds looks broken. A line that cannot be
 * read keeps its place in the list with the reason next to it — losing the
 * other 9999 because of one typo is not a conversion.
 * @param text - The list, as pasted, dropped or fetched.
 * @param options - How to read it, and how to report and stop the work.
 * @returns Every line, the searchable set, and how much of it was read.
 */
export async function readList(
  text: string,
  options: ReadListOptions = {},
): Promise<ReadListResult> {
  const { from = 'auto', onStep, signal } = options;
  const { entries, layout } = parseList(text);
  const database = new MoleculesDB(OCL);
  const rows: ListRow[] = [];
  let read = 0;
  let since = performance.now();

  for (let index = 0; index < entries.length; index++) {
    const entry = entries[index];
    if (!entry) continue;
    const row: ListRow = { line: entry.line, input: entry.structure };
    if (entry.label !== undefined) row.label = entry.label;
    if (entry.fields !== undefined) row.fields = entry.fields;
    try {
      const { molecule } = readStructure(entry.structure, from);
      row.molecule = molecule;
      if (!molecule.isFragment()) {
        const formula = molecule.getMolecularFormula();
        row.mf = formula.formula;
        row.mw = formula.relativeWeight;
      }
      // The row number travels with the entry, so a hit knows which line of
      // the list it is — two identical structures are two rows and one entry.
      const data: EntryData = { row: rows.length };
      if (entry.label !== undefined) data.label = entry.label;
      database.pushEntry(molecule, data);
      read++;
    } catch (error) {
      row.error = structureErrorMessage(error);
    }
    rows.push(row);

    if (index % CHUNK === CHUNK - 1 && performance.now() - since > SLICE_MS) {
      onStep?.(index + 1, entries.length);
      // eslint-disable-next-line no-await-in-loop -- yielding to the browser is the point: the loop must not hold the main thread
      await yieldToBrowser();
      if (signal?.aborted) break;
      since = performance.now();
    }
  }

  onStep?.(entries.length, entries.length);
  return { rows, database, read, layout };
}

/** What is kept beside a molecule in the index. */
export interface EntryData {
  row: number;
  label?: string;
}

/**
 * Hand the thread back, so the page keeps answering while a long list runs.
 * @returns A promise resolved on the next macrotask.
 */
function yieldToBrowser(): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(resolve, 0);
  });
}
