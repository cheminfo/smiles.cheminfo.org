import { Molecule, SSSearcher } from 'openchemlib';

import { constitution, identity } from '../chemistry/describe.ts';
import { readStructure } from '../chemistry/parse.ts';

import { differenceHint, stereoReason, unreadable } from './diagnose.ts';
import type { CaseResult, Exercise, SmartsCase, Verdict } from './types.ts';

/**
 * Mark an answer.
 *
 * A structure question is never marked on the string. Two people write one
 * molecule two ways far more often than they write it the same way, so both
 * sides go through {@link identity} and it is the molecules that are compared.
 * @param exercise - The question.
 * @param answer - What the student wrote or drew. For a `draw` question this is
 * the editor value, coordinates included.
 * @returns Whether it is right, and what to say when it is not.
 */
export function validate(exercise: Exercise, answer: string): Verdict {
  const input = answer.trim();
  if (!input) return { passed: false, reason: 'Nothing to mark yet.' };

  return exercise.kind === 'smarts'
    ? validateSmarts(exercise.cases, input)
    : validateStructure(exercise.smiles, input, exercise.kind);
}

/**
 * The level of an exercise, read off the question rather than written down.
 *
 * A hand-written level could only disagree with the question it labels, and a
 * set a teacher assembled themselves would be coloured by nothing at all —
 * so size decides, here and for every set alike.
 * @param exercise - The question.
 * @returns Its level.
 */
export function levelOf(
  exercise: Exercise,
): 'beginner' | 'intermediate' | 'advanced' {
  if (exercise.kind === 'smarts') return 'advanced';
  const atoms = countAtoms(exercise.smiles);
  if (atoms <= 8) return 'beginner';
  if (atoms <= 12) return 'intermediate';
  return 'advanced';
}

/**
 * How hard a question is, on the same scale the level is read off.
 *
 * A pattern spells out no structure of its own, so there is no size to measure:
 * every query weighs more than every structure, and the ones on that side keep
 * the order they were written in.
 * @param exercise - The question.
 * @returns Its weight, small first.
 */
export function difficultyOf(exercise: Exercise): number {
  return exercise.kind === 'smarts'
    ? Number.MAX_SAFE_INTEGER
    : countAtoms(exercise.smiles);
}

/**
 * A set of questions, easiest first.
 *
 * Like the level, the order is read off the molecules rather than written down,
 * so a set a teacher assembles from their own structures walks from small to
 * large exactly like the ones this site ships. Questions of equal weight keep
 * the order they came in, and each one is measured once rather than once per
 * comparison — reading a structure means parsing it.
 * @param exercises - The questions, in any order.
 * @returns The same questions, ordered.
 */
export function sortByDifficulty(exercises: readonly Exercise[]): Exercise[] {
  const weights = new Map<Exercise, number>();
  for (const exercise of exercises) {
    weights.set(exercise, difficultyOf(exercise));
  }
  return exercises.toSorted(
    (one, other) => (weights.get(one) ?? 0) - (weights.get(other) ?? 0),
  );
}

/**
 * How many heavy atoms a structure holds, which is what says how hard it is to
 * write out.
 * @param smiles - The structure.
 * @returns The atom count, 0 when it cannot be read.
 */
export function countAtoms(smiles: string): number {
  try {
    return Molecule.fromSmiles(smiles).getAllAtoms();
  } catch {
    return 0;
  }
}

function validateStructure(
  target: string,
  answer: string,
  kind: 'write' | 'draw',
): Verdict {
  let expected: Molecule;
  try {
    expected = readStructure(target, 'smiles').molecule;
  } catch {
    return {
      passed: false,
      reason: 'This exercise is broken: its own answer cannot be read.',
    };
  }

  let given: Molecule;
  try {
    // A drawing arrives as an idCode; typed text is a line notation. Reading
    // the drawing as anything else would make an honest answer unparseable.
    given = readStructure(
      answer,
      kind === 'draw' ? 'idcode' : 'smiles',
    ).molecule;
  } catch (error) {
    return unreadable(error);
  }

  if (identity(given) === identity(expected)) {
    return { passed: true, reason: '' };
  }
  if (constitution(given) === constitution(expected)) {
    return {
      passed: false,
      stereoOnly: true,
      reason: stereoReason(given, expected, kind),
    };
  }
  return {
    passed: false,
    reason:
      kind === 'draw'
        ? 'That is a different molecule from the one the SMILES describes.'
        : 'That SMILES reads as a different molecule.',
    ...differenceHint(given, expected),
  };
}

function validateSmarts(cases: SmartsCase[], answer: string): Verdict {
  let query: Molecule;
  try {
    query = readStructure(answer, 'smarts').molecule;
  } catch (error) {
    return { ...unreadable(error), cases: [] };
  }
  if (query.getAllAtoms() === 0) {
    return { passed: false, reason: 'That pattern has no atoms.', cases: [] };
  }

  const fragment = query.getCompactCopy();
  fragment.setFragment(true);
  const searcher = new SSSearcher();
  searcher.setFragment(fragment);

  const results: CaseResult[] = [];
  for (const testCase of cases) {
    results.push(runCase(searcher, testCase));
  }

  const failed = results.filter((result) => !result.passed).length;
  if (failed === 0) return { passed: true, reason: '', cases: results };
  return {
    passed: false,
    reason:
      failed === 1
        ? 'One molecule still comes out on the wrong side.'
        : `${failed} molecules still come out on the wrong side.`,
    cases: results,
  };
}

function runCase(searcher: SSSearcher, testCase: SmartsCase): CaseResult {
  let molecule: Molecule;
  try {
    molecule = Molecule.fromSmiles(testCase.smiles);
  } catch {
    return {
      case: testCase,
      passed: false,
      reason: 'This exercise is broken: one of its molecules cannot be read.',
    };
  }

  searcher.setMolecule(molecule);
  const matched = searcher.isFragmentInMolecule();
  if (matched === testCase.shouldMatch) {
    return {
      case: testCase,
      passed: true,
      reason: matched ? 'matched, as it should' : 'left out, as it should',
    };
  }
  return {
    case: testCase,
    passed: false,
    reason: matched
      ? 'matched, but this one should be left out'
      : 'not matched, but this one should be found',
  };
}
