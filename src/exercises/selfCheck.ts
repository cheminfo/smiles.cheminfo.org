import { structureError } from '../chemistry/errorMessage.ts';
import type { FormulaDifference } from '../chemistry/hints.ts';
import { formulaDifference, formulaOf, parseHint } from '../chemistry/hints.ts';
import { readStructure } from '../chemistry/parse.ts';
import type { StructureError } from '../chemistry/types.ts';

import type { Exercise } from './types.ts';

/** Nothing has been written or drawn yet, so there is nothing to look at. */
interface BlankCheck {
  state: 'blank';
}

/** The draft does not parse, so nothing else about it can be said. */
interface UnreadableCheck {
  state: 'unreadable';
  /** What the parser said, and where it stopped. */
  error: StructureError;
  /** The rule that was broken, in words, when it is one a beginner hits. */
  hint?: string;
}

/** The draft parses, and its atoms have been counted. */
interface ReadCheck {
  state: 'read';
  /** What the draft itself reads as, in Hill order. */
  formula: string;
  /** How it differs from the formula asked for; null when the two agree. */
  difference: FormulaDifference | null;
}

/** What can be said about a draft without marking it. */
export type SelfCheck = BlankCheck | UnreadableCheck | ReadCheck;

/**
 * What is true of a draft before anyone hands it in.
 *
 * The two questions this answers are the two a student can check for
 * themselves and mostly does not: does this read as a structure at all, and
 * does that structure hold the atoms of the one in the question. Both are
 * asked in that order, because a formula computed from something the parser
 * refused is a formula of nothing.
 *
 * Neither answer is the mark. A matching formula only says the atoms add up:
 * every isomer of the question passes it, so the student is being handed the
 * arithmetic and never the verdict — {@link validate} still decides, and only
 * once the answer is submitted.
 * @param exercise - The question. A SMARTS question is checked by running it,
 * so it has nothing of this kind to say and answers null.
 * @param draft - What is in the box or on the canvas, unsubmitted.
 * @returns What can be said about it, or null when there is nothing to say.
 */
export function selfCheck(exercise: Exercise, draft: string): SelfCheck | null {
  if (exercise.kind === 'smarts') return null;

  const input = draft.trim();
  if (!input) return { state: 'blank' };

  let expected;
  try {
    expected = readStructure(exercise.smiles, 'smiles').molecule;
  } catch {
    // A question whose own answer cannot be read is broken, and saying so is
    // the marking's job rather than this one's.
    return null;
  }

  let given;
  try {
    // A drawing arrives as an idCode; typed text is a line notation. Reading
    // the drawing as anything else would call an honest answer unparseable.
    given = readStructure(
      input,
      exercise.kind === 'draw' ? 'idcode' : 'smiles',
    ).molecule;
  } catch (error) {
    // An empty canvas still hands back an idCode — openchemlib's `d@`, which
    // holds no atoms and is refused as a structure. Nothing has been drawn
    // yet, and a caret under a packed idCode would point at nothing a student
    // could act on in any case.
    if (exercise.kind === 'draw') return { state: 'blank' };
    const parsed = structureError(error);
    const hint = parseHint(parsed.message);
    return { state: 'unreadable', error: parsed, ...(hint ? { hint } : {}) };
  }

  return {
    state: 'read',
    formula: formulaOf(given),
    difference: formulaDifference(given, expected),
  };
}
