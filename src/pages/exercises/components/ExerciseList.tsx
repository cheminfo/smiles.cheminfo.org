import { Alert, Button, Card, H5, ProgressBar, Tag } from '@blueprintjs/core';
import { useSignals } from '@preact/signals-react/runtime';
import { useState } from 'react';
import { pluralize } from 'react-cheminfo/core';
import {
  ExerciseStatusIcon,
  useListKeyboardNavigation,
} from 'react-cheminfo/ui';

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

  const ids = set.exercises.map((exercise) => exercise.id);
  const solved = solvedCount(ids);

  // The handler sits on the list rather than on the window, so the arrow keys
  // still move a caret inside the answer box — which is where they belong when
  // the answer box is what has the focus.
  const onKeyDown = useListKeyboardNavigation({
    length: ids.length,
    selectedIndex: ids.indexOf(current),
    onSelect: (index) => {
      const next = ids[index];
      if (next !== undefined) openExercise(next);
    },
  });

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

      <ul className="exercise-list" onKeyDown={onKeyDown}>
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
        <ExerciseStatusIcon status={progress.status} />
        <span className="exercise-row-index">{index + 1}</span>
        <span className="exercise-row-title">{exercise.title}</span>
        {progress.attempts > 1 ? (
          <Tag minimal htmlTitle="Answers submitted">
            {progress.attempts} attempts
          </Tag>
        ) : null}
        {progress.hintsRevealed > 0 ? (
          <Tag minimal htmlTitle="Hints opened">
            {progress.hintsRevealed} {pluralize(progress.hintsRevealed, 'hint')}
          </Tag>
        ) : null}
      </button>
    </li>
  );
}
