import { SMILES_VS_SMARTS } from './shared.ts';
import type { ReferenceSection } from './types.ts';

/**
 * The SMARTS notation on one page.
 *
 * Written against the Daylight theory manual, which is the definition of the
 * language. SMARTS looks like SMILES and is read differently: every atom and
 * every bond is a *condition*, so the sheet opens on what the shared characters
 * stop meaning before it lists what SMARTS adds.
 *
 * An entry the language allows and openchemlib does not implement shows its
 * example as text instead of as a drawing rather than being left out: the sheet
 * documents the notation, not the toolkit this page happens to run on.
 */
export const SMARTS_SECTIONS: ReferenceSection[] = [
  SMILES_VS_SMARTS,
  {
    id: 'smarts-atoms',
    title: 'SMARTS — Atom primitives',
    intro:
      'Every SMILES expression is also a valid SMARTS expression, and it stops meaning the same thing: a property the text leaves unwritten is a default in a SMILES and no condition at all in a SMARTS. The SMILES `O` is water; the SMARTS `O` matches any aliphatic oxygen whatever its charge, its hydrogens or its isotope. These primitives are how the conditions are put back.',
    entries: [
      {
        syntax: '*',
        name: 'Any atom',
        summary: 'Matches any atom whatsoever.',
        detail:
          'The wildcard has no default and no implied properties: in SMARTS it is the neutral element other primitives decorate, as in `[*+]` or `[*;R]`. The same character says much more in a SMILES, where a bare `*` has no isotope, a mass of zero, unspecified chirality, no hydrogens and no charge — so the SMILES `C*` is a methyl bonded to one bare unknown atom, while the SMARTS `C*` matches any atom at all bonded to any aliphatic carbon.',
        exampleSmiles: '*',
        exampleNote: 'matches every atom in any molecule',
      },
      {
        syntax: 'a',
        name: 'Aromatic atom',
        summary: 'Matches any aromatic atom.',
        detail:
          'Together with `A` this partitions all atoms. Note the asymmetry with SMILES element symbols: `c` matches only aromatic carbon, while `a` matches aromatic anything.',
        exampleSmiles: '[a]',
        exampleNote:
          'matches the aromatic atoms of pyridine — five carbons and the nitrogen',
      },
      {
        syntax: 'A',
        name: 'Aliphatic atom',
        summary: 'Matches any non-aromatic atom.',
        detail:
          'The complement of `a`. `[A]` and `[a]` between them match every heavy atom in a molecule.',
        exampleSmiles: '[A]',
        exampleNote:
          'matches the methyl carbon of toluene but none of the ring',
      },
      {
        syntax: 'D<n>',
        name: 'Degree',
        summary: 'Number of explicit connections in the graph.',
        detail:
          'Counts the bonds drawn in the target molecule, ignoring implicit hydrogens and ignoring bond order. Bare `D` defaults to `D1`. Contrast with `X`, which does count implicit hydrogens.',
        exampleSmiles: '[CD4]',
        exampleNote:
          'matches the quaternary central carbon of neopentane, and nothing in butane',
      },
      {
        syntax: 'H<n>',
        name: 'Total hydrogen count',
        summary: 'Number of attached hydrogens, implicit plus explicit.',
        detail:
          'Bare `H` means `H1`, and the count is the total — implicit and explicit together. Beware the ambiguity inside brackets: in `[CH]` the `H` is the count primitive, but on its own it is the element, so `[H]` is a hydrogen atom and `[H+]` a proton rather than "an atom with one hydrogen and a positive charge". To ask for a count without naming the element, decorate the wildcard: `[*H2]` is any atom with exactly two hydrogens.',
        exampleSmiles: '[CH3]',
        exampleNote: 'matches the three methyl carbons of isobutane',
      },
      {
        syntax: 'h<n>',
        name: 'Implicit hydrogen count',
        summary: 'Counts only the hydrogens that are not drawn as atoms.',
        detail:
          'Unlike the others this defaults to "at least one" when the number is omitted, so `[h]` means `h1` or more. Because whether a hydrogen counts as implicit depends on how the target was written and sanitised, `H` is almost always the more portable primitive.',
        exampleSmiles: '[nh1]',
        exampleNote: 'matches the pyrrole-type nitrogen of indole',
      },
      {
        syntax: 'R<n>',
        name: 'Ring membership',
        summary: 'Number of SSSR rings the atom belongs to.',
        detail:
          'Bare `R` means "in at least one ring" (any ring atom). `R2` picks out ring-fusion atoms. Ring membership depends on the smallest set of smallest rings, which is not unique for some cage systems, so `R<n>` can differ between toolkits there.',
        exampleSmiles: '[R2]',
        exampleNote:
          'matches the two fusion carbons of naphthalene, and nothing in benzene',
      },
      {
        syntax: 'R0',
        name: 'Acyclic atom',
        summary: 'An atom in no ring at all.',
        detail:
          'The idiom `!R0` ("not in zero rings") is exactly equivalent to `R`, and both appear in real-world SMARTS. `R0` is the standard way to require a chain atom.',
        exampleSmiles: '[R0]',
        exampleNote: 'matches the methyl carbon of toluene, not the ring',
      },
      {
        syntax: 'r<n>',
        name: 'Ring size',
        summary: 'The atom is in a smallest ring of size n.',
        detail:
          'Bare `r` means any ring atom, like `R`. `r<n>` tests the size of the **smallest** ring the atom is in, which is not the same as "is in a ring of size n": the two fusion carbons of indane belong to both its five- and its six-membered ring, so they are `r5` and `[r6]` misses them. `r6` is safe for an isolated or 6/6-fused six-ring; a fused system needs `R` and an explicit ring pattern.',
        exampleSmiles: '[r6]',
        exampleNote:
          'matches every atom of cyclohexane, and nothing in cyclobutane',
      },
      {
        syntax: 'v<n>',
        name: 'Valence',
        summary: 'Sum of the bond orders at the atom.',
        detail:
          'Counts bond orders, including bonds to hydrogen. A sulfone sulfur has `v6`, a nitro nitrogen written with a pentavalent N has `v5`. Bare `v` means `v1`.',
        exampleSmiles: '[Sv6]',
        exampleNote: 'matches the sulfur of dimethyl sulfone, not that of DMSO',
      },
      {
        syntax: 'X<n>',
        name: 'Connectivity',
        summary: 'Total connections, counting implicit hydrogens.',
        detail:
          'The workhorse primitive of functional-group SMARTS. `[CX4]` is an sp³ carbon, `[CX3]` an sp² carbon, `[OX2]` a divalent oxygen, `[NX3]` a trivalent nitrogen. Bare `X` means `X1`.',
        exampleSmiles: '[CX4]',
        exampleNote:
          'matches every sp³ carbon — all four carbons of butane, none of ethene',
      },
      {
        syntax: 'x<n>',
        name: 'Ring connectivity',
        summary: "Number of the atom's bonds that are ring bonds.",
        detail:
          'Defaults to "at least one" when the number is omitted. `x3` and above marks fusion and bridgehead atoms; `x2` is an ordinary ring atom.',
        exampleSmiles: '[cx3]',
        exampleNote:
          'matches the fusion carbons of naphthalene, and nothing in benzene',
      },
      {
        syntax: '-<n>',
        name: 'Negative charge',
        summary: 'Formal charge of −n.',
        detail:
          'Bare `-` means −1; larger charges are written `-2`, `-3` … Most parsers still accept `--` for −2, but OpenSMILES calls the doubled form deprecated and the Daylight table has no such row, so write `[O-2]` rather than `[O--]`. `[O-]` in a SMARTS is a query for a negatively charged oxygen, not an instruction to make one.',
        exampleSmiles: '[O-2]',
        exampleNote: 'matches the oxide dianion of calcium oxide',
      },
      {
        syntax: '+<n>',
        name: 'Positive charge',
        summary: 'Formal charge of +n.',
        detail:
          'Bare `+` means +1; larger charges are written `+2`, `+3` … (`++` is the same deprecated doubled form). `[N+]` matches quaternary ammonium and charge-separated nitro nitrogens alike, so it usually needs pairing with `X` or `H`.',
        exampleSmiles: '[N+]',
        exampleNote: 'matches the nitrogen of the tetramethylammonium cation',
      },
      {
        syntax: '#n',
        name: 'Atomic number',
        summary: 'Matches by atomic number, ignoring aromaticity.',
        detail:
          'Crucial in practice: `[C]` matches aliphatic carbon only and `[c]` aromatic carbon only, whereas `[#6]` matches *any* carbon. Most published functional-group SMARTS use `[#6]` for exactly this reason.',
        exampleSmiles: '[#6]',
        exampleNote:
          'matches all seven carbons of toluene, ring and methyl alike',
      },
      {
        syntax: 'C vs c vs [#6]',
        name: 'Case is a query, not a spelling',
        summary: 'Uppercase means aliphatic, lowercase means aromatic.',
        detail:
          "This is the most common SMARTS mistake carried over from SMILES habits. A pattern written `CC(=O)O` finds nothing at all in benzoic acid — its one carboxyl carbon's other neighbour is an aromatic `c`, which the leading aliphatic `C` refuses — so `[#6]` or `[C,c]` is what to write when either form should hit.",
        exampleSmiles: '[C,c]',
        exampleNote: 'matches any carbon of benzene, aromatic or not',
      },
      {
        syntax: '[13C], [35*]',
        name: 'Isotope query',
        summary: 'A leading number queries the mass number.',
        detail:
          'An isotope written in a SMARTS is a requirement, not a decoration: `[13C]` matches only carbon-13 atoms, and `[35*]` any atom of mass 35 whatever the element. The omitted case diverges: the Daylight default is "unspecified mass", so `[C]` matches a carbon-13 as readily as an ordinary carbon, while a SMILES with no mass number states that the atom has the naturally-occurring isotopic ratios. There is no primitive for "unlabelled" — negate the masses you mean to exclude.',
        exampleSmiles: '[13C]',
        exampleNote:
          'matches the carbon of methane-13C, not that of ordinary methane',
      },
      {
        syntax: '@ / @@',
        name: 'Chirality query',
        summary: 'Match a specified tetrahedral configuration.',
        detail:
          'The SMILES chirality symbols work as SMARTS primitives, matching only atoms with that configuration. The configuration is read against the order the *pattern* writes the neighbours, so a chirality primitive on an atom whose neighbours the pattern does not name — `[C@H1]` — has nothing to compare against and behaves differently from toolkit to toolkit: always write the neighbours. Most toolkits also ignore chirality in substructure search unless it is explicitly switched on.',
        exampleSmiles: 'C[C@H](F)O',
        exampleNote:
          'matches a carbon whose H, F and O run anticlockwise seen from the methyl; the mirror-image centre needs `C[C@@H](F)O`',
      },
      {
        syntax: '@? / @@?',
        name: 'Chirality or unspecified',
        summary:
          'Match that configuration, or an atom whose configuration was never given.',
        detail:
          'A trailing `?` widens a chirality primitive to "that chirality **or** unspecified", which is what a query wants against a database where stereochemistry is patchy — without it, an atom carrying no configuration does not match at all. The chiral class may also be named in full, `@TH1`, `@AL1`, `@SP1`, `@TB1`, `@OH1`, of which `@` and `@@` are the tetrahedral shorthand.',
        exampleSmiles: 'C[C@?H](F)O',
        exampleNote:
          'matches that centre and an undrawn one alike, but not its mirror image',
      },
      {
        syntax: '[#1]',
        name: 'A hydrogen as an atom',
        summary:
          'The unambiguous way to ask for a hydrogen atom, `[H]` being the count primitive in disguise.',
        detail:
          'Because `H` inside brackets is read as a hydrogen count, `[#1]` is how a query names the element itself, and `[!#1]` is the idiom for "any atom that is not a hydrogen". A hydrogen only matches at all where the target carries it as an atom rather than as a count, which is why patterns for hydrogen are usually written as a recursive expression on the heavy atom instead.',
        exampleSmiles: '[!#1]',
        exampleNote: 'any atom except a hydrogen',
      },
      {
        syntax: '^n',
        name: 'Hybridisation (extension)',
        summary: 'Query the hybridisation state directly.',
        detail:
          'Not part of the Daylight specification: `^n` is an RDKit and OpenBabel extension where `^0` is S, `^1` SP, `^2` SP2, `^3` SP3, `^4` SP3D and `^5` SP3D2. Portable patterns use `X` and `v` instead.',
        exampleSmiles: '[C^2]',
        exampleNote: 'matches the sp² carbons of ethene, none of ethane',
      },
    ],
  },
  {
    id: 'smarts-bonds',
    title: 'SMARTS — Bond primitives',
    intro:
      'Most SMILES bond symbols carry over — `-`, `=`, `#`, `:`, `/`, `\\` — and SMARTS adds a wildcard, a ring-bond test and the "or unspecified" directional forms. Two things do not: `$` is a quadruple bond in SMILES and opens a recursive SMARTS here, and the bond left unwritten does not mean the same in the two languages.',
    entries: [
      {
        syntax: '(adjacency)',
        name: 'Default bond',
        summary: 'Single **or** aromatic.',
        detail:
          "This is the bond default that surprises people. Adjacency between two aromatic atoms is an *aromatic* bond in SMILES; in SMARTS it is *single or aromatic* — exactly `-,:`. So the SMARTS `cc` matches the aromatic bonds inside biphenyl's rings **and** the plain single bond joining them. Write `:` when only an aromatic bond will do, and `-` when only a single one will.",
        exampleSmiles: 'CC',
        exampleNote: 'matches the single bond of ethane',
      },
      {
        syntax: '-',
        name: 'Single bond',
        summary: 'A single bond that is explicitly **not** aromatic.',
        detail:
          'The atoms may be aromatic — it is the bond that must not be. `c-c` matches two aromatic carbons joined by a genuine single bond, as in biphenyl, while `cc` would also match the aromatic bonds inside a ring. Mind the SMILES habit: there `-` is redundant, `C-C` being the same as `CC`, while here it is a restriction, so `c1-c-c-c-c-c1` never matches benzene.',
        exampleSmiles: 'c-c',
        exampleNote:
          'matches the inter-ring bond of biphenyl, and nothing in benzene',
      },
      {
        syntax: '=',
        name: 'Double bond',
        summary: 'A double bond.',
        detail:
          'Standard in carbonyl, alkene and nitro patterns. Note that a double bond inside a ring perceived as aromatic will match `:`, not `=`.',
        exampleSmiles: 'C=C',
        exampleNote: 'matches the carbon–carbon double bond of ethene',
      },
      {
        syntax: '#',
        name: 'Triple bond',
        summary: 'A triple bond.',
        detail:
          'Used for alkynes and nitriles. Mind the collision with the atom primitive: `#` **between** two atoms is a triple bond, while `#n` **inside** brackets is an atomic number — `C#N` is a carbon–nitrogen triple bond, `[#7]` is any nitrogen.',
        exampleSmiles: 'C#N',
        exampleNote: 'matches the carbon–nitrogen triple bond of acetonitrile',
      },
      {
        syntax: ':',
        name: 'Aromatic bond',
        summary: 'A bond perceived as aromatic.',
        detail:
          'In SMILES a bond between two aromatic atoms is aromatic by default, so writing `:` there is optional. Not so here: the unwritten bond means *single or aromatic*, so `:` is a real restriction — `c:c` matches only the aromatic ring bonds of biphenyl, where `cc` matches those and the single bond joining the rings as well. Note the second collision: `:` between two atoms is this bond, while `:n` inside brackets is an atom map.',
        exampleSmiles: 'c:c',
        exampleNote: 'matches an aromatic carbon–carbon bond in benzene',
      },
      {
        syntax: '~',
        name: 'Any bond',
        summary: 'Matches a bond of any order.',
        detail:
          'The bond wildcard. Indispensable when a fragment should match regardless of how a toolkit perceived the bond orders — tautomers, nitro groups, carboxylates, metal coordination.',
        exampleSmiles: '*~*',
        exampleNote:
          'matches any two bonded atoms, e.g. the C–C bond of ethane',
      },
      {
        syntax: '@',
        name: 'Ring bond',
        summary: 'The bond is part of a ring.',
        detail:
          'Note the collision with the chirality symbol: `@` between two atoms is a ring-bond test, `@` inside brackets is chirality. Combine with other bond primitives, e.g. `=@` for a ring double bond.',
        exampleSmiles: '*@*',
        exampleNote:
          'matches the ring bonds of cyclopropane, and nothing in ethane',
      },
      {
        syntax: '!@',
        name: 'Acyclic bond',
        summary: 'The bond is not in a ring.',
        detail:
          'The negation of the ring-bond primitive, and the backbone of rotatable-bond definitions. `-!@` means "an acyclic single bond".',
        exampleSmiles: '*!@*',
        exampleNote:
          'matches the methyl–ring bond of toluene, and nothing in benzene',
      },
      {
        syntax: '/ and \\',
        name: 'Directional bond',
        summary: 'Query a specific double-bond configuration.',
        detail:
          'The SMILES directional bonds work as SMARTS bond primitives, matching only structures with that geometry assigned. As with atom chirality, most toolkits ignore them unless stereochemistry-aware matching is enabled.',
        exampleSmiles: 'F/C=C/F',
        exampleNote: 'matches trans-1,2-difluoroethene but not the cis isomer',
      },
      {
        syntax: String.raw`/? and \?`,
        name: 'Directional bond or unspecified',
        summary: 'The geometry as written, **or** none recorded at all.',
        detail:
          'A plain `/` matches only a bond that carries that direction, so a query written with one silently fails on every target whose double-bond geometry was never assigned — which is most of a real database. The `?` forms accept both. The same `?` widens atom chirality: `[C@?H]`.',
        exampleSmiles: 'F/?C=C/?F',
        exampleNote:
          'matches trans-1,2-difluoroethene and a difluoroethene whose geometry was never given, but not the cis isomer',
      },
      {
        syntax: '@;!:',
        name: 'A non-aromatic ring bond',
        summary:
          'The combination that says "in a ring, but not one of the aromatic bonds".',
        detail:
          'Ring membership and aromaticity are separate questions, so asking for a saturated ring bond takes both: `*@;!:*` matches the bonds of cyclohexane and none of benzene. `@` alone would take both, and `!:` alone would also take every chain bond.',
        exampleSmiles: '*@;!:*',
        exampleNote:
          'matches every bond of cyclohexane, and no bond of benzene',
      },
      {
        syntax: '-,:',
        name: 'Combined bond expressions',
        summary: 'Bond primitives take the logical operators too.',
        detail:
          'The operators `!`, `&`, `,` and `;` apply to bonds exactly as they do to atoms. `-,:` — "single or aromatic" — is the most common combination and is what the default bond already means.',
        exampleSmiles: 'c-,:c',
        exampleNote:
          'matches both the inter-ring single bond and the aromatic ring bonds of biphenyl',
      },
    ],
  },
  {
    id: 'smarts-logic',
    title: 'SMARTS — Logical operators',
    intro:
      'Four operators combine primitives — atom primitives inside a bracket, bond primitives between two atoms with no bracket at all. Precedence, from tightest to loosest, is `!` then `&` then `,` then `;`; getting it wrong silently changes what a pattern matches rather than failing.',
    entries: [
      {
        syntax: '!e',
        name: 'NOT',
        summary: 'Negates the following expression.',
        detail:
          'The highest-precedence operator, binding only to the single primitive that follows it. `[!C]` is any atom that is not an aliphatic carbon — aromatic carbon included, since `C` means aliphatic carbon only. Because `!` binds tighter than `,`, `[!C,N]` reads "(not aliphatic carbon) **or** aliphatic nitrogen", which matches very nearly everything; "neither carbon nor nitrogen" is `[!C;!N]`.',
        exampleSmiles: '[!C]',
        exampleNote:
          'matches the oxygen of ethanol, and also every aromatic carbon of benzene',
      },
      {
        syntax: '&',
        name: 'High-precedence AND',
        summary: 'Both expressions must hold.',
        detail:
          'Binds more tightly than `,`. `[C&H1]` is an aliphatic carbon with exactly one hydrogen.',
        exampleSmiles: '[C&H1]',
        exampleNote: 'matches the methine carbon of isobutane',
      },
      {
        syntax: '(implicit &)',
        name: 'Juxtaposition is AND',
        summary: 'Adjacent primitives are joined by an implicit `&`.',
        detail:
          'Writing primitives side by side means high-precedence AND, so `[nH1]`, `[n&H1]` and `[n;H1]` all mean the same thing here. The implicit operator is `&`, not `;` — which matters as soon as a `,` is in the same bracket.',
        exampleSmiles: '[nH1]',
        exampleNote: 'matches the pyrrole-type nitrogen of indole',
      },
      {
        syntax: ',',
        name: 'OR',
        summary: 'Either expression may hold.',
        detail:
          'Lower precedence than `&`, higher than `;`. The standard way to write an element list.',
        exampleSmiles: '[F,Cl,Br,I]',
        exampleNote:
          'matches any of the first four halogens — the chlorine of chlorobenzene, for instance',
      },
      {
        syntax: ';',
        name: 'Low-precedence AND',
        summary: 'Both expressions must hold, binding loosest of all.',
        detail:
          'Semantically identical to `&` but with the lowest precedence, so it acts like a bracket around everything on either side. That is precisely why the language has two ANDs: there are no grouping parentheses to be had inside a bracket — `[(c,n)&H1]` is not valid, and a `(` in an atom expression opens a recursive `$(...)` instead. So `;` is how a whole OR-list is ANDed with something else, which is why real-world SMARTS are punctuated with it.',
        exampleSmiles: '[!C;R]',
        exampleNote:
          'matches the ring carbons of benzene (not aliphatic C, and in a ring) but nothing in butane',
      },
      {
        syntax: '[c,n;H1] vs [c,n&H1]',
        name: 'Precedence, worked out',
        summary:
          'The same primitives give different queries depending on the AND used.',
        detail:
          '`[c,n;H1]` parses as `(c OR n) AND H1` — an aromatic carbon or nitrogen carrying exactly one hydrogen. `[c,n&H1]` parses as `c OR (n AND H1)` — any aromatic carbon at all, or an aromatic nitrogen with exactly one hydrogen. In pyridine the first matches only the five CH carbons; the second matches those same carbons but for a different reason, and would also match a bare aromatic carbon with no hydrogen.',
        exampleSmiles: '[c,n;H1]',
        exampleNote:
          'matches the five CH carbons of pyridine, not the nitrogen',
      },
      {
        syntax: '[!C;!R0]',
        name: 'Double negation idiom',
        summary: '`!R0` is another way of writing "in a ring".',
        detail:
          'Daylight lists `[!C;R]` and `[!C;!R0]` as equivalent. Both idioms are common in published SMARTS, so it is worth recognising the second.',
        exampleSmiles: '[!C;!R0]',
        exampleNote:
          'matches the aromatic ring carbons of benzene — non-aliphatic-carbon atoms that are in at least one ring',
      },
      {
        syntax: '*!@*',
        name: 'Operators on bonds',
        summary: 'The same four operators apply to bond expressions.',
        detail:
          'Bond expressions are built exactly like atom expressions: `!@` is a non-ring bond, `=,:` a double or aromatic bond, `-;!@` an acyclic single bond.',
        exampleSmiles: 'C-;!@C',
        exampleNote:
          'matches the acyclic C–C single bond of ethane, and nothing in cyclopropane',
      },
    ],
  },
  {
    id: 'smarts-recursive',
    title: 'SMARTS — Recursive SMARTS',
    intro:
      'A recursive SMARTS turns a whole environment into a property of one atom. It is what makes SMARTS able to express "an amine nitrogen that is not an amide".',
    entries: [
      {
        syntax: '$(...)',
        name: 'Recursive SMARTS',
        summary: 'A complete SMARTS used as an atom property.',
        detail:
          'Daylight: "any SMARTS expression may be used to define an atomic environment by writing a SMARTS starting with the atom of interest". The match is anchored on the first atom of the inner pattern, and only that atom is reported as matched by the outer expression.',
        exampleSmiles: '[$(*C)]',
        exampleNote:
          'matches any atom attached to an aliphatic carbon — every carbon of propane, and the hydroxyl oxygen of ethanol too, since the inner C carries no hydrogen constraint',
      },
      {
        syntax: '[$(a);$(b)]',
        name: 'Several environments at once',
        summary:
          'An atom may be required to satisfy more than one environment.',
        detail:
          'This is the reason recursion exists. `Caa(O)aN` forces a single ring path and therefore misses some substitution patterns, while `C[$(aaO);$(aaaN)]` requires both environments independently and catches every case.',
        exampleSmiles: 'C[$(aaO);$(aaaN)]',
        exampleNote:
          "a methyl carbon on an aromatic atom that is both ortho to O and meta to N — Daylight's worked example",
      },
      {
        syntax: '!$(...)',
        name: 'Negated environment',
        summary: 'Exclude atoms in a given environment.',
        detail:
          'The most-used form in practice: it is how a functional-group pattern rules out look-alikes. It is also the only way to say "an atom that is *not* in this environment", since no single primitive can express it.',
        exampleSmiles: '[OX2H;!$([OX2H][CX3]=[OX1])]',
        exampleNote:
          'a hydroxyl oxygen that is not part of a carboxylic acid — matches ethanol, not acetic acid',
      },
      {
        syntax: '[$(...),$(...)]',
        name: 'Alternative environments',
        summary: 'OR together two whole environments.',
        detail:
          'The standard way to cover a group that databases store in more than one protonation or resonance form, without relying on which form the target happens to use.',
        exampleSmiles: '[$([OX2H]),$([OX1-])]',
        exampleNote:
          'a hydroxyl oxygen or an oxide anion — matches both ethanol and the acetate anion',
      },
    ],
  },
  {
    id: 'smarts-components',
    title: 'SMARTS — Component-level grouping',
    intro:
      'Zero-level parentheses say whether dot-separated parts of a query must come from the same molecule or from different ones. They are the only SMARTS construct with no SMILES counterpart.',
    entries: [
      {
        syntax: '.',
        name: 'Dot in SMARTS',
        summary:
          'The two atoms are not bonded — but may be in the same component.',
        detail:
          'Unlike the SMILES dot, the SMARTS dot only says "no bond between these two atoms". It places no constraint at all on whether they belong to the same connected component.',
        exampleSmiles: 'C.C',
        exampleNote:
          "two unbonded carbons — matches ethane's two carbons, and also carbons in two different molecules",
      },
      {
        syntax: '(...)',
        name: 'Zero-level parentheses',
        summary: 'Parentheses at the top level group a component.',
        detail:
          'Parentheses written where an atom would start — not after an atom, which would be a branch — constrain component membership. This is what lets a reaction query distinguish intramolecular from intermolecular chemistry. Support is patchy: RDKit rejects component-level grouping outright, so these patterns are Daylight/OpenEye territory.',
        exampleSmiles: '(C.C)',
        exampleNote:
          'two unbonded carbons required to be in the same component',
      },
      {
        syntax: '(A.B)',
        name: 'Same component',
        summary:
          'Everything inside one pair of zero-level parentheses is in one component.',
        detail:
          "Daylight's canonical example: `(C.C)` matches two carbons of the same molecule that are not bonded to each other.",
        exampleSmiles: '(O.N)',
        exampleNote:
          'an oxygen and a nitrogen in the same molecule, not bonded — matches ethanolamine',
      },
      {
        syntax: '(A).B',
        name: 'One group beside a free atom',
        summary:
          'A component may be required of one part of the query while the rest is left free to sit anywhere.',
        detail:
          'The parentheses need not come in pairs. `(C).C` asks for two carbons of which the first two are in one component and says nothing about where the third is, so it matches `CCCC`; `(C).(C).C` matches `CCCC.CCCC`. This is the form to reach for when only part of a query is about components.',
        exampleSmiles: '(O).N',
        exampleNote:
          'an oxygen in a component of its own, and a nitrogen anywhere at all',
      },
      {
        syntax: '(A).(B)',
        name: 'Different components',
        summary:
          'Separate parenthesised groups must be in separate components.',
        detail:
          '`(C).(C)` requires the two carbons to be in different molecules — the query for an intermolecular relationship, as opposed to `(C.C)` for an intramolecular one.',
        exampleSmiles: '(O).(N)',
        exampleNote:
          'an oxygen and a nitrogen in two different components of a mixture — matches water plus ammonia, not ethanolamine',
      },
    ],
  },
  {
    id: 'smarts-reactions',
    title: 'SMARTS — Reaction queries',
    intro:
      'A reaction query is a SMARTS cut by `>` into a reactant, an agent and a product part, each matched only against the corresponding side of the target. The atom map that pairs the sides up in a reaction SMILES reads quite differently here: it can only take hits away.',
    entries: [
      {
        syntax: '>>',
        name: 'Matching by reaction role',
        summary:
          'Each part of the query is tested against the corresponding part of the reaction, and a missing part asks nothing.',
        detail:
          'A query with no `>` in it has no role at all and hits anywhere in the reaction. Daylight give the counts against the target `CC>>CN`: `C>>` matches twice, once per reactant carbon; `>C>` not at all, there being no agent; `>>C` once; and a bare `C` three times, every carbon on either side. A reaction expression may not appear inside a recursive `$(...)`.',
        exampleSmiles: '[CX3](=O)[OX2H1]>>[CX3](=O)[OX2][#6]',
        exampleNote:
          'an esterification — a carboxylic acid required on the reactant side, an ester on the product side',
      },
      {
        syntax: '[C:1]',
        name: 'An atom map as a query',
        summary:
          'The map is a filter over the hits the graph match already found, so it can only remove them, never add any.',
        detail:
          'Three rules follow from the map being checked after the match. A class written on only one side is ignored, so `[C:1]>>[C:2]` does *not* require the two atoms to differ. A mapped query against an unmapped target matches nothing at all: `[C:1]>>[C:1]` finds nothing in `CC>>CC`, which is the usual reason a query silently returns no hits. And a map on a query with no `>` in it expresses nothing and is discarded.',
        exampleSmiles: '[C:1]>>[C:1]',
        exampleNote:
          'against the mapped `[CH3:7][CH3:8]>>[CH3:7][CH3:8]` this matches twice, the 7,7 and 8,8 pairs; against the unmapped `CC>>CC`, not at all',
      },
      {
        syntax: '[C:?1]',
        name: 'A map, or none',
        summary:
          'Matches an atom mapped as written **or** carrying no map, which is the way out of the unmapped-target trap.',
        detail:
          'Daylight allow exactly two map forms, `[expr:n]` and `[expr:?n]`, the map being a low-precedence AND with the rest of the expression — so a map can never be OR-ed with anything. The `?` form is what to write against a database whose reactions are only partly mapped: `[C:?1]>>[C:?1]` matches `CC>>CC` four times, where the unforgiving form matches it none.',
        exampleSmiles: '[C:?1]>>[C:?1]',
        exampleNote:
          'the same pairing, but satisfied by an unmapped reaction as well',
      },
    ],
  },
  {
    id: 'smarts-patterns',
    title: 'SMARTS — Practical functional-group patterns',
    intro:
      'Patterns adapted from the Daylight SMARTS examples. Each is written to hit the intended group and to exclude the near-misses that a naive pattern would catch.',
    entries: [
      {
        syntax: '[CX3](=O)[OX2H1]',
        name: 'Carboxylic acid',
        summary: 'A carbonyl carbon bearing a hydroxyl.',
        detail:
          'The `X3` on the carbon and `X2H1` on the oxygen together pin down a genuine –COOH: three connections at carbon rules out over-bonded species, and the hydroxyl must still carry its hydrogen, which excludes esters and carboxylates.',
        exampleSmiles: '[CX3](=O)[OX2H1]',
        exampleNote:
          'matches the COOH of acetic acid, not the ester of methyl acetate',
      },
      {
        syntax: '[CX3](=O)[OX1H0-,OX2H1]',
        name: 'Carboxylic acid or carboxylate',
        summary: 'Neutral acid and deprotonated anion in one pattern.',
        detail:
          'Databases store the same substance in either protonation state, so a search intended to find "acids" needs both alternatives. The `,` makes the oxygen either a bare anionic oxygen or a hydroxyl.',
        exampleSmiles: '[CX3](=O)[OX1H0-,OX2H1]',
        exampleNote: 'matches both acetic acid and the acetate anion',
      },
      {
        syntax: '[#6][CX3](=O)[OX2H0][#6]',
        name: 'Ester',
        summary: 'A carbonyl flanked by carbon and an etherified oxygen.',
        detail:
          'The `H0` on the bridging oxygen is what distinguishes an ester from an acid, and requiring carbon on both ends excludes formic anhydride and carbonates.',
        exampleSmiles: '[#6][CX3](=O)[OX2H0][#6]',
        exampleNote:
          'matches the ester group of ethyl acetate, not acetic acid',
      },
      {
        syntax: '[NX3][CX3](=O)[#6]',
        name: 'Amide',
        summary: 'A trivalent nitrogen on a carbonyl carbon.',
        detail:
          'Written with `[#6]` on the far side so that both aliphatic and aromatic (benzamide) acyl groups match. Primary, secondary and tertiary amides all hit.',
        exampleSmiles: '[NX3][CX3](=O)[#6]',
        exampleNote: 'matches the amide bond of acetamide',
      },
      {
        syntax: '[NX3;H2;!$(NC=O)]',
        name: 'Primary amine',
        summary: 'An NH2 nitrogen that is not an amide.',
        detail:
          'Without the recursive exclusion this pattern would match every primary amide as well, since an amide nitrogen is also `NX3;H2`. Adding `!$(N~[!#6])` further excludes hydrazines and hydroxylamines.',
        exampleSmiles: '[NX3;H2;!$(NC=O)]',
        exampleNote: 'matches the nitrogen of ethylamine but not of acetamide',
      },
      {
        syntax: '[NX3;H1;!$(NC=O)]',
        name: 'Secondary amine',
        summary: 'An NH nitrogen that is not an amide.',
        detail:
          'The same construction one hydrogen down. `NX3` also keeps out ammonium ions, which are `NX4`.',
        exampleSmiles: '[NX3;H1;!$(NC=O)]',
        exampleNote:
          'matches the nitrogen of diethylamine but not of N-ethylacetamide',
      },
      {
        syntax: '[NX3;H0;!$(NC=O);!$(N=*)]',
        name: 'Tertiary amine',
        summary: 'A fully substituted amine nitrogen.',
        detail:
          'Three exclusions are needed: `H0` alone would also match amide, imine, nitro and aromatic nitrogens, so the recursive tests remove the amides and the doubly bonded cases.',
        exampleSmiles: '[NX3;H0;!$(NC=O);!$(N=*)]',
        exampleNote:
          'matches the nitrogen of triethylamine but not of N,N-dimethylacetamide',
      },
      {
        syntax: '[OX2H][CX4]',
        name: 'Alcohol',
        summary: 'A hydroxyl on an sp³ carbon.',
        detail:
          'The `CX4` is what separates an alcohol from a phenol or a carboxylic acid. `[OX2H]` alone is the general "hydroxyl" pattern and matches all three.',
        exampleSmiles: '[OX2H][CX4]',
        exampleNote: 'matches the hydroxyl of ethanol, not that of phenol',
      },
      {
        syntax: '[OX2H][c]',
        name: 'Phenol',
        summary: 'A hydroxyl on an aromatic carbon.',
        detail:
          'The aromatic-carbon requirement is the whole definition. Use `[OX2H][cX3]:[c]` if the ring carbon must also be a normal aromatic position.',
        exampleSmiles: '[OX2H][c]',
        exampleNote: 'matches the hydroxyl of phenol',
      },
      {
        syntax: '[OD2]([#6])[#6]',
        name: 'Ether',
        summary: 'A two-connected oxygen between two carbons.',
        detail:
          'Degree 2 with two carbon neighbours excludes alcohols (one carbon) and peroxides (oxygen neighbour). Esters still match, so pair it with `!$(O[CX3]=O)` when they must be excluded.',
        exampleSmiles: '[OD2]([#6])[#6]',
        exampleNote: 'matches the oxygen of diethyl ether, not that of ethanol',
      },
      {
        syntax: '[#6][CX3](=O)[#6]',
        name: 'Ketone',
        summary: 'A carbonyl carbon with carbon on both sides.',
        detail:
          'Requiring carbon on both sides is what excludes aldehydes, acids, esters and amides in one stroke.',
        exampleSmiles: '[#6][CX3](=O)[#6]',
        exampleNote: 'matches the carbonyl of acetone, not of acetaldehyde',
      },
      {
        syntax: '[CX3H1](=O)[#6]',
        name: 'Aldehyde',
        summary: 'A carbonyl carbon bearing exactly one hydrogen.',
        detail:
          'The single hydrogen is the defining feature. Formaldehyde has two and so does not match; use `[CX3H1,CX3H2](=O)` if it should.',
        exampleSmiles: '[CX3H1](=O)[#6]',
        exampleNote: 'matches the carbonyl of acetaldehyde, not of acetone',
      },
      {
        syntax: '[$([NX3](=O)=O),$([NX3+](=O)[O-])]',
        name: 'Nitro group',
        summary: 'Both resonance forms of a nitro nitrogen.',
        detail:
          'Toolkits disagree on whether to store nitro as a pentavalent nitrogen or as the charge-separated form, so a portable pattern must offer both alternatives.',
        exampleSmiles: '[$([NX3](=O)=O),$([NX3+](=O)[O-])]',
        exampleNote:
          'matches the nitro nitrogen of nitrobenzene in either representation',
      },
      {
        syntax: '[NX1]#[CX2]',
        name: 'Nitrile',
        summary: 'A terminal nitrogen triple-bonded to carbon.',
        detail:
          '`NX1` forces the nitrogen to be terminal, distinguishing a nitrile from an isonitrile or an azide nitrogen.',
        exampleSmiles: '[NX1]#[CX2]',
        exampleNote: 'matches the nitrile of acetonitrile',
      },
      {
        syntax: '[#16X4]([NX3])(=[OX1])(=[OX1])[#6]',
        name: 'Sulfonamide',
        summary:
          'A tetravalent sulfur with two oxygens, a nitrogen and a carbon.',
        detail:
          'Written with atomic numbers so it matches aromatic sulfonamides too. Both sulfonyl oxygens are pinned as terminal with `OX1`.',
        exampleSmiles: '[#16X4]([NX3])(=[OX1])(=[OX1])[#6]',
        exampleNote: 'matches the sulfonamide group of methanesulfonamide',
      },
      {
        syntax: '[F,Cl,Br,I]',
        name: 'Halogen',
        summary: 'Any of the four common halogens.',
        detail:
          'The canonical use of the OR operator. Use `[#9,#17,#35,#53]` if aromatic or unusual forms might occur, and add `,[#85]` for astatine.',
        exampleSmiles: '[F,Cl,Br,I]',
        exampleNote: 'matches the chlorine of chlorobenzene',
      },
      {
        syntax: 'a1aaaaa1',
        name: 'Any six-membered aromatic ring',
        summary: 'Six aromatic atoms in a ring, of any element.',
        detail:
          'Because `a` matches aromatic anything, this hits benzene, pyridine, pyrimidine and the six-rings of fused systems alike. It does not match five-membered heteroaromatics.',
        exampleSmiles: 'a1aaaaa1',
        exampleNote:
          'matches the ring of pyridine as well as of benzene, but not pyrrole',
      },
      {
        syntax: '[cR1]1[cR1][cR1][cR1][cR1][cR1]1',
        name: 'Isolated benzene ring',
        summary: 'A six-carbon aromatic ring that is not fused.',
        detail:
          'The `R1` on every atom requires each to be in exactly one ring, which excludes the rings of naphthalene and any other fused system.',
        exampleSmiles: '[cR1]1[cR1][cR1][cR1][cR1][cR1]1',
        exampleNote: 'matches benzene and toluene but not naphthalene',
      },
      {
        syntax: '[!H0;#7,#8,#9]',
        name: 'Hydrogen-bond donor',
        summary: 'An N, O or F carrying at least one hydrogen.',
        detail:
          'Daylight\'s simple donor definition. `!H0` reads as "not zero hydrogens", and the `,`-list restricts the element to nitrogen, oxygen or fluorine.',
        exampleSmiles: '[!H0;#7,#8,#9]',
        exampleNote:
          'matches the hydroxyl oxygen and the amine nitrogen of ethanolamine, nothing in diethyl ether',
      },
      {
        syntax: '[!$(*#*)&!D1]-!@[!$(*#*)&!D1]',
        name: 'Rotatable bond',
        summary:
          'An acyclic single bond between two non-terminal, non-triple-bonded atoms.',
        detail:
          'The Daylight strict definition: `-!@` is the acyclic single bond, `!D1` excludes terminal atoms whose rotation changes nothing, and `!$(*#*)` excludes the linear ends of triple bonds.',
        exampleSmiles: '[!$(*#*)&!D1]-!@[!$(*#*)&!D1]',
        exampleNote:
          'matches the central C–C bond of butane, and nothing in ethane',
      },
    ],
  },
];
