import { expect, test } from 'vitest';

import type { Page } from '../router.ts';
import { parseShareConfig } from '../shareConfig.ts';
import { defaultShareConfig, shareOptionsOf } from '../shareOptions.ts';

const PAGES: Page[] = [
  'converter',
  'lists',
  'exercises',
  'tutorial',
  'reference',
  'specification',
];

test('every page the router can open has a share dialog to offer', () => {
  for (const page of PAGES) {
    const options = shareOptionsOf(page);
    expect(options.title, page).not.toBe('');
    expect(Array.isArray(options.features), page).toBe(true);
  }
});

test('only the exercises hand out a set of questions', () => {
  const withExercises = PAGES.filter(
    (page) => shareOptionsOf(page).hasExercises,
  );
  expect(withExercises).toStrictEqual(['exercises']);
});

test('a feature is named once per page', () => {
  for (const page of PAGES) {
    const keys = shareOptionsOf(page).features.map((feature) => feature.key);
    expect(new Set(keys).size, page).toBe(keys.length);
  }
});

test('every feature is described, positively, for the person building a link', () => {
  for (const page of PAGES) {
    for (const feature of shareOptionsOf(page).features) {
      expect(feature.label, `${page}/${feature.key}`).not.toBe('');
      expect(feature.description, `${page}/${feature.key}`).not.toBe('');
    }
  }
});

test('every key a page offers is one a link can carry', () => {
  // The dialog writes these into `hide=`, and `parseShareConfig` drops what it
  // does not know — so a key declared here and unknown there would build a
  // link that quietly does nothing.
  for (const page of PAGES) {
    const keys = shareOptionsOf(page).features.map((feature) => feature.key);
    if (keys.length === 0) continue;
    expect(
      parseShareConfig(`hide=${keys.join(',')}`).hidden,
      page,
    ).toStrictEqual(keys);
  }
});

test('the dialog opens on a framed link with the parts a course cannot use off', () => {
  const exercises = defaultShareConfig(shareOptionsOf('exercises'));
  expect(exercises).toStrictEqual({ embed: true, hidden: [] });

  const converter = defaultShareConfig(shareOptionsOf('converter'));
  expect(converter).toStrictEqual({ embed: true, hidden: ['formats'] });

  const lists = defaultShareConfig(shareOptionsOf('lists'));
  expect(lists).toStrictEqual({ embed: true, hidden: ['options'] });
});

test('a page with nothing to switch off still offers to frame itself', () => {
  expect(defaultShareConfig(shareOptionsOf('tutorial'))).toStrictEqual({
    embed: true,
    hidden: [],
  });
});

test('the exercises can hide the hints, the check and the answers', () => {
  const keys = shareOptionsOf('exercises').features.map(
    (feature) => feature.key,
  );
  expect(keys).toStrictEqual(['sets', 'hints', 'check', 'answers', 'clear']);
});
