import { Button, Callout, Card, H5, InputGroup, Tag } from '@blueprintjs/core';
import { useSignals } from '@preact/signals-react/runtime';
import { pluralize } from 'react-cheminfo/core';
import { CopyButton } from 'react-cheminfo/ui';

import StructureEditor from '../../../components/StructureEditor.tsx';
import type { Exercise } from '../../../exercises/types.ts';
import { progressOf } from '../../../state/exerciseProgress.ts';
import {
  resetExercise,
  setAnswer,
  setShowAnswer,
  submitAnswer,
  view,
} from '../../../state/exercises.ts';
import { isHidden } from '../../../state/shareConfig.ts';

import VerdictCallout from './VerdictCallout.tsx';

/**
 * Where the answer goes, and what the marking says about it.
 *
 * An answer is handed in, never taken: a student says when they are done, and
 * finds out then. Marking every keystroke tells someone halfway through writing
 * the right thing that they are wrong, and counts nothing anybody can learn
 * from — what the attempts and the hints below cost is the point of keeping
 * them.
 *
 * Nothing draws what is being typed, for the same reason. A student watching
 * their own SMILES turn into a structure beside the one they were given is
 * comparing two pictures, which is not the question: reading the notation back
 * is the exercise, and the converter next door is where a structure is looked
 * up rather than worked out.
 * @param props - The exercise being answered.
 * @returns The answer panel.
 */
export default function AnswerPanel(props: { exercise: Exercise }) {
  useSignals();
  const { exercise } = props;
  const answer = view.answer.value;
  const marked = view.verdict.value;
  const progress = progressOf(exercise.id);
  const handedIn = answer.trim() !== '' && answer === progress.submitted;

  return (
    <Card className="answer-card">
      <div className="card-header">
        <H5>Your answer</H5>
        <div className="draw-header-actions">
          <ProgressTags
            attempts={progress.attempts}
            hintsRevealed={progress.hintsRevealed}
          />
          {isHidden('answers') || exercise.kind === 'smarts' ? null : (
            <Button
              size="small"
              icon={progress.showAnswer ? 'eye-off' : 'eye-open'}
              text={progress.showAnswer ? 'Hide the answer' : 'Give up'}
              onClick={() => setShowAnswer(!progress.showAnswer)}
            />
          )}
          {isHidden('clear') ? null : (
            <Button
              size="small"
              icon="eraser"
              text="Reset"
              onClick={resetExercise}
            />
          )}
        </div>
      </div>

      {exercise.kind === 'draw' ? (
        <StructureEditor
          // Remounted only when the exercise changes or the answer is thrown
          // away, so the canvas is never taken out from under a hand that is
          // still drawing.
          key={`${exercise.id}:${view.editorRevision.value}`}
          initialIdCode={progress.answer}
          onChange={setAnswer}
          minHeight={340}
        />
      ) : (
        <InputGroup
          size="large"
          className="notation-input"
          value={answer}
          onChange={(event) => setAnswer(event.currentTarget.value)}
          onKeyDown={(event) => {
            // Enter hands it in: a one-line answer is finished by the key
            // that finishes every one-line answer.
            if (event.key === 'Enter') submitAnswer();
          }}
          placeholder={
            exercise.kind === 'smarts' ? '[CX3](=O)[OX2H1]' : 'CC(=O)O'
          }
          intent={marked ? (marked.passed ? 'success' : 'danger') : 'none'}
          spellCheck={false}
          autoCapitalize="off"
          autoCorrect="off"
          autoComplete="off"
        />
      )}

      <div className="answer-submit">
        <Button
          intent="primary"
          icon="tick"
          text={progress.status === 'solved' ? 'Check again' : 'Submit answer'}
          disabled={answer.trim() === '' || handedIn}
          onClick={submitAnswer}
        />
        {handedIn ? null : (
          <span className="muted">
            {progress.attempts === 0
              ? 'Nothing is marked until you submit it.'
              : 'Changed since your last submission.'}
          </span>
        )}
      </div>

      <VerdictCallout
        verdict={marked}
        answer={progress.submitted}
        kind={exercise.kind}
        summary={attemptSummary(progress.attempts, progress.hintsRevealed)}
      />

      {progress.showAnswer && exercise.kind !== 'smarts' ? (
        <Callout intent="warning" icon="key" compact className="answer-reveal">
          <div className="question-smiles">
            <code>{exercise.smiles}</code>
            <CopyButton small content={exercise.smiles} />
          </div>
          <span className="muted">
            Any SMILES of the same molecule is accepted — this is only one of
            them.
          </span>
        </Callout>
      ) : null}
    </Card>
  );
}

/**
 * What the work has cost so far.
 *
 * Kept in plain sight rather than only on the solved exercise: a student who
 * has submitted six times and opened every hint is being told which question to
 * come back to, which is what these numbers are for.
 * @param props - How many submissions and how many hints.
 * @returns The tags, or nothing before anything has been done.
 */
function ProgressTags(props: { attempts: number; hintsRevealed: number }) {
  const { attempts, hintsRevealed } = props;
  if (attempts === 0 && hintsRevealed === 0) return null;

  return (
    <>
      {attempts > 0 ? (
        <Tag minimal icon="edit" htmlTitle="Answers submitted">
          {attempts} {pluralize(attempts, 'attempt')}
        </Tag>
      ) : null}
      {hintsRevealed > 0 ? (
        <Tag minimal icon="lightbulb" htmlTitle="Hints opened">
          {hintsRevealed} {pluralize(hintsRevealed, 'hint')}
        </Tag>
      ) : null}
    </>
  );
}

/**
 * What it took, said the way it would be said out loud.
 * @param attempts - How many answers were submitted, this one included.
 * @param hintsRevealed - How many hints were opened.
 * @returns One sentence.
 */
function attemptSummary(attempts: number, hintsRevealed: number): string {
  const tries =
    attempts <= 1 ? 'First attempt' : `${ordinal(attempts)} attempt`;
  const hints =
    hintsRevealed === 0
      ? ''
      : `, with ${hintsRevealed} ${pluralize(hintsRevealed, 'hint')}`;
  return `${tries}${hints}.`;
}

function ordinal(count: number): string {
  const teens = count % 100;
  if (teens >= 11 && teens <= 13) return `${count}th`;
  return `${count}${['th', 'st', 'nd', 'rd'][count % 10] ?? 'th'}`;
}
