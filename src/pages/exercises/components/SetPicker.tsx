import { Tag } from '@blueprintjs/core';
import { useSignals } from '@preact/signals-react/runtime';

import { EXERCISE_SETS } from '../../../data/exercises.ts';
import { solvedCount } from '../../../state/exerciseProgress.ts';
import { data, openSet } from '../../../state/exercises.ts';

/**
 * The sets this site ships, as capsules above the list.
 *
 * Without it the other two sets are reachable only by typing `?set=` into the
 * address, which is not something a student does — a link a teacher hands out
 * still opens on exactly the set it names, and this is how the student gets
 * from there to the rest.
 * @returns The set picker.
 */
export default function SetPicker() {
  useSignals();
  const current = data.set.value.id;

  return (
    <div className="set-picker">
      {EXERCISE_SETS.map((set) => {
        const active = set.id === current;
        const solved = solvedCount(
          set.exercises.map((exercise) => exercise.id),
        );
        return (
          <Tag
            key={set.id}
            interactive
            minimal={!active}
            intent={solved === set.exercises.length ? 'success' : 'primary'}
            htmlTitle={set.description}
            onClick={() => openSet(set.id)}
          >
            {set.title} ({solved}/{set.exercises.length})
          </Tag>
        );
      })}
    </div>
  );
}
