import { expect, test } from 'vitest';

import { describeReaction, encodeReaction } from '../describeReaction.ts';
import { parseStructure } from '../parse.ts';
import {
  looksLikeReaction,
  looksLikeRxnFile,
  reactionComponents,
  readReaction,
} from '../parseReaction.ts';

const ESTERIFICATION = 'CC(=O)O.OCC>[H+]>CC(=O)OCC.O';

test('a reaction SMILES is read, arrows and all', () => {
  const read = readReaction(ESTERIFICATION);
  expect(read.format).toBe('smiles');

  const described = describeReaction(read);
  expect(described.reactants).toBe(1);
  expect(described.catalysts).toBe(1);
  expect(described.products).toBe(1);
  expect(described.smiles).toBe('CCO.CC(O)=O>[H+]>CCOC(C)=O.O');
  expect(described.isMapped).toBe(false);
  expect(described.isQuery).toBe(false);
  expect(described.readAs).toBe('smiles');
});

test('two spellings of one reaction come back as the same SMILES', () => {
  const one = describeReaction(readReaction('CC(=O)Cl.OCC>>CC(=O)OCC.Cl'));
  const other = describeReaction(readReaction('CCO.ClC(C)=O>>Cl.CCOC(C)=O'));
  expect(other.smiles).toBe(one.smiles);
});

test('every component of both sides is its own molecule', () => {
  const components = reactionComponents(readReaction(ESTERIFICATION).reaction);
  expect(components.map((component) => component.role)).toStrictEqual([
    'reactant',
    'reactant',
    'catalyst',
    'product',
    'product',
  ]);
  expect(
    components.map((component) => component.molecule.toIsomericSmiles()),
  ).toStrictEqual(['CC(O)=O', 'CCO', '[H+]', 'CCOC(C)=O', 'O']);
});

test('atom classes survive the round trip, and are reported', () => {
  const mapped =
    '[CH3:1][C:2](=[O:3])[OH:4].[OH:5][CH2:6][CH3:7]>>[CH3:1][C:2](=[O:3])[O:5][CH2:6][CH3:7].[OH2:4]';
  const described = describeReaction(readReaction(mapped));
  expect(described.isMapped).toBe(true);
  expect(described.smiles).toContain('[C:2]');
});

test('a reaction idCode is read back into the reaction it was written from', () => {
  const idCode = describeReaction(readReaction(ESTERIFICATION)).idCode;
  const read = readReaction(idCode);
  expect(read.format).toBe('idcode');
  // The catalyst is what the default encoding drops, so it is what proves the
  // mode was given.
  expect(describeReaction(read).smiles).toBe('CCO.CC(O)=O>[H+]>CCOC(C)=O.O');
});

test('an MDL reaction file is read as one', () => {
  const rxn = describeReaction(readReaction('CCO.CC(O)=O>>CCOC(C)=O.O')).rxn;
  expect(looksLikeRxnFile(rxn)).toBe(true);

  const read = readReaction(rxn);
  expect(read.format).toBe('rxn');
  expect(describeReaction(read).smiles).toBe('CCO.CC(O)=O>>CCOC(C)=O.O');
});

test('a reaction SMARTS keeps its query features', () => {
  const read = readReaction('[CX3](=O)[OX2H1]>>[CX3](=O)[OX2][CH3]');
  const described = describeReaction(read);
  expect(described.isQuery).toBe(true);

  const [reactant] = reactionComponents(read.reaction);
  expect(reactant?.molecule.isFragment()).toBe(true);
  // A component of a reaction keeps exactly what the same pattern keeps when
  // it is read on its own — openchemlib rewrites the X counts as the hydrogen
  // count it stores, and does it identically on both paths.
  expect(reactant?.molecule.toSmarts()).toBe(
    parseStructure('[CX3](=O)[OX2H1]', 'smarts').toSmarts(),
  );
});

test('what is and is not written with an arrow', () => {
  expect(looksLikeReaction('CC(=O)Cl.OCC>>CC(=O)OCC.Cl')).toBe(true);
  expect(looksLikeReaction('C=C.[H][H]>[Pd]>CC')).toBe(true);
  expect(looksLikeReaction('CC(=O)Oc1ccccc1C(=O)O')).toBe(false);
  expect(looksLikeReaction('[CX3](=O)[OX2H1]')).toBe(false);
});

test('a molecule read as a reaction says what is missing', () => {
  expect(() => readReaction('CCO')).toThrow('no arrow');
  expect(() => readReaction(' \t')).toThrow('nothing to read');
});

test('a reaction with nothing in it is refused', () => {
  expect(() => readReaction('>>')).toThrow('holds no atoms');
});

test('the idCode of a reaction is the encoding that keeps everything', () => {
  const { reaction } = readReaction(ESTERIFICATION);
  expect(encodeReaction(reaction)).toContain('!');
});
