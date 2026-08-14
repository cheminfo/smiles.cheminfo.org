import {
  Alert,
  Button,
  Card,
  H5,
  Icon,
  ProgressBar,
  Tag,
} from '@blueprintjs/core';
import { useSignals } from '@preact/signals-react/runtime';
import { useEffect, useRef, useState } from 'react';

import type { Exercise } from '../../../exercises/types.ts';
import { levelOf } from '../../../exercises/validate.ts';
import {
  clearProgress,
  progressOf,
  solvedCount,
} from '../../../state/exerciseProgress.ts';
import { data, openExercise, view } from '../../../state/exercises.ts';
import { isHidden } from '../../../state/shareConfig.ts';

import SetPicker from './SetPicker.tsx';

/**
 * Every exercise of the set, with what has been done to each.
 *
 * The list takes the arrow keys, because working through fifty questions with
 * a mouse is fifty round trips to the left-hand column.
 * @returns The exercise list.
 */
export default function ExerciseList() {
  useSignals();
  const [clearing, setClearing] = useState(false);
  const set = data.set.value;
  const current = view.current.value;
  const listRef = useRef<HTMLUListElement>(null);

  const ids = set.exercises.map((exercise) => exercise.id);
  const solved = solvedCount(ids);

  useArrowKeys(listRef, ids, current);

  return (
    <Card className="exercise-list-card">
      {isHidden('sets') ? null : <SetPicker />}
      <div className="card-header">
        <H5>{set.title}</H5>
        <Tag minimal intent={solved === ids.length ? 'success' : 'none'}>
          {solved} / {ids.length}
        </Tag>
      </div>
      <ProgressBar
        intent="success"
        stripes={false}
        value={ids.length === 0 ? 0 : solved / ids.length}
      />
      <p className="muted">{set.description}</p>

      <ul ref={listRef} className="exercise-list">
        {set.exercises.map((exercise, index) => (
          <Row
            key={exercise.id}
            exercise={exercise}
            index={index}
            active={exercise.id === current}
          />
        ))}
      </ul>

      {isHidden('clear') ? null : (
        <Button
          size="small"
          icon="trash"
          text="Clear every answer"
          onClick={() => setClearing(true)}
        />
      )}

      <Alert
        isOpen={clearing}
        intent="danger"
        icon="trash"
        cancelButtonText="Keep them"
        confirmButtonText="Forget everything"
        onCancel={() => setClearing(false)}
        onConfirm={() => {
          clearProgress();
          setClearing(false);
        }}
      >
        Every answer on every exercise, gone. This cannot be undone.
      </Alert>
    </Card>
  );
}

function Row(props: { exercise: Exercise; index: number; active: boolean }) {
  const { exercise, index, active } = props;
  const progress = progressOf(exercise.id);
  const level = levelOf(exercise);

  const classes = [
    'exercise-row',
    `exercise-row--${level}`,
    active ? 'exercise-row--active' : '',
    progress.status === 'solved' ? 'exercise-row--solved' : '',
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <li>
      <button
        type="button"
        className={classes}
        aria-current={active}
        onClick={() => openExercise(exercise.id)}
      >
        <Icon
          icon={
            progress.status === 'solved'
              ? 'tick-circle'
              : progress.status === 'attempted'
                ? 'warning-sign'
                : 'circle'
          }
          intent={
            progress.status === 'solved'
              ? 'success'
              : progress.status === 'attempted'
                ? 'warning'
                : 'none'
          }
        />
        <span className="exercise-row-index">{index + 1}</span>
        <span className="exercise-row-title">{exercise.title}</span>
        {progress.attempts > 1 ? (
          <Tag minimal htmlTitle="Answers submitted">
            {progress.attempts} attempts
          </Tag>
        ) : null}
        {progress.hintsRevealed > 0 ? (
          <Tag minimal htmlTitle="Hints opened">
            {progress.hintsRevealed} hint
            {progress.hintsRevealed === 1 ? '' : 's'}
          </Tag>
        ) : null}
      </button>
    </li>
  );
}

/**
 * Walk the list with ArrowUp and ArrowDown.
 *
 * The handler sits on the list rather than on the window, so the arrow keys
 * still move a caret inside the answer box — which is where they belong when
 * the answer box is what has the focus.
 * @param listRef - The list element.
 * @param ids - Every exercise of the set, in order.
 * @param current - Which one is open.
 */
function useArrowKeys(
  listRef: React.RefObject<HTMLUListElement | null>,
  ids: readonly string[],
  current: string,
): void {
  useEffect(() => {
    const list = listRef.current;
    if (!list) return;

    const onKeyDown = (event: KeyboardEvent) => {
      const step =
        event.key === 'ArrowDown' ? 1 : event.key === 'ArrowUp' ? -1 : 0;
      if (step === 0) return;
      const at = ids.indexOf(current);
      const next = ids[Math.min(Math.max(at + step, 0), ids.length - 1)];
      if (next && next !== current) {
        event.preventDefault();
        openExercise(next);
      }
    };

    list.addEventListener('keydown', onKeyDown);
    return () => list.removeEventListener('keydown', onKeyDown);
  }, [listRef, ids, current]);
}
