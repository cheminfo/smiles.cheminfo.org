# smiles.cheminfo.org

Draw a structure and read its SMILES. Write a SMILES and see the structure.
Do it to ten thousand at a time, search them by substructure or SMARTS, learn
the notation from a tutorial, and practise it on graded exercises a teacher can
hand out as a link.

**Everything runs in the browser.** The conversion, the search and the marking
are all done in the page by [openchemlib](https://github.com/cheminfo/openchemlib-js) —
nothing is uploaded. A REST API does the same thing for scripts.

## Pages

| Page               | What it is for                                                                                                                                                                                                                                                                                                                                                                                                                           |
| ------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Converter**      | One structure, both directions at once. Drawing and notation are the same thing said twice, so editing either updates the other on every stroke and every keystroke. Shows the canonical SMILES, the Kekulé form, the SMARTS reading, the idCode and the molfile, with the formula and both masses.                                                                                                                                      |
| **Lists & search** | A whole list in, a whole list out — SMILES, SMARTS, molfiles, idCodes or an **SDF**, in either direction. A line that cannot be read keeps its place with the reason beside it. Reading the list also indexes it, so the same table answers a query — by substructure, by SMARTS, exactly, without stereochemistry, or by similarity — with the matched atoms painted. Downloads what is on screen as SMILES, CSV or SDF, hits included. |
| **Tutorial**       | Eighteen steps from a single atom to a mapped reaction, each one a working structure you can take apart, with a hoverable definition on every piece of jargon.                                                                                                                                                                                                                                                                           |
| **Exercises**      | 110 graded questions in three sets: _Molecule → SMILES_, _SMILES → Molecule_, and _Write a SMARTS_. Marked on the molecule, never on the string, so any correct spelling is accepted.                                                                                                                                                                                                                                                    |
| **Cheatsheet**     | The whole of SMILES and SMARTS on one printable page — 140 constructs, each with a drawn example.                                                                                                                                                                                                                                                                                                                                        |
| **Specification**  | The OpenSMILES specification itself, mirrored here word for word with a table of contents down the left — the original is served with a certificate no browser accepts.                                                                                                                                                                                                                                                                  |

## What it replaces

Three activities that used to run in the cheminfo visualizer:

- `Molecule -> SMILES` and `SMILES -> Molecule` — now the two structure
  exercise sets, with their original molecules.
- `Smiles list to SDF` — now the Lists & search page, which also runs the other
  way, and searches what it converted.

## Sharing and embedding

Every page writes what it is working on into its own address, so the address is
the thing to hand out. The **Share** button builds it, and the iframe that
frames it inside a course:

```
smiles.cheminfo.org/exercises?set=patterns&embed=1&hide=list,answers
smiles.cheminfo.org/exercises?exercises=w2,w15
smiles.cheminfo.org/?smiles=CC(%3DO)Oc1ccccc1C(%3DO)O
smiles.cheminfo.org/lists?source=https://example.org/my-set.smi&q=c1ccccc1
smiles.cheminfo.org/tutorial?step=12
```

- `embed=1` drops the header, so only the activity shows through the frame.
- `hide=` switches parts of a page off. A hidden control still applies whatever
  the link carries — that is how you preset a search nobody can widen.
- `exercises=` hands out exactly the questions you name, in the order you name
  them. An id nobody knows is skipped rather than fatal, so an old link opens on
  what is left of it.
- What a student has done is kept in their browser under `smiles:exercises:v1`.
  A course hosting its own service implements two calls and plugs itself in;
  see `setProgressStore` in `frontend/src/state/exerciseProgress.ts`.

## API

Interactive documentation at [`/docs`](https://smiles.cheminfo.org/docs).

```sh
# one structure, written every way at once
curl 'https://smiles.cheminfo.org/v1/convert?input=CC(%3DO)Oc1ccccc1C(%3DO)O'

# a whole list; a line that cannot be read is reported in place
curl -X POST https://smiles.cheminfo.org/v1/batch \
  -H 'content-type: application/json' \
  -d '{"input":"CCO ethanol\nc1ccccc1 benzene","to":"kekule"}'

# a list as an SDF
curl -X POST https://smiles.cheminfo.org/v1/sdf \
  -H 'content-type: application/json' \
  -d '{"input":"CCO ethanol\nc1ccccc1 benzene"}' -o structures.sdf
```

A list is one structure per line; anything after the first space is kept as its
name — the Daylight SMILES-file convention. A CSV or a TSV is read as it comes:
the separator, the header row and the column holding the structures are worked
out from the text, so the SMILES may be the fourth column of a spreadsheet
export, and every other column is kept as a field and handed back with the
molecule. Blank lines and `#` comments are ignored, and an SDF is recognised and
read as its records, fields included.

## Development

```sh
npm install
npm run dev              # backend :10814 + frontend :10815
npm test                 # vitest + check-types + eslint + prettier
npm run test-e2e         # Playwright against both dev servers
```

The chemistry shared by the API and the page lives in `chemistry/` at the repo
root and is imported by both workspaces. `CLAUDE.md` is the architecture
contract — read it before changing anything.

## Deployment

```sh
cp .env.example .env
# uncomment one COMPOSE_FILE line: port-published, Traefik, or Cloudflare Tunnel
docker compose up -d
```

Set `TRACKING_SCRIPT` to your analytics provider's snippet to have it injected
into every page served; unset, nothing is loaded and nothing is measured.

## The notation

SMILES was designed by David Weininger at the US EPA laboratory in Duluth and
completed at Pomona College. The language is defined by the 1988 paper; the
canonical form — the one string a toolkit picks out of the many that describe
one molecule, which is what makes the exercises here gradable — came a year
later.

- Weininger, D. _SMILES, a chemical language and information system. 1.
  Introduction to methodology and encoding rules._ J. Chem. Inf. Comput. Sci.
  **1988**, 28 (1), 31–36. [10.1021/ci00057a005](https://doi.org/10.1021/ci00057a005)
- Weininger, D.; Weininger, A.; Weininger, J. L. _SMILES. 2. Algorithm for
  generation of unique SMILES notation._ J. Chem. Inf. Comput. Sci. **1989**,
  29 (2), 97–101. [10.1021/ci00062a008](https://doi.org/10.1021/ci00062a008)
- Weininger, D. _SMILES. 3. DEPICT. Graphical depiction of chemical
  structures._ J. Chem. Inf. Comput. Sci. **1990**, 30 (3), 237–243.
  [10.1021/ci00067a005](https://doi.org/10.1021/ci00067a005)
- James, C. A. (ed.) _OpenSMILES specification_, version 1.0, 2016-05-15.
  <http://opensmiles.org/opensmiles.html> — the community-maintained open
  specification, and what the cheatsheet here is written against. Its HTTPS
  certificate does not match its hostname, so it is
  [mirrored on this site](https://smiles.cheminfo.org/specification) under the
  [GNU FDL 1.2](https://www.gnu.org/licenses/fdl-1.2.html) it is published
  under. The document itself is written at
  <https://github.com/opensmiles/OpenSMILES>; `node scripts/importSpecification.js`
  copies the current revision in.
- _Daylight Theory Manual_, version 4.9 (2011), chapters 3 (SMILES) and 4
  (SMARTS). <https://www.daylight.com/dayhtml/doc/theory/index.html> — chapter 4
  is the only specification of SMARTS there is; there is no peer-reviewed paper
  and no OpenSMILES-style open standard for it.

## License

[MIT](./LICENSE)
