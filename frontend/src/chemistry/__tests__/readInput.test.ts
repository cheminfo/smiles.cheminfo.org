import { expect, test } from 'vitest';

import { readInput } from '../readInput.ts';
import { readReactionInput } from '../readReactionInput.ts';

test('an empty box is neither right nor wrong', () => {
  // The third answer is what lets a page tell "nothing typed yet" from "typed
  // something wrong", and only shout about the second.
  expect(readInput('')).toStrictEqual({ ok: null });
  expect(readInput(' '.repeat(3))).toStrictEqual({ ok: null });
  expect(readInput('\n\t ')).toStrictEqual({ ok: null });
});

test('a SMILES comes back described every way at once', () => {
  const read = readInput('CC(=O)Oc1ccccc1C(=O)O');

  expect(read.ok).toBe(true);
  if (read.ok !== true) return;
  expect(read.structure.mf).toBe('C9H8O4');
  expect(read.structure.smiles).toBe('CC(Oc1ccccc1C(O)=O)=O');
  expect(read.structure.readAs).toBe('smiles');
  expect(read.structure.isQuery).toBe(false);
  expect(read.molecule.getAllAtoms()).toBe(13);
});

test('a SMARTS is read as the query it is', () => {
  const read = readInput('[CX3](=O)[OX2H1]');

  expect(read.ok).toBe(true);
  if (read.ok !== true) return;
  expect(read.structure.isQuery).toBe(true);
  expect(read.structure.readAs).toBe('smarts');
  expect(read.molecule.isFragment()).toBe(true);
});

test('an explicit format is obeyed rather than guessed at', () => {
  const asSmiles = readInput('c1ccccc1[OH]', 'smiles');
  const asSmarts = readInput('c1ccccc1[OH]', 'smarts');

  expect(asSmiles.ok === true && asSmiles.structure.isQuery).toBe(false);
  expect(asSmarts.ok === true && asSmarts.structure.isQuery).toBe(true);
});

test('a structure that will not read carries the position it stopped at', () => {
  const read = readInput('C1CC');

  expect(read.ok).toBe(false);
  if (read.ok !== false) return;
  expect(read.error).toStrictEqual({
    message: 'Dangling ring closure: 1',
    position: 4,
  });
});

test('an empty box holds no reaction either', () => {
  expect(readReactionInput('')).toStrictEqual({ ok: null });
  expect(readReactionInput('  ')).toStrictEqual({ ok: null });
});

test('a reaction is described once, with every component ready to draw', () => {
  const read = readReactionInput('CC(=O)O.OCC>[H+]>CC(=O)OCC.O');

  expect(read.ok).toBe(true);
  if (read.ok !== true) return;
  expect(read.structure.smiles).toBe('CCO.CC(O)=O>[H+]>CCOC(C)=O.O');
  expect(read.structure.readAs).toBe('smiles');
  expect(read.components.map((component) => component.role)).toStrictEqual([
    'reactant',
    'reactant',
    'catalyst',
    'product',
    'product',
  ]);
  expect(read.components[0]?.structure.mf).toBe('C2H4O2');
});

test('two components that are the same molecule are told apart by where they sit', () => {
  // A reagent used on both sides is one structure and two components; keying
  // the drawings on the molecule would collapse them into one.
  const read = readReactionInput('O.CCO>>O.CC');

  expect(read.ok).toBe(true);
  if (read.ok !== true) return;
  const ids = read.components.map((component) => component.id);
  expect(ids).toStrictEqual([
    'reactant-0',
    'reactant-1',
    'product-2',
    'product-3',
  ]);
  expect(new Set(ids).size).toBe(ids.length);
});

test('a molecule where a reaction was asked for says what is missing', () => {
  const read = readReactionInput('CCO');

  expect(read.ok).toBe(false);
  if (read.ok !== false) return;
  expect(read.error.message).toContain('no arrow');
});
