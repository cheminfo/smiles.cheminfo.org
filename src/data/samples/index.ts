import { INVENTORY_SAMPLE } from './inventory.ts';
import { LIBRARY_SAMPLE } from './library.ts';
import { SDF_SAMPLE } from './sdf.ts';

/** A list the page can be loaded with, to see what it does with one. */
export interface ListSample {
  name: string;
  /** The file it would have arrived as, shown beside the name. */
  label: string;
  /** What this one is written like that the others are not. */
  note: string;
  /** The text, exactly as it would have been pasted or opened. */
  text: string;
}

/** The short list the box shows as its placeholder, and offers first. */
export const PLAIN_SAMPLE = `CCO ethanol
c1ccccc1 benzene
CC(=O)Oc1ccccc1C(=O)O aspirin
Cn1cnc2c1c(=O)n(C)c(=O)n2C caffeine
OC(=O)c1ccccc1 benzoic acid
`;

/**
 * The sample menu. Between the four of them they are every way a list arrives
 * — a handful of lines, a hundred, a spreadsheet export with a header and six
 * other columns, and an SDF — because what the page does with a list is worked
 * out from the text, and a chemist has no reason to believe that until they
 * have watched it happen to a file they recognise.
 */
export const LIST_SAMPLES: ListSample[] = [
  {
    name: 'Five structures',
    label: '.smi',
    note: 'A SMILES and a name per line, which is what a .smi file holds.',
    text: PLAIN_SAMPLE,
  },
  {
    name: 'A hundred structures',
    label: '.smi',
    note: 'The same, at the size where the filter box and a substructure query start to earn their place.',
    text: LIBRARY_SAMPLE,
  },
  {
    name: 'A spreadsheet export',
    label: '.csv',
    note: 'A header row and six columns besides the structure: the comma and the column are found, and the rest is kept.',
    text: INVENTORY_SAMPLE,
  },
  {
    name: 'An inventory as an SDF',
    label: '.sdf',
    note: 'Molfiles with their fields under them. Name becomes the label, the other fields ride along.',
    text: SDF_SAMPLE,
  },
];
