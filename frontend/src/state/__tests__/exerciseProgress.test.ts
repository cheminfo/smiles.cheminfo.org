import { expect, test } from 'vitest';

import {
  clearProgress,
  loadProgress,
  progress,
  progressOf,
  setProgressStore,
  solvedCount,
  updateProgress,
} from '../exerciseProgress.ts';
import type { ProgressByExercise, ProgressStore } from '../progressStore.ts';

/**
 * A binding that keeps everything in memory, standing in for the course
 * service a deployment would plug in.
 * @param initial - What it holds to begin with.
 * @returns The store, and what it was last asked to keep.
 */
function memoryStore(initial: ProgressByExercise = {}) {
  const held = { current: initial };
  const store: ProgressStore = {
    name: 'memory',
    load: () => held.current,
    save: (byExercise) => {
      held.current = byExercise;
    },
  };
  return { store, held };
}

test('a bound store is loaded from, and written to on every change', async () => {
  const { store, held } = memoryStore({
    w2: {
      status: 'solved',
      answer: 'NCC(O)c1ccc(O)cc1',
      submitted: 'NCC(O)c1ccc(O)cc1',
      attempts: 3,
      hintsRevealed: 2,
      showAnswer: false,
    },
  });

  await setProgressStore(store);
  expect(progressOf('w2').status).toBe('solved');
  expect(progressOf('w2').hintsRevealed).toBe(2);
  expect(progressOf('w2').attempts).toBe(3);

  updateProgress('w15', { status: 'attempted', answer: 'CCO', attempts: 1 });
  expect(held.current.w15?.status).toBe('attempted');
  expect(held.current.w15?.attempts).toBe(1);
  expect(solvedCount(['w2', 'w15'])).toBe(1);
});

test('a field an older entry does not carry reads as its default', async () => {
  // A link followed months later must still open, whatever shape was stored.
  const { store } = memoryStore({
    old: { status: 'solved' } as ProgressByExercise[string],
  });
  await setProgressStore(store);

  expect(progressOf('old')).toStrictEqual({
    status: 'solved',
    answer: '',
    submitted: '',
    attempts: 0,
    hintsRevealed: 0,
    showAnswer: false,
  });
});

test('an exercise nobody touched reads as empty', async () => {
  const { store } = memoryStore();
  await setProgressStore(store);
  expect(progressOf('never-opened')).toStrictEqual({
    status: 'idle',
    answer: '',
    submitted: '',
    attempts: 0,
    hintsRevealed: 0,
    showAnswer: false,
  });
});

test('clearing forgets one exercise, or every one of them', async () => {
  const { store, held } = memoryStore();
  await setProgressStore(store);

  updateProgress('a', { status: 'solved' });
  updateProgress('b', { status: 'attempted' });
  clearProgress('a');
  expect(Object.keys(progress.value)).toStrictEqual(['b']);

  clearProgress();
  expect(progress.value).toStrictEqual({});
  expect(held.current).toStrictEqual({});
});

test('loadProgress re-reads whatever the bound store now holds', async () => {
  const { store, held } = memoryStore();
  await setProgressStore(store);

  held.current = {
    elsewhere: {
      status: 'solved',
      answer: 'CCO',
      submitted: 'CCO',
      attempts: 1,
      hintsRevealed: 0,
      showAnswer: false,
    },
  };
  await loadProgress();
  expect(progressOf('elsewhere').answer).toBe('CCO');
});
