import { parse } from 'sdf-parser';

import type { ListEntry } from './splitList.ts';

/** How an SDF record names itself, in the order the fields are tried. */
const NAME_FIELDS = ['Name', 'name', 'NAME', 'Title', 'title', 'ID', 'id'];

/**
 * Whether a piece of text is an SDF rather than a list of line notations.
 *
 * An SDF terminates every record with `$$$$` on its own line, which nothing
 * else in this site's input ever contains — a SMILES cannot hold a `$` outside
 * a bracket, and a bare molfile has no terminator at all.
 * @param text - The text, as pasted or read from a file.
 * @returns True when it should be read as an SDF.
 */
export function looksLikeSdf(text: string): boolean {
  return /^\$\$\$\$\s*$/m.test(text);
}

/**
 * Read an SDF into the same entries a pasted list produces, so one page can
 * take either without knowing which it got.
 *
 * The record's own name field becomes the label and every other field is kept
 * beside it, so what the file knew about a molecule survives the conversion
 * and comes back out of it. `sdf-parser` does the reading, because the `$$$$`
 * terminators, the `>  <field>` headers and the blank lines between them are
 * exactly the sort of thing that is parsed wrong once and then debugged
 * forever.
 * @param text - The SDF.
 * @returns One entry per record, the molfile as its structure.
 */
export function readSdf(text: string): ListEntry[] {
  const { molecules } = parse(text, { dynamicTyping: false, mixedEOL: true });
  const entries = new Array<ListEntry>(molecules.length);

  for (let index = 0; index < molecules.length; index++) {
    const record = molecules[index];
    const label = record === undefined ? undefined : nameOf(record);
    const fields = record === undefined ? {} : fieldsOf(record, label);
    entries[index] = {
      structure: record?.molfile ?? '',
      // A record is not a line, so the record number is what an error points
      // at — which is what a chemist counts in an SDF anyway.
      line: index + 1,
      ...(label === undefined ? {} : { label }),
      ...(Object.keys(fields).length > 0 ? { fields } : {}),
    };
  }
  return entries;
}

/**
 * The name of a record, from whichever field carries one.
 * @param record - One parsed SDF record.
 * @returns The name, or nothing when no field holds one.
 */
function nameOf(record: Record<string, unknown>): string | undefined {
  for (const field of NAME_FIELDS) {
    const value = record[field];
    if (typeof value === 'string' && value.trim()) return value.trim();
  }
  return undefined;
}

/**
 * Everything the record says besides its structure and its name.
 * @param record - One parsed SDF record.
 * @param label - The name already taken from it, so it is not kept twice.
 * @returns The other fields, empty when there are none.
 */
function fieldsOf(
  record: Record<string, unknown>,
  label: string | undefined,
): Record<string, string> {
  const fields: Record<string, string> = {};
  for (const [key, value] of Object.entries(record)) {
    if (key === 'molfile' || typeof value !== 'string') continue;
    const text = value.trim();
    if (!text || text === label) continue;
    fields[key] = text;
  }
  return fields;
}
