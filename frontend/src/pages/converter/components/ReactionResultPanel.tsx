import { Callout, Card, H5, Tag } from '@blueprintjs/core';
import { useSignals } from '@preact/signals-react/runtime';

import type { ReactionStructure } from '../../../../../chemistry/types.ts';
import { reaction } from '../../../state/converter.ts';
import { isHidden } from '../../../state/shareConfig.ts';

import NotationRow from './NotationRow.tsx';
import ReactionView from './ReactionView.tsx';

interface Row {
  key: keyof Pick<ReactionStructure, 'smiles' | 'idCode' | 'rxn'>;
  label: string;
  hint: string;
  /** Written over many lines, so it is shown in a box that scrolls. */
  block?: boolean;
}

const ROWS: Row[] = [
  {
    key: 'smiles',
    label: 'Reaction SMILES',
    hint: 'Every component canonical and in a fixed order: whatever you wrote, this is what it normalises to.',
  },
  {
    key: 'idCode',
    label: 'Reaction idCode',
    hint: 'openchemlib’s own identifier for the whole reaction, agents and atom mapping included.',
  },
  {
    key: 'rxn',
    label: 'RXN file',
    hint: 'The MDL reaction file, which is what most software exchanges reactions as.',
    block: true,
  },
];

/**
 * Everything the reaction in the box also is: the drawing, what sits on each
 * side, and each notation with a button to take it away.
 * @returns The reaction result panel.
 */
export default function ReactionResultPanel() {
  useSignals();
  const result = reaction.value;

  if (result.ok === null) {
    return (
      <Card className="result-card">
        <Callout intent="primary" icon="flow-linear">
          A reaction is written reactants <code>&gt;</code> agents{' '}
          <code>&gt;</code> products, with both arrows always there. Draw one on
          the left, or write one on the right.
        </Callout>
      </Card>
    );
  }
  if (!result.ok) return null;

  const { structure: value, components } = result;

  return (
    <Card className="result-card">
      <div className="card-header">
        <H5>What it is</H5>
        <div className="draw-header-actions">
          {value.isMapped ? (
            <Tag minimal intent="success" icon="link">
              atom mapped
            </Tag>
          ) : null}
          {value.isQuery ? (
            <Tag minimal intent="warning" icon="search-template">
              a query, not a reaction
            </Tag>
          ) : null}
        </div>
      </div>

      <ReactionView components={components} />

      <dl className="result-facts result-facts--wide">
        <dt>Reactants</dt>
        <dd>{count(components, 'reactant')}</dd>
        <dt>Agents</dt>
        <dd>{count(components, 'catalyst')}</dd>
        <dt>Products</dt>
        <dd>{count(components, 'product')}</dd>
      </dl>

      {(isHidden('formats') ? ROWS.slice(0, 1) : ROWS).map((row) => (
        <NotationRow
          key={row.key}
          label={row.label}
          hint={row.hint}
          text={value[row.key]}
          block={row.block}
        />
      ))}
    </Card>
  );
}

function count(components: Array<{ role: string }>, role: string): number {
  let total = 0;
  for (const component of components) {
    if (component.role === role) total++;
  }
  return total;
}
