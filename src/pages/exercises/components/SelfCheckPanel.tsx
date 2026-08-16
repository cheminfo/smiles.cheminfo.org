import { Card, H5, Icon } from '@blueprintjs/core';
import { useSignals } from '@preact/signals-react/runtime';
import { MF } from 'react-mf';

import { NotationCaret } from '../../../components/NotationError.tsx';
import { selfCheck } from '../../../exercises/selfCheck.ts';
import type { Exercise } from '../../../exercises/types.ts';
import { view } from '../../../state/exercises.ts';

import FormulaDifferenceLine from './FormulaDifferenceLine.tsx';

/**
 * The two things a student can check for themselves, checked as they write.
 *
 * This is not the mark and never becomes it: it says whether the draft reads
 * as a structure, and then whether that structure holds the atoms of the one
 * in the question — the arithmetic, in the order a chemist does it. Both are
 * things the student could work out by hand, which is what makes showing them
 * live a tutor rather than an answer key: every isomer of the question passes
 * the formula, so nothing here says the answer is right. Only
 * {@link submitAnswer} does that.
 * @param props - The exercise being answered.
 * @returns The panel, or nothing for a question this cannot speak about.
 */
export default function SelfCheckPanel(props: { exercise: Exercise }) {
  useSignals();
  const { exercise } = props;
  const draft = view.answer.value;
  const check = selfCheck(exercise, draft);
  if (!check) return null;

  return (
    <Card className="self-check">
      <div className="card-header">
        <H5>As you go</H5>
      </div>

      {check.state === 'blank' ? (
        <p className="muted">
          {exercise.kind === 'draw'
            ? 'Draw something and this says whether it holds the right atoms.'
            : 'Start writing and this says whether it reads, and whether it holds the right atoms.'}
        </p>
      ) : null}

      {check.state === 'unreadable' ? (
        <>
          <CheckRow ok={false}>{check.error.message}</CheckRow>
          <NotationCaret input={draft.trim()} position={check.error.position} />
          {check.hint ? <p className="self-check-hint">{check.hint}</p> : null}
        </>
      ) : null}

      {check.state === 'read' ? (
        <>
          {/* A drawing always reads: saying so of a canvas would be noise. */}
          {exercise.kind === 'write' ? (
            <CheckRow ok>That reads as a structure.</CheckRow>
          ) : null}
          {check.difference ? (
            <>
              <CheckRow ok={false}>The atoms do not add up yet.</CheckRow>
              <FormulaDifferenceLine formula={check.difference} />
            </>
          ) : (
            <CheckRow ok>
              The atoms add up: <MF mf={check.formula} />, as asked.
            </CheckRow>
          )}
        </>
      ) : null}

      {check.state === 'read' && !check.difference ? (
        <p className="muted">
          The same atoms can be joined more than one way — submit it to find out
          whether they are joined yours.
        </p>
      ) : null}
    </Card>
  );
}

/**
 * One thing that was checked, and how it came out.
 * @param props - Whether it holds, and what to call it.
 * @returns The row.
 */
function CheckRow(props: { ok: boolean; children: React.ReactNode }) {
  return (
    <p className={props.ok ? 'self-check-row' : 'self-check-row is-off'}>
      <Icon
        icon={props.ok ? 'tick-circle' : 'cross-circle'}
        intent={props.ok ? 'success' : 'warning'}
        size={14}
      />
      <span>{props.children}</span>
    </p>
  );
}
