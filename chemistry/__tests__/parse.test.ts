import { expect, test } from 'vitest';

import { looksLikeMolfile, looksLikeSmarts, readStructure } from '../parse.ts';

test('reads a SMILES', () => {
  const { molecule, format } = readStructure('CCO');
  expect(format).toBe('smiles');
  expect(molecule.getAllAtoms()).toBe(3);
  expect(molecule.isFragment()).toBe(false);
});

test('reads an aromatic SMILES', () => {
  const { molecule } = readStructure('c1ccccc1');
  expect(molecule.getMolecularFormula().formula).toBe('C6H6');
});

test('a SMARTS is recognised without being asked', () => {
  const { molecule, format } = readStructure('[CX3](=O)[OX2H1]');
  expect(format).toBe('smarts');
  expect(molecule.isFragment()).toBe(true);
});

test('SMARTS detection keeps the query features openchemlib supports', () => {
  // Read as a plain SMILES, `[OX2H1]` loses its H count and the query stops
  // meaning "carboxylic acid" — which is the whole reason the mode is chosen
  // here rather than left to openchemlib's own guess.
  expect(readStructure('[CX3](=O)[OX2H1]').molecule.toSmarts()).toBe(
    '[O;H1]C=O',
  );
});

test.each([
  ['[#6;R1]', true],
  ['C~C', true],
  ['C[!C]', true],
  ['[$(C=O)]', true],
  ['[r3]', true],
  ['CCO', false],
  ['c1ccccc1', false],
  ['C#N', false],
  ['[13CH4]', false],
  ['[NH4+]', false],
  ['[Xe]', false],
  ['[Rn]', false],
  ['CC(=O)Oc1ccccc1C(=O)O', false],
  // The wildcards, inside a bracket and out, singly and in a row.
  ['[*]', true],
  ['a', true],
  ['A', true],
  // A wildcard has to stand alone out here: widen this and the header `CAS`
  // becomes the three-atom SMARTS C,A,S and a spreadsheet loses its header.
  ['CAS', false],
  ['aaa', false],
  // Two-letter element symbols the primitives must not be mistaken for: the
  // digit lookahead is what keeps `[Dy]`, `[V]` and `[Hf]` elements.
  ['[Dy]', false],
  ['[V]', false],
  ['[Hf]', false],
  ['[nH]', false],
  ['[Na+]', false],
  // Every bracketed element holding a lowercase `a`: unanchored, the wildcard
  // test matched the `a` of `Na` and read sodium acetate as a query.
  ['[Ca+2]', false],
  ['[Ba]', false],
  ['[La]', false],
  ['[Ta]', false],
  ['CC(=O)[O-].[Na+]', false],
  // …while a real wildcard in a bracket, isotope and charge and all, still is.
  ['[a+]', true],
  ['[13a]', true],
])('looksLikeSmarts(%s) is %s', (input, expected) => {
  expect(looksLikeSmarts(input)).toBe(expected);
});

test('an idCode is read once the line notation has failed', () => {
  const { molecule, format } = readStructure(String.raw`gOq@@drm\@@@@`);
  expect(format).toBe('idcode');
  expect(molecule.getMolecularFormula().formula).toBe('C6H6O');
});

test('a molfile is recognised by its counts line', () => {
  const molfile = readStructure('CCO').molecule.toMolfile();
  expect(looksLikeMolfile(molfile)).toBe(true);
  expect(readStructure(molfile).format).toBe('molfile');
});

test('a molfile keeps its blank title line', () => {
  // openchemlib writes an empty title line, and the title is line 1: trimming
  // it away shifts every line up and the counts line is read as an atom, which
  // silently yields an empty molecule rather than an error.
  const molfile = readStructure('CCO').molecule.toMolfile();
  expect(molfile.startsWith('\n')).toBe(true);
  expect(readStructure(molfile).molecule.getAllAtoms()).toBe(3);
  expect(readStructure(molfile, 'molfile').molecule.getAllAtoms()).toBe(3);
});

test('a one-line string is never mistaken for a molfile', () => {
  expect(looksLikeMolfile('CCO')).toBe(false);
});

test('an explicit format is obeyed', () => {
  // `[OH]` is legal in both notations; asked for a SMILES, it is a molecule.
  expect(readStructure('c1ccccc1[OH]', 'smiles').molecule.isFragment()).toBe(
    false,
  );
  expect(readStructure('c1ccccc1[OH]', 'smarts').molecule.isFragment()).toBe(
    true,
  );
});

test('an empty string is refused', () => {
  expect(() => readStructure(' '.repeat(3))).toThrow(
    'There is nothing to read',
  );
});

test('a broken SMILES is refused', () => {
  expect(() => readStructure('C1CC')).toThrow(/dangling ring closure/i);
});

test('a typo is reported, never decoded into a phantom molecule', () => {
  // The idCode decoder reads packed bits and does not check them, so `ZZZ`
  // used to come back as thirty-seven disconnected carbons rather than as the
  // mistyped SMILES it is.
  for (const typo of ['ZZZ', 'XYZ', 'QQQ']) {
    expect(() => readStructure(typo), typo).toThrow(/unknown element label/i);
  }
});

test('a real idCode still reads, with or without its coordinates', () => {
  const molecule = readStructure('CCO').molecule;
  const { idCode, coordinates } = molecule.getIDCodeAndCoordinates();

  expect(readStructure(idCode).molecule.getIDCode()).toBe(idCode);
  expect(readStructure(`${idCode} ${coordinates}`).format).toBe('idcode');
  expect(readStructure(idCode, 'idcode').molecule.getAllAtoms()).toBe(3);
});
