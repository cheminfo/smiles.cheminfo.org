/** How a piece of text is to be read as a structure. */
export type InputFormat = 'auto' | 'smiles' | 'smarts' | 'molfile' | 'idcode';

/**
 * What a piece of text is meant to be. A molecule and a query are read by the
 * same parser and differ in what the parser is told; a reaction is a different
 * object altogether, so the three are never guessed between silently.
 */
export type StructureKind = 'molecule' | 'query' | 'reaction';

/** How a piece of text is to be read as a reaction. */
export type ReactionInputFormat = 'auto' | 'smiles' | 'rxn' | 'idcode';

/** Every way this service writes a structure back out. */
export type OutputFormat =
  'smiles' | 'kekule' | 'smarts' | 'idcode' | 'molfile' | 'molfileV3';

/** A structure, written every way at once. */
export interface Structure {
  /** Canonical, aromatic, stereochemistry included. */
  smiles: string;
  /** The same molecule with its aromatic rings written as alternating bonds. */
  kekule: string;
  /** The molecule read as a query pattern. */
  smarts: string;
  /** openchemlib's canonical identifier, which is what two structures are compared by. */
  idCode: string;
  /** Where the atoms sit, so a drawing survives a round trip. */
  coordinates: string;
  molfile: string;
  /** Hill-ordered molecular formula, implicit hydrogens included. */
  mf: string;
  /** Average mass, in g/mol. */
  mw: number;
  /** Monoisotopic mass, in g/mol. */
  monoisotopicMass: number;
  atoms: number;
  bonds: number;
  /** True when the input carried query features, so it is a pattern rather than a molecule. */
  isQuery: boolean;
  /** Which notation the input turned out to be written in. */
  readAs: 'smiles' | 'smarts' | 'molfile' | 'idcode';
}

/** A reaction, written every way at once. */
export interface ReactionStructure {
  /**
   * The reaction written back by openchemlib: every component canonical, and
   * the components in a fixed order, so two spellings of one reaction come
   * back as the same string.
   */
  smiles: string;
  /** openchemlib's own identifier for the whole reaction, catalysts included. */
  idCode: string;
  /** The MDL reaction file, which is what most software exchanges reactions as. */
  rxn: string;
  reactants: number;
  /** Components written between the two arrows: catalysts, solvents, reagents. */
  catalysts: number;
  products: number;
  /** True when at least one atom carries an atom class, which maps the two sides. */
  isMapped: boolean;
  /** True when the reaction carried query features, so it is a pattern. */
  isQuery: boolean;
  /** Which notation the input turned out to be written in. */
  readAs: 'smiles' | 'rxn' | 'idcode';
}

/** What went wrong while reading a structure, and where. */
export interface StructureError {
  message: string;
  /**
   * Index of the offending character in the input, when the parser said which
   * one it was.
   */
  position?: number;
}
