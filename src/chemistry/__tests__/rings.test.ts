import { expect, test } from 'vitest';

import { readStructure } from '../parse.ts';
import { annotateRings } from '../rings.ts';

/**
 * The label openchemlib was given for each atom, without the `]` that puts it
 * above the atom, so a test reads the way the drawing does.
 * @param molecule - An annotated structure.
 * @returns One entry per atom, empty for an atom in no ring.
 */
function labels(molecule: ReturnType<typeof annotateRings>['molecule']) {
  const found: string[] = [];
  for (let atom = 0; atom < molecule.getAllAtoms(); atom++) {
    found.push(molecule.getAtomCustomLabel(atom)?.slice(1) ?? '');
  }
  return found;
}

test('an atom shared by two rings names both of them', () => {
  const annotation = annotateRings(readStructure('C(CC1)CC2C1CCCC2').molecule);

  expect(annotation.ringCount).toBe(2);
  expect(labels(annotation.molecule)).toStrictEqual([
    '1',
    '1',
    '1',
    '1',
    '12',
    '12',
    '2',
    '2',
    '2',
    '2',
  ]);
  expect(annotation.ringBonds).toStrictEqual([
    0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10,
  ]);
});

test('a chain carries no number and no painted bond', () => {
  const annotation = annotateRings(readStructure('CCO').molecule);

  expect(annotation.ringCount).toBe(0);
  expect(labels(annotation.molecule)).toStrictEqual(['', '', '']);
  expect(annotation.ringBonds).toStrictEqual([]);
});

test('only the ring bonds of aspirin are painted', () => {
  const annotation = annotateRings(
    readStructure('CC(=O)Oc1ccccc1C(=O)O').molecule,
  );

  expect(annotation.ringCount).toBe(1);
  expect(labels(annotation.molecule)).toStrictEqual([
    '',
    '',
    '',
    '',
    '1',
    '1',
    '1',
    '1',
    '1',
    '1',
    '',
    '',
    '',
  ]);
  expect(annotation.ringBonds).toStrictEqual([4, 5, 6, 7, 8, 9]);
});

test('the structure that was handed in is left unlabelled', () => {
  const molecule = readStructure('c1ccccc1').molecule;
  annotateRings(molecule);

  expect(molecule.getAtomCustomLabel(0)).toBeNull();
});

test('past nine rings the numbers are told apart by a comma', () => {
  const annotation = annotateRings(
    readStructure(
      'c1ccc2cc3cc4cc5cc6cc7cc8cc9cc%10cccccc%10cc9cc8cc7cc6cc5cc4cc3cc2c1',
    ).molecule,
  );

  expect(annotation.ringCount).toBe(10);
  expect(new Set(labels(annotation.molecule))).toStrictEqual(
    new Set([
      '1',
      '1,2',
      '1,3',
      '2',
      '3',
      '3,4',
      '4',
      '4,5',
      '5',
      '5,6',
      '6',
      '6,7',
      '7',
      '7,8',
      '8',
      '8,9',
      '9',
      '9,10',
      '10',
    ]),
  );
});

test('a query is described like a molecule', () => {
  const annotation = annotateRings(
    readStructure('c1ccccc1[CX3]', 'smarts').molecule,
  );

  expect(annotation.ringCount).toBe(1);
  expect(annotation.ringBonds).toStrictEqual([0, 1, 2, 3, 4, 5]);
});

test('a macrocycle is numbered, not merely painted', () => {
  // openchemlib's ring set stops at seven atoms, so cyclododecane used to come
  // back with twelve painted bonds and no number on any of them.
  const annotation = annotateRings(readStructure('C1CCCCCCCCCCC1').molecule);

  expect(annotation.ringCount).toBe(1);
  expect(annotation.ringBonds).toHaveLength(12);
  expect(labels(annotation.molecule)).toStrictEqual(
    Array.from({ length: 12 }, () => '1'),
  );
});

test('a small ring and a macrocycle are two rings, numbered apart', () => {
  const annotation = annotateRings(
    readStructure('c1ccccc1.C1CCCCCCCCCCC1').molecule,
  );

  expect(annotation.ringCount).toBe(2);
  const found = labels(annotation.molecule);
  expect(found.filter((one) => one === '1')).toHaveLength(6);
  expect(found.filter((one) => one === '2')).toHaveLength(12);
});

test.each([
  ['C1CCCCCC1', 1, 7],
  ['C1CCCCCCC1', 1, 8],
  ['c1ccc2ccccc2c1', 2, 11],
])('%s has %i ring(s) over %i ring bonds', (smiles, rings, bonds) => {
  const annotation = annotateRings(readStructure(smiles).molecule);
  expect(annotation.ringCount).toBe(rings);
  expect(annotation.ringBonds).toHaveLength(bonds);
});

test('every atom of a painted ring bond carries a ring number', () => {
  // The two halves have to agree: a bond painted as a ring bond with no ring
  // to belong to is exactly what the macrocycle bug looked like.
  for (const smiles of [
    'c1ccccc1',
    'C1CCCCCCCCCCC1',
    'c1ccc2ccccc2c1',
    'Cn1cnc2c1c(=O)n(C)c(=O)n2C',
    'C1CC2CC1C=C2',
  ]) {
    const annotation = annotateRings(readStructure(smiles).molecule);
    const found = labels(annotation.molecule);
    if (annotation.ringBonds.length > 0) {
      expect(annotation.ringCount, smiles).toBeGreaterThan(0);
    }
    for (const bond of annotation.ringBonds) {
      for (const end of [0, 1] as const) {
        const atom = annotation.molecule.getBondAtom(end, bond);
        expect(found[atom], `${smiles} atom ${atom}`).not.toBe('');
      }
    }
  }
});

test('an acyclic molecule has no rings and nothing painted', () => {
  const annotation = annotateRings(readStructure('CCO').molecule);

  expect(annotation.ringCount).toBe(0);
  expect(annotation.ringBonds).toStrictEqual([]);
  expect(labels(annotation.molecule)).toStrictEqual(['', '', '']);
});
