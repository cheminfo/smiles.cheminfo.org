import { Card, H5 } from '@blueprintjs/core';

import { isHidden } from '../../state/shareConfig.ts';

import ListInputPanel from './components/ListInputPanel.tsx';
import ListResultPanel from './components/ListResultPanel.tsx';
import QueryPanel from './components/QueryPanel.tsx';

/**
 * The list page: a column of structures in, the same structures out — written
 * every way, and searchable.
 *
 * Converting a list and searching one are the same list and the same reading,
 * so they are the same page: the table a conversion fills is the table a query
 * narrows, and what is left is what every download holds. This is what replaces
 * the "Smiles list to SDF" activity — but it runs both ways, it answers a
 * substructure query, and it runs here, so a list of ten thousand never leaves
 * the browser.
 * @returns The lists page.
 */
export default function ListsPage() {
  return (
    <div className="lists">
      <div className="panel-stack">
        {isHidden('load') ? null : <ListInputPanel />}
        <QueryPanel />
        {isHidden('about') ? null : <AboutPanel />}
      </div>
      <div className="panel-stack">
        <ListResultPanel />
      </div>
    </div>
  );
}

function AboutPanel() {
  return (
    <Card className="prose-card">
      <H5>What goes in</H5>
      <p>
        One structure per line. Anything after the first space is kept as its
        name, which is the old Daylight SMILES-file convention and what most
        tools write:
      </p>
      <pre className="lists-format">
        {'CCO ethanol\nc1ccccc1 benzene\nCC(=O)Oc1ccccc1C(=O)O aspirin'}
      </pre>
      <p>
        A CSV or a TSV is read as it comes — nothing to choose. The separator,
        the header row and the column the structures are in are all worked out
        from the text, so the SMILES may sit in the fourth column of a
        spreadsheet export and still be the one that is read:
      </p>
      <pre className="lists-format">
        {'ID,Name,CAS,SMILES,LogP\n1,ethanol,64-17-5,CCO,-0.14'}
      </pre>
      <p>
        Every other column is kept beside the structure and comes back out in
        the CSV and the SDF, so what you knew about a molecule survives the
        conversion. The table says which column it read — worth a glance before
        trusting the rest.
      </p>
      <p>
        Blank lines and lines starting with <code>#</code> are ignored, so a
        file with headings still reads. A molfile, an SDF or an idCode works
        too. A line that cannot be read keeps its place in the table with the
        reason beside it — one typo must not cost the other 9 999.
      </p>
      <H5>Ten thousand structures, no server</H5>
      <p>
        Reading the list also indexes it with{' '}
        <a
          href="https://github.com/cheminfo/openchemlib-utils"
          target="_blank"
          rel="noreferrer"
        >
          openchemlib-utils
        </a>
        , which builds the same substructure-screening index a database would,
        so a query over ten thousand molecules takes about as long as scrolling
        past them. Nothing is uploaded, which is the point: you can search a set
        you are not allowed to send anywhere.
      </p>
      <p>
        A <b>substructure</b> query is a pattern the molecule must contain, and
        it may be a SMILES or a SMARTS — the matched atoms are painted on every
        hit. <b>Exact</b> asks for that molecule and no other; drop the
        stereochemistry and it asks for the skeleton. <b>Similarity</b> ranks
        the whole list by how much of the query’s fingerprint it shares.
      </p>
      <p>
        The filter box above the table is the other half: it searches what the
        file said rather than what the molecule is. A word matches any name or
        field, <code>CAS:64-17</code> searches that column alone, and quotes
        hold a phrase together. Only the rows on screen are drawn, so the table
        opens on a hundred thousand structures as fast as on five, and every
        download still holds everything the query and the filter left.
      </p>
    </Card>
  );
}
