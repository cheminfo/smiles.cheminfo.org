import { expect, test } from '@playwright/test';

import {
  SMARTS_PLACEHOLDER,
  WRITE_EXERCISE,
  WRITE_PLACEHOLDER,
  expectRight,
  submitAnswer,
} from './helpers.ts';

test('a right SMILES is accepted once it is submitted', async ({ page }) => {
  await page.goto(WRITE_EXERCISE);

  await expect(
    page.getByRole('heading', { name: 'Malonic acid' }),
  ).toBeVisible();
  await submitAnswer(page, WRITE_PLACEHOLDER, 'OC(=O)CC(=O)O');

  await expectRight(page);
  await expect(page.getByText('First attempt.')).toBeVisible();
});

test('nothing is marked before it is submitted', async ({ page }) => {
  await page.goto(WRITE_EXERCISE);

  // A right answer half typed is a wrong one, and saying so is exactly what
  // submitting is here to prevent.
  await page.getByPlaceholder(WRITE_PLACEHOLDER).fill('OC(=O)C');
  await expect(page.locator('.answer-card .bp6-callout')).toHaveCount(0);
  await expect(
    page.getByText('Nothing is marked until you submit it.'),
  ).toBeVisible();
});

test('the running check reads the draft as it is typed, and never marks it', async ({
  page,
}) => {
  await page.goto(WRITE_EXERCISE);

  const check = page.locator('.self-check');
  await expect(
    check.getByText('Start writing and this says whether it reads', {
      exact: false,
    }),
  ).toBeVisible();

  // A draft that does not read says so, and where, before anything is handed in.
  await page.getByPlaceholder(WRITE_PLACEHOLDER).fill('C1CC');
  await expect(check.getByText('Dangling ring closure: 1')).toBeVisible();

  // One that reads but is short of atoms says which ones.
  await page.getByPlaceholder(WRITE_PLACEHOLDER).fill('CCO');
  await expect(check.getByText('The atoms do not add up yet.')).toBeVisible();
  await expect(check.locator('.verdict-formula')).toContainText('short of');

  // The right atoms, however they are joined: the arithmetic is all this can
  // speak to, so it says so and stops. Every isomer of the answer gets here.
  await page.getByPlaceholder(WRITE_PLACEHOLDER).fill('OC(=O)CC(=O)O');
  await expect(
    check.getByText('The atoms add up', { exact: false }),
  ).toBeVisible();
  await expect(
    check.getByText('submit it to find out', { exact: false }),
  ).toBeVisible();
  // Nothing above was the mark: the answer card is still empty.
  await expect(page.locator('.answer-card .bp6-callout')).toHaveCount(0);
});

test('a link can switch the running check off', async ({ page }) => {
  await page.goto(`${WRITE_EXERCISE}&hide=check`);

  await page.getByPlaceholder(WRITE_PLACEHOLDER).fill('CCO');
  await expect(page.locator('.self-check')).toHaveCount(0);
});

test('another correct spelling of the same molecule is also accepted', async ({
  page,
}) => {
  await page.goto(WRITE_EXERCISE);

  await submitAnswer(page, WRITE_PLACEHOLDER, 'C(C(=O)O)C(=O)O');
  await expectRight(page);
});

test('a wrong molecule is refused with a reason', async ({ page }) => {
  await page.goto(WRITE_EXERCISE);

  await submitAnswer(page, WRITE_PLACEHOLDER, 'CCO');
  await expect(
    page.getByText('That SMILES reads as a different molecule.'),
  ).toBeVisible();
});

test('a SMILES that will not parse is pointed at, with the rule that was broken', async ({
  page,
}) => {
  await page.goto(WRITE_EXERCISE);

  await submitAnswer(page, WRITE_PLACEHOLDER, 'C1CC');

  // Scoped to the mark: the running check says the same things about the same
  // draft, so an unscoped selector matches both cards rather than this one.
  const verdict = page.locator('.answer-card');
  await expect(verdict.getByText('Dangling ring closure: 1')).toBeVisible();
  // The input repeated under the message, with a caret under the character.
  await expect(verdict.locator('.notation-caret')).toContainText('C1CC');
  await expect(
    verdict.getByText('A ring was opened and never closed', { exact: false }),
  ).toBeVisible();
});

test('a wrong molecule says which atoms are missing and which are in excess', async ({
  page,
}) => {
  await page.goto(WRITE_EXERCISE);

  // Ethanol where malonic acid was asked for: a carbon and three oxygens short,
  // and two hydrogens too many.
  await submitAnswer(page, WRITE_PLACEHOLDER, 'CCO');

  const verdict = page.locator('.answer-card');
  const formula = verdict.locator('.verdict-formula');
  await expect(formula).toContainText('short of');
  await expect(formula).toContainText('too many');
  await expect(
    verdict.getByText('The atoms themselves do not add up yet', {
      exact: false,
    }),
  ).toBeVisible();
});

test('the attempts are counted, and editing drops the mark', async ({
  page,
}) => {
  await page.goto(WRITE_EXERCISE);

  await page.getByPlaceholder(WRITE_PLACEHOLDER).fill('CCO');
  // Enter hands it in, like the button does.
  await page.getByPlaceholder(WRITE_PLACEHOLDER).press('Enter');
  await expect(
    page.locator('.answer-card').getByText('1 attempt', { exact: true }),
  ).toBeVisible();

  await page.getByPlaceholder(WRITE_PLACEHOLDER).fill('CCCO');
  await expect(
    page.getByText('That SMILES reads as a different molecule.'),
  ).toHaveCount(0);
  await expect(
    page.getByText('Changed since your last submission.'),
  ).toBeVisible();

  await page.getByRole('button', { name: 'Submit answer' }).click();
  await expect(
    page.locator('.answer-card').getByText('2 attempts', { exact: true }),
  ).toBeVisible();

  await submitAnswer(page, WRITE_PLACEHOLDER, 'OC(=O)CC(=O)O');
  await expect(page.getByText('3rd attempt.')).toBeVisible();
});

test('what was answered, and what it cost, survives a reload', async ({
  page,
}) => {
  await page.goto(WRITE_EXERCISE);

  await submitAnswer(page, WRITE_PLACEHOLDER, 'CCO');
  await submitAnswer(page, WRITE_PLACEHOLDER, 'OC(=O)CC(=O)O');
  await expectRight(page);

  await page.reload();
  await expect(page.getByPlaceholder(WRITE_PLACEHOLDER)).toHaveValue(
    'OC(=O)CC(=O)O',
  );
  await expectRight(page);
  await expect(
    page.locator('.answer-card').getByText('2 attempts', { exact: true }),
  ).toBeVisible();
});

test('a draft left mid-edit comes back unmarked', async ({ page }) => {
  await page.goto(WRITE_EXERCISE);

  await submitAnswer(page, WRITE_PLACEHOLDER, 'OC(=O)CC(=O)O');
  await page.getByPlaceholder(WRITE_PLACEHOLDER).fill('OC(=O)CC(=O)OCC');

  await page.reload();
  await expect(page.getByPlaceholder(WRITE_PLACEHOLDER)).toHaveValue(
    'OC(=O)CC(=O)OCC',
  );
  await expect(page.locator('.answer-card .bp6-callout')).toHaveCount(0);
});

test('resetting forgets the answer, the attempts and the hints', async ({
  page,
}) => {
  await page.goto('/exercises?set=patterns&exercise=s1');

  await submitAnswer(page, SMARTS_PLACEHOLDER, 'C=O');
  await page.getByRole('button', { name: 'Reveal a hint (1 of 3)' }).click();
  await expect(
    page.locator('.answer-card').getByText('1 attempt', { exact: true }),
  ).toBeVisible();
  await expect(
    page.locator('.answer-card').getByText('1 hint', { exact: true }),
  ).toBeVisible();

  await page.getByRole('button', { name: 'Reset' }).click();
  await expect(page.getByPlaceholder(SMARTS_PLACEHOLDER)).toHaveValue('');
  await expect(
    page.locator('.answer-card').getByText('1 attempt', { exact: true }),
  ).toHaveCount(0);
  await expect(
    page.locator('.answer-card').getByText('1 hint', { exact: true }),
  ).toHaveCount(0);
});

test('a SMARTS exercise lights its test cases up once submitted', async ({
  page,
}) => {
  await page.goto('/exercises?set=patterns&exercise=s2');

  await expect(page.getByText('Must match', { exact: true })).toBeVisible();
  await expect(page.getByText('Must not match', { exact: true })).toBeVisible();

  await page.getByPlaceholder(SMARTS_PLACEHOLDER).fill('[CX3](=O)[OX2H1]');
  await expect(page.locator('.case-cell--pass')).toHaveCount(0);

  await page.getByRole('button', { name: 'Submit answer' }).click();
  await expectRight(page);
  await expect(page.locator('.case-cell--fail')).toHaveCount(0);
  await expect(page.locator('.case-cell--pass')).toHaveCount(6);
});

test('an over-matching SMARTS is refused and shows which case broke', async ({
  page,
}) => {
  await page.goto('/exercises?set=patterns&exercise=s2');

  await submitAnswer(page, SMARTS_PLACEHOLDER, 'C=O');
  await expect(page.locator('.case-cell--fail').first()).toBeVisible();
});

test('hints come one at a time', async ({ page }) => {
  await page.goto('/exercises?set=patterns&exercise=s1');

  await expect(page.getByText('3 hints, from a nudge')).toBeVisible();
  await page.getByRole('button', { name: 'Reveal a hint (1 of 3)' }).click();
  await expect(page.locator('.hint-list li')).toHaveCount(1);
  await page.getByRole('button', { name: 'Reveal a hint (2 of 3)' }).click();
  await expect(page.locator('.hint-list li')).toHaveCount(2);
});

test('the cheatsheet opens beside the question, holding the notation it is about', async ({
  page,
}) => {
  await page.goto(WRITE_EXERCISE);

  const button = page
    .locator('.question-card')
    .getByRole('button', { name: 'Cheatsheet' });
  await button.click();
  const dialog = page.getByRole('dialog');
  await expect(dialog.getByText('SMILES — Atoms')).toBeVisible();
  // A molecule to write out is no place for recursive SMARTS.
  await expect(dialog.getByText('SMARTS — Logical operators')).toHaveCount(0);
  await dialog.getByRole('button', { name: 'Close the sheet' }).click();
  await expect(dialog).toHaveCount(0);

  // The question is still there, and so is what was typed into it.
  await expect(
    page.getByText('Write the SMILES of this molecule.'),
  ).toBeVisible();

  await page.goto('/exercises?set=patterns&exercise=s1');
  await page
    .locator('.question-card')
    .getByRole('button', { name: 'Cheatsheet' })
    .click();
  const queryDialog = page.getByRole('dialog');
  await expect(queryDialog.getByText('SMILES — Atoms')).toBeVisible();
  await expect(
    queryDialog.getByText('SMARTS — Logical operators'),
  ).toBeVisible();
});

test('the answer can be given up on, and says it is only one of many', async ({
  page,
}) => {
  await page.goto(WRITE_EXERCISE);

  await page.getByRole('button', { name: 'Give up' }).click();
  await expect(
    page.getByText('Any SMILES of the same molecule is accepted'),
  ).toBeVisible();
});

test('a framed link drops the header and the parts it switches off', async ({
  page,
}) => {
  await page.goto(`${WRITE_EXERCISE}&embed=1&hide=list,hints,answers`);

  await expect(page.locator('.page-header')).toHaveCount(0);
  await expect(page.locator('.exercise-list-card')).toHaveCount(0);
  await expect(page.getByRole('button', { name: 'Give up' })).toHaveCount(0);
  // The activity itself still works.
  await submitAnswer(page, WRITE_PLACEHOLDER, 'OC(=O)CC(=O)O');
  await expectRight(page);
});

test('the other sets are one click away', async ({ page }) => {
  await page.goto('/exercises');

  await page
    .locator('.set-picker')
    .getByText('SMILES → Molecule', { exact: false })
    .click();

  await expect(page).toHaveURL(/set=smiles-to-molecule&exercise=d\d+/);
  await expect(
    page.locator('.exercise-list-card').getByRole('heading', {
      name: 'SMILES → Molecule',
    }),
  ).toBeVisible();

  await page
    .locator('.set-picker')
    .getByText('Write a SMARTS', { exact: false })
    .click();
  await expect(page.getByPlaceholder(SMARTS_PLACEHOLDER)).toBeVisible();
});

test('a link naming exercises hands out exactly those', async ({ page }) => {
  await page.goto('/exercises?exercises=w2,w15');

  await expect(page.locator('.exercise-row')).toHaveCount(2);
  await expect(page.getByText('0 / 2')).toBeVisible();
});

test('an unknown exercise id is skipped rather than fatal', async ({
  page,
}) => {
  await page.goto('/exercises?exercises=w2,nothing-by-that-name');

  // The one exercise left is a set with nothing to list.
  await expect(page.locator('.exercise-list-card')).toHaveCount(0);
  await expect(page.locator('.question-card')).toBeVisible();
});

test('reaching the tab from another page opens the first exercise', async ({
  page,
}) => {
  await page.goto('/');
  await page.getByRole('button', { name: 'Exercises', exact: true }).click();

  await expect(
    page.getByRole('heading', { name: 'Dichlorodifluoromethane' }),
  ).toBeVisible();
  await expect(page).toHaveURL('/exercises?exercise=w47');
});
