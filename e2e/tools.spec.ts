import { readFile } from 'node:fs/promises';

import { expect, test } from '@playwright/test';

import { convertList, convertLoaded, pickSample } from './helpers.ts';

test('a list is converted line by line, failures kept in place', async ({
  page,
}) => {
  await page.goto('/lists');

  await convertList(page, 'CCO ethanol\nc1ccccc1 benzene\nQQQ nonsense', 3);
  await expect(page.getByText('1 could not be read')).toBeVisible();
  await expect(page.getByText('ethanol', { exact: true })).toBeVisible();
  await expect(page.locator('.list-row--failed')).toHaveCount(1);
});

test('a CSV is read without being told which column holds the SMILES', async ({
  page,
}) => {
  await page.goto('/lists');

  await convertList(
    page,
    'ID,Name,CAS,SMILES\n1,ethanol,64-17-5,CCO\n2,benzene,71-43-2,c1ccccc1',
    2,
  );
  await expect(
    page.getByText(
      'Read as a comma-separated table with a header, structures from “SMILES”, names from “Name”, 2 other columns kept as fields.',
    ),
  ).toBeVisible();
  await expect(page.getByText('ethanol', { exact: true })).toBeVisible();
  // The columns that named nothing are kept beside the structure.
  await expect(page.locator('.list-row-fields').first()).toHaveText(
    'ID 1CAS 64-17-5',
  );
});

test('the SDF sample is drawn with its name and every field it carries', async ({
  page,
}) => {
  await page.goto('/lists');

  await pickSample(page, 'An inventory as an SDF');
  await convertLoaded(page, 4);
  await expect(
    page.getByText(
      'Read as an SDF — the name and every other field of a record are kept.',
    ),
  ).toBeVisible();

  // The record's Name field is its label, and the four other fields are shown
  // beside the molecule rather than dropped on the way in.
  await expect(page.getByText('Aspirin', { exact: true })).toBeVisible();
  await expect(page.locator('.list-row-fields').first()).toHaveText(
    'CAS 50-78-2Batch B-1042Supplier Acme Fine ChemicalsPurity (%) 99.4',
  );
  // The molfile was read, so the row shows the SMILES it converts to.
  await expect(
    page.getByText('CC(Oc1ccccc1C(O)=O)=O', { exact: true }),
  ).toBeVisible();
  await expect(page.locator('.list-row svg').first()).toBeVisible();

  // A field the file carried is a field the filter box searches.
  await page.getByPlaceholder('Filter by name or field').fill('Batch:B-1044');
  await expect(page.locator('.list-row')).toHaveCount(1);
  await expect(page.getByText('Paracetamol', { exact: true })).toBeVisible();
});

test('the filter box narrows the table by what the file said', async ({
  page,
}) => {
  await page.goto('/lists');

  await convertList(
    page,
    'Name,SMILES,Batch\nethanol,CCO,B3\nbenzene,c1ccccc1,B4\nethylamine,CCN,B3',
    3,
  );

  await page.getByPlaceholder('Filter by name or field').fill('Batch:B3');
  await expect(page.getByRole('heading', { name: '2 of 3' })).toBeVisible();
  await expect(page.locator('.list-row')).toHaveCount(2);

  // A column named searches that column: the name holds no B4.
  await page.getByPlaceholder('Filter by name or field').fill('benzene');
  await expect(page.locator('.list-row')).toHaveCount(1);
});

test('a list can be written out as SMILES, CSV or an SDF', async ({ page }) => {
  await page.goto('/lists');

  await convertList(page, 'CCO ethanol\nc1ccccc1 benzene', 2);

  const download = await Promise.race([
    page.waitForEvent('download'),
    page
      .getByRole('button', { name: 'SDF' })
      .click()
      .then(() => null),
  ]);
  expect(download).not.toBeNull();
  expect(download?.suggestedFilename()).toBe('structures.sdf');
});

test('a query narrows the converted list, with the match painted', async ({
  page,
}) => {
  await page.goto('/lists');

  await pickSample(page, 'Five structures');
  await convertLoaded(page, 5);

  await page
    .getByPlaceholder('c1ccccc1  or  [CX3](=O)[OX2H1]')
    .fill('c1ccccc1');
  await page
    .locator('.bp6-card')
    .getByRole('button', { name: 'Search', exact: true })
    .click();

  // Benzene, aspirin and benzoic acid carry a benzene ring; ethanol and
  // caffeine do not.
  await expect(
    page.getByRole('heading', { name: '3 hits of 5' }),
  ).toBeVisible();
  await expect(page.locator('.list-row')).toHaveCount(3);

  // The query narrows the table it filled; clearing it gives the list back.
  await page.getByRole('button', { name: 'Show all' }).click();
  await expect(
    page.getByRole('heading', { name: '5 structures' }),
  ).toBeVisible();
});

test('a SMARTS query finds the carboxylic acids and nothing else', async ({
  page,
}) => {
  await page.goto('/lists');

  await pickSample(page, 'Five structures');
  await page
    .getByPlaceholder('c1ccccc1  or  [CX3](=O)[OX2H1]')
    .fill('[CX3](=O)[OX2H1]');
  // The list has not been read yet: searching reads it first.
  await page
    .locator('.bp6-card')
    .getByRole('button', { name: 'Search', exact: true })
    .click();

  // aspirin, benzoic acid
  await expect(
    page.getByRole('heading', { name: '2 hits of 5' }),
  ).toBeVisible();
});

test('a link loads a hosted list, searches it, and /search opens the page', async ({
  page,
}) => {
  await page.route('https://example.org/my-set.smi', (route) =>
    route.fulfill({
      contentType: 'text/plain',
      body: 'CCO ethanol\nc1ccccc1 benzene\nCc1ccccc1 toluene\n',
    }),
  );

  await page.goto('/search?source=https://example.org/my-set.smi&q=c1ccccc1');

  await expect(
    page.getByRole('heading', { name: '2 hits of 3' }),
  ).toBeVisible();
  await expect(page.getByText('toluene', { exact: true })).toBeVisible();
});

test('the tutorial walks its steps and keeps the structure live', async ({
  page,
}) => {
  await page.goto('/tutorial');

  await expect(
    page.getByRole('heading', { name: /An atom is an element/ }),
  ).toBeVisible();
  await page.getByRole('button', { name: 'Next' }).click();
  await expect(
    page.getByRole('heading', { name: /make a chain/ }),
  ).toBeVisible();
  await expect(page.getByText('C2H6O')).toBeVisible();

  // The step is a starting point, not a slide: editing it re-draws.
  await page.locator('.notation-input input').fill('CCC');
  await expect(page.getByText('C3H8')).toBeVisible();

  // Walking the tour writes the step in the address, so each one is a page.
  await expect(page).toHaveURL(/\/tutorial\/2$/);
});

test('a link written before a step had an address of its own still opens it', async ({
  page,
}) => {
  await page.goto('/tutorial?step=3');

  await expect(
    page.getByRole('heading', { name: /Parentheses open a branch/ }),
  ).toBeVisible();
  await expect(page).toHaveURL(/\/tutorial\/3$/);
});

test('a glossary term explains itself on hover', async ({ page }) => {
  await page.goto('/tutorial/2');

  await page.locator('.glossary-term').first().hover();
  await expect(page.locator('.glossary-card').first()).toBeVisible();
});

test('the SMILES sheet lists the notation and not the query language', async ({
  page,
}) => {
  await page.goto('/smiles');

  await expect(
    page.getByRole('heading', { name: 'SMILES — Atoms' }),
  ).toBeVisible();
  await expect(
    page.getByRole('heading', { name: 'SMARTS — Logical operators' }),
  ).toHaveCount(0);
  await expect(page.locator('.reference-section')).toHaveCount(11);
});

test('the SMARTS sheet lists the query language and what it borrows', async ({
  page,
}) => {
  await page.goto('/smarts');

  await expect(
    page.getByRole('heading', { name: 'SMARTS — Logical operators' }),
  ).toBeVisible();
  await expect(
    page.getByRole('heading', { name: 'SMILES — Atoms' }),
  ).toHaveCount(0);
  // The section the two sheets share opens this one.
  await expect(page.locator('#smiles-vs-smarts')).toBeVisible();
  await expect(page.locator('.reference-section')).toHaveCount(8);
});

test('each sheet links to the other', async ({ page }) => {
  await page.goto('/smiles');

  await page.locator('.sheet-switch').click();

  await expect(page).toHaveURL(/\/smarts$/);
  await expect(
    page.getByRole('heading', { name: 'SMARTS — Atom primitives' }),
  ).toBeVisible();
});

test('the address the one sheet had opens the SMILES one', async ({ page }) => {
  await page.goto('/reference');

  await expect(
    page.getByRole('heading', { name: 'SMILES — Atoms' }),
  ).toBeVisible();
});

test('a link opens a sheet on one section', async ({ page }) => {
  await page.goto('/smarts#smarts-logic');

  await expect(page.locator('#smarts-logic')).toBeInViewport();
});

test('the contents jump to a section and name it in the address', async ({
  page,
}) => {
  await page.goto('/smiles');

  await page
    .locator('.reference-contents-group a', { hasText: 'Aromaticity' })
    .click();

  await expect(page).toHaveURL(/#smiles-aromaticity$/);
  await expect(page.locator('#smiles-aromaticity')).toBeInViewport();
});

test('a cheatsheet row explains itself on hover', async ({ page }) => {
  await page.goto('/smiles');

  await page.locator('.reference-row--rich').first().hover();
  await expect(page.locator('.syntax-card').first()).toBeVisible();
});

test('the share dialog builds a framed link', async ({ page }) => {
  await page.goto('/exercises/patterns');

  await page.getByRole('button', { name: 'Share' }).click();
  await expect(page.getByText('Share or embed')).toBeVisible();

  const link = await page.locator('.share-link .code-block pre').textContent();
  expect(link).toContain('embed=1');
  expect(link).toContain('/exercises/patterns');
});

test('an SDF pasted into the list page is read as its records', async ({
  page,
}) => {
  await page.goto('/lists');

  // Round trip: the SDF this page writes is the SDF it reads.
  await convertList(page, 'CCO ethanol\nc1ccccc1 benzene', 2);

  const download = page.waitForEvent('download');
  await page.getByRole('button', { name: 'SDF' }).click();
  const sdf = await (await download).path();
  expect(sdf).toBeTruthy();

  const text = await readFile(sdf as string, 'utf8');
  await page.locator('textarea.list-input').fill(text);
  await convertLoaded(page, 2);
  await expect(page.getByText('ethanol', { exact: true })).toBeVisible();
  await expect(page.getByText('benzene', { exact: true })).toBeVisible();
});
