import { Molecule } from 'openchemlib';

import type { ReadFormat, ReadStructure } from './parse.ts';
import type { OutputFormat, Structure } from './types.ts';

/**
 * Write a structure every way at once. Both sides of the site work from this
 * one object: the converter shows all of it, the exercises compare one field
 * of it, and an export picks the one the file needs.
 * @param read - The molecule and the notation it was read as, or a bare
 * molecule when nothing read it from text.
 * @returns Every representation, with the counts and the masses.
 */
export function describeMolecule(read: ReadStructure | Molecule): Structure {
  const { molecule, format } = normalize(read);
  const { idCode, coordinates } = molecule.getIDCodeAndCoordinates();
  const formula = molecule.getMolecularFormula();
  return {
    smiles: molecule.toIsomericSmiles(),
    kekule: molecule.toIsomericSmiles({ kekulizedOutput: true }),
    smarts: molecule.toSmarts(),
    idCode,
    coordinates,
    molfile: molecule.toMolfile(),
    mf: formula.formula,
    mw: formula.relativeWeight,
    monoisotopicMass: formula.absoluteWeight,
    atoms: molecule.getAllAtoms(),
    bonds: molecule.getAllBonds(),
    isQuery: molecule.isFragment(),
    readAs: format,
  };
}

/**
 * One representation of a structure.
 * @param molecule - The parsed structure.
 * @param format - Which way to write it.
 * @returns The structure as text.
 */
export function writeMolecule(
  molecule: Molecule,
  format: OutputFormat,
): string {
  switch (format) {
    case 'kekule':
      return molecule.toIsomericSmiles({ kekulizedOutput: true });
    case 'smarts':
      return molecule.toSmarts();
    case 'idcode':
      return molecule.getIDCode();
    case 'molfile':
      return molecule.toMolfile();
    case 'molfileV3':
      return molecule.toMolfileV3();
    case 'smiles':
      return molecule.toIsomericSmiles();
    // no default
  }
}

/**
 * The string two structures are the same answer by.
 *
 * Not simply the idCode: an idCode records things a SMILES cannot say, so a
 * nitro group drawn as pentavalent nitrogen and the same group drawn as
 * `[N+]([O-])=O` have two idCodes and one SMILES. Grading on the raw idCode
 * would reject a student who drew the first and was shown the second. Writing
 * the molecule as a SMILES and reading it back puts every such pair through
 * the one normalisation this site is actually about — two answers are the same
 * when they write the same SMILES — which is also exactly what a student is
 * being taught to expect.
 * @param molecule - The parsed structure. It is not modified.
 * @returns The canonical identifier.
 */
export function identity(molecule: Molecule): string {
  // A query has no SMILES to round trip through: `toIsomericSmiles` writes one
  // anyway, quietly dropping every query feature, so two different patterns
  // would come back with the same identity. Its own idCode is the only honest
  // answer.
  if (molecule.isFragment()) return molecule.getIDCode();
  try {
    return Molecule.fromSmiles(molecule.toIsomericSmiles()).getIDCode();
  } catch {
    return molecule.getIDCode();
  }
}

/**
 * The string two structures are the same skeleton by, with the stereochemistry
 * set aside.
 *
 * Two answers that share this string and not their {@link identity} are the
 * same molecule drawn with a different configuration — a student who has the
 * constitution right and the wedge wrong, which is worth saying out loud rather
 * than reporting as a different molecule.
 * @param molecule - The parsed structure. It is not modified.
 * @returns The identifier of the structure without its stereochemistry.
 */
export function constitution(molecule: Molecule): string {
  const flat = molecule.getCompactCopy();
  flat.stripStereoInformation();
  return identity(flat);
}

function normalize(read: ReadStructure | Molecule): {
  molecule: Molecule;
  format: ReadFormat;
} {
  return 'molecule' in read
    ? read
    : { molecule: read, format: read.isFragment() ? 'smarts' : 'smiles' };
}
