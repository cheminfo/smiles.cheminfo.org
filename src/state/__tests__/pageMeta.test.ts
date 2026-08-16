import { expect, test } from 'vitest';

import {
  SITE_NAME,
  documentTitle,
  everyPage,
  pageMetaFor,
} from '../pageMeta.ts';
import { PATHS } from '../pages.ts';

test('each page is titled and described on its own', () => {
  expect(pageMetaFor('/tutorial').title).toBe(
    'SMILES tutorial — the notation, one step at a time',
  );
  expect(pageMetaFor('/exercises').title).toBe(
    'SMILES exercises — write the notation and be marked on it',
  );
  expect(pageMetaFor('/reference').title).toBe('SMILES and SMARTS cheatsheet');
  expect(pageMetaFor('/specification').title).toBe(
    'The OpenSMILES specification',
  );
  expect(pageMetaFor('/').title).toBe(
    'SMILES converter — draw a structure, read its SMILES',
  );
});

test('searching a list is the list page, under the name it was asked for', () => {
  expect(pageMetaFor('/search').title).toBe(
    'Search a list of structures by substructure or SMARTS',
  );
  expect(pageMetaFor('/search').canonicalPath).toBe('/search');
  expect(pageMetaFor('/lists').canonicalPath).toBe('/lists');
});

test('an address the tool does not know is the converter', () => {
  expect(pageMetaFor('/nowhere')).toStrictEqual(pageMetaFor('/'));
});

test('what the tool is working on is not a page of its own', () => {
  expect(pageMetaFor('/exercises?set=patterns&embed=1').canonicalPath).toBe(
    '/exercises',
  );
  expect(pageMetaFor('/?smiles=c1ccccc1').canonicalPath).toBe('/');
  expect(pageMetaFor('/tutorial/').canonicalPath).toBe('/tutorial');
});

test('a step of the tutorial is a page of its own', () => {
  const step = pageMetaFor('/tutorial/1');

  expect(step.title).toBe('An atom is an element symbol — SMILES tutorial');
  expect(step.description).toContain('Step 1 of 18');
  expect(step.canonicalPath).toBe('/tutorial/1');
  expect(pageMetaFor('/tutorial/2').title).not.toBe(step.title);
  // A step nobody wrote is the tutorial, never a page of its own.
  expect(pageMetaFor('/tutorial/99')).toStrictEqual(pageMetaFor('/tutorial'));
});

test('a set and one of its exercises are each a page of their own', () => {
  expect(pageMetaFor('/exercises/patterns').title).toBe(
    'SMILES exercises: Write a SMARTS',
  );
  expect(pageMetaFor('/exercises/patterns').canonicalPath).toBe(
    '/exercises/patterns',
  );

  const exercise = pageMetaFor('/exercises/patterns/s1');
  expect(exercise.title).toBe('Find the alcohols — write a SMARTS');
  expect(exercise.canonicalPath).toBe('/exercises/patterns/s1');

  // What the page is working on stays out of the address it is indexed under.
  expect(pageMetaFor('/exercises/patterns/s1?embed=1').canonicalPath).toBe(
    '/exercises/patterns/s1',
  );
  // A set or an exercise nobody wrote is the exercises page.
  expect(pageMetaFor('/exercises/nothing')).toStrictEqual(
    pageMetaFor('/exercises'),
  );
  expect(pageMetaFor('/exercises/patterns/nothing')).toStrictEqual(
    pageMetaFor('/exercises'),
  );
});

test('the same molecule asked two ways is two pages, titled differently', () => {
  const write = pageMetaFor('/exercises/molecule-to-smiles/w1');
  const draw = pageMetaFor('/exercises/smiles-to-molecule/d1');

  expect(write.title).toMatch(/— write its SMILES$/);
  expect(draw.title).toMatch(/— draw it from its SMILES$/);
});

test('the build writes one page per address the router knows', () => {
  const pages = everyPage();
  const paths = pages.map((page) => page.canonicalPath);

  // The six pages first, then every step, then every set with its exercises.
  expect(paths.slice(0, 6)).toStrictEqual(Object.values(PATHS));
  expect(paths).toContain('/tutorial/18');
  expect(paths).toContain('/exercises/patterns');
  expect(paths).toContain('/exercises/patterns/s1');
  expect(paths).toHaveLength(137);

  expect(new Set(paths).size).toBe(pages.length);
  expect(new Set(pages.map((page) => page.title)).size).toBe(pages.length);
  expect(new Set(pages.map((page) => page.description)).size).toBe(
    pages.length,
  );
  // `/search` is the list page under a second name: listing it too would be
  // duplicate content.
  expect(paths).not.toContain('/search');

  for (const page of pages) {
    expect(page.description.length).toBeGreaterThan(60);
    expect(page.description.length).toBeLessThanOrEqual(160);
  }
});

test('the tab names the page and the site', () => {
  expect(documentTitle('/tutorial')).toBe(
    `SMILES tutorial — the notation, one step at a time — ${SITE_NAME}`,
  );
});
