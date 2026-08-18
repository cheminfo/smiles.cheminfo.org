import type { ReferenceSection } from './types.ts';

/**
 * What the two notations do with the same characters.
 *
 * It sits on both sheets because it is the one thing neither sheet can say on
 * its own: a SMILES *states* a molecule and a SMARTS *asks about* one, so a
 * character that is a fact in the first is a condition in the second — and the
 * conditions are systematically weaker than the facts look. Every row states
 * both readings, which is what the two sheets exist to keep apart.
 */
export const SMILES_VS_SMARTS: ReferenceSection = {
  id: 'smiles-vs-smarts',
  title: 'SMILES vs SMARTS — the same characters, two languages',
  intro:
    'A SMARTS is not a SMILES with extras. It is read as a question, so every atom and every bond of it is a condition a molecule has to meet rather than a fact about one — and the same character says different things on the two sides of that line. These are the ones that catch people.',
  entries: [
    {
      syntax: 'O',
      name: 'The rule every row below follows from',
      summary:
        'In SMILES a property left unwritten takes its default value; in SMARTS a property left unwritten is simply not asked about.',
      detail:
        'The Daylight manual puts it in one sentence: when atoms are written without brackets in SMILES, default values are used, while in SMARTS unspecified properties are not part of the pattern. So the SMILES `O` is water — aliphatic oxygen, no charge, two hydrogens — and the SMARTS `O` is any aliphatic oxygen at all: the one in water, but equally those in ethanol, acetone, molecular oxygen, hydroxide and the hydronium ion. `[OH2]` is how a query says water. Every difference below is this one rule applied to another character.',
      exampleSmiles: '[OH2]',
      exampleNote:
        'water, fully specified — the query the bare `O` of a SMILES looks like but is not',
    },
    {
      syntax: 'C1=CC=CC=C1',
      name: 'A SMILES read as a query rarely finds itself',
      summary:
        'As a SMILES it is benzene; as a SMARTS it asks for six aliphatic carbons with alternating single and double bonds, which benzene is not.',
      detail:
        'A SMILES is read into a molecule and it is the molecule that gets searched; a SMARTS is read into a pattern and it is the pattern that does the searching. So the Kekulé spelling of benzene *is* benzene as a SMILES, while as a query it matches no benzene at all — it does match the non-aromatic phenylate cation `C1=CC=CC=[CH+]1`. Write `c1ccccc1` to find benzene.',
      exampleSmiles: 'c1ccccc1',
      exampleNote:
        'benzene, and the query that finds it — which its own Kekulé spelling does not',
    },
    {
      syntax: 'cOc',
      name: 'And almost no query is a molecule',
      summary:
        'Every SMILES is a legal SMARTS; almost no SMARTS is a legal SMILES.',
      detail:
        'The relationship only runs one way. `cOc` is a good query — an aliphatic oxygen joined to two aromatic carbons, which is the ether oxygen of diphenyl ether — and it describes no molecule of its own, so it is not a SMILES. `~`, `[#6]`, `!@` and `$(...)` have no molecular meaning whatever. A field asking for a structure and a field asking for a pattern are therefore not interchangeable, even where both accept the string.',
      exampleSmiles: 'c1ccccc1Oc2ccccc2',
      exampleNote: 'diphenyl ether — the molecule the query `cOc` matches',
    },
    {
      syntax: 'C',
      name: 'A bare element symbol',
      summary:
        'In SMILES it is a carbon carrying its full complement of hydrogens; in SMARTS it only asks that the atom be an aliphatic carbon.',
      detail:
        'A SMILES states a molecule, so `C` takes hydrogens up to the standard valence and reads as methane. A SMARTS states a condition, so `C` constrains the element and the fact that the atom is not aromatic, and nothing else: it matches the carbon of methane, of ethanol and of cholesterol alike. `CC` is ethane written as a SMILES; the same two characters as a SMARTS match every aliphatic C–C bond there is.',
      exampleSmiles: 'CC',
      exampleNote:
        'ethane as a SMILES; as a query, any two bonded aliphatic carbons',
    },
    {
      syntax: '[C]',
      name: 'Brackets with no hydrogen count',
      summary:
        'In SMILES the brackets switch the implicit hydrogens off, so `[C]` carries none; in SMARTS they say nothing about hydrogens at all.',
      detail:
        'Written in a SMILES, `[C]` is a carbon atom with exactly zero hydrogens — not methane. Written in a SMARTS, the hydrogen count is simply left unconstrained, so `[C]` matches any aliphatic carbon whatever it carries; `[CH0]` is how a query asks for none. The same brackets that add information to a molecule remove a constraint from a pattern.',
      exampleSmiles: '[CH0]',
      exampleNote:
        'a carbon with no hydrogen — the SMARTS spelling of what `[C]` means in a SMILES',
    },
    {
      syntax: '[CH3]',
      name: 'A hydrogen count',
      summary:
        'In SMILES the count is what the atom carries; in SMARTS it is a total-hydrogen test the atom has to pass.',
      detail:
        'In a SMILES `[CH3]` is a carbon holding three hydrogens, and the writer had to know them. In a SMARTS `H3` counts *total* hydrogens, implicit and explicit together, so `[CH3]` matches the methyl carbon of ethanol however that molecule was written down. `h` — implicit hydrogens only — is a separate SMARTS primitive with no SMILES counterpart.',
      exampleSmiles: '[CH3][CH2]O',
      exampleNote: 'ethanol with every hydrogen spelled out',
    },
    {
      syntax: '(nothing)',
      name: 'An omitted bond',
      summary:
        'Between two atoms nothing *is* a single bond, or an aromatic one where both atoms are aromatic, in SMILES; in SMARTS it *matches* single or aromatic, whichever the target has.',
      detail:
        'A SMILES resolves the omitted bond to one bond — aromatic between two aromatic atoms, single otherwise. A SMARTS leaves it as a question with two answers, exactly `-,:`, so `cc` matches the aromatic bonds inside biphenyl and the plain single bond joining its two rings as well. That makes the omitted bond the loosest thing a query can write, and writing it out narrows it: `c:c` takes only the ring bonds, `c-c` only the bond between them.',
      exampleSmiles: 'c1ccccc1O',
      exampleNote:
        'phenol — the ring bonds are aromatic, the C–O bond single, none of them written',
    },
    {
      syntax: '-',
      name: 'An explicit single bond',
      summary:
        'In SMILES it is a single bond, which is what nothing already means; in SMARTS it is a single bond that is explicitly *not* aromatic.',
      detail:
        'This is the most expensive difference on the sheet. `c1ccccc1-c2ccccc2` is biphenyl, the `-` saying the bond joining the rings is single rather than aromatic — information the SMILES would otherwise not carry. In a query the same `-` excludes the aromatic bond, so a pattern that worked as `cc` stops matching benzene the moment somebody "tidies" it into `c-c`. Leave the bond out when you mean "single or aromatic".',
      exampleSmiles: 'c1ccccc1-c2ccccc2',
      exampleNote:
        'biphenyl — as a query, `-` matches the bond between the rings and none inside them',
    },
    {
      syntax: '*',
      name: 'The wildcard atom',
      summary:
        'In SMILES it is an atom whose element is unknown; in SMARTS it matches an atom of any element whatsoever.',
      detail:
        'OpenSMILES accepts `*` as an atomic symbol standing for an atom whose atomic number is unknown, and outside brackets gives it no isotope, no hydrogens, no charge and no electronic properties of its own — it takes whatever valence its bonds imply. SMARTS reads the same character as the wildcard, so `*` matches every atom there is and `*~*` matches any two bonded atoms.',
      exampleSmiles: '*C(=O)O',
      exampleNote:
        'a carboxylic acid on an unknown atom — as a query, on any atom at all',
    },
    {
      syntax: '@ @@',
      name: 'Chirality, and the ring bond',
      summary:
        'Inside brackets both notations read `@` as tetrahedral chirality; between two atoms it is illegal in SMILES and means "any ring bond" in SMARTS.',
      detail:
        '`[C@H]` and `[C@@H]` are the two configurations in either language — a fact in a SMILES, a condition in a SMARTS. In the bond position, though, `@` is a primitive SMARTS alone has: `C@C` matches two carbons joined by a ring bond and `C!@C` two joined by a chain bond, which is how a query says "in a ring" without naming a size.',
      exampleSmiles: 'C[C@H](N)C(=O)O',
      exampleNote:
        'L-alanine — the same `[C@H]` in a query would match any centre of that configuration',
    },
    {
      syntax: '! & , ;',
      name: 'The logical operators',
      summary:
        'SMILES has none of these; in SMARTS they are negation and the three levels of and/or that combine primitives.',
      detail:
        '`!` negates what follows it, `&` is "and" and is implied between adjacent primitives, `,` is "or", and `;` is a low-priority "and". They bind in that order, so `[C,N;H1]` reads "(carbon or nitrogen) and one hydrogen" while `[C,N&H1]` reads "carbon, or (nitrogen and one hydrogen)". A SMILES has nothing to combine: each of its atoms is one atom.',
      exampleSmiles: '[C,N;H1]',
      exampleNote: 'a carbon or a nitrogen carrying exactly one hydrogen',
    },
    {
      syntax: '~',
      name: 'Any bond',
      summary:
        'SMILES has no way to leave a bond unsaid; in SMARTS `~` matches a bond of any order, aromatic included.',
      detail:
        'A SMILES has to commit: every bond it draws has an order. A query often should not, and `~` is how it declines — `C~C` matches two carbons joined by any bond at all, single, double, triple or aromatic. It is also what makes a ring closure order-free: `C~1CCCCC~1`.',
      exampleSmiles: 'C~C',
      exampleNote: 'two carbons joined by a bond of any order',
    },
    {
      syntax: '#',
      name: 'Triple bond, and the atomic number',
      summary:
        'A triple bond between atoms in either notation; inside brackets, `#n` asks for an atomic number in SMARTS and is not valid in a SMILES at all.',
      detail:
        '`C#N` is hydrogen cyanide in either language. `[#6]` is a SMARTS asking for atomic number 6, which matches an aliphatic *and* an aromatic carbon and is exactly what `C` does not do — and it is not valid inside a SMILES bracket, where the element is written as its symbol.',
      exampleSmiles: '[#6]#[#7]',
      exampleNote:
        'the same triple bond as `C#N`, written by atomic number so it matches whatever the aromaticity model says',
    },
    {
      syntax: ':',
      name: 'Aromatic bond, and the trailing number',
      summary:
        'A `:` between atoms is an aromatic bond in both; after the atom, `:1` is an atom class in SMILES and the atom map a reaction SMARTS matches through.',
      detail:
        'OpenSMILES calls the trailing `:n` an *atom class* and gives it no chemical meaning at all — it is a label a program may use for its own purposes, and two atoms of the same class are not thereby related. In SMARTS the same field is the atom map, which reaction SMARTS and SMIRKS read to say which reactant atom becomes which product atom.',
      exampleSmiles: '[CH3:1][OH:2]',
      exampleNote:
        'methanol with both atoms labelled — a note in a SMILES, a correspondence in a reaction pattern',
    },
    {
      syntax: '$',
      name: 'Quadruple bond, and recursion',
      summary:
        'OpenSMILES uses `$` for a quadruple bond; SMARTS has no such bond and uses `$(...)` to nest a whole pattern inside one atom.',
      detail:
        "A quadruple bond is written `$` in SMILES and appears in metal–metal bonding, the specification's own example being the octachlorodirhenate(III) anion. SMARTS reads `$` as the opening of a recursive expression instead: `[$(cc)]` matches an aromatic carbon that is bonded to another aromatic carbon, and what the pattern matches is the *first* atom of the expression in the brackets, not all of it.",
      exampleSmiles: '[Re]$[Re]',
      exampleNote: 'a rhenium–rhenium quadruple bond',
    },
    {
      syntax: '[13C]',
      name: 'An isotope',
      summary:
        'In SMILES the atom *is* that isotope; in SMARTS the mass is a test, and leaving it out matches every isotope.',
      detail:
        '`[13CH4]` is carbon-13 methane, and a SMILES with no mass number means the element at its natural composition. As a query `[13C]` matches only atoms whose mass number is 13, while plain `[C]` matches carbon of any mass — so a SMARTS never has to say "any isotope", and a SMILES cannot say it.',
      exampleSmiles: '[13CH4]',
      exampleNote: 'carbon-13 methane',
    },
    {
      syntax: '[nH]',
      name: 'An aromatic atom carrying a hydrogen',
      summary:
        'In SMILES the aromatic nitrogen carries that hydrogen; in SMARTS it reads as aromatic nitrogen whose total hydrogen count is one.',
      detail:
        "Pyrrole is `c1cc[nH]c1`, and the `H` is part of what the molecule is — a plain `n` there is a different and invalid structure, because the ring would be short of the electrons that make it aromatic. As a query `[nH]` reads as `[n;H1]`, so it matches pyrrole's nitrogen and not pyridine's.",
      exampleSmiles: 'c1cc[nH]c1',
      exampleNote:
        'pyrrole — as a query, an aromatic nitrogen with one hydrogen, which pyridine has not',
    },
    {
      syntax: '.',
      name: 'The dot',
      summary:
        'In SMILES it separates the components of one structure; in SMARTS it only says the two atoms are not bonded, and not that they are in different molecules.',
      detail:
        'A SMILES writes a salt, a solvate or a mixture as its parts joined by dots: `[Na+].[Cl-]` is one notation naming two ions. In a SMARTS, `C.C` matches two unbonded carbons that may perfectly well belong to the same molecule; asking for two *components* takes the component-level grouping `(C).(C)`.',
      exampleSmiles: '[Na+].[Cl-]',
      exampleNote: 'sodium chloride — two components of one SMILES',
    },
    {
      syntax: 'D X x v h R r a A',
      name: 'Primitives SMILES has no words for',
      summary:
        'None of these means anything in SMILES, where the same letters begin real element symbols; in SMARTS each is a count or a wildcard.',
      detail:
        '`D` counts explicit connections, `X` all connections including hydrogens, `x` ring connections, `v` the sum of the bond orders, `h` implicit hydrogens, `R` the rings the atom is in and `r` the size of its smallest ring; `a` matches any aromatic atom and `A` any aliphatic one. Every count takes a digit, which is what keeps `[Xe]`, `[Rn]` and `[Dy]` reading as the elements they are, and the two wildcards only stand at the front of a bracket, which is what keeps the `a` of `[Na+]` out of it. A SMILES states the structure all of these ask about, so it has no need — and no way — to name them.',
      exampleSmiles: '[CX4]',
      exampleNote:
        'a carbon with four connections, hydrogens counted — a saturated carbon',
    },
    {
      syntax: 'C1CCCCC1',
      name: 'A ring bond closure',
      summary:
        'The digit closes a ring in both notations; in SMILES what may precede it is a bond order, in SMARTS a whole bond query.',
      detail:
        'The digit behaves the same way on both sides: `C1CCCCC1` is cyclohexane, and the same string as a query matches any saturated six-ring. What differs is what may be written in front of it — a SMILES may state the bond order, a SMARTS a whole bond query (`C~1CCCCC~1`, `C@1CCCC@1`). And the digit is never how a query asks about rings: `[R1]`, `[r6]` and `@` are.',
      exampleSmiles: 'C1CCCCC1',
      exampleNote: 'cyclohexane — as a query, any saturated six-membered ring',
    },
  ],
};
