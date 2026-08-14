import { Molecule } from 'openchemlib';
import { create } from 'sdf-creator';
import { expect, test } from 'vitest';

import { readStructure } from '../parse.ts';
import { looksLikeSdf } from '../readSdf.ts';
import { parseList, splitList } from '../splitList.ts';

test('reads one structure per line', () => {
  expect(splitList('CCO\nc1ccccc1')).toStrictEqual([
    { structure: 'CCO', line: 1 },
    { structure: 'c1ccccc1', line: 2 },
  ]);
});

test('takes whatever follows a space as the name', () => {
  expect(splitList('CCO ethanol')).toStrictEqual([
    { structure: 'CCO', label: 'ethanol', line: 1 },
  ]);
});

test('a name may hold spaces of its own', () => {
  expect(splitList('OC(=O)c1ccccc1 benzoic acid')).toStrictEqual([
    { structure: 'OC(=O)c1ccccc1', label: 'benzoic acid', line: 1 },
  ]);
});

test.each([
  ['CCO\tethanol', 'ethanol'],
  ['CCO;ethanol', 'ethanol'],
  ['CCO,ethanol', 'ethanol'],
  ['CCO, ethanol', 'ethanol'],
  ['CCO|ethanol', 'ethanol'],
])('splits %s on its separator', (line, label) => {
  expect(splitList(line)[0]?.label).toBe(label);
});

test('keeps the original line number through blanks and comments', () => {
  const text = '# a heading\n\nCCO ethanol\n\n   \nc1ccccc1 benzene\n';
  expect(splitList(text)).toStrictEqual([
    { structure: 'CCO', label: 'ethanol', line: 3 },
    { structure: 'c1ccccc1', label: 'benzene', line: 6 },
  ]);
});

test('a structure with no name carries no label at all', () => {
  const [entry] = splitList('CCO');
  expect(entry).toStrictEqual({ structure: 'CCO', line: 1 });
  expect('label' in (entry ?? {})).toBe(false);
});

test('handles Windows line endings', () => {
  expect(splitList('CCO ethanol\r\nc1ccccc1 benzene')).toHaveLength(2);
});

test('an empty list is empty', () => {
  expect(splitList('')).toStrictEqual([]);
  expect(splitList('\n\n  \n')).toStrictEqual([]);
});

test('an SDF is read as a list, one entry per record', () => {
  const sdf = create([
    { molfile: Molecule.fromSmiles('CCO').toMolfile(), Name: 'ethanol' },
    { molfile: Molecule.fromSmiles('c1ccccc1').toMolfile(), Name: 'benzene' },
  ]).sdf;

  expect(looksLikeSdf(sdf)).toBe(true);
  const entries = splitList(sdf);
  expect(entries).toHaveLength(2);
  expect(entries[0]?.label).toBe('ethanol');
  expect(entries[1]?.label).toBe('benzene');
  expect(entries[0]?.structure).toContain('V2000');
  expect(
    readStructure(entries[1]?.structure ?? '').molecule.getAllAtoms(),
  ).toBe(6);
});

test('an SDF record with no name field carries no label', () => {
  const sdf = create([
    { molfile: Molecule.fromSmiles('CCO').toMolfile(), CLogP: '-0.14' },
  ]).sdf;
  expect(splitList(sdf)[0]?.label).toBeUndefined();
});

test('a list of SMILES is not mistaken for an SDF', () => {
  expect(looksLikeSdf('CCO ethanol\nc1ccccc1 benzene')).toBe(false);
});

test('a blank-separated file is read a line at a time, whatever it holds', () => {
  const { entries, layout } = parseList(
    'CCO ethanol\nOC(=O)c1ccccc1 benzoic acid',
  );
  expect(layout).toStrictEqual({ kind: 'lines' });
  expect(entries[1]?.label).toBe('benzoic acid');
});

test('a CSV with a header names its columns and keeps the rest as fields', () => {
  const { entries, layout } = parseList(
    'ID,Name,SMILES,CAS\n1,ethanol,CCO,64-17-5\n2,benzene,c1ccccc1,71-43-2',
  );

  expect(layout).toStrictEqual({
    kind: 'table',
    delimiter: ',',
    columns: ['ID', 'Name', 'SMILES', 'CAS'],
    structureColumn: 2,
    labelColumn: 1,
    header: true,
  });
  expect(entries).toStrictEqual([
    {
      structure: 'CCO',
      label: 'ethanol',
      line: 2,
      fields: { ID: '1', CAS: '64-17-5' },
    },
    {
      structure: 'c1ccccc1',
      label: 'benzene',
      line: 3,
      fields: { ID: '2', CAS: '71-43-2' },
    },
  ]);
});

test('the column is found by reading it, not by trusting the header', () => {
  const { layout } = parseList('first,second\nethanol,CCO\nbenzene,c1ccccc1');
  expect(layout.structureColumn).toBe(1);
  expect(layout.labelColumn).toBe(0);
});

test('a formula column is not a structure column: it does not parse', () => {
  const { entries, layout } = parseList(
    'Name,Formula,SMILES\nethanol,C2H6O,CCO\nbenzene,C6H6,c1ccccc1',
  );
  expect(layout.structureColumn).toBe(2);
  expect(entries[0]?.fields).toStrictEqual({ Formula: 'C2H6O' });
});

test('a header saying SMILES breaks a real tie between parsing columns', () => {
  // Both `Reagent` and `SMILES` hold readable structures, so reading alone
  // cannot choose — this is the case the header rule exists for.
  const { entries, layout } = parseList(
    'Name,Reagent,SMILES\nethanol,CC,CCO\nbenzene,CC,c1ccccc1',
  );
  expect(layout.header).toBe(true);
  expect(layout.structureColumn).toBe(2);
  expect(entries[0]?.structure).toBe('CCO');
  expect(entries[0]?.fields).toStrictEqual({ Reagent: 'CC' });
});

test('with no header to consult, the leftmost parsing column wins the tie', () => {
  // The control for the test above: same columns, no header row, so the rule
  // has nothing to read and falls back to position. Delete the header
  // tie-break and the previous test collapses onto this one.
  const { entries, layout } = parseList('ethanol,CC,CCO\nbenzene,CC,c1ccccc1');
  expect(layout.header).toBe(false);
  expect(layout.structureColumn).toBe(1);
  expect(entries[0]?.structure).toBe('CC');
});

test('a name is taken from Name rather than from ID', () => {
  const { entries } = parseList('ID\tName\tSMILES\nA1\tethanol\tCCO');
  expect(entries[0]?.label).toBe('ethanol');
  expect(entries[0]?.fields).toStrictEqual({ ID: 'A1' });
});

test('a table with no header calls its columns by their position', () => {
  const { entries, layout } = parseList(
    'CCO,ethanol,46.07\nc1ccccc1,benzene,78.11',
  );
  expect(layout.header).toBe(false);
  expect(layout.columns).toStrictEqual(['Column 1', 'Column 2', 'Column 3']);
  expect(entries[0]).toStrictEqual({
    structure: 'CCO',
    label: 'ethanol',
    line: 1,
    fields: { 'Column 3': '46.07' },
  });
});

test('a quoted name holding the separator stays one name', () => {
  const { entries } = parseList('smiles,name\nCCO,"ethanol, absolute"');
  expect(entries[0]?.label).toBe('ethanol, absolute');
});

test('a quoted field spanning two lines still numbers the rows by line', () => {
  const { entries } = parseList(
    'smiles,name\nCCO,"ethanol\nabsolute"\nc1ccccc1,benzene',
  );
  expect(entries[0]?.line).toBe(2);
  expect(entries[1]).toStrictEqual({
    structure: 'c1ccccc1',
    label: 'benzene',
    line: 4,
  });
});

test('a header the file does not carry is not invented', () => {
  const { layout } = parseList('CCO,ethanol\nc1ccccc1,benzene');
  expect(layout.header).toBe(false);
  expect(splitList('CCO,ethanol')[0]?.line).toBe(1);
});

test('an SDF keeps every field of a record beside the name', () => {
  const sdf = create([
    {
      molfile: Molecule.fromSmiles('CCO').toMolfile(),
      Name: 'ethanol',
      CLogP: '-0.14',
      CAS: '64-17-5',
    },
  ]).sdf;

  expect(splitList(sdf)[0]?.fields).toStrictEqual({
    CLogP: '-0.14',
    CAS: '64-17-5',
  });
});

test('a one-column list drops an unreadable first line as its header', () => {
  // `SMILES` over a column of structures is a header, and the only thing that
  // tells it from a structure is that it does not read as one.
  expect(
    splitList('SMILES\nCCO\nCCC').map((entry) => entry.structure),
  ).toStrictEqual(['CCO', 'CCC']);
  expect(
    splitList('SMILES\nCCO\nCCC').map((entry) => entry.line),
  ).toStrictEqual([2, 3]);
});

test('a one-column list keeps a readable first line', () => {
  const entries = splitList('CCO\nCCC\nCCCC');
  expect(entries.map((entry) => entry.structure)).toStrictEqual([
    'CCO',
    'CCC',
    'CCCC',
  ]);
  expect(entries.map((entry) => entry.line)).toStrictEqual([1, 2, 3]);
});
