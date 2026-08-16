import { expect, test } from 'vitest';

import type { ListRow } from '../../../chemistry/structureList.ts';
import { filterRows, searchableRows } from '../filterRows.ts';

const rows: ListRow[] = [
  {
    line: 2,
    input: 'CCO',
    label: 'ethanol',
    mf: 'C2H6O',
    fields: { CAS: '64-17-5', Batch: 'B3' },
  },
  {
    line: 3,
    input: 'c1ccccc1',
    label: 'benzene',
    mf: 'C6H6',
    fields: { CAS: '71-43-2', Batch: 'B4' },
  },
  { line: 4, input: 'QQQ', error: 'This SMILES cannot be read.' },
];

test('the rows are searched as their text, the molecule left out', () => {
  expect(searchableRows(rows)[0]).toStrictEqual({
    line: 2,
    input: 'CCO',
    name: 'ethanol',
    mf: 'C2H6O',
    CAS: '64-17-5',
    Batch: 'B3',
  });
});

test('a word matches a name or any field', () => {
  expect(filterRows(rows, 'ethanol')).toStrictEqual(new Set([0]));
  expect(filterRows(rows, '71-43')).toStrictEqual(new Set([1]));
});

test('a column can be named to search it alone', () => {
  expect(filterRows(rows, 'Batch:B3')).toStrictEqual(new Set([0]));
  expect(filterRows(rows, 'CAS:64')).toStrictEqual(new Set([0]));
});

test('a line that could not be read is searched by its error', () => {
  expect(filterRows(rows, 'cannot')).toStrictEqual(new Set([2]));
});

test('an empty box keeps every row', () => {
  expect(filterRows(rows, ' '.repeat(3))).toBeNull();
});
