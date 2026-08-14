import { Molecule } from 'openchemlib';
import { expect, test } from 'vitest';

import { describeMolecule, identity, writeMolecule } from '../describe.ts';
import { readStructure } from '../parse.ts';

test('describes aspirin every way at once', () => {
  const structure = describeMolecule(
    readStructure('CC(=O)Oc1ccccc1C(=O)O', 'smiles'),
  );

  expect(structure.smiles).toBe('CC(Oc1ccccc1C(O)=O)=O');
  expect(structure.kekule).toBe('CC(OC1=CC=CC=C1C(O)=O)=O');
  expect(structure.mf).toBe('C9H8O4');
  expect(structure.mw).toBeCloseTo(180.159, 2);
  expect(structure.monoisotopicMass).toBeCloseTo(180.042, 2);
  expect(structure.atoms).toBe(13);
  expect(structure.bonds).toBe(13);
  expect(structure.isQuery).toBe(false);
  expect(structure.readAs).toBe('smiles');
  expect(structure.idCode).toBe('dklB@@QmR[fUxUZBBF@@');
});

test('the Kekulé form and the aromatic form are one molecule', () => {
  expect(identity(Molecule.fromSmiles('c1ccccc1'))).toBe(
    identity(Molecule.fromSmiles('C1=CC=CC=C1')),
  );
});

test('a query says it is one', () => {
  const structure = describeMolecule(readStructure('[CX3](=O)[OX2H1]'));
  expect(structure.isQuery).toBe(true);
  expect(structure.readAs).toBe('smarts');
});

test.each([
  ['smiles', 'CCO'],
  ['kekule', 'CCO'],
  ['smarts', 'CCO'],
  ['idcode', 'eMHAIh@'],
])('writes ethanol as %s', (format, expected) => {
  const molecule = Molecule.fromSmiles('CCO');
  expect(
    writeMolecule(molecule, format as Parameters<typeof writeMolecule>[1]),
  ).toBe(expected);
});

test('writes a molfile and a V3000 molfile', () => {
  const molecule = Molecule.fromSmiles('CCO');
  expect(writeMolecule(molecule, 'molfile')).toContain('V2000');
  expect(writeMolecule(molecule, 'molfileV3')).toContain('V3000');
});

test('identity ignores how a SMILES was written', () => {
  const forms = [
    'CC(=O)Oc1ccccc1C(=O)O',
    'O=C(C)Oc1ccccc1C(=O)O',
    'OC(=O)c1ccccc1OC(C)=O',
  ];
  const [first, ...rest] = forms.map((smiles) =>
    identity(Molecule.fromSmiles(smiles)),
  );
  for (const other of rest) expect(other).toBe(first);
});

test('identity reconciles the two ways a nitro group is drawn', () => {
  // The pentavalent form and the charged form are two idCodes and one
  // molecule; a student who drew either must be marked right.
  const pentavalent = Molecule.fromIDCode('dazL@HALR[UVj`@');
  const charged = Molecule.fromSmiles('CCCCO[N+](=O)[O-]');
  expect(pentavalent.getIDCode()).not.toBe(charged.getIDCode());
  expect(identity(pentavalent)).toBe(identity(charged));
});

test('identity separates enantiomers', () => {
  expect(identity(Molecule.fromSmiles('C[C@H](N)C(=O)O'))).not.toBe(
    identity(Molecule.fromSmiles('C[C@@H](N)C(=O)O')),
  );
});

test('identity falls back to the idCode for a query', () => {
  const query = readStructure('[CX3](=O)[OX2H1]').molecule;
  expect(identity(query)).toBe(query.getIDCode());
});
