/**
 * A single example shown inside a glossary tooltip.
 */
export interface GlossaryExample {
  /**
   * A valid SMILES string (or, for the reaction entries, a valid reaction
   * SMILES) illustrating the term. Always renderable — never a bare SMARTS.
   */
  smiles: string;
  /**
   * Short explanation of what the example demonstrates.
   * @default undefined
   */
  note?: string;
}

/**
 * Rich content rendered inside a Blueprint tooltip for a glossary term or for
 * the "Try it" help icon.
 */
export interface GlossaryEntry {
  title: string;
  summary: string;
  examples: GlossaryExample[];
}

/**
 * Keyed by the literal term used inside `[[...]]` markers in step and exercise
 * descriptions. Keys are lowercase; lookups should also lowercase the marker.
 */
export const GLOSSARY: Record<string, GlossaryEntry> = {
  atom: {
    title: 'Atom',
    summary:
      'Every element token in a SMILES string is one atom. Ten common elements plus their lowercase aromatic forms may be written bare; every other element goes inside square brackets. Hydrogens are usually not written at all — the parser adds them from the standard valence of the element.',
    examples: [
      {
        smiles: 'C',
        note: 'One carbon with four implicit hydrogens: methane.',
      },
      { smiles: 'O', note: 'One oxygen with two implicit hydrogens: water.' },
      {
        smiles: '[Fe]',
        note: 'Iron is outside the organic subset, so it needs brackets.',
      },
    ],
  },
  'element symbol': {
    title: 'Element symbol',
    summary:
      'The usual one- or two-letter symbol, capital first letter. Two-letter symbols are the classic trap: outside brackets only Cl and Br are read as two letters, so SN is sulfur bonded to nitrogen, not tin.',
    examples: [
      {
        smiles: 'CCCl',
        note: 'Chloroethane — Cl is a single atom, not C plus l.',
      },
      { smiles: 'SN', note: 'Sulfur bonded to nitrogen — NOT tin.' },
      { smiles: '[Sn]', note: 'Tin. Brackets are the only way to write it.' },
    ],
  },
  'organic subset': {
    title: 'Organic subset',
    summary:
      'B, C, N, O, P, S, F, Cl, Br and I (plus the aromatic forms b, c, n, o, p, s) may be written without brackets. In exchange you accept the default valence and implicit hydrogens: you cannot state a charge, an isotope, a chirality or a hydrogen count on a bare atom.',
    examples: [
      {
        smiles: 'CCO',
        note: 'Ethanol — three subset atoms, no brackets needed.',
      },
      {
        smiles: 'ClCCBr',
        note: '1-bromo-2-chloroethane; halogens are in the subset.',
      },
      { smiles: 'NCCS', note: 'Cysteamine — N, C, C, S all bare.' },
    ],
  },
  'bracket atom': {
    title: 'Bracket atom',
    summary:
      'Square brackets give complete control over one atom, in a fixed order: isotope, element symbol, chirality, hydrogen count, formal charge, atom class — as in [13CH3:1]. The price is that a bracketed atom gets no implicit hydrogens; whatever you write is exactly what you get.',
    examples: [
      { smiles: '[Na+]', note: 'Sodium cation: element plus charge.' },
      {
        smiles: '[13CH4]',
        note: 'Carbon-13 methane: isotope plus explicit hydrogen count.',
      },
      {
        smiles: '[NH4+]',
        note: 'Ammonium: hydrogen count and charge together.',
      },
    ],
  },
  'implicit hydrogen': {
    title: 'Implicit hydrogen',
    summary:
      'Hydrogens on organic-subset atoms are never written; the parser fills each atom up to its normal valence. That is why C is methane and O is water. Bracket atoms are exempt from this rule — they carry only the hydrogens you spell out.',
    examples: [
      { smiles: 'C', note: 'Carbon fills up to valence 4 → CH4.' },
      { smiles: 'CO', note: 'Methanol: the C gets 3 H, the O gets 1.' },
      {
        smiles: '[C]',
        note: 'A bracketed bare carbon with zero hydrogens — not methane.',
      },
    ],
  },
  'explicit hydrogen': {
    title: 'Explicit hydrogen',
    summary:
      'There are two ways to write a hydrogen you cannot leave implicit: a hydrogen count inside a bracket, or a standalone [H] atom bonded like any other. The count form is the normal one; [H] atoms are needed only when the hydrogen itself carries an isotope, a charge or an atom class.',
    examples: [
      {
        smiles: 'c1cc[nH]c1',
        note: 'Pyrrole — the N–H is written as a hydrogen count.',
      },
      {
        smiles: '[H]O[H]',
        note: 'Water with both hydrogens as separate atoms.',
      },
      {
        smiles: '[2H]O[2H]',
        note: 'Heavy water: the isotope forces the [H] form.',
      },
    ],
  },
  'hydrogen count': {
    title: 'Hydrogen count',
    summary:
      'Inside brackets, H followed by an optional digit states how many hydrogens the atom carries; H on its own means one. Leave it out and the atom has zero hydrogens — that is why [C] is not methane and why [nH] differs from n.',
    examples: [
      { smiles: '[NH4+]', note: 'Four hydrogens, stated explicitly.' },
      {
        smiles: '[OH-]',
        note: 'Hydroxide: one hydrogen and a negative charge.',
      },
      { smiles: 'c1cc[nH]c1', note: 'Pyrrole nitrogen: exactly one hydrogen.' },
    ],
  },
  valence: {
    title: 'Valence',
    summary:
      'The implicit-hydrogen filler uses a table of normal valences: B 3, C 4, N 3 or 5, O 2, P 3 or 5, S 2/4/6, halogens 1. Exceed it on a bare atom and the parser objects; declare a formal charge and the allowed valence shifts, which is why a four-bonded nitrogen must be written [N+].',
    examples: [
      { smiles: 'N', note: 'Nitrogen fills to valence 3 → ammonia.' },
      {
        smiles: 'C[N+](C)(C)C',
        note: 'Four bonds on N are legal only because of the + charge.',
      },
      {
        smiles: 'O=S(=O)(O)O',
        note: 'Sulfuric acid — sulfur happily uses valence 6.',
      },
    ],
  },
  bond: {
    title: 'Bond',
    summary: String.raw`Bonds are the punctuation between atoms: nothing or - for single, = for double, # for triple, : for aromatic, $ for quadruple, and / and \ for directional single bonds. Two atoms written next to each other are always bonded.`,
    examples: [
      { smiles: 'CC', note: 'Ethane — the single bond is implied.' },
      { smiles: 'C=C', note: 'Ethene.' },
      { smiles: 'C#C', note: 'Acetylene.' },
    ],
  },
  'single bond': {
    title: 'Single bond',
    summary:
      'The default between two adjacent atoms; the - symbol is legal but nearly always omitted. The one place it earns its keep is between two aromatic atoms of different rings, because the specification says an unwritten bond between two aromatic atoms is aromatic. Most toolkits are forgiving there and read biphenyl either way, but writing the - makes the intent explicit.',
    examples: [
      { smiles: 'CC', note: 'Ethane, bond implied.' },
      { smiles: 'C-C', note: 'Exactly the same molecule, bond written out.' },
      {
        smiles: 'c1ccccc1-c1ccccc1',
        note: 'Biphenyl — the - states that the two rings are joined by a single bond.',
      },
    ],
  },
  'double bond': {
    title: 'Double bond',
    summary:
      'Written =. It applies to the pair of atoms it sits between, and works inside a branch, which is how every carbonyl is written.',
    examples: [
      { smiles: 'C=C', note: 'Ethene.' },
      {
        smiles: 'CC(=O)C',
        note: 'Acetone — the carbonyl is a branch off the middle carbon.',
      },
      {
        smiles: 'O=C=O',
        note: 'Carbon dioxide: two double bonds on one carbon.',
      },
    ],
  },
  'triple bond': {
    title: 'Triple bond',
    summary:
      'Written #. Common in nitriles and alkynes. As with =, the symbol goes between the two atoms it joins.',
    examples: [
      { smiles: 'C#C', note: 'Acetylene.' },
      { smiles: 'CC#N', note: 'Acetonitrile.' },
      { smiles: 'N#N', note: 'Dinitrogen.' },
    ],
  },
  'aromatic bond': {
    title: 'Aromatic bond',
    summary:
      'Written : but almost never needed: two adjacent lowercase atoms in the same ring are joined by an aromatic bond automatically. You reach for an explicit symbol only where the default would be wrong or ambiguous — most often the single bond joining two aromatic rings.',
    examples: [
      { smiles: 'c1ccccc1', note: 'Six aromatic bonds, none of them written.' },
      {
        smiles: 'Cc1ccccc1',
        note: 'Toluene — the methyl-to-ring bond is single by default.',
      },
      {
        smiles: 'c1ccccc1-c1ccccc1',
        note: 'Biphenyl — the explicit - keeps the inter-ring bond unambiguously single.',
      },
    ],
  },
  branch: {
    title: 'Branch',
    summary:
      'Parentheses hang a substituent off the atom written immediately before them; after the closing parenthesis the chain resumes from that same atom. Branches nest, and one atom may carry several in a row.',
    examples: [
      {
        smiles: 'CC(C)C',
        note: 'Isobutane — a methyl branch on the middle carbon.',
      },
      { smiles: 'CC(C)(C)C', note: 'Neopentane — two branches on one atom.' },
      {
        smiles: 'CC(=O)O',
        note: 'Acetic acid — the carbonyl oxygen is a branch.',
      },
    ],
  },
  chain: {
    title: 'Chain',
    summary:
      'Atoms written one after another, each bonded to the previous one. SMILES has no notion of a "main chain" in the IUPAC sense — which atoms end up inside parentheses is purely a matter of how you chose to write the string.',
    examples: [
      { smiles: 'CCCC', note: 'Butane.' },
      { smiles: 'CCCCCCCC', note: 'Octane.' },
      {
        smiles: 'OCC',
        note: 'Ethanol written from the oxygen; same molecule as CCO.',
      },
    ],
  },
  ring: {
    title: 'Ring',
    summary:
      'SMILES writes a molecule as a tree plus a few extra bonds, and those extra bonds are the rings. Each cycle therefore costs exactly one pair of ring bond numbers, whatever its size.',
    examples: [
      { smiles: 'C1CC1', note: 'Cyclopropane.' },
      { smiles: 'C1CCCCC1', note: 'Cyclohexane.' },
      {
        smiles: 'C1CCOC1',
        note: 'Tetrahydrofuran — a heteroatom in the ring changes nothing.',
      },
    ],
  },
  'ring closure': {
    title: 'Ring closure',
    summary:
      'A digit after an atom opens a ring; the same digit later closes it and creates the bond between the two labelled atoms. A bond symbol may precede the digit to set the order of the closure bond, as in C=1CCCCC=1.',
    examples: [
      {
        smiles: 'C1CCCCC1',
        note: 'The two labelled carbons become bonded: cyclohexane.',
      },
      {
        smiles: 'C=1CCCCC=1',
        note: 'Cyclohexene — the closure bond itself is a double bond.',
      },
      {
        smiles: 'C1.C1',
        note: 'A dot with a ring closure across it: still ethane.',
      },
    ],
  },
  'ring bond number': {
    title: 'Ring bond number',
    summary:
      'The label itself. Digits 0–9 are written directly; from 10 upwards you must prefix them with %, as in %10 or %11. A number becomes free again the moment its ring closes, so it can be reused later in the same string.',
    examples: [
      { smiles: 'C%10CCCCC%10', note: 'Cyclohexane using the two-digit form.' },
      {
        smiles: 'C1CC1C1CC1',
        note: 'Digit 1 reused: two separate cyclopropanes.',
      },
      {
        smiles: 'C1CCC2CCCCC2C1',
        note: 'Decalin — two numbers open at the same time.',
      },
    ],
  },
  'fused ring': {
    title: 'Fused ring',
    summary:
      'Two rings sharing a bond are written by opening the second ring number before the first has closed. The shared atoms are the ones sitting between the two closures.',
    examples: [
      {
        smiles: 'c1ccc2ccccc2c1',
        note: 'Naphthalene — two aromatic rings sharing an edge.',
      },
      { smiles: 'C1CCC2CCCCC2C1', note: 'Decalin, the saturated equivalent.' },
      {
        smiles: 'c1ccc2c(c1)cc[nH]2',
        note: 'Indole — a benzene fused to a pyrrole.',
      },
    ],
  },
  aromatic: {
    title: 'Aromatic atom',
    summary:
      'Lowercase b, c, n, o, p and s mark aromatic atoms; a ring written entirely in lowercase is aromatic. Aromatic atoms follow their own valence rules, which is why a bare aromatic n carries no hydrogen.',
    examples: [
      { smiles: 'c1ccccc1', note: 'Benzene.' },
      {
        smiles: 'c1ccncc1',
        note: 'Pyridine — the aromatic nitrogen is lowercase too.',
      },
      {
        smiles: 'Cc1ccccc1',
        note: 'Toluene — the methyl stays uppercase, it is not aromatic.',
      },
    ],
  },
  aromaticity: {
    title: 'Aromaticity model',
    summary:
      'Whether a ring "is aromatic" is decided by the toolkit, using a perception model that is usually some flavour of Hückel 4n+2 over a planar conjugated ring. Toolkits disagree at the margins — pyridones, azulene, some tautomers — so the same molecule may come back lowercase from one program and Kekulé from another. Both spellings are the same molecule; only the printed form differs.',
    examples: [
      { smiles: 'c1ccccc1', note: 'Benzene, aromatic form.' },
      {
        smiles: 'C1=CC=CC=C1',
        note: 'Benzene, Kekulé form — identical molecule.',
      },
      {
        smiles: 'Cn1cnc2c1c(=O)n(C)c(=O)n2C',
        note: 'Caffeine written aromatic; several toolkits print it Kekulé instead.',
      },
    ],
  },
  kekulé: {
    title: 'Kekulé form',
    summary:
      'The Kekulé form spells out alternating single and double bonds with uppercase atoms instead of using lowercase aromatic ones. It is fully equivalent, and often the safer thing to exchange between programs because it does not depend on the receiver agreeing with your aromaticity model.',
    examples: [
      { smiles: 'C1=CC=CC=C1', note: 'Benzene, Kekulé.' },
      { smiles: 'c1ccccc1', note: 'Benzene, aromatic — same molecule.' },
      { smiles: 'C1=CC=NC=C1', note: 'Pyridine, Kekulé.' },
    ],
  },
  heteroatom: {
    title: 'Heteroatom',
    summary:
      'Any atom in an organic molecule that is neither carbon nor hydrogen. SMILES gives them no special treatment: N, O, S, P and the halogens are all in the organic subset and are written bare.',
    examples: [
      { smiles: 'CCO', note: 'Ethanol — oxygen.' },
      { smiles: 'CCN', note: 'Ethylamine — nitrogen.' },
      { smiles: 'CCS', note: 'Ethanethiol — sulfur.' },
    ],
  },
  heteroaromatic: {
    title: 'Heteroaromatic ring',
    summary:
      'An aromatic ring containing at least one heteroatom. Write the heteroatom lowercase like the rest of the ring, and add brackets with a hydrogen count when it carries an H.',
    examples: [
      {
        smiles: 'c1ccncc1',
        note: 'Pyridine — six-membered, nitrogen without hydrogen.',
      },
      {
        smiles: 'c1cc[nH]c1',
        note: 'Pyrrole — five-membered, nitrogen with hydrogen.',
      },
      { smiles: 'c1ccoc1', note: 'Furan.' },
    ],
  },
  'aromatic nitrogen': {
    title: 'Aromatic nitrogen (n vs [nH])',
    summary:
      'The most error-prone atom in all of SMILES. A bare n is a pyridine-type nitrogen: three connections, no hydrogen. [nH] is a pyrrole-type nitrogen carrying one hydrogen and donating its lone pair to the ring. Pick the wrong one and you get either a valence error or a different molecule.',
    examples: [
      { smiles: 'c1ccncc1', note: 'Pyridine — bare n, no hydrogen.' },
      { smiles: 'c1cc[nH]c1', note: 'Pyrrole — [nH], one hydrogen.' },
      {
        smiles: 'Cn1cccc1',
        note: 'N-methylpyrrole — substituted, so no hydrogen and no brackets.',
      },
    ],
  },
  'formal charge': {
    title: 'Formal charge',
    summary:
      'Written inside brackets as + or -, repeated for higher charges, or followed by a number as in [Fe+2]. The charge changes the allowed valence, which is why a nitrogen with four bonds must be written [N+].',
    examples: [
      { smiles: '[NH4+]', note: 'Ammonium.' },
      { smiles: 'CC(=O)[O-]', note: 'Acetate anion.' },
      {
        smiles: 'O=[N+]([O-])c1ccccc1',
        note: 'Nitrobenzene — a + and a - inside one group.',
      },
    ],
  },
  isotope: {
    title: 'Isotope',
    summary:
      'A mass number written in front of the element symbol inside a bracket. An atom with no mass number means natural isotopic abundance — it does not mean "unknown", and it is not a wildcard.',
    examples: [
      { smiles: '[13CH4]', note: 'Carbon-13 methane.' },
      { smiles: '[2H]O[2H]', note: 'Heavy water.' },
      {
        smiles: '[13CH3]C(=O)O',
        note: 'Acetic acid labelled on the methyl carbon.',
      },
    ],
  },
  'atom class': {
    title: 'Atom class',
    summary:
      'A colon and a number at the very end of a bracket, as in [CH3:1]. It is chemically inert — structure comparison ignores it — but it lets software point at one specific atom. Also called an atom map number.',
    examples: [
      {
        smiles: '[CH3:1][OH:2]',
        note: 'Methanol with both heavy atoms labelled.',
      },
      {
        smiles: '[CH3:1]C(=O)[OH:2]',
        note: 'Ordinary acetic acid, two atoms tagged.',
      },
      {
        smiles: 'CO',
        note: 'The same methanol without classes — identical molecule.',
      },
    ],
  },
  'atom mapping': {
    title: 'Atom mapping',
    summary:
      'Using atom classes on both sides of a reaction SMILES so a program can follow each atom from reactant to product. Atoms left unmapped are simply not tracked, which is normal for leaving groups and spectator fragments.',
    examples: [
      {
        smiles:
          '[CH3:1][C:2](=[O:3])[OH:4].[OH:5][CH2:6][CH3:7]>>[CH3:1][C:2](=[O:3])[O:5][CH2:6][CH3:7].[OH2:4]',
        note: 'Mapped esterification: atom 5 shows the alcohol oxygen ends up in the ester.',
      },
      {
        smiles: '[CH3:1][C:2](=[O:3])[OH:4]',
        note: 'The reactant half on its own — still just acetic acid.',
      },
    ],
  },
  disconnection: {
    title: 'Disconnection (the dot)',
    summary:
      'A dot means "no bond here". It separates fragments of a single record — the ions of a salt, a solvate, both halves of a co-crystal. A dot at top level is the only way SMILES expresses "these are not connected".',
    examples: [
      { smiles: '[Na+].[Cl-]', note: 'Sodium chloride as two components.' },
      { smiles: 'CC(=O)[O-].[Na+]', note: 'Sodium acetate.' },
      { smiles: 'O.O.O', note: 'Three separate water molecules.' },
    ],
  },
  component: {
    title: 'Component',
    summary:
      'One connected fragment of a SMILES string. A string with n top-level dots has n+1 components. Many databases store a single component per record and keep counter-ions in another field; SMILES lets you keep everything in one string.',
    examples: [
      { smiles: 'CCO', note: 'One component.' },
      {
        smiles: 'C[N+](C)(C)C.[Cl-]',
        note: 'Two components: a cation and an anion.',
      },
      {
        smiles: '[NH3+]CC(=O)[O-]',
        note: 'One component despite carrying two charges.',
      },
    ],
  },
  salt: {
    title: 'Salt',
    summary:
      'Two or more ionic components in one string, joined by dots. SMILES does not check that the charges balance, so a mis-typed salt parses happily — check the total charge yourself.',
    examples: [
      { smiles: 'C[N+](C)(C)C.[Cl-]', note: 'Tetramethylammonium chloride.' },
      { smiles: 'CC(=O)[O-].[Na+]', note: 'Sodium acetate.' },
      { smiles: '[NH4+].[Cl-]', note: 'Ammonium chloride.' },
    ],
  },
  zwitterion: {
    title: 'Zwitterion',
    summary:
      'A single component carrying both a positive and a negative charge — no dot, because the two ions are bonded to each other. Amino acids at physiological pH are the textbook case.',
    examples: [
      { smiles: '[NH3+]CC(=O)[O-]', note: 'Glycine as a zwitterion.' },
      {
        smiles: 'NCC(=O)O',
        note: 'The neutral form, for comparison — a different molecule.',
      },
      { smiles: 'C[C@H]([NH3+])C(=O)[O-]', note: 'L-alanine as a zwitterion.' },
    ],
  },
  chirality: {
    title: 'Chirality',
    summary: String.raw`SMILES stores configuration, never coordinates. Tetrahedral centres get @ or @@; double bonds get / and \. Omitting them means "unspecified", which is not the same as "racemic" even though both usually end up stored the same way.`,
    examples: [
      {
        smiles: 'CC(N)C(=O)O',
        note: 'Alanine with no configuration specified.',
      },
      { smiles: 'C[C@H](N)C(=O)O', note: 'L-alanine, the (S) enantiomer.' },
      { smiles: 'C[C@@H](N)C(=O)O', note: 'D-alanine, the (R) enantiomer.' },
    ],
  },
  tetrahedral: {
    title: 'Tetrahedral chirality',
    summary:
      'The default chirality class. Look from the first neighbour in writing order towards the centre: @ means the remaining three, taken in writing order, run anticlockwise; @@ means clockwise. In [C@H] written after another atom, the implicit hydrogen occupies the position where it is written, i.e. it counts as the first of those three.',
    examples: [
      {
        smiles: 'C[C@H](N)C(=O)O',
        note: 'L-alanine: neighbours are methyl, H, N, carboxyl.',
      },
      {
        smiles: 'N[C@@H](C)C(=O)O',
        note: 'The same L-alanine — reordering the neighbours flipped the tag.',
      },
      { smiles: 'C[C@H](O)C(=O)O', note: '(S)-lactic acid.' },
    ],
  },
  stereocenter: {
    title: 'Stereocenter',
    summary:
      'An atom whose substituents can be arranged in two non-superimposable ways. SMILES records which arrangement with @ or @@; whether that ends up being called R or S is computed afterwards from CIP rules and is never stored in the string.',
    examples: [
      { smiles: 'C[C@H](N)C(=O)O', note: 'Resolves to (S) — L-alanine.' },
      { smiles: 'C[C@@H](N)C(=O)O', note: 'Resolves to (R) — D-alanine.' },
      { smiles: 'CC(N)C(=O)O', note: 'A stereocenter left unspecified.' },
    ],
  },
  'chirality tag': {
    title: 'Chirality tag (@ / @@)',
    summary:
      '@ means anticlockwise and @@ (think "@ twice") means clockwise. The tag has no meaning on its own: it is always relative to the order in which the neighbours appear in this particular string, so rewriting a molecule can flip the tag without changing the molecule.',
    examples: [
      { smiles: 'C[C@H](N)C(=O)O', note: 'L-alanine written from the methyl.' },
      {
        smiles: 'N[C@@H](C)C(=O)O',
        note: 'The same L-alanine written from the nitrogen.',
      },
      {
        smiles: 'C[C@@H](N)C(=O)O',
        note: 'This one really is the other enantiomer.',
      },
    ],
  },
  'cis/trans': {
    title: 'Cis / trans',
    summary: String.raw`Configuration around a double bond. SMILES has no cis or trans keyword: you express it with directional bonds / and \ placed on the single bonds that flank the double bond.`,
    examples: [
      { smiles: String.raw`C/C=C\C`, note: 'cis-but-2-ene, the (Z) isomer.' },
      { smiles: 'C/C=C/C', note: 'trans-but-2-ene, the (E) isomer.' },
      {
        smiles: String.raw`OC(=O)/C=C\C(=O)O`,
        note: 'Maleic acid — the cis diacid.',
      },
    ],
  },
  'e/z': {
    title: 'E / Z',
    summary:
      'The CIP names for double-bond configuration: Z when the two higher-priority substituents are on the same side, E when they are opposite. Like R and S, these are derived from the structure — SMILES itself only records which side each neighbour sits on.',
    examples: [
      { smiles: 'C/C=C/C', note: '(E)-but-2-ene.' },
      { smiles: String.raw`C/C=C\C`, note: '(Z)-but-2-ene.' },
      { smiles: 'OC(=O)/C=C/C(=O)O', note: 'Fumaric acid — the (E) diacid.' },
    ],
  },
  'directional bond': {
    title: String.raw`Directional bond (/ and \)`,
    summary: String.raw`A / or \ is a single bond that also says "up" or "down" relative to the double bond it flanks. They come in pairs, and each one describes the bond it sits on rather than the double bond, so one geometry has several equivalent spellings. A lone, unmatched slash leaves the geometry unspecified.`,
    examples: [
      { smiles: 'F/C=C/F', note: '(E)-1,2-difluoroethene.' },
      {
        smiles: String.raw`F\C=C\F`,
        note: 'Written differently, exactly the same E isomer.',
      },
      { smiles: String.raw`F/C=C\F`, note: 'The (Z) isomer.' },
    ],
  },
  'canonical smiles': {
    title: 'Canonical SMILES',
    summary:
      'A SMILES produced through a canonical atom ordering, so the same structure always gives the same string. The catch: canonical only within one program and version. RDKit, OpenChemLib, OpenEye and Daylight all print different canonical strings for the same molecule, so never compare canonical SMILES that came from two different toolkits.',
    examples: [
      { smiles: 'CCO', note: 'Ethanol.' },
      { smiles: 'OCC', note: 'The same ethanol written backwards.' },
      {
        smiles: 'C(O)C',
        note: 'And again with a branch — three valid strings, one molecule.',
      },
    ],
  },
  'isomeric smiles': {
    title: 'Isomeric SMILES',
    summary: String.raw`A SMILES that keeps isotopes and stereochemistry. The non-isomeric or "flat" form drops @, /, \ and mass numbers, which is handy for finding a compound regardless of stereochemistry and dangerous if you then treat the two records as the same substance.`,
    examples: [
      {
        smiles: 'C[C@H](N)C(=O)O',
        note: 'Isomeric: this is specifically L-alanine.',
      },
      {
        smiles: 'CC(N)C(=O)O',
        note: 'Flat: alanine of unspecified configuration.',
      },
      {
        smiles: '[13CH3]C(=O)O',
        note: 'The isotope label also only survives in the isomeric form.',
      },
    ],
  },
  smarts: {
    title: 'SMARTS',
    summary:
      'The query language built on SMILES syntax. Every valid SMILES is a valid SMARTS, but SMARTS adds logic: [#6] any carbon, [C,N] carbon or nitrogen, [!c] anything but an aromatic carbon, [OX2H] an sp3 oxygen with one hydrogen. Rule of thumb — SMILES to store a molecule, SMARTS to search for one.',
    examples: [
      { smiles: 'CCO', note: 'The SMARTS [OX2H] matches its hydroxyl oxygen.' },
      {
        smiles: 'CC(=O)O',
        note: 'The SMARTS C(=O)[OX2H1] matches the carboxylic acid.',
      },
      {
        smiles: 'Cc1ccccc1',
        note: 'The SMARTS [c][CH3] matches the ring-bound methyl of toluene.',
      },
    ],
  },
  substructure: {
    title: 'Substructure search',
    summary:
      'Finding a query pattern inside a larger molecule. The match runs on the molecular graph, so ring membership, aromaticity and hydrogen counts stated in the query all constrain the hit — a query written aromatic will not match a ring the toolkit perceived as aliphatic.',
    examples: [
      {
        smiles: 'CC(=O)Oc1ccccc1C(=O)O',
        note: 'Aspirin contains the substructures c1ccccc1 and C(=O)O.',
      },
      {
        smiles: 'c1ccccc1',
        note: 'As a query, this matches any benzene ring, fused or not.',
      },
      {
        smiles: 'c1ccc2ccccc2c1',
        note: 'Naphthalene therefore matches the benzene query twice.',
      },
    ],
  },
  wildcard: {
    title: 'Wildcard (*)',
    summary:
      'An asterisk is an atom of unspecified element. It is valid in SMILES as well as SMARTS, and is the usual way to mark an attachment point in a fragment, an R-group or a polymer repeat unit. It has no implicit hydrogens and no valence constraint.',
    examples: [
      { smiles: '*CC', note: 'An ethyl group with one open attachment point.' },
      { smiles: '*c1ccccc1', note: 'A monosubstituted phenyl fragment.' },
      { smiles: '*C(=O)O', note: 'A generic carboxylic acid.' },
    ],
  },
  'recursive smarts': {
    title: 'Recursive SMARTS',
    summary:
      'The $(...) primitive embeds an entire pattern inside an atom expression: the atom matches when the enclosed pattern matches starting at it. This is how you write context-sensitive queries such as "a nitrogen that is not an amide nitrogen": [NX3;!$(NC=O)].',
    examples: [
      {
        smiles: 'CCN',
        note: 'Matches [NX3;!$(NC=O)] — a plain amine nitrogen.',
      },
      {
        smiles: 'CC(=O)NC',
        note: 'Does not match it: this nitrogen is next to a carbonyl.',
      },
      {
        smiles: 'CC(=O)Nc1ccc(O)cc1',
        note: 'Paracetamol — the amide N is excluded, the phenol O still matches [OX2H].',
      },
    ],
  },
  'reaction smiles': {
    title: 'Reaction SMILES',
    summary:
      'Written reactants>agents>products, with both > always present even when a field is empty. Each field is an ordinary SMILES whose components are separated by dots. Agents are species present but not consumed — catalysts, solvents, reagents you do not want to balance.',
    examples: [
      {
        smiles: 'CC(=O)Cl.OCC>>CC(=O)OCC.Cl',
        note: 'Acetyl chloride + ethanol → ethyl acetate + HCl; no agent field.',
      },
      {
        smiles: 'CC(=O)O.OCC>[H+]>CC(=O)OCC.O',
        note: 'Fischer esterification with the acid catalyst in the agent field.',
      },
    ],
  },
  tautomer: {
    title: 'Tautomer',
    summary:
      'Tautomers differ only in where a hydrogen and a double bond sit, but SMILES records exactly what you wrote — the keto and the enol form are two strings and, to any structure-comparison tool, two different molecules. This is why databases normalise tautomers before comparing or de-duplicating.',
    examples: [
      { smiles: 'CC(=O)C', note: 'Acetone, the keto form.' },
      {
        smiles: 'CC(O)=C',
        note: 'Prop-1-en-2-ol, its enol — a different string and a different record.',
      },
      {
        smiles: 'Oc1ccncc1',
        note: 'Pyridin-4-ol; its pyridin-4(1H)-one tautomer is O=c1cc[nH]cc1.',
      },
    ],
  },
  inchi: {
    title: 'InChI',
    summary:
      'The IUPAC alternative to SMILES: a layered, canonical, non-proprietary identifier computed by a single reference program, so one molecule gives one InChI everywhere. It is not meant to be read or written by hand — that is exactly what SMILES is for. The usual division of labour is SMILES for input and display, InChIKey for database keys.',
    examples: [
      {
        smiles: 'CCO',
        note: 'Ethanol is InChI=1S/C2H6O/c1-2-3/h3H,2H2,1H3, key LFQSCWFLJHTTHZ-UHFFFAOYSA-N.',
      },
      {
        smiles: 'OCC',
        note: 'Written differently, but the same InChI — that is the whole point.',
      },
    ],
  },
};
