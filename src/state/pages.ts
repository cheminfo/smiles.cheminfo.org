export type Page =
  | 'converter'
  | 'lists'
  | 'exercises'
  | 'tutorial'
  | 'reference'
  | 'specification';

/**
 * Where each page lives, the converter being the root.
 *
 * This module holds the addresses and nothing else — no signal, no listener,
 * nothing that reads `location` — so the build that writes one file per page
 * can import it in Node.
 */
export const PATHS: Record<Page, string> = {
  converter: '/',
  lists: '/lists',
  exercises: '/exercises',
  tutorial: '/tutorial',
  reference: '/reference',
  specification: '/specification',
};

/**
 * Addresses a page also answers to. Searching a list is what the list page
 * does, and `/search` is what someone looking for it types.
 */
export const ALIASES: Record<string, Page> = {
  '/search': 'lists',
};
