import type { Page } from './router.ts';
import type { HideKey, ShareConfig } from './shareConfig.ts';

export interface ShareFeature {
  key: HideKey;
  /** Named positively: the dialog shows a checked box for what stays visible. */
  label: string;
  /** What switching it off does, for the person building the link. */
  description: string;
  /**
   * Off in a link that was not touched: what a page framed in a course has no
   * use for.
   * @default false
   */
  hiddenByDefault?: boolean;
}

export interface PageShareOptions {
  /** How the page is named in the dialog and in the iframe title. */
  title: string;
  features: ShareFeature[];
  /** Whether the dialog offers to pick the exercises the link hands out. */
  hasExercises: boolean;
}

/**
 * What the share dialog can configure on a page.
 * @param page - The page currently open.
 * @returns Its title, the parts it can switch off, and whether it carries a set.
 */
export function shareOptionsOf(page: Page): PageShareOptions {
  return PAGES[page];
}

/**
 * The link the dialog offers before anything is ticked: framed, with the parts
 * a course has no use for already switched off.
 * @param options - What the page can configure.
 * @returns The configuration to start from.
 */
export function defaultShareConfig(options: PageShareOptions): ShareConfig {
  const hidden: HideKey[] = [];
  for (const feature of options.features) {
    if (feature.hiddenByDefault) hidden.push(feature.key);
  }
  return { embed: true, hidden };
}

const CONVERTER: ShareFeature[] = [
  {
    key: 'kinds',
    label: 'The molecule / query / reaction tabs',
    description:
      'The strip that says what the box holds. Hiding it leaves the visitor on the tab your link opens.',
  },
  {
    key: 'editor',
    label: 'The drawing canvas',
    description:
      'Half of the converter. Hide it for a frame that only reads SMILES out loud.',
  },
  {
    key: 'formats',
    label: 'Every other notation',
    description:
      'The Kekulé form, the SMARTS, the idCode and the molfile under the SMILES.',
    hiddenByDefault: true,
  },
  {
    key: 'examples',
    label: 'The example molecules',
    description: 'The menu that replaces what is on screen with a known one.',
  },
];

const LISTS: ShareFeature[] = [
  {
    key: 'load',
    label: 'The list itself',
    description:
      'The box a list is pasted or dropped into, and the Convert button. Hiding it leaves the visitor searching the list your link loaded.',
  },
  {
    key: 'options',
    label: 'Conversion and search options',
    description:
      'What the list is read as and written as, and how a query matches. A hidden option still applies.',
    hiddenByDefault: true,
  },
  {
    key: 'export',
    label: 'Download the result',
    description:
      'The buttons that hand the list — or whatever the query kept — back as SMILES, CSV or an SDF.',
  },
];

// Not the list of exercises: a link handing out a single one leaves it out by
// itself, and any other link needs it to reach the rest.
const EXERCISES: ShareFeature[] = [
  {
    key: 'sets',
    label: 'The other sets',
    description:
      'The capsules above the list, which walk from one set to the next. Hiding them leaves the link on the set it names.',
  },
  {
    key: 'hints',
    label: 'Hints',
    description: 'The hint ladder, revealed one rung at a time.',
  },
  {
    key: 'check',
    label: 'The running check',
    description:
      'Whether the draft reads as a structure, and whether its atoms add up. It never says the answer is right.',
  },
  {
    key: 'answers',
    label: 'Give up and see the answer',
    description:
      'The correction. Hiding it leaves getting it right as the only way through.',
  },
  {
    key: 'clear',
    label: 'Clear the answers',
    description:
      'The buttons that forget what was done, for one exercise and for all of them.',
  },
];

const SPECIFICATION: ShareFeature[] = [
  {
    key: 'list',
    label: 'The table of contents',
    description:
      'The column on the left. Hide it for a frame pointing at one section.',
  },
];

const PAGES: Record<Page, PageShareOptions> = {
  converter: {
    title: 'Converter',
    features: CONVERTER,
    hasExercises: false,
  },
  lists: {
    title: 'Lists & search',
    features: LISTS,
    hasExercises: false,
  },
  exercises: {
    title: 'Exercises',
    features: EXERCISES,
    hasExercises: true,
  },
  tutorial: {
    title: 'Tutorial',
    features: [],
    hasExercises: false,
  },
  smiles: {
    title: 'SMILES sheet',
    features: [],
    hasExercises: false,
  },
  smarts: {
    title: 'SMARTS sheet',
    features: [],
    hasExercises: false,
  },
  specification: {
    title: 'Specification',
    features: SPECIFICATION,
    hasExercises: false,
  },
  about: {
    title: 'About',
    features: [],
    hasExercises: false,
  },
};
