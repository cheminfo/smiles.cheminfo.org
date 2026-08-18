import { Fragment } from 'react';

/**
 * A span of notation, or a span of emphasis, in the sheet's prose.
 *
 * The code alternative comes first, so a `*` inside backticks — `[*+]`, `*~*`,
 * `*!@*` — is read as part of the notation rather than as the start of an
 * emphasis. An emphasis may not open on whitespace, which is what keeps a lone
 * asterisk in ordinary prose from pairing with one three sentences later.
 */
const SPAN =
  /`(?<code>[^`]+)`|\*\*(?<strong>[^*]+)\*\*|\*(?<em>[^\s*][^*]*?)\*/g;

/**
 * Render a line of the sheet, setting the notation it quotes in monospace.
 *
 * Every row of the sheet is about a piece of notation, and the prose is written
 * with that notation in backticks — four hundred and sixty-odd spans of it. Left
 * unrendered they read as the characters themselves, so a row explaining that
 * `[C]` carries no hydrogen was showing the backticks to the student as if they
 * were part of the atom.
 *
 * The vocabulary is exactly three things, because a cheatsheet needs no more:
 * `` `code` `` for a notation, `**strong**` for the word a warning turns on, and
 * `*em*` for a contrast. Anything else is left as it was typed.
 * @param props - The line to render.
 * @returns The line, with its notation and emphasis marked up.
 */
export default function NotationText(props: { text: string }) {
  const { text } = props;
  const pieces: React.ReactNode[] = [];
  let at = 0;

  for (const match of text.matchAll(SPAN)) {
    const start = match.index;
    if (start > at) pieces.push(text.slice(at, start));
    // Keyed on where the span sits, which is unique even when the same
    // notation is quoted twice in one sentence.
    const key = `${start}-${match[0]}`;
    const { code, strong, em } = match.groups ?? {};
    if (code !== undefined) {
      pieces.push(<code key={key}>{code}</code>);
    } else if (strong !== undefined) {
      pieces.push(<strong key={key}>{strong}</strong>);
    } else {
      pieces.push(<em key={key}>{em}</em>);
    }
    at = start + match[0].length;
  }
  if (at < text.length) pieces.push(text.slice(at));

  return <Fragment>{pieces}</Fragment>;
}
