import { Button, Callout, Card, H5 } from '@blueprintjs/core';
import { useSignals } from '@preact/signals-react/runtime';

import GlossaryText from '../../../components/GlossaryText.tsx';
import type { Exercise } from '../../../exercises/types.ts';
import { progressOf } from '../../../state/exerciseProgress.ts';
import { revealHint } from '../../../state/exercises.ts';

/**
 * The hint ladder, one rung at a time.
 *
 * How many were opened is shown on the solved exercise afterwards, and
 * deliberately not hidden: it is an honest note of which questions were hard,
 * for the student to come back to — never a mark against them.
 * @param props - The exercise.
 * @returns The hints panel, or nothing when the exercise carries none.
 */
export default function HintsPanel(props: { exercise: Exercise }) {
  useSignals();
  const { exercise } = props;
  const hints = exercise.hints ?? [];
  if (hints.length === 0) return null;

  const shown = Math.min(progressOf(exercise.id).hintsRevealed, hints.length);

  return (
    <Card>
      <div className="card-header">
        <H5>Hints</H5>
        <Button
          size="small"
          icon="lightbulb"
          text={
            shown >= hints.length
              ? 'That is all of them'
              : `Reveal a hint (${shown + 1} of ${hints.length})`
          }
          disabled={shown >= hints.length}
          onClick={revealHint}
        />
      </div>
      {shown === 0 ? (
        <p className="muted">
          {hints.length} hint{hints.length === 1 ? '' : 's'}, from a nudge to
          almost the answer. Take them one at a time.
        </p>
      ) : (
        <ol className="hint-list">
          {hints.slice(0, shown).map((hint) => (
            <li key={hint}>
              <Callout compact intent="primary">
                <GlossaryText text={hint} />
              </Callout>
            </li>
          ))}
        </ol>
      )}
    </Card>
  );
}
