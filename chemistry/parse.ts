import { Molecule, SmilesParser } from 'openchemlib';

import type { InputFormat } from './types.ts';

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
 * Whether a line notation uses syntax that exists in SMARTS and not in SMILES.
 *
 * Only the inside of a bracket atom is inspected for the primitives, because
 * `#` is a triple bond outside one and `D`, `X`, `R`, `v` and `h` are the
 * start of real element symbols. `~`, `&`, `,`, `;`, `!` and `$(` are SMARTS
 * anywhere they appear.
 * @param text - The line notation.
 * @returns True when it can only be a query.
 */
export function looksLikeSmarts(text: string): boolean {
  if (/[~&;,!]/.test(text) || text.includes('$(')) return true;
  for (const match of text.matchAll(/\[(?<atom>[^\]]*)\]/g)) {
    const atom = match.groups?.atom ?? '';
    // #6 (atomic number), X3 / D2 / R1 / r5 / v4 / h1 / x2 (counts), and the
    // a / A wildcards. A digit is required after the letter, so [Xe] and [Rn]
    // stay elements.
    if (/#\d|[DXRrvhx]\d|^\*|[aA](?![a-z])/.test(atom)) return true;
  }
  return /(?:^|[^A-Za-z])[aA](?![a-z])/.test(
    text.replaceAll(/\[[^\]]*\]/g, ''),
  );
}

/**
 * Whether a string looks like a molfile rather than a line notation. A molfile
 * is several lines and carries a counts line; a SMILES never contains a
 * newline.
 * @param text - The structure, as typed or pasted.
 * @returns True when it should be read as a molfile.
 */
export function looksLikeMolfile(text: string): boolean {
  const lines = text.trim().split('\n');
  if (lines.length < 4) return false;
  return lines.some((line) => line.includes('V2000') || line.includes('V3000'));
}

/**
 * Read whatever was pasted: a molfile, an idCode, or a line notation that may
 * be a SMILES or a SMARTS.
 * @param input - The trimmed structure, which is what a line notation needs.
 * @param raw - The text exactly as it arrived, which is what a molfile needs.
 * @returns The molecule and the notation it was read as.
 */
function parseAuto(input: string, raw: string): ReadStructure {
  if (looksLikeMolfile(input)) {
    return { molecule: Molecule.fromMolfile(raw), format: 'molfile' };
  }

  const format: ReadFormat = looksLikeSmarts(input) ? 'smarts' : 'smiles';
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
  const [idCode, coordinates] = input.split(' ');
  const molecule = decodeIdCode(idCode ?? '', coordinates);
  if (molecule.getAllAtoms() === 0) {
    throw new Error('This idCode holds no atoms.');
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
