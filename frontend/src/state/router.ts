import { signal } from '@preact/signals-react';

import { SHARE_PARAM_KEYS } from './shareConfig.ts';

export type Page =
  | 'converter'
  | 'lists'
  | 'exercises'
  | 'tutorial'
  | 'reference'
  | 'specification';

/**
 * Where each page lives, the converter being the root. Declared before the
 * route, because reading the address is the first thing this module does.
 */
const PATHS: Record<Page, string> = {
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
const ALIASES: Record<string, Page> = {
  '/search': 'lists',
};

function readPage(): Page {
  const { pathname } = globalThis.location;
  for (const [path, page] of Object.entries(ALIASES)) {
    if (pathname.startsWith(path)) return page;
  }
  for (const [page, path] of Object.entries(PATHS)) {
    if (path !== '/' && pathname.startsWith(path)) return page as Page;
  }
  return 'converter';
}

/**
 * Where the browser is. Routing is path based, through the History API,
 * because a teacher hands out an address like
 * `smiles.cheminfo.org/exercises?set=molecule-to-smiles` — a `#` in there would
 * be lost by half the tools that pass links around.
 */
export const route = {
  page: signal<Page>(readPage()),
  search: signal<string>(globalThis.location.search),
};

/**
 * Read one parameter of the current address.
 * @param name - Query parameter name.
 * @returns Its value, or null when absent.
 */
export function searchParameter(name: string): string | null {
  return new URLSearchParams(route.search.value).get(name);
}

export interface NavigateOptions {
  /**
   * Overwrite the current history entry instead of adding one. Used when the
   * address only records where the student is, so the back button leaves the
   * activity rather than walking back through every exercise they opened.
   * @default false
   */
  replace?: boolean;
}

/**
 * Go to another page. What configures the activity — `embed`, `hide` — is kept
 * so a teacher's link survives navigation, but what feeds a page is left
 * behind: the converter's `smiles` is not the search page's query and not the
 * exercise set, and carrying one over as another asks for something nobody
 * wrote.
 * @param page - Page to open.
 * @param parameters - Query parameters to set; undefined values are removed.
 * @param options - How to record it in the history.
 */
export function navigate(
  page: Page,
  parameters: Record<string, string | undefined> = {},
  options: NavigateOptions = {},
): void {
  const search = keptParameters(page);
  for (const [name, value] of Object.entries(parameters)) {
    if (value === undefined) {
      search.delete(name);
    } else {
      search.set(name, value);
    }
  }
  const query = search.toString();
  const path = PATHS[page];
  const url = query ? `${path}?${query}` : path;
  if (options.replace) {
    globalThis.history.replaceState(null, '', url);
  } else {
    globalThis.history.pushState(null, '', url);
  }
  route.page.value = page;
  route.search.value = query ? `?${query}` : '';
}

/**
 * Rewrite the address of the page one is already on, without adding a history
 * entry. This is how a page keeps its own inputs shareable while they are
 * being typed.
 * @param parameters - Query parameters to set; undefined values are removed.
 */
export function replaceParameters(
  parameters: Record<string, string | undefined>,
): void {
  navigate(route.page.peek(), parameters, { replace: true });
}

/**
 * What survives a move to another page: only what configures the page, never
 * what feeds it. Staying on the same page keeps everything, since that is the
 * page writing its own address.
 */
function keptParameters(page: Page): URLSearchParams {
  const current = new URLSearchParams(route.search.peek());
  if (page === route.page.peek()) return current;

  const kept = new URLSearchParams();
  for (const key of SHARE_PARAM_KEYS) {
    const value = current.get(key);
    if (value !== null) kept.set(key, value);
  }
  return kept;
}

globalThis.addEventListener('popstate', () => {
  route.page.value = readPage();
  route.search.value = globalThis.location.search;
});
