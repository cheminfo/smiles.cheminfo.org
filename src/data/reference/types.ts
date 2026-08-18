/** One construct of a notation, as a sheet lists it. */
export interface ReferenceEntry {
  /** The construct itself, shown in a monospace cell. */
  syntax: string;
  name: string;
  /** One line, which is what the table shows. */
  summary: string;
  /** The longer story, shown on hover. */
  detail?: string;
  /** A complete notation using the construct, drawn next to the entry. */
  exampleSmiles?: string;
  /** What the example shows, naming the molecule. */
  exampleNote?: string;
}

/** A group of constructs, which is one block of a printed sheet. */
export interface ReferenceSection {
  id: string;
  title: string;
  intro?: string;
  entries: ReferenceEntry[];
}

/** Which of the two notations a sheet is about. */
export type Notation = 'smiles' | 'smarts';
