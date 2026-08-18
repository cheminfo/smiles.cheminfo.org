/**
 * Every address the site answers, with the name and the sentence it is indexed
 * under.
 *
 * One table, read by three things: the build, which writes an HTML file per
 * entry and the sitemap listing them; the head injector; and the running app,
 * which retitles the tab after an in-app move. A page missing from here is a
 * page a search engine only ever sees as the home page.
 *
 * The machinery that reads it is `react-cheminfo/core` and
 * `react-cheminfo/vite`; what belongs to this site is the prose below, and the
 * addresses composed from the tutorial and the exercise sets — each step and
 * each exercise is what a teacher hands out, so each is a page of its own.
 */

import type { NoscriptRoute, RouteMeta } from 'react-cheminfo/core';
import { routeFor, trimTrailingSlash } from 'react-cheminfo/core';

import { EXERCISE_SETS } from '../data/exercises.ts';
import { TUTORIAL_STEPS } from '../data/tutorial.ts';

import { describeExercise, describeSet, describeStep } from './pageMetaText.ts';
import type { Page } from './pages.ts';
import { PATHS, parsePath, routePath } from './pages.ts';

const PAGE_META: Record<Page, Omit<RouteMeta, 'path'>> = {
  converter: {
    title: 'SMILES converter — draw a structure, read its SMILES',
    description:
      'Convert between chemical structures and SMILES in both directions: draw a molecule and read its notation, or paste a SMILES and see what it draws.',
  },
  lists: {
    title: 'Convert a whole list of structures at once',
    description:
      'Paste or upload a column of SMILES, a CSV or an SDF, convert every structure in the list at once, and take the table back out as a CSV or an SDF.',
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
  smiles: {
    title: 'SMILES cheatsheet — every construct of the notation',
    description:
      'Every construct of the SMILES notation in one printable table — atoms, bonds, rings, aromaticity, charges and stereochemistry — each with what it draws.',
  },
  smarts: {
    title: 'SMARTS cheatsheet — every primitive of the query language',
    description:
      'Every primitive of the SMARTS query language in one printable table, and what each shared character stops meaning once a SMILES is read as a question.',
  },
  specification: {
    title: 'The OpenSMILES specification',
    description:
      'The OpenSMILES specification, served in full with its drawings and its original anchors, so the definition of the notation stays readable and citable.',
  },
};

/**
 * Every address the build writes a file for and the sitemap lists — a step of
 * the tutorial and an exercise of a set included. `/search` is left out on
 * purpose: it opens the list page, and advertising one view at two addresses
 * is what a sitemap is worst at.
 */
export const PAGE_ROUTES: readonly RouteMeta[] = buildPageRoutes();

/**
 * `/search` is the list page under the name someone looking for it types.
 *
 * It is left out of {@link PAGE_ROUTES}, so the build writes no file for it and
 * the sitemap does not list it: a crawler asking for it off the wire is handed
 * the fallback page. Titling it, describing it and pointing its canonical
 * somewhere is the running app's work, and the canonical it writes is
 * `/search` itself — the two addresses open one view but answer different
 * questions, so neither is given the other's title, its sentence, or its
 * address.
 */
const SEARCH_ROUTE: RouteMeta = {
  path: '/search',
  title: 'Search structures by substructure or SMARTS',
  description:
    'Search a list of structures by substructure, by a SMARTS pattern, by an exact match or by similarity, with the query drawn or typed. Nothing is uploaded.',
};

/** Every address the running app can be on, `/search` included. */
export const SITE_ROUTES: readonly RouteMeta[] = [...PAGE_ROUTES, SEARCH_ROUTE];

/**
 * The pages the crawl path a visitor with no JavaScript reads links.
 *
 * A crawl path is a menu, and {@link PAGE_ROUTES} carries an entry per tutorial
 * step and per exercise: listing all of them would be a hundred and thirty-seven
 * links nobody reads. What is listed is the seven pages and, under the exercises,
 * the three sets — each under the name the site's own menu gives it rather than
 * the sentence it is indexed under.
 */
export const NOSCRIPT_ROUTES: readonly NoscriptRoute[] = buildNoscriptRoutes();

/**
 * The address a page is indexed under.
 *
 * The query string never reaches it: the structure being drawn and the
 * configuration a shared link carries are not pages of their own. A segment
 * naming a step, a set or an exercise nobody wrote is the page holding it,
 * never a page of its own — so a link written before a set was renamed still
 * opens, and is indexed as the exercises.
 * @param url - The address asked for, query string included.
 * @returns One of the addresses {@link SITE_ROUTES} names.
 */
export function indexedPath(url: string): string {
  const pathname = url.split('?', 1)[0] ?? '/';
  if (trimTrailingSlash(pathname) === '/search') return SEARCH_ROUTE.path;

  const route = parsePath(pathname);
  const path = routePath(route);
  return routeFor(PAGE_ROUTES, path) === undefined ? PATHS[route.page] : path;
}

function buildPageRoutes(): RouteMeta[] {
  const routes: RouteMeta[] = (Object.keys(PATHS) as Page[]).map((page) => ({
    path: PATHS[page],
    ...PAGE_META[page],
  }));

  for (const [index, step] of TUTORIAL_STEPS.entries()) {
    routes.push({ path: `/tutorial/${index + 1}`, ...describeStep(step) });
  }

  for (const set of EXERCISE_SETS) {
    routes.push({ path: `/exercises/${set.id}`, ...describeSet(set) });
    for (const exercise of set.exercises) {
      routes.push({
        path: `/exercises/${set.id}/${exercise.id}`,
        ...describeExercise(exercise),
      });
    }
  }

  return routes;
}

function buildNoscriptRoutes(): NoscriptRoute[] {
  return [
    listed('/', 'Converter — draw a structure, read its SMILES'),
    listed('/lists', 'Lists — convert and search a whole set'),
    listed('/tutorial', 'Tutorial — the notation, one step at a time'),
    {
      ...listed('/exercises', 'Exercises — write it and be marked on it'),
      children: [
        listed(
          '/exercises/molecule-to-smiles',
          'Molecule → SMILES — write the notation of a drawn structure',
        ),
        listed(
          '/exercises/smiles-to-molecule',
          'SMILES → Molecule — draw what a notation describes',
        ),
        listed(
          '/exercises/patterns',
          'Write a SMARTS — a pattern that tells molecules apart',
        ),
      ],
    },
    listed('/smiles', 'SMILES sheet — every construct of the notation'),
    listed('/smarts', 'SMARTS sheet — every primitive of the query language'),
    listed('/specification', 'The OpenSMILES specification'),
  ];
}

/**
 * One page of the crawl path, linked under the name the menu gives it.
 * @param path - The address, which the route table has to answer exactly: a
 * link to a page the build writes no file for is a link to the fallback.
 * @param short - What the link says.
 * @returns The entry.
 * @throws {Error} When the table answers no such address, so a renamed page
 * fails the build rather than shipping a crawl path pointing at nothing.
 */
function listed(path: string, short: string): NoscriptRoute {
  const route = routeFor(PAGE_ROUTES, path);
  if (route?.path !== path) {
    throw new Error(
      `the crawl path names an address the site does not answer: ${path}`,
    );
  }
  return { ...route, short };
}
