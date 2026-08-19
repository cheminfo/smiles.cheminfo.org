import { expect, test } from 'vitest';

import type { TutorialStep } from '../../data/tutorial.ts';
import { TUTORIAL_STEPS } from '../../data/tutorial.ts';
import { describeStep, plain } from '../pageMetaText.ts';
import { PAGE_ROUTES } from '../routes.ts';

/**
 * Prose whose description is cut exactly where the opening ends.
 *
 * What follows carries no space, so the last word boundary a cut at the length
 * a search result shows can fall back to is the one the opening ends on — which
 * makes the opening, and nothing else, what the ellipsis is written after.
 * @param opening - The words the cut lands after.
 * @returns The step's prose.
 */
function cutAfter(opening: string): TutorialStep {
  return {
    title: 'Rings close with a digit',
    description: `${opening} ${'x'.repeat(200)}`,
    smiles: 'C1CCCCC1',
    level: 'beginner',
  };
}

test('a cut gives up the punctuation the words it dropped were hiding', () => {
  expect(
    describeStep(
      cutAfter(
        'Ring closure. The two atoms that must be bonded both carry the ring bond number 1, so a',
      ),
    ).description,
  ).toBe(
    'Ring closure. The two atoms that must be bonded both carry the ring bond number 1…',
  );
});

test('a cut landing on punctuation alone still gives it up', () => {
  expect(
    describeStep(
      cutAfter(
        'Ring closure. The digit is only a label and it says nothing at all about the ring size,',
      ),
    ).description,
  ).toBe(
    'Ring closure. The digit is only a label and it says nothing at all about the ring size…',
  );
});

test('a joining word is dropped, a hyphen inside a word is not', () => {
  expect(
    describeStep(
      cutAfter(
        'Ring closure. The digit is a label — the size of the ring is what you get by counting the',
      ),
    ).description,
  ).toBe(
    'Ring closure. The digit is a label — the size of the ring is what you get by counting…',
  );

  expect(
    describeStep(
      cutAfter(
        'Ring closure. Tetrahydropyran and tetrahydrofuran are both written with a well-known ring',
      ),
    ).description,
  ).toBe(
    'Ring closure. Tetrahydropyran and tetrahydrofuran are both written with a well-known ring…',
  );
});

test('the step the comma was left on is described without it', () => {
  const step = TUTORIAL_STEPS[4];
  if (step === undefined) throw new Error('the tutorial has no fifth step');
  expect(step.title).toBe('Rings close with a digit');
  expect(describeStep(step).description).toBe(
    'To make a ring, put the same digit on the two atoms that must be bonded. In C1CCCCC1 the first and the last carbon both carry the ring bond number 1…',
  );
});

test('no page is described by a sentence ending on what it was cut from', () => {
  expect(PAGE_ROUTES).toHaveLength(139);
  for (const route of PAGE_ROUTES) {
    expect(route.description).not.toMatch(/[\s,;:—–-]…$/u);
  }
});

test('a description is read as a search result shows it', () => {
  expect(plain('  a [[ring closure]] joins\nthem  with `C1CCCCC1` ')).toBe(
    'a ring closure joins them with C1CCCCC1',
  );
});
