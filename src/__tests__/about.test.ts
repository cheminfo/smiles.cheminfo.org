import { aboutProblems, resolveAbout } from 'react-cheminfo/core';
import { expect, test } from 'vitest';

import { ABOUT } from '../about.ts';

test('the record says what the family checks it says', () => {
  expect(aboutProblems(ABOUT)).toStrictEqual([]);
});

test('what a visitor is told they can do is the six things the site does', () => {
  expect(ABOUT.siteId).toBe('smiles');
  expect(ABOUT.can).toHaveLength(6);
  expect(ABOUT.paragraphs).toHaveLength(2);
});

test('every borrowed work the site runs on is named, and named once', () => {
  expect(ABOUT.credits).toStrictEqual([
    'openchemlib',
    'openchemlib-utils',
    'react-ocl',
    'react-mf',
    'blueprint',
    'react-science',
    'react-cheminfo',
    'react',
    'vite',
  ]);
  expect(new Set(ABOUT.credits).size).toBe(ABOUT.credits.length);
});

test('the record resolves against the shared registries', () => {
  const about = resolveAbout(ABOUT);

  expect(about.site.host).toBe('smiles.cheminfo.org');
  expect(about.license).toBe('MIT');
  expect(about.repository).toBe(
    'https://github.com/cheminfo/smiles.cheminfo.org',
  );
  // The sources are private, so the page asks for a report nowhere rather
  // than pointing a visitor at a tracker that answers 404.
  expect(about.publicRepository).toBe(false);
  expect(about.issues).toBeUndefined();
  expect(about.credits.map((entry) => entry.name)).toStrictEqual([
    'OpenChemLib',
    'openchemlib-utils',
    'react-ocl',
    'react-mf',
    'Blueprint',
    'react-science',
    'react-cheminfo',
    'React',
    'Vite',
  ]);
});

test('the notation, the canonical form and the toolkit are what it asks to be cited', () => {
  const dois = (ABOUT.cite ?? []).map((work) => work.reference.doi);

  expect(dois).toStrictEqual([
    '10.2533/chimia.2025.66',
    '10.1021/ci00057a005',
    '10.1021/ci00062a008',
    '10.1021/ci800305f',
  ]);
  expect((ABOUT.cite ?? []).map((work) => work.what)).toStrictEqual([
    'Data processing in the browser',
    'The SMILES notation',
    'The canonical SMILES',
    'OpenChemLib',
  ]);
});

test('the paragraphs say where it runs and how an exercise is marked', () => {
  const [runs, canonical] = ABOUT.paragraphs ?? [];

  // Nothing is uploaded, and the chemistry is Thomas Sander's library.
  expect(runs).toContain('openchemlib');
  expect(runs).toContain('Thomas Sander');
  expect(runs).toContain('uploaded');
  // Why an exercise can be marked at all.
  expect(canonical).toContain('canonical SMILES');
  expect(canonical).toContain('marked on the molecule');
});
