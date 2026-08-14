import { Callout, Card } from '@blueprintjs/core';
import { useSignals } from '@preact/signals-react/runtime';
import { useLayoutEffect } from 'react';

import { currentExercise, data, readAddress } from '../../state/exercises.ts';
import { isHidden } from '../../state/shareConfig.ts';

import AnswerPanel from './components/AnswerPanel.tsx';
import ExerciseList from './components/ExerciseList.tsx';
import HintsPanel from './components/HintsPanel.tsx';
import QuestionPanel from './components/QuestionPanel.tsx';
import SelfCheckPanel from './components/SelfCheckPanel.tsx';

/**
 * The exercises: the list on the left, the question in the middle, what to do
 * about it on the right.
 *
 * A set of one has nothing to list, so the question takes the two columns on
 * its own — which is what a link handing out a single question is for.
 * @returns The exercises page.
 */
export default function ExercisesPage() {
  useSignals();
  // Reached from another tab rather than from a link, nothing has read the
  // address since the page was loaded, so the set would sit there with none of
  // its exercises open. Before the paint, so the question is there on arrival
  // rather than after a frame of "this link names no exercise".
  useLayoutEffect(() => {
    readAddress();
  }, []);
  const exercise = currentExercise.value;
  // `hide=list` is no longer offered, but a link written before it was dropped
  // still says it.
  const alone = data.set.value.exercises.length < 2 || isHidden('list');

  return (
    <div className={alone ? 'exercises exercises--alone' : 'exercises'}>
      {alone ? null : <ExerciseList />}
      {exercise ? (
        <>
          <div className="panel-stack">
            <QuestionPanel exercise={exercise} />
          </div>
          <div className="panel-stack">
            <AnswerPanel exercise={exercise} />
            {isHidden('check') ? null : <SelfCheckPanel exercise={exercise} />}
            {isHidden('hints') ? null : <HintsPanel exercise={exercise} />}
          </div>
        </>
      ) : (
        <Card>
          <Callout intent="warning" icon="help">
            This link names no exercise anybody here knows about. Pick one from
            the list, or open <b>{data.set.value.title}</b> from the top.
          </Callout>
        </Card>
      )}
    </div>
  );
}
