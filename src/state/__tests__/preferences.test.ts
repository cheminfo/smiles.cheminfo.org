import { afterEach, expect, test, vi } from 'vitest';

/**
 * Open the page in a stubbed browser whose `localStorage` already holds what an
 * earlier visit left there.
 *
 * The preferences are read as their module is evaluated, so the stubs have to
 * be in place before the import — which is why every test imports afresh.
 * @param stored - The entries an earlier visit wrote, by key.
 * @returns The map behind the stubbed `localStorage`.
 */
function stubBrowser(stored: Record<string, string> = {}) {
  const held = new Map(Object.entries(stored));
  vi.stubGlobal('location', {
    pathname: '/',
    search: '',
    href: 'https://smiles.cheminfo.org/',
    origin: 'https://smiles.cheminfo.org',
  });
  vi.stubGlobal('history', {
    pushState: () => undefined,
    replaceState: () => undefined,
  });
  vi.stubGlobal('addEventListener', () => undefined);
  vi.stubGlobal('localStorage', {
    getItem: (key: string) => held.get(key) ?? null,
    setItem: (key: string, value: string) => held.set(key, value),
    removeItem: (key: string) => held.delete(key),
  });
  vi.resetModules();
  return held;
}

afterEach(() => {
  vi.unstubAllGlobals();
});

test('the converter reads and writes the entry a returning visitor already has', async () => {
  const held = stubBrowser({ 'smiles:converter:v1': '{"showRings":true}' });
  const { preferences } = await import('../converter.ts');

  expect(preferences.showRings.value).toBe(true);

  preferences.showRings.value = false;
  expect(held.get('smiles:converter:v1')).toBe('{"showRings":false}');
});

test('the tutorial reads and writes the entry a returning visitor already has', async () => {
  const held = stubBrowser({ 'smiles:tutorial:v1': '{"furthest":7}' });
  const { preferences } = await import('../tutorial.ts');

  expect(preferences.furthest.value).toBe(7);

  preferences.furthest.value = 9;
  expect(held.get('smiles:tutorial:v1')).toBe('{"furthest":9}');
});

test('the lists page reads and writes the entry a returning visitor already has', async () => {
  const held = stubBrowser({
    'smiles:lists:v1':
      '{"from":"smarts","to":"molfile","mode":"exact","limit":2000}',
  });
  const { preferences } = await import('../lists.ts');

  expect(preferences.from.value).toBe('smarts');
  expect(preferences.to.value).toBe('molfile');
  expect(preferences.mode.value).toBe('exact');
  expect(preferences.limit.value).toBe(2000);

  preferences.limit.value = 100;
  expect(held.get('smiles:lists:v1')).toBe(
    '{"from":"smarts","to":"molfile","mode":"exact","limit":100}',
  );
});

test('a first visit opens on the declared defaults', async () => {
  stubBrowser();
  const converter = await import('../converter.ts');
  const tutorial = await import('../tutorial.ts');
  const lists = await import('../lists.ts');

  expect(converter.preferences.showRings.value).toBe(false);
  expect(tutorial.preferences.furthest.value).toBe(0);
  expect(lists.preferences.from.value).toBe('auto');
  expect(lists.preferences.to.value).toBe('smiles');
  expect(lists.preferences.mode.value).toBe('substructure');
  expect(lists.preferences.limit.value).toBe(500);
});
