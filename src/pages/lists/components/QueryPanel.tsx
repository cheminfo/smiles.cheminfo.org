import {
  Button,
  Card,
  Dialog,
  DialogBody,
  DialogFooter,
  FormGroup,
  H5,
  HTMLSelect,
  InputGroup,
  NumericInput,
  ProgressBar,
} from '@blueprintjs/core';
import { useSignals } from '@preact/signals-react/runtime';
import { useState } from 'react';

import type { SearchMode } from '../../../chemistry/moleculesDatabase.ts';
import { readInput } from '../../../chemistry/readInput.ts';
import NotationError from '../../../components/NotationError.tsx';
import StructureEditor from '../../../components/StructureEditor.tsx';
import {
  clearQuery,
  preferences,
  runSearch,
  stopWork,
  view,
} from '../../../state/lists.ts';
import { isHidden } from '../../../state/shareConfig.ts';

const MODES: Array<{ value: SearchMode; label: string }> = [
  { value: 'substructure', label: 'Contains this' },
  { value: 'exact', label: 'Is exactly this' },
  { value: 'exactNoStereo', label: 'Is this, ignoring stereochemistry' },
  { value: 'similarity', label: 'Ranked by similarity' },
];

/**
 * What to look for in the list: a notation typed, or a fragment drawn.
 *
 * Drawing is how a substructure query is really made — a SMARTS that says
 * "an aromatic ring with an OH on it" takes a chemist longer to write than to
 * sketch — so the canvas is one button away and writes into the same box.
 * @returns The query panel.
 */
export default function QueryPanel() {
  useSignals();
  const [drawing, setDrawing] = useState(false);
  const searching = view.busy.value === 'searching';
  const query = view.query.value;
  const parsed = readInput(query);

  return (
    <Card>
      <div className="card-header">
        <H5>Search the list</H5>
        <div className="draw-header-actions">
          <Button
            size="small"
            icon="draw"
            text="Draw it"
            onClick={() => setDrawing(true)}
          />
          {view.hits.value === null ? null : (
            <Button
              size="small"
              icon="eraser"
              text="Show all"
              onClick={clearQuery}
            />
          )}
        </div>
      </div>

      <InputGroup
        size="large"
        className="notation-input"
        value={query}
        onChange={(event) => (view.query.value = event.currentTarget.value)}
        placeholder="c1ccccc1  or  [CX3](=O)[OX2H1]"
        intent={parsed.ok === false ? 'danger' : 'none'}
        spellCheck={false}
        autoCapitalize="off"
        autoCorrect="off"
        autoComplete="off"
        onKeyDown={(event) => {
          if (event.key === 'Enter') void runSearch();
        }}
      />
      <NotationError
        error={parsed.ok === false ? parsed.error : null}
        input={query}
      />

      {isHidden('options') ? null : (
        <div className="field-row field-row--wrap">
          <FormGroup label="How to match">
            <HTMLSelect
              value={preferences.mode.value}
              onChange={(event) =>
                (preferences.mode.value = event.currentTarget
                  .value as SearchMode)
              }
              options={MODES}
            />
          </FormGroup>
          <FormGroup label="Most hits">
            <NumericInput
              min={1}
              max={5000}
              stepSize={100}
              majorStepSize={1000}
              value={preferences.limit.value}
              onValueChange={(value) => {
                if (Number.isFinite(value)) preferences.limit.value = value;
              }}
            />
          </FormGroup>
        </div>
      )}

      <div className="field-row">
        <Button
          intent="primary"
          icon="search"
          text="Search"
          loading={searching}
          disabled={!query.trim() || !view.input.value.trim()}
          onClick={() => void runSearch()}
        />
        {searching ? (
          <Button icon="stop" text="Stop" onClick={stopWork} />
        ) : null}
      </div>

      {searching ? (
        <ProgressBar intent="primary" value={view.progress.value ?? 0} />
      ) : null}

      {drawing ? <DrawQueryDialog onClose={() => setDrawing(false)} /> : null}
    </Card>
  );
}

function DrawQueryDialog(props: { onClose: () => void }) {
  const [idCode, setIdCode] = useState('');

  return (
    <Dialog
      isOpen
      onClose={props.onClose}
      title="Draw what to look for"
      icon="draw"
      className="fragment-dialog"
    >
      <DialogBody>
        <p className="muted">
          Drawn as a query fragment, so the atoms you leave open stay open — a
          carbon here means “a carbon with anything on it”, not “a methyl”.
        </p>
        <StructureEditor fragment onChange={setIdCode} minHeight={340} />
      </DialogBody>
      <DialogFooter
        actions={
          <>
            <Button text="Cancel" onClick={props.onClose} />
            <Button
              intent="primary"
              text="Use this"
              disabled={!idCode}
              onClick={() => {
                const parsed = readInput(idCode, 'idcode');
                if (parsed.ok) view.query.value = parsed.structure.smarts;
                props.onClose();
              }}
            />
          </>
        }
      />
    </Dialog>
  );
}
