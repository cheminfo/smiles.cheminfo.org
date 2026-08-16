import { EXERCISE_SETS } from '../data/exercises.ts';
import { TUTORIAL_STEPS } from '../data/tutorial.ts';

import { describeExercise, describeSet, describeStep } from './pageMetaText.ts';
import type { Page, Route } from './pages.ts';
import { PATHS, parsePath, routePath } from './pages.ts';

export const SITE_NAME = 'smiles.cheminfo.org';
export const SITE_URL = 'https://smiles.cheminfo.org';

export interface PageMeta {
  /** What the tab, the search result and the shared card are titled. */
  title: string;
  /** The line under the title in a search result and a shared card. */
  description: string;
  /**
   * The address this page is indexed under, so the query strings the tool
   * writes — a structure, a share configuration — do not read as new pages.
   */
  canonicalPath: string;
}

const PAGE_META: Record<Page, Omit<PageMeta, 'canonicalPath'>> = {
  converter: {
    title: 'SMILES converter — draw a structure, read its SMILES',
    description:
      'Convert between chemical structures and SMILES in both directions: draw a molecule and read its notation, or paste a SMILES and see what it draws.',
  },
  lists: {
    title: 'Search a list of structures by substructure or SMARTS',
    description:
      'Paste or upload a list of structures, convert every one of them, and narrow the table by substructure, by SMARTS or by what the file said.',
  },
  exercises: {
    title: 'SMILES exercises — write the notation and be marked on it',
    description:
      'Graded SMILES exercises: read a structure and write its SMILES, or read a SMILES and draw the structure. Every answer is marked in your browser.',
  },
  tutorial: {
    title: 'SMILES tutorial — the notation, one step at a time',
    description:
      'A guided tour of the SMILES notation: atoms, bonds, branches, rings, aromaticity, charges and stereochemistry, each step drawn as you edit it.',
  },
  reference: {
    title: 'SMILES and SMARTS cheatsheet',
    description:
      'Every construct of the SMILES and SMARTS notations in one printable table, each with the structure it draws and a note on what it matches.',
  },
  specification: {
    title: 'The OpenSMILES specification',
    description:
      'The OpenSMILES specification, served in full with its drawings and its original anchors, so the definition of the notation stays readable and citable.',
  },
};

/**
 * The page an address opens. An address this tool does not know opens the
 * converter, as the frontend router does, and is indexed as the home page
 * rather than under its own name.
 * @param url - The address asked for, query string included.
 * @returns The title, description and canonical path of that page.
 */
export function pageMetaFor(url: string): PageMeta {
  const pathname = url.split('?', 1)[0] ?? '/';

  // `/search` is the list page under the name someone looking for it types.
  if (pathname.replace(/\/$/, '') === '/search') {
    return { ...PAGE_META.lists, canonicalPath: '/search' };
  }

  const route = parsePath(pathname);
  return (
    deepMetaFor(route) ?? {
      ...PAGE_META[route.page],
      canonicalPath: PATHS[route.page],
    }
  );
}

/**
 * Every address the site answers, and what each one is called. The build writes
 * one file per entry and lists them all in the sitemap — a step of the tutorial
 * and an exercise of a set included, because each is what a teacher hands out
 * and what somebody searches for. `/search` is left out on purpose: it is the
 * list page under a second name, and the two would read as duplicate content.
 * @returns Every page, the converter first.
 */
export function everyPage(): PageMeta[] {
  const pages = (Object.keys(PATHS) as Page[]).map((page) =>
    pageMetaFor(PATHS[page]),
  );

  for (const [index] of TUTORIAL_STEPS.entries()) {
    pages.push(pageMetaFor(`/tutorial/${index + 1}`));
  }

  for (const set of EXERCISE_SETS) {
    pages.push(pageMetaFor(`/exercises/${set.id}`));
    for (const exercise of set.exercises) {
      pages.push(pageMetaFor(`/exercises/${set.id}/${exercise.id}`));
    }
  }

  return pages;
}

/**
 * What the tab says on the page currently open.
 * @param pathname - The path of the address.
 * @returns The title, site name included.
 */
export function documentTitle(pathname: string): string {
  return `${pageMetaFor(pathname).title} — ${SITE_NAME}`;
}

/**
 * A step of the tutorial, a set of exercises, or one exercise. A segment
 * naming none of those is the page holding it, never a page of its own — a
 * link written before a set was renamed still opens, and is indexed as the
 * exercises.
 */
function deepMetaFor(route: Route): PageMeta | null {
  const canonicalPath = routePath(route);

  if (route.step) {
    const step = TUTORIAL_STEPS[route.step - 1];
    if (!step) return null;
    return {
      ...describeStep(step, route.step - 1, TUTORIAL_STEPS.length),
      canonicalPath,
    };
  }

  if (!route.setId) return null;
  const set = EXERCISE_SETS.find((candidate) => candidate.id === route.setId);
  if (!set) return null;

  if (!route.exerciseId) return { ...describeSet(set), canonicalPath };

  const exercise = set.exercises.find((item) => item.id === route.exerciseId);
  return exercise ? { ...describeExercise(exercise), canonicalPath } : null;
}
