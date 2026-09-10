import {
  applyShareConfig,
  isShareConfigured,
  parseShareConfig,
} from 'react-cheminfo/core';
import { expect, test } from 'vitest';

import {
  SHARE_VOCABULARY,
  isEmbedded,
  isHidden,
  shareConfig,
} from '../shareConfig.ts';

const parse = (search: string) => parseShareConfig(search, SHARE_VOCABULARY);
const apply = (search: string, config: ReturnType<typeof parse>) =>
  applyShareConfig(search, config, SHARE_VOCABULARY);
const configured = (config: ReturnType<typeof parse>) =>
  isShareConfigured(config, SHARE_VOCABULARY);

test('an address that configures nothing reads as an unconfigured page', () => {
  const config = parse('');
  expect(config).toStrictEqual({ embed: false, hidden: [], params: {} });
  expect(isShareConfigured(config, SHARE_VOCABULARY)).toBe(false);
});

test.each([
  ['embed=1', true],
  ['?embed=1', true],
  // Retyped by hand out of a course page, and it has to mean what it says.
  ['embed', true],
  ['embed=', true],
  ['embed=0', false],
  ['', false],
])('%s reads embed as %s', (search, expected) => {
  expect(parse(search).embed).toBe(expected);
});

test('the parts a link switches off are read in the order the site lists them', () => {
  // Not the order the link named them: one canonical order means two people
  // who ticked the same boxes hand out the same link.
  expect(parse('hide=hints,list,answers').hidden).toStrictEqual([
    'hints',
    'answers',
    'list',
  ]);
});

test('a key this version does not know is ignored, so an old link still opens', () => {
  // The whole reason unknown keys are dropped rather than kept: a teacher's
  // link written against a part of the page that has since gone must still
  // open, and must still switch off the parts that remain.
  const config = parse('embed=1&hide=hints,diagram,answers');
  expect(config).toStrictEqual({
    embed: true,
    hidden: ['hints', 'answers'],
    params: {},
  });
  expect(isShareConfigured(config, SHARE_VOCABULARY)).toBe(true);
});

test('a key named twice is switched off once', () => {
  expect(parse('hide=hints,hints').hidden).toStrictEqual(['hints']);
});

test('blanks around a key are not part of it', () => {
  expect(parse('hide= hints , list ').hidden).toStrictEqual(['hints', 'list']);
});

test('an empty hide= switches nothing off', () => {
  expect(parse('hide=').hidden).toStrictEqual([]);
  expect(parse('hide=,,').hidden).toStrictEqual([]);
});

test('what is left at its default is deleted rather than written', () => {
  // A plain link stays plain: writing `embed=0&hide=` would make every link
  // the dialog produces look configured when it is not.
  const query = apply('set=patterns&embed=1&hide=hints', {
    embed: false,
    hidden: [],
    params: {},
  });
  expect(query).toBe('set=patterns');
});

test('a configuration is written back into the address it came from', () => {
  const query = apply('set=patterns', {
    embed: true,
    hidden: ['hints', 'answers'],
    params: {},
  });
  expect(query).toBe('set=patterns&embed=1&hide=hints,answers');
});

test('a link survives being written, read and written again', () => {
  const config = parse('embed=1&hide=hints,answers');
  expect(parse(apply('exercise=w4', config))).toStrictEqual(config);
});

test('the commas of a hide list are left legible', () => {
  // A teacher reads these links out loud and pastes them into course pages;
  // `hide=hints%2Canswers` parses identically and is needlessly cryptic.
  const params = new URLSearchParams();
  params.set('hide', 'hints,answers');
  expect(params.toString()).toBe('hide=hints%2Canswers');
  expect(
    apply('', { embed: false, hidden: ['hints', 'answers'], params: {} }),
  ).toBe('hide=hints,answers');
});

test('a link is configured when it embeds, when it hides, or both', () => {
  expect(configured({ embed: true, hidden: [], params: {} })).toBe(true);
  expect(configured({ embed: false, hidden: ['hints'], params: {} })).toBe(
    true,
  );
  expect(configured({ embed: false, hidden: [], params: {} })).toBe(false);
});

test('the page asks the configuration it was opened with', () => {
  shareConfig.value = {
    embed: true,
    hidden: ['hints', 'answers'],
    params: {},
  };
  expect(isEmbedded()).toBe(true);
  expect(isHidden('hints')).toBe(true);
  expect(isHidden('answers')).toBe(true);
  expect(isHidden('sets')).toBe(false);

  shareConfig.value = { embed: false, hidden: [], params: {} };
  expect(isEmbedded()).toBe(false);
  expect(isHidden('hints')).toBe(false);
});
