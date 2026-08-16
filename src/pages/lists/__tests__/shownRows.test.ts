import { expect, test } from 'vitest';

import type { ListHit } from '../../../chemistry/moleculesDatabase.ts';
import { readList } from '../../../chemistry/structureList.ts';
import { exportList } from '../exportList.ts';
import { filterRows } from '../filterRows.ts';
import { shownRows } from '../shownRows.ts';

const LIST = `Name,SMILES,CAS
ethanol,CCO,64-17-5
benzene,c1ccccc1,71-43-2
toluene,Cc1ccccc1,108-88-3`;

async function rowsOf(text: string) {
  const { rows } = await readList(text);
  return rows;
}

test('with no query and no filter, every row is shown in order', async () => {
  const rows = await rowsOf(LIST);
  const shown = shownRows(rows, null);

  expect(shown.map((one) => one.row.label)).toStrictEqual([
    'ethanol',
    'benzene',
    'toluene',
  ]);
});

test('a query narrows the table to its hits, in the order it ranked them', async () => {
  const rows = await rowsOf(LIST);
  // Ranked deliberately out of list order, which is what a similarity search
  // hands back.
  const hits: ListHit[] = [{ row: 2, matched: [0, 1] }, { row: 1 }];

  const shown = shownRows(rows, hits);
  expect(shown.map((one) => one.row.label)).toStrictEqual([
    'toluene',
    'benzene',
  ]);
  expect(shown[0]?.matched).toStrictEqual([0, 1]);
  expect(shown[1]?.matched).toBeUndefined();
});

test('a keyword filter narrows the whole list when no query has run', async () => {
  const rows = await rowsOf(LIST);
  const kept = filterRows(rows, 'benzene');

  const shown = shownRows(rows, null, kept);
  expect(shown.map((one) => one.row.label)).toStrictEqual(['benzene']);
});

test('a query and a filter compose, and the download holds exactly that', async () => {
  const rows = await rowsOf(LIST);
  // The query finds both aromatics; the filter keeps one of the two.
  const hits: ListHit[] = [{ row: 1 }, { row: 2 }];
  const kept = filterRows(rows, 'toluene');

  const shown = shownRows(rows, hits, kept);
  expect(shown.map((one) => one.row.label)).toStrictEqual(['toluene']);

  // This is the claim the architecture contract makes: what is on screen is
  // what comes out.
  expect(exportList(shown, 'text').content).toBe('Cc1ccccc1 toluene\n');
});

test('a hit whose row the filter dropped is left out', async () => {
  const rows = await rowsOf(LIST);
  const hits: ListHit[] = [{ row: 0 }, { row: 1 }];
  const kept = filterRows(rows, 'nothing matches this');

  expect(shownRows(rows, hits, kept)).toStrictEqual([]);
});

test('a hit pointing past the end of the list is skipped rather than fatal', async () => {
  const rows = await rowsOf(LIST);
  const shown = shownRows(rows, [{ row: 0 }, { row: 99 }]);

  expect(shown).toHaveLength(1);
  expect(shown[0]?.row.label).toBe('ethanol');
});
