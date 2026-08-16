import { signal } from '@preact/signals-react';

import type { Page } from './pages.ts';
import { ALIASES, PATHS, parsePath, routePath } from './pages.ts';
import { SHARE_PARAM_KEYS } from './shareConfig.ts';

export type { Page, Route } from './pages.ts';
export { ALIASES, PATHS, parsePath, routePath } from './pages.ts';

function readPath(): string {
  const { pathname } = globalThis.location;
  const alias = Object.keys(ALIASES).find((path) => pathname === path);
  return alias ?? routePath(parsePath(pathname));
}

/**
 * Where the browser is. Routing is path based, through the History API,
 * because a teacher hands out an address like
 * `smiles.cheminfo.org/exercises/patterns` — a `#` in there would be lost by
 * half the tools that pass links around. The path carries the step or the
 * exercise as well, so each of those is a page a crawler can fetch and a
 * search result can point at.
 */
export const route = {
  page: signal<Page>(parsePath(globalThis.location.pathname).page),
  path: signal<string>(readPath()),
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
  // Staying on a page keeps the step or the exercise it is on; leaving one
  // opens the next at its own address rather than under a segment nobody
  // asked for.
  const path = page === route.page.peek() ? route.path.peek() : PATHS[page];
  const url = query ? `${path}?${query}` : path;
  if (options.replace) {
    globalThis.history.replaceState(null, '', url);
  } else {
    globalThis.history.pushState(null, '', url);
  }
  route.page.value = page;
  route.path.value = path;
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
 * Open another address of the page one is already on — another step, another
 * exercise — without adding a history entry, so the back button leaves the
 * activity rather than walking back through every step that was opened.
 * @param path - The path to write, from `routePath`.
 * @param parameters - Query parameters to set; undefined values are removed.
 */
export function replacePath(
  path: string,
  parameters: Record<string, string | undefined> = {},
): void {
  route.path.value = path;
  replaceParameters(parameters);
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
  route.page.value = parsePath(globalThis.location.pathname).page;
  route.path.value = readPath();
  route.search.value = globalThis.location.search;
});
