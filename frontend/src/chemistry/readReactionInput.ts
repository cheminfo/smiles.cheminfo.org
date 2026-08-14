import type { Molecule, Reaction } from 'openchemlib';

import { describeMolecule } from '../../../chemistry/describe.ts';
import { describeReaction } from '../../../chemistry/describeReaction.ts';
import { structureError } from '../../../chemistry/errorMessage.ts';
import type { ReactionComponent } from '../../../chemistry/parseReaction.ts';
import {
  reactionComponents,
  readReaction,
} from '../../../chemistry/parseReaction.ts';
import type {
  ReactionInputFormat,
  ReactionStructure,
  Structure,
  StructureError,
} from '../../../chemistry/types.ts';

/** One component of a reaction, ready to be drawn and to be written out. */
export interface DescribedComponent {
  /**
   * Where it sits in the reaction. Two components of one reaction can be the
   * same molecule — a reagent used twice — so the position, and not the
   * structure, is what tells them apart.
   */
  id: string;
  role: ReactionComponent['role'];
  molecule: Molecule;
  structure: Structure;
}

/** What the page knows about a reaction in an input box. */
export type ReactionReadResult =
  | {
      ok: true;
      reaction: Reaction;
      structure: ReactionStructure;
      components: DescribedComponent[];
    }
  | { ok: false; error: StructureError }
  | { ok: null };

/**
 * Read what is in an input box as a reaction. Like every other conversion on
 * this site it runs in the browser, on openchemlib.
 *
 * The components are described here rather than on demand, because the page
 * draws each of them and states its formula: parsing once and handing the
 * molecules over is what keeps a redraw from reading the reaction again.
 * @param text - The contents of the box.
 * @param format - How to read it; `auto` decides.
 * @returns The reaction, the reason it could not be read, or nothing at all.
 */
export function readReactionInput(
  text: string,
  format: ReactionInputFormat = 'auto',
): ReactionReadResult {
  if (!text.trim()) return { ok: null };
  try {
    const read = readReaction(text, format);
    return {
      ok: true,
      reaction: read.reaction,
      structure: describeReaction(read),
      components: reactionComponents(read.reaction).map((component, index) => ({
        ...component,
        id: `${component.role}-${index}`,
        structure: describeMolecule(component.molecule),
      })),
    };
  } catch (error) {
    return { ok: false, error: structureError(error) };
  }
}
