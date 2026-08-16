# smiles — architecture contract

A structure goes in and a SMILES comes out; a SMILES goes in and a structure
comes out; an exercise asks the student to do one of those themselves. Read
this before touching a source file: what follows is shared by the whole
codebase.

**The chemistry runs in the browser, always.** Every conversion, every search
and every marked answer is computed in the page by openchemlib. There is no
service behind the site and nothing to upload to: a visitor may search a set
they are not allowed to send anywhere, and that is the point.

## Stack

- **One page, no service.** React 19 + Vite, `@preact/signals-react` for global
  state, BlueprintJS for the widgets, `react-ocl` for the editor and the
  drawings, `react-mf` for every molecular formula on screen,
  `react-cheminfo` for what the family shares.
- **The chemistry** lives in `src/chemistry/`, imported by the pages that use
  it.
- **Ports**: the page is served on `10814`, the Vite dev server on `10815`
  (derived from the project creation date, 2026-08-14).
- One Docker image builds the pages and serves them; there is nothing behind
  it.

## Reading a structure

`src/chemistry/parse.ts#readStructure` is the only way text becomes a molecule, and
it says how it read it. Three things it does that nothing else may undo:

- **The SMILES/SMARTS mode is decided here, not by openchemlib.** Its own
  `smartsMode: 'guess'` reads `[CX3](=O)[OX2H1]` as a fragment and then throws
  the `X` counts away, so a carboxylic acid query silently becomes "any carbon
  between two oxygens". `looksLikeSmarts` looks for syntax only a SMARTS has —
  and only inside a bracket atom for the primitives, because `#` is a triple
  bond outside one and `D`, `X`, `R`, `v`, `h` begin real element symbols.
- **A molfile is parsed from the untrimmed text.** Its first line is the title
  and is very often blank; trimming shifts every line up and the counts line is
  read as an atom, which yields an empty molecule and no error at all.
- **An idCode is only tried once the line notation has failed**, because it is
  built from the same characters. The notation's error is the one reported.

## Identity of a structure

Two structures are the same answer when `src/chemistry/describe.ts#identity` gives
them the same string. That is **not** the raw idCode: an idCode records things a
SMILES cannot say, so a nitro group drawn as pentavalent nitrogen and the same
group drawn as `[N+]([O-])=O` have two idCodes and one SMILES. Grading on the
raw idCode rejects a student who drew the first and was shown the second. The
molecule is written as a SMILES and read back, which puts every such pair
through the one normalisation this site is about — and is exactly what a student
is being taught to expect. A query has no SMILES to round trip through, so a
fragment answers with its idCode instead.

**A query has no formula.** openchemlib zeroes the implicit hydrogens on every
atom of a fragment, so `*CC` reads as `C3`. Any panel showing a formula or a
mass checks `isQuery` first and shows neither rather than showing fiction.

## What openchemlib will not do

Written down because each of these was found by a test, not by reading a
changelog:

- `toSmiles()` is deprecated; `toIsomericSmiles()` is the one to call, and
  `{ kekulizedOutput: true }` is what makes the Kekulé form.
- SMARTS support is partial. The wildcards `[a]` and `[A]`, the ring-size and
  ring-connectivity primitives `[r6]` / `[cx3]`, the aromatic hydrogen count
  `[nh1]`, a negated ring membership `!R0`, and a recursive SMARTS followed by
  another one or by an alternation are all refused; `[!C]` parses but loses its
  negation. The cheatsheet documents the notation, not the toolkit, so an
  example the toolkit cannot parse shows its string instead of a drawing — and
  `UNPARSEABLE_BY_DESIGN` in `src/data/__tests__/content.test.ts` names
  every one of them, so a gap that closes upstream stops being excused.
- **The idCode decoder does not validate.** It reads the string as packed bits,
  so a mistyped SMILES like `ZZZ` decodes into thirty-seven disconnected
  carbons rather than failing. `parse.ts#parseIdCode` therefore encodes the
  molecule again and refuses anything that does not come back byte for byte —
  without that, the `auto` fallback turns every typo into a plausible-looking
  molecule, and it silently turned ten unparseable cheatsheet SMARTS into
  drawings of unrelated structures.
- `isFragmentInMolecule()` answers yes or no and builds no mapping;
  `findFragmentInMolecule({ countMode: 'overlapping' })` is what fills
  `getMatchList()`, which is what paints the matched atoms on a hit.
- `openchemlib-utils` reads `options.controller` at run time and declares
  `controler` in its JSDoc, so the generated type rejects the spelling the code
  honours. Passing the declared one silently disables cancellation.

## Exercises

The site replaces two cheminfo visualizer views, and its two structure sets are
those views' molecules, re-derived from the original idCodes and kept only
where the structure survives being written as a SMILES and read back.

**The level of an exercise is read off it, never written down.**
`exercises/validate.ts#levelOf` decides from the heavy-atom count, so a set a
teacher assembles from their own molecules is coloured exactly like the ones
shipped. A hand-written level could only disagree with the molecule it labels.
So is the order: `sortByDifficulty` walks a set from its smallest structure to
its largest and puts the queries last, because a pattern spells out no structure
whose size could be read. A list an address names exercise by exercise keeps the
order the address gave it — that order is the teacher's, not the molecules'.

**A query exercise is marked by running it, not by comparing strings.** There is
always more than one right SMARTS, so a set of molecules on either side of the
line does what a string comparison cannot. Every shipped solution is checked
against openchemlib by the test suite, including the last hint of each — a hint
pointing at a primitive the toolkit does not implement is worse than no hint.

**A parameter that feeds a page belongs to that page alone.** The exercises name
their set in `set`; the lists page names its hosted list in `source`, _not_
`set`, and every page's `readAddress` returns immediately unless that page is
the one being opened. Two meanings for one name once made `/exercises?set=…`
fetch `patterns` as a URL and parse the returned HTML as ten thousand
structures.

**The results are always kept, and always through a binding.**
`state/progressStore.ts` declares what a place to keep them is — a name, a
`load` and a `save`, either of which may answer over the network — and
`localStorageProgressStore` is the only one there is today. `setProgressStore`
swaps in another; nothing else in the page knows where the work went. A field an
older entry does not carry reads as its default, so a link followed months later
still opens.

## Lists

**Converting a list and searching one are the same page, because they are the
same list.** `src/chemistry/structureList.ts#readList` parses the text once and
builds the `MoleculesDB` screening index as it fills the rows, so the table a
conversion produced is the table a query narrows — and what a query left is what
every download holds. Splitting them cost a second full parse of the same
molecules and made "search this set and take the matches away" two pages and a
copy-paste.

**A hit names a row, never a molecule.** The row number rides with each entry in
the index, so two identical structures — one entry in a `MoleculesDB`, which is
keyed by idCode — come back as the two lines of the list they were written on.
A search that reported molecules would silently drop the duplicate.

**Searching reads the list first when the box has been edited since.** One list
and two verbs is only simpler than two pages if there is no order to get right.

**What the file is written as is worked out, never asked for.** A chemist pastes
what their spreadsheet exported, so `src/chemistry/table.ts` finds the separator with
papaparse — which is also what keeps a quoted name holding a comma, or a field
spanning two lines, in one piece — and `src/chemistry/tableLayout.ts` finds the
column that holds the structures **by parsing the cells**, not by trusting a
header: half of these files carry no header, and the ones that do put the SMILES
in whatever column the chemist had it in. Only SMILES and SMARTS are tried there,
and the molecule has to come back holding an atom, because `auto` falls through
to an idCode, which accepts nearly any run of letters — `ethanol` reads as 1106
atoms, and the name column would win. A header is consulted only to break a tie
between two columns that both parse, which is what a file carrying both `SMILES`
and `Molecular Formula` produces. A blank-separated file is not counted in
columns at all: `benzoic acid` is one name of two words.

**Every other column is kept, and comes back out.** They ride with the entry as
`fields`, so the CSV a conversion writes carries the columns the CSV that went in
had, the SDF carries them as record fields, and an SDF that arrives keeps the
fields it came with. A conversion that dropped what a chemist knew about a
molecule is a conversion they have to undo by hand afterwards.

**The page says which column it read.** Nothing was asked, so `describeLayout`
puts one sentence above the rows — the separator, the header, the column the
structures came from and the one that named them. A guess the reader cannot see
is a guess they cannot correct.

**Two ways to narrow one table, and they compose.** A query narrows it by what
the molecule _is_; the filter box narrows it by what the file _said_ —
`Batch:B3` among a hundred thousand rows is not a substructure, and no drawing
expresses it. `filterRows` runs `smart-array-filter` over a flat text projection
of the rows built on first use and kept in a `WeakMap` keyed by the rows array,
so a list nobody filters never pays for it and a filtered one pays once rather
than per keystroke; the molecule is left out of the projection, because it is
several typed arrays a chemist would never type into a box. `shownRows` takes
both the hits and the kept row numbers, so every download still holds exactly
what is on screen.

**Only the rows on screen are drawn.** `react-window` renders about a dozen of
them however long the list is, which is what lets the table open on a hundred
thousand structures — the row heights are measured rather than declared, because
a row is as tall as the fields it carries. Measured on this machine: 50 000
structures read in 13 s, 100 000 in 28 s at 1.4 GB, 200 000 in 108 s at 2.6 GB;
500 000 crashes the tab. The ceiling is not the table, it is the ~13 kB an
openchemlib molecule costs while `MoleculesDB` holds it for searching.

## Frontend conventions

- Routing is **path based** through the History API — a teacher hands out
  `smiles.cheminfo.org/exercises/patterns`, and a `#` in there does not survive
  being pasted around. **A step of the tutorial and an exercise of a set are
  addresses, not parameters** (`/tutorial/12`, `/exercises/patterns/s1`): the
  build writes one file per address so each is titled and described as itself,
  and a hundred questions behind one address is one search result. `?step=`,
  `?set=` and `?exercise=` are read on the way in, so a link written before
  still opens, and the address is rewritten to the one it now has. `PATHS`,
  `parsePath` and `routePath` live in `state/pages.ts`, which reads nothing and
  listens to nothing, so the build that writes those files can import it in
  Node.
- `state/shareConfig.ts` owns the two parameters that configure a page rather
  than feed it: `embed=1` drops the header for a page framed in a course, and
  `hide=` switches parts of it off. Components ask `isHidden(key)`; the keys of
  each page are declared in `state/shareOptions.ts`, which is also what the
  share dialog offers. An unknown key is ignored, so an old link still opens.
- **Hidden is not disabled.** A hidden control still applies the value the link
  carries — that is how a teacher presets a search nobody can widen.
- Global state is signal buckets in `src/state/`: `data` (what was loaded),
  `view` (ephemeral), `preferences` (persisted). Components call `useSignals()`
  as their first line whenever they read `.value`.
- **Molecules are drawn as SVG in the document, never as a raster canvas.**
  `components/StructureView.tsx` wraps react-ocl's `SvgRenderer` and takes an
  already-parsed `Molecule`, so a page drawing a hundred structures parses each
  once rather than once per render — and every atom is an element that can be
  highlighted, hovered and printed. The canvas editor is for drawing, not for
  showing.
- **The rings are named on the drawing, not beside it.** `src/chemistry/rings.ts`
  writes each atom's rings on it as an openchemlib custom label — a leading `]`
  is openchemlib's own way of saying "above the atom rather than instead of it",
  and `noCarbonLabelWithCustomLabel` keeps the carbon a plain vertex — so a ring
  fusion reads `12` and a ring closure digit in the SMILES has something to
  point at. The labels are written on a **copy**: they live on the molecule
  itself, and the converter hands the same parsed one to several panels. The
  ring bonds are painted as well, because a bond between two ring atoms is not
  always a ring bond — biphenyl's middle one is the case the numbers alone
  cannot tell.
- The canvas editor is uncontrolled and owns its drawing: it is **remounted with
  a `key`** to replace what it holds, never driven by a prop. On the converter
  only a structure that came from somewhere else bumps the revision — rebuilding
  it under a hand that is still drawing throws the drawing away.
- **An answer is handed in, never taken.** Typing and drawing only keep a draft;
  `submitAnswer` is the one thing that marks it, counts an attempt and moves the
  status. Marking every keystroke tells a student halfway through writing the
  right answer that they are wrong, and makes an attempt count meaningless. A
  status only ever moves forwards: an exercise once solved stays solved while its
  answer is edited into something else.
- **What the answer cost is kept with it.** `attempts` and `hintsRevealed` go
  through the same progress store as everything else, so they survive a reload
  and a teacher's binding sees them too. The mark itself is not stored: it is
  recomputed on opening, and only when the draft is still exactly what was handed
  in — otherwise a student comes back to a verdict about something they have
  since changed.
- **A refusal always says what to look at next.** `exercises/diagnose.ts` turns
  a failure into the thing a tutor would point at, and never into the answer: a
  structure that would not parse carries the position openchemlib stopped at, so
  the page repeats the input with a caret under the character, plus the rule that
  was broken in words (`src/chemistry/hints.ts#parseHint` — `dangling ring closure:
1` is exact and teaches nobody anything). A structure that parses is compared
  in the order a chemist would look: the formula first, element by element, so
  the student is told they are short of `1 C and 3 O` rather than being shown two
  formulas to diff — and never as one formula, because `CO3` written out reads as
  carbonate. Only when the atoms already add up is the connectivity named, and a
  pair openchemlib canonicalises to one `NOSTEREO_TAUTOMER` id is called a
  tautomer rather than "a different molecule", because moving a hydrogen back is
  not redrawing the thing.
- A long list is read in chunks with a yield between them. Ten thousand
  structures is several seconds of parsing, and a page that stops answering the
  mouse for several seconds looks broken.
- **No silent caps.** Nothing about the lists page is capped for display —
  `react-window` draws only what is on screen, so every row of a hundred
  thousand is reachable. What _is_ bounded says so: a query that stopped at its
  `limit` carries "stopped at the limit", and the heading counts what the
  filter left against the whole list.
- Every molecular formula on screen goes through `react-mf`, never a raw string.
- Organise by page under `src/pages/<page>/`; keep every file under 250 lines.
- The cheatsheet is meant to be printed: chrome carries `no-print`, sections do
  not split across pages.

## The specification

`public/spec/` is a **copy of the OpenSMILES document, not a rewrite**
— the body of the AsciiDoc page and the 85 drawings it points at, imported by
`scripts/importSpecification.js` and served under `/specification`. opensmiles.org
answers with a certificate issued for another name, so a browser refuses the
original outright, which leaves the definition of the notation this site teaches
unreachable. Only the stylesheet is ours: the document is inserted as generated,
because a specification that has been parsed and re-emitted is no longer the
thing people cite. Its anchors are what it is cited by, so
`specification/headings.ts` reads the contents off the headings rather than
declaring them anywhere, and a section keeps the anchor upstream gave it.

## Commands

```sh
npm install
npm run dev              # the page on :10815
npm test                 # vitest + check-types + eslint + prettier
npm run test-e2e         # Playwright, the dev server started for it
npx react-doctor@latest  # React anti-pattern scan
```
