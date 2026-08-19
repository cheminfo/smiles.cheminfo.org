import { AboutPage as FamilyAboutPage, AboutSection } from 'react-cheminfo/ui';

import { ABOUT } from '../../about.ts';

/**
 * The About: the family's page, plus the one section that belongs to this site
 * alone — what a list may be written as, which is what a visitor needs before
 * pasting ten thousand lines into the list page.
 * @returns The about page.
 */
export default function AboutPage() {
  return (
    <FamilyAboutPage content={ABOUT}>
      <AboutSection title="What a list may be">
        <div className="prose-card">
          <p>
            One structure per line, and anything after the first space is its
            name — the Daylight SMILES-file convention most tools write:
          </p>
          <pre className="lists-format">
            {'CCO ethanol\nc1ccccc1 benzene\nCC(=O)Oc1ccccc1C(=O)O aspirin'}
          </pre>
          <p>
            A CSV or a TSV is read as it comes: the separator, the header row
            and the column holding the structures are worked out from the text,
            so the SMILES may sit in the fourth column of a spreadsheet export
            and still be the one that is read.
          </p>
          <pre className="lists-format">
            {'ID,Name,CAS,SMILES,LogP\n1,ethanol,64-17-5,CCO,-0.14'}
          </pre>
          <p>
            Every other column is kept beside the structure and comes back out
            in the CSV and the SDF. A molfile, an SDF and an idCode are read
            too, blank lines and lines starting with <code>#</code> are ignored,
            and a line that cannot be read keeps its place in the table with the
            reason beside it.
          </p>
        </div>
      </AboutSection>
    </FamilyAboutPage>
  );
}
