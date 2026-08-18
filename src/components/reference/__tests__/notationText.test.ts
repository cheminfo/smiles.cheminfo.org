import { expect, test } from 'vitest';

import { REFERENCE_SECTIONS } from '../../../data/reference/index.ts';

/**
 * The same alternation `NotationText` renders with. It is duplicated here on
 * purpose: what these tests are about is the *corpus* — that every line of the
 * sheet pairs its markers — and a test importing the component would need a DOM
 * to say anything at all (see rules/testing.md on not installing jsdom).
 */
const SPAN =
  /`(?<code>[^`]+)`|\*\*(?<strong>[^*]+)\*\*|\*(?<em>[^\s*][^*]*?)\*/g;

function lines(): string[] {
  const out: string[] = [];
  for (const section of REFERENCE_SECTIONS) {
    if (section.intro) out.push(section.intro);
    for (const entry of section.entries) {
      out.push(entry.summary);
      if (entry.detail) out.push(entry.detail);
      if (entry.exampleNote) out.push(entry.exampleNote);
    }
  }
  return out;
}

test('every marker in the sheet pairs, so nothing is shown as its own syntax', () => {
  // An unpaired backtick or asterisk is printed to the student as a character
  // of the notation, which is exactly the confusion the sheet is written to
  // remove. The whole corpus is checked because the markers are written by
  // hand, one row at a time.
  const unpaired: string[] = [];
  for (const line of lines()) {
    const rest = line.replaceAll(SPAN, '');
    if (/[`*]/.test(rest)) unpaired.push(rest.slice(0, 80));
  }
  expect(unpaired).toStrictEqual([]);
});

test('the sheet quotes its notation rather than writing it bare', () => {
  const spans = lines().flatMap((line) => [...line.matchAll(SPAN)]);
  const code = spans.filter((span) => span.groups?.code !== undefined);
  expect(code.length).toBeGreaterThanOrEqual(400);

  // A code span holding nothing but a space, or spanning a sentence, means a
  // stray backtick pair rather than a quoted construct.
  for (const span of code) {
    const quoted = span.groups?.code ?? '';
    expect(quoted.trim(), span[0]).not.toBe('');
    expect(quoted.length, span[0]).toBeLessThan(70);
  }
});

test('a code span never opens inside an emphasis, so the two never interleave', () => {
  // `*a `b` c*` would render as an emphasis holding a code span in a real
  // markdown renderer and as neither here, so the corpus must not contain one.
  for (const line of lines()) {
    for (const span of line.matchAll(SPAN)) {
      const em = span.groups?.em ?? span.groups?.strong;
      if (em !== undefined) expect(em, span[0]).not.toContain('`');
    }
  }
});
