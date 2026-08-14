import { looksLikeSmarts, readStructure } from './parse.ts';
import type { TableRow } from './table.ts';

/** What the columns of a list turned out to be. */
export interface TableLayout {
  /** The column the structures are in. */
  structure: number;
  /** The column that names them, when one does. */
  label?: number;
  /** The names the first row gave the columns, when it was a header. */
  header?: string[];
}

/** Rows looked at to work out what the columns hold. */
const SAMPLE = 20;

/** A header that says the column is the structure. */
const STRUCTURE_HEADER =
  /\b(?:smiles|smarts|structure|smi|id[ _-]?code|molfile|mol)\b/i;

/**
 * Headers that say the column names the structure, best first: a file holding
 * both an `ID` and a `Name` is named by its `Name`, and the leftmost column is
 * as often as not the identifier.
 */
const LABEL_HEADERS = [
  /^(?:name|title|label)$/i,
  /\b(?:name|title|label|compound|molecule|chemical|iupac)\b/i,
  /\b(?:id|identifier|code|cas|ref|reference)\b/i,
];

/**
 * A cell that could be a line notation: no blanks, at least one letter, and
 * nothing outside the characters SMILES and SMARTS are written with. Cheap
 * enough to run over every cell of every sampled row before anything is
 * handed to a parser.
 */
const STRUCTURE_CHARS = /^[A-Za-z0-9@+\-[\]()=#$%*\\/.:~&,;!]+$/;

/**
 * A cell a header is written with: a word, possibly several, and none of the
 * punctuation a structure needs.
 */
const HEADER_CHARS = /^[A-Za-z][A-Za-z0-9 _./%-]*$/;

/**
 * Work out which column holds the structures, which one names them, and
 * whether the first row named the columns.
 *
 * The column is found by **reading** the cells, not by trusting a header: a
 * file exported from a spreadsheet puts the SMILES wherever the chemist had
 * it, and half of them carry no header at all. Every candidate is parsed as a
 * line notation and has to come back holding an atom — an idCode is not tried
 * here, because it accepts nearly any run of letters, so `ethanol` would read
 * as a molecule of 1106 atoms and the name column would win. A header is only
 * consulted to break a tie, which is what settles a file carrying both a
 * `SMILES` and a `Molecular Formula` column.
 * @param rows - The rows of the list, the header row included.
 * @returns Which column is which.
 */
export function readLayout(rows: TableRow[]): TableLayout {
  const first = rows[0];
  const body = rows.slice(1);
  const counts = countStructures(body.length > 0 ? body : rows);

  const header = first && isHeader(first, counts) ? first.cells : undefined;
  const structure = structureColumn(counts, header);
  const label = labelColumn(rows, header, structure);

  return {
    structure,
    ...(label === undefined ? {} : { label }),
    ...(header === undefined ? {} : { header }),
  };
}

/**
 * Whether a cell reads as a structure.
 *
 * Only SMILES and SMARTS are tried, and the molecule has to hold an atom:
 * openchemlib reads `46.07` and `64-17-5` without complaint and answers with
 * an empty molecule, so a column of masses or registry numbers would otherwise
 * score as well as the structures.
 * @param text - One cell.
 * @returns True when it parses to at least one atom.
 */
export function isStructureCell(text: string): boolean {
  if (!STRUCTURE_CHARS.test(text) || !/[A-Za-z]/.test(text)) return false;
  try {
    const format = looksLikeSmarts(text) ? 'smarts' : 'smiles';
    return readStructure(text, format).molecule.getAllAtoms() > 0;
  } catch {
    return false;
  }
}

/**
 * How many of the sampled rows hold a structure in each column.
 * @param rows - The rows below the first one.
 * @returns One count per column.
 */
function countStructures(rows: TableRow[]): number[] {
  const counts: number[] = [];
  const sampled = Math.min(rows.length, SAMPLE);
  for (let index = 0; index < sampled; index++) {
    const cells = rows[index]?.cells ?? [];
    for (let column = 0; column < cells.length; column++) {
      const count = counts[column] ?? 0;
      counts[column] = isStructureCell(cells[column] ?? '') ? count + 1 : count;
    }
  }
  return counts;
}

/**
 * Whether the first row names the columns rather than holding a structure.
 * @param first - The first row of the list.
 * @param counts - How many structures each column holds below it.
 * @returns True when it is a header.
 */
function isHeader(first: TableRow, counts: number[]): boolean {
  let named = false;
  for (const cell of first.cells) {
    if (!cell) continue;
    // One structure anywhere in the row and it is a row of data, whatever the
    // other cells say.
    if (isStructureCell(cell)) return false;
    if (!HEADER_CHARS.test(cell)) return false;
    if (STRUCTURE_HEADER.test(cell) || namesStructure(cell)) named = true;
  }
  // A row of words above rows of structures is a header; a row of words above
  // nothing at all is the only line of a list nobody could read, and calling
  // it a header would leave the list empty.
  return named || hasStructures(counts);
}

/**
 * Which column the structures are in.
 * @param counts - How many structures each column holds.
 * @param header - The column names, when the list carries them.
 * @returns The column, leftmost when nothing parsed at all.
 */
function structureColumn(counts: number[], header?: string[]): number {
  let best = 0;
  let bestCount = 0;
  for (let column = 0; column < counts.length; column++) {
    const count = counts[column] ?? 0;
    if (count > bestCount) {
      best = column;
      bestCount = count;
    } else if (count === bestCount && count > 0 && header) {
      // A tie is what a file with both a `SMILES` and a `Molecular Formula`
      // column produces, and the header is what tells them apart.
      const name = header[column] ?? '';
      if (
        STRUCTURE_HEADER.test(name) &&
        !STRUCTURE_HEADER.test(header[best] ?? '')
      ) {
        best = column;
      }
    }
  }
  return best;
}

/**
 * Which column names the structures: the one the header says does, or the
 * first other column that holds anything.
 * @param rows - The rows of the list, the header row included.
 * @param header - The column names, when the list carries them.
 * @param structure - The column the structures are in.
 * @returns The column, or nothing when no other column holds anything.
 */
function labelColumn(
  rows: TableRow[],
  header: string[] | undefined,
  structure: number,
): number | undefined {
  if (header) {
    for (const pattern of LABEL_HEADERS) {
      for (let column = 0; column < header.length; column++) {
        if (column === structure) continue;
        if (pattern.test(header[column] ?? '')) return column;
      }
    }
  }

  const body = header ? rows.slice(1) : rows;
  const width = widthOf(body);
  for (let column = 0; column < width; column++) {
    if (column === structure) continue;
    for (let index = 0; index < Math.min(body.length, SAMPLE); index++) {
      if (body[index]?.cells[column]) return column;
    }
  }
  return undefined;
}

/**
 * Whether a header says its column names the structure.
 * @param name - One header cell.
 * @returns True when any of the patterns claims it.
 */
function namesStructure(name: string): boolean {
  for (const pattern of LABEL_HEADERS) {
    if (pattern.test(name)) return true;
  }
  return false;
}

function widthOf(rows: TableRow[]): number {
  let width = 0;
  for (let index = 0; index < Math.min(rows.length, SAMPLE); index++) {
    const length = rows[index]?.cells.length ?? 0;
    if (length > width) width = length;
  }
  return width;
}

function hasStructures(counts: number[]): boolean {
  for (const count of counts) {
    if (count > 0) return true;
  }
  return false;
}
