import { Card, H4 } from '@blueprintjs/core';
import { useEffect } from 'react';

import jumpToAnchor from '../../components/jumpToAnchor.ts';
import ReferenceContents from '../../components/reference/ReferenceContents.tsx';
import ReferenceSectionCard from '../../components/reference/ReferenceSectionCard.tsx';
import type { Notation } from '../../data/reference/index.ts';
import { referenceSectionsFor } from '../../data/reference/index.ts';
import { PATHS, navigate } from '../../state/router.ts';
import { withBase } from '../../state/site.ts';

import { SHEETS } from './sheets.tsx';

/**
 * One notation on one page.
 *
 * There are two of these — SMILES and SMARTS — because the two notations share
 * their characters and not their meanings, and one sheet holding both was read
 * as a single language with a long tail. Each sheet ends on the section they
 * share, which is the list of characters that stop meaning what they meant.
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
 * @param props - Which notation the sheet is about.
 * @returns The cheatsheet page.
 */
export default function ReferencePage(props: { notation: Notation }) {
  const { notation } = props;
  const sheet = SHEETS[notation];
  const sections = referenceSectionsFor([notation]);

  useEffect(jumpToAnchor, []);

  return (
    <div className="reference">
      <Card className="prose-card no-print">
        <H4>{sheet.heading}</H4>
        {sheet.intro}
        <p>
          Hover any row for the longer story and a drawn example. Every section
          has an address of its own: jump to it below, or click its title to put
          it in the bar and hand it out.
        </p>
        <p>
          {/* A real address, so it is followed by a crawler and can be opened
              in a tab of its own; the click is handled in the page, because
              reloading the site to change sheet loses nothing but costs a
              second. */}
          <a
            className="sheet-switch"
            href={withBase(PATHS[sheet.other])}
            onClick={(event) => {
              if (event.metaKey || event.ctrlKey || event.shiftKey) return;
              event.preventDefault();
              navigate(sheet.other);
            }}
          >
            {sheet.otherLabel}
          </a>
        </p>
        <ReferenceContents sections={sections} />
      </Card>

      <div className="reference-grid">
        {sections.map((section) => (
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
