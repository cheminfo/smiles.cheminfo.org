import { expect, test } from 'vitest';

import {
  applyShareConfig,
  isEmbedded,
  isHidden,
  isShareConfigured,
  parseShareConfig,
  shareConfig,
  stringifyParams,
} from '../shareConfig.ts';

test('an address that configures nothing reads as an unconfigured page', () => {
  const config = parseShareConfig('');
  expect(config).toStrictEqual({ embed: false, hidden: [] });
  expect(isShareConfigured(config)).toBe(false);
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
  expect(parseShareConfig(search).embed).toBe(expected);
});

test('the parts a link switches off are read in the order it named them', () => {
  expect(parseShareConfig('hide=hints,list,answers').hidden).toStrictEqual([
    'hints',
    'list',
    'answers',
  ]);
});

test('a key this version does not know is ignored, so an old link still opens', () => {
  // The whole reason unknown keys are dropped rather than kept: a teacher's
  // link written against a part of the page that has since gone must still
  // open, and must still switch off the parts that remain.
  const config = parseShareConfig('embed=1&hide=hints,diagram,answers');
  expect(config).toStrictEqual({ embed: true, hidden: ['hints', 'answers'] });
  expect(isShareConfigured(config)).toBe(true);
});

test('a key named twice is switched off once', () => {
  expect(parseShareConfig('hide=hints,hints').hidden).toStrictEqual(['hints']);
});

test('blanks around a key are not part of it', () => {
  expect(parseShareConfig('hide= hints , list ').hidden).toStrictEqual([
    'hints',
    'list',
  ]);
});

test('an empty hide= switches nothing off', () => {
  expect(parseShareConfig('hide=').hidden).toStrictEqual([]);
  expect(parseShareConfig('hide=,,').hidden).toStrictEqual([]);
});

test('what is left at its default is deleted rather than written', () => {
  // A plain link stays plain: writing `embed=0&hide=` would make every link
  // the dialog produces look configured when it is not.
  const params = new URLSearchParams('set=patterns&embed=1&hide=hints');
  applyShareConfig(params, { embed: false, hidden: [] });
  expect(params.toString()).toBe('set=patterns');
});

test('a configuration is written back into the address it came from', () => {
  const params = new URLSearchParams('set=patterns');
  applyShareConfig(params, { embed: true, hidden: ['hints', 'answers'] });
  expect(stringifyParams(params)).toBe(
    'set=patterns&embed=1&hide=hints,answers',
  );
});

test('a link survives being written, read and written again', () => {
  const params = new URLSearchParams('exercise=w4');
  const config = parseShareConfig('embed=1&hide=hints,answers');
  applyShareConfig(params, config);
  expect(parseShareConfig(stringifyParams(params))).toStrictEqual(config);
});

test('the commas of a hide list are left legible', () => {
  // A teacher reads these links out loud and pastes them into course pages;
  // `hide=hints%2Canswers` parses identically and is needlessly cryptic.
  const params = new URLSearchParams();
  params.set('hide', 'hints,answers');
  expect(params.toString()).toBe('hide=hints%2Canswers');
  expect(stringifyParams(params)).toBe('hide=hints,answers');
});

test('a link is configured when it embeds, when it hides, or both', () => {
  expect(isShareConfigured({ embed: true, hidden: [] })).toBe(true);
  expect(isShareConfigured({ embed: false, hidden: ['hints'] })).toBe(true);
  expect(isShareConfigured({ embed: false, hidden: [] })).toBe(false);
});

test('the page asks the configuration it was opened with', () => {
  shareConfig.value = { embed: true, hidden: ['hints', 'answers'] };
  expect(isEmbedded()).toBe(true);
  expect(isHidden('hints')).toBe(true);
  expect(isHidden('answers')).toBe(true);
  expect(isHidden('sets')).toBe(false);

  shareConfig.value = { embed: false, hidden: [] };
  expect(isEmbedded()).toBe(false);
  expect(isHidden('hints')).toBe(false);
});
