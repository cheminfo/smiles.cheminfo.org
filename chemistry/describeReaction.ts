import type { Reaction } from 'openchemlib';
import { ReactionEncoder } from 'openchemlib';

import type { ReadReaction } from './parseReaction.ts';
import type { ReactionStructure } from './types.ts';

/**
 * Write a reaction every way at once, the way {@link describeMolecule} does
 * for a molecule.
 * @param read - The reaction and the notation it was read as, or a bare
 * reaction when nothing read it from text.
 * @returns Every representation, with the component counts.
 */
export function describeReaction(
  read: ReadReaction | Reaction,
): ReactionStructure {
  const { reaction, format } = 'reaction' in read ? read : normalize(read);
  return {
    smiles: reaction.toSmiles(),
    idCode: encodeReaction(reaction),
    rxn: reaction.toRxn(),
    reactants: reaction.getReactants(),
    catalysts: reaction.getCatalysts(),
    products: reaction.getProducts(),
    isMapped: reaction.getHighestMapNo() > 0,
    isQuery: reaction.isFragment(),
    readAs: format,
  };
}

/**
 * The reaction as an idCode, with everything in it.
 *
 * The default encoding leaves the catalysts out, so a reaction written with a
 * reagent between its arrows would come back without one — the mode is
 * therefore always given.
 * @param reaction - The reaction to encode.
 * @returns The idCode, coordinates and mapping included.
 */
export function encodeReaction(reaction: Reaction): string {
  return (
    ReactionEncoder.encode(reaction, { mode: ReactionEncoder.INCLUDE_ALL }) ??
    ''
  );
}

function normalize(reaction: Reaction): ReadReaction {
  return { reaction, format: 'smiles' };
}
