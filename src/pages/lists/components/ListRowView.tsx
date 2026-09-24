import { useMemo } from 'react';
import { ClickToCopy, CopyButton } from 'react-cheminfo/ui';
import { MF } from 'react-mf';
import type { RowComponentProps } from 'react-window';

import { writeMolecule } from '../../../chemistry/describe.ts';
import type { OutputFormat } from '../../../chemistry/types.ts';
import StructureView from '../../../components/StructureView.tsx';
import { outputFormatLabel } from '../outputFormats.ts';
import type { ShownRow } from '../shownRows.ts';

export interface ListRowsProps {
  rows: ShownRow[];
  to: OutputFormat;
}

/**
 * One line of the list: its drawing, what it converts to, and everything the
 * file said about it.
 *
 * Rendered by `react-window`, so this is called for the twenty or so rows on
 * screen out of however many the list holds. The row is not memoised on the
 * list: `rows` changes whenever a query or a filter narrows it, and the index
 * a row sits at changes with it.
 * @param props - The index to draw, the style that places it, and the rows.
 * @returns The row.
 */
export default function ListRowView(props: RowComponentProps<ListRowsProps>) {
  const { index, style, rows, to } = props;
  const entry = rows[index];
  const molecule = entry?.row.molecule;
  const output = useMemo(
    () => (molecule ? writeMolecule(molecule, to) : ''),
    [molecule, to],
  );

  if (!entry) return null;
  const { row, matched } = entry;

  if (!molecule) {
    return (
      <div style={style} className="list-row-slot">
        <div className="list-row list-row--failed">
          <span className="list-row-line">{row.line}</span>
          <div className="list-row-body">
            <code>{row.input}</code>
            <span className="list-row-error">{row.error}</span>
            <RowFields fields={row.fields} />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={style} className="list-row-slot">
      <div className="list-row">
        <span className="list-row-line">{row.line}</span>
        <StructureView
          molecule={molecule}
          width={110}
          height={80}
          atomHighlight={matched}
        />
        <div className="list-row-body">
          {row.label ? (
            <b>
              <ClickToCopy value={row.label} label="name">
                {row.label}
              </ClickToCopy>
            </b>
          ) : null}
          <ClickToCopy
            as="code"
            className="list-row-output"
            value={output}
            label={outputFormatLabel(to)}
            focusable={false}
          >
            {output}
          </ClickToCopy>
          {row.mf === undefined ? (
            <span className="muted">a query, so no formula</span>
          ) : (
            <span className="muted">
              <ClickToCopy value={row.mf} label="molecular formula">
                <MF mf={row.mf} />
              </ClickToCopy>{' '}
              ·{' '}
              <ClickToCopy
                value={row.mw === undefined ? '' : row.mw.toFixed(2)}
                label="average mass"
                disabled={row.mw === undefined}
              >
                {row.mw?.toFixed(2)} g/mol
              </ClickToCopy>
            </span>
          )}
          <RowFields fields={row.fields} />
        </div>
        <CopyButton small content={output} />
      </div>
    </div>
  );
}

/**
 * Everything else the row carried — every column of the file that was not the
 * structure or its name, all of them, because a column a chemist kept is a
 * column they want to see beside the molecule.
 * @param props - The fields, when the row has any.
 * @returns The fields, or nothing.
 */
function RowFields(props: { fields?: Record<string, string> }) {
  if (!props.fields) return null;
  return (
    <span className="list-row-fields">
      {Object.entries(props.fields).map(([name, value]) => (
        <span key={name}>
          <span className="list-row-field-name">{name}</span>{' '}
          <ClickToCopy value={value} label={name}>
            {value}
          </ClickToCopy>
        </span>
      ))}
    </span>
  );
}
