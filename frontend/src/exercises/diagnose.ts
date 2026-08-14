import type { Molecule } from 'openchemlib';

import { constitution, identity } from '../../../chemistry/describe.ts';
import { structureError } from '../../../chemistry/errorMessage.ts';
import {
  formulaDifference,
  isSameTautomer,
  parseHint,
} from '../../../chemistry/hints.ts';

import type { Verdict } from './types.ts';

/**
 * A structure that could not be read at all, with the position kept so the page
 * can point at the character, and the rule that was broken spelled out.
 * @param error - Whatever the parser threw.
 * @returns The verdict.
 */
export function unreadable(error: unknown): Verdict {
  const parsed = structureError(error);
  const hint = parseHint(parsed.message);
  return {
    passed: false,
    reason: parsed.message,
    error: parsed,
    ...(hint ? { hint } : {}),
  };
}

/**
 * What separates two structures that are not the same molecule, said in the
 * order a chemist would look for it: the atoms first, then how they are joined.
 *
 * The formula difference is the useful half — "an oxygen short" is a thing to go
 * and find, where two formulas side by side are a puzzle of their own. When the
 * formulas already agree the two are isomers, and the one worth naming is the
 * tautomer: a student who moved a hydrogen and a double bond has drawn a real
 * molecule and needs to move them back, not to start again.
 * @param given - The student's structure.
 * @param expected - The question's own answer.
 * @returns The parts of the verdict that say how they differ.
 */
export function differenceHint(
  given: Molecule,
  expected: Molecule,
): Pick<Verdict, 'formula' | 'hint'> {
  const formula = formulaDifference(given, expected);
  if (formula) {
    return {
      formula,
      hint: 'The atoms themselves do not add up yet — count them on the structure you were given before looking at how they are joined.',
    };
  }
  if (isSameTautomer(given, expected)) {
    return {
      hint: 'Every atom is there and the formula matches: what you have is another tautomer of it. A hydrogen and a double bond have swapped places — put them back where the question shows them.',
    };
  }
  return {
    hint: 'The formula matches, so every atom is there: it is the way they are joined that differs. Follow the question one atom at a time and check what each one is bonded to.',
  };
}

/**
 * What to say when the two structures differ in nothing but their
 * stereochemistry.
 *
 * A student who has every atom and every bond right has done the hard part, and
 * "a different molecule" would send them back to redraw all of it. Which of the
 * three things went wrong is read off the structures rather than guessed: an
 * answer whose stereochemistry can be stripped without changing it declares
 * none, and the same test on the question says whether one was even asked for.
 * @param given - The student's structure.
 * @param expected - The question's own answer.
 * @param kind - How the answer was given, which is what says how to fix it.
 * @returns The reason, written the way a tutor would say it.
 */
export function stereoReason(
  given: Molecule,
  expected: Molecule,
  kind: 'write' | 'draw',
): string {
  const declared = identity(given) !== constitution(given);
  const asked = identity(expected) !== constitution(expected);

  if (!declared && asked) {
    return kind === 'draw'
      ? 'Every atom and bond is right — but the configuration is missing. Mark it with a wedged or hashed bond.'
      : String.raw`Every atom and bond is right — but the configuration is missing. Write it with @ or @@ at the atom, or / and \ around the double bond.`;
  }
  if (declared && !asked) {
    return 'Every atom and bond is right — but this one is asked for without any stereochemistry, and yours declares one.';
  }
  return 'Every atom and bond is right — this is the same molecule with a different configuration.';
}
