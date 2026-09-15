import { useSignals } from '@preact/signals-react/runtime';
import { CapsuleFilter } from 'react-cheminfo/ui';

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

  return (
    <CapsuleFilter
      className="set-picker"
      label="Exercise set"
      value={data.set.value.id}
      onChange={openSet}
      options={EXERCISE_SETS.map((set) => {
        const solved = solvedCount(
          set.exercises.map((exercise) => exercise.id),
        );
        return {
          value: set.id,
          // The ratio is what says how far through the set the student is, so
          // it rides in the label rather than as a bare count.
          label: `${set.title} (${solved}/${set.exercises.length})`,
          intent: solved === set.exercises.length ? 'success' : 'primary',
          title: set.description,
        };
      })}
    />
  );
}
