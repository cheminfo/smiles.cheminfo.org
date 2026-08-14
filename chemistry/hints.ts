import type { Molecule } from 'openchemlib';
import { CanonizerUtil } from 'openchemlib';

/** How many atoms of one element are at stake. */
export interface ElementCount {
  /** The element symbol. */
  element: string;
  /** How many of them, always one or more. */
  count: number;
}

/** What an answer's formula is short of, and what it has too much of. */
export interface FormulaDifference {
  /** What the answer itself reads as, written as a formula in Hill order. */
  given: string;
  /**
   * The atoms it is short of, element by element rather than as a formula:
   * `CO3` written out reads as carbonate, where `1 C and 3 O` reads as what it
   * is. Empty when the answer is short of nothing.
   */
  missing: ElementCount[];
  /** The atoms it has too many of, the same way. */
  extra: ElementCount[];
}

/**
 * What to tell someone whose structure would not parse.
 *
 * The parser says where it gave up and, in its own words, why — `dangling ring
 * closure: 1` is exact and means nothing to a student. This turns the handful
 * of failures a beginner actually hits into the rule that was broken, with the
 * shape of the fix in it.
 * @param message - The cleaned parser message, from `structureError`.
 * @returns The advice, or undefined when the message stands on its own.
 */
export function parseHint(message: string): string | undefined {
  const text = message.toLowerCase();
  for (const { match, hint } of PARSE_HINTS) {
    if (text.includes(match)) return hint;
  }
  return undefined;
}

/**
 * How the answer's formula differs from the one asked for.
 *
 * Not the two formulas side by side: what is missing and what is in excess,
 * because "you are one oxygen short" is a thing to go and look for, while two
 * formulas are a puzzle to solve first. Hydrogens are counted as the structure
 * implies them, which is what makes a missing bond show up as two hydrogens too
 * many rather than as nothing at all.
 * @param given - The student's structure.
 * @param expected - The question's own answer.
 * @returns The difference, or null when the two formulas agree.
 */
export function formulaDifference(
  given: Molecule,
  expected: Molecule,
): FormulaDifference | null {
  const mine = elementCounts(given);
  const theirs = elementCounts(expected);

  const missing = new Map<string, number>();
  const extra = new Map<string, number>();
  for (const element of new Set([...mine.keys(), ...theirs.keys()])) {
    const difference = (mine.get(element) ?? 0) - (theirs.get(element) ?? 0);
    if (difference > 0) extra.set(element, difference);
    if (difference < 0) missing.set(element, -difference);
  }
  if (missing.size === 0 && extra.size === 0) return null;

  return {
    given: writeFormula(mine),
    missing: listElements(missing),
    extra: listElements(extra),
  };
}

/**
 * Whether two structures are tautomers of one another.
 *
 * A student who moved a hydrogen and a double bond has drawn a real molecule
 * that is a real answer to a different question, and telling them "a different
 * molecule" sends them back to redraw the whole thing. openchemlib canonicalises
 * a structure with its mobile hydrogens set free, which is what recognises the
 * pair.
 * @param one - A structure.
 * @param other - Another.
 * @returns Whether they share a tautomer identity.
 */
export function isSameTautomer(one: Molecule, other: Molecule): boolean {
  try {
    return (
      CanonizerUtil.getIDCode(one, CanonizerUtil.NOSTEREO_TAUTOMER) ===
      CanonizerUtil.getIDCode(other, CanonizerUtil.NOSTEREO_TAUTOMER)
    );
  } catch {
    return false;
  }
}

/**
 * Every element of a structure, hydrogens included.
 *
 * An explicit hydrogen is skipped as an atom of its own and counted on the atom
 * it hangs from, which is where `getAllHydrogens` already puts it — otherwise
 * `[H]C([H])([H])[H]` would come out as CH8.
 * @param molecule - The structure. It is not modified.
 * @returns How many of each element it holds.
 */
function elementCounts(molecule: Molecule): Map<string, number> {
  const counts = new Map<string, number>();
  const add = (element: string, howMany: number) => {
    if (howMany > 0) counts.set(element, (counts.get(element) ?? 0) + howMany);
  };

  for (let atom = 0; atom < molecule.getAllAtoms(); atom++) {
    const element = molecule.getAtomLabel(atom);
    if (element === 'H') continue;
    add(element, 1);
    add('H', molecule.getAllHydrogens(atom));
  }
  return counts;
}

/**
 * A set of element counts written the way a chemist writes one: carbon,
 * hydrogen, then the rest in alphabetical order.
 * @param counts - How many of each element.
 * @returns The formula, empty when there is nothing to write.
 */
/**
 * A set of element counts as a list, in the order a formula would put them.
 * @param counts - How many of each element.
 * @returns One entry per element.
 */
function listElements(counts: Map<string, number>): ElementCount[] {
  return [...counts.keys()]
    .toSorted(hillOrder)
    .map((element) => ({ element, count: counts.get(element) ?? 0 }));
}

function writeFormula(counts: Map<string, number>): string {
  const elements = [...counts.keys()].toSorted(hillOrder);
  let formula = '';
  for (const element of elements) {
    const count = counts.get(element) ?? 0;
    formula += count === 1 ? element : `${element}${count}`;
  }
  return formula;
}

function hillOrder(one: string, other: string): number {
  return hillRank(one) - hillRank(other) || one.localeCompare(other);
}

function hillRank(element: string): number {
  return element === 'C' ? 0 : element === 'H' ? 1 : 2;
}

/**
 * The failures a beginner actually hits, in the parser's words. Matched on a
 * fragment rather than the whole sentence: openchemlib names the ring number or
 * the character it stopped on inside the message, and its capitalisation is not
 * consistent from one message to the next.
 */
const PARSE_HINTS: ReadonlyArray<{ match: string; hint: string }> = [
  {
    match: 'dangling ring closure',
    hint: 'A ring was opened and never closed. Every ring-closure digit appears twice, once at each end of the bond that shuts the ring: cyclohexane is C1CCCCC1.',
  },
  {
    match: 'dangling open bond',
    hint: 'A bond symbol has nothing after it. =, # and - sit between two atoms: CC=O, never CC=.',
  },
  {
    match: 'unknown element label',
    hint: 'That is not an element symbol. A two-letter symbol is a capital then a lower case (Cl, Br, Si), and a lone lower-case letter means an aromatic atom (c, n, o, s). Anything else — X, R, Q — has to go in brackets.',
  },
  {
    match: 'unknown atom label',
    hint: 'The symbol inside the brackets is not an element. Write [NH4+], [13C], [Fe+2] — the symbol first, then the hydrogens, the charge and the isotope.',
  },
  {
    match: "closing ')' without opening counterpart",
    hint: 'There is a ) with no ( to match it. Every branch opens and closes: CC(=O)O has one branch, =O.',
  },
  {
    match: 'closing bracket',
    hint: 'There is a ] with no [ to match it. Brackets only wrap one atom: [NH4+].',
  },
  {
    match: 'unexpected character inside brackets',
    hint: 'A bracket atom was never closed, or holds something it cannot. Everything about one atom goes inside its own [ ]: [C@@H], [O-], [15n].',
  },
  {
    match: 'atom label must be enclosed in brackets',
    hint: 'That element has to be written in brackets: only B, C, N, O, P, S, F, Cl, Br and I may be written bare.',
  },
];
