import { Molecule } from 'openchemlib';
import { expect, test } from 'vitest';

import { structureErrorMessage } from '../errorMessage.ts';
import { formulaDifference, isSameTautomer, parseHint } from '../hints.ts';

/**
 * The advice is keyed on what openchemlib actually says, so the hints are asked
 * for the way the page asks for them: with a real failure of a real parser.
 * @param smiles - A SMILES that does not parse.
 * @returns The hint the page would show for it.
 */
function hintFor(smiles: string): string | undefined {
  try {
    Molecule.fromSmiles(smiles);
  } catch (error) {
    return parseHint(structureErrorMessage(error));
  }
  throw new Error(`${smiles} parses, so there is no hint to give`);
}

test('an unclosed ring is explained as an unclosed ring', () => {
  expect(hintFor('C1CCCCC')).toBe(
    'A ring was opened and never closed. Every ring-closure digit appears twice, once at each end of the bond that shuts the ring: cyclohexane is C1CCCCC1.',
  );
});

test('a bond with nothing after it is explained', () => {
  expect(hintFor('CC=')).toBe(
    'A bond symbol has nothing after it. =, # and - sit between two atoms: CC=O, never CC=.',
  );
});

test('an element nobody knows is explained as a symbol', () => {
  expect(hintFor('CXC')).toBe(
    'That is not an element symbol. A two-letter symbol is a capital then a lower case (Cl, Br, Si), and a lone lower-case letter means an aromatic atom (c, n, o, s). Anything else — X, R, Q — has to go in brackets.',
  );
});

test('unbalanced branches and brackets are told apart', () => {
  expect(hintFor('CC)C')).toBe(
    'There is a ) with no ( to match it. Every branch opens and closes: CC(=O)O has one branch, =O.',
  );
  expect(hintFor('CC]')).toBe(
    'There is a ] with no [ to match it. Brackets only wrap one atom: [NH4+].',
  );
  expect(hintFor('C[CH3')).toBe(
    'A bracket atom was never closed, or holds something it cannot. Everything about one atom goes inside its own [ ]: [C@@H], [O-], [15n].',
  );
});

test('a message nothing is known about is left to stand on its own', () => {
  expect(parseHint('Something nobody has seen before')).toBeUndefined();
});

test('two structures of the same formula have no difference to report', () => {
  const difference = formulaDifference(
    Molecule.fromSmiles('CCO'),
    Molecule.fromSmiles('COC'),
  );
  expect(difference).toBeNull();
});

test('what is missing and what is in excess are reported apart', () => {
  // Ethanol answered where acetic acid was asked for: an oxygen short, and two
  // hydrogens too many for the ones the second oxygen took.
  const difference = formulaDifference(
    Molecule.fromSmiles('CCO'),
    Molecule.fromSmiles('CC(=O)O'),
  );
  expect(difference).toStrictEqual({
    given: 'C2H6O',
    missing: [{ element: 'O', count: 1 }],
    extra: [{ element: 'H', count: 2 }],
  });
});

test('a carbon too many is reported as a carbon too many', () => {
  const difference = formulaDifference(
    Molecule.fromSmiles('CCCO'),
    Molecule.fromSmiles('CCO'),
  );
  expect(difference).toStrictEqual({
    given: 'C3H8O',
    missing: [],
    extra: [
      { element: 'C', count: 1 },
      { element: 'H', count: 2 },
    ],
  });
});

test('the formula is written in Hill order, hydrogens as the structure implies them', () => {
  const difference = formulaDifference(
    // Explicit hydrogens are counted on the atom they hang from, not twice.
    Molecule.fromSmiles('[H]C([H])([H])[H]'),
    Molecule.fromSmiles('C[C@H](N)C(=O)O'),
  );
  expect(difference?.given).toBe('CH4');
  expect(difference?.missing).toStrictEqual([
    { element: 'C', count: 2 },
    { element: 'H', count: 3 },
    { element: 'N', count: 1 },
    { element: 'O', count: 2 },
  ]);
  expect(difference?.extra).toStrictEqual([]);
});

test('the enol and the ketone are recognised as one tautomer', () => {
  expect(
    isSameTautomer(
      Molecule.fromSmiles('CC(=O)C'),
      Molecule.fromSmiles('CC(O)=C'),
    ),
  ).toBe(true);
  expect(
    isSameTautomer(
      Molecule.fromSmiles('O=C1NC=CC=C1'),
      Molecule.fromSmiles('Oc1ncccc1'),
    ),
  ).toBe(true);
});

test('two isomers that are not tautomers are not called one', () => {
  expect(
    isSameTautomer(Molecule.fromSmiles('CCO'), Molecule.fromSmiles('COC')),
  ).toBe(false);
});
