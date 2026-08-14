import type { FormulaDifference } from '../../../chemistry/hints.ts';
import type { StructureError } from '../../../chemistry/types.ts';

interface BaseExercise {
  /** Stable, readable, and what a link names. */
  id: string;
  /** How it is listed. */
  title: string;
  /** What to do, with `[[term]]` markers resolved against the glossary. */
  description?: string;
  /** Ordered vague to specific; one is revealed at a time. */
  hints?: string[];
}

/** Show the structure, ask for the SMILES. */
export interface WriteExercise extends BaseExercise {
  kind: 'write';
  /** The molecule, which is drawn for the student and never shown as text. */
  smiles: string;
}

/** Show the SMILES, ask for the structure. */
export interface DrawExercise extends BaseExercise {
  kind: 'draw';
  /** The molecule, shown as text and never drawn. */
  smiles: string;
}

/** One molecule a pattern must match, or must not. */
export interface SmartsCase {
  smiles: string;
  shouldMatch: boolean;
  /** What the molecule is, so a failure reads as chemistry rather than as a string. */
  label?: string;
}

/** Ask for a SMARTS that tells one set of molecules from another. */
export interface SmartsExercise extends BaseExercise {
  kind: 'smarts';
  /** Both the molecules that must match and the ones that must not. */
  cases: SmartsCase[];
}

export type Exercise = WriteExercise | DrawExercise | SmartsExercise;

/** A named list of exercises, which is what a link hands out. */
export interface ExerciseSet {
  id: string;
  title: string;
  description: string;
  exercises: Exercise[];
}

/** How one test case of a SMARTS exercise came out. */
export interface CaseResult {
  case: SmartsCase;
  passed: boolean;
  /** What actually happened, written the way a tutor would say it. */
  reason: string;
}

/** Whether an answer is right, and why not when it is not. */
export interface Verdict {
  passed: boolean;
  /** What to tell the student. Empty when they got it right. */
  reason: string;
  /**
   * Where the parser gave up, when the answer did not parse at all, so the page
   * can point at the character it stopped on.
   */
  error?: StructureError;
  /**
   * What to look at next: the rule that was broken, or what the difference
   * between the two structures is. Never the answer itself.
   */
  hint?: string;
  /**
   * What the answer's formula is short of and has too much of, when it parsed
   * but describes something else.
   */
  formula?: FormulaDifference;
  /**
   * The answer is the right molecule and the wrong stereoisomer — a near miss
   * rather than a wrong one, and shown as such.
   * @default false
   */
  stereoOnly?: boolean;
  /** Every test case of a SMARTS exercise, in order. */
  cases?: CaseResult[];
}

export { type ExerciseLevel } from '../data/tutorial.ts';
