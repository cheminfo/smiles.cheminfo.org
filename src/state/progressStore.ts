import type {
  ProgressRecords,
  ProgressStore as SharedProgressStore,
} from 'react-cheminfo/core';
import { localStorageProgressStore as createLocalStorageProgressStore } from 'react-cheminfo/core';

/** What a student has done on one exercise. */
export interface ExerciseProgress {
  /** Never attempted, attempted, or right. */
  status: 'idle' | 'attempted' | 'solved';
  /**
   * What they last wrote or drew. A drawing is kept as the editor value,
   * coordinates included, so a reload gives back their own structure rather
   * than a layout computed from the answer.
   */
  answer: string;
  /**
   * The answer of their last submission — what the verdict on screen is about.
   * Kept apart from `answer`, which follows the pen and the keyboard, so a
   * reload restores a half-written answer without a mark against it.
   */
  submitted: string;
  /** How many times they have submitted an answer. */
  attempts: number;
  /** How many hints they have opened. */
  hintsRevealed: number;
  /** Whether they asked to see the answer. */
  showAnswer: boolean;
}

/**
 * An exercise nobody has touched.
 * @returns A blank record.
 */
export function emptyProgress(): ExerciseProgress {
  return {
    status: 'idle',
    answer: '',
    submitted: '',
    attempts: 0,
    hintsRevealed: 0,
    showAnswer: false,
  };
}

/** Everything a student has done, keyed by exercise id. */
export type ProgressByExercise = ProgressRecords<ExerciseProgress>;

/**
 * Where the results of the exercises are kept. The browser is the only
 * binding there is today; a course hosting its own service implements the
 * same two calls and is plugged in with `setProgressStore`, without anything
 * else in the page knowing where the work went.
 */
export type ProgressStore = SharedProgressStore<ExerciseProgress>;

/**
 * The default binding: `localStorage`, keyed by exercise. Best effort on both
 * sides — a page framed in a course may have no storage at all, and losing
 * what was done must never break the exercise. Every stored record is read
 * over {@link emptyProgress} field by field, so an entry written by an older
 * version of the page still opens.
 */
export const localStorageProgressStore: ProgressStore =
  createLocalStorageProgressStore<ExerciseProgress>({
    key: 'smiles:exercises',
    defaults: emptyProgress(),
  });
