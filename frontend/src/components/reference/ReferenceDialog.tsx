import { Button, Dialog, DialogBody, DialogFooter } from '@blueprintjs/core';
import { useRef } from 'react';

import type { Notation } from '../../data/reference.ts';
import { referenceSectionsFor } from '../../data/reference.ts';

import ReferenceContents from './ReferenceContents.tsx';
import ReferenceSectionCard from './ReferenceSectionCard.tsx';

/** The id a section takes inside the dialog, which is never an address. */
const DOM_ID_PREFIX = 'cheatsheet-';

/**
 * The cheatsheet, without leaving what one is in the middle of.
 *
 * It is the sheet itself — the same blocks, the same hover cards — narrowed to
 * the notation the question is about and read down one column with the
 * contents beside it. A student stuck on a ring closure should not have to
 * leave the exercise, and coming back to a page one has navigated away from
 * costs the drawing on the canvas.
 * @param props - Which notations to show and how the dialog is closed.
 * @returns The cheatsheet dialog.
 */
export default function ReferenceDialog(props: {
  notations: Notation[];
  onClose: () => void;
}) {
  const pane = useRef<HTMLDivElement>(null);
  const sections = referenceSectionsFor(props.notations);

  return (
    <Dialog
      isOpen
      onClose={props.onClose}
      title="Cheatsheet"
      icon="th"
      className="cheatsheet-dialog"
    >
      <DialogBody className="cheatsheet-dialog-body">
        <ReferenceContents
          sections={sections}
          className="reference-contents cheatsheet-dialog-contents"
          onPick={(id) => {
            pane.current
              ?.querySelector(`#${CSS.escape(DOM_ID_PREFIX + id)}`)
              ?.scrollIntoView({ block: 'start' });
          }}
        />
        <div className="cheatsheet-dialog-sections" ref={pane}>
          {sections.map((section) => (
            <ReferenceSectionCard
              key={section.id}
              section={section}
              id={DOM_ID_PREFIX + section.id}
              addressable={false}
            />
          ))}
        </div>
      </DialogBody>
      <DialogFooter
        actions={
          <>
            {/* In a tab of its own: leaving the page for the sheet would
                throw away whatever is on the canvas. */}
            <Button
              icon="share"
              text="The whole sheet, in a new tab"
              onClick={() =>
                globalThis.open('/reference', '_blank', 'noopener')
              }
            />
            <Button
              intent="primary"
              text="Close the sheet"
              onClick={props.onClose}
            />
          </>
        }
      />
    </Dialog>
  );
}
