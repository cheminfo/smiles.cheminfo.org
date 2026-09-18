/**
 * Drawing in the structure editor, the way a visitor does: one click with the
 * default Single-bond tool on empty paper draws an ethane, and the box and the
 * address follow.
 *
 * The editor lives in an open shadow root that locators do not pierce, so the
 * canvases are measured through `evaluate` on the editor's host element.
 */

import type { Locator } from '@playwright/test';
import { expect, test } from '@playwright/test';

interface Box {
  x: number;
  y: number;
  width: number;
  height: number;
}

/**
 * Where the editor's toolbar and drawing canvases sit on the page, once both
 * have been laid out.
 * @param editor - The editor's host element.
 * @returns The two bounding boxes, in page coordinates.
 */
async function editorBoxes(
  editor: Locator,
): Promise<{ toolbar: Box; drawing: Box }> {
  const measure = () =>
    editor.evaluate((host) => {
      const root = host.shadowRoot;
      const toolbar = root?.firstElementChild;
      const drawing = root?.querySelector('canvas[tabindex]');
      if (!toolbar || !drawing) return null;
      const box = (element: Element) => {
        const { x, y, width, height } = element.getBoundingClientRect();
        return { x, y, width, height };
      };
      return { toolbar: box(toolbar), drawing: box(drawing) };
    });
  await expect
    .poll(async () => {
      const boxes = await measure();
      return Boolean(boxes && boxes.drawing.height > 0);
    })
    .toBe(true);
  const boxes = await measure();
  if (!boxes) throw new Error('editor canvases not found');
  return boxes;
}

test('a bond drawn on the converter is written in the box and the address', async ({
  page,
}) => {
  await page.goto('/');
  const box = page.getByPlaceholder('CC(=O)Oc1ccccc1C(=O)O');
  await expect(box).toHaveValue('');

  const editor = page.locator('.draw-card [data-openchemlib-canvas-editor]');
  await expect(editor).toHaveCount(1);
  const { drawing } = await editorBoxes(editor);
  // Bottom-left of the paper: the help button holds the top-right corner.
  await page.mouse.click(drawing.x + 60, drawing.y + drawing.height - 60);

  await expect(box).toHaveValue('CC');
  await expect(page.getByText('C2H6')).toBeVisible();
  await expect
    .poll(() => new URL(page.url()).searchParams.get('smiles'))
    .toBe('CC');
});

test('the editor names its toolbar buttons and explains its keys', async ({
  page,
}) => {
  await page.goto('/');
  const card = page.locator('.draw-card');
  const editor = card.locator('[data-openchemlib-canvas-editor]');
  await expect(editor).toHaveCount(1);

  const { toolbar } = await editorBoxes(editor);
  // Two columns of 21 px buttons inside a 2 px border; row 5 of the left
  // column is Single bond.
  await page.mouse.move(toolbar.x + 12, toolbar.y + 2 + 5 * 21 + 10);
  await expect(page.getByTestId('structure-editor-tooltip')).toContainText(
    'Single bond',
  );

  await card.getByRole('button', { name: 'Mouse and keyboard' }).click();
  await expect(page.getByTestId('structure-editor-help')).toBeVisible();
});
