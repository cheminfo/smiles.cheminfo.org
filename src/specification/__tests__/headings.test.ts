import { readFileSync } from 'node:fs';
import { join } from 'node:path';

import { expect, test } from 'vitest';

import { extractHeadings } from '../headings.ts';

const SPECIFICATION = readFileSync(
  join(import.meta.dirname, '../../../public/spec/opensmiles.html'),
  'utf8',
);

test('a heading gives its anchor, its number and its title', () => {
  const headings = extractHeadings(
    '<h2 id="_reading_smiles">3. Reading SMILES</h2>' +
      '<h3 id="inatoms">3.1. Atoms</h3>' +
      '<h4 id="hydrogens">3.1.2. Hydrogens</h4>',
  );

  expect(headings).toStrictEqual([
    {
      id: '_reading_smiles',
      level: 2,
      number: '3',
      title: 'Reading SMILES',
      chapter: '_reading_smiles',
    },
    {
      id: 'inatoms',
      level: 3,
      number: '3.1',
      title: 'Atoms',
      chapter: '_reading_smiles',
    },
    {
      id: 'hydrogens',
      level: 4,
      number: '3.1.2',
      title: 'Hydrogens',
      chapter: '_reading_smiles',
    },
  ]);
});

test('markup and entities are taken off a title', () => {
  const headings = extractHeadings(
    '<h2 id="wild">6. The Wildcard <code>*</code> &amp; H&#252;ckel&#8217;s rule</h2>',
  );

  expect(headings[0]?.title).toBe('The Wildcard * & Hückel’s rule');
});

test('the shipped specification is read as its eight chapters', () => {
  const chapters = extractHeadings(SPECIFICATION).filter(
    (heading) => heading.level === 2,
  );

  expect(chapters.map((chapter) => chapter.id)).toStrictEqual([
    '_introduction',
    '_formal_grammar',
    '_reading_smiles',
    'normalization',
    'nonstandard',
    '_proposed_extensions',
    'appendix',
    '_revision_history',
  ]);
  expect(chapters[2]?.title).toBe('Reading SMILES');
});

test('every heading of the shipped specification is numbered and anchored', () => {
  const headings = extractHeadings(SPECIFICATION);

  expect(headings).toHaveLength(67);
  expect(headings.filter((heading) => heading.level === 3)).toHaveLength(32);
  expect(headings.filter((heading) => heading.level === 4)).toHaveLength(27);
  for (const heading of headings) {
    expect(heading.id, heading.title).not.toBe('');
    expect(heading.number, heading.title).toMatch(/^\d+(?:\.\d+)*$/);
    expect(heading.title, heading.id).not.toBe('');
  }
});

test('a subsection is attached to the chapter it is printed under', () => {
  const headings = extractHeadings(SPECIFICATION);
  const hydrogens = headings.find((heading) => heading.id === 'hydrogens');

  expect(hydrogens?.chapter).toBe('_reading_smiles');
  expect(hydrogens?.number).toBe('3.1.2');
});
