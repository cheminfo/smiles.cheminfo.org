import type { ReactNode } from 'react';

import type { Notation } from '../../data/reference/index.ts';
import type { Page } from '../../state/router.ts';

interface Sheet {
  heading: string;
  /** What the notation is, and what defines it. */
  intro: ReactNode;
  /** The other sheet, which every page of either one points at. */
  other: Page;
  otherLabel: string;
}

/**
 * What each sheet says about itself.
 *
 * The two blocks are deliberately not symmetrical: a SMILES sheet is read by
 * someone writing a molecule down and a SMARTS sheet by someone asking a
 * question about one, and the second has to say so in its first sentence —
 * every character it shares with the first has stopped stating a fact.
 */
export const SHEETS: Record<Notation, Sheet> = {
  smiles: {
    heading: 'SMILES — the whole notation on one page',
    intro: (
      <p>
        SMILES writes one molecule on one line: every character of it states
        something the molecule <i>is</i>. Everything here is written against the{' '}
        <a
          href="https://opensmiles.org/opensmiles.html"
          target="_blank"
          rel="noreferrer"
        >
          OpenSMILES specification
        </a>
        , which this site also serves in full.
      </p>
    ),
    other: 'smarts',
    otherLabel: 'Looking for the query language? Open the SMARTS sheet →',
  },
  smarts: {
    heading: 'SMARTS — the whole query language on one page',
    intro: (
      <p>
        SMARTS asks a question about a molecule instead of naming one: every
        atom and every bond of it is a condition, so the characters it borrows
        from SMILES no longer state what a structure is — they state what it has
        to satisfy. Everything here is written against the{' '}
        <a
          href="https://www.daylight.com/dayhtml/doc/theory/theory.smarts.html"
          target="_blank"
          rel="noreferrer"
        >
          Daylight theory manual
        </a>
        , which is the definition of the language. A few primitives it allows
        are not implemented by the toolkit this page runs on; those show their
        example as text rather than as a drawing.
      </p>
    ),
    other: 'smiles',
    otherLabel:
      'Writing a molecule rather than a query? Open the SMILES sheet →',
  },
};
