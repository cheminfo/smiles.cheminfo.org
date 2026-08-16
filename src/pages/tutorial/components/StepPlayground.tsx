import { Button, InputGroup, Tag } from '@blueprintjs/core';
import { useSignals } from '@preact/signals-react/runtime';
import { MF } from 'react-mf';

import GlossaryText from '../../../components/GlossaryText.tsx';
import NotationError from '../../../components/NotationError.tsx';
import StructureView from '../../../components/StructureView.tsx';
import type { TutorialStep } from '../../../data/tutorial.ts';
import {
  isUnchanged,
  resetStep,
  structure,
  view,
} from '../../../state/tutorial.ts';

/**
 * One step: the prose, then the structure it teaches, live.
 *
 * The box is not read-only. A step is a starting point — the whole method of
 * the page is that a student changes one character and watches what happens —
 * so the reset button is there to get back, not to stop them leaving.
 * @param props - The step being shown.
 * @returns The playground for that step.
 */
export default function StepPlayground(props: { step: TutorialStep }) {
  useSignals();
  const result = structure.value;
  const input = view.input.value;

  return (
    <>
      <p className="tutorial-description">
        <GlossaryText text={props.step.description} />
      </p>

      <div className="tutorial-playground">
        <div className="tutorial-input">
          <InputGroup
            size="large"
            className="notation-input"
            value={input}
            onChange={(event) => (view.input.value = event.currentTarget.value)}
            intent={result.ok === false ? 'danger' : 'none'}
            spellCheck={false}
            autoCapitalize="off"
            autoCorrect="off"
            autoComplete="off"
            rightElement={
              isUnchanged.value ? undefined : (
                <Button
                  variant="minimal"
                  size="small"
                  icon="undo"
                  title="Put the step’s own structure back"
                  onClick={resetStep}
                />
              )
            }
          />
          <NotationError
            error={result.ok === false ? result.error : null}
            input={input}
          />
          {result.ok ? (
            <div className="tutorial-facts">
              {result.structure.isQuery ? (
                // A fragment has no implicit hydrogens anywhere, so its
                // formula and mass are both meaningless — showing "C3" for
                // *CC would teach the wrong thing outright.
                <Tag minimal intent="warning">
                  a query, so no formula
                </Tag>
              ) : (
                <>
                  <Tag minimal>
                    <MF mf={result.structure.mf} />
                  </Tag>
                  <Tag
                    minimal
                    title="Isotopic labels do not show in the formula, but they do move this"
                  >
                    {result.structure.mw.toFixed(4)} g/mol
                  </Tag>
                </>
              )}
              <Tag minimal>
                {result.structure.atoms} atoms · {result.structure.bonds} bonds
              </Tag>
              {result.structure.smiles === input ? null : (
                <Tag
                  minimal
                  intent="primary"
                  title="What this toolkit writes the same molecule as. Anything it does not keep — an atom class, an explicit [H] — is a thing SMILES records and a structure does not."
                >
                  written back as: {result.structure.smiles}
                </Tag>
              )}
            </div>
          ) : null}
        </div>

        <div className="tutorial-drawing">
          {result.ok ? (
            <StructureView
              molecule={result.molecule}
              width={340}
              height={240}
            />
          ) : (
            <span className="muted">
              The drawing appears as soon as the string reads.
            </span>
          )}
        </div>
      </div>
    </>
  );
}
