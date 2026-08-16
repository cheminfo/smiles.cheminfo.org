import { PopoverNext } from '@blueprintjs/core';
import { Fragment } from 'react';

import type { GlossaryEntry } from '../data/glossary.ts';
import { GLOSSARY } from '../data/glossary.ts';

import SmilesThumb from './SmilesThumb.tsx';
import { MARKER } from './glossaryMarkers.ts';

/**
 * Render prose in which jargon is marked with `[[double brackets]]`, turning
 * every marked word that the glossary knows into a hoverable definition.
 *
 * A marker the glossary has no entry for renders as the plain word — never as
 * the brackets — so a description may link a term before anybody has written
 * it, and the page keeps reading.
 * @param props - The prose to render.
 * @returns The prose, with the known terms made hoverable.
 */
export default function GlossaryText(props: { text: string }) {
  const pieces: React.ReactNode[] = [];
  let at = 0;

  for (const match of props.text.matchAll(MARKER)) {
    const start = match.index;
    if (start > at) pieces.push(props.text.slice(at, start));
    const term = match.groups?.term ?? '';
    const entry = GLOSSARY[term.toLowerCase()];
    // Keyed on where the marker sits in the prose, which is unique even when
    // the same term is linked twice in one paragraph.
    pieces.push(
      entry ? (
        <GlossaryTerm key={`${start}-${term}`} term={term} entry={entry} />
      ) : (
        <Fragment key={`${start}-${term}`}>{term}</Fragment>
      ),
    );
    at = start + match[0].length;
  }
  if (at < props.text.length) pieces.push(props.text.slice(at));

  return <>{pieces}</>;
}

function GlossaryTerm(props: { term: string; entry: GlossaryEntry }) {
  const { term, entry } = props;
  return (
    <PopoverNext
      interactionKind="hover"
      hoverOpenDelay={150}
      placement="top"
      popoverClassName="glossary-popover"
      content={<GlossaryCard entry={entry} />}
    >
      <span className="glossary-term">{term}</span>
    </PopoverNext>
  );
}

function GlossaryCard(props: { entry: GlossaryEntry }) {
  const { entry } = props;
  return (
    <div className="glossary-card">
      <h6>{entry.title}</h6>
      <p>{entry.summary}</p>
      <ul className="glossary-examples">
        {entry.examples.map((example) => (
          <li key={example.smiles}>
            <div className="glossary-example">
              <code>{example.smiles}</code>
              <SmilesThumb smiles={example.smiles} width={140} height={90} />
            </div>
            {example.note ? <i>{example.note}</i> : null}
          </li>
        ))}
      </ul>
    </div>
  );
}
