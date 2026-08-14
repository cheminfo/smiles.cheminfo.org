import { Button, Card, H5, Tag } from '@blueprintjs/core';
import { useSignals } from '@preact/signals-react/runtime';
import { useState } from 'react';
import { MF } from 'react-mf';

import { readInput } from '../../../chemistry/readInput.ts';
import CopyButton from '../../../components/CopyButton.tsx';
import GlossaryText from '../../../components/GlossaryText.tsx';
import SmilesThumb from '../../../components/SmilesThumb.tsx';
import StructureView from '../../../components/StructureView.tsx';
import ReferenceDialog from '../../../components/reference/ReferenceDialog.tsx';
import type { Notation } from '../../../data/reference.ts';
import type { Exercise } from '../../../exercises/types.ts';
import { levelOf } from '../../../exercises/validate.ts';
import { view } from '../../../state/exercises.ts';

/**
 * What is being asked.
 *
 * A `write` question shows the structure and never the string; a `draw`
 * question shows the string and never the structure. Showing both would be
 * showing the answer.
 * @param props - The exercise.
 * @returns The question panel.
 */
export default function QuestionPanel(props: { exercise: Exercise }) {
  useSignals();
  const { exercise } = props;
  const level = levelOf(exercise);
  const [cheatsheet, setCheatsheet] = useState(false);
  // A question about a query is a question about both notations, because a
  // SMARTS is a SMILES with more said about its atoms. A question about a
  // molecule is not helped by a column of recursive SMARTS.
  const notations: Notation[] =
    exercise.kind === 'smarts' ? ['smiles', 'smarts'] : ['smiles'];

  return (
    <Card className="question-card">
      <div className="card-header">
        <H5>{exercise.title}</H5>
        <div className="card-header-actions">
          <Tag
            minimal
            intent={
              level === 'beginner'
                ? 'success'
                : level === 'intermediate'
                  ? 'warning'
                  : 'danger'
            }
          >
            {level}
          </Tag>
          <Button
            size="small"
            icon="th"
            text="Cheatsheet"
            title={
              notations.length === 1
                ? 'The SMILES notation, without leaving the question'
                : 'The SMILES and SMARTS notation, without leaving the question'
            }
            onClick={() => setCheatsheet(true)}
          />
        </div>
      </div>
      {cheatsheet ? (
        <ReferenceDialog
          notations={notations}
          onClose={() => setCheatsheet(false)}
        />
      ) : null}

      {exercise.description ? (
        <p>
          <GlossaryText text={exercise.description} />
        </p>
      ) : null}

      {exercise.kind === 'write' ? (
        <WriteQuestion smiles={exercise.smiles} />
      ) : null}
      {exercise.kind === 'draw' ? (
        <DrawQuestion smiles={exercise.smiles} />
      ) : null}
      {exercise.kind === 'smarts' ? (
        <SmartsQuestion exercise={exercise} />
      ) : null}
    </Card>
  );
}

function WriteQuestion(props: { smiles: string }) {
  const result = readInput(props.smiles);
  if (!result.ok) return null;

  return (
    <>
      <p className="muted">Write the SMILES of this molecule.</p>
      <div className="question-structure">
        <StructureView molecule={result.molecule} width={360} height={260} />
      </div>
      <p className="muted">
        <MF mf={result.structure.mf} /> · {result.structure.mw.toFixed(2)} g/mol
      </p>
    </>
  );
}

function DrawQuestion(props: { smiles: string }) {
  return (
    <>
      <p className="muted">Draw the molecule this SMILES describes.</p>
      <div className="question-smiles">
        <code>{props.smiles}</code>
        <CopyButton size="small" code={props.smiles} />
      </div>
    </>
  );
}

function SmartsQuestion(props: {
  exercise: Extract<Exercise, { kind: 'smarts' }>;
}) {
  useSignals();
  const marked = view.verdict.value;
  const results = marked?.cases;

  return (
    <>
      <p className="muted">
        Write a SMARTS that matches every molecule on the left and none on the
        right, then submit it to see which molecules fall where.
      </p>
      <div className="case-columns">
        <CaseColumn
          title="Must match"
          tone="match"
          cases={props.exercise.cases.filter((one) => one.shouldMatch)}
          results={results}
        />
        <CaseColumn
          title="Must not match"
          tone="reject"
          cases={props.exercise.cases.filter((one) => !one.shouldMatch)}
          results={results}
        />
      </div>
    </>
  );
}

function CaseColumn(props: {
  title: string;
  tone: 'match' | 'reject';
  cases: Array<{ smiles: string; label?: string }>;
  results?: Array<{
    case: { smiles: string };
    passed: boolean;
    reason: string;
  }>;
}) {
  return (
    <div className={`case-column case-column--${props.tone}`}>
      <h6>{props.title}</h6>
      {props.cases.map((one) => {
        const result = props.results?.find(
          (candidate) => candidate.case.smiles === one.smiles,
        );
        const state = result ? (result.passed ? 'pass' : 'fail') : 'idle';
        return (
          <figure key={one.smiles} className={`case-cell case-cell--${state}`}>
            <SmilesThumb smiles={one.smiles} width={130} height={90} />
            <figcaption title={result?.reason}>
              {one.label ?? one.smiles}
            </figcaption>
          </figure>
        );
      })}
    </div>
  );
}
