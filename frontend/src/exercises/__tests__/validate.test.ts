import { Molecule } from 'openchemlib';
import { expect, test } from 'vitest';

import type { Exercise } from '../types.ts';
import {
  countAtoms,
  levelOf,
  sortByDifficulty,
  validate,
} from '../validate.ts';

const WRITE: Exercise = {
  id: 'test-write',
  kind: 'write',
  title: 'Acetic acid',
  smiles: 'CC(=O)O',
};

const DRAW: Exercise = {
  id: 'test-draw',
  kind: 'draw',
  title: 'Ethanol',
  smiles: 'CCO',
};

const SMARTS: Exercise = {
  id: 'test-smarts',
  kind: 'smarts',
  title: 'Find the acids',
  cases: [
    { smiles: 'CC(=O)O', shouldMatch: true, label: 'acetic acid' },
    { smiles: 'CC(=O)OC', shouldMatch: false, label: 'methyl acetate' },
  ],
};

/** What the canvas hands over: an idCode and where the atoms sit. */
function drawn(smiles: string): string {
  const { idCode, coordinates } =
    Molecule.fromSmiles(smiles).getIDCodeAndCoordinates();
  return `${idCode} ${coordinates}`;
}

test('a correct SMILES is accepted', () => {
  expect(validate(WRITE, 'CC(=O)O')).toStrictEqual({
    passed: true,
    reason: '',
  });
});

test('any correct SMILES of the same molecule is accepted', () => {
  for (const answer of ['CC(=O)O', 'OC(C)=O', 'O=C(O)C', 'C(C)(=O)O']) {
    expect(validate(WRITE, answer).passed).toBe(true);
  }
});

test('a different molecule is refused, with a reason a student can act on', () => {
  const verdict = validate(WRITE, 'CCO');
  expect(verdict.passed).toBe(false);
  expect(verdict.reason).toBe('That SMILES reads as a different molecule.');
});

test('the wrong stereoisomer is refused as a near miss, not as another molecule', () => {
  const alanine: Exercise = {
    ...WRITE,
    id: 'l-alanine',
    smiles: 'C[C@H](N)C(=O)O',
  };
  const verdict = validate(alanine, 'C[C@@H](N)C(=O)O');
  expect(verdict.passed).toBe(false);
  expect(verdict.stereoOnly).toBe(true);
  expect(verdict.reason).toBe(
    'Every atom and bond is right — this is the same molecule with a different configuration.',
  );
});

test('an answer that declares no configuration is told which one is missing', () => {
  const alanine: Exercise = {
    ...WRITE,
    id: 'l-alanine',
    smiles: 'C[C@H](N)C(=O)O',
  };
  expect(validate(alanine, 'CC(N)C(=O)O')).toStrictEqual({
    passed: false,
    stereoOnly: true,
    reason: String.raw`Every atom and bond is right — but the configuration is missing. Write it with @ or @@ at the atom, or / and \ around the double bond.`,
  });

  const butene: Exercise = { ...WRITE, id: 'e-butene', smiles: 'C/C=C/C' };
  expect(validate(butene, 'CC=CC').stereoOnly).toBe(true);
});

test('a drawing tells the student to wedge the bond, not to type an @', () => {
  const alanine: Exercise = {
    ...DRAW,
    id: 'l-alanine',
    smiles: 'C[C@H](N)C(=O)O',
  };
  expect(validate(alanine, drawn('CC(N)C(=O)O')).reason).toBe(
    'Every atom and bond is right — but the configuration is missing. Mark it with a wedged or hashed bond.',
  );
  expect(validate(alanine, drawn('C[C@@H](N)C(=O)O')).stereoOnly).toBe(true);
});

test('a configuration nobody asked for is named as the extra it is', () => {
  const alanine: Exercise = { ...WRITE, id: 'alanine', smiles: 'CC(N)C(=O)O' };
  expect(validate(alanine, 'C[C@H](N)C(=O)O')).toStrictEqual({
    passed: false,
    stereoOnly: true,
    reason:
      'Every atom and bond is right — but this one is asked for without any stereochemistry, and yours declares one.',
  });
});

test('a different molecule is still a different molecule, not a stereo near miss', () => {
  const alanine: Exercise = {
    ...WRITE,
    id: 'l-alanine',
    smiles: 'C[C@H](N)C(=O)O',
  };
  const verdict = validate(alanine, 'C[C@H](O)C(=O)O');
  expect(verdict.passed).toBe(false);
  expect(verdict.stereoOnly).toBeUndefined();
  expect(verdict.reason).toBe('That SMILES reads as a different molecule.');
});

test('an unparseable answer reports what stopped the parser, where, and the rule', () => {
  const verdict = validate(WRITE, 'C1CC');
  expect(verdict.reason).toBe('Dangling ring closure: 1');
  expect(verdict.error).toStrictEqual({
    message: 'Dangling ring closure: 1',
    position: 4,
  });
  expect(verdict.hint).toBe(
    'A ring was opened and never closed. Every ring-closure digit appears twice, once at each end of the bond that shuts the ring: cyclohexane is C1CCCCC1.',
  );
});

test('an unparseable pattern is diagnosed like an unparseable structure', () => {
  const verdict = validate(SMARTS, '[CX3');
  expect(verdict.cases).toStrictEqual([]);
  expect(verdict.hint).toBe(
    'A bracket atom was never closed, or holds something it cannot. Everything about one atom goes inside its own [ ]: [C@@H], [O-], [15n].',
  );
});

test('a different molecule is told which atoms do not add up', () => {
  const verdict = validate(WRITE, 'CCO');
  expect(verdict.formula).toStrictEqual({
    given: 'C2H6O',
    missing: [{ element: 'O', count: 1 }],
    extra: [{ element: 'H', count: 2 }],
  });
  expect(verdict.hint).toBe(
    'The atoms themselves do not add up yet — count them on the structure you were given before looking at how they are joined.',
  );
});

test('a tautomer is named as one rather than left as a different molecule', () => {
  const acetone: Exercise = { ...WRITE, id: 'acetone', smiles: 'CC(=O)C' };
  const verdict = validate(acetone, 'CC(O)=C');
  expect(verdict.passed).toBe(false);
  expect(verdict.formula).toBeUndefined();
  expect(verdict.hint).toBe(
    'Every atom is there and the formula matches: what you have is another tautomer of it. A hydrogen and a double bond have swapped places — put them back where the question shows them.',
  );
});

test('an isomer that is no tautomer is sent back to the connectivity', () => {
  const ethanol: Exercise = { ...WRITE, id: 'ethanol', smiles: 'CCO' };
  expect(validate(ethanol, 'COC').hint).toBe(
    'The formula matches, so every atom is there: it is the way they are joined that differs. Follow the question one atom at a time and check what each one is bonded to.',
  );
});

test('a wrong drawing is diagnosed on its formula too', () => {
  const verdict = validate(DRAW, drawn('CCC'));
  expect(verdict.formula).toStrictEqual({
    given: 'C3H8',
    missing: [{ element: 'O', count: 1 }],
    extra: [
      { element: 'C', count: 1 },
      { element: 'H', count: 2 },
    ],
  });
});

test('an empty answer is not marked at all', () => {
  expect(validate(WRITE, ' '.repeat(3))).toStrictEqual({
    passed: false,
    reason: 'Nothing to mark yet.',
  });
});

test('a drawing is read as an idCode, not as a SMILES', () => {
  expect(validate(DRAW, drawn('CCO')).passed).toBe(true);
  expect(validate(DRAW, drawn('CCC')).passed).toBe(false);
  expect(validate(DRAW, drawn('CCC')).reason).toBe(
    'That is a different molecule from the one the SMILES describes.',
  );
});

test('a drawing is graded on the molecule, whatever the layout', () => {
  const one = Molecule.fromSmiles('CCO');
  const other = Molecule.fromSmiles('OCC');
  expect(validate(DRAW, one.getIDCodeAndCoordinates().idCode).passed).toBe(
    true,
  );
  expect(validate(DRAW, other.getIDCodeAndCoordinates().idCode).passed).toBe(
    true,
  );
});

test('a SMARTS is marked by running it, and every case is reported', () => {
  const verdict = validate(SMARTS, '[CX3](=O)[OX2H1]');
  expect(verdict.passed).toBe(true);
  expect(verdict.cases).toHaveLength(2);
  expect(verdict.cases?.[0]).toStrictEqual({
    case: SMARTS.cases[0],
    passed: true,
    reason: 'matched, as it should',
  });
  expect(verdict.cases?.[1]?.reason).toBe('left out, as it should');
});

test('a SMARTS that over-matches is refused, and says which case broke', () => {
  const verdict = validate(SMARTS, 'C(=O)O');
  expect(verdict.passed).toBe(false);
  expect(verdict.reason).toBe(
    'One molecule still comes out on the wrong side.',
  );
  expect(verdict.cases?.[1]).toMatchObject({
    passed: false,
    reason: 'matched, but this one should be left out',
  });
});

test('a SMARTS with no atoms is refused', () => {
  expect(validate(SMARTS, '()').cases).toStrictEqual([]);
});

test.each([
  ['CCO', 3],
  ['c1ccccc1', 6],
  ['CC(=O)Oc1ccccc1C(=O)O', 13],
  ['not a structure at all', 0],
])('countAtoms(%s) is %i', (smiles, expected) => {
  expect(countAtoms(smiles)).toBe(expected);
});

test('a set is ordered by the size of its molecules, smallest first', () => {
  const aspirin = { ...WRITE, id: 'aspirin', smiles: 'CC(=O)Oc1ccccc1C(=O)O' };
  const benzene = { ...WRITE, id: 'benzene', smiles: 'c1ccccc1' };
  const ethanol = { ...DRAW, id: 'ethanol', smiles: 'CCO' };

  expect(
    sortByDifficulty([aspirin, SMARTS, benzene, ethanol]).map((one) => one.id),
  ).toStrictEqual(['ethanol', 'benzene', 'aspirin', 'test-smarts']);
});

test('questions of equal weight keep the order they came in', () => {
  const first = { ...WRITE, id: 'first', smiles: 'CCO' };
  const second = { ...WRITE, id: 'second', smiles: 'CCN' };
  const other = { ...SMARTS, id: 'other' };

  expect(
    sortByDifficulty([second, other, first, SMARTS]).map((one) => one.id),
  ).toStrictEqual(['second', 'first', 'other', 'test-smarts']);
});

test('sorting leaves the list it was given alone', () => {
  const exercises = [SMARTS, DRAW];
  sortByDifficulty(exercises);
  expect(exercises).toStrictEqual([SMARTS, DRAW]);
});

test('the level is read off the molecule, never written down', () => {
  expect(levelOf({ ...WRITE, smiles: 'CCO' })).toBe('beginner');
  expect(levelOf({ ...WRITE, smiles: 'CC(=O)Oc1ccccc1' })).toBe('intermediate');
  expect(levelOf({ ...WRITE, smiles: 'CC(=O)Oc1ccccc1C(=O)O' })).toBe(
    'advanced',
  );
  expect(levelOf(SMARTS)).toBe('advanced');
});
