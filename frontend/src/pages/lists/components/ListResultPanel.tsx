import { Button, Callout, Card, H5, InputGroup, Tag } from '@blueprintjs/core';
import { useSignals } from '@preact/signals-react/runtime';
import { useDeferredValue, useMemo } from 'react';
import { List, useDynamicRowHeight } from 'react-window';

import CopyButton from '../../../components/CopyButton.tsx';
import { data, preferences, view } from '../../../state/lists.ts';
import { isHidden } from '../../../state/shareConfig.ts';
import { describeLayout } from '../describeLayout.ts';
import { download, exportList } from '../exportList.ts';
import { filterRows } from '../filterRows.ts';
import { shownRows } from '../shownRows.ts';

import ListRowView from './ListRowView.tsx';

/**
 * What a row is assumed to be worth before it has been measured. Every row is
 * measured once it is drawn, so this only has to be close enough for the
 * scrollbar to start out sensible.
 */
const ROW_HEIGHT = 100;

/**
 * What came out: a row per structure — the whole list, what the query kept, or
 * what the filter box left of it — and the buttons that take it away.
 * @returns The result panel.
 */
export default function ListResultPanel() {
  useSignals();
  const rows = data.rows.value;
  const hits = view.hits.value;
  const error = view.error.value;
  const keywords = view.filter.value;
  const to = preferences.to.value;

  // Every row is walked here, never on a render of a row, and the typed
  // keywords are deferred so a keystroke does not wait for the walk.
  const deferred = useDeferredValue(keywords);
  const kept = useMemo(() => filterRows(rows, deferred), [rows, deferred]);
  const selected = useMemo(
    () => shownRows(rows, hits, kept),
    [rows, hits, kept],
  );
  const rowHeight = useDynamicRowHeight({ defaultRowHeight: ROW_HEIGHT });

  if (error) {
    return (
      <Card className="fill-card">
        <Callout intent="danger" icon="error">
          {error}
        </Callout>
      </Card>
    );
  }

  if (rows.length === 0) {
    return (
      <Card className="fill-card">
        <Callout intent="primary" icon="th">
          Paste a list on the left and press Convert. Everything happens in this
          page — nothing is uploaded.
        </Callout>
      </Card>
    );
  }

  const failed = rows.length - data.read.value;
  const capped = hits !== null && hits.length >= preferences.limit.value;
  const layout = data.layout.value;
  const read = layout ? describeLayout(layout) : null;

  return (
    <Card className="fill-card">
      <div className="card-header">
        <H5>{countText(rows.length, hits?.length, selected.length)}</H5>
        <div className="draw-header-actions">
          {capped ? (
            <Tag minimal intent="warning">
              stopped at the limit
            </Tag>
          ) : null}
          {hits === null && failed > 0 ? (
            <Tag minimal intent="danger">
              {failed.toLocaleString()} could not be read
            </Tag>
          ) : null}
          {isHidden('export') ? null : (
            <>
              <CopyButton
                size="small"
                text="Copy"
                code={() => exportList(selected, 'text').content}
              />
              <Button
                size="small"
                icon="download"
                text="SMILES"
                onClick={() => download(exportList(selected, 'text'))}
              />
              <Button
                size="small"
                icon="download"
                text="CSV"
                onClick={() => download(exportList(selected, 'csv'))}
              />
              <Button
                size="small"
                icon="download"
                text="SDF"
                onClick={() => download(exportList(selected, 'sdf'))}
              />
            </>
          )}
        </div>
      </div>

      {read ? (
        <Callout compact intent="none" icon="th">
          {read}
        </Callout>
      ) : null}

      <InputGroup
        leftIcon="filter"
        placeholder="Filter by name or field — ethanol, CAS:64-17, “benzoic acid”"
        value={keywords}
        onChange={(event) => (view.filter.value = event.currentTarget.value)}
        rightElement={
          keywords ? (
            <Button
              variant="minimal"
              icon="cross"
              onClick={() => (view.filter.value = '')}
            />
          ) : undefined
        }
        spellCheck={false}
        autoCapitalize="off"
        autoCorrect="off"
        autoComplete="off"
      />

      {selected.length === 0 ? (
        <Callout intent="warning" icon="zoom-out">
          {hits !== null && hits.length === 0
            ? 'Nothing in the list matches. A substructure query has to be contained whole — try a smaller fragment.'
            : 'No row carries what you typed. A keyword matches a name or any field; prefix it with a column name to search that column alone.'}
        </Callout>
      ) : (
        // Only the rows on screen are drawn, so the table takes as long to
        // open on half a million structures as it does on five.
        <List
          className="list-rows"
          rowComponent={ListRowView}
          rowCount={selected.length}
          rowHeight={rowHeight}
          rowProps={{ rows: selected, to }}
          overscanCount={4}
          // A short list is as tall as it needs to be; a long one stops at the
          // screen and scrolls.
          style={{
            height: `min(calc(100vh - 260px), ${selected.length * ROW_HEIGHT}px)`,
          }}
        />
      )}
    </Card>
  );
}

/**
 * What the heading says: how much of the list is on screen, and why it is not
 * all of it.
 * @param total - Every line read.
 * @param hits - How many the query kept, when one ran.
 * @param shown - How many are left after the filter box.
 * @returns The heading.
 */
function countText(
  total: number,
  hits: number | undefined,
  shown: number,
): string {
  const count = total.toLocaleString();
  if (hits === undefined) {
    return shown === total
      ? `${count} structure${total === 1 ? '' : 's'}`
      : `${shown.toLocaleString()} of ${count}`;
  }
  const found = `${hits.toLocaleString()} hit${hits === 1 ? '' : 's'} of ${count}`;
  return shown === hits ? found : `${shown.toLocaleString()} of ${found}`;
}
