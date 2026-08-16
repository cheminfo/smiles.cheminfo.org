import { Callout, Icon } from '@blueprintjs/core';

import { NotationCaret } from '../../../components/NotationError.tsx';
import type { Exercise, Verdict } from '../../../exercises/types.ts';

import FormulaDifferenceLine from './FormulaDifferenceLine.tsx';

/**
 * What the marking says, and what to do about it.
 *
 * A wrong answer that only says "a different molecule" leaves a student with
 * nowhere to go but the hints, so every failure carries the next thing to look
 * at: where the parser stopped, which atoms do not add up, or which of the two
 * structures the difference is in.
 * @param props - The mark, the answer it is about, and how it was given.
 * @returns The callout, or nothing before anything has been submitted.
 */
export default function VerdictCallout(props: {
  verdict: Verdict | null;
  answer: string;
  kind: Exercise['kind'];
  summary: string;
}) {
  const { verdict, answer, kind, summary } = props;
  if (!verdict) return null;

  if (verdict.passed) {
    return (
      <Callout intent="success" icon="tick-circle" compact>
        Right. {summary}
      </Callout>
    );
  }

  return (
    <Callout
      intent={verdict.stereoOnly ? 'primary' : 'warning'}
      icon={verdict.stereoOnly ? 'lightbulb' : 'cross-circle'}
      compact
      className="verdict"
    >
      {verdict.stereoOnly ? <strong>Nearly. </strong> : null}
      {verdict.reason}
      {/* A drawing is an idCode, and pointing at a character of one says
          nothing about the structure it holds. */}
      {verdict.error && kind !== 'draw' ? (
        <NotationCaret input={answer} position={verdict.error.position} />
      ) : null}
      {verdict.formula ? (
        <FormulaDifferenceLine formula={verdict.formula} />
      ) : null}
      {verdict.hint ? (
        <p className="verdict-hint">
          <Icon icon="lightbulb" size={12} /> {verdict.hint}
        </p>
      ) : null}
    </Callout>
  );
}
