import { H6 } from '@blueprintjs/core';
import { useSignals } from '@preact/signals-react/runtime';
import { useState } from 'react';
import { ShareDialog as SharePanel } from 'react-cheminfo/ui';

import { EXERCISES_PARAM, SET_PARAM, data } from '../../state/exercises.ts';
import { PATHS, route } from '../../state/router.ts';
import { shareOptionsOf } from '../../state/shareOptions.ts';
import { absoluteUrl } from '../../state/site.ts';

import ShareExerciseSet from './ShareExerciseSet.tsx';

/**
 * Build a link to the page as it is set up now, and the iframe that frames it
 * in a course. What the page is working on comes from the address; what an
 * embedder may change comes from this dialog.
 * @param props - Whether the dialog is open, and how to dismiss it.
 * @returns The share dialog component.
 */
export default function ShareDialog(props: {
  isOpen: boolean;
  onClose: () => void;
}) {
  useSignals();
  const options = shareOptionsOf(route.page.value);
  // Until the teacher touches the list, the link hands out the whole set —
  // derived rather than copied at mount, so a set still loading when the
  // dialog opens does not leave it ticking nothing.
  const [chosen, setChosen] = useState<string[] | null>(null);
  const selected =
    chosen ?? data.set.value.exercises.map((exercise) => exercise.id);
  const link = options.hasExercises ? exerciseLink(selected) : null;

  return (
    <SharePanel
      isOpen={props.isOpen}
      onClose={props.onClose}
      vocabulary={options.vocabulary}
      title={options.title}
      frameTitle={`SMILES — ${options.title}`}
      frameHeight={800}
      baseUrl={link?.baseUrl}
      search={link?.search}
    >
      {options.hasExercises ? (
        <>
          <H6>Exercises</H6>
          <ShareExerciseSet selected={selected} onChange={setChosen} />
        </>
      ) : undefined}
    </SharePanel>
  );
}

/**
 * The address of the page with the chosen exercises written into it, which is
 * what the dialog then writes its own configuration over.
 * @param exercises - The chosen exercise ids, in the order they were picked.
 * @returns The query string, and the page the link must open when it is not the current one.
 */
function exerciseLink(exercises: readonly string[]): {
  baseUrl: string | undefined;
  search: string;
} {
  const params = new URLSearchParams(globalThis.location?.search ?? '');
  const set = data.set.peek();
  const isWholeSet =
    exercises.length === set.exercises.length &&
    exercises.every((id, index) => id === set.exercises[index]?.id);

  if (isWholeSet && set.id !== 'custom') {
    // The whole set is named by the address itself, which is shorter, readable,
    // and survives the set gaining a question later.
    params.delete(EXERCISES_PARAM);
    params.delete(SET_PARAM);
    return { baseUrl: undefined, search: params.toString() };
  }

  params.delete(SET_PARAM);
  params.set(EXERCISES_PARAM, exercises.join(','));
  const open = params.get('exercise');
  if (open && exercises.length > 0 && !exercises.includes(open)) {
    params.delete('exercise');
  }
  // A set assembled question by question has no address of its own: the link
  // carries the list, so it opens the page holding them rather than a set the
  // site does not ship.
  return { baseUrl: absoluteUrl(PATHS.exercises), search: params.toString() };
}
