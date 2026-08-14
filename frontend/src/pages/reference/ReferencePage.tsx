import { Card, H4 } from '@blueprintjs/core';
import { useEffect } from 'react';

import jumpToAnchor from '../../components/jumpToAnchor.ts';
import ReferenceContents from '../../components/reference/ReferenceContents.tsx';
import ReferenceSectionCard from '../../components/reference/ReferenceSectionCard.tsx';
import { REFERENCE_SECTIONS } from '../../data/reference.ts';

/**
 * The whole notation on one page.
 *
 * It is built to be printed: the header, the tabs and the share button carry
 * `no-print`, the sections break cleanly, and the drawings come out with them.
 * Students print a cheatsheet whatever anybody intends — so this one is meant
 * to be printed rather than merely able to be.
 *
 * Every section carries the address it is named by, so a teacher pointing at
 * ring bond closures hands out the section rather than the page. The anchors
 * are the identifiers the sections are declared with, which is what keeps a
 * link written today working after the sheet is reordered.
 * @returns The cheatsheet page.
 */
export default function ReferencePage() {
  useEffect(jumpToAnchor, []);

  return (
    <div className="reference">
      <Card className="prose-card no-print">
        <H4>SMILES and SMARTS on one page</H4>
        <p>
          Hover any row for the longer story and a drawn example. Everything
          here is written against the{' '}
          <a
            href="https://opensmiles.org/opensmiles.html"
            target="_blank"
            rel="noreferrer"
          >
            OpenSMILES specification
          </a>{' '}
          and the{' '}
          <a
            href="https://www.daylight.com/dayhtml/doc/theory/theory.smarts.html"
            target="_blank"
            rel="noreferrer"
          >
            Daylight theory manual
          </a>
          . A few constructs the specification allows are not implemented by the
          toolkit this page runs on; those show their example as text rather
          than as a drawing. Every section has an address of its own: jump to it
          below, or click its title to put it in the bar and hand it out.
        </p>
        <ReferenceContents sections={REFERENCE_SECTIONS} />
      </Card>

      <div className="reference-grid">
        {REFERENCE_SECTIONS.map((section) => (
          <ReferenceSectionCard
            key={section.id}
            section={section}
            id={section.id}
            addressable
          />
        ))}
      </div>
    </div>
  );
}
