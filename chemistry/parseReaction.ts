import type { Molecule } from 'openchemlib';
import { Reaction, ReactionEncoder, SmilesParser } from 'openchemlib';

import { looksLikeSmarts } from './parse.ts';
import type { ReactionInputFormat } from './types.ts';

/** How a piece of text turned out to hold a reaction. */
export type ReactionReadFormat = 'smiles' | 'rxn' | 'idcode';

/** A reaction, and how it had to be read to get there. */
export interface ReadReaction {
  reaction: Reaction;
  format: ReactionReadFormat;
}

/** One component of a reaction, and which side of the arrows it sits on. */
export interface ReactionComponent {
  role: 'reactant' | 'catalyst' | 'product';
  molecule: Molecule;
}

/**
 * Read a reaction, and say how it was read.
 *
 * The SMILES/SMARTS decision is made exactly as it is for a molecule — by
 * looking for syntax only a query has — because `Reaction.fromSmiles` reads
 * every component as a molecule and would quietly drop the query features of
 * a reaction pattern.
 * @param text - The reaction, as typed or pasted.
 * @param format - How to read it; `auto` decides.
 * @returns The reaction and the notation it was read as.
 * @throws When the text is empty or the parser refuses it.
 */
export function readReaction(
  text: string,
  format: ReactionInputFormat = 'auto',
): ReadReaction {
  const input = text.trim();
  if (!input) throw new Error('There is nothing to read.');

  switch (format) {
    case 'rxn':
      // The raw text: a reaction file starts with a header whose blank lines
      // count, exactly like the title line of a molfile.
      return { reaction: Reaction.fromRxn(text), format: 'rxn' };
    case 'idcode':
      return { reaction: parseReactionIdCode(input), format: 'idcode' };
    case 'smiles':
      return { reaction: parseReactionSmiles(input), format: 'smiles' };
    case 'auto':
      return parseAuto(input, text);
    // no default
  }
}

/**
 * Whether a line notation carries the two arrows a reaction is written with.
 *
 * `>` is only ever an arrow: no element, bond or query primitive uses it, so
 * one is enough to tell a reaction from a molecule — and a text with a single
 * arrow is a reaction someone mistyped, not a molecule.
 * @param text - The line notation.
 * @returns True when it is meant to be a reaction.
 */
export function looksLikeReaction(text: string): boolean {
  return !text.includes('\n') && text.includes('>');
}

/**
 * Whether a string is an MDL reaction file rather than a line notation.
 * @param text - The structure, as typed or pasted.
 * @returns True when it should be read as an RXN file.
 */
export function looksLikeRxnFile(text: string): boolean {
  return text.trimStart().startsWith('$RXN');
}

/**
 * The components of a reaction, in reading order, each as its own molecule.
 *
 * openchemlib puts every component of one side into a single molecule with
 * several disconnected fragments — `CC(=O)O.OCC` is one object — so the sides
 * are split here, because a page draws a reaction component by component.
 * @param reaction - The parsed reaction.
 * @returns Every component with the side it sits on.
 */
export function reactionComponents(reaction: Reaction): ReactionComponent[] {
  const components: ReactionComponent[] = [];
  collect(components, 'reactant', reaction.getReactants(), (index) =>
    reaction.getReactant(index),
  );
  collect(components, 'catalyst', reaction.getCatalysts(), (index) =>
    reaction.getCatalyst(index),
  );
  collect(components, 'product', reaction.getProducts(), (index) =>
    reaction.getProduct(index),
  );
  return components;
}

function collect(
  components: ReactionComponent[],
  role: ReactionComponent['role'],
  count: number,
  at: (index: number) => Molecule,
): void {
  for (let index = 0; index < count; index++) {
    for (const molecule of at(index).getFragments()) {
      components.push({ role, molecule });
    }
  }
}

/**
 * Read whatever was pasted: a reaction file, a reaction idCode, or a reaction
 * SMILES that may be a query.
 * @param input - The trimmed reaction, which is what a line notation needs.
 * @param raw - The text exactly as it arrived, which is what a reaction file needs.
 * @returns The reaction and the notation it was read as.
 */
function parseAuto(input: string, raw: string): ReadReaction {
  if (looksLikeRxnFile(input)) {
    return { reaction: Reaction.fromRxn(raw), format: 'rxn' };
  }
  if (!looksLikeReaction(input)) {
    // An idCode is the only reaction notation without an arrow, so it is what
    // an arrowless text can still be — and the arrow is what is missing when
    // it is not.
    return { reaction: parseReactionIdCode(input), format: 'idcode' };
  }
  return { reaction: parseReactionSmiles(input), format: 'smiles' };
}

function parseReactionSmiles(input: string): Reaction {
  const parser = new SmilesParser({
    smartsMode: looksLikeSmarts(input) ? 'smarts' : 'smiles',
  });
  const reaction = parser.parseReaction(input);
  if (reaction.isEmpty()) throw new Error('This reaction holds no atoms.');
  return reaction;
}

/**
 * Read a reaction idCode, which openchemlib writes as the components, their
 * coordinates and their mapping in one space-separated string.
 * @param input - The trimmed idCode.
 * @returns The reaction.
 * @throws When the string is not a reaction idCode.
 */
function parseReactionIdCode(input: string): Reaction {
  const reaction = decodeReaction(input);
  if (!reaction || reaction.isEmpty()) {
    throw new Error(
      'A reaction is written as reactants > agents > products, and this text has no arrow.',
    );
  }
  return reaction;
}

function decodeReaction(input: string): Reaction | null {
  try {
    return ReactionEncoder.decode(input, {
      mode: ReactionEncoder.INCLUDE_ALL,
    });
  } catch {
    // The decoder reads the string as an array of idCodes, so a text that is
    // not one at all fails inside the generated code rather than being
    // refused: there is nothing to report but that it was not an idCode.
    return null;
  }
}
