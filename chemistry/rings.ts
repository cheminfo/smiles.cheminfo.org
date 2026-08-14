import { Molecule } from 'openchemlib';

/** A structure marked up with the rings each of its atoms and bonds belongs to. */
export interface RingAnnotation {
  /**
   * A copy of the structure, carrying the ring numbers as custom atom labels.
   * A custom label is stored on the molecule itself, so the original is left
   * alone: the converter hands the same parsed molecule to several panels, and
   * one of them switching the numbers on must not write them into the others.
   */
  molecule: Molecule;
  /** Every bond that is part of a ring, which is what the drawing paints. */
  ringBonds: number[];
  /** How many rings were found. */
  ringCount: number;
}

/**
 * Number the rings of a structure and write on every atom the rings it is in.
 *
 * The numbers ride as custom atom labels beginning with `]`, which is
 * openchemlib's own way of saying "draw this above the atom rather than
 * instead of it" — so an atom shared by the first and the second ring reads
 * `12`, and a ring fusion is visible without painting anything. Past nine
 * rings the numbers are separated by a comma, because `12` would otherwise be
 * the twelfth ring as much as the first and the second.
 *
 * The rings are openchemlib's small ring set, so a bridged or a large ring
 * system is described by its smallest rings rather than by every cycle that
 * can be walked in it.
 * @param molecule - The structure to describe. It is not modified.
 * @returns The annotated copy, its ring bonds, and how many rings there are.
 */
export function annotateRings(molecule: Molecule): RingAnnotation {
  const copy = molecule.getCompactCopy();
  copy.ensureHelperArrays(Molecule.cHelperRings);
  const ringSet = copy.getRingSet();
  const ringCount = ringSet.getSize();
  const separator = ringCount > 9 ? ',' : '';

  for (let atom = 0; atom < copy.getAllAtoms(); atom++) {
    const rings: string[] = [];
    for (let ring = 0; ring < ringCount; ring++) {
      if (ringSet.isAtomMember(ring, atom)) rings.push(String(ring + 1));
    }
    if (rings.length > 0) {
      copy.setAtomCustomLabel(atom, `]${rings.join(separator)}`);
    }
  }

  const ringBonds: number[] = [];
  for (let bond = 0; bond < copy.getAllBonds(); bond++) {
    if (copy.isRingBond(bond)) ringBonds.push(bond);
  }

  return { molecule: copy, ringBonds, ringCount };
}
