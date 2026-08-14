import { expect, test } from 'vitest';

import { splitList } from '../../../chemistry/splitList.ts';
import { buildRecords, convertLines } from '../convertLines.ts';

test('converts every line and counts the ones it could not read', async () => {
  const lines = splitList('CCO ethanol\nc1ccccc1 benzene\nQQQ nonsense');
  const result = await convertLines(lines, 'auto', 'kekule');

  expect(result.count).toBe(3);
  expect(result.failed).toBe(1);
  expect(result.entries[0]).toStrictEqual({
    line: 1,
    input: 'CCO',
    label: 'ethanol',
    output: 'CCO',
    mf: 'C2H6O',
    mw: 46.06864,
  });
  expect(result.entries[1]?.output).toBe('C1=CC=CC=C1');
  expect(result.entries[2]).toStrictEqual({
    line: 3,
    input: 'QQQ',
    label: 'nonsense',
    error: 'Unknown element label found.',
  });
});

test('a line keeps its place even when it cannot be read', async () => {
  // The unreadable line is deliberately not the first one: an unreadable first
  // line is a header, and `splitList` drops it as such.
  const lines = splitList('CCO\nQQQ\nCCC\nZZZ');
  const result = await convertLines(lines, 'auto', 'smiles');

  expect(result.count).toBe(4);
  expect(result.failed).toBe(2);
  expect(result.entries.map((entry) => entry.line)).toStrictEqual([1, 2, 3, 4]);
  expect(result.entries.map((entry) => entry.output)).toStrictEqual([
    'CCO',
    undefined,
    'CCC',
    undefined,
  ]);
});

test('the fields of a delimited file survive the conversion', async () => {
  const lines = splitList('Name,SMILES,CAS\nethanol,CCO,64-17-5');
  const result = await convertLines(lines, 'auto', 'smiles');

  expect(result.count).toBe(1);
  expect(result.entries[0]?.label).toBe('ethanol');
  expect(result.entries[0]?.fields).toStrictEqual({ CAS: '64-17-5' });
});

test('a long list hands the event loop back as it goes', async () => {
  // The regression this guards: converted in one synchronous pass, a hundred
  // thousand structures is twelve seconds in which the service answers nothing
  // at all — not another caller, not a health check. Chunking does not make it
  // faster, it makes everyone else stop waiting behind it.
  const lines = splitList('CCO ethanol\n'.repeat(4000));

  let ticks = 0;
  const timer = setInterval(() => ticks++, 5);
  try {
    const result = await convertLines(lines, 'auto', 'smiles');
    expect(result.count).toBe(4000);
  } finally {
    clearInterval(timer);
  }

  // A synchronous pass would let the timer fire zero times.
  expect(ticks).toBeGreaterThan(0);
});

test('records are built for the readable lines only', async () => {
  const lines = splitList('CCO ethanol\nQQQ nonsense\nc1ccccc1 benzene');
  const records = await buildRecords(lines, 'auto');

  expect(records).toHaveLength(2);
  expect(records[0]?.Name).toBe('ethanol');
  expect(records[0]?.SMILES).toBe('CCO');
  expect(records[0]?.['Molecular Formula']).toBe('C2H6O');
  expect(records[0]?.['Molecular Weight']).toBe('46.0686');
  expect(records[0]?.molfile).toContain('V2000');
  expect(records[1]?.Name).toBe('benzene');
});

test('building records hands the event loop back too', async () => {
  const lines = splitList('CCO ethanol\n'.repeat(4000));

  let ticks = 0;
  const timer = setInterval(() => ticks++, 5);
  try {
    expect(await buildRecords(lines, 'auto')).toHaveLength(4000);
  } finally {
    clearInterval(timer);
  }

  expect(ticks).toBeGreaterThan(0);
});
