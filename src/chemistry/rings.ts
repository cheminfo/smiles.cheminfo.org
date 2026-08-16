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
  const smallRings = ringSet.getSize();

  const members: string[][] = Array.from(
    { length: copy.getAllAtoms() },
    () => [],
  );
  for (let atom = 0; atom < copy.getAllAtoms(); atom++) {
    for (let ring = 0; ring < smallRings; ring++) {
      if (ringSet.isAtomMember(ring, atom)) {
        members[atom]?.push(String(ring + 1));
      }
    }
  }

  // openchemlib's ring set holds the *small* rings — seven atoms at most — so
  // a macrocycle is in no ring of it at all. Left there, cyclododecane paints
  // twelve ring bonds and numbers none of them, which reads as a bug rather
  // than as a limit. Every ring atom the set missed is gathered into its own
  // ring instead, so what is painted is what is numbered.
  const ringCount = numberLargeRings(copy, members, smallRings);
  const separator = ringCount > 9 ? ',' : '';

  for (let atom = 0; atom < copy.getAllAtoms(); atom++) {
    const rings = members[atom] ?? [];
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

/**
 * Give every ring atom the small ring set missed a number of its own.
 *
 * Such atoms are walked through their ring bonds: one connected run of them is
 * one macrocycle, which is what a chemist would call it.
 * @param molecule - The copy being annotated.
 * @param members - Which rings each atom is in, added to in place.
 * @param smallRings - How many rings the ring set already numbered.
 * @returns The total number of rings, large ones included.
 */
function numberLargeRings(
  molecule: Molecule,
  members: string[][],
  smallRings: number,
): number {
  let ringCount = smallRings;

  for (let start = 0; start < molecule.getAllAtoms(); start++) {
    if (!molecule.isRingAtom(start) || (members[start]?.length ?? 0) > 0) {
      continue;
    }

    ringCount++;
    const label = String(ringCount);
    const queue = [start];
    members[start]?.push(label);

    while (queue.length > 0) {
      const atom = queue.pop() as number;
      for (let index = 0; index < molecule.getConnAtoms(atom); index++) {
        const next = molecule.getConnAtom(atom, index);
        if (
          !molecule.isRingBond(molecule.getConnBond(atom, index)) ||
          !molecule.isRingAtom(next) ||
          (members[next]?.length ?? 0) > 0
        ) {
          continue;
        }
        members[next]?.push(label);
        queue.push(next);
      }
    }
  }

  return ringCount;
}
