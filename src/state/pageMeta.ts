export const SITE_NAME = 'smiles.cheminfo.org';
export const SITE_URL = 'https://smiles.cheminfo.org';

export interface PageMeta {
  /** What the tab, the search result and the shared card are titled. */
  title: string;
  /** The line under the title in a search result and a shared card. */
  description: string;
  /**
   * The address this page is indexed under, so the query strings the tool
   * writes — a structure, a set, a share configuration — do not read as new
   * pages.
   */
  canonicalPath: string;
}

/**
 * The page an address opens. An address this tool does not know opens the
 * converter, as the frontend router does, and is indexed as the home page
 * rather than under its own name.
 * @param url - The address asked for, query string included.
 * @returns The title, description and canonical path of that page.
 */
export function pageMetaFor(url: string): PageMeta {
  const pathname = trimTrailingSlash(url.split('?', 1)[0] ?? '/') || '/';
  const [, first] = pathname.split('/');

  // `/search` is the list page under the name someone looking for it types.
  if (first === 'lists' || first === 'search') {
    return {
      title: 'Search a list of structures by substructure or SMARTS',
      description:
        'Paste or upload a list of structures, convert every one of them, and narrow the table by substructure, by SMARTS or by what the file said. Nothing leaves the browser.',
      canonicalPath: first === 'search' ? '/search' : '/lists',
    };
  }

  if (first === 'exercises') {
    return {
      title: 'SMILES exercises — write the notation and be marked on it',
      description:
        'Graded SMILES exercises: read a structure and write its SMILES, or read a SMILES and draw the structure. Every answer is marked in the browser, with a hint that points at what to look at next.',
      canonicalPath: '/exercises',
    };
  }

  if (first === 'tutorial') {
    return {
      title: 'SMILES tutorial — the notation, one step at a time',
      description:
        'A guided tour of the SMILES notation: atoms, bonds, branches, rings, aromaticity, charges and stereochemistry, each step drawn as you edit it.',
      canonicalPath: '/tutorial',
    };
  }

  if (first === 'reference') {
    return {
      title: 'SMILES and SMARTS cheatsheet',
      description:
        'Every construct of the SMILES and SMARTS notations in one printable table, each with the structure it draws and a note on what it matches.',
      canonicalPath: '/reference',
    };
  }

  if (first === 'specification') {
    return {
      title: 'The OpenSMILES specification',
      description:
        'The OpenSMILES specification, served in full with its drawings and its original anchors, so the definition of the notation stays readable and citable.',
      canonicalPath: '/specification',
    };
  }

  return {
    title: 'SMILES converter — draw a structure, read its SMILES',
    description:
      'Convert between chemical structures and SMILES in both directions: draw a molecule and read its notation, or paste a SMILES and see what it draws. Runs entirely in the browser.',
    canonicalPath: '/',
  };
}

function trimTrailingSlash(value: string): string {
  return value.length > 1 && value.endsWith('/') ? value.slice(0, -1) : value;
}

/** The origin comes from the Host header, so it is never trusted. */

/**
 * Every address the site answers, and what each one is called. The build writes
 * one file per entry and lists them all in the sitemap. `/search` is left out
 * on purpose: it is the list page under a second name, and the two would read
 * as duplicate content.
 * @returns Every page, the converter first.
 */
export function everyPage(): PageMeta[] {
  return [
    '/',
    '/lists',
    '/exercises',
    '/tutorial',
    '/reference',
    '/specification',
  ].map((path) => pageMetaFor(path));
}

/**
 * What the tab says on the page currently open.
 * @param pathname - The path of the address.
 * @returns The title, site name included.
 */
export function documentTitle(pathname: string): string {
  return `${pageMetaFor(pathname).title} — ${SITE_NAME}`;
}
