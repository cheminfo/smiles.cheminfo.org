import { Card } from '@blueprintjs/core';
import { useSignals } from '@preact/signals-react/runtime';

import type { StructureKind } from '../../../chemistry/types.ts';
import { setKind, view } from '../../../state/converter.ts';

interface KindTab {
  kind: StructureKind;
  label: string;
  /** What this tab is for, in the words of someone who has not met it. */
  hint: string;
}

const TABS: KindTab[] = [
  {
    kind: 'molecule',
    label: 'Molecule',
    hint: 'One structure: a SMILES, a molfile or an idCode.',
  },
  {
    kind: 'query',
    label: 'Query (SMARTS)',
    hint: 'A pattern to search with. Read as SMARTS even when it would also parse as a SMILES.',
  },
  {
    kind: 'reaction',
    label: 'Reaction',
    hint: 'Reactants > agents > products, as a reaction SMILES, an RXN file or a reaction idCode.',
  },
];

/**
 * Which of the three things the page is converting.
 *
 * They are tabs rather than a guess, because the difference between them is
 * not always in the text: `CC` is ethane and it is also a query for two bonded
 * carbons, and only the person typing it knows which they meant.
 * @returns The tab strip.
 */
export default function KindTabs() {
  useSignals();
  const current = view.kind.value;

  return (
    <Card className="kind-tabs">
      {TABS.map((tab) => (
        <button
          key={tab.kind}
          type="button"
          title={tab.hint}
          className={`kind-tab${tab.kind === current ? ' kind-tab--active' : ''}`}
          aria-pressed={tab.kind === current}
          onClick={() => setKind(tab.kind)}
        >
          {tab.label}
        </button>
      ))}
    </Card>
  );
}
