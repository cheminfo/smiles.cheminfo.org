import type { Molecule } from 'openchemlib';
import { SSSearcher } from 'openchemlib';
import type { MoleculesDB } from 'openchemlib-utils';

import { readStructure } from '../../../chemistry/parse.ts';

import type { EntryData } from './structureList.ts';

/** How a query is run against the list. */
export type SearchMode =
  'substructure' | 'exact' | 'exactNoStereo' | 'similarity';

/** One line of the list a query matched. */
export interface ListHit {
  /** Which row of the list it is. */
  row: number;
  /** Atoms the query landed on, so the drawing can paint them. */
  matched?: number[];
}

export interface SearchOptions {
  mode: SearchMode;
  /** Most hits to report. A list of ten thousand can match most of itself. */
  limit: number;
  onStep?: (done: number, total: number) => void;
  signal?: AbortSignal;
}

/**
 * Run a query over a list that has been read.
 *
 * A substructure search touches every molecule, so it is the asynchronous one:
 * `searchAsync` hands the thread back every hundred milliseconds and watches an
 * abort signal, which is what keeps a query over ten thousand structures
 * interruptible.
 * @param database - The indexed set, as `readList` built it.
 * @param query - A SMILES, a SMARTS or an idCode.
 * @param options - Mode, ceiling, progress and cancellation.
 * @returns The rows that matched, most similar or nearest in mass first.
 * @throws When the query itself cannot be read.
 */
export async function searchDatabase(
  database: MoleculesDB,
  query: string,
  options: SearchOptions,
): Promise<ListHit[]> {
  const { mode, limit, onStep, signal } = options;
  const read = readStructure(query, 'auto');

  const controller = new AbortController();
  signal?.addEventListener('abort', () => controller.abort());

  const results = (await database.searchAsync(read.molecule, {
    mode,
    limit,
    keepMolecule: true,
    flattenResult: false,
    onStep,
    // openchemlib-utils reads `options.controller` at run time but its JSDoc
    // declares `controler`, so the generated types reject the spelling the
    // code actually honours. Passing the declared one would silently disable
    // cancellation, so the correct key is passed and the type stepped around.
    ...({ controller } as { controler?: AbortController }),
  })) as RawResult[];

  const searcher = mode === 'substructure' ? matcher(read.molecule) : null;
  const hits: ListHit[] = [];
  for (const result of results) {
    const matched = searcher ? matchedAtoms(searcher, result.molecule) : [];
    for (const entry of result.data) {
      if (typeof entry.row !== 'number') continue;
      const hit: ListHit = { row: entry.row };
      if (matched.length > 0) hit.matched = matched;
      hits.push(hit);
    }
  }
  return hits;
}

interface RawResult {
  idCode: string;
  molecule: Molecule;
  data: Array<Partial<EntryData>>;
}

/**
 * A searcher set up on the query, reused for every hit.
 *
 * `MoleculesDB` answers which molecules match but not where, and a match one
 * cannot see on the drawing is half an answer — so the query is run once more,
 * per hit, only to find out which atoms to paint.
 * @param query - The parsed query.
 * @returns The searcher, or null when the query has no atoms to match.
 */
function matcher(query: Molecule): SSSearcher | null {
  if (query.getAllAtoms() === 0) return null;
  const fragment = query.getCompactCopy();
  fragment.setFragment(true);
  const searcher = new SSSearcher();
  searcher.setFragment(fragment);
  return searcher;
}

function matchedAtoms(searcher: SSSearcher, molecule: Molecule): number[] {
  searcher.setMolecule(molecule);
  // isFragmentInMolecule only answers yes or no; the mapping exists once the
  // search has actually been run with a count mode that builds one.
  if (searcher.findFragmentInMolecule({ countMode: 'overlapping' }) === 0) {
    return [];
  }
  const atoms = new Set<number>();
  for (const match of searcher.getMatchList()) {
    for (const atom of match) {
      // An excluded group maps to -1 rather than to an atom.
      if (atom >= 0) atoms.add(atom);
    }
  }
  return [...atoms];
}
