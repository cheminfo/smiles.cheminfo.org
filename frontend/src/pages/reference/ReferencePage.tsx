import { Card, H4, H5, Icon, PopoverNext } from '@blueprintjs/core';
import { useEffect } from 'react';

import SmilesThumb from '../../components/SmilesThumb.tsx';
import jumpToAnchor from '../../components/jumpToAnchor.ts';
import type { ReferenceEntry, ReferenceSection } from '../../data/reference.ts';
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
        <Contents />
      </Card>

      <div className="reference-grid">
        {REFERENCE_SECTIONS.map((section) => (
          <Section key={section.id} section={section} />
        ))}
      </div>
    </div>
  );
}

function Contents() {
  return (
    <nav className="reference-contents no-print" aria-label="Sections">
      {groupSections().map((group) => (
        <div key={group.name} className="reference-contents-group">
          {group.name === '' ? null : <span>{group.name}</span>}
          {group.sections.map((section) => (
            <a key={section.id} href={`#${section.id}`}>
              {section.label}
            </a>
          ))}
        </div>
      ))}
    </nav>
  );
}

interface ContentsGroup {
  /** What the sections of the group have in common, empty when nothing does. */
  name: string;
  sections: Array<{ id: string; label: string }>;
}

/**
 * The sections as the contents list them: the notation each belongs to said
 * once, so a row of twenty links does not read `SMILES —` twelve times. The
 * grouping is taken off the titles rather than declared, so a section added to
 * the sheet appears here by having a title like the others.
 */
function groupSections(): ContentsGroup[] {
  const groups: ContentsGroup[] = [];
  for (const section of REFERENCE_SECTIONS) {
    const separator = section.title.indexOf(' — ');
    const name = separator === -1 ? '' : section.title.slice(0, separator);
    const label =
      separator === -1
        ? section.title
        : section.title.slice(separator + ' — '.length);
    let group = groups.find((one) => one.name === name);
    if (group === undefined) {
      group = { name, sections: [] };
      groups.push(group);
    }
    group.sections.push({ id: section.id, label });
  }
  return groups;
}

function Section(props: { section: ReferenceSection }) {
  const { section } = props;
  return (
    <section id={section.id} className="reference-section">
      <H5>
        <a
          className="reference-anchor"
          href={`#${section.id}`}
          title="Link to this section"
        >
          {section.title}
          <Icon className="reference-anchor-icon" icon="link" size={12} />
        </a>
      </H5>
      {section.intro ? <p className="muted">{section.intro}</p> : null}
      <table className="reference-table">
        <tbody>
          {section.entries.map((entry) => (
            <Row key={`${entry.syntax}-${entry.name}`} entry={entry} />
          ))}
        </tbody>
      </table>
    </section>
  );
}

function Row(props: { entry: ReferenceEntry }) {
  const { entry } = props;
  const hasDetail = Boolean(entry.detail ?? entry.exampleSmiles);

  const row = (
    <tr
      className={
        hasDetail ? 'reference-row reference-row--rich' : 'reference-row'
      }
    >
      <td className="reference-syntax">
        <code>{entry.syntax}</code>
      </td>
      <td>{entry.summary}</td>
    </tr>
  );

  if (!hasDetail) return row;

  return (
    <PopoverNext
      interactionKind="hover"
      hoverOpenDelay={150}
      placement="right"
      popoverClassName="syntax-popover"
      // A <tr> cannot host a popover target wrapper without breaking the
      // table, so the popover renders inline and targets the row itself.
      renderTarget={({ isOpen: _isOpen, ref, ...targetProps }) => (
        <tr
          {...targetProps}
          ref={ref as React.Ref<HTMLTableRowElement>}
          className={
            hasDetail ? 'reference-row reference-row--rich' : 'reference-row'
          }
        >
          <td className="reference-syntax">
            <code>{entry.syntax}</code>
          </td>
          <td>{entry.summary}</td>
        </tr>
      )}
      content={<SyntaxCard entry={entry} />}
    />
  );
}

function SyntaxCard(props: { entry: ReferenceEntry }) {
  const { entry } = props;
  return (
    <div className="syntax-card">
      <div className="syntax-card-header">
        <code>{entry.syntax}</code>
        <span>{entry.name}</span>
      </div>
      <p className="syntax-card-summary">{entry.summary}</p>
      {entry.detail ? <p>{entry.detail}</p> : null}
      {entry.exampleSmiles ? (
        <div className="syntax-card-example">
          <code>{entry.exampleSmiles}</code>
          <SmilesThumb smiles={entry.exampleSmiles} width={180} height={120} />
          {entry.exampleNote ? <i>{entry.exampleNote}</i> : null}
        </div>
      ) : null}
    </div>
  );
}
