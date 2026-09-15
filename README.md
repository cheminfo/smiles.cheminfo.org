# smiles.cheminfo.org

Draw a structure and read its SMILES. Write a SMILES and see the structure.
Do it to a hundred thousand at a time, search them by substructure or SMARTS, learn
the notation from a tutorial, and practise it on graded exercises a teacher can
hand out as a link.

**Everything runs in the browser.** The conversion, the search and the marking
are all done in the page by [openchemlib](https://github.com/cheminfo/openchemlib-js) —
nothing is uploaded, and there is no service behind the site. A structure you
open never leaves your machine.

The chemistry comes from [openchemlib](https://github.com/Actelion/openchemlib),
the Java library written by Thomas Sander, of which
[openchemlib-js](https://github.com/cheminfo/openchemlib-js) is the JavaScript
port.

> Sander, T.; Freyss, J.; von Korff, M.; Reich, J. R.; Rufener, C. _OSIRIS, an
> entirely in-house developed drug discovery informatics system._ J. Chem. Inf.
> Model. **2009**, 49, 232–246. <https://doi.org/10.1021/ci800305f>

## Pages

| Page               | What it is for                                                                                                                                                                                                                                                                                                                                                                                                                           |
| ------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Converter**      | One structure, both directions at once. Drawing and notation are the same thing said twice, so editing either updates the other on every stroke and every keystroke. Shows the canonical SMILES, the Kekulé form, the SMARTS reading, the idCode and the molfile, with the formula and both masses. Three tabs: a molecule, a SMARTS query, and a reaction.                                                                              |
| **Lists & search** | A whole list in, a whole list out — SMILES, SMARTS, molfiles, idCodes or an **SDF**, in either direction. A line that cannot be read keeps its place with the reason beside it. Reading the list also indexes it, so the same table answers a query — by substructure, by SMARTS, exactly, without stereochemistry, or by similarity — with the matched atoms painted. Downloads what is on screen as SMILES, CSV or SDF, hits included. |
| **Tutorial**       | Eighteen steps from a single atom to a stereochemically complete natural product, each one a working structure you can take apart, with a hoverable definition on every piece of jargon.                                                                                                                                                                                                                                                 |
| **Exercises**      | 110 graded questions in three sets: _Molecule → SMILES_, _SMILES → Molecule_, and _Write a SMARTS_. Marked on the molecule, never on the string, so any correct spelling is accepted.                                                                                                                                                                                                                                                    |
| **SMILES sheet**   | The whole of the SMILES notation on one printable page, each construct with a drawn example — and, at the end, what every character it shares with SMARTS stops meaning there.                                                                                                                                                                                                                                                           |
| **SMARTS sheet**   | The whole of the SMARTS query language on its own printable page — the atom and bond primitives, the logical operators, recursive SMARTS, component grouping and reaction queries — opening on the same shared section, because a query is read as a question and not as a structure.                                                                                                                                                    |
| **Specification**  | The OpenSMILES specification itself, mirrored here word for word with a table of contents down the left — the original is served with a certificate no browser accepts.                                                                                                                                                                                                                                                                  |

## Sharing and embedding

Every page writes what it is working on into its own address, so the address is
the thing to hand out. The **Share** button builds it, and the iframe that
frames it inside a course:

```
smiles.cheminfo.org/exercises/patterns?embed=1&hide=list,answers
smiles.cheminfo.org/exercises/molecule-to-smiles/w4
smiles.cheminfo.org/exercises?exercises=w2,w15
smiles.cheminfo.org/?smiles=CC(%3DO)Oc1ccccc1C(%3DO)O
smiles.cheminfo.org/lists?source=https://example.org/my-set.smi&q=c1ccccc1
smiles.cheminfo.org/tutorial/12
smiles.cheminfo.org/smiles#smiles-rings
smiles.cheminfo.org/smarts#smarts-logic
smiles.cheminfo.org/?kind=reaction&smiles=CC(=O)Cl.OCC%3E%3ECC(=O)OCC.Cl
```

- The two **cheatsheets** are `/smiles` and `/smarts`, and every section of
  either is an address — `/smiles#smiles-rings` hands out ring bond closures
  rather than the whole page. `/reference`, the one address the two sheets used
  to share, opens the SMILES one.
- A **step of the tutorial**, a **set of exercises** and a **single exercise**
  are addresses of their own — `/tutorial/12`, `/exercises/patterns`,
  `/exercises/patterns/s1` — so each is a page a search engine indexes and a
  link opens directly. `?step=`, `?set=` and `?exercise=` are what links written
  before that said, and they still open.
- `embed=1` drops the header, so only the activity shows through the frame.
- `hide=` switches parts of a page off. A hidden control still applies whatever
  the link carries — that is how you preset a search nobody can widen.
- `exercises=` hands out exactly the questions you name, in the order you name
  them. An id nobody knows is skipped rather than fatal, so an old link opens on
  what is left of it. A set assembled that way has no address of its own, so it
  stays in the query string.
- `kind=` picks the converter's tab — `molecule`, `query` or `reaction`. It is
  left out when the notation says which it is, so a plain `?smiles=` link still
  opens on the right one.
- What a student has done is kept in their browser under `smiles:exercises:v1`.
  A course hosting its own service implements two calls and plugs itself in;
  see `setProgressStore` in `src/state/exerciseProgress.ts`.

## Lists

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
npm run dev              # the page on :10607
npm test                 # vitest + check-types + eslint + prettier
npm run test-e2e         # Playwright against the dev server
```

One package at the repository root: the chemistry lives in `src/chemistry/`,
imported by the pages that use it. `CLAUDE.md` is the architecture contract —
read it before changing anything.

### Where the site is served

The site does not assume it owns the root of a host. `SITE_URL` is read **at
build time** and carries the origin and the path together; its path half is
what every asset, route, canonical link, social card and sitemap entry is
written under, so putting the tool under a path is one variable and no code
change:

```sh
SITE_URL=https://example.org/smiles/ npm run build
docker build --build-arg SITE_URL=https://example.org/smiles/ .
```

Left unset it is `https://smiles.cheminfo.org/` — its own host, at the root of it — which is what
every deployment does today. Note that a crawler only reads `robots.txt` from
the root of a host, so a site mounted under a path is covered by whatever
answers that root, not by the file the build writes.

## Deployment

```sh
cp .env.example .env
# uncomment one COMPOSE_FILE line: port-published, Traefik, or Cloudflare Tunnel
docker compose up -d          # the released image
docker compose up -d --build  # or build this checkout instead
```

| Variable                   | What it does                                                                                                                                |
| -------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------- |
| `SITE_URL`                 | Build time only: where the site will be served, origin and mount path together. Unset, `https://smiles.cheminfo.org/`.                      |
| `COMPOSE_FILE`             | Which of the three deployments runs. Unset, `compose.yaml` publishes `PORT` on the host.                                                    |
| `IMAGE_NAME` / `IMAGE_TAG` | The image the compose files run, and the tag of it.                                                                                         |
| `PORT`                     | The port the site is served on, `10606` by default; the dev server takes the one above it.                                                  |
| `TRACKING_SCRIPT`          | The analytics provider's snippet, placed at the end of the `<head>` of every page served. Unset, nothing is loaded and nothing is measured. |
| `TUNNEL_TOKEN`             | The Cloudflare Tunnel token, read by `compose.cloudflared.yaml` alone.                                                                      |

**Give each build a tag of its own.** `docker compose build` tags what it builds
with exactly `IMAGE_NAME:IMAGE_TAG`, so leaving that pair at `:latest` has every
build take the name off the one before it — and a deployment that goes wrong
then has nothing left to go back to. Name the build after itself and the
previous image is still there to return to:

```sh
IMAGE_TAG=$(date -u +%Y%m%dT%H%M%SZ)-$(git rev-parse --short HEAD)
docker compose build && IMAGE_TAG=$IMAGE_TAG docker compose up -d
# went wrong: put the tag that worked back in .env and up -d again
```

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
