import type { Locator, Page } from '@playwright/test';
import { expect, test } from '@playwright/test';

import { convertList } from './helpers.ts';

/**
 * Double-click the first word of an element, aimed at that word's own
 * rectangle rather than the element's centre — a wrapped or centred line puts
 * its centre between two words, where a double click selects nothing either
 * way.
 * @param page - The page under test.
 * @param selector - CSS selector of the element holding the text.
 * @returns What the double click selected.
 */
async function selectFirstWord(page: Page, selector: string): Promise<string> {
  const point = await page.evaluate((one: string) => {
    const element = document.querySelector(one);
    if (!element) throw new Error(`no element at ${one}`);
    const walker = document.createTreeWalker(element, NodeFilter.SHOW_TEXT);
    let node = walker.nextNode();
    while (node && node.textContent?.trim() === '') node = walker.nextNode();
    const text = node?.textContent ?? '';
    const start = text.search(/\S/);
    const end = text.indexOf(' ', start + 1);
    const range = document.createRange();
    range.setStart(node as Node, start);
    range.setEnd(node as Node, end === -1 ? text.length : end);
    const rect = range.getBoundingClientRect();
    return { x: rect.x + rect.width / 2, y: rect.y + rect.height / 2 };
  }, selector);

  await page.mouse.dblclick(point.x, point.y);
  return page.evaluate(() => globalThis.getSelection()?.toString() ?? '');
}

/**
 * Click a copyable value and read what it put on the clipboard. The value is
 * located by its title, because copying adds a hidden “Copied” to its text and
 * a text-matched locator would stop matching it.
 * @param page - The page under test.
 * @param value - The value to click.
 * @returns What the clipboard holds afterwards.
 */
async function copiedText(page: Page, value: Locator): Promise<string> {
  await expect(value).toHaveCSS('cursor', /\bcopy$/);
  await value.click();
  await expect(value).toHaveAttribute('data-copy', 'copied');
  return page.evaluate(() => navigator.clipboard.readText());
}

test('the converter text is not selectable, and the box still is', async ({
  page,
}) => {
  await page.goto('/?smiles=OCC');

  const label = page.locator('.result-facts dt').first();
  await expect(label).toHaveText('Formula');
  await expect(label).toHaveCSS('user-select', 'none');
  expect(await selectFirstWord(page, '.result-facts dt')).toBe('');

  // What is typed stays typed in: a form control is never caught by the policy.
  await expect(page.locator('textarea.notation-input')).toHaveCSS(
    'user-select',
    'text',
  );
});

test('every notation and every fact of the converter copies on a click', async ({
  page,
  context,
}) => {
  await context.grantPermissions(['clipboard-read', 'clipboard-write']);
  await page.goto('/?smiles=OCC');

  const smiles = page.locator('[title="Copy the Canonical SMILES (CCO)"]');
  await expect(smiles).toHaveText('CCO');
  expect(await copiedText(page, smiles)).toBe('CCO');

  const formula = page.locator('[title="Copy the molecular formula (C2H6O)"]');
  expect(await copiedText(page, formula)).toBe('C2H6O');

  // The number a reader would paste, never the unit it is shown with.
  const mass = page.locator('[title="Copy the average mass (46.0686)"]');
  await expect(mass).toHaveText('46.0686 g/mol');
  expect(await copiedText(page, mass)).toBe('46.0686');

  const monoisotopic = page.locator(
    '[title="Copy the monoisotopic mass (46.0419)"]',
  );
  expect(await copiedText(page, monoisotopic)).toBe('46.0419');
});

test('a list row copies its output and the columns the file carried', async ({
  page,
  context,
}) => {
  await context.grantPermissions(['clipboard-read', 'clipboard-write']);
  await page.goto('/lists');

  await convertList(
    page,
    'ID,Name,CAS,SMILES\n1,ethanol,64-17-5,CCO\n2,benzene,71-43-2,c1ccccc1',
    2,
  );

  const output = page
    .locator('[title="Copy the Canonical SMILES (CCO)"]')
    .first();
  expect(await copiedText(page, output)).toBe('CCO');

  const cas = page.locator('[title="Copy the CAS (64-17-5)"]');
  await expect(cas).toHaveText('64-17-5');
  expect(await copiedText(page, cas)).toBe('64-17-5');
});

test('a cheatsheet cell copies the construct it shows', async ({
  page,
  context,
}) => {
  await context.grantPermissions(['clipboard-read', 'clipboard-write']);
  await page.goto('/smiles');

  const syntax = page.locator('#smiles-aromaticity td.reference-syntax', {
    hasText: 'C1=CC=CC=C1',
  });
  await expect(syntax).toHaveText('C1=CC=CC=C1');
  expect(await copiedText(page, syntax)).toBe('C1=CC=CC=C1');
});

test('the specification is selectable, and its contents are not', async ({
  page,
}) => {
  await page.goto('/specification');
  await page.getByRole('heading', { name: '1. Introduction' }).waitFor();

  // The document people cite, and the attribution they cite it with.
  await expect(page.locator('.spec-article p').first()).toHaveCSS(
    'user-select',
    'text',
  );
  await expect(page.locator('.spec-intro p').first()).toHaveCSS(
    'user-select',
    'text',
  );
  expect(await selectFirstWord(page, '.spec-intro p')).toBe('Craig');

  // The reading aid beside it is chrome, so it keeps the family's policy.
  await expect(page.locator('.spec-contents')).toHaveCSS('user-select', 'none');
});
