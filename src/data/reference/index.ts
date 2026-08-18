import { SMARTS_SECTIONS } from './smarts.ts';
import { SMILES_SECTIONS } from './smiles.ts';
import type { Notation, ReferenceSection } from './types.ts';

export type { Notation, ReferenceEntry, ReferenceSection } from './types.ts';
export { SMARTS_SECTIONS } from './smarts.ts';
export { SMILES_SECTIONS } from './smiles.ts';

/** Both sheets in reading order, the section they share said once. */
export const REFERENCE_SECTIONS: ReferenceSection[] = referenceSectionsFor([
  'smiles',
  'smarts',
]);

/**
 * The sheets a page — or an exercise — needs.
 *
 * A student writing the SMILES of a drawn molecule is not helped by a column of
 * recursive SMARTS, and a student writing a query needs both notations, because
 * a SMARTS is read against the same characters a SMILES is written with. The
 * section the two sheets share is listed once however many notations are asked
 * for, so nothing is shown twice.
 * @param notations - The notations to keep, in the order they are read.
 * @returns Their sections, each once, in sheet order.
 */
export function referenceSectionsFor(
  notations: Notation[],
): ReferenceSection[] {
  const sections: ReferenceSection[] = [];
  for (const notation of notations) {
    const sheet = notation === 'smiles' ? SMILES_SECTIONS : SMARTS_SECTIONS;
    for (const section of sheet) {
      if (!sections.includes(section)) sections.push(section);
    }
  }
  return sections;
}
