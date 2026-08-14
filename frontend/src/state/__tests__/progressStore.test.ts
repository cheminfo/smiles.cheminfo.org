import { afterEach, beforeEach, expect, test } from 'vitest';

import type { ProgressByExercise } from '../progressStore.ts';
import { localStorageProgressStore } from '../progressStore.ts';

const KEY = 'smiles:exercises:v1';

/**
 * The smallest thing that behaves like `localStorage`. A DOM is not needed to
 * test a key-value store, and jsdom is thirty-seven packages to avoid.
 * @returns The stub, and the map behind it.
 */
function stubStorage() {
  const held = new Map<string, string>();
  const storage = {
    getItem: (key: string) => held.get(key) ?? null,
    setItem: (key: string, value: string) => held.set(key, value),
    removeItem: (key: string) => held.delete(key),
    clear: () => held.clear(),
    key: (index: number) => [...held.keys()][index] ?? null,
    get length() {
      return held.size;
    },
  };
  return { storage, held };
}

let held: Map<string, string>;

beforeEach(() => {
  const stub = stubStorage();
  held = stub.held;
  Object.defineProperty(globalThis, 'localStorage', {
    value: stub.storage,
    configurable: true,
  });
});

afterEach(() => {
  Reflect.deleteProperty(globalThis, 'localStorage');
});

const ENTRY: ProgressByExercise = {
  'write-octopamine': {
    status: 'solved',
    answer: 'NCC(O)c1ccc(O)cc1',
    submitted: 'NCC(O)c1ccc(O)cc1',
    attempts: 2,
    hintsRevealed: 1,
    showAnswer: false,
  },
};

test('what was saved is what is loaded back', () => {
  // `save` may answer over the network in another binding, so its result is
  // a promise this one never produces.
  void localStorageProgressStore.save(ENTRY);
  expect(held.get(KEY)).toBe(JSON.stringify(ENTRY));
  expect(localStorageProgressStore.load()).toStrictEqual(ENTRY);
});

test('an empty store reads as nothing done', () => {
  expect(localStorageProgressStore.load()).toStrictEqual({});
});

test('malformed storage reads as nothing done rather than throwing', () => {
  // A half-written entry, or a key another version of the site left behind,
  // must not stop a student opening the page.
  held.set(KEY, '{not json at all');
  expect(localStorageProgressStore.load()).toStrictEqual({});
});

test('a stored value of the wrong shape reads as nothing done', () => {
  for (const wrong of ['[]', 'null', '"a string"', '42']) {
    held.set(KEY, wrong);
    expect(localStorageProgressStore.load(), wrong).toStrictEqual({});
  }
});

test('a storage that refuses to write does not break the exercise', () => {
  Object.defineProperty(globalThis, 'localStorage', {
    value: {
      getItem: () => null,
      setItem: () => {
        throw new Error('QuotaExceededError');
      },
    },
    configurable: true,
  });

  // Losing what was found must never break the page: best effort, both ways.
  expect(() => void localStorageProgressStore.save(ENTRY)).not.toThrow();
});

test('a storage that refuses to be read does not break the exercise', () => {
  Object.defineProperty(globalThis, 'localStorage', {
    value: {
      getItem: () => {
        throw new Error('storage partitioned away');
      },
      setItem: () => undefined,
    },
    configurable: true,
  });

  expect(localStorageProgressStore.load()).toStrictEqual({});
});

test('the binding names itself, for a message about it', () => {
  expect(localStorageProgressStore.name).toBe('this browser');
});
