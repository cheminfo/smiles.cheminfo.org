import { join } from 'node:path';

import { expect, onTestFinished, test } from 'vitest';

import type { BuildAppOptions } from '../app.ts';
import { buildApp } from '../app.ts';
import type { FastifyTyped } from '../types.ts';

const FRONTEND = join(import.meta.dirname, 'data/frontend');

/**
 * A server for the length of one test, closed however the test ends. Closing
 * it in the test body instead leaves an instance behind whenever an assertion
 * throws, and the run then ends on a handle nobody released.
 * @param options - What to build it with.
 * @returns The instance, ready to be injected into.
 */
async function testApp(options: BuildAppOptions = {}): Promise<FastifyTyped> {
  const app = await buildApp(options);
  onTestFinished(() => app.close());
  return app;
}

test('health answers with the toolkit version', async () => {
  const app = await testApp();
  const response = await app.inject({ method: 'GET', url: '/v1/health' });

  expect(response.statusCode).toBe(200);
  const body = response.json<{ status: string; openchemlib: string }>();
  expect(body.status).toBe('ok');
  expect(body.openchemlib).toMatch(/^\d+\.\d+\.\d+$/);
});

test('converts a SMILES every way at once', async () => {
  const app = await testApp();
  const response = await app.inject({
    method: 'GET',
    url: '/v1/convert',
    query: { input: 'CC(=O)Oc1ccccc1C(=O)O' },
  });

  expect(response.statusCode).toBe(200);
  expect(response.json()).toMatchObject({
    smiles: 'CC(Oc1ccccc1C(O)=O)=O',
    kekule: 'CC(OC1=CC=CC=C1C(O)=O)=O',
    mf: 'C9H8O4',
    atoms: 13,
    bonds: 13,
    isQuery: false,
    readAs: 'smiles',
  });
});

test('a SMARTS is read as one and says so', async () => {
  const app = await testApp();
  const response = await app.inject({
    method: 'GET',
    url: '/v1/convert',
    query: { input: '[CX3](=O)[OX2H1]' },
  });

  expect(response.statusCode).toBe(200);
  expect(response.json()).toMatchObject({ isQuery: true, readAs: 'smarts' });
});

test('a broken SMILES answers 400 with the character it stopped on', async () => {
  const app = await testApp();
  const response = await app.inject({
    method: 'GET',
    url: '/v1/convert',
    query: { input: 'C1CC' },
  });

  expect(response.statusCode).toBe(400);
  expect(response.json()).toStrictEqual({
    message: 'Dangling ring closure: 1',
    position: 4,
  });
});

test('POST /v1/convert takes a molfile, which no query string would', async () => {
  const app = await testApp();
  const converted = await app.inject({
    method: 'GET',
    url: '/v1/convert',
    query: { input: 'CCO' },
  });
  const { molfile } = converted.json<{ molfile: string }>();

  const response = await app.inject({
    method: 'POST',
    url: '/v1/convert',
    payload: { input: molfile },
  });

  expect(response.statusCode).toBe(200);
  expect(response.json()).toMatchObject({ mf: 'C2H6O', readAs: 'molfile' });
});

test('a list is converted line by line, failures in place', async () => {
  const app = await testApp();
  const response = await app.inject({
    method: 'POST',
    url: '/v1/batch',
    payload: {
      input: 'CCO ethanol\nc1ccccc1 benzene\nQQQ nonsense',
      to: 'kekule',
    },
  });

  expect(response.statusCode).toBe(200);
  const body = response.json<{
    count: number;
    failed: number;
    entries: Array<Record<string, unknown>>;
  }>();
  expect(body.count).toBe(3);
  expect(body.failed).toBe(1);
  expect(body.entries[0]).toStrictEqual({
    line: 1,
    input: 'CCO',
    label: 'ethanol',
    output: 'CCO',
    mf: 'C2H6O',
    mw: 46.06864,
  });
  expect(body.entries[1]?.output).toBe('C1=CC=CC=C1');
  expect(body.entries[2]).toStrictEqual({
    line: 3,
    input: 'QQQ',
    label: 'nonsense',
    error: 'Unknown element label found.',
  });
});

test('a list becomes an SDF with one record per structure', async () => {
  const app = await testApp();
  const response = await app.inject({
    method: 'POST',
    url: '/v1/sdf',
    payload: { input: 'CCO ethanol\nc1ccccc1 benzene' },
  });

  expect(response.statusCode).toBe(200);
  expect(response.headers['content-type']).toBe(
    'chemical/x-mdl-sdfile; charset=utf-8',
  );
  const records = response.body.split('$$$$').filter((part) => part.trim());
  expect(records).toHaveLength(2);
  expect(response.body).toContain('>  <Name>');
  expect(response.body).toContain('ethanol');
  expect(response.body).toContain('>  <Molecular Formula>');
  expect(response.body).toContain('C6H6');
});

test('a list over the ceiling is refused rather than half converted', async () => {
  const app = await testApp();
  const response = await app.inject({
    method: 'POST',
    url: '/v1/batch',
    payload: { input: 'CCO\n'.repeat(3) },
  });
  expect(response.statusCode).toBe(200);

  const tooMany = await app.inject({
    method: 'POST',
    url: '/v1/batch',
    payload: { input: 'CCO\n'.repeat(10_001) },
  });
  expect(tooMany.statusCode).toBe(400);
  expect(tooMany.json<{ message: string }>().message).toContain('10000');
});

test('the documentation is served at /docs', async () => {
  const app = await testApp();
  const docs = await app.inject({ method: 'GET', url: '/docs/' });
  expect(docs.statusCode).toBe(200);

  const legacy = await app.inject({ method: 'GET', url: '/documentation' });
  expect(legacy.statusCode).toBe(302);
  expect(legacy.headers.location).toBe('/docs');
});

test('without a build, the root shows the API documentation', async () => {
  const app = await testApp({ frontendRoot: '/nowhere-at-all' });
  const response = await app.inject({ method: 'GET', url: '/' });
  expect(response.statusCode).toBe(302);
  expect(response.headers.location).toBe('/docs');
});

test('every address the frontend routes itself answers with its index', async () => {
  const app = await testApp({ frontendRoot: FRONTEND });

  for (const url of ['/', '/index.html', '/exercises', '/tutorial?step=3']) {
    // eslint-disable-next-line no-await-in-loop -- one server, one assertion at a time; parallel injects would interleave the log
    const response = await app.inject({ method: 'GET', url });
    expect(response.statusCode).toBe(200);
    expect(response.headers['content-type']).toBe('text/html; charset=utf-8');
    expect(response.body).toContain('<div id="root">');
  }
});

test('the tracking snippet reaches every page, not only the root', async () => {
  const snippet = '<script defer src="https://example.org/s.js"></script>';
  const app = await testApp({
    frontendRoot: FRONTEND,
    trackingScript: snippet,
  });

  for (const url of ['/', '/index.html', '/exercises']) {
    // eslint-disable-next-line no-await-in-loop -- one server, one assertion at a time
    const response = await app.inject({ method: 'GET', url });
    expect(response.body).toContain(snippet);
    expect(response.body.indexOf(snippet)).toBeLessThan(
      response.body.indexOf('</head>'),
    );
  }
});

test('an unknown /v1 route is still a 404', async () => {
  const app = await testApp({ frontendRoot: FRONTEND });
  const response = await app.inject({ method: 'GET', url: '/v1/nothing' });
  expect(response.statusCode).toBe(404);
});

test('a static asset is served as itself', async () => {
  const app = await testApp({ frontendRoot: FRONTEND });
  const response = await app.inject({
    method: 'GET',
    url: '/assets/app.js',
  });
  expect(response.statusCode).toBe(200);
  expect(response.body).toContain('the frontend');
});
