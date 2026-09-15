import type { Page } from '@playwright/test';
import { expect, test } from '@playwright/test';

import { ABOUT } from '../src/about.ts';
import { SITE_ROUTES } from '../src/state/routes.ts';

/** The placeholder of the converter's notation box on the molecule tab. */
const CONVERTER_INPUT = 'CC(=O)Oc1ccccc1C(=O)O';

/**
 * Record every uncaught error and every console.error the page raises from
 * now on.
 * @param page - The page under test.
 * @returns The list the messages are pushed to.
 */
function collectErrors(page: Page): string[] {
  const errors: string[] = [];
  page.on('pageerror', (error) => {
    errors.push(`pageerror: ${error.message}`);
  });
  page.on('console', (message) => {
    if (message.type() === 'error') {
      errors.push(`console.error: ${message.text()}`);
    }
  });
  return errors;
}

test('the converter at / reads a typed SMILES and writes its formula', async ({
  page,
}) => {
  await page.goto('/');

  await page.getByPlaceholder(CONVERTER_INPUT).fill('Oc1ccccc1');

  await expect(page.getByText('C6H6O', { exact: true })).toBeVisible();
  await expect(page.getByText('read as smiles', { exact: true })).toBeVisible();
});

test('/about is the About page, with the Cite control and the footer', async ({
  page,
}) => {
  await page.goto('/about');

  await expect(
    page.getByRole('heading', {
      level: 1,
      name: 'smiles.cheminfo',
      exact: true,
    }),
  ).toBeVisible();
  await expect(
    page.getByRole('heading', { name: 'How to cite', exact: true }),
  ).toBeVisible();
  await expect(page.locator('.about-citation')).toHaveCount(
    ABOUT.cite?.length ?? 0,
  );
  await expect(
    page.getByRole('banner').getByRole('button', { name: 'Cite', exact: true }),
  ).toBeVisible();
  await expect(page.getByRole('contentinfo')).toBeVisible();
});

for (const embed of ['?embed', '?embed=1']) {
  test(`/${embed} drops the header and the footer, and the converter still works`, async ({
    page,
  }) => {
    await page.goto(`/${embed}`);

    await page.getByPlaceholder(CONVERTER_INPUT).fill('CCO');
    await expect(page.getByText('C2H6O', { exact: true })).toBeVisible();

    await expect(page.getByRole('banner')).toHaveCount(0);
    await expect(page.getByRole('contentinfo')).toHaveCount(0);
  });
}

for (const { path } of SITE_ROUTES) {
  test(`${path} loads with no error`, async ({ page }) => {
    const errors = collectErrors(page);

    await page.goto(path);
    await expect(page.getByRole('main')).toBeVisible();
    await page.waitForLoadState('networkidle');

    expect(errors).toStrictEqual([]);
  });
}

test('an address the site does not answer opens the converter', async ({
  page,
}) => {
  const errors = collectErrors(page);

  await page.goto('/no-such-page/anywhere');

  await expect(page.getByRole('main')).toBeVisible();
  await page.getByPlaceholder(CONVERTER_INPUT).fill('CCO');
  await expect(page.getByText('C2H6O', { exact: true })).toBeVisible();
  expect(errors).toStrictEqual([]);
});
