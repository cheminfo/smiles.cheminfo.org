/** Pedagogic level used to group and color-code tutorial steps and exercises. */
export type ExerciseLevel = 'beginner' | 'intermediate' | 'advanced';

/**
 * One stop in the guided tour. The description may contain `[[term]]` markers
 * that refer to entries in `GLOSSARY`; matching terms render as underlined
 * chips carrying a tooltip with the entry.
 *
 * `smiles` is preloaded into the live playground — the student is free to edit
 * it, and the depiction, molecular formula and token breakdown refresh on
 * every keystroke.
 */
export interface TutorialStep {
  title: string;
  description: string;
  /** A complete, valid SMILES string preloaded into the playground. */
  smiles: string;
  /** Pedagogic level used to group and color-code the step buttons. */
  level: ExerciseLevel;
}

/**
 * Metadata for one of the three tutorial levels. The colors are used both for
 * the group background and for the active button highlight.
 */
export interface TutorialLevelMeta {
  level: ExerciseLevel;
  label: string;
  /** Light background color applied to the group container. */
  background: string;
  /** Slightly darker color used for the currently selected step. */
  activeBackground: string;
}

export const TUTORIAL_LEVELS: TutorialLevelMeta[] = [
  {
    level: 'beginner',
    label: 'Atoms, bonds and rings',
    background: '#d1fae5',
    activeBackground: '#6ee7b7',
  },
  {
    level: 'intermediate',
    label: 'Aromatics and brackets',
    background: '#fef3c7',
    activeBackground: '#fcd34d',
  },
  {
    level: 'advanced',
    label: 'Stereochemistry and beyond',
    background: '#fce7f3',
    activeBackground: '#f9a8d4',
  },
];

export const TUTORIAL_STEPS: TutorialStep[] = [
  {
    level: 'beginner',
    title: 'An atom is an element symbol',
    description:
      'A SMILES string is a sequence of [[atom]] symbols. A bare C is one carbon, and because SMILES never spells out the hydrogens of a common element, that single letter already means methane. The ten elements of the [[organic subset]] (B, C, N, O, P, S, F, Cl, Br, I) may be written without brackets; anything else needs a [[bracket atom]] such as [Fe]. Replace the C below with O or N and watch water and ammonia appear.',
    smiles: 'C',
  },
  {
    level: 'beginner',
    title: 'Atoms side by side make a chain',
    description:
      'Write atoms one after another and SMILES joins each to the previous one with a [[single bond]]. CCO is a three-atom [[chain]] — carbon, carbon, oxygen — which is ethanol. Nothing in the string says how many hydrogens each atom carries: the parser fills them in from the [[valence]] of the element as [[implicit hydrogen]]s. Direction is irrelevant, so OCC is exactly the same molecule written backwards — try it.',
    smiles: 'CCO',
  },
  {
    level: 'beginner',
    title: 'Parentheses open a branch',
    description:
      'A [[branch]] in parentheses hangs off the atom written immediately before it, and the [[chain]] resumes from that same atom once the parenthesis closes. In CC(C)CO the second carbon carries a methyl group, which makes isobutanol. One atom may carry several branches — CC(C)(C)C is neopentane — and branches nest inside branches. Delete the parentheses and the molecule straightens out into butan-1-ol.',
    smiles: 'CC(C)CO',
  },
  {
    level: 'beginner',
    title: 'Double and triple bonds',
    description:
      'A bond symbol written between two atoms overrides the default single bond: = is a [[double bond]] and # is a [[triple bond]]. C=CC#N is acrylonitrile, with a C=C at one end and a C≡N at the other. Bond symbols work inside a [[branch]] too, which is how every carbonyl is written — CC(=O)C is acetone. Try O=C=O for carbon dioxide, or C#C for acetylene.',
    smiles: 'C=CC#N',
  },
  {
    level: 'beginner',
    title: 'Rings close with a digit',
    description:
      'To make a ring, put the same digit on the two atoms that must be bonded. In C1CCCCC1 the first and the last carbon both carry the [[ring bond number]] 1, so a [[ring closure]] bond joins them into cyclohexane. The digit is only a label — it says nothing about the ring size, which you get by counting the atoms between the two labels. Change one C into O and you get an ether ring: C1CCOC1 is tetrahydrofuran.',
    smiles: 'C1CCCCC1',
  },
  {
    level: 'beginner',
    title: 'Benzene, twice',
    description:
      'Lowercase letters mark [[aromatic]] atoms, so c1ccccc1 is benzene: six aromatic carbons closed into a ring, with no bond symbol anywhere. The same molecule can also be written with explicit alternating single and double bonds — the [[Kekulé]] form C1=CC=CC=C1 — and every toolkit will confirm the two strings describe one and the same molecule. The lowercase form is shorter and says "this ring is aromatic" without committing to a particular arrangement of double bonds. Paste the Kekulé form into the box and compare the depictions.',
    smiles: 'c1ccccc1',
  },
  {
    level: 'beginner',
    title: 'The bond symbols you leave out',
    description:
      'Every bond can be written in full, and most never are. C-C-O is ethanol with each [[single bond]] spelled out, and c1:c:c:c:c:c:1 is the benzene of the previous step with each [[aromatic bond]] spelled out — both mean exactly what CCO and c1ccccc1 mean. The symbol is dropped because two adjacent atoms are already bonded: single by default, aromatic when both atoms are lowercase. That is why - earns its keep in one place — c1ccccc1-c2ccccc2 is biphenyl, where the bond joining the two rings would otherwise be read as aromatic, and the second ring takes a fresh [[ring bond number]]. The one symbol you can never leave out is the opposite of a bond: a dot says the two atoms are not bonded at all, which a later step uses to write salts.',
    smiles: 'c1ccccc1-c2ccccc2',
  },
  {
    level: 'intermediate',
    title: 'Several rings at once',
    description:
      'A molecule may have more than one ring open at a time, so [[ring bond number]]s run from 0 to 9 — and %10, %11, … beyond that. C1CCC2CCCCC2C1 opens ring 1, opens ring 2 further along, closes 2, then closes 1: two [[fused ring]]s sharing an edge, which is decalin. A number is released the moment its ring closes and can be reused, so C1CC1C1CC1 is two separate cyclopropanes joined by a bond. That reuse is why even a steroid needs only four digits.',
    smiles: 'C1CCC2CCCCC2C1',
  },
  {
    level: 'intermediate',
    title: 'Substituents on a ring',
    description:
      '[[Branch]]es work on ring atoms exactly as they do on chains. Cc1ccc(O)cc1 starts with a methyl, walks around the [[aromatic]] ring, and hangs an OH on the fourth ring atom, giving para-cresol. Ring atoms are visited in writing order, so where a branch sits in the string is where the substituent sits on the ring. Move the (O) one atom earlier — Cc1cc(O)ccc1 — and you have the meta isomer instead.',
    smiles: 'Cc1ccc(O)cc1',
  },
  {
    level: 'intermediate',
    title: 'Aromatic heteroatoms',
    description:
      'A [[heteroatom]] inside an [[aromatic]] ring is written lowercase like everything else in the ring. c1ccncc1 is pyridine: take benzene and turn one aromatic carbon into a lowercase n. The [[valence]] model does the rest — this nitrogen ends up with three connections and no hydrogen, exactly as pyridine requires. Try the five-membered [[heteroaromatic]]s c1ccoc1 (furan) and c1ccsc1 (thiophene).',
    smiles: 'c1ccncc1',
  },
  {
    level: 'intermediate',
    title: 'Pyrrole and the [nH] trap',
    description:
      'Some aromatic nitrogens do carry a hydrogen, and SMILES cannot guess which ones. Write those as a [[bracket atom]] with an explicit [[hydrogen count]]: [nH]. So c1cc[nH]c1 is pyrrole, whose N–H points out of the ring while its lone pair completes the aromatic sextet. Compare with the previous step: a bare n means no hydrogen, [nH] means exactly one — mixing them up is the single most common cause of "cannot kekulize" errors.',
    smiles: 'c1cc[nH]c1',
  },
  {
    level: 'intermediate',
    title: 'Brackets, charges and valence',
    description:
      'Inside square brackets you control everything about an atom, in a fixed order: isotope, symbol, chirality, hydrogen count, [[formal charge]], [[atom class]]. C[N+](C)(C)C is the tetramethylammonium cation, and the + is what makes four bonds on nitrogen legal. Write [O-] for an anionic oxygen, [Fe+2] for a dication, [NH4+] for ammonium. Beware the trade-off: a bracketed atom has no [[implicit hydrogen]]s at all, so you must spell its hydrogens out yourself.',
    smiles: 'C[N+](C)(C)C',
  },
  {
    level: 'intermediate',
    title: 'Isotopes',
    description:
      'Put a mass number in front of the element symbol inside a bracket to specify an [[isotope]]. [13CH3]C(=O)O is acetic acid labelled with carbon-13 on the methyl — the sort of string you hand to an NMR or mass-spectrometry tool. Heavy water is [2H]O[2H], and some dialects also accept [D], but the numeric form is the portable one. An atom written without a mass number means natural isotopic abundance, not "unknown".',
    smiles: '[13CH3]C(=O)O',
  },
  {
    level: 'intermediate',
    title: 'A dot means "not bonded"',
    description:
      'A dot separates two [[component]]s that are not bonded to each other. C[N+](C)(C)C.[Cl-] is tetramethylammonium chloride: a cation and a chloride in a single string, one [[salt]]. Order does not matter and you may use as many dots as you need, so CC(=O)[O-].[Na+] is sodium acetate. A [[zwitterion]] is the opposite case — in [NH3+]CC(=O)[O-] both charges sit in one connected fragment, so there is no dot.',
    smiles: 'C[N+](C)(C)C.[Cl-]',
  },
  {
    level: 'advanced',
    title: 'Tetrahedral stereochemistry: @ and @@',
    description:
      'A [[tetrahedral]] [[stereocenter]] is marked with a [[chirality tag]] inside its bracket. Look from the first neighbour in writing order towards the centre: @ means the other three, in writing order, run anticlockwise, and @@ means clockwise. C[C@H](N)C(=O)O is L-alanine; change the tag to C[C@@H](N)C(=O)O and you have D-alanine. Because the tag is relative to writing order, the same molecule can be @ in one string and @@ in another — N[C@@H](C)C(=O)O is L-alanine as well.',
    smiles: 'C[C@H](N)C(=O)O',
  },
  {
    level: 'advanced',
    title: 'Double-bond geometry: / and \\',
    description: String.raw`Geometry around a [[double bond]] is written with [[directional bond]]s — / and \ — placed on the single bonds that flank it, never on the double bond itself. C/C=C/C is (E)-but-2-ene, the two methyls on opposite sides; C/C=C\C is the (Z) isomer. Because each slash describes the bond it sits on, one geometry has several spellings: F/C=C/F and F\C=C\F are both the E isomer. Leave the slashes out and the geometry is simply unspecified, which is not the same as "mixture".`,
    smiles: 'C/C=C/C',
  },
  {
    level: 'advanced',
    title: 'Atom classes label atoms for software',
    description:
      'A colon and a number at the end of a bracket give the atom an [[atom class]], often called an atom map number. It changes nothing chemically — [CH3:1]C(=O)[OH:2] is ordinary acetic acid — but it lets a program point at a specific atom. Reaction tools use classes to say which reactant atom becomes which product atom; query tools use them to tag the parts of a hit they care about. Structure comparison ignores classes entirely, so a labelled and an unlabelled acetic acid are the same molecule.',
    smiles: '[CH3:1]C(=O)[OH:2]',
  },
  {
    level: 'advanced',
    title: 'Reaction SMILES',
    description:
      'Two > signs turn a SMILES into a [[reaction SMILES]]: reactants > agents > products, with both > always present. CC(=O)Cl.OCC>>CC(=O)OCC.Cl is acetyl chloride plus ethanol giving ethyl acetate and hydrogen chloride; the middle field is empty because there is no catalyst to declare. Each field is an ordinary SMILES, so its [[component]]s are separated by dots as usual — CC(=O)O.OCC>[H+]>CC(=O)OCC.O puts the acid catalyst where it belongs. Add [[atom class]]es on both sides and you get a fully mapped reaction.',
    smiles: 'CC(=O)Cl.OCC>>CC(=O)OCC.Cl',
  },
  {
    level: 'advanced',
    title: 'A real drug, end to end',
    description:
      'Everything you have seen fits together in one string. Read CC(=O)Oc1ccccc1C(=O)O from the left: a methyl, a carbonyl carbon carrying its [[double bond]] oxygen in a [[branch]], an ester oxygen, then a benzene ring opened with c1, and finally — on the ring atom that closes the ring — a carboxylic acid. That is aspirin, acetylsalicylic acid, and the two substituents come out ortho because the opening and closing ring atoms are neighbours. Rewrite it starting from the acid, OC(=O)c1ccccc1OC(C)=O, and confirm you drew the same molecule.',
    smiles: 'CC(=O)Oc1ccccc1C(=O)O',
  },
];
