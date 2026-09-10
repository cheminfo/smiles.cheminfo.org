import { signal } from '@preact/signals-react';
import type { ShareConfig, ShareVocabulary } from 'react-cheminfo/core';
import {
  EMBED_PARAM,
  HIDE_PARAM,
  isHidden as isPartHidden,
  parseShareConfig,
} from 'react-cheminfo/core';

/**
 * Every part of a page a shared link can switch off, with what switching it
 * off does — written for the person building the link rather than for the
 * visitor. The order is the one the dialog and `hide=` both use, so two people
 * who ticked the same boxes hand out the same link.
 *
 * This is the only place that knows those names. Components ask
 * {@link isHidden} and never read the address themselves.
 */
export const SHARE_VOCABULARY = {
  parts: [
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
    {
      key: 'list',
      label: 'The table of contents',
      description:
        'The column on the left. Hide it for a frame pointing at one section.',
    },
  ],
} as const satisfies ShareVocabulary;

/**
 * A part of a page a shared link switches off. A key a page does not know
 * about is simply ignored, so a link written for an older version of the site
 * still opens.
 */
export type HideKey = (typeof SHARE_VOCABULARY)['parts'][number]['key'];

/** Parameters that configure the page rather than feed the tool. */
export const SHARE_PARAM_KEYS = [EMBED_PARAM, HIDE_PARAM] as const;

/**
 * The configuration of the page currently open, read once from the address it
 * was opened with. Every address the application writes afterwards goes
 * through `navigate`, which keeps the parameters it does not know about, so a
 * reload — or a link copied out of the frame — restores the same page.
 */
export const shareConfig = signal<ShareConfig>(
  parseShareConfig(globalThis.location?.search ?? '', SHARE_VOCABULARY),
);

/**
 * Whether the page is framed by another site, such as a course on
 * learn.cheminfo.org, in which case the header is left out and the activity
 * takes the whole frame.
 * @returns True when the address asks for embed mode.
 */
export function isEmbedded(): boolean {
  return shareConfig.value.embed;
}

/**
 * Whether the link switches a part of the page off. A hidden control still
 * applies the value the link carries: hiding is about what a visitor may
 * change, not about what the page is working on.
 * @param key - The part to test.
 * @returns True when it must not be rendered.
 */
export function isHidden(key: HideKey): boolean {
  return isPartHidden(shareConfig.value, key);
}
