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

export interface Route {
  page: Page;
  /**
   * The tutorial step, counted from 1 because it is read by people.
   * @default undefined
   */
  step?: number;
  /**
   * The exercise set being worked on.
   * @default undefined
   */
  setId?: string;
  /**
   * The exercise of that set which is open.
   * @default undefined
   */
  exerciseId?: string;
}

/**
 * What an address opens. A step of the tutorial and an exercise of a set are
 * addresses of their own rather than a parameter on the page holding them:
 * they are what a teacher hands out, and a crawler that finds a hundred of
 * them under one address indexes one page.
 * @param pathname - The path, without its query string.
 * @returns The page, and the step or the exercise when the address names one.
 */
export function parsePath(pathname: string): Route {
  const path = trimTrailingSlash(pathname);
  const alias = ALIASES[path];
  if (alias) return { page: alias };

  const [, first, second, third] = path.split('/');
  if (!first) return { page: 'converter' };

  const page = (Object.keys(PATHS) as Page[]).find(
    (candidate) => PATHS[candidate] === `/${first}`,
  );
  if (!page) return { page: 'converter' };

  if (page === 'tutorial' && second) {
    const step = Number(second);
    return Number.isInteger(step) && step >= 1 ? { page, step } : { page };
  }

  if (page === 'exercises' && second) {
    return third
      ? { page, setId: second, exerciseId: third }
      : { page, setId: second };
  }

  return { page };
}

/**
 * The address of a route, as the page writes it and the sitemap lists it.
 * @param route - The page, and the step or the exercise it is on.
 * @returns The path, starting with a slash.
 */
export function routePath(route: Route): string {
  const { page, step, setId, exerciseId } = route;
  if (page === 'tutorial' && step) return `/tutorial/${step}`;
  if (page === 'exercises' && setId) {
    return exerciseId
      ? `/exercises/${setId}/${exerciseId}`
      : `/exercises/${setId}`;
  }
  return PATHS[page];
}

function trimTrailingSlash(value: string): string {
  return value.length > 1 && value.endsWith('/') ? value.slice(0, -1) : value;
}
