import type { Molecule } from 'openchemlib';

import { describeMolecule } from './describe.ts';
import { structureError } from './errorMessage.ts';
import { readStructure } from './parse.ts';
import type { InputFormat, Structure, StructureError } from './types.ts';

/** What the page knows about the text in the input box. */
export type ReadResult =
  | { ok: true; molecule: Molecule; structure: Structure }
  | { ok: false; error: StructureError }
  | { ok: null };

/**
 * Read what is in an input box. Everything the site does with a structure runs
 * here, in the browser, on the same openchemlib the API uses — nothing is sent
 * anywhere.
 *
 * An empty box is neither a success nor a failure: it is the third answer, so
 * a page can tell "nothing typed yet" from "typed something wrong" and only
 * shout about the second.
 * @param text - The contents of the box.
 * @param format - How to read it; `auto` decides.
 * @returns The structure, the reason it could not be read, or nothing at all.
 */
export function readInput(
  text: string,
  format: InputFormat = 'auto',
): ReadResult {
  if (!text.trim()) return { ok: null };
  try {
    const read = readStructure(text, format);
    return {
      ok: true,
      molecule: read.molecule,
      structure: describeMolecule(read),
    };
  } catch (error) {
    return { ok: false, error: structureError(error) };
  }
}
