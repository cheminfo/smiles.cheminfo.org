import { expect, test } from 'vitest';

import { shownRows } from '../../pages/lists/shownRows.ts';
import { searchDatabase } from '../moleculesDatabase.ts';
import { readList } from '../structureList.ts';

const LIST = `CCO ethanol
c1ccccc1 benzene
QQQ nonsense
CC(=O)O acetic acid
OC(=O)c1ccccc1 benzoic acid`;

test('a list is read into rows and an index in one pass', async () => {
  const { rows, read, database } = await readList(LIST);

  expect(rows).toHaveLength(5);
  expect(read).toBe(4);
  expect(database.nbMolecules).toBe(4);

  expect(rows[0]?.label).toBe('ethanol');
  expect(rows[0]?.mf).toBe('C2H6O');
  expect(rows[0]?.molecule?.toIsomericSmiles()).toBe('CCO');

  expect(rows[2]?.molecule).toBeUndefined();
  expect(rows[2]?.line).toBe(3);
  expect(rows[2]?.error).toBe('Unknown element label found.');
});

test('a query has no formula, because openchemlib gives a fragment none', async () => {
  const { rows } = await readList('[CX3](=O)[OX2H1] a carboxylic acid');

  expect(rows[0]?.molecule?.isFragment()).toBe(true);
  expect(rows[0]?.mf).toBeUndefined();
  expect(rows[0]?.mw).toBeUndefined();
});

test('a hit names the row it is, and the atoms the query landed on', async () => {
  const { rows, database } = await readList(LIST);
  const hits = await searchDatabase(database, '[CX3](=O)[OX2H1]', {
    mode: 'substructure',
    limit: 100,
  });

  expect(hits.map((hit) => hit.row)).toStrictEqual([3, 4]);
  expect(hits[0]?.matched).toHaveLength(3);

  const shown = shownRows(rows, hits);
  expect(shown.map((entry) => entry.row.label)).toStrictEqual([
    'acetic acid',
    'benzoic acid',
  ]);
});

test('two identical structures are one entry and two rows', async () => {
  const { rows, database } = await readList('CCO first\nCCO second');

  expect(database.nbMolecules).toBe(1);

  const hits = await searchDatabase(database, 'CCO', {
    mode: 'exact',
    limit: 100,
  });
  expect(shownRows(rows, hits).map((entry) => entry.row.label)).toStrictEqual([
    'first',
    'second',
  ]);
});

test('the whole list is shown until a query has run', async () => {
  const { rows } = await readList(LIST);

  expect(shownRows(rows, null)).toHaveLength(5);
});
