import { readStructure } from '../../../../chemistry/parse.ts';

/**
 * How many atoms a notation reads as. A notation that does not read at all
 * counts zero rather than throwing, so a caller can report which entry of which
 * file stopped reading instead of losing the whole run to the first bad one.
 * @param notation - One structure, in whatever the content wrote.
 * @returns The atom count, zero when it could not be read.
 */
export function atomsOf(notation: string): number {
  try {
    return readStructure(notation).molecule.getAllAtoms();
  } catch {
    return 0;
  }
}

/**
 * Whether a notation reads. A reaction is read one component at a time: the
 * shipped content states reactions as `reactants>agents>products`, and the
 * whole point of checking it is that every side of every arrow parses.
 * @param notation - A structure, a query, or a reaction.
 * @returns True when it — and each of its components — holds at least one atom.
 */
export function parsesNotation(notation: string): boolean {
  if (!notation.includes('>')) return atomsOf(notation) > 0;
  return notation
    .split('>')
    .filter(Boolean)
    .every((side) =>
      side.split('.').every((component) => atomsOf(component) > 0),
    );
}
