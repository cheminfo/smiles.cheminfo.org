import { expect, test } from 'vitest';

import { parseList } from '../../../../../chemistry/splitList.ts';
import { describeLayout } from '../describeLayout.ts';

test('a blank-separated list needs no explaining', () => {
  expect(describeLayout(parseList('CCO ethanol').layout)).toBeNull();
});

test('says which column of a CSV was read and which named it', () => {
  const { layout } = parseList('ID,Name,SMILES,CAS\n1,ethanol,CCO,64-17-5');
  expect(describeLayout(layout)).toBe(
    'Read as a comma-separated table with a header, structures from “SMILES”, names from “Name”, 2 other columns kept as fields.',
  );
});

test('a table with no header is described by position', () => {
  const { layout } = parseList('CCO;ethanol\nc1ccccc1;benzene');
  expect(describeLayout(layout)).toBe(
    'Read as a semicolon-separated table, structures from column 1, names from column 2.',
  );
});

test('an SDF says its fields are kept', () => {
  expect(describeLayout({ kind: 'sdf' })).toBe(
    'Read as an SDF — the name and every other field of a record are kept.',
  );
});
