/**
 * What each address says in the HTML the server hands out, above the crawl path.
 *
 * All 139 addresses used to ship the same body — this site's menu — so a crawler
 * was handed one text for the converter, the tutorial and every exercise, and
 * told by the title alone that they were different pages. Read by the build and
 * by nothing else: `vite.config.ts` calls it once per route, so none of this
 * reaches the bundle a browser downloads.
 *
 * A tutorial step says what the step says, from the same prose the page renders.
 * An exercise page says what it asks and never the answer: the notation the
 * student is to write is not put in the HTML of the question.
 */

import type { PageContent, RouteMeta } from 'react-cheminfo/core';
import { plainProse } from 'react-cheminfo/core';

import { TUTORIAL_STEPS } from '../data/tutorial.ts';

/** The pages the header lists, each in its own words. */
const PAGES: Record<string, PageContent> = {
  '/': {
    heading: 'Draw a structure and read its SMILES',
    paragraphs: [
      'Draw a molecule and the notation appears beside it; paste a SMILES and the structure appears instead. Both directions run in the page, so nothing is uploaded and there is no wait.',
      'SMILES writes a molecule as a line of text: atoms as element symbols, bonds as the characters between them, branches in parentheses and rings as matching digits. Everything else here is about learning to read and write that line.',
    ],
  },
  '/lists': {
    heading: 'Convert a whole list of structures at once',
    paragraphs: [
      'Paste a column of SMILES, drop a CSV or an SDF, and every structure in the list is converted at once. The table comes back out as a CSV or an SDF, with the structures drawn beside their notation.',
    ],
  },
  '/tutorial': {
    heading: 'The notation, one step at a time',
    paragraphs: [
      `${TUTORIAL_STEPS.length} steps from a single atom to stereochemistry, each one preloaded into the live editor: change the string and the structure follows, change the structure and the string follows.`,
      'The steps run in three groups — atoms, bonds and rings; then aromaticity and charges; then stereochemistry and the awkward corners of the notation.',
    ],
  },
  '/exercises': {
    heading: 'Write the notation, and be marked on it',
    paragraphs: [
      'Three sets: read a structure and write its SMILES, read a SMILES and draw the structure, or write a SMARTS pattern that tells two molecules apart. Every answer is marked in the browser, against the structure rather than against a stored string, so a different correct spelling is still correct.',
    ],
  },
  '/smiles': {
    heading: 'Every construct of the SMILES notation',
    paragraphs: [
      'One printable table of the whole notation: the organic subset and the bracket atoms, the four bond symbols, branches, ring-closure digits, aromaticity, charges, isotopes and the two stereochemistry markers — each with what it draws.',
    ],
  },
  '/smarts': {
    heading: 'Every primitive of the SMARTS query language',
    paragraphs: [
      'SMARTS reads a structure as a question rather than a molecule, and several characters change meaning when it does. This table lists every primitive, and says which of the shared ones stop meaning what they mean in a SMILES.',
    ],
  },
  '/specification': {
    heading: 'The OpenSMILES specification',
    paragraphs: [
      'The specification in full, with its drawings and its original anchors, so the definition of the notation stays readable and can be cited by section.',
    ],
  },
  '/about': {
    heading: 'What this tool is, and what it runs on',
    paragraphs: [
      'What you can do here, the work the conversion and the drawing are built on, and the papers to cite when you publish something this tool made.',
    ],
  },
};

/**
 * What one address says for itself.
 *
 * Read by `cheminfoPrerender` once per route at build time.
 * @param route - The address being written.
 * @returns Its text — authored for a tool, the step's own prose for a tutorial
 * step, and otherwise the name and sentence the route already carries.
 */
export function pageContent(route: RouteMeta): PageContent {
  const authored = PAGES[route.path];
  if (authored !== undefined) return authored;

  const step = stepContent(route.path);
  if (step !== undefined) return step;

  return { heading: route.title, paragraphs: [route.description] };
}

/** A tutorial step, in the words the step is written in. */
function stepContent(path: string): PageContent | undefined {
  const match = /^\/tutorial\/(?<number>\d+)$/.exec(path);
  const number = match?.groups?.number;
  if (number === undefined) return undefined;
  const step = TUTORIAL_STEPS[Number(number) - 1];
  if (step === undefined) return undefined;

  return {
    heading: step.title,
    paragraphs: [
      `Step ${number} of ${TUTORIAL_STEPS.length} of the SMILES tutorial. ${plainProse(step.description)}`,
      `It opens on ${step.smiles}, which you can edit in place: the structure follows every keystroke, and so does the notation when you draw instead.`,
    ],
  };
}
