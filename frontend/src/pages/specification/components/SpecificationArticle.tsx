import { Callout, Spinner } from '@blueprintjs/core';
import { useSignals } from '@preact/signals-react/runtime';
import { useEffect, useRef } from 'react';

import jumpToAnchor from '../../../components/jumpToAnchor.ts';
import {
  SPECIFICATION_SOURCE,
  data,
  view,
} from '../../../state/specification.ts';

/** How far under the top of the window a heading counts as the one being read. */
const READING_LINE = 96;

/**
 * The specification itself.
 *
 * The document is inserted as it was generated. That is the point of a mirror:
 * a specification that has been parsed and re-emitted is no longer the thing
 * people cite. It is a file this repository ships — never anything a visitor
 * supplies — so there is nothing here to sanitize.
 * @returns The article.
 */
export default function SpecificationArticle() {
  useSignals();
  const html = data.html.value;
  const error = data.error.value;
  const article = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = article.current;
    if (html === null || container === null) return;

    const headings = [
      ...container.querySelectorAll<HTMLElement>('h2[id], h3[id], h4[id]'),
    ];
    let frame = 0;

    function markReadingPosition() {
      frame = 0;
      let reading = headings[0]?.id ?? '';
      for (const heading of headings) {
        if (heading.getBoundingClientRect().top > READING_LINE) break;
        reading = heading.id;
      }
      view.activeId.value = reading;
    }

    function onScroll() {
      frame ||= requestAnimationFrame(markReadingPosition);
    }

    markReadingPosition();
    jumpToAnchor();
    globalThis.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      globalThis.removeEventListener('scroll', onScroll);
      if (frame) cancelAnimationFrame(frame);
    };
  }, [html]);

  if (error !== null) {
    return (
      <Callout intent="danger" title="The specification could not be loaded">
        {error}. It can still be read at{' '}
        <a href={SPECIFICATION_SOURCE} target="_blank" rel="noreferrer">
          opensmiles.org
        </a>
        , where a browser is likely to warn about the certificate.
      </Callout>
    );
  }

  if (html === null) {
    return (
      <div className="spec-loading">
        <Spinner size={24} />
        <span className="muted">Loading the specification…</span>
      </div>
    );
  }

  return (
    <div
      ref={article}
      className="spec-article"
      // eslint-disable-next-line react/no-danger -- a file this repository ships, inserted as generated
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
