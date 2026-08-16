import type { Page } from '@playwright/test';
import { expect } from '@playwright/test';

/** The exercise the write-a-SMILES specs work on: malonic acid. */
export const WRITE_EXERCISE = '/exercises/molecule-to-smiles/w4';

/** The placeholder of the answer box on a write-a-SMILES question. */
export const WRITE_PLACEHOLDER = 'CC(=O)O';

/** The placeholder of the answer box on a write-a-SMARTS question. */
export const SMARTS_PLACEHOLDER = '[CX3](=O)[OX2H1]';

/**
 * Hand an answer in, which is the only thing that marks it. Typing alone keeps
 * a draft, so a spec that only filled the box is asserting on nothing.
 * @param page - The page under test.
 * @param placeholder - Which answer box, so a query question and a structure
 * question use the same call.
 * @param answer - What to type.
 */
export async function submitAnswer(
  page: Page,
  placeholder: string,
  answer: string,
): Promise<void> {
  await page.getByPlaceholder(placeholder).fill(answer);
  await page.getByRole('button', { name: 'Submit answer' }).click();
}

/**
 * Assert the answer card says the answer was right.
 * @param page - The page under test.
 */
export async function expectRight(page: Page): Promise<void> {
  await expect(page.locator('.answer-card').getByText('Right.')).toBeVisible();
}

/**
 * Paste a list into the lists page and convert it, waiting until the table has
 * been filled — every list spec starts here.
 * @param page - The page under test.
 * @param text - The list, in whatever a chemist pasted.
 * @param structures - How many structures the heading must then report.
 */
export async function convertList(
  page: Page,
  text: string,
  structures: number,
): Promise<void> {
  await page.locator('textarea.list-input').fill(text);
  await convertLoaded(page, structures);
}

/**
 * Convert whatever the input box already holds — a sample picked from the menu
 * rather than typed.
 * @param page - The page under test.
 * @param structures - How many structures the heading must then report.
 */
export async function convertLoaded(
  page: Page,
  structures: number,
): Promise<void> {
  await page.getByRole('button', { name: 'Convert', exact: true }).click();
  await expect(
    page.getByRole('heading', { name: `${structures} structures` }),
  ).toBeVisible();
}

/**
 * Load one of the samples the lists page ships.
 * @param page - The page under test.
 * @param name - The entry of the Sample menu.
 */
export async function pickSample(page: Page, name: string): Promise<void> {
  await page.getByRole('button', { name: 'Sample' }).click();
  await page.getByRole('menuitem', { name }).click();
}
