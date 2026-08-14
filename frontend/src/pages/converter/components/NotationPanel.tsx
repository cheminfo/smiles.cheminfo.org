import { Button, Callout, Card, H5, Tag, TextArea } from '@blueprintjs/core';
import { useSignals } from '@preact/signals-react/runtime';

import { looksLikeReaction } from '../../../../../chemistry/parseReaction.ts';
import type { StructureKind } from '../../../../../chemistry/types.ts';
import NotationError from '../../../components/NotationError.tsx';
import {
  reaction,
  setInput,
  setKind,
  structure,
  view,
} from '../../../state/converter.ts';
import { isHidden } from '../../../state/shareConfig.ts';

import ExampleMenu from './ExampleMenu.tsx';

const PLACEHOLDERS: Record<StructureKind, string> = {
  molecule: 'CC(=O)Oc1ccccc1C(=O)O',
  query: '[CX3](=O)[OX2H1]',
  reaction: 'CC(=O)O.OCC>[H+]>CC(=O)OCC.O',
};

/**
 * The notation half of the converter: one box, read as you type.
 *
 * There is no Run button. A structure is right or wrong on every keystroke,
 * and a student who has to press something to find out stops pressing it.
 * @returns The notation panel.
 */
export default function NotationPanel() {
  useSignals();
  const kind = view.kind.value;
  const input = view.input.value;
  const result = kind === 'reaction' ? reaction.value : structure.value;
  const readAs = result.ok ? result.structure.readAs : null;

  return (
    <Card className="notation-card">
      <div className="card-header">
        <H5>Write it</H5>
        <div className="draw-header-actions">
          {readAs ? <ReadAsTag format={readAs} kind={kind} /> : null}
          {isHidden('examples') ? null : <ExampleMenu />}
        </div>
      </div>

      <TextArea
        className="notation-input"
        value={input}
        onChange={(event) => setInput(event.currentTarget.value)}
        placeholder={PLACEHOLDERS[kind]}
        autoResize
        fill
        intent={result.ok === false ? 'danger' : 'none'}
        // A mobile keyboard capitalises the first letter, and a capital C is
        // not a lowercase c: every one of these would corrupt a notation.
        spellCheck={false}
        autoCapitalize="off"
        autoCorrect="off"
        autoComplete="off"
      />

      <NotationError
        error={result.ok === false ? result.error : null}
        input={input}
      />

      {result.ok === false ? <WrongTabHint kind={kind} input={input} /> : null}
    </Card>
  );
}

/**
 * Which notation the box turned out to hold. The reading is always worked out,
 * and a guess a page keeps to itself is a guess a student cannot correct: a
 * SMARTS read as a SMILES draws a molecule that is not the query they meant.
 * @param props - The notation that was read.
 * @returns The tag.
 */
function ReadAsTag(props: { format: string; kind: StructureKind }) {
  const { format, kind } = props;
  const isQuery = format === 'smarts';
  return (
    <Tag minimal intent={isQuery ? 'warning' : 'primary'}>
      read as {nameOfFormat(format, kind)}
    </Tag>
  );
}

function nameOfFormat(format: string, kind: StructureKind): string {
  if (format === 'smarts') return 'SMARTS';
  if (kind !== 'reaction') return format;
  if (format === 'rxn') return 'RXN file';
  return format === 'idcode' ? 'reaction idCode' : 'reaction SMILES';
}

/**
 * Say when the text belongs on another tab. An arrow in a box being read as
 * one molecule fails with a parser error about a character, which says nothing
 * about the one thing that is actually wrong.
 * @param props - The open tab and what is in the box.
 * @returns The offer to switch, or nothing when the tab is the right one.
 */
function WrongTabHint(props: { kind: StructureKind; input: string }) {
  const { kind, input } = props;
  const isReaction = looksLikeReaction(input);
  if (isReaction === (kind === 'reaction')) return null;

  const target: StructureKind = isReaction ? 'reaction' : 'molecule';
  return (
    <Callout intent="primary" compact icon="exchange">
      {isReaction
        ? 'This has an arrow in it, so it is a reaction.'
        : 'This has no arrow, so it is a single structure.'}{' '}
      <Button
        variant="minimal"
        size="small"
        onClick={() => setKind(target)}
        text={isReaction ? 'Open the Reaction tab' : 'Open the Molecule tab'}
      />
    </Callout>
  );
}
