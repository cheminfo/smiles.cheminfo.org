import type { StructureKind } from '../../../chemistry/types.ts';

/** A structure the converter can be loaded with, to see the notation at work. */
export interface ExampleStructure {
  name: string;
  /** The SMILES, SMARTS or reaction SMILES the entry loads. */
  notation: string;
  /** What this one shows that the others do not. */
  note: string;
}

/**
 * The example menu. Every entry replaces what is on screen, and between them
 * they cover the whole notation: a chain, a ring, an aromatic ring, a
 * heteroaromatic, stereochemistry of both kinds, a charge, and a salt.
 */
export const EXAMPLE_MOLECULES: ExampleStructure[] = [
  {
    name: 'Ethanol',
    notation: 'CCO',
    note: 'Three atoms, no brackets: the organic subset at its plainest.',
  },
  {
    name: 'Benzene',
    notation: 'c1ccccc1',
    note: 'Lowercase atoms and one ring closure. Switch to the Kekulé form to see C1=CC=CC=C1.',
  },
  {
    name: 'Aspirin',
    notation: 'CC(=O)Oc1ccccc1C(=O)O',
    note: 'A branch, an ester, an aromatic ring and a carboxylic acid in twenty characters.',
  },
  {
    name: 'Caffeine',
    notation: 'Cn1cnc2c1c(=O)n(C)c(=O)n2C',
    note: 'Two fused rings, aromatic nitrogens, and ring closures that reopen.',
  },
  {
    name: 'L-alanine',
    notation: 'C[C@H](N)C(=O)O',
    note: 'One tetrahedral centre. Change @ to @@ and it becomes D-alanine.',
  },
  {
    name: 'Glycine, zwitterion',
    notation: 'C(C(=O)[O-])[NH3+]',
    note: 'Formal charges, which only a bracket atom can carry.',
  },
  {
    name: 'Fumaric acid (E)',
    notation: 'OC(=O)/C=C/C(=O)O',
    note: 'The slashes are the double bond geometry. Turn one round for maleic acid.',
  },
  {
    name: 'Sodium acetate',
    notation: 'CC(=O)[O-].[Na+]',
    note: 'A dot: two components in one notation, which is how a salt is written.',
  },
  {
    name: 'β-D-glucopyranose',
    notation: 'OC[C@H]1O[C@@H](O)[C@H](O)[C@@H](O)[C@@H]1O',
    note: 'Five tetrahedral centres in one ring. Turn the anomeric @@ into @ and you have the α anomer.',
  },
  {
    name: 'Penicillin G',
    notation: 'CC1(C)S[C@@H]2[C@H](NC(=O)Cc3ccccc3)C(=O)N2[C@H]1C(=O)O',
    note: 'A fused bicycle with three ring closures open at once.',
  },
];

/**
 * Patterns rather than molecules. Each one is a functional group a chemist
 * would search a list for, written the way a SMARTS says it: what the atom is,
 * what it is bonded to, and how many of each.
 */
export const EXAMPLE_QUERIES: ExampleStructure[] = [
  {
    name: 'Any carboxylic acid',
    notation: '[CX3](=O)[OX2H1]',
    note: 'Three connections on the carbon, two on the oxygen, one hydrogen: the counts are what stop an ester matching.',
  },
  {
    name: 'Any ester',
    notation: '[CX3](=O)[OX2H0][#6]',
    note: 'The same carbonyl with no hydrogen on the oxygen, and a carbon of any kind beyond it.',
  },
  {
    name: 'Any amide',
    notation: '[NX3][CX3]=[OX1]',
    note: 'A trivalent nitrogen on a carbonyl carbon. #7 would say nitrogen without saying how many bonds.',
  },
  {
    name: 'Any halogen',
    notation: '[F,Cl,Br,I]',
    note: 'A comma is "or", so one bracket stands for four elements.',
  },
  {
    name: 'A benzene ring',
    notation: 'c1ccccc1',
    note: 'Lowercase atoms match aromatic ones only. As a query it hits every substituted benzene too.',
  },
  {
    name: 'Any aromatic nitrogen',
    notation: '[n]',
    note: 'One atom is a legitimate query: pyridine, pyrrole and caffeine all contain it.',
  },
  {
    name: 'A nitro group',
    notation: '[N+](=O)[O-]',
    note: 'The charge-separated form, which is how a nitro group is written when its atoms must be counted.',
  },
  {
    name: 'A ketone',
    notation: '[#6][CX3](=O)[#6]',
    note: '#6 is "any carbon, aromatic or not" — the carbons on both sides are what make it a ketone and not an aldehyde.',
  },
  {
    name: 'Two atoms, any bond',
    notation: 'C~C',
    note: 'A tilde matches any bond order. Single, double, triple or aromatic all count.',
  },
  {
    name: 'A primary alcohol',
    notation: '[OX2H][CX4H2]',
    note: 'The hydrogen counts spell out "an OH on a CH2", which no SMILES could say.',
  },
];

/**
 * Reactions, which are two or three SMILES with arrows between them. Between
 * them they show an empty agent field, a full one, atom mapping, and both
 * charges and stereochemistry surviving the arrow.
 */
export const EXAMPLE_REACTIONS: ExampleStructure[] = [
  {
    name: 'Esterification, acid catalysed',
    notation: 'CC(=O)O.OCC>[H+]>CC(=O)OCC.O',
    note: 'Reactants > agents > products. The proton sits between the arrows because it is not consumed.',
  },
  {
    name: 'Acetyl chloride and ethanol',
    notation: 'CC(=O)Cl.OCC>>CC(=O)OCC.Cl',
    note: 'Both arrows are always written, even when there is no agent to declare.',
  },
  {
    name: 'Esterification, fully mapped',
    notation:
      '[CH3:1][C:2](=[O:3])[OH:4].[OH:5][CH2:6][CH3:7]>>[CH3:1][C:2](=[O:3])[O:5][CH2:6][CH3:7].[OH2:4]',
    note: 'The atom classes say which atom became which: the acid keeps its =O, and the water leaves with the acid oxygen.',
  },
  {
    name: 'Hydrogenation of ethene',
    notation: 'C=C.[H][H]>[Pd]>CC',
    note: 'The catalyst is an agent, so it is written between the arrows and comes out unchanged.',
  },
  {
    name: 'Saponification',
    notation: 'CC(=O)OCC.[OH-]>>CC(=O)[O-].CCO',
    note: 'Charges cross the arrow like anything else — the count has to balance on both sides.',
  },
  {
    name: 'SN2 on bromoethane',
    notation: 'CCBr.[OH-]>>CCO.[Br-]',
    note: 'Two components on each side, separated by dots inside one field.',
  },
  {
    name: 'Diels–Alder',
    notation: 'C=CC=C.C=C>>C1=CCCCC1',
    note: 'Two open-chain reactants and one ring: the arrow is the only thing that says which is which.',
  },
  {
    name: 'Amide coupling',
    notation: 'CC(=O)O.CN>>CC(=O)NC.O',
    note: 'Water on the right is the condensation. Nothing in the notation says how the reaction is run.',
  },
];

/**
 * The examples of one kind of structure.
 * @param kind - What the page is working on.
 * @returns The menu for that tab.
 */
export function examplesFor(kind: StructureKind): ExampleStructure[] {
  switch (kind) {
    case 'query':
      return EXAMPLE_QUERIES;
    case 'reaction':
      return EXAMPLE_REACTIONS;
    case 'molecule':
      return EXAMPLE_MOLECULES;
    // no default
  }
}
