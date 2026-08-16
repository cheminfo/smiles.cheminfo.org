import { beforeEach, expect, test, vi } from 'vitest';

/**
 * Load `router.ts` against a stubbed address bar.
 *
 * The module reads `globalThis.location` as its very first act, so the stub has
 * to be in place before the import — which is why every test imports it afresh
 * rather than sharing one instance.
 * @param url - The address the page is opened at.
 * @returns The module, and the addresses it wrote.
 */
async function loadRouter(url: string) {
  const written: string[] = [];
  const parsed = new URL(url, 'https://smiles.cheminfo.org');

  vi.stubGlobal('location', {
    pathname: parsed.pathname,
    search: parsed.search,
    href: parsed.href,
    origin: parsed.origin,
  });
  vi.stubGlobal('history', {
    pushState: (_state: unknown, _title: string, next: string) =>
      written.push(next),
    replaceState: (_state: unknown, _title: string, next: string) =>
      written.push(next),
  });
  vi.stubGlobal('addEventListener', () => undefined);

  vi.resetModules();
  const router = await import('../router.ts');
  return { router, written };
}

beforeEach(() => {
  vi.unstubAllGlobals();
});

test.each([
  ['/', 'converter'],
  ['/lists', 'lists'],
  ['/exercises', 'exercises'],
  ['/tutorial', 'tutorial'],
  ['/reference', 'reference'],
  ['/specification', 'specification'],
  ['/exercises?set=patterns', 'exercises'],
  ['/nothing-by-that-name', 'converter'],
])('%s opens the %s page', async (url, page) => {
  const { router } = await loadRouter(url);
  expect(router.route.page.value).toBe(page);
});

test.each([
  ['/tutorial/7', 'tutorial', '/tutorial/7'],
  ['/exercises/patterns', 'exercises', '/exercises/patterns'],
  ['/exercises/patterns/s1', 'exercises', '/exercises/patterns/s1'],
  ['/tutorial/', 'tutorial', '/tutorial'],
  ['/tutorial/nowhere', 'tutorial', '/tutorial'],
])('%s is the %s page at %s', async (url, page, path) => {
  const { router } = await loadRouter(url);

  expect(router.route.page.value).toBe(page);
  expect(router.route.path.value).toBe(path);
});

test('the step and the exercise are read off the path', async () => {
  const { router } = await loadRouter('/exercises/patterns/s1?embed=1');

  expect(router.parsePath('/tutorial/7')).toStrictEqual({
    page: 'tutorial',
    step: 7,
  });
  expect(router.parsePath('/exercises/patterns/s1')).toStrictEqual({
    page: 'exercises',
    setId: 'patterns',
    exerciseId: 's1',
  });
  expect(router.routePath({ page: 'exercises', setId: 'patterns' })).toBe(
    '/exercises/patterns',
  );
  expect(router.routePath({ page: 'tutorial' })).toBe('/tutorial');
});

test('another step of the same page replaces the address, and keeps the query', async () => {
  const { router, written } = await loadRouter('/tutorial/1?embed=1');

  router.replacePath('/tutorial/2');

  expect(written.at(-1)).toBe('/tutorial/2?embed=1');
  expect(router.route.path.value).toBe('/tutorial/2');
  expect(router.route.page.value).toBe('tutorial');
});

test('leaving a page leaves the step it was on behind', async () => {
  const { router, written } = await loadRouter('/exercises/patterns/s1');

  router.navigate('tutorial');

  expect(written.at(-1)).toBe('/tutorial');
  expect(router.route.path.value).toBe('/tutorial');
});

test('/search is an alias for the lists page', async () => {
  // Searching a list is what the list page does, and `/search` is what someone
  // looking for it types.
  const { router } = await loadRouter('/search?q=c1ccccc1');
  expect(router.route.page.value).toBe('lists');
});

test('walking to another page drops what fed the one being left', async () => {
  const { router, written } = await loadRouter(
    '/exercises?set=patterns&exercise=smarts-alcohols&embed=1&hide=hints',
  );

  router.navigate('lists');

  // What configures the page survives; what feeds it does not. Carrying `set`
  // across would ask the lists page for an exercise set nobody wrote.
  expect(router.route.page.value).toBe('lists');
  expect(router.route.search.value).toBe('?embed=1&hide=hints');
  expect(written.at(-1)).toBe('/lists?embed=1&hide=hints');
});

test('staying on the same page keeps everything', async () => {
  const { router } = await loadRouter('/exercises?set=patterns&embed=1');

  router.navigate('exercises', { exercise: 'smarts-alcohols' });

  expect(router.route.search.value).toContain('set=patterns');
  expect(router.route.search.value).toContain('embed=1');
  expect(router.route.search.value).toContain('exercise=smarts-alcohols');
});

test('an undefined value removes a parameter', async () => {
  const { router } = await loadRouter('/exercises?set=patterns&exercise=one');

  router.navigate('exercises', { exercise: undefined });
  expect(router.route.search.value).toBe('?set=patterns');
});

test('replaceParameters rewrites the page one is on without leaving it', async () => {
  const { router, written } = await loadRouter('/lists?source=x');

  router.replaceParameters({ q: 'c1ccccc1' });

  expect(router.route.page.value).toBe('lists');
  expect(router.route.search.value).toBe('?source=x&q=c1ccccc1');
  expect(written.at(-1)).toBe('/lists?source=x&q=c1ccccc1');
});

test('a page with no parameters gets a bare path', async () => {
  const { router, written } = await loadRouter('/exercises?set=patterns');

  router.navigate('tutorial');
  expect(written.at(-1)).toBe('/tutorial');
  expect(router.route.search.value).toBe('');
});

test('searchParameter reads the address the page was opened at', async () => {
  const { router } = await loadRouter('/exercises?set=patterns&exercise=one');

  expect(router.searchParameter('set')).toBe('patterns');
  expect(router.searchParameter('exercise')).toBe('one');
  expect(router.searchParameter('nothing')).toBeNull();
});
