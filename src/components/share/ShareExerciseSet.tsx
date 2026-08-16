import { Button, Checkbox, HTMLSelect, PopoverNext } from '@blueprintjs/core';
import { useSignals } from '@preact/signals-react/runtime';

import { EXERCISE_SETS } from '../../data/exercises.ts';
import type { Exercise } from '../../exercises/types.ts';
import { levelOf } from '../../exercises/validate.ts';
import { data } from '../../state/exercises.ts';
import SmilesThumb from '../SmilesThumb.tsx';

/**
 * Pick which exercises the link hands out, and in which set.
 *
 * Running the mouse over a row draws the molecule it asks about, so a teacher
 * assembling a sheet sees what they are handing out rather than a list of
 * names they have to recognise.
 * @param props - What is ticked, and where to send a change.
 * @returns The picker.
 */
export default function ShareExerciseSet(props: {
  selected: readonly string[];
  onChange: (ids: string[]) => void;
}) {
  useSignals();
  const set = data.set.value;
  const { selected, onChange } = props;
  // A set of fifty rows each asking `selected.includes(...)` is fifty scans of
  // the same array on every keystroke in the dialog.
  const chosen = new Set(selected);

  function toggle(id: string, on: boolean): void {
    if (!on) {
      onChange(selected.filter((candidate) => candidate !== id));
      return;
    }
    // Ticking a row puts it back in the set's own order, never at the end:
    // the order of the link is the order the student walks through.
    const kept: string[] = [];
    for (const exercise of set.exercises) {
      if (exercise.id === id || chosen.has(exercise.id)) kept.push(exercise.id);
    }
    onChange(kept);
  }

  return (
    <>
      <div className="share-set-toolbar">
        <HTMLSelect
          value={set.id}
          onChange={(event) => {
            // Captured before the search: `currentTarget` is only set during the
            // synchronous dispatch, and is null by the time a callback runs.
            const chosenId = event.currentTarget.value;
            const next = EXERCISE_SETS.find(
              (candidate) => candidate.id === chosenId,
            );
            if (next) {
              data.set.value = next;
              onChange(next.exercises.map((exercise) => exercise.id));
            }
          }}
          options={[
            ...EXERCISE_SETS.map((candidate) => ({
              value: candidate.id,
              label: candidate.title,
            })),
            ...(set.id === 'custom'
              ? [{ value: 'custom', label: 'From this link' }]
              : []),
          ]}
        />
        <Button
          size="small"
          text="All"
          onClick={() => onChange(set.exercises.map((exercise) => exercise.id))}
        />
        <Button size="small" text="None" onClick={() => onChange([])} />
        <span className="share-set-count">
          {selected.length} of {set.exercises.length}
        </span>
      </div>

      <ul className="share-set">
        {set.exercises.map((exercise) => (
          <li
            key={exercise.id}
            className={
              chosen.has(exercise.id)
                ? 'share-set-item share-set-item--chosen'
                : 'share-set-item'
            }
          >
            <PopoverNext
              interactionKind="hover"
              hoverOpenDelay={200}
              placement="right"
              popoverClassName="exercise-preview-popover"
              content={<Preview exercise={exercise} />}
            >
              <Checkbox
                checked={chosen.has(exercise.id)}
                onChange={(event) =>
                  toggle(exercise.id, event.currentTarget.checked)
                }
              >
                {/* The id is what the link carries, so it is on the row a
                    teacher is ticking rather than only in the address. */}
                <span className="share-set-id">{exercise.id}</span>
                <span className="share-set-title">{exercise.title}</span>
                <span className="share-set-level">{levelOf(exercise)}</span>
              </Checkbox>
            </PopoverNext>
          </li>
        ))}
      </ul>
    </>
  );
}

function Preview(props: { exercise: Exercise }) {
  const { exercise } = props;
  return (
    <div className="exercise-preview">
      <div className="exercise-preview-header">
        <span className="share-set-id">{exercise.id}</span>
        <span>{exercise.title}</span>
        <span className="exercise-preview-count">{exercise.kind}</span>
      </div>
      {exercise.kind === 'smarts' ? (
        <div className="structure-grid structure-grid--preview">
          {exercise.cases.map((one) => (
            <SmilesThumb
              key={one.smiles}
              smiles={one.smiles}
              width={110}
              height={80}
            />
          ))}
        </div>
      ) : (
        <SmilesThumb smiles={exercise.smiles} width={220} height={160} />
      )}
    </div>
  );
}
