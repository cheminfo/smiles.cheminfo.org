import { Button, InputGroup } from '@blueprintjs/core';
import { useSignals } from '@preact/signals-react/runtime';
import { useEffect, useRef, useState, useSyncExternalStore } from 'react';

import type { SpecHeading } from '../../../specification/headings.ts';
import { anchorHref } from '../../../state/site.ts';
import { shownHeadings, view } from '../../../state/specification.ts';

/** Where the column no longer fits beside the article, and folds instead. */
const NARROW = '(max-width: 1100px)';

/**
 * The table of contents, down the left.
 *
 * Sixty-seven headings do not fit a column, so subsections only unfold under
 * the chapter being read — which is also the one a reader is looking for them
 * in. Filtering suspends that: what is typed is searched through all of them.
 *
 * Where there is no room for a column it becomes a fold above the article,
 * shut: a phone that opened on forty links before a word of the specification
 * would be showing the reader the wrong thing.
 * @returns The contents column.
 */
export default function SpecificationContents() {
  useSignals();
  const filter = view.filter.value;
  const activeId = view.activeId.value;
  const headings = shownHeadings.value;
  const column = useRef<HTMLElement>(null);
  const isNarrow = useNarrowScreen();
  const [toggled, setToggled] = useState<boolean | null>(null);
  const isOpen = toggled ?? !isNarrow;

  const openChapter =
    headings.find((heading) => heading.id === activeId)?.chapter ?? '';
  const shown = headings.filter(
    (heading) =>
      heading.level < 4 || filter !== '' || heading.chapter === openChapter,
  );

  useEffect(() => {
    const active = column.current?.querySelector('[data-active="true"]');
    active?.scrollIntoView({ block: 'nearest' });
  }, [activeId]);

  return (
    <nav ref={column} className="spec-contents no-print" aria-label="Contents">
      <details
        open={isOpen}
        onToggle={(event) => setToggled(event.currentTarget.open)}
      >
        <summary className="spec-contents-summary">Contents</summary>
        <div className="spec-contents-body">
          <InputGroup
            size="small"
            leftIcon="search"
            placeholder="Filter the contents"
            value={filter}
            onValueChange={(value) => {
              view.filter.value = value;
            }}
            rightElement={
              filter === '' ? undefined : (
                <Button
                  variant="minimal"
                  size="small"
                  icon="cross"
                  aria-label="Clear the filter"
                  onClick={() => {
                    view.filter.value = '';
                  }}
                />
              )
            }
          />
          <ol className="spec-contents-list">
            {shown.map((heading) => (
              <Entry
                key={heading.id}
                heading={heading}
                isActive={heading.id === activeId}
                isOpenChapter={heading.chapter === openChapter}
              />
            ))}
          </ol>
          {shown.length === 0 ? (
            <p className="muted spec-contents-empty">Nothing is called that.</p>
          ) : null}
        </div>
      </details>
    </nav>
  );
}

function Entry(props: {
  heading: SpecHeading;
  isActive: boolean;
  isOpenChapter: boolean;
}) {
  const { heading, isActive, isOpenChapter } = props;
  const classes = ['spec-entry', `spec-entry--l${heading.level}`];
  if (isActive) classes.push('spec-entry--active');
  else if (isOpenChapter && heading.level === 2) classes.push('spec-entry--on');

  return (
    <li>
      <a
        className={classes.join(' ')}
        href={anchorHref(heading.id)}
        data-active={isActive ? 'true' : undefined}
      >
        <span className="spec-entry-number">{heading.number}</span>
        <span>{heading.title}</span>
      </a>
    </li>
  );
}

function useNarrowScreen(): boolean {
  return useSyncExternalStore(subscribe, isNarrowNow, () => false);
}

function subscribe(onChange: () => void): () => void {
  const query = globalThis.matchMedia(NARROW);
  query.addEventListener('change', onChange);
  return () => query.removeEventListener('change', onChange);
}

function isNarrowNow(): boolean {
  return globalThis.matchMedia(NARROW).matches;
}
