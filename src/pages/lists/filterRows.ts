import { filter } from 'smart-array-filter';

import type { ListRow } from '../../chemistry/structureList.ts';

/** One row as text, which is what a keyword is matched against. */
export type SearchableRow = Record<string, string | number>;

/**
 * The rows as plain text, so they can be searched by what the file said about
 * them.
 *
 * The molecule itself is left out on purpose: `smart-array-filter` walks
 * whatever it is handed, and an openchemlib `Molecule` is a large object of
 * typed arrays that says nothing a chemist would type into a filter box. Each
 * field becomes a top-level key so `CAS:64-17` searches the CAS column alone.
 * @param rows - Every line of the list, read.
 * @returns One flat object per row, in the same order.
 */
export function searchableRows(rows: readonly ListRow[]): SearchableRow[] {
  const searchable = new Array<SearchableRow>(rows.length);
  for (let index = 0; index < rows.length; index++) {
    const row = rows[index];
    searchable[index] = {
      line: row?.line ?? index + 1,
      input: row?.input ?? '',
      ...(row?.label === undefined ? {} : { name: row.label }),
      ...(row?.mf === undefined ? {} : { mf: row.mf }),
      ...(row?.error === undefined ? {} : { error: row.error }),
      ...row?.fields,
    };
  }
  return searchable;
}

/**
 * The text of a list, built once and kept only as long as the list is. A list
 * nobody filters never pays for it — at a hundred thousand rows that is a
 * hundred thousand objects — and one that is filtered pays once, not per
 * keystroke.
 */
const searchableCache = new WeakMap<readonly ListRow[], SearchableRow[]>();

/**
 * Which rows a keyword search keeps.
 *
 * The structures are searched by drawing a query; this is the other half —
 * finding the batch a chemist labelled `Batch:B3` among half a million rows,
 * which no substructure can express. `smart-array-filter` is what the rest of
 * our tables use, so `CAS:64-17` and `"benzoic acid"` mean here what they mean
 * everywhere else.
 * @param rows - Every line of the list, read.
 * @param keywords - What was typed in the filter box.
 * @returns The row numbers kept, or null when nothing was typed.
 */
export function filterRows(
  rows: readonly ListRow[],
  keywords: string,
): Set<number> | null {
  if (!keywords.trim()) return null;
  let searchable = searchableCache.get(rows);
  if (!searchable) {
    searchable = searchableRows(rows);
    searchableCache.set(rows, searchable);
  }
  return new Set(filter(searchable, { keywords, index: true }));
}
