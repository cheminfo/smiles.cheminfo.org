import { signal } from '@preact/signals-react';

import type { ProgressByExercise, ProgressStore } from './progressStore.ts';
import { localStorageProgressStore } from './progressStore.ts';

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

/** An exercise nobody has touched. */
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
export const progress = signal<ProgressByExercise>({});

let store: ProgressStore = localStorageProgressStore;

/**
 * Bind the results to somewhere else — a course hosting its own service
 * implements the same two calls. Nothing else in the page knows where the work
 * went.
 * @param next - The binding to use from now on.
 * @returns When whatever it held has been loaded.
 */
export async function setProgressStore(next: ProgressStore): Promise<void> {
  store = next;
  progress.value = await next.load();
}

/** Load whatever the bound store holds. */
export async function loadProgress(): Promise<void> {
  progress.value = await store.load();
}

/**
 * What was done on one exercise, defaults filled in.
 *
 * A field an older entry does not carry reads as its default, so a link
 * followed months later still opens.
 * @param id - The exercise.
 * @returns Its progress.
 */
export function progressOf(id: string): ExerciseProgress {
  return { ...emptyProgress(), ...progress.value[id] };
}

/**
 * Record what happened on one exercise and tell the store.
 * @param id - The exercise.
 * @param changes - The fields that changed.
 */
export function updateProgress(
  id: string,
  changes: Partial<ExerciseProgress>,
): void {
  const next = {
    ...progress.peek(),
    [id]: { ...emptyProgress(), ...progress.peek()[id], ...changes },
  };
  progress.value = next;
  void store.save(next);
}

/**
 * Forget one exercise, or every one of them.
 * @param id - The exercise to forget; all of them when left out.
 */
export function clearProgress(id?: string): void {
  if (id === undefined) {
    progress.value = {};
  } else {
    const next = { ...progress.peek() };
    // eslint-disable-next-line @typescript-eslint/no-dynamic-delete -- the key is an exercise id, which is what this record is keyed by
    delete next[id];
    progress.value = next;
  }
  void store.save(progress.peek());
}

/**
 * How many of a list of exercises are solved.
 * @param ids - The exercises to count.
 * @returns How many are solved.
 */
export function solvedCount(ids: readonly string[]): number {
  const current = progress.value;
  let solved = 0;
  for (const id of ids) {
    if (current[id]?.status === 'solved') solved++;
  }
  return solved;
}
