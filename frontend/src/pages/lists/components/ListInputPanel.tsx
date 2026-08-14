import {
  Button,
  Card,
  FormGroup,
  H5,
  HTMLSelect,
  Menu,
  MenuItem,
  PopoverNext,
  ProgressBar,
  Tag,
  TextArea,
} from '@blueprintjs/core';
import { useSignals } from '@preact/signals-react/runtime';
import { useRef } from 'react';

import type {
  InputFormat,
  OutputFormat,
} from '../../../../../chemistry/types.ts';
import { LIST_SAMPLES, PLAIN_SAMPLE } from '../../../data/samples/index.ts';
import {
  clearList,
  convertList,
  data,
  preferences,
  stopWork,
  view,
} from '../../../state/lists.ts';
import { isHidden } from '../../../state/shareConfig.ts';

const FROM: Array<{ value: InputFormat; label: string }> = [
  { value: 'auto', label: 'Work it out' },
  { value: 'smiles', label: 'SMILES' },
  { value: 'smarts', label: 'SMARTS' },
  { value: 'molfile', label: 'Molfile' },
  { value: 'idcode', label: 'idCode' },
];

const TO: Array<{ value: OutputFormat; label: string }> = [
  { value: 'smiles', label: 'Canonical SMILES' },
  { value: 'kekule', label: 'Kekulé SMILES' },
  { value: 'smarts', label: 'SMARTS' },
  { value: 'idcode', label: 'idCode' },
  { value: 'molfile', label: 'Molfile' },
  { value: 'molfileV3', label: 'Molfile V3000' },
];

/**
 * Put a file in the box, saying so when it cannot be read.
 * @param file - The dropped or chosen file.
 * @returns When the box holds it.
 */
async function readFile(file: File): Promise<void> {
  try {
    view.input.value = await file.text();
  } catch {
    view.input.value = `# ${file.name} could not be read.`;
  }
}

/**
 * Where the list goes in: a box, a file, and the two format choices.
 * @returns The input panel.
 */
export default function ListInputPanel() {
  useSignals();
  const fileRef = useRef<HTMLInputElement>(null);
  const busy = view.busy.value === 'reading';
  const read = data.read.value;

  return (
    <Card className="fill-card">
      <div className="card-header">
        <H5>Your list</H5>
        <div className="draw-header-actions">
          {read > 0 ? (
            <Tag minimal intent="success">
              {read.toLocaleString()} indexed
            </Tag>
          ) : null}
          <Button
            size="small"
            icon="document-open"
            text="Open a file"
            onClick={() => fileRef.current?.click()}
          />
          <PopoverNext
            placement="bottom-end"
            content={
              <Menu className="example-menu">
                {LIST_SAMPLES.map((sample) => (
                  <MenuItem
                    key={sample.name}
                    text={sample.name}
                    label={sample.label}
                    title={sample.note}
                    onClick={() => (view.input.value = sample.text)}
                  />
                ))}
              </Menu>
            }
          >
            <Button
              size="small"
              icon="lightbulb"
              text="Sample"
              endIcon="caret-down"
            />
          </PopoverNext>
          <Button size="small" icon="eraser" text="Clear" onClick={clearList} />
        </div>
      </div>

      <input
        ref={fileRef}
        type="file"
        accept=".smi,.smiles,.txt,.csv,.tsv,.sdf,.mol"
        hidden
        onChange={(event) => {
          const input = event.currentTarget;
          const file = input.files?.[0];
          input.value = '';
          if (file) void readFile(file);
        }}
      />

      <TextArea
        className="list-input"
        value={view.input.value}
        onChange={(event) => (view.input.value = event.currentTarget.value)}
        placeholder={PLAIN_SAMPLE}
        fill
        spellCheck={false}
        autoCapitalize="off"
        autoCorrect="off"
        autoComplete="off"
        onDrop={(event) => {
          const file = event.dataTransfer.files[0];
          if (!file) return;
          event.preventDefault();
          void readFile(file);
        }}
      />

      {isHidden('options') ? null : (
        <div className="field-row field-row--wrap">
          <FormGroup label="Read as">
            <HTMLSelect
              value={preferences.from.value}
              onChange={(event) =>
                (preferences.from.value = event.currentTarget
                  .value as InputFormat)
              }
              options={FROM}
            />
          </FormGroup>
          <FormGroup label="Write as">
            <HTMLSelect
              value={preferences.to.value}
              onChange={(event) =>
                (preferences.to.value = event.currentTarget
                  .value as OutputFormat)
              }
              options={TO}
            />
          </FormGroup>
        </div>
      )}

      <div className="field-row">
        <Button
          intent="primary"
          icon="play"
          text="Convert"
          loading={busy}
          disabled={!view.input.value.trim()}
          onClick={() => void convertList()}
        />
        {busy ? <Button icon="stop" text="Stop" onClick={stopWork} /> : null}
      </div>

      {busy ? (
        <ProgressBar
          intent="primary"
          value={view.progress.value ?? 0}
          stripes={false}
        />
      ) : null}
    </Card>
  );
}
