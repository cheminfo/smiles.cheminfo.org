import { signal } from '@preact/signals-react';
import type { MoleculesDB } from 'openchemlib-utils';

import { structureErrorMessage } from '../chemistry/errorMessage.ts';
import type { ListHit, SearchMode } from '../chemistry/moleculesDatabase.ts';
import { searchDatabase } from '../chemistry/moleculesDatabase.ts';
import type { ListLayout } from '../chemistry/splitList.ts';
import type { ListRow } from '../chemistry/structureList.ts';
import { readList } from '../chemistry/structureList.ts';
import type { InputFormat, OutputFormat } from '../chemistry/types.ts';

import { persistBucket } from './persist.ts';
import { replaceParameters, route, searchParameter } from './router.ts';

/** The name of the parameter a link carries the query in. */
export const QUERY_PARAM = 'q';
/**
 * The name of the parameter a link carries a hosted list in. Not `set`: that
 * belongs to the exercises, and a parameter that feeds a page belongs to that
 * page alone — two meanings for one name is a link that does the wrong thing
 * on the wrong tab.
 */
export const SOURCE_PARAM = 'source';

export const data = {
  /** Every line of the list, read. */
  rows: signal<ListRow[]>([]),
  /** The same molecules, indexed. Not serializable, and never persisted. */
  database: signal<MoleculesDB | null>(null),
  /** How many lines were read into it. */
  read: signal<number>(0),
  /** How the text was written, so the page can say which column it read. */
  layout: signal<ListLayout | null>(null),
};

export const view = {
  /** The list, as pasted, dropped or fetched. */
  input: signal<string>(''),
  query: signal<string>(''),
  /** Keywords narrowing the table by what the file said, not by structure. */
  filter: signal<string>(''),
  /** The rows a query kept, or null when the whole list is shown. */
  hits: signal<ListHit[] | null>(null),
  /** How far the work has got, 0 to 1, or null when none is running. */
  progress: signal<number | null>(null),
  busy: signal<'reading' | 'searching' | null>(null),
  error: signal<string | null>(null),
};

export const preferences = persistBucket('smiles:lists:v1', {
  from: signal<InputFormat>('auto'),
  to: signal<OutputFormat>('smiles'),
  mode: signal<SearchMode>('substructure'),
  /** Most hits shown. A list of ten thousand can match most of itself. */
  limit: signal<number>(500),
});

let running: AbortController | null = null;
/** The text the current rows were read from, so a stale list can be spotted. */
let readFrom: string | null = null;

/**
 * Read everything in the box: the table it fills and the set a query runs over
 * are the same reading.
 * @returns When every line has been read, or the run was stopped.
 */
export async function convertList(): Promise<void> {
  running?.abort();
  const controller = new AbortController();
  running = controller;

  const text = view.input.peek();
  view.busy.value = 'reading';
  view.error.value = null;
  view.hits.value = null;
  view.progress.value = 0;

  try {
    const result = await readList(text, {
      from: preferences.from.peek(),
      signal: controller.signal,
      onStep: (done, total) => {
        view.progress.value = total === 0 ? 1 : done / total;
      },
    });
    data.rows.value = result.rows;
    data.database.value = result.database;
    data.read.value = result.read;
    data.layout.value = result.layout;
    readFrom = text;
  } catch (error) {
    view.error.value = structureErrorMessage(error);
  } finally {
    view.busy.value = null;
    view.progress.value = null;
    if (running === controller) running = null;
  }
}

/**
 * Run the query in the box over the list, reading the list first when the box
 * above has been edited since — one list, two verbs, and no order to get right.
 * @returns When the search is done, or was stopped.
 */
export async function runSearch(): Promise<void> {
  const query = view.query.peek().trim();
  if (!query) return;
  if (view.input.peek() !== readFrom) await convertList();

  const database = data.database.peek();
  if (!database) return;

  running?.abort();
  const controller = new AbortController();
  running = controller;

  view.busy.value = 'searching';
  view.error.value = null;
  view.progress.value = 0;
  writeAddress();

  try {
    view.hits.value = await searchDatabase(database, query, {
      mode: preferences.mode.peek(),
      limit: preferences.limit.peek(),
      signal: controller.signal,
      onStep: (done, total) => {
        view.progress.value = total === 0 ? 1 : done / total;
      },
    });
  } catch (error) {
    // Aborting is how the Stop button works, not a failure to report.
    if (!controller.signal.aborted) {
      view.error.value = structureErrorMessage(error);
      view.hits.value = null;
    }
  } finally {
    view.busy.value = null;
    view.progress.value = null;
    if (running === controller) running = null;
  }
}

/** Stop whatever is running. */
export function stopWork(): void {
  running?.abort();
}

/** Forget the query, so the whole list is shown again. */
export function clearQuery(): void {
  stopWork();
  view.query.value = '';
  view.hits.value = null;
  view.error.value = null;
  writeAddress();
}

/** Throw the list and everything read from it away. */
export function clearList(): void {
  stopWork();
  view.input.value = '';
  view.filter.value = '';
  view.hits.value = null;
  view.error.value = null;
  view.progress.value = null;
  data.rows.value = [];
  data.database.value = null;
  data.read.value = 0;
  data.layout.value = null;
  readFrom = null;
}

/**
 * Read what a link names: the query, and a list hosted anywhere that answers
 * with plain text — which is how a teacher hands out their own set of
 * structures without this service holding any of it.
 */
export function readAddress(): void {
  // Only when this is the page being opened: another page's address may carry
  // a parameter of the same name, and fetching whatever it holds would be
  // both wrong and expensive.
  if (route.page.peek() !== 'lists') return;

  const query = searchParameter(QUERY_PARAM);
  if (query) view.query.value = query;

  const url = searchParameter(SOURCE_PARAM);
  if (url) void fetchList(url);
}

async function fetchList(url: string): Promise<void> {
  view.busy.value = 'reading';
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`The list at ${url} answered ${response.status}.`);
    }
    view.input.value = await response.text();
    await convertList();
    if (view.query.peek().trim()) await runSearch();
  } catch (error) {
    view.error.value = structureErrorMessage(error);
    view.busy.value = null;
  }
}

function writeAddress(): void {
  const query = view.query.peek().trim();
  replaceParameters({ [QUERY_PARAM]: query || undefined });
}
