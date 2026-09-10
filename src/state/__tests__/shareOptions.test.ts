import { parseShareConfig, suggestedShareConfig } from 'react-cheminfo/core';
import { expect, test } from 'vitest';

import type { Page } from '../router.ts';
import { SHARE_VOCABULARY } from '../shareConfig.ts';
import { shareOptionsOf } from '../shareOptions.ts';

const PAGES: Page[] = [
  'converter',
  'lists',
  'exercises',
  'tutorial',
  'smiles',
  'smarts',
  'specification',
  'about',
];

const partsOf = (page: Page) =>
  shareOptionsOf(page).vocabulary.parts.map((part) => part.key);
const suggested = (page: Page) =>
  suggestedShareConfig(shareOptionsOf(page).vocabulary);

test.each([
  ['converter', ['kinds', 'editor', 'formats', 'examples']],
  ['lists', ['load', 'options', 'export']],
  ['exercises', ['sets', 'hints', 'check', 'answers', 'clear']],
  ['tutorial', []],
  ['smiles', []],
  ['smarts', []],
  ['specification', ['list']],
  ['about', []],
] as Array<[Page, string[]]>)(
  'the %s page offers exactly the controls a link can switch off',
  (page, keys) => {
    expect(shareOptionsOf(page).title, page).not.toBe('');
    // The exact list, not merely that there is one: a page whose parts
    // silently emptied would still be an array.
    expect(partsOf(page), page).toStrictEqual(keys);
  },
);

test('every page the router can open has a share dialog to offer', () => {
  for (const page of PAGES) {
    expect(shareOptionsOf(page).title, page).not.toBe('');
  }
});

test('only the exercises hand out a set of questions', () => {
  const withExercises = PAGES.filter(
    (page) => shareOptionsOf(page).hasExercises,
  );
  expect(withExercises).toStrictEqual(['exercises']);
});

test('a part is named once per page', () => {
  for (const page of PAGES) {
    const keys = partsOf(page);
    expect(new Set(keys).size, page).toBe(keys.length);
  }
});

test('every part is described, positively, for the person building a link', () => {
  for (const page of PAGES) {
    for (const part of shareOptionsOf(page).vocabulary.parts) {
      expect(part.label, `${page}/${part.key}`).not.toBe('');
      expect(part.description, `${page}/${part.key}`).not.toBe('');
    }
  }
});

test('every key a page offers is one a link can carry', () => {
  // The dialog writes these into `hide=`, and `parseShareConfig` drops what it
  // does not know — so a key declared here and unknown there would build a
  // link that quietly does nothing.
  for (const page of PAGES) {
    const keys = partsOf(page);
    if (keys.length === 0) continue;
    expect(
      parseShareConfig(`hide=${keys.join(',')}`, SHARE_VOCABULARY).hidden,
      page,
    ).toStrictEqual(keys);
  }
});

test('the dialog opens on a framed link with the parts a course cannot use off', () => {
  expect(suggested('exercises')).toStrictEqual({
    embed: true,
    hidden: [],
    params: {},
  });
  expect(suggested('converter')).toStrictEqual({
    embed: true,
    hidden: ['formats'],
    params: {},
  });
  expect(suggested('lists')).toStrictEqual({
    embed: true,
    hidden: ['options'],
    params: {},
  });
});

test('a page with nothing to switch off still offers to frame itself', () => {
  expect(
    suggestedShareConfig(shareOptionsOf('tutorial').vocabulary),
  ).toStrictEqual({ embed: true, hidden: [], params: {} });
});

test('the exercises can hide the hints, the check and the answers', () => {
  expect(partsOf('exercises')).toStrictEqual([
    'sets',
    'hints',
    'check',
    'answers',
    'clear',
  ]);
});
