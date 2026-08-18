import { SMILES_VS_SMARTS } from './shared.ts';
import type { ReferenceSection } from './types.ts';

/**
 * The SMILES notation on one page.
 *
 * Written against the OpenSMILES specification, which the site serves in full
 * under `/specification`. Stereochemistry is covered as `@` / `@@` and the
 * directional bonds around a double bond; the chirality classes for allenes and
 * for coordination geometries are left to the specification.
 *
 * Nothing here documents a query. A SMILES names one molecule, and every
 * character of it is a fact about that molecule rather than a condition another
 * one has to meet — which is the whole difference the last section spells out.
 */
export const SMILES_SECTIONS: ReferenceSection[] = [
  {
    id: 'smiles-atoms',
    title: 'SMILES — Atoms',
    intro:
      'An atom is written either as a bare symbol from the organic subset, or fully specified inside square brackets. Everything else in a SMILES string hangs off atoms.',
    entries: [
      {
        syntax: 'B C N O P S F Cl Br I',
        name: 'Organic subset',
        summary: 'These ten elements may be written without brackets.',
        detail:
          'OpenSMILES §3.1.5 calls B, C, N, O, P, S, F, Cl, Br, I — and the wildcard `*` — the *organic subset*. Written bare, they take no charge, no isotope and no explicit hydrogen count; the hydrogen count is computed from the lowest normal valence that is at least the sum of the bond orders. Any other element must be bracketed.',
        exampleSmiles: 'OCCBr',
        exampleNote: '2-bromoethanol — O, C and Br all written bare',
      },
      {
        syntax: 'B(3) C(4) N(3,5) O(2) P(3,5) S(2,4,6) F/Cl/Br/I(1)',
        name: 'Implicit-hydrogen valence model',
        summary:
          'Bare organic-subset atoms get hydrogens up to the next allowed valence.',
        detail:
          'For a bare atom the parser sums the orders of its explicit bonds and adds hydrogens up to the smallest normal valence that is not exceeded. If the sum already exceeds every normal valence, no hydrogens are added. Bracketed atoms never get implicit hydrogens — `[C]` has none.',
        exampleSmiles: 'CS(=O)(=O)C',
        exampleNote:
          'dimethyl sulfone — S uses valence 6, so it gets no implicit hydrogen',
      },
      {
        syntax: '[ ... ]',
        name: 'Bracket atom',
        summary: 'Square brackets let you spell out every property of an atom.',
        detail:
          'Any element may be written in brackets, and elements outside the organic subset must be. A bracketed atom takes exactly the hydrogens you write: `[CH4]` is methane while `[C]` is a bare carbon atom with no hydrogens at all.',
        exampleSmiles: 'O=[N+]([O-])c1ccccc1',
        exampleNote:
          'nitrobenzene — the charge-separated nitro group needs two bracket atoms',
      },
      {
        syntax: '[isotope symbol chirality hcount charge :class]',
        name: 'Bracket atom grammar',
        summary: 'The five optional fields always appear in this fixed order.',
        detail:
          'The OpenSMILES production is `[ isotope? symbol chiral? hcount? charge? class? ]`. Every field except the symbol is optional, but a field that is present must be in this order — `[C@H3+]` is legal, `[C+H3@]` is not.',
        exampleSmiles: '[13CH3-:1]',
        exampleNote:
          'a carbon-13 methanide carbanion carrying atom class 1 — isotope, symbol, hcount, charge and class all at once',
      },
      {
        syntax: '[Se], [Fe], [Au]',
        name: 'Elements outside the organic subset',
        summary: 'Every other element must be bracketed.',
        detail:
          'Metals, noble gases, hydrogen written as an atom, and any element not in the ten-element organic subset must appear inside brackets. Such atoms receive no implicit hydrogens, so any hydrogens must be written explicitly.',
        exampleSmiles: 'C[Se]C',
        exampleNote:
          'dimethyl selenide — selenium is not in the organic subset',
      },
      {
        syntax: 'Hn',
        name: 'Explicit hydrogen count',
        summary:
          '`H` followed by a digit fixes the number of attached hydrogens.',
        detail:
          'Inside brackets the hydrogens are given as a property of the heavy atom, `H` meaning `H1`. This is the usual way to write hydrogens: `[CH4]`, `[NH4+]`, `[nH]`. Hydrogens written this way are not separate atoms in the graph.',
        exampleSmiles: '[NH4+].[Cl-]',
        exampleNote:
          'ammonium chloride — the nitrogen carries four hydrogens as a property',
      },
      {
        syntax: '[H]',
        name: 'Hydrogen as a real atom',
        summary:
          'A bracketed `H` with no preceding count is a hydrogen atom in its own right.',
        detail:
          'Writing `[H]` puts an explicit hydrogen node in the molecular graph, bonded like any other atom. Prefer the `Hn` property form; use `[H]` when the hydrogen itself needs an isotope, a charge, or a position in a chirality ordering.',
        exampleSmiles: '[H]C([H])([H])[H]',
        exampleNote: 'methane with all four hydrogens as explicit graph atoms',
      },
      {
        syntax: '[C]',
        name: 'Bracket atom with no hydrogens',
        summary: 'Brackets suppress implicit hydrogens entirely.',
        detail:
          'A bracketed atom has exactly the hydrogen count written, and zero if none is written. `[C]` is therefore an isolated carbon atom, not methane, and `[CH]` is a methylidyne with one hydrogen. This is the most common beginner trap with brackets.',
        exampleSmiles: '[C-]#N.[K+]',
        exampleNote:
          'potassium cyanide — `[C-]` has no hydrogen, only the triple bond and the charge',
      },
      {
        syntax: '*',
        name: 'Wildcard atom',
        summary: 'An atom whose element is unknown or unspecified.',
        detail:
          'Outside brackets `*` has no isotope, no chirality, zero hydrogens and zero charge. It is used for attachment points and generic R-groups. A `*` may sit in an aromatic ring: the ring counts as aromatic if some element could replace the `*` and satisfy the aromaticity rules. Inside brackets it takes the usual fields, so `[*+]`, `[13*]` and `[*:1]` are all legal.',
        exampleSmiles: '*C(=O)O',
        exampleNote: 'a carboxylic acid with an unspecified substituent',
      },
    ],
  },
  {
    id: 'smiles-bonds',
    title: 'SMILES — Bonds',
    intro:
      'Adjacent atoms in the string are bonded. A bond symbol is only needed when the bond is not the default single-or-aromatic bond.',
    entries: [
      {
        syntax: '(adjacency)',
        name: 'Implicit bond',
        summary: 'Two atoms written next to each other are bonded.',
        detail:
          'Atoms adjacent in a SMILES string are joined by a single bond, or by an aromatic bond if both atoms are aromatic. Because this covers most bonds in organic molecules, explicit bond symbols are the exception rather than the rule.',
        exampleSmiles: 'CCCC',
        exampleNote: 'butane — three implicit single bonds',
      },
      {
        syntax: '-',
        name: 'Single bond',
        summary: 'An explicit single bond.',
        detail:
          'Almost always redundant, with one important exception: a bond between two aromatic atoms defaults to aromatic, so a genuine single bond joining two aromatic systems must be written `-`.',
        exampleSmiles: 'c1ccccc1-c2ccccc2',
        exampleNote:
          'biphenyl — the inter-ring bond must be an explicit single bond, and the second ring takes a fresh number: OpenSMILES §4.3.3 gives exactly this pair as the correct form and calls reusing 1 wrong',
      },
      {
        syntax: '=',
        name: 'Double bond',
        summary: 'A double bond between the two atoms it separates.',
        detail:
          'The bond order is counted when implicit hydrogens are assigned, so the carbons in `C=C` get two hydrogens each rather than three.',
        exampleSmiles: 'C=C',
        exampleNote: 'ethene',
      },
      {
        syntax: '#',
        name: 'Triple bond',
        summary: 'A triple bond.',
        detail:
          'Used for alkynes and nitriles. As with `=`, the higher bond order reduces the implicit hydrogen count.',
        exampleSmiles: 'C#N',
        exampleNote: 'hydrogen cyanide',
      },
      {
        syntax: '$',
        name: 'Quadruple bond',
        summary: 'A quadruple bond, used for metal–metal bonding.',
        detail:
          'OpenSMILES defines `$` for quadruple bonds; the motivating example in the specification is the octachlorodirhenate(III) anion. It is rare and not supported by every toolkit.',
        exampleSmiles: '[Re]$[Re]',
        exampleNote: 'a rhenium–rhenium quadruple bond',
      },
      {
        syntax: ':',
        name: 'Aromatic bond',
        summary: 'An explicit aromatic bond.',
        detail:
          'Never strictly necessary — a bond between two aromatic atoms is already assumed aromatic — but useful when writing a Kekulé-free form explicitly, and essential as a SMARTS bond primitive.',
        exampleSmiles: 'c1:c:c:c:c:c:1',
        exampleNote: 'benzene with every aromatic bond written out',
      },
      {
        syntax: '.',
        name: 'Dot — no bond',
        summary: 'The dot says the two atoms are *not* bonded.',
        detail:
          'It separates disconnected components: salts, solvates, multi-component mixtures. The dot cannot be used in front of a ring-closure number, so `C.1CCCCC.1` is illegal.',
        exampleSmiles: '[Na+].[Cl-]',
        exampleNote: 'sodium chloride as two separate ionic components',
      },
      {
        syntax: 'C1.C1',
        name: 'Dot plus ring closure',
        summary:
          'A ring-closure number can bond two atoms written on either side of a dot.',
        detail:
          'The dot only means "no bond *here*"; a ring-closure number may still join the two fragments. This lets a molecule be assembled from independently written pieces, which is how many reaction and fragment tools emit SMILES.',
        exampleSmiles: 'C1.C1',
        exampleNote:
          'ethane, written as two fragments joined by ring-closure bond 1',
      },
    ],
  },
  {
    id: 'smiles-branches',
    title: 'SMILES — Branches',
    intro:
      'Parentheses hang a substituent off the atom immediately to their left, then return to that atom to continue the main chain.',
    entries: [
      {
        syntax: '(...)',
        name: 'Branch',
        summary: 'A parenthesised group branches off the preceding atom.',
        detail:
          'After the closing parenthesis the string continues from the atom that preceded the opening parenthesis, not from the last atom inside the branch. This is the single most important reading rule in SMILES.',
        exampleSmiles: 'CC(C)C',
        exampleNote:
          'isobutane — the middle carbon carries a methyl branch and then continues to a third methyl',
      },
      {
        syntax: 'X(a)(b)c',
        name: 'Stacked branches',
        summary: 'Several branches may hang off the same atom.',
        detail:
          'Consecutive parenthesised groups all attach to the same preceding atom. Conventionally the last substituent is written outside the parentheses, since a trailing `(C)` with nothing after it is redundant.',
        exampleSmiles: 'CC(C)(C)C',
        exampleNote:
          'neopentane — the central carbon carries three methyl branches plus the chain',
      },
      {
        syntax: 'C(C(C)C)',
        name: 'Nested branches',
        summary: 'Branches nest to any depth.',
        detail:
          'A branch may itself contain branches; there is no limit to the nesting depth. Deeply nested strings are legal but hard to read, so long substituents are usually better expressed by re-rooting the SMILES.',
        exampleSmiles: 'CCC(CC)CO',
        exampleNote: '2-ethyl-1-butanol',
      },
      {
        syntax: '(=O)',
        name: 'Bond symbol inside a branch',
        summary: 'A branch may open with a bond symbol.',
        detail:
          'The bond symbol applies to the bond joining the branch to the preceding atom, so `C(=O)` is a carbonyl. The same works for ring closures and for directional bonds, as in `C(\\F)=C/F`.',
        exampleSmiles: 'CC(=O)C',
        exampleNote: 'acetone — the branch is a doubly bonded oxygen',
      },
    ],
  },
  {
    id: 'smiles-rings',
    title: 'SMILES — Ring bond closures',
    intro:
      'Rings are written by cutting one bond, walking the resulting chain, and marking the two ends of the cut bond with the same number.',
    entries: [
      {
        syntax: '1 … 9',
        name: 'Ring-closure digit',
        summary: 'A digit after an atom opens or closes a ring bond.',
        detail:
          'The first occurrence of a ring-closure number creates an open bond on that atom; the second occurrence of the same number bonds the two atoms together. The number is a label for the cut bond, not a ring identifier and not an atom number.',
        exampleSmiles: 'C1CCCCC1',
        exampleNote:
          'cyclohexane — the bond between the first and last carbon is the closure',
      },
      {
        syntax: '%nn',
        name: 'Two-digit ring closure',
        summary: 'Ring numbers of 10 and above must be prefixed with `%`.',
        detail:
          'Without the `%`, `C12` would be read as two separate closures 1 and 2 rather than closure 12. OpenSMILES requires exactly two digits after `%`, giving the range %00–%99 — and asks that a number under 10 be written in the plain single-digit form, so `C1CCCCC1` rather than `C%01CCCCC%01`.',
        exampleSmiles: 'C%25CCCCC%25',
        exampleNote: 'cyclohexane using ring-closure number 25',
      },
      {
        syntax: '%(nnn)',
        name: 'Multi-digit ring closure (extension)',
        summary: 'Parenthesised ring numbers above 99.',
        detail:
          'Not part of OpenSMILES: an extension that allows ring-bond numbers with three or more digits, needed for very large fused systems and polymers. RDKit and openchemlib both accept it, but a toolkit is under no obligation to.',
        exampleSmiles: 'C%(100)CCCCC%(100)',
        exampleNote: 'cyclohexane written with ring-closure number 100',
      },
      {
        syntax: 'C=1…C=1',
        name: 'Bond order on a ring closure',
        summary: 'A bond symbol may precede the ring-closure number.',
        detail:
          'The symbol may appear on either end of the closure, or on both — but if it appears on both it must agree, so `C=1CCCCC=1`, `C=1CCCCC1` and `C1CCCCC=1` are one and the same cyclohexene. OpenSMILES §4.3.3 asks you not to write any of them: cut the ring at a single bond instead, `CC1=CCCCC1` rather than `CC=1CCCCC=1`.',
        exampleSmiles: 'C=1CCCCC=1',
        exampleNote: 'cyclohexene — the closing bond is a double bond',
      },
      {
        syntax: 'C1CCCCC1C1CCCCC1',
        name: 'Reusing ring numbers',
        summary: 'A number becomes free again once it has been used twice.',
        detail:
          'Ring-closure numbers may be recycled, so a molecule with hundreds of rings never needs more than a handful of numbers. Reusing a number is legal but harder to read than numbering rings distinctly.',
        exampleSmiles: 'C1CCCCC1C1CCCCC1',
        exampleNote: 'bicyclohexyl — the number 1 is used for both rings',
      },
      {
        syntax: 'C12…C1…C2',
        name: 'Several closures on one atom',
        summary: 'One atom may carry several ring-closure numbers.',
        detail:
          'Fused and spiro systems need atoms that close two or more rings. The numbers are simply written one after another; each is matched independently. An atom may not close a ring onto itself (`C11` is illegal) and two atoms may not be joined twice (`C12CCCCC12` is illegal).',
        exampleSmiles: 'C12CCCCC1CCCC2',
        exampleNote: 'decalin — the two fusion carbons each close two rings',
      },
      {
        syntax: 'C1CC2CCC1C2',
        name: 'Bridged ring systems',
        summary:
          'Bridgeheads are just atoms that close more than one ring bond.',
        detail:
          'Bicyclic cage systems need no special syntax: cut enough bonds to leave a spanning tree, then label each cut. The number of ring-closure pairs equals the number of rings in the smallest set of smallest rings.',
        exampleSmiles: 'C1CC2CCC1C2',
        exampleNote: 'norbornane (bicyclo[2.2.1]heptane)',
      },
    ],
  },
  {
    id: 'smiles-aromaticity',
    title: 'SMILES — Aromaticity',
    intro:
      'Aromatic atoms are written in lowercase. Aromaticity in SMILES is a computational model for producing one canonical form, not a claim about chemical reality.',
    entries: [
      {
        syntax: 'b c n o p s [se] [as]',
        name: 'Aromatic atom symbols',
        summary: 'A lowercase symbol marks an aromatic atom.',
        detail:
          'OpenSMILES permits `b`, `c`, `n`, `o`, `p` and `s` bare, plus `[se]` and `[as]` which must be bracketed because their two-letter symbols would otherwise be ambiguous. Any other lowercase symbol is invalid. Toolkits vary in which of these they will *perceive*, but all should parse them.',
        exampleSmiles: 'c1ccccc1',
        exampleNote: 'benzene',
      },
      {
        syntax: 'C1=CC=CC=C1',
        name: 'Kekulé form',
        summary: 'Alternating single and double bonds with uppercase atoms.',
        detail:
          'Every aromatic ring can also be written in a Kekulé form. A conforming parser must recognise it and, if the ring meets the aromaticity criteria, treat it as the same molecule as the lowercase form. Kekulé input is safest when the ring is unusual and aromaticity perception might differ between toolkits.',
        exampleSmiles: 'C1=CC=CC=C1',
        exampleNote: 'benzene in Kekulé form — the same molecule as c1ccccc1',
      },
      {
        syntax: '4N+2',
        name: 'The aromaticity model',
        summary:
          'A ring is aromatic when every atom is sp² and the shared π electrons number 4N+2.',
        detail:
          'OpenSMILES §3.5.3 describes an extended Hückel test: all ring atoms must be sp² hybridised and the available shared π electrons must total 4N+2, with N ≥ 0 — N = 0 is allowed, which is what makes the two-electron cyclopropenyl cation aromatic. The electron contribution per atom depends on its bonding and charge, which is why aromaticity perception differs between toolkits. That section of the specification is itself marked as under revision, so treat it as the best available description rather than as settled law.',
        exampleSmiles: 'c1ccc2ccccc2c1',
        exampleNote: 'naphthalene — a 10 π-electron fused system (N = 2)',
      },
      {
        syntax: '[nH]',
        name: 'Pyrrole-type nitrogen',
        summary:
          'An aromatic nitrogen bearing a hydrogen, donating two π electrons.',
        detail:
          'A three-connected aromatic nitrogen contributes its lone pair to the ring and must carry its hydrogen explicitly. Because a hydrogen count can only be written inside brackets, this always needs them: `[nH]`. Forgetting it is the most common cause of "cannot kekulise" errors.',
        exampleSmiles: 'c1cc[nH]c1',
        exampleNote: 'pyrrole',
      },
      {
        syntax: 'n',
        name: 'Pyridine-type nitrogen',
        summary: 'A two-connected aromatic nitrogen donating one π electron.',
        detail:
          'When the aromatic nitrogen has only two ring neighbours and no hydrogen, its lone pair stays in the ring plane and it contributes a single π electron, exactly like aromatic carbon. It needs no brackets.',
        exampleSmiles: 'c1ccncc1',
        exampleNote: 'pyridine',
      },
      {
        syntax: 'o',
        name: 'Aromatic oxygen',
        summary: 'A two-connected aromatic oxygen donating two π electrons.',
        detail:
          'Aromatic oxygen appears in five-membered heteroaromatics. Its lone pair completes the sextet, so furan is aromatic with four carbons contributing one electron each plus two from oxygen.',
        exampleSmiles: 'c1ccoc1',
        exampleNote: 'furan',
      },
      {
        syntax: 's',
        name: 'Aromatic sulfur',
        summary: 'A two-connected aromatic sulfur donating two π electrons.',
        detail:
          'Behaves like aromatic oxygen. Note that a thiophene S-oxide or sulfone sulfur is not aromatic in this model and must be written uppercase.',
        exampleSmiles: 'c1ccsc1',
        exampleNote: 'thiophene',
      },
      {
        syntax: '[cH-]',
        name: 'Charged aromatic atom',
        summary: 'Aromatic atoms may carry charges like any other.',
        detail:
          'The charge changes how many π electrons the atom contributes, so it participates in the 4N+2 test. Cyclopentadienyl is aromatic only because the anionic carbon donates two electrons instead of one.',
        exampleSmiles: '[cH-]1cccc1',
        exampleNote: 'the cyclopentadienyl anion — 6 π electrons',
      },
      {
        syntax: 'O=c1cc[nH]cc1',
        name: 'Exocyclic double bond on an aromatic atom',
        summary:
          'An aromatic ring atom may carry a double bond outside the ring.',
        detail:
          'The ring atom stays aromatic while a substituent is doubly bonded to it. Toolkits differ on whether they perceive such rings as aromatic, so pyridinones and similar tautomers are a classic source of round-tripping differences.',
        exampleSmiles: 'O=c1cc[nH]cc1',
        exampleNote: '4-pyridone',
      },
    ],
  },
  {
    id: 'smiles-charge-isotope',
    title: 'SMILES — Charges and isotopes',
    intro:
      'Formal charge and isotope are both bracket-atom properties. Charge follows the hydrogen count; the isotope precedes the element symbol.',
    entries: [
      {
        syntax: '+ / -',
        name: 'Unit charge',
        summary: 'A bare `+` or `-` means exactly one unit of charge.',
        detail:
          'The charge field comes after the hydrogen count and before the atom class. A charge of zero is simply omitted; `[C+0]` is legal but pointless.',
        exampleSmiles: 'CC(=O)[O-]',
        exampleNote: 'the acetate anion',
      },
      {
        syntax: '+n / -n',
        name: 'Multiple charge',
        summary: 'A signed number gives the exact formal charge.',
        detail:
          'This is the recommended form for charges beyond ±1. A conforming implementation must accept the range −15 to +15.',
        exampleSmiles: '[Ca+2].[O-]C(=O)[O-]',
        exampleNote: 'calcium carbonate',
      },
      {
        syntax: '++ / --',
        name: 'Repeated-sign charge (deprecated)',
        summary: 'Repeated signs are an old way of writing ±2.',
        detail:
          'OpenSMILES says a general-purpose parser should still accept `--` and `++` as −2 and +2 for backwards compatibility, "but this is a deprecated form and should be avoided". Write `+2` and `-2` instead.',
        exampleSmiles: '[Cu++].[O-]S(=O)(=O)[O-]',
        exampleNote: 'copper(II) sulfate written with the deprecated `++` form',
      },
      {
        syntax: '[NH3+] … [O-]',
        name: 'Zwitterions',
        summary:
          'Charges are local and independent; the molecule need not be neutral.',
        detail:
          'Each atom carries its own formal charge and nothing forces the total to zero. Amino acids at physiological pH are normally written as zwitterions.',
        exampleSmiles: 'C(C(=O)[O-])[NH3+]',
        exampleNote: 'glycine as a zwitterion',
      },
      {
        syntax: '[13C]',
        name: 'Isotope',
        summary: 'A leading number in brackets is the mass number.',
        detail:
          'The isotope field precedes the element symbol. Omitting it means natural isotopic abundance, which is *not* the same as writing the most common mass number — `C` and `[12C]` are different molecules to most toolkits.',
        exampleSmiles: '[13CH4]',
        exampleNote: 'methane-13C',
      },
      {
        syntax: '[2H]',
        name: 'Deuterium and tritium',
        summary: 'Hydrogen isotopes are written as isotopic bracket atoms.',
        detail:
          'There is no `D` or `T` symbol in SMILES; deuterium is `[2H]` and tritium `[3H]`. Because they are bracketed hydrogen atoms they are real nodes in the graph, unlike hydrogens written as an `Hn` count.',
        exampleSmiles: '[2H]O[2H]',
        exampleNote: 'heavy water, D2O',
      },
      {
        syntax: '[02H] = [2H]',
        name: 'Isotope is read as a number',
        summary: 'Leading zeros are insignificant.',
        detail:
          'The spec states that `[2H]`, `[02H]` and `[002H]` all mean deuterium. Implementations must accept at least three digits, which covers every known nuclide.',
        exampleSmiles: '[235U]',
        exampleNote: 'uranium-235',
      },
    ],
  },
  {
    id: 'smiles-tetrahedral',
    title: 'SMILES — Tetrahedral stereochemistry',
    intro:
      'Chirality in SMILES is purely local: it records the order in which the neighbours are written, not R/S. The same centre changes symbol when you re-root the string.',
    entries: [
      {
        syntax: '@',
        name: 'Anticlockwise tetrahedral centre',
        summary:
          'Looking from the first neighbour, the remaining three are anticlockwise.',
        detail:
          'Put the viewer at the first neighbour listed in the string, looking toward the chiral atom. `@` says the other three neighbours, taken in the order they appear in the string, run anticlockwise. The `@` glyph itself spirals anticlockwise as a mnemonic.',
        exampleSmiles: 'N[C@H](C)C(=O)O',
        exampleNote: 'D-alanine (R) — neighbours in order N, H, CH3, COOH',
      },
      {
        syntax: '@@',
        name: 'Clockwise tetrahedral centre',
        summary:
          'Looking from the first neighbour, the remaining three are clockwise.',
        detail:
          'The mirror image of `@`. Swapping any two neighbours in the string flips the symbol, so writing the same molecule from a different starting atom will often change `@` to `@@` with no change in the actual configuration.',
        exampleSmiles: 'N[C@@H](C)C(=O)O',
        exampleNote: 'L-alanine — the naturally occurring (S) enantiomer',
      },
      {
        syntax: '[C@H]',
        name: 'Where the implicit hydrogen sits in the order',
        summary:
          'A hydrogen written as a bracket property counts at the position of the brackets.',
        detail:
          'When the hydrogen is given as an `Hn` property rather than as `[H]`, it takes the place in the neighbour ordering where it is written — that is, immediately after the preceding atom. In `N[C@@H](C)C(=O)O` the order is therefore N, H, CH3, COOH.',
        exampleSmiles: 'C[C@@H](C(=O)O)N',
        exampleNote:
          'L-alanine again, re-rooted at the methyl — the order is now CH3, H, COOH, N, and the symbol happens to stay @@',
      },
      {
        syntax: '[C@H](…)',
        name: 'Chiral atom first in the string',
        summary:
          'With no preceding atom, the implicit hydrogen is the *first* neighbour.',
        detail:
          'If the stereocentre is the very first atom of the SMILES there is no preceding neighbour, so the implicit hydrogen becomes neighbour number one — the atom you look *from*. This is a classic source of inverted structures when a string is re-rooted by hand.',
        exampleSmiles: '[C@H](N)(C)C(=O)O',
        exampleNote:
          'L-alanine written with the stereocentre first — the order is H, N, CH3, COOH, so the symbol flips from @@ to @',
      },
      {
        syntax: 'C[C@H]1CCCCO1',
        name: 'Ring closures in the neighbour ordering',
        summary:
          'A ring-closure bond takes the position of its digit, not of the far atom.',
        detail:
          'The neighbour order follows the order the *bonds* appear in the string. A ring-closure number counts where the digit is written, even though the atom it connects to appears much later.',
        exampleSmiles: 'C[C@H]1CCCCO1',
        exampleNote:
          '(S)-2-methyltetrahydropyran — neighbours are CH3, H, ring-closure O, ring CH2',
      },
      {
        syntax: '[C@](A)(B)(C)D',
        name: 'Multiple stereocentres',
        summary: 'Every centre is specified independently.',
        detail:
          'Each stereocentre is described by its own local neighbour ordering; there is no molecule-wide reference. Partial specification is allowed — you may mark one centre and leave others unspecified.',
        exampleSmiles: 'OC[C@H]1O[C@@H](O)[C@H](O)[C@@H](O)[C@@H]1O',
        exampleNote:
          'β-D-glucopyranose — five stereocentres, each written independently',
      },
    ],
  },
  {
    id: 'smiles-cistrans',
    title: 'SMILES — Double-bond (cis/trans) stereochemistry',
    intro:
      'The `/` and `\\` symbols mark the single bonds *around* a double bond, never the double bond itself. Their meaning is relative to the atom they touch, which is why they trip everyone up.',
    entries: [
      {
        syntax: '/ and \\',
        name: 'Directional single bonds',
        summary:
          'They mark a single bond as pointing "up" or "down" relative to the alkene.',
        detail:
          'Read `F/C` as "F below, C above" and `F\\C` as "F above, C below". The double bond itself is written `=` as usual; the configuration is carried entirely by the directional bonds on either side. Both ends need a directional bond for the configuration to be defined.',
        exampleSmiles: 'C/C=C/C',
        exampleNote: '(E)-2-butene',
      },
      {
        syntax: 'F/C=C/F',
        name: 'Matching slashes mean trans',
        summary:
          'Two slashes leaning the same way give the *trans* (E) isomer.',
        detail:
          'This is the pitfall: the two `/` symbols look parallel, so `F/C=C/F` reads visually like "same side", but it is trans-1,2-difluoroethene. Draw it out — the first `/` puts F below the left carbon, the second `/` puts F above the right carbon, so the two fluorines are on opposite sides of the double bond.',
        exampleSmiles: 'F/C=C/F',
        exampleNote: 'trans-1,2-difluoroethene (E) — NOT cis',
      },
      {
        syntax: String.raw`F/C=C\F`,
        name: 'Opposing slashes mean cis',
        summary: 'A `/` and a `\\` give the *cis* (Z) isomer.',
        detail:
          'The mirror of the previous entry: `/` then `\\` puts both fluorines below the double bond, so this is the cis (Z) isomer. Equivalently `F\\C=C/F` is also cis.',
        exampleSmiles: String.raw`F/C=C\F`,
        exampleNote: 'cis-1,2-difluoroethene (Z)',
      },
      {
        syntax: String.raw`C(\F)=C/F`,
        name: 'Direction is relative to the atom, not the double bond',
        summary:
          'Moving a substituent from left to right of its carbon flips the symbol.',
        detail:
          'OpenSMILES is explicit that the up-ness or down-ness is read relative to the carbon the bond touches. So `F/C=C/F` and `C(\\F)=C/F` are the same trans molecule: the fluorine moved from before the carbon to after it, so the symbol had to flip.',
        exampleSmiles: String.raw`C(\F)=C/F`,
        exampleNote:
          'trans-1,2-difluoroethene, written with the first fluorine in a branch — the same molecule as F/C=C/F',
      },
      {
        syntax: 'C/C=C/C=C/C',
        name: 'Conjugated systems',
        summary:
          'Each double bond takes its configuration from the directional bonds that flank it.',
        detail:
          'A single directional bond can serve two adjacent double bonds in a conjugated chain, so the symbols alternate naturally. Every double bond whose flanking bonds both carry a direction is defined; the rest are unspecified.',
        exampleSmiles: 'F/C=C/C=C/F',
        exampleNote:
          '(1E,3E)-1,4-difluorobuta-1,3-diene — both double bonds are E',
      },
      {
        syntax: 'C/C=CC',
        name: 'Partial specification',
        summary:
          'A double bond with a direction on only one side is unspecified.',
        detail:
          'Both ends must carry a directional bond for the geometry to be determined. Marking only one side is legal — the double bond is simply left with unknown configuration, which is different from being explicitly a mixture.',
        exampleSmiles: 'C/C=CC',
        exampleNote:
          '2-butene with undefined double-bond geometry — parsers drop the lone direction',
      },
      {
        syntax: String.raw`C/C(\F)=C/F`,
        name: 'Contradictory directions are invalid',
        summary:
          'Two substituents on the same alkene carbon cannot both point the same way.',
        detail:
          'In `C/C(\\F)=C/F` the methyl and the fluorine would both be "down" relative to the first alkene carbon, which is geometrically impossible. A parser is entitled to reject it.',
        exampleSmiles: 'C/C(F)=C/F',
        exampleNote:
          '(Z)-1,2-difluoroprop-1-ene — the legal way to write it, with the contradictory direction dropped',
      },
    ],
  },
  {
    id: 'smiles-classes-reactions',
    title: 'SMILES — Atom classes and reaction SMILES',
    intro:
      'An atom class is an arbitrary integer label with no chemical meaning. Its main use is atom-to-atom mapping across a reaction arrow.',
    entries: [
      {
        syntax: ':n',
        name: 'Atom class',
        summary: 'A colon and an integer label the atom for the application.',
        detail:
          'OpenSMILES: "an atom class is an arbitrary integer, a number that has no chemical meaning. It is used by applications to mark atoms in ways that are meaningful only to the application." It comes last in the bracket, several atoms may share a class, and a parser must accept at least 0–9999.',
        exampleSmiles: 'CC(=O)[OH:1]',
        exampleNote: 'acetic acid with its hydroxyl oxygen labelled class 1',
      },
      {
        syntax: '>>',
        name: 'Reaction SMILES',
        summary: 'Reactants and products separated by a double arrow.',
        detail:
          'A reaction SMILES is `reactants>agents>products`. With no agents the two `>` are written together. Each of the three roles is itself a dot-separated list of components.',
        exampleSmiles: 'CCO.CC(=O)O>>CCOC(C)=O.O',
        exampleNote:
          'Fischer esterification: ethanol + acetic acid → ethyl acetate + water',
      },
      {
        syntax: '>agents>',
        name: 'The agent field',
        summary: 'The middle field holds catalysts, solvents and reagents.',
        detail:
          'Species that are neither consumed as reactants nor formed as products go between the two arrows. The field may be empty, which is what `>>` means; it may also hold several dot-separated components.',
        exampleSmiles: 'CCO.CC(=O)O>[H+]>CCOC(C)=O.O',
        exampleNote:
          'the same esterification, with the acid catalyst in the agent field',
      },
      {
        syntax: '[C:1] … [C:1]',
        name: 'Atom mapping',
        summary:
          'Matching atom classes on both sides trace atoms through the reaction.',
        detail:
          'This is the dominant real-world use of atom classes: an atom with class *n* among the reactants is the same physical atom as the one with class *n* among the products. Unmapped atoms are simply not tracked.',
        exampleSmiles:
          '[CH3:1][CH2:2][OH:3].[CH3:4][C:5](=[O:6])[OH:7]>>[CH3:4][C:5](=[O:6])[O:3][CH2:2][CH3:1].[OH2:7]',
        exampleNote:
          'esterification with every heavy atom mapped — the alcohol oxygen (:3) ends up in the ester, the acid oxygen (:7) in the water',
      },
      {
        syntax: 'A.B>>C',
        name: 'Multiple components per role',
        summary: 'Each role is a dot-separated component list.',
        detail:
          'The dot has its usual meaning of "not bonded". Ordering within a role carries no meaning, and stoichiometry is not expressed — a species consumed twice is normally written twice.',
        exampleSmiles: 'C=C.C=CC=C>>C1=CCCCC1',
        exampleNote:
          'a Diels–Alder reaction between ethene and 1,3-butadiene giving cyclohexene',
      },
    ],
  },
  {
    id: 'smiles-forms',
    title: 'SMILES — Multi-component structures and SMILES flavours',
    intro:
      'One molecule has many valid SMILES. Canonicalisation picks one of them; isomeric SMILES adds the stereochemistry and isotope layers.',
    entries: [
      {
        syntax: 'A.B',
        name: 'Salts and multi-component structures',
        summary:
          'Dot-separated components form one SMILES for a multi-component substance.',
        detail:
          'Ionic compounds, co-crystals, solvates and mixtures are all written as a single string with dots. The components are unordered as far as chemistry is concerned, though canonicalisation will fix an order.',
        exampleSmiles: 'CC(=O)[O-].[Na+]',
        exampleNote: 'sodium acetate',
      },
      {
        syntax: 'O.O.O',
        name: 'Hydrates and solvates',
        summary: 'Repeat a component to express stoichiometry.',
        detail:
          'There is no multiplier syntax; five waters of crystallisation are five dot-separated `O` components. Some toolkits will normalise or strip such components during standardisation.',
        exampleSmiles: '[Cu+2].[O-]S(=O)(=O)[O-].O.O.O.O.O',
        exampleNote: 'copper(II) sulfate pentahydrate',
      },
      {
        syntax: 'CCO = OCC = C(O)C',
        name: 'Arbitrary (non-canonical) SMILES',
        summary: 'The same molecule has many equally valid SMILES.',
        detail:
          'Any depth-first traversal of the molecular graph from any starting atom yields a valid SMILES. All are equally correct, which is why string comparison is never a valid test of chemical identity.',
        exampleSmiles: 'C(O)C',
        exampleNote:
          'ethanol, written from the middle carbon outwards — the same molecule as CCO and OCC',
      },
      {
        syntax: '(canonical SMILES)',
        name: 'Canonical SMILES',
        summary: 'One algorithmically chosen SMILES per structure.',
        detail:
          'A canonicalisation algorithm orders the atoms deterministically so that a given structure always produces the same string, making SMILES usable as a database key. Canonical forms are only comparable within one toolkit and version — RDKit and OpenEye will disagree.',
        exampleSmiles: 'Cc1ccccc1',
        exampleNote: 'toluene, as RDKit canonicalises it',
      },
      {
        syntax: '(isomeric SMILES)',
        name: 'Isomeric SMILES',
        summary: 'A SMILES that includes isotope and stereochemistry.',
        detail:
          'Daylight names the flavour that carries isotopic labels, tetrahedral chirality and double-bond configuration "isomeric SMILES"; a canonicalised isomeric SMILES is an "absolute SMILES". Dropping these layers gives the constitution only.',
        exampleSmiles: 'C/C=C/[C@@H](O)C',
        exampleNote:
          '(2S,3E)-pent-3-en-2-ol — carries both a stereocentre and a double-bond configuration',
      },
    ],
  },
  SMILES_VS_SMARTS,
];
