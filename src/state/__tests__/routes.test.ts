import type { RouteMeta } from 'react-cheminfo/core';
import { pageDocumentMeta, pageMetaFor } from 'react-cheminfo/core';
import { expect, test } from 'vitest';

import { PATHS } from '../pages.ts';
import { PAGE_ROUTES, SITE_ROUTES, indexedPath } from '../routes.ts';

const SITE_NAME = 'smiles.cheminfo.org';

/**
 * The page an address opens, resolved the way the site resolves it.
 * @param url - The address asked for, query string included.
 * @returns Its title, description and the address it is indexed under.
 */
function metaFor(url: string): RouteMeta {
  return pageMetaFor(SITE_ROUTES, indexedPath(url));
}

test('each page is titled and described on its own', () => {
  expect(metaFor('/tutorial').title).toBe(
    'SMILES tutorial — the notation, one step at a time',
  );
  expect(metaFor('/exercises').title).toBe(
    'SMILES exercises — write the notation and be marked on it',
  );
  expect(metaFor('/smiles').title).toBe(
    'SMILES cheatsheet — every construct of the notation',
  );
  expect(metaFor('/smarts').title).toBe(
    'SMARTS cheatsheet — every primitive of the query language',
  );
  // The address the one sheet had is indexed as the SMILES one, so the two
  // never compete for the same result.
  expect(metaFor('/reference').path).toBe('/smiles');
  expect(metaFor('/specification').title).toBe('The OpenSMILES specification');
  expect(metaFor('/').title).toBe(
    'SMILES converter — draw a structure, read its SMILES',
  );
});

test('searching a list is the list page, under the name it was asked for', () => {
  expect(metaFor('/search').title).toBe(
    'Search structures by substructure or SMARTS',
  );
  expect(metaFor('/search').path).toBe('/search');
  expect(metaFor('/lists').path).toBe('/lists');

  // The same page under two names, and never the same sentence twice: a search
  // result folds two addresses carrying one title into one.
  expect(metaFor('/lists').title).not.toBe(metaFor('/search').title);
  expect(metaFor('/lists').description).not.toBe(
    metaFor('/search').description,
  );
});

test('an address the tool does not know is the converter', () => {
  expect(metaFor('/nowhere')).toStrictEqual(metaFor('/'));
});

test('what the tool is working on is not a page of its own', () => {
  expect(metaFor('/exercises?set=patterns&embed=1').path).toBe('/exercises');
  expect(metaFor('/?smiles=c1ccccc1').path).toBe('/');
  expect(metaFor('/tutorial/').path).toBe('/tutorial');
});

test('a step of the tutorial is a page of its own', () => {
  const step = metaFor('/tutorial/1');

  expect(step.title).toBe('An atom is an element symbol — SMILES tutorial');
  expect(step.description).toBe(
    'A SMILES string is a sequence of atom symbols. A bare C is one carbon, and because SMILES never spells out the hydrogens of a common element, that single…',
  );
  expect(step.path).toBe('/tutorial/1');
  expect(metaFor('/tutorial/2').title).not.toBe(step.title);
  // A step nobody wrote is the tutorial, never a page of its own.
  expect(metaFor('/tutorial/99')).toStrictEqual(metaFor('/tutorial'));
});

test('a set and one of its exercises are each a page of their own', () => {
  expect(metaFor('/exercises/patterns').title).toBe(
    'SMILES exercises: Write a SMARTS',
  );
  expect(metaFor('/exercises/patterns').path).toBe('/exercises/patterns');

  const exercise = metaFor('/exercises/patterns/s1');
  expect(exercise.title).toBe('Find the alcohols — write a SMARTS');
  expect(exercise.path).toBe('/exercises/patterns/s1');

  // What the page is working on stays out of the address it is indexed under.
  expect(metaFor('/exercises/patterns/s1?embed=1').path).toBe(
    '/exercises/patterns/s1',
  );
  // A set or an exercise nobody wrote is the exercises page.
  expect(metaFor('/exercises/nothing')).toStrictEqual(metaFor('/exercises'));
  expect(metaFor('/exercises/patterns/nothing')).toStrictEqual(
    metaFor('/exercises'),
  );
});

test('the same molecule asked two ways is two pages, titled differently', () => {
  const write = metaFor('/exercises/molecule-to-smiles/w1');
  const draw = metaFor('/exercises/smiles-to-molecule/d1');

  expect(write.title).toMatch(/— write its SMILES$/);
  expect(draw.title).toMatch(/— draw it from its SMILES$/);
});

test('an exercise is described by what its own page shows', () => {
  // The formula the page prints under the drawing, when the SMILES is the
  // answer and publishing it would give the answer away.
  expect(metaFor('/exercises/molecule-to-smiles/w1').description).toBe(
    'Write the SMILES of 3,4-Dimethoxyphenethylamine, C10H15NO2: the structure is drawn for you, and the answer is marked on the molecule, not the string.',
  );
  // The SMILES itself, when it is the question the page shows in full.
  expect(metaFor('/exercises/smiles-to-molecule/d1').description).toBe(
    'Draw 5-Methoxysalicylic acid from its SMILES, COc(cc1)cc(C(O)=O)c1O. Any drawing of the right molecule is accepted, whichever way it is laid out.',
  );
});

test('a page is described in its own words, never in the site’s', () => {
  // A step keeps going into the notation it is about rather than stopping to
  // say which step of how many it is: `c1ccccc1` and `[nH]` are what a student
  // types into a search box, and a sentence about the tutorial is what would
  // have taken their room on all eighteen.
  expect(metaFor('/tutorial/6').description).toContain('c1ccccc1');
  expect(metaFor('/tutorial/11').description).toContain('[nH]');
  expect(metaFor('/tutorial/17').description).toContain(
    'CC(=O)Oc1ccccc1C(=O)O',
  );

  // A pattern exercise is its own instructions, whole: `[r3]` is the primitive
  // the sixth one is about, and it survives to the end of the sentence.
  expect(metaFor('/exercises/patterns/s6').description).toContain('[r3]');

  for (const route of SITE_ROUTES) {
    expect(route.description).not.toContain('of the SMILES tutorial');
    expect(route.description).not.toContain('exercises are marked');
  }
});

test('the build writes one page per address the router knows', () => {
  const pages = PAGE_ROUTES;
  const paths = pages.map((page) => page.path);

  // The seven pages first, then every step, then every set with its exercises.
  expect(paths.slice(0, 7)).toStrictEqual(Object.values(PATHS));
  expect(paths).toContain('/tutorial/18');
  expect(paths).toContain('/exercises/patterns');
  expect(paths).toContain('/exercises/patterns/s1');
  expect(paths).toHaveLength(138);

  expect(new Set(paths).size).toBe(pages.length);
  expect(new Set(pages.map((page) => page.title)).size).toBe(pages.length);
  expect(new Set(pages.map((page) => page.description)).size).toBe(
    pages.length,
  );
  // `/search` is the list page under a second name: listing it too would be
  // duplicate content.
  expect(paths).not.toContain('/search');

  for (const page of pages) {
    expect(page.description.length).toBeGreaterThanOrEqual(110);
    expect(page.description.length).toBeLessThanOrEqual(160);
  }
});

test('every address is titled and described at the length a result shows', () => {
  for (const route of SITE_ROUTES) {
    // The site name is appended to the title, so it stops short of 60.
    expect(route.title.length).toBeLessThan(60);
    expect(route.description.length).toBeGreaterThanOrEqual(110);
    expect(route.description.length).toBeLessThanOrEqual(160);
  }

  expect(new Set(SITE_ROUTES.map((route) => route.title)).size).toBe(
    SITE_ROUTES.length,
  );
  expect(new Set(SITE_ROUTES.map((route) => route.description)).size).toBe(
    SITE_ROUTES.length,
  );
});

test('the tab names the page and the site', () => {
  expect(
    pageDocumentMeta({
      site: 'smiles',
      routes: SITE_ROUTES,
      url: indexedPath('/tutorial'),
    }).title,
  ).toBe(`SMILES tutorial — the notation, one step at a time — ${SITE_NAME}`);
});
