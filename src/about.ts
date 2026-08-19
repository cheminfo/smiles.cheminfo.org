/**
 * What the site says about itself, as a record the shared `AboutPage` draws.
 *
 * The prose is the site's; the order of the sections, the credit list and the
 * licence block belong to the family. What a list may be written as is the one
 * fact that does not fit the shape, and it sits beside the record in
 * `pages/about/AboutPage.tsx`.
 */

import type { AboutContent, CitedWork } from 'react-cheminfo/core';

/** The record the `/about` page is drawn from. */
export const ABOUT: AboutContent = {
  siteId: 'smiles',
  what: 'Draw a structure and read its SMILES, write a SMILES and see the structure — one molecule at a time, or ten thousand.',
  can: [
    'Convert a drawn structure to SMILES, and a SMILES back to a structure.',
    'Convert a whole list at once, in or out of SMILES, CSV, molfiles and SDF.',
    'Search a list by substructure, SMARTS, exact match or similarity.',
    'Learn the notation in 18 tutorial steps, each a structure you can take apart.',
    'Practise on 110 graded exercises, marked on the molecule and never on the string.',
    'Read the SMILES and SMARTS cheatsheets, and the OpenSMILES specification in full.',
  ],
  paragraphs: [
    'Everything runs in the page on openchemlib, the JavaScript port of the Java library Thomas Sander wrote. Nothing you draw, paste or open is uploaded, and there is no service behind the site: reading a list also indexes it, so a set you are not allowed to send anywhere is still one you can search here.',
    'A canonical SMILES is the one string a toolkit picks out of the many that describe the same molecule, so two people who wrote it differently can still tell they meant the same one. That is what makes the exercises gradable — an answer is marked on the molecule, never on the string — and the second SMILES paper is where it is defined.',
  ],
  credits: [
    'openchemlib',
    'openchemlib-utils',
    'react-ocl',
    'react-mf',
    'blueprint',
    'react-science',
    'react-cheminfo',
    'react',
    'vite',
  ],
  cite: citedWorks(),
};

/**
 * The papers a reader publishing what this page produced owes: the notation
 * itself, the algorithm that makes one SMILES canonical, and the toolkit that
 * reads and draws every structure here.
 * @returns The works, in the order the page lists them.
 */
function citedWorks(): CitedWork[] {
  return [
    {
      reference: {
        authors: [{ given: 'D.', family: 'Weininger' }],
        title:
          'SMILES, a chemical language and information system. 1. Introduction to methodology and encoding rules',
        journal: 'Journal of Chemical Information and Computer Sciences',
        journalAbbreviation: 'J. Chem. Inf. Comput. Sci.',
        year: 1988,
        volume: '28',
        issue: '1',
        firstPage: '31',
        lastPage: '36',
        doi: '10.1021/ci00057a005',
        publisher: 'American Chemical Society',
      },
      what: 'The SMILES notation',
      note: 'Cite it for the notation this site converts, teaches and marks.',
    },
    {
      reference: {
        authors: [
          { given: 'D.', family: 'Weininger' },
          { given: 'A.', family: 'Weininger' },
          { given: 'J. L.', family: 'Weininger' },
        ],
        title: 'SMILES. 2. Algorithm for generation of unique SMILES notation',
        journal: 'Journal of Chemical Information and Computer Sciences',
        journalAbbreviation: 'J. Chem. Inf. Comput. Sci.',
        year: 1989,
        volume: '29',
        issue: '2',
        firstPage: '97',
        lastPage: '101',
        doi: '10.1021/ci00062a008',
        publisher: 'American Chemical Society',
      },
      what: 'The canonical SMILES',
      note: 'Cite it for the one string that stands for a molecule however it was written.',
    },
    {
      reference: {
        authors: [
          { given: 'T.', family: 'Sander' },
          { given: 'J.', family: 'Freyss' },
          { given: 'M.', family: 'von Korff' },
          { given: 'J. R.', family: 'Reich' },
          { given: 'C.', family: 'Rufener' },
        ],
        title:
          'OSIRIS, an entirely in-house developed drug discovery informatics system',
        journal: 'Journal of Chemical Information and Modeling',
        journalAbbreviation: 'J. Chem. Inf. Model.',
        year: 2009,
        volume: '49',
        issue: '2',
        firstPage: '232',
        lastPage: '246',
        doi: '10.1021/ci800305f',
        publisher: 'American Chemical Society',
      },
      what: 'OpenChemLib',
      note: 'Cite it for the conversion, the depiction and the substructure search.',
    },
  ];
}
