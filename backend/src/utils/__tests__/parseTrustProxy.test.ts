import { expect, test } from 'vitest';

import { parseTrustProxy } from '../parseTrustProxy.ts';

test.each([
  [undefined, false],
  ['', false],
  [' '.repeat(3), false],
  ['false', false],
  ['true', true],
])('%s trusts nothing or everything, as written', (value, expected) => {
  expect(parseTrustProxy(value)).toBe(expected);
});

test('a hop count is a number, not the string it arrived as', () => {
  // Fastify counts hops when given a number and reads a string as an address,
  // so `2` arriving from the environment as text has to be converted here or
  // the server trusts a proxy literally named "2".
  expect(parseTrustProxy('2')).toBe(2);
  expect(parseTrustProxy(' 10 ')).toBe(10);
});

test('an address, a range or a list of them is handed over as it stands', () => {
  expect(parseTrustProxy('127.0.0.1')).toBe('127.0.0.1');
  expect(parseTrustProxy('10.0.0.0/8')).toBe('10.0.0.0/8');
  expect(parseTrustProxy(' 127.0.0.1,10.0.0.0/8 ')).toBe(
    '127.0.0.1,10.0.0.0/8',
  );
});

test('an address that merely starts with digits stays an address', () => {
  // `10.0.0.1` is every bit as numeric-looking as `10` at a glance; only a run
  // of digits and nothing else is a hop count.
  expect(parseTrustProxy('10.0.0.1')).toBe('10.0.0.1');
  expect(parseTrustProxy('2001:db8::1')).toBe('2001:db8::1');
});
