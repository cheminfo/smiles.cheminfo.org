import { computed, signal } from '@preact/signals-react';

import { looksLikeReaction } from '../chemistry/parseReaction.ts';
import { readInput } from '../chemistry/readInput.ts';
import { readReactionInput } from '../chemistry/readReactionInput.ts';
import type { InputFormat, StructureKind } from '../chemistry/types.ts';

import { persistBucket } from './persist.ts';
import { replaceParameters, route, searchParameter } from './router.ts';

/** What the converter is working on. */
export const view = {
  /** The line notation in the box, as typed. */
  input: signal<string>(''),
  /**
   * Which of the three things the box holds. Read off the tab rather than
   * guessed from the text: `CC` is a molecule and a query and the difference
   * is not in the string, so the page has to be told which one is meant.
   */
  kind: signal<StructureKind>('molecule'),
  /**
   * What the canvas holds when it is next mounted, and the count that mounts
   * it. The editor is uncontrolled — it owns the drawing while a hand is on
   * it — so a structure that came from anywhere else reaches it by replacing
   * it, never by a prop it would fight with.
   */
  editorIdCode: signal<string>(''),
  editorRevision: signal<number>(0),
};

export const preferences = persistBucket('smiles:converter:v1', {
  /**
   * Whether the drawing names the rings: which ring every ring atom is in,
   * written above it, and the ring bonds painted. What a ring closure digit
   * in the SMILES stands for is the thing the drawing otherwise leaves the
   * reader to work out for themselves.
   */
  showRings: signal<boolean>(false),
});

/**
 * How the box is read. A molfile, an idCode and a line notation are told apart
 * from the text itself, so there is nothing to ask the student — but the tab
 * has the last word on a query, because a pattern that parses as a molecule —
 * `CC` — would otherwise be read as one.
 */
export const inputFormat = computed<InputFormat>(() =>
  view.kind.value === 'query' ? 'smarts' : 'auto',
);

/** The structure in the box, or what is wrong with it. Empty on the reaction tab. */
export const structure = computed(() =>
  view.kind.value === 'reaction'
    ? readInput('')
    : readInput(view.input.value, inputFormat.value),
);

/** The reaction in the box, or what is wrong with it. Empty on the other tabs. */
export const reaction = computed(() =>
  view.kind.value === 'reaction'
    ? readReactionInput(view.input.value)
    : readReactionInput(''),
);

/**
 * Put a structure in the box, from anywhere but the canvas: an example, a
 * shared link, a paste. The canvas is replaced to match.
 * @param text - The structure to show.
 */
export function setInput(text: string): void {
  view.input.value = text;
  replaceCanvas(text);
  writeAddress();
}

/**
 * Open another tab, keeping what is in the box: switching to the reaction tab
 * with half a reaction typed is how a reaction gets written, and clearing the
 * box would throw that away.
 * @param kind - The tab to open.
 */
export function setKind(kind: StructureKind): void {
  if (view.kind.peek() === kind) return;
  view.kind.value = kind;
  replaceCanvas(view.input.peek());
  writeAddress();
}

/**
 * Take what was drawn on the molecule canvas. The box is rewritten but the
 * canvas is left exactly as it is: remounting it under a hand that is still
 * drawing would throw the drawing away, and the atoms are where the student
 * put them.
 * @param editorValue - The idCode and coordinates the editor handed over.
 */
export function setDrawn(editorValue: string): void {
  const result = readInput(editorValue, 'idcode');
  view.input.value = result.ok
    ? writeDrawn(result.structure.smiles, result.structure.smarts)
    : '';
  writeAddress();
}

/**
 * Take what was drawn on the reaction canvas, which hands over a reaction
 * SMILES rather than an idCode.
 * @param smiles - The reaction SMILES the editor handed over.
 */
export function setReactionDrawn(smiles: string): void {
  // An empty reaction canvas still writes its two arrows, which is not
  // something anyone typed and reads as an error in the box.
  view.input.value = /[A-Za-z]/.test(smiles) ? smiles : '';
  writeAddress();
}

/** The name of the parameter a link carries the structure in. */
export const SMILES_PARAM = 'smiles';

/** The name of the parameter a link carries the tab in. */
export const KIND_PARAM = 'kind';

/**
 * Read the structure a link names, before the first paint, so an address opens
 * on what it says rather than on what this browser last did.
 */
export function readAddress(): void {
  if (route.page.peek() !== 'converter') return;
  const input = searchParameter(SMILES_PARAM);
  view.kind.value = kindOf(searchParameter(KIND_PARAM), input);
  if (input) setInput(input);
}

/**
 * Which tab a link opens on. A link that says nothing about it is read from
 * what it carries, so an address written before the tabs existed — and one
 * pasted out of a paper — still opens on the right one.
 * @param named - The `kind` parameter, when the link carries one.
 * @param input - The structure the link carries.
 * @returns The tab to open.
 */
function kindOf(named: string | null, input: string | null): StructureKind {
  const kinds: StructureKind[] = ['molecule', 'query', 'reaction'];
  const kind = kinds.find((one) => one === named);
  if (kind) return kind;
  return input && looksLikeReaction(input) ? 'reaction' : 'molecule';
}

/**
 * Put the text in the canvas, as whatever the current tab reads it as. A text
 * that cannot be read empties the canvas rather than leaving the last drawing
 * under a box that no longer says it.
 * @param text - What the box holds.
 */
function replaceCanvas(text: string): void {
  view.editorIdCode.value = canvasValue(text);
  view.editorRevision.value++;
}

function canvasValue(text: string): string {
  if (view.kind.peek() === 'reaction') {
    const result = readReactionInput(text);
    return result.ok ? result.structure.idCode : '';
  }
  const result = readInput(text, inputFormat.peek());
  return result.ok
    ? `${result.structure.idCode} ${result.structure.coordinates}`
    : '';
}

/**
 * How a drawing is written in the box. A query drawn as a fragment is a
 * SMARTS: writing it as a SMILES would drop every query feature the student
 * just drew.
 * @param smiles - The drawing as a SMILES.
 * @param smarts - The drawing as a SMARTS.
 * @returns What the box says.
 */
function writeDrawn(smiles: string, smarts: string): string {
  return view.kind.peek() === 'query' ? smarts : smiles;
}

function writeAddress(): void {
  const input = view.input.peek().trim();
  const kind = view.kind.peek();
  replaceParameters({
    [SMILES_PARAM]: input || undefined,
    [KIND_PARAM]: kind === 'molecule' ? undefined : kind,
  });
}
