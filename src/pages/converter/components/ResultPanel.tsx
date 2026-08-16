import { Button, Callout, Card, H5, Tag, Tooltip } from '@blueprintjs/core';
import { useSignals } from '@preact/signals-react/runtime';
import { MF } from 'react-mf';

import type { Structure } from '../../../chemistry/types.ts';
import StructureView from '../../../components/StructureView.tsx';
import { preferences, structure } from '../../../state/converter.ts';
import { isHidden } from '../../../state/shareConfig.ts';

import NotationRow from './NotationRow.tsx';

interface Row {
  key: keyof Structure;
  label: string;
  /** Why this notation exists, for someone meeting it for the first time. */
  hint: string;
}

const ROWS: Row[] = [
  {
    key: 'smiles',
    label: 'Canonical SMILES',
    hint: 'One molecule, one string: whatever you wrote, this is what it normalises to.',
  },
  {
    key: 'kekule',
    label: 'Kekulé SMILES',
    hint: 'The same molecule with alternating double bonds instead of lowercase aromatic atoms.',
  },
  {
    key: 'smarts',
    label: 'SMARTS',
    hint: 'Read back as a query pattern. openchemlib keeps what it supports and drops the rest, so this is what a search would really look for.',
  },
  {
    key: 'idCode',
    label: 'idCode',
    hint: 'openchemlib’s own canonical identifier. Two structures are the same answer when these match.',
  },
];

/**
 * Everything the structure in the box also is: the drawing, the counts, and
 * each notation with a button to take it away.
 * @returns The result panel.
 */
export default function ResultPanel() {
  useSignals();
  const result = structure.value;

  if (result.ok === null) {
    return (
      <Card className="result-card">
        <Callout intent="primary" icon="draw">
          Draw a structure on the left, or write a SMILES on the right. Whatever
          you do on one side appears on the other.
        </Callout>
      </Card>
    );
  }
  if (!result.ok) return null;

  const { structure: value, molecule } = result;

  return (
    <Card className="result-card">
      <div className="card-header">
        <H5>What it is</H5>
        <div className="draw-header-actions">
          {value.isQuery ? (
            <Tag minimal intent="warning" icon="search-template">
              a query, not a molecule
            </Tag>
          ) : null}
          <Tooltip
            content="Number the rings openchemlib found, on the atoms that are in them. An atom in two rings names both."
            hoverOpenDelay={150}
          >
            <Button
              size="small"
              icon="circle"
              text="Rings"
              active={preferences.showRings.value}
              onClick={() => {
                preferences.showRings.value = !preferences.showRings.peek();
              }}
            />
          </Tooltip>
        </div>
      </div>

      <div className="result-depiction">
        <StructureView
          molecule={molecule}
          width={320}
          height={220}
          showRings={preferences.showRings.value}
        />
        <dl className="result-facts">
          {/* A query fragment has no implicit hydrogens on any atom, so a
              formula and a mass computed from it are both fiction — *CC would
              read C3. They are left out rather than shown wrong. */}
          {value.isQuery ? (
            <>
              <dt>Formula</dt>
              <dd className="muted">
                none — a query says what to look for, not what is there
              </dd>
            </>
          ) : (
            <>
              <dt>Formula</dt>
              <dd>
                <MF mf={value.mf} />
              </dd>
              <dt>Average mass</dt>
              <dd>{value.mw.toFixed(4)} g/mol</dd>
              <dt>Monoisotopic</dt>
              <dd>{value.monoisotopicMass.toFixed(4)} g/mol</dd>
            </>
          )}
          <dt>Atoms · bonds</dt>
          <dd>
            {value.atoms} · {value.bonds}
          </dd>
        </dl>
      </div>

      {(isHidden('formats') ? ROWS.slice(0, 1) : ROWS).map((row) => (
        <NotationRow
          key={row.key}
          label={row.label}
          hint={row.hint}
          text={String(value[row.key])}
        />
      ))}
    </Card>
  );
}
