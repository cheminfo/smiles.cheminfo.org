import { looksLikeSdf, readSdf } from './readSdf.ts';
import type { TableRow } from './table.ts';
import { readTable } from './table.ts';
import type { TableLayout } from './tableLayout.ts';
import { readLayout } from './tableLayout.ts';

/** One line of a pasted list: the structure, and whatever came with it. */
export interface ListEntry {
  structure: string;
  /** Absent when the line held nothing but a structure. */
  label?: string;
  /** 1-based line the entry came from, so an error can point back at it. */
  line: number;
  /**
   * The other columns, under the names the header gave them. Absent when the
   * line held nothing else.
   */
  fields?: Record<string, string>;
}

/** How a list turned out to be written, so a page can say what it read. */
export interface ListLayout {
  kind: 'sdf' | 'lines' | 'table';
  /** What separated the columns; a single space when only blanks did. */
  delimiter?: string;
  /** What the columns are called — the header row, or `Column n`. */
  columns?: string[];
  /** Which column the structures were read from. */
  structureColumn?: number;
  /** Which column named them. */
  labelColumn?: number;
  /** True when the first line named the columns rather than holding a structure. */
  header?: boolean;
}

export interface ParsedList {
  entries: ListEntry[];
  layout: ListLayout;
}

/**
 * Read a pasted list of structures, and say how it was written.
 *
 * A list arrives as whatever the chemist had: a Daylight `.smi` file, a CSV a
 * spreadsheet exported with a header row and eight columns, a TSV whose SMILES
 * is the third of them, or an SDF. Nothing is asked for, because the answer is
 * in the text: `table.ts` finds the separator, `tableLayout.ts` finds the
 * column that parses as a structure and the one that names it, and every other
 * column is kept as a field so what a chemist knew about a molecule survives
 * the conversion and comes back out in the CSV and the SDF.
 *
 * A `#` line is a comment and a blank line is nothing, so a file with a heading
 * and sections still reads.
 * @param text - The list, as pasted or read from a file.
 * @returns One entry per meaningful line, in order, and what the columns were.
 */
export function parseList(text: string): ParsedList {
  // An SDF is a list of structures too, just written down the page instead of
  // across it. Recognising it here is what lets every page that takes a list
  // take an SDF without asking which it was handed.
  if (looksLikeSdf(text)) {
    return { entries: readSdf(text), layout: { kind: 'sdf' } };
  }

  const { rows, delimiter } = readTable(text);
  const layout = readLayout(rows);
  const body = layout.header ? rows.slice(1) : rows;

  // The Daylight file: one structure, then a name that may hold blanks of its
  // own. Its columns are not counted — `benzoic acid` is one name of two
  // words, and reading it as two columns names the molecule `benzoic`. A
  // header, or a structure that is not the first thing on the line, says the
  // blanks are separating columns after all.
  if (
    delimiter === ' ' &&
    layout.header === undefined &&
    layout.structure === 0
  ) {
    return { entries: plainEntries(body), layout: { kind: 'lines' } };
  }

  const columns = columnNames(rows, layout);
  return {
    entries: tableEntries(body, layout, columns),
    layout: {
      kind: 'table',
      delimiter,
      columns,
      structureColumn: layout.structure,
      ...(layout.label === undefined ? {} : { labelColumn: layout.label }),
      header: layout.header !== undefined,
    },
  };
}

/**
 * Read a pasted list of structures.
 * @param text - The list, as pasted or read from a file.
 * @returns One entry per meaningful line, in order.
 */
export function splitList(text: string): ListEntry[] {
  return parseList(text).entries;
}

/**
 * The structures of a list, without their names — what a search index or a
 * count needs.
 * @param text - The list, as pasted or read from a file.
 * @returns The structures, in order.
 */
export function listStructures(text: string): string[] {
  const entries = splitList(text);
  const structures = new Array<string>(entries.length);
  for (let index = 0; index < entries.length; index++) {
    structures[index] = entries[index]?.structure ?? '';
  }
  return structures;
}

/**
 * What every column is called: the header row where there is one, and the
 * position where there is not, so a field always has a name to be kept under.
 * @param rows - Every row of the list.
 * @param layout - Which column is which.
 * @returns One name per column.
 */
function columnNames(rows: TableRow[], layout: TableLayout): string[] {
  let width = layout.header?.length ?? 0;
  for (const row of rows) {
    if (row.cells.length > width) width = row.cells.length;
  }

  const names = new Array<string>(width);
  for (let column = 0; column < width; column++) {
    names[column] = layout.header?.[column] || `Column ${column + 1}`;
  }
  return names;
}

/**
 * One entry per line of a Daylight file: the structure, and the rest of the
 * line as its name.
 * @param rows - The rows of the list.
 * @returns The entries.
 */
function plainEntries(rows: TableRow[]): ListEntry[] {
  const entries = new Array<ListEntry>(rows.length);
  for (let index = 0; index < rows.length; index++) {
    const row = rows[index];
    entries[index] = {
      structure: row?.cells[0] ?? '',
      ...(row?.rest ? { label: row.rest } : {}),
      line: row?.line ?? index + 1,
    };
  }
  return entries;
}

/**
 * One entry per row of a table: the structure column, the column that names
 * it, and everything else kept as a field.
 * @param rows - The rows below the header.
 * @param layout - Which column is which.
 * @param columns - What every column is called.
 * @returns The entries.
 */
function tableEntries(
  rows: TableRow[],
  layout: TableLayout,
  columns: string[],
): ListEntry[] {
  const entries = new Array<ListEntry>(rows.length);
  for (let index = 0; index < rows.length; index++) {
    const cells = rows[index]?.cells ?? [];
    const label = layout.label === undefined ? '' : (cells[layout.label] ?? '');
    const fields: Record<string, string> = {};
    let kept = 0;

    for (let column = 0; column < cells.length; column++) {
      if (column === layout.structure || column === layout.label) continue;
      const value = cells[column] ?? '';
      if (!value) continue;
      fields[columns[column] ?? `Column ${column + 1}`] = value;
      kept++;
    }

    entries[index] = {
      structure: cells[layout.structure] ?? '',
      ...(label ? { label } : {}),
      line: rows[index]?.line ?? index + 1,
      ...(kept > 0 ? { fields } : {}),
    };
  }
  return entries;
}
