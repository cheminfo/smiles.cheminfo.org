import { H5, Icon, PopoverNext } from '@blueprintjs/core';

import type {
  ReferenceEntry,
  ReferenceSection,
} from '../../data/reference/index.ts';
import { anchorHref } from '../../state/site.ts';
import SmilesThumb from '../SmilesThumb.tsx';

import NotationText from './NotationText.tsx';

/**
 * One block of the cheatsheet: its title, its intro and its table of
 * constructs, each row carrying the longer story on hover.
 *
 * The block is the same whether it is being printed on the sheet or read in
 * the dialog an exercise opens, which is why it lives here rather than on the
 * page. Only its address differs: on the sheet a title is a link one can hand
 * out, in a dialog it is not, because the address names the exercise.
 * @param props - The section, the id it takes in the document, and whether the
 * title is a link to it.
 * @returns The section block.
 */
export default function ReferenceSectionCard(props: {
  section: ReferenceSection;
  id: string;
  addressable: boolean;
}) {
  const { section, id, addressable } = props;
  return (
    <section id={id} className="reference-section">
      <H5>
        {addressable ? (
          <a
            className="reference-anchor"
            href={anchorHref(id)}
            title="Link to this section"
          >
            {section.title}
            <Icon className="reference-anchor-icon" icon="link" size={12} />
          </a>
        ) : (
          section.title
        )}
      </H5>
      {section.intro ? (
        <p className="muted">
          <NotationText text={section.intro} />
        </p>
      ) : null}
      <table className="reference-table">
        <tbody>
          {section.entries.map((entry) => (
            <Row key={`${entry.syntax}-${entry.name}`} entry={entry} />
          ))}
        </tbody>
      </table>
    </section>
  );
}

function Row(props: { entry: ReferenceEntry }) {
  const { entry } = props;
  const hasDetail = Boolean(entry.detail ?? entry.exampleSmiles);

  const row = (
    <tr
      className={
        hasDetail ? 'reference-row reference-row--rich' : 'reference-row'
      }
    >
      <td className="reference-syntax">
        <code>{entry.syntax}</code>
      </td>
      <td>
        <NotationText text={entry.summary} />
      </td>
    </tr>
  );

  if (!hasDetail) return row;

  return (
    <PopoverNext
      interactionKind="hover"
      hoverOpenDelay={150}
      placement="right"
      popoverClassName="syntax-popover"
      // A <tr> cannot host a popover target wrapper without breaking the
      // table, so the popover renders inline and targets the row itself.
      renderTarget={({ isOpen: _isOpen, ref, ...targetProps }) => (
        <tr
          {...targetProps}
          ref={ref as React.Ref<HTMLTableRowElement>}
          className={
            hasDetail ? 'reference-row reference-row--rich' : 'reference-row'
          }
        >
          <td className="reference-syntax">
            <code>{entry.syntax}</code>
          </td>
          <td>
            <NotationText text={entry.summary} />
          </td>
        </tr>
      )}
      content={<SyntaxCard entry={entry} />}
    />
  );
}

function SyntaxCard(props: { entry: ReferenceEntry }) {
  const { entry } = props;
  return (
    <div className="syntax-card">
      <div className="syntax-card-header">
        <code>{entry.syntax}</code>
        <span>{entry.name}</span>
      </div>
      <p className="syntax-card-summary">
        <NotationText text={entry.summary} />
      </p>
      {entry.detail ? (
        <p>
          <NotationText text={entry.detail} />
        </p>
      ) : null}
      {entry.exampleSmiles ? (
        <div className="syntax-card-example">
          <code>{entry.exampleSmiles}</code>
          <SmilesThumb smiles={entry.exampleSmiles} width={180} height={120} />
          {entry.exampleNote ? (
            <i>
              <NotationText text={entry.exampleNote} />
            </i>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
