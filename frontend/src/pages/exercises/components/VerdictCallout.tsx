import { Callout, Icon } from '@blueprintjs/core';
import { MF } from 'react-mf';

import type {
  ElementCount,
  FormulaDifference,
} from '../../../../../chemistry/hints.ts';
import { NotationCaret } from '../../../components/NotationError.tsx';
import type { Exercise, Verdict } from '../../../exercises/types.ts';

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
      {verdict.formula ? <FormulaHint formula={verdict.formula} /> : null}
      {verdict.hint ? (
        <p className="verdict-hint">
          <Icon icon="lightbulb" size={12} /> {verdict.hint}
        </p>
      ) : null}
    </Callout>
  );
}

/**
 * Which atoms are missing and which are in excess.
 * @param props - The difference between the two formulas.
 * @returns One line of chemistry.
 */
function FormulaHint(props: { formula: FormulaDifference }) {
  const { given, missing, extra } = props.formula;

  return (
    <p className="verdict-formula">
      Your structure is <MF mf={given} />
      {missing.length > 0 ? (
        <>
          {' — short of '}
          <ElementList elements={missing} />
        </>
      ) : null}
      {extra.length > 0 ? (
        <>
          {missing.length > 0 ? ', and carrying ' : ' — carrying '}
          <ElementList elements={extra} />
          {' too many'}
        </>
      ) : null}
      .
    </p>
  );
}

/**
 * `1 C and 3 O` — each element on its own, because the same atoms written as
 * one formula would read as a molecule that is not there.
 * @param props - The elements and how many of each.
 * @returns The list, joined the way it would be said.
 */
function ElementList(props: { elements: ElementCount[] }) {
  const { elements } = props;

  return (
    <>
      {elements.map(({ element, count }, index) => (
        <span key={element}>
          {index === 0 ? '' : index === elements.length - 1 ? ' and ' : ', '}
          {count} <MF mf={element} />
        </span>
      ))}
    </>
  );
}
