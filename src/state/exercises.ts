import { computed, signal } from '@preact/signals-react';

import {
  DEFAULT_SET_ID,
  EXERCISES_BY_ID,
  EXERCISE_SETS,
} from '../data/exercises.ts';
import type { Exercise, ExerciseSet, Verdict } from '../exercises/types.ts';
import { validate } from '../exercises/validate.ts';

import {
  clearProgress,
  progressOf,
  updateProgress,
} from './exerciseProgress.ts';
import {
  parsePath,
  replaceParameters,
  replacePath,
  route,
  searchParameter,
} from './router.ts';

/** The parameter naming which set is open, on a link written before `/exercises/patterns`. */
export const SET_PARAM = 'set';
/** The parameter naming a set assembled exercise by exercise. */
export const EXERCISES_PARAM = 'exercises';
/** The parameter naming which exercise of the set is open. */
export const EXERCISE_PARAM = 'exercise';

export const data = {
  /** The set being worked on. */
  set: signal<ExerciseSet>(EXERCISE_SETS[0] as ExerciseSet),
};

export const view = {
  /** Which exercise of the set is open, by id. */
  current: signal<string>(''),
  /** What is in the box or on the canvas for the open exercise. */
  answer: signal<string>(''),
  /**
   * How the last submitted answer was marked, and nothing else: an answer
   * being typed is not marked until it is handed in.
   */
  verdict: signal<Verdict | null>(null),
  /**
   * Bumped when the canvas must be rebuilt from the answer rather than left
   * as the student drew it — which is only ever a reset. The editor is
   * uncontrolled, so this is the one thing that can empty it.
   */
  editorRevision: signal<number>(0),
};

/** The open exercise. */
export const currentExercise = computed<Exercise | null>(
  () =>
    data.set.value.exercises.find(
      (exercise) => exercise.id === view.current.value,
    ) ?? null,
);

/**
 * Open an exercise, restoring whatever was last written or drawn for it.
 *
 * The mark comes back with it only when what is in the box is still what was
 * handed in — a student who left mid-edit comes back to their own draft, not to
 * a verdict about something they have since changed.
 * @param id - The exercise to open.
 */
export function openExercise(id: string): void {
  view.current.value = id;
  const progress = progressOf(id);
  view.answer.value = progress.answer;
  const exercise = currentExercise.peek();
  view.verdict.value =
    exercise && progress.submitted && progress.submitted === progress.answer
      ? validate(exercise, progress.submitted)
      : null;
  // Only the exercises page writes the exercises page's address. This also
  // runs before the first paint, to restore what a link named, and navigating
  // from there would drag every other page onto this one.
  if (route.page.peek() === 'exercises') writeAddress(id);
}

/**
 * Put the open set and exercise in the address. A set this site ships has an
 * address of its own — `/exercises/patterns/s1` — so a search result can point
 * at the question itself; a set a link assembled by hand has no name to write,
 * so it stays in the query string where the link put it.
 * @param id - The exercise that is open.
 */
function writeAddress(id: string): void {
  const set = data.set.peek();
  if (set.id === 'custom') {
    replaceParameters({ [EXERCISE_PARAM]: id });
    return;
  }
  replacePath(`/exercises/${set.id}/${id}`, {
    [SET_PARAM]: undefined,
    [EXERCISE_PARAM]: undefined,
  });
}

/**
 * Open one of the sets this site ships, on its first exercise.
 *
 * The address is rewritten to name the set rather than the exercise that was
 * open in the previous one, and `exercises` is dropped: a link handing out a
 * chosen ten is no longer what is being worked on once another set is picked.
 * @param id - The set to open.
 */
export function openSet(id: string): void {
  const set = EXERCISE_SETS.find((candidate) => candidate.id === id);
  if (!set || set.id === data.set.peek().id) return;
  data.set.value = set;
  replacePath(`/exercises/${id}`, {
    [SET_PARAM]: undefined,
    [EXERCISES_PARAM]: undefined,
    [EXERCISE_PARAM]: undefined,
  });
  const first = set.exercises[0]?.id;
  if (first) openExercise(first);
}

/**
 * Take an answer and keep it, unmarked.
 *
 * Writing is not answering: the draft is stored so a reload gives it back, and
 * whatever the last submission was told the student is dropped, because it is
 * no longer about what is on screen.
 * @param answer - What is in the box or on the canvas.
 */
export function setAnswer(answer: string): void {
  view.answer.value = answer;
  view.verdict.value = null;
  const exercise = currentExercise.peek();
  if (!exercise) return;
  updateProgress(exercise.id, { answer });
}

/**
 * Hand the answer in and mark it.
 *
 * This is the only thing that marks, counts an attempt, or moves the status —
 * a student decides when they are done, rather than being told they are wrong
 * halfway through typing the right thing. The status only ever moves forwards:
 * an exercise once solved stays solved while its answer is edited into
 * something else, because a student who got it right and then kept playing has
 * still got it right.
 */
export function submitAnswer(): void {
  const exercise = currentExercise.peek();
  if (!exercise) return;
  const answer = view.answer.peek();
  if (!answer.trim()) return;

  const previous = progressOf(exercise.id);
  const marked = validate(exercise, answer);
  view.verdict.value = marked;
  updateProgress(exercise.id, {
    answer,
    submitted: answer,
    attempts: previous.attempts + 1,
    status:
      marked.passed || previous.status === 'solved' ? 'solved' : 'attempted',
  });
}

/** Forget one exercise: the answer, the mark, the attempts and the hints. */
export function resetExercise(): void {
  const exercise = currentExercise.peek();
  if (!exercise) return;
  clearProgress(exercise.id);
  view.answer.value = '';
  view.verdict.value = null;
  view.editorRevision.value++;
}

/** Open one more hint on the current exercise. */
export function revealHint(): void {
  const exercise = currentExercise.peek();
  if (!exercise?.hints) return;
  const shown = progressOf(exercise.id).hintsRevealed;
  updateProgress(exercise.id, {
    hintsRevealed: Math.min(shown + 1, exercise.hints.length),
  });
}

/**
 * Show or hide the answer of the current exercise.
 * @param show - Whether to show it.
 */
export function setShowAnswer(show: boolean): void {
  const exercise = currentExercise.peek();
  if (exercise) updateProgress(exercise.id, { showAnswer: show });
}

/**
 * Read the set and the exercise a link names.
 *
 * A set is either one this site ships, or a list of exercise ids — which is
 * how a teacher hands out ten questions out of a hundred in a single address.
 */
export function readAddress(): void {
  if (route.page.peek() !== 'exercises') return;

  const address = parsePath(route.path.peek());
  const chosen = searchParameter(EXERCISES_PARAM);
  // `?set=` and `?exercise=` are what a link written before the set had an
  // address of its own says, and they still open.
  const named = address.setId ?? searchParameter(SET_PARAM);

  if (chosen) {
    const exercises = pickExercises(chosen.split(','));
    if (exercises.length > 0) {
      data.set.value = {
        id: 'custom',
        title: 'Exercises',
        description: 'The questions this link hands out.',
        exercises,
      };
    }
  } else if (named) {
    const set = EXERCISE_SETS.find((candidate) => candidate.id === named);
    if (set) data.set.value = set;
  } else {
    data.set.value =
      EXERCISE_SETS.find((set) => set.id === DEFAULT_SET_ID) ??
      (EXERCISE_SETS[0] as ExerciseSet);
  }

  const wanted = address.exerciseId ?? searchParameter(EXERCISE_PARAM);
  const set = data.set.peek();
  const opening =
    (wanted && set.exercises.some((exercise) => exercise.id === wanted)
      ? wanted
      : set.exercises[0]?.id) ?? '';
  if (opening) openExercise(opening);
}

function pickExercises(ids: readonly string[]): Exercise[] {
  const exercises: Exercise[] = [];
  const taken = new Set<string>();
  for (const id of ids) {
    const trimmed = id.trim();
    const exercise = EXERCISES_BY_ID.get(trimmed);
    // An id nobody knows is skipped rather than fatal, so a link written for
    // a set that has since changed still opens on what is left of it.
    if (!exercise || taken.has(trimmed)) continue;
    taken.add(trimmed);
    exercises.push(exercise);
  }
  return exercises;
}
