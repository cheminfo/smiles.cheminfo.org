import { Molecule, SmilesParser } from 'openchemlib';
import { readStructure as classifyStructure } from 'react-cheminfo/structure';

import type { InputFormat } from './types.ts';

export { looksLikeSmarts } from 'react-cheminfo/structure';

/** How a piece of text turned out to be written. */
export type ReadFormat = 'smiles' | 'smarts' | 'molfile' | 'idcode';

/** A structure, and how it had to be read to get there. */
export interface ReadStructure {
  molecule: Molecule;
  format: ReadFormat;
}

/**
 * Read a structure, and say how it was read.
 *
 * openchemlib's own `smartsMode: 'guess'` is not enough on its own: it reads
 * `[CX3](=O)[OX2H1]` as a fragment but throws the `X` counts away, so a
 * carboxylic acid query silently becomes "any carbon between two oxygens".
 * The mode is therefore chosen here, from syntax only a SMARTS has, and the
 * parser is told outright.
 * @param text - The structure, as typed or pasted.
 * @param format - How to read it; `auto` decides.
 * @returns The molecule and the notation it was read as.
 * @throws When the text is empty or the parser refuses it.
 */
export function readStructure(
  text: string,
  format: InputFormat = 'auto',
): ReadStructure {
  const input = text.trim();
  if (!input) throw new Error('There is nothing to read.');

  switch (format) {
    case 'molfile':
      // The raw text, never the trimmed one: the first line of a molfile is
      // its title and is very often blank, so trimming shifts every line up
      // and the counts line is read as an atom.
      return { molecule: Molecule.fromMolfile(text), format: 'molfile' };
    case 'idcode':
      return { molecule: parseIdCode(input), format: 'idcode' };
    case 'smiles':
      return { molecule: parseSmiles(input, 'smiles'), format: 'smiles' };
    case 'smarts':
      return { molecule: parseSmiles(input, 'smarts'), format: 'smarts' };
    case 'auto':
      return parseAuto(input, text);
    // no default
  }
}

/**
 * Read a structure when only the molecule is wanted.
 * @param text - The structure, as typed or pasted.
 * @param format - How to read it; `auto` decides.
 * @returns The molecule; query features are kept, so `isFragment()` says which it was.
 * @throws When the text is empty or the parser refuses it.
 */
export function parseStructure(
  text: string,
  format: InputFormat = 'auto',
): Molecule {
  return readStructure(text, format).molecule;
}

/**
 * Read whatever was pasted: a molfile, an idCode, or a line notation that may
 * be a SMILES or a SMARTS.
 * @param input - The trimmed structure, which is what a line notation needs.
 * @param raw - The text exactly as it arrived, which is what a molfile needs.
 * @returns The molecule and the notation it was read as.
 */
function parseAuto(input: string, raw: string): ReadStructure {
  const sniffed = classifyStructure(raw);
  if (sniffed.kind === 'molfile') {
    return { molecule: Molecule.fromMolfile(sniffed.value), format: 'molfile' };
  }

  const format: ReadFormat = sniffed.kind === 'smarts' ? 'smarts' : 'smiles';
  try {
    return { molecule: parseSmiles(input, format), format };
  } catch (error) {
    // An idCode is a short run of the same characters a SMILES uses, so it can
    // only be recognised by having parsed: it is tried once the line notation
    // has failed, and the notation's error is what the page reports.
    try {
      return { molecule: parseIdCode(input), format: 'idcode' };
    } catch {
      throw error;
    }
  }
}

function parseSmiles(input: string, smartsMode: 'smiles' | 'smarts'): Molecule {
  const parser = new SmilesParser({ smartsMode });
  return parser.parseMolecule(input);
}

/**
 * Read an idCode, which openchemlib writes with the coordinates after a space.
 * @param input - The trimmed idCode, coordinates included or not.
 * @returns The molecule.
 */
function parseIdCode(input: string): Molecule {
  const [idCode = '', coordinates] = input.split(' ');
  const molecule = decodeIdCode(idCode, coordinates);
  if (molecule.getAllAtoms() === 0) {
    throw new Error('This idCode holds no atoms.');
  }
  // The decoder reads the string as packed bits and does not check them, so a
  // typo decodes rather than failing: `ZZZ` comes back as thirty-seven
  // disconnected carbons. A real idCode is what the encoder would have
  // written, so encoding it again is the check — and it is the difference
  // between a mistyped SMILES being reported and it silently becoming a
  // molecule nobody meant.
  if (molecule.getIDCode() !== idCode) {
    throw new Error('This is not an idCode.');
  }
  return molecule;
}

function decodeIdCode(idCode: string, coordinates?: string): Molecule {
  try {
    return Molecule.fromIDCode(idCode, coordinates);
  } catch (error) {
    // The decoder reads the string as packed bits rather than checking it, so
    // anything that is not an idCode fails somewhere inside the generated code
    // with a message about a missing property. There is nothing to report but
    // that it was not an idCode.
    throw new Error('This is not an idCode.', { cause: error });
  }
}
