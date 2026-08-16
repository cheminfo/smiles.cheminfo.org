import { expect, test } from '@playwright/test';

test('a SMILES typed in the box is drawn and written every other way', async ({
  page,
}) => {
  await page.goto('/');

  await page.getByPlaceholder('CC(=O)Oc1ccccc1C(=O)O').fill('CCO');

  // The drawing is an <svg> in the document, not a canvas, so it can be
  // asserted on.
  await expect(page.locator('.result-depiction svg')).toBeVisible();
  await expect(page.getByText('C2H6O')).toBeVisible();
  await expect(page.getByText('46.0686', { exact: false })).toBeVisible();
  await expect(page.getByText('read as smiles')).toBeVisible();
});

test('a SMARTS is recognised as a query and shows no formula', async ({
  page,
}) => {
  await page.goto('/');

  await page.getByPlaceholder('CC(=O)Oc1ccccc1C(=O)O').fill('[CX3](=O)[OX2H1]');

  await expect(page.getByText('read as SMARTS')).toBeVisible();
  await expect(page.getByText('a query, not a molecule')).toBeVisible();
  await expect(
    page.getByText('none — a query says what to look for'),
  ).toBeVisible();
});

test('a broken SMILES points at the character that broke it', async ({
  page,
}) => {
  await page.goto('/');

  await page.getByPlaceholder('CC(=O)Oc1ccccc1C(=O)O').fill('C1CC');

  await expect(page.getByText('Dangling ring closure: 1')).toBeVisible();
  await expect(page.locator('.notation-caret')).toContainText('C1CC');
});

test('an example loads and the address carries it', async ({ page }) => {
  await page.goto('/');

  await page
    .locator('.draw-card')
    .getByRole('button', { name: 'Examples' })
    .click();
  await page.getByRole('menuitem', { name: 'Aspirin' }).click();

  await expect(page.getByText('C9H8O4')).toBeVisible();
  expect(page.url()).toContain('smiles=');

  // The link is what a teacher hands out, so it must reopen on the same thing.
  await page.reload();
  await expect(page.getByText('C9H8O4')).toBeVisible();
});

test('the Kekulé form is offered next to the aromatic one', async ({
  page,
}) => {
  await page.goto('/?smiles=c1ccccc1');

  await expect(page.getByText('C1=CC=CC=C1')).toBeVisible();
});

test('the box has examples of its own, and they follow the tab', async ({
  page,
}) => {
  await page.goto('/');

  const notationExamples = page
    .locator('.notation-card')
    .getByRole('button', { name: 'Examples' });

  await notationExamples.click();
  await page.getByRole('menuitem', { name: 'Caffeine' }).click();
  await expect(page.getByText('C8H10N4O2')).toBeVisible();

  await page.getByRole('button', { name: 'Reaction' }).click();
  await notationExamples.click();
  await page.getByRole('menuitem', { name: 'Hydrogenation of ethene' }).click();
  await expect(
    page.getByPlaceholder('CC(=O)O.OCC>[H+]>CC(=O)OCC.O'),
  ).toHaveValue('C=C.[H][H]>[Pd]>CC');
});

test('a reaction is read, drawn and written back on its own tab', async ({
  page,
}) => {
  await page.goto('/?kind=reaction');

  await page
    .getByPlaceholder('CC(=O)O.OCC>[H+]>CC(=O)OCC.O')
    .fill('CC(=O)Cl.OCC>>CC(=O)OCC.Cl');

  await expect(page.getByText('read as reaction SMILES')).toBeVisible();
  // Two reactants, two products, each drawn on its own.
  await expect(page.locator('.reaction-component svg')).toHaveCount(4);
  await expect(page.getByText('CCO.CC(Cl)=O>>CCOC(C)=O.Cl')).toBeVisible();
});

test('a link carrying a reaction opens on the reaction tab', async ({
  page,
}) => {
  await page.goto('/?smiles=C%3DCC%3DC.C%3DC%3E%3EC1%3DCCCCC1');

  await expect(page.locator('.reaction-arrow-glyph')).toBeVisible();
  await expect(page.locator('.notation-row-value').first()).toHaveText(
    'C=C.C=CC=C>>C1CC=CCC1',
  );
});

test('an arrow typed on the molecule tab offers the reaction tab', async ({
  page,
}) => {
  await page.goto('/');

  await page.getByPlaceholder('CC(=O)Oc1ccccc1C(=O)O').fill('CCO.CC(=O)O>>CC');

  const offer = page.getByRole('button', { name: 'Open the Reaction tab' });
  await expect(offer).toBeVisible();
  await offer.click();

  await expect(page.locator('.reaction-arrow-glyph')).toBeVisible();
});

test('the query tab reads a pattern that would also parse as a molecule', async ({
  page,
}) => {
  await page.goto('/?kind=query');

  await page.getByPlaceholder('[CX3](=O)[OX2H1]').fill('CC');

  await expect(page.getByText('read as SMARTS')).toBeVisible();
  await expect(page.getByText('a query, not a molecule')).toBeVisible();
});
