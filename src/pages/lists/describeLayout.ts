import type { ListLayout } from '../../chemistry/splitList.ts';

/** What a separator is called, so the page says `comma` and not `,`. */
const SEPARATORS: Record<string, string> = {
  ',': 'comma',
  ';': 'semicolon',
  '|': 'pipe',
  '\t': 'tab',
  ' ': 'blank',
};

/**
 * Say what was read and out of which column.
 *
 * The file is not asked about — the separator, the header and the column
 * holding the structures are all worked out from the text — so the page has to
 * report what it decided. A chemist whose SMILES sat in the fourth column
 * needs to see that the fourth column is the one that was read, and a header
 * that turned out not to be one is spotted here rather than three panels
 * later.
 * @param layout - How the list turned out to be written.
 * @returns One sentence, or nothing when there is nothing worth saying.
 */
export function describeLayout(layout: ListLayout): string | null {
  if (layout.kind === 'sdf') {
    return 'Read as an SDF — the name and every other field of a record are kept.';
  }
  if (layout.kind === 'lines') return null;

  const columns = layout.columns ?? [];
  const separator = SEPARATORS[layout.delimiter ?? ''] ?? 'unknown';
  const parts = [
    `Read as a ${separator}-separated table${layout.header ? ' with a header' : ''}`,
    `structures from ${nameOf(columns, layout.structureColumn)}`,
  ];
  if (layout.labelColumn !== undefined) {
    parts.push(`names from ${nameOf(columns, layout.labelColumn)}`);
  }

  const kept = columns.length - (layout.labelColumn === undefined ? 1 : 2);
  if (kept > 0) {
    parts.push(`${kept} other column${kept === 1 ? '' : 's'} kept as fields`);
  }
  return `${parts.join(', ')}.`;
}

/**
 * How a column is referred to: by the name its header gave it, or by where it
 * is when the file carried no header.
 * @param columns - What every column is called.
 * @param column - Which one.
 * @returns The name, quoted, or its position.
 */
function nameOf(columns: string[], column: number | undefined): string {
  if (column === undefined) return 'nowhere';
  const name = columns[column];
  return name && !name.startsWith('Column ')
    ? `“${name}”`
    : `column ${column + 1}`;
}
