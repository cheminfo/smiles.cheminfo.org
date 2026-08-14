import { computed, signal } from '@preact/signals-react';

import type { SpecHeading } from '../specification/headings.ts';
import { extractHeadings } from '../specification/headings.ts';

/**
 * Where the copy of the specification lives. It is a file rather than a module
 * so the 170 kB of it are fetched by whoever opens the page, instead of riding
 * in the bundle of a visitor who only came to convert a SMILES.
 */
export const SPECIFICATION_URL = '/spec/opensmiles.html';

/** The upstream document this is a copy of. */
export const SPECIFICATION_SOURCE = 'https://opensmiles.org/opensmiles.html';

/** Where the document is written and its history kept. */
export const SPECIFICATION_REPOSITORY =
  'https://github.com/opensmiles/OpenSMILES';

export const data = {
  /** The specification itself, once it has been fetched. */
  html: signal<string | null>(null),
  /** Why it could not be fetched, when that is what happened. */
  error: signal<string | null>(null),
};

export const view = {
  /** The heading the reader is under, kept by the article, read by the contents. */
  activeId: signal<string>(''),
  /** What is typed in the box above the contents. */
  filter: signal<string>(''),
};

/** The table of contents, read off the document itself. */
export const headings = computed<readonly SpecHeading[]>(() => {
  const html = data.html.value;
  return html === null ? [] : extractHeadings(html);
});

/** The contents as the box above it leaves them. */
export const shownHeadings = computed<readonly SpecHeading[]>(() => {
  const filter = view.filter.value.trim().toLowerCase();
  const all = headings.value;
  if (filter === '') return all;
  return all.filter((heading) =>
    `${heading.number} ${heading.title}`.toLowerCase().includes(filter),
  );
});

/**
 * Fetch the specification, once per visit. A second call while the first is
 * still in flight waits on it rather than asking again, so switching tabs back
 * and forth does not fetch it twice.
 * @returns When the document is in {@link data}.
 */
export function loadSpecification(): Promise<void> {
  pending ??= fetchSpecification();
  return pending;
}

let pending: Promise<void> | null = null;

async function fetchSpecification(): Promise<void> {
  try {
    const response = await fetch(SPECIFICATION_URL);
    if (!response.ok) throw new Error(`answered ${response.status}`);
    data.html.value = await response.text();
    data.error.value = null;
  } catch (error) {
    // Another visit may work — a reload of the tab must be allowed to retry.
    pending = null;
    data.error.value = error instanceof Error ? error.message : String(error);
  }
}
