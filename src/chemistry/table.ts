import Papa from 'papaparse';

/** One row of a list, and where in the text it came from. */
export interface TableRow {
  cells: string[];
  /** 1-based line the row started on, so an error can point back at it. */
  line: number;
  /**
   * What followed the first token, kept only for a blank-separated list:
   * `OC(=O)c1ccccc1 benzoic acid` is one structure and one name of two words,
   * not three columns.
   */
  rest?: string;
}

export interface Table {
  rows: TableRow[];
  /** What separated the columns; a single space when only blanks did. */
  delimiter: string;
}

/** Separators a delimited file may be written with. */
const DELIMITERS = ['\t', ';', ',', '|'];

/**
 * Cut a list into rows and columns.
 *
 * The separator is worked out rather than asked for, because a chemist exports
 * whatever their spreadsheet writes and a `.csv`, a `.tsv` and a `.smi` all
 * arrive in the same box. `papaparse` does the cutting: a name holding a comma
 * inside quotes, a quoted field spanning two lines and a `""` escape are
 * exactly the things a `split(',')` gets wrong once and then debugs forever.
 * A blank-separated file is not passed through it — consecutive blanks would
 * become empty columns — so it is cut here, keeping the rest of the line whole.
 * @param text - The list, as pasted or read from a file.
 * @returns The rows that hold something, and what separated their columns.
 */
export function readTable(text: string): Table {
  const parsed = Papa.parse<string[]>(text, {
    delimiter: '',
    delimitersToGuess: DELIMITERS,
    skipEmptyLines: false,
  });

  const delimiter = parsed.meta.delimiter;
  if (DELIMITERS.includes(delimiter)) {
    const rows = delimitedRows(parsed.data);
    // The guesser always answers something: a `.smi` file holding one comma in
    // one name comes back as a comma-separated file of mostly one column.
    if (rows.length > 0 && countColumned(rows) * 2 > rows.length) {
      return { rows, delimiter };
    }
  }
  return { rows: blankSeparatedRows(text), delimiter: ' ' };
}

/**
 * The rows of a parsed file that hold something, numbered by the line they
 * started on.
 * @param data - Every row `papaparse` produced, blank lines included.
 * @returns The meaningful rows.
 */
function delimitedRows(data: string[][]): TableRow[] {
  const rows: TableRow[] = [];
  let line = 1;
  for (const cells of data) {
    const trimmed = cells.map((cell) => cell.trim());
    if (!isEmpty(trimmed) && !isComment(trimmed)) {
      rows.push({ cells: trimmed, line });
    }
    // A quoted field may hold newlines of its own, so a row is not always one
    // line: the count has to follow the text rather than the row number.
    line += 1 + newlinesIn(cells);
  }
  return rows;
}

/**
 * The rows of a file whose columns are separated by blanks — the Daylight
 * SMILES file, where the first field is the structure and the rest is a name.
 * @param text - The list, as pasted or read from a file.
 * @returns The meaningful rows, each keeping the text after its first token.
 */
function blankSeparatedRows(text: string): TableRow[] {
  const rows: TableRow[] = [];
  const lines = text.split(/\r?\n/);
  for (let index = 0; index < lines.length; index++) {
    const line = (lines[index] ?? '').trim();
    if (!line || line.startsWith('#')) continue;
    const cells = line.split(/\s+/);
    const rest = line
      .slice((cells[0] ?? '').length)
      // A CSV written with `, ` leaves the blank behind, and so does a `;`.
      .replace(/^[\s,;]+/, '')
      .trim();
    rows.push({ cells, line: index + 1, ...(rest ? { rest } : {}) });
  }
  return rows;
}

function countColumned(rows: TableRow[]): number {
  let count = 0;
  for (const row of rows) {
    if (row.cells.length > 1) count++;
  }
  return count;
}

function isEmpty(cells: string[]): boolean {
  for (const cell of cells) {
    if (cell) return false;
  }
  return true;
}

function isComment(cells: string[]): boolean {
  return (cells[0] ?? '').startsWith('#');
}

function newlinesIn(cells: string[]): number {
  let count = 0;
  for (const cell of cells) {
    for (const character of cell) {
      if (character === '\n') count++;
    }
  }
  return count;
}
