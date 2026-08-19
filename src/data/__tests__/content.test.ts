import { Molecule } from 'openchemlib';
import { expect, test } from 'vitest';

import { describeReaction } from '../../chemistry/describeReaction.ts';
import { readStructure } from '../../chemistry/parse.ts';
import {
  looksLikeReaction,
  readReaction,
} from '../../chemistry/parseReaction.ts';
import { difficultyOf, validate } from '../../exercises/validate.ts';
import {
  EXAMPLE_MOLECULES,
  EXAMPLE_QUERIES,
  EXAMPLE_REACTIONS,
} from '../examples.ts';
import { EXERCISES_BY_ID, EXERCISE_SETS } from '../exercises.ts';
import { GLOSSARY } from '../glossary.ts';
import {
  REFERENCE_SECTIONS,
  SMARTS_SECTIONS,
  SMILES_SECTIONS,
  referenceSectionsFor,
} from '../reference/index.ts';
import { SMILES_VS_SMARTS } from '../reference/shared.ts';
import { LIBRARY_SAMPLE } from '../samples/library.ts';
import { TUTORIAL_LEVEL_LABELS, TUTORIAL_STEPS } from '../tutorial.ts';

import { parsesNotation } from './parsing.ts';

/**
 * A notation the specification allows and openchemlib does not implement.
 * These are documented on purpose — the cheatsheet says what SMILES is, not
 * what this toolkit happens to support — so they are listed here rather than
 * removed, and the list is deliberately short and explicit: anything else that
 * stops parsing is a defect this suite must catch.
 */
const UNPARSEABLE_BY_DESIGN = new Set([
  // Atom primitives openchemlib does not implement: the aromatic and aliphatic
  // wildcards, the aromatic-hydrogen count, ring size, and ring connectivity.
  '[a]',
  '[A]',
  '[nh1]',
  '[r6]',
  '[cx3]',
  // Negated ring membership.
  '[!C;!R0]',
  // The "or unspecified" chirality and atom-map forms.
  'C[C@?H](F)O',
  '[C:?1]>>[C:?1]',
  // A recursive SMARTS followed by another one, or by an alternation.
  'C[$(aaO);$(aaaN)]',
  '[$([OX2H]),$([OX1-])]',
  '[CX3](=O)[OX1H0-,OX2H1]',
  '[$([NX3](=O)=O),$([NX3+](=O)[O-])]',
  '[!H0;#7,#8,#9]',
  '[!$(*#*)&!D1]-!@[!$(*#*)&!D1]',
]);

test('every tutorial step carries a structure that parses', () => {
  expect(TUTORIAL_STEPS.length).toBeGreaterThanOrEqual(14);
  for (const step of TUTORIAL_STEPS) {
    const notation = step.smiles;
    expect(parsesNotation(notation), `${step.title}: ${notation}`).toBe(true);
  }
});

test('every tutorial level is used, and every step has one', () => {
  const levels = new Set(Object.keys(TUTORIAL_LEVEL_LABELS));
  const used = new Set(TUTORIAL_STEPS.map((step) => step.level));
  expect([...used].toSorted()).toStrictEqual([...levels].toSorted());
});

test('every glossary marker in the tutorial resolves', () => {
  const unresolved: string[] = [];
  for (const step of TUTORIAL_STEPS) {
    for (const match of step.description.matchAll(/\[\[(?<term>[^\]]+)\]\]/g)) {
      const term = (match.groups?.term ?? '').toLowerCase();
      if (!GLOSSARY[term]) unresolved.push(`${step.title}: ${term}`);
    }
  }
  expect(unresolved).toStrictEqual([]);
});

test('every glossary example parses', () => {
  expect(Object.keys(GLOSSARY).length).toBeGreaterThanOrEqual(35);
  for (const [term, entry] of Object.entries(GLOSSARY)) {
    expect(entry.examples.length, `${term} has no example`).toBeGreaterThan(0);
    for (const example of entry.examples) {
      const notation = example.smiles;
      expect(parsesNotation(notation), `${term}: ${notation}`).toBe(true);
    }
  }
});

test('every cheatsheet example parses, or is one of the known gaps', () => {
  const total = REFERENCE_SECTIONS.reduce(
    (count, section) => count + section.entries.length,
    0,
  );
  expect(total).toBeGreaterThanOrEqual(120);

  const unexpected: string[] = [];
  for (const section of REFERENCE_SECTIONS) {
    for (const entry of section.entries) {
      const notation = entry.exampleSmiles;
      if (!notation || UNPARSEABLE_BY_DESIGN.has(notation)) continue;
      if (!parsesNotation(notation)) {
        unexpected.push(`${section.id} / ${entry.syntax}: ${notation}`);
      }
    }
  }
  expect(unexpected).toStrictEqual([]);
});

test('every cheatsheet section carries an address of its own', () => {
  // The identifiers are what section links are written against, so a duplicate
  // or a character a fragment cannot carry breaks a link a teacher handed out.
  const ids = REFERENCE_SECTIONS.map((section) => section.id);
  expect(new Set(ids).size).toBe(ids.length);
  for (const id of ids) {
    expect(id, `${id} is not a plain anchor`).toMatch(/^[a-z][\da-z-]*$/);
  }
  expect(ids).toContain('smiles-atoms');
  expect(ids).toContain('smarts-logic');
});

test('each sheet holds its own notation and nothing of the other', () => {
  // The two sheets are two pages, and the whole point of splitting them is that
  // a student writing a molecule is never shown a query primitive as if it were
  // one of the notation's own constructs.
  const smiles = referenceSectionsFor(['smiles']);
  const smarts = referenceSectionsFor(['smarts']);
  expect(smiles).toStrictEqual(SMILES_SECTIONS);
  expect(smarts).toStrictEqual(SMARTS_SECTIONS);

  for (const section of smiles) {
    if (section === SMILES_VS_SMARTS) continue;
    expect(section.id.startsWith('smiles-'), section.id).toBe(true);
  }
  for (const section of smarts) {
    if (section === SMILES_VS_SMARTS) continue;
    expect(section.id.startsWith('smarts-'), section.id).toBe(true);
  }
  expect(smiles.map((section) => section.id)).toContain('smiles-rings');
  expect(smarts.map((section) => section.id)).toContain('smarts-logic');
});

test('the section the two sheets share is on both, and listed once', () => {
  // It is what neither sheet can say alone, so it is the same object on both —
  // and asking for both notations must not print it twice.
  expect(SMILES_SECTIONS).toContain(SMILES_VS_SMARTS);
  expect(SMARTS_SECTIONS).toContain(SMILES_VS_SMARTS);
  expect(
    REFERENCE_SECTIONS.filter((section) => section === SMILES_VS_SMARTS),
  ).toHaveLength(1);
  expect(referenceSectionsFor(['smiles', 'smarts'])).toStrictEqual(
    REFERENCE_SECTIONS,
  );
  expect(REFERENCE_SECTIONS).toHaveLength(
    SMILES_SECTIONS.length + SMARTS_SECTIONS.length - 1,
  );

  // Every row of it states both readings, because a row giving one of them is
  // the defect the section exists to correct.
  expect(SMILES_VS_SMARTS.entries.length).toBeGreaterThanOrEqual(14);
  for (const entry of SMILES_VS_SMARTS.entries) {
    expect(entry.summary, entry.syntax).toMatch(/SMILES/);
    expect(entry.summary, entry.syntax).toMatch(/SMARTS/);
  }
});

test('the known toolkit gaps are still gaps', () => {
  // If openchemlib gains one of these, the entry stops needing an exemption —
  // and this test is what says so rather than the exemption quietly rotting.
  for (const notation of UNPARSEABLE_BY_DESIGN) {
    expect(parsesNotation(notation), `${notation} now parses`).toBe(false);
  }
});

test('every example molecule parses and is named consistently', () => {
  for (const example of EXAMPLE_MOLECULES) {
    expect(parsesNotation(example.notation), example.name).toBe(true);
  }
});

test('every example query is read as a query and not as a molecule', () => {
  for (const example of EXAMPLE_QUERIES) {
    const molecule = readStructure(example.notation, 'smarts').molecule;
    expect(molecule.getAllAtoms(), example.name).toBeGreaterThan(0);
    expect(molecule.isFragment(), example.name).toBe(true);
  }
});

test('every example reaction parses, arrows and all', () => {
  for (const example of EXAMPLE_REACTIONS) {
    expect(looksLikeReaction(example.notation), example.name).toBe(true);
    const described = describeReaction(readReaction(example.notation));
    expect(described.reactants, example.name).toBeGreaterThan(0);
    expect(described.products, example.name).toBeGreaterThan(0);
  }
});

test('the example menus say what each tab is for', () => {
  // A tab whose menu is a copy of another tab's teaches nothing about the
  // difference between them, which is the whole point of the tabs.
  expect(EXAMPLE_QUERIES.length).toBeGreaterThanOrEqual(8);
  expect(EXAMPLE_REACTIONS.length).toBeGreaterThanOrEqual(8);
  const mapped = EXAMPLE_REACTIONS.filter(
    (example) => describeReaction(readReaction(example.notation)).isMapped,
  );
  expect(mapped.length).toBeGreaterThanOrEqual(1);
  const withAgent = EXAMPLE_REACTIONS.filter(
    (example) => describeReaction(readReaction(example.notation)).catalysts > 0,
  );
  expect(withAgent.length).toBeGreaterThanOrEqual(1);
});

test('the example glucose really is the beta anomer', () => {
  // PubChem CID 64689, beta-D-glucose.
  const reference = Molecule.fromSmiles(
    'C([C@@H]1[C@H]([C@@H]([C@H]([C@@H](O1)O)O)O)O)O',
  ).getIDCode();
  const glucose = EXAMPLE_MOLECULES.find((one) =>
    one.name.includes('glucopyranose'),
  );
  expect(glucose).toBeDefined();
  expect(Molecule.fromSmiles(glucose?.notation ?? '').getIDCode()).toBe(
    reference,
  );
});

test('the example L-alanine really is the L enantiomer', () => {
  // PubChem CID 5950, L-alanine.
  const reference = Molecule.fromSmiles('C[C@@H](C(=O)O)N').getIDCode();
  const alanine = EXAMPLE_MOLECULES.find((one) => one.name === 'L-alanine');
  expect(alanine).toBeDefined();
  expect(Molecule.fromSmiles(alanine?.notation ?? '').getIDCode()).toBe(
    reference,
  );
});

test('every exercise id is unique across every set', () => {
  const ids = EXERCISE_SETS.flatMap((set) =>
    set.exercises.map((exercise) => exercise.id),
  );
  expect(new Set(ids).size).toBe(ids.length);
  expect(EXERCISES_BY_ID.size).toBe(ids.length);

  // A link naming thirty questions carries thirty ids, so an id is a letter
  // and a number and never the name of the molecule.
  for (const id of ids) expect(id, id).toMatch(/^[wds]\d{1,3}$/);
});

test('every shipped set opens on its easiest question and ends on its hardest', () => {
  for (const set of EXERCISE_SETS) {
    const weights = set.exercises.map((exercise) => difficultyOf(exercise));
    for (let index = 1; index < weights.length; index++) {
      expect(weights[index], `${set.id} at ${index}`).toBeGreaterThanOrEqual(
        weights[index - 1] as number,
      );
    }
  }
});

test('every structure exercise accepts its own answer', () => {
  for (const exercise of EXERCISES_BY_ID.values()) {
    if (exercise.kind === 'smarts') continue;
    const answer =
      exercise.kind === 'draw'
        ? Molecule.fromSmiles(exercise.smiles).getIDCode()
        : exercise.smiles;
    expect(validate(exercise, answer).passed, exercise.id).toBe(true);
  }
});

test('every SMARTS exercise has at least one hint that names a working answer', () => {
  for (const exercise of EXERCISES_BY_ID.values()) {
    if (exercise.kind !== 'smarts') continue;
    expect(exercise.hints?.length, exercise.id).toBeGreaterThanOrEqual(2);
    expect(
      exercise.cases.some((one) => one.shouldMatch),
      exercise.id,
    ).toBe(true);
    expect(
      exercise.cases.some((one) => !one.shouldMatch),
      exercise.id,
    ).toBe(true);

    // The last hint is allowed to be almost the answer, and it has to be an
    // answer that works: a hint pointing at a primitive openchemlib does not
    // implement is worse than no hint.
    const last = exercise.hints?.at(-1) ?? '';
    const named = /Try (?<pattern>\S+)/.exec(last)?.groups?.pattern;
    const quoted = named?.replace(/[.,;]+$/, '');
    expect(quoted, `${exercise.id}: last hint names no pattern`).toBeDefined();
    expect(
      validate(exercise, quoted ?? '').passed,
      `${exercise.id}: ${quoted}`,
    ).toBe(true);
  }
});

/**
 * Named structures pinned against a reference written independently of the
 * shipped one — a different atom order, so a copied typo cannot agree with
 * itself. Every entry here was wrong at some point: eight amino acids shipped
 * as the D enantiomer under an L label, sucrose as its beta anomer, and three
 * exercises whose title named a different molecule from their structure.
 */
const NAMED_REFERENCES: Array<[string, string, string]> = [
  ['L-alanine', 'C[C@H](N)C(=O)O', 'N[C@@H](C)C(=O)O'],
  ['L-valine', 'CC(C)[C@H](N)C(=O)O', 'N[C@@H](C(C)C)C(=O)O'],
  ['L-leucine', 'CC(C)C[C@H](N)C(=O)O', 'N[C@@H](CC(C)C)C(=O)O'],
  ['L-serine', 'OC[C@H](N)C(=O)O', 'N[C@@H](CO)C(=O)O'],
  ['L-cysteine', 'SC[C@H](N)C(=O)O', 'N[C@@H](CS)C(=O)O'],
  ['L-glutamic acid', 'OC(=O)CC[C@H](N)C(=O)O', 'N[C@@H](CCC(=O)O)C(=O)O'],
  ['L-glutamine', 'NC(=O)CC[C@H](N)C(=O)O', 'N[C@@H](CCC(N)=O)C(=O)O'],
  ['L-lysine', 'NCCCC[C@H](N)C(=O)O', 'N[C@@H](CCCCN)C(=O)O'],
  ['L-tyrosine', 'N[C@@H](Cc1ccc(O)cc1)C(=O)O', 'OC(=O)[C@@H](N)Cc1ccc(O)cc1'],
  [
    'sucrose',
    'OC[C@H]1O[C@H](O[C@]2(CO)O[C@H](CO)[C@@H](O)[C@@H]2O)[C@H](O)[C@@H](O)[C@@H]1O',
    'C([C@@H]1[C@H]([C@@H]([C@H]([C@H](O1)O[C@]2([C@H]([C@@H]([C@H](O2)CO)O)O)CO)O)O)O)O',
  ],
];

test.each(NAMED_REFERENCES)(
  'the sample library ships the right %s',
  (name, shipped, reference) => {
    expect(Molecule.fromSmiles(shipped).getIDCode(), name).toBe(
      Molecule.fromSmiles(reference).getIDCode(),
    );
    // …and the library really is the string that was checked.
    expect(LIBRARY_SAMPLE, name).toContain(`${shipped} ${name}`);
  },
);

test.each([
  ['d12', 'CCC/C(C)=C/C(O)=O'],
  ['d23', 'c1ccc2cnncc2c1'],
  ['d25', 'C(CCCCC(=O)Cl)CCCC(=O)Cl'],
  ['d38', 'C1CC2CC1C=C2'],
])('exercise %s draws the molecule its title names', (id, reference) => {
  const exercise = EXERCISES_BY_ID.get(id);
  expect(exercise, id).toBeDefined();
  expect(exercise?.kind).toBe('draw');
  expect(
    Molecule.fromSmiles(
      exercise?.kind === 'draw' ? exercise.smiles : '',
    ).getIDCode(),
    `${id} ${exercise?.title}`,
  ).toBe(Molecule.fromSmiles(reference).getIDCode());
});

test('an exercise whose title says trans specifies the geometry', () => {
  // Without it a student who correctly draws the trans isomer is marked wrong,
  // because the target carries no configuration to match.
  for (const exercise of EXERCISES_BY_ID.values()) {
    if (exercise.kind === 'smarts') continue;
    if (!/\b(?:cis|trans|\(E\)|\(Z\))/i.test(exercise.title)) continue;
    expect(exercise.smiles, exercise.title).toMatch(/[/\\]/);
  }
});
