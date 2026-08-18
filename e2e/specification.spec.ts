import { expect, test } from '@playwright/test';

test('the specification is served from here, with its drawings', async ({
  page,
}) => {
  await page.goto('/specification');

  await expect(
    page.getByRole('heading', { name: '1. Introduction' }),
  ).toBeVisible();
  await expect(
    page
      .locator('.spec-intro')
      .getByRole('link', { name: 'github.com/opensmiles/OpenSMILES' }),
  ).toBeVisible();

  const drawing = page.locator('.spec-article img').first();
  await expect(drawing).toBeVisible();
  expect(
    await drawing.evaluate((image: HTMLImageElement) => image.naturalWidth),
  ).toBeGreaterThan(0);
});

test('the contents jump to a section, and filter down to one', async ({
  page,
}) => {
  await page.goto('/specification');

  const contents = page.locator('.spec-contents');
  await contents.getByRole('link', { name: '4 Writing SMILES' }).click();
  await expect(page).toHaveURL(/#normalization$/);
  await expect(
    page.getByRole('heading', { name: '4. Writing SMILES: Normalizations' }),
  ).toBeInViewport();

  await contents.getByPlaceholder('Filter the contents').fill('aromatic');
  await expect(contents.locator('.spec-entry')).toHaveCount(5);
  await expect(
    contents.getByRole('link', { name: '4.3.5 Aromaticity' }),
  ).toBeVisible();
});

test('a link to a section of the specification opens on it', async ({
  page,
}) => {
  await page.goto('/specification#hydrogens');

  await expect(
    page.getByRole('heading', { name: '3.1.2. Hydrogens' }),
  ).toBeInViewport();
});

test('the contents scroll inside their column, never over the footer', async ({
  page,
}) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto('/specification');
  await page.getByRole('heading', { name: '1. Introduction' }).waitFor();
  await page.evaluate(() => globalThis.scrollTo(0, document.body.scrollHeight));

  const bottoms = await page.evaluate(() => {
    const box = (selector: string) =>
      document.querySelector(selector)!.getBoundingClientRect();
    return {
      list: box('.spec-contents-list').bottom,
      column: box('.spec-contents').bottom,
      footer: box('.app-footer').top,
    };
  });

  expect(bottoms.list).toBeLessThanOrEqual(bottoms.column);
  expect(bottoms.column).toBeLessThanOrEqual(bottoms.footer);
});
