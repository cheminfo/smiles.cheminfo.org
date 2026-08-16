import { Callout } from '@blueprintjs/core';

import type { StructureError } from '../chemistry/types.ts';

/**
 * Say what stopped the parser, and point at the character it stopped on.
 *
 * openchemlib reports the position it gave up at, which is the one thing that
 * turns "this SMILES is wrong" into "this bracket is wrong" — so the input is
 * repeated under the message with a caret under the offending character,
 * rather than the message being left to stand on its own.
 * @param props - The error, and the text it was raised on.
 * @returns The error callout, or nothing when there is no error.
 */
export default function NotationError(props: {
  error: StructureError | null;
  input: string;
}) {
  const { error, input } = props;
  if (!error) return null;

  return (
    <Callout intent="danger" compact className="notation-error">
      {error.message}
      <NotationCaret input={input} position={error.position} />
    </Callout>
  );
}

/**
 * The input with a caret under the character the parser stopped on, on its own,
 * for a caller that already has somewhere to say what went wrong.
 * @param props - The text that was read, and where the parser stopped.
 * @returns The two lines, or nothing when there is nothing to point at.
 */
export function NotationCaret(props: { input: string; position?: number }) {
  const caret = caretLine(props.input, props.position);
  if (!caret) return null;

  return (
    <pre className="notation-caret">
      {props.input}
      {'\n'}
      {caret}
    </pre>
  );
}

/**
 * The line of spaces and a caret that sits under the offending character.
 * @param input - The text the parser was reading.
 * @param position - Where it stopped, when it said.
 * @returns The caret line, or null when there is nothing to point at.
 */
function caretLine(input: string, position?: number): string | null {
  if (position === undefined || input.includes('\n')) return null;
  // The position is the index of the character the parser choked on, except
  // when it only found out at the end — a dangling ring closure is reported at
  // the length of the string — where the last character is what to point at.
  const at = Math.min(position, Math.max(input.length - 1, 0));
  return `${' '.repeat(at)}^`;
}
