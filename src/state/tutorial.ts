import { computed, signal } from '@preact/signals-react';

import { readInput } from '../chemistry/readInput.ts';
import { TUTORIAL_STEPS } from '../data/tutorial.ts';

import { persistBucket } from './persist.ts';
import { replaceParameters, route, searchParameter } from './router.ts';

/** The name of the parameter a link carries the step in. */
export const STEP_PARAM = 'step';

export const view = {
  /** Which step is open, as an index into {@link TUTORIAL_STEPS}. */
  step: signal<number>(0),
  /** What is in the playground box, which starts as the step and is then edited. */
  input: signal<string>(TUTORIAL_STEPS[0]?.smiles ?? 'C'),
};

export const preferences = persistBucket('smiles:tutorial:v1', {
  /** The furthest step reached, so the tab reopens where the student was. */
  furthest: signal<number>(0),
});

/** The structure in the playground, or what is wrong with it. */
export const structure = computed(() => readInput(view.input.value));

/** Whether the box still holds what the step opened on. */
export const isUnchanged = computed(
  () => view.input.value === (TUTORIAL_STEPS[view.step.value]?.smiles ?? ''),
);

/**
 * Open a step, loading its structure into the playground.
 * @param index - Which step; out of range values are clamped.
 */
export function openStep(index: number): void {
  const step = Math.min(Math.max(index, 0), TUTORIAL_STEPS.length - 1);
  view.step.value = step;
  view.input.value = TUTORIAL_STEPS[step]?.smiles ?? '';
  preferences.furthest.value = Math.max(preferences.furthest.peek(), step);
  replaceParameters({ [STEP_PARAM]: String(step + 1) });
}

/** Put the step's own structure back after the student has edited it. */
export function resetStep(): void {
  view.input.value = TUTORIAL_STEPS[view.step.peek()]?.smiles ?? '';
}

/**
 * Read the step a link names.
 *
 * The address counts from 1, because it is read by people: `?step=7` is the
 * seventh step, not the eighth.
 */
export function readAddress(): void {
  if (route.page.peek() !== 'tutorial') return;
  const named = Number(searchParameter(STEP_PARAM));
  if (Number.isFinite(named) && named >= 1) openStep(named - 1);
}
