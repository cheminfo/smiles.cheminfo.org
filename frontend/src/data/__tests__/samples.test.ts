import { expect, test } from 'vitest';

import { readStructure } from '../../../../chemistry/parse.ts';
import { parseList } from '../../../../chemistry/splitList.ts';
import { LIST_SAMPLES } from '../samples/index.ts';
import { INVENTORY_SAMPLE } from '../samples/inventory.ts';
import { LIBRARY_SAMPLE } from '../samples/library.ts';
import { SDF_SAMPLE } from '../samples/sdf.ts';

/**
 * How many atoms a sample's structure reads as, zero when it does not read.
 * @param structure - One entry's structure, in whatever the sample wrote.
 * @returns The atom count.
 */
function atomsOf(structure: string): number {
  try {
    return readStructure(structure, 'auto').molecule.getAllAtoms();
  } catch {
    return 0;
  }
}

test('every sample reads, and every structure in it parses', () => {
  expect(LIST_SAMPLES).toHaveLength(4);
  for (const sample of LIST_SAMPLES) {
    const { entries } = parseList(sample.text);
    expect(entries.length).toBeGreaterThan(0);
    for (const entry of entries) {
      // The name is in the assertion so a failure says which line of which
      // sample stopped reading, rather than only that a count was zero.
      const where = `${sample.name} line ${entry.line}`;
      const atoms = atomsOf(entry.structure);
      expect(`${where}: ${atoms} atoms`).not.toBe(`${where}: 0 atoms`);
    }
  }
});

test('the long sample is a hundred lines of structure and name', () => {
  const { entries, layout } = parseList(LIBRARY_SAMPLE);
  expect(layout).toStrictEqual({ kind: 'lines' });
  expect(entries).toHaveLength(100);
  expect(entries[0]).toStrictEqual({
    structure: 'CCO',
    label: 'ethanol',
    line: 1,
  });
  // The name is one name however many blanks it holds.
  expect(entries[3]?.label).toBe('ethylene glycol');
  expect(entries.at(-1)).toStrictEqual({
    structure: 'O',
    label: 'water',
    line: 100,
  });
});

test('the spreadsheet sample is read as a header, a column and six fields', () => {
  const { entries, layout } = parseList(INVENTORY_SAMPLE);
  expect(layout).toStrictEqual({
    kind: 'table',
    delimiter: ',',
    columns: ['ID', 'Name', 'SMILES', 'CAS', 'Batch', 'Supplier', 'Purity (%)'],
    structureColumn: 2,
    labelColumn: 1,
    header: true,
  });
  expect(entries).toHaveLength(10);
  expect(entries[0]).toStrictEqual({
    structure: 'CC(=O)Oc1ccccc1C(=O)O',
    label: 'Aspirin',
    line: 2,
    fields: {
      ID: 'CHM-001',
      CAS: '50-78-2',
      Batch: 'B-1042',
      Supplier: 'Acme Fine Chemicals',
      'Purity (%)': '99.4',
    },
  });
  // A quoted cell holding the delimiter stays one name.
  expect(entries[5]?.label).toBe('Nicotine, (S)-');
});

test('the SDF sample keeps its name as the label and its fields beside it', () => {
  const { entries, layout } = parseList(SDF_SAMPLE);
  expect(layout).toStrictEqual({ kind: 'sdf' });
  expect(entries).toHaveLength(4);
  expect(entries[0]?.label).toBe('Aspirin');
  expect(entries[0]?.fields).toStrictEqual({
    CAS: '50-78-2',
    Batch: 'B-1042',
    Supplier: 'Acme Fine Chemicals',
    'Purity (%)': '99.4',
  });
  expect(entries[0]?.structure).toContain('V2000');
  expect(entries.map((entry) => entry.label)).toStrictEqual([
    'Aspirin',
    'Caffeine',
    'Paracetamol',
    'Nicotine',
  ]);
});
