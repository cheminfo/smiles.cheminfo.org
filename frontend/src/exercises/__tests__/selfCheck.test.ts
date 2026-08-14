import { Molecule } from 'openchemlib';
import { expect, test } from 'vitest';

import { selfCheck } from '../selfCheck.ts';
import type { Exercise } from '../types.ts';

const WRITE: Exercise = {
  id: 'w-test',
  kind: 'write',
  title: 'Acetic acid',
  smiles: 'CC(=O)O',
};

const DRAW: Exercise = {
  id: 'd-test',
  kind: 'draw',
  title: 'Acetic acid',
  smiles: 'CC(=O)O',
};

test('a SMARTS question has nothing of this kind to say', () => {
  const exercise: Exercise = {
    id: 's-test',
    kind: 'smarts',
    title: 'Any acid',
    cases: [{ smiles: 'CC(=O)O', shouldMatch: true }],
  };
  expect(selfCheck(exercise, '[CX3](=O)[OX2H1]')).toBeNull();
});

test('an empty box is blank', () => {
  expect(selfCheck(WRITE, ' '.repeat(3))).toStrictEqual({ state: 'blank' });
});

test('an empty canvas is blank, not a structure of no atoms', () => {
  const empty = new Molecule(0, 0).getIDCode();
  expect(selfCheck(DRAW, empty)).toStrictEqual({ state: 'blank' });
});

test('a SMILES that does not parse says where and why', () => {
  const check = selfCheck(WRITE, 'CC(=O)O1');
  expect(check).toStrictEqual({
    state: 'unreadable',
    error: { message: 'Dangling ring closure: 1', position: 8 },
    hint: 'A ring was opened and never closed. Every ring-closure digit appears twice, once at each end of the bond that shuts the ring: cyclohexane is C1CCCCC1.',
  });
});

test('an isomer adds up, because adding up is not being right', () => {
  // Methyl formate against acetic acid: the same atoms, a different molecule.
  expect(selfCheck(WRITE, 'COC=O')).toStrictEqual({
    state: 'read',
    formula: 'C2H4O2',
    difference: null,
  });
});

test('the answer itself adds up', () => {
  expect(selfCheck(WRITE, 'OC(C)=O')).toStrictEqual({
    state: 'read',
    formula: 'C2H4O2',
    difference: null,
  });
});

test('a structure short of an oxygen says which atoms are missing', () => {
  expect(selfCheck(WRITE, 'CC=O')).toStrictEqual({
    state: 'read',
    formula: 'C2H4O',
    difference: {
      given: 'C2H4O',
      missing: [{ element: 'O', count: 1 }],
      extra: [],
    },
  });
});

test('an excess is named as an excess', () => {
  expect(selfCheck(WRITE, 'CCC(=O)O')).toStrictEqual({
    state: 'read',
    formula: 'C3H6O2',
    difference: {
      given: 'C3H6O2',
      missing: [],
      extra: [
        { element: 'C', count: 1 },
        { element: 'H', count: 2 },
      ],
    },
  });
});

test('a drawing is read as an idCode', () => {
  const drawn = Molecule.fromSmiles('CC(=O)O').getIDCode();
  expect(selfCheck(DRAW, drawn)).toStrictEqual({
    state: 'read',
    formula: 'C2H4O2',
    difference: null,
  });
});

test('a drawing missing an atom is counted the same way', () => {
  const drawn = Molecule.fromSmiles('CC=O').getIDCode();
  expect(selfCheck(DRAW, drawn)).toStrictEqual({
    state: 'read',
    formula: 'C2H4O',
    difference: {
      given: 'C2H4O',
      missing: [{ element: 'O', count: 1 }],
      extra: [],
    },
  });
});

test('explicit hydrogens are counted on the atom they hang from', () => {
  expect(selfCheck(WRITE, '[H]C([H])([H])C(=O)O[H]')).toStrictEqual({
    state: 'read',
    formula: 'C2H4O2',
    difference: null,
  });
});

test('a question whose own answer cannot be read says nothing', () => {
  const broken: Exercise = {
    id: 'w-broken',
    kind: 'write',
    title: 'Broken',
    smiles: 'C1CC',
  };
  expect(selfCheck(broken, 'CCO')).toBeNull();
});
