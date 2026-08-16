import type { ListHit } from '../../chemistry/moleculesDatabase.ts';
import type { ListRow } from '../../chemistry/structureList.ts';

/** A row of the list as the table shows it. */
export interface ShownRow {
  row: ListRow;
  /** Atoms a query landed on, when one did. */
  matched?: number[];
}

/**
 * What the table shows, and what every download holds: the whole list, or the
 * rows a query kept, in the order the search ranked them.
 *
 * A search narrows the same table a conversion filled — so what is exported
 * after a query is the hits, which is what "search a set and take the matches
 * away" has to mean. A keyword filter narrows it again, and the two compose:
 * the structures a query found, among the rows whose fields match what was
 * typed.
 * @param rows - Every line of the list, read.
 * @param hits - What the query kept, or null when no query has run.
 * @param kept - The row numbers a keyword filter kept, or null when none ran.
 * @returns The rows to render, in order.
 */
export function shownRows(
  rows: readonly ListRow[],
  hits: readonly ListHit[] | null,
  kept: ReadonlySet<number> | null = null,
): ShownRow[] {
  if (hits === null) {
    const shown: ShownRow[] = [];
    for (let index = 0; index < rows.length; index++) {
      const row = rows[index];
      if (!row || (kept && !kept.has(index))) continue;
      shown.push({ row });
    }
    return shown;
  }

  const shown: ShownRow[] = [];
  for (const hit of hits) {
    const row = rows[hit.row];
    if (!row || (kept && !kept.has(hit.row))) continue;
    shown.push(
      hit.matched === undefined ? { row } : { row, matched: hit.matched },
    );
  }
  return shown;
}
