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

test('the build writes one page per address the router knows', () => {
  const pages = everyPage();

  expect(pages.map((page) => page.canonicalPath)).toStrictEqual(
    Object.values(PATHS),
  );
  expect(new Set(pages.map((page) => page.title)).size).toBe(pages.length);
  expect(new Set(pages.map((page) => page.description)).size).toBe(
    pages.length,
  );
  // `/search` is the list page under a second name: listing it too would be
  // duplicate content.
  expect(pages.map((page) => page.canonicalPath)).not.toContain('/search');

  for (const page of pages) {
    expect(page.description.length).toBeGreaterThan(60);
  }
});

test('the tab names the page and the site', () => {
  expect(documentTitle('/tutorial')).toBe(
    `SMILES tutorial — the notation, one step at a time — ${SITE_NAME}`,
  );
});
