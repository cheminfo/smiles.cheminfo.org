import { Button, Card, H5 } from '@blueprintjs/core';
import { useSignals } from '@preact/signals-react/runtime';
import { StructureEditor } from 'react-cheminfo/structure';

import {
  setDrawn,
  setInput,
  setReactionDrawn,
  view,
} from '../../../state/converter.ts';
import { isHidden } from '../../../state/shareConfig.ts';

import ExampleMenu from './ExampleMenu.tsx';

/**
 * The drawing half of the converter. What is drawn becomes the notation on the
 * right on every stroke; there is no button, because the point of the page is
 * that the two are the same thing said twice.
 * @returns The drawing panel.
 */
export default function DrawPanel() {
  useSignals();
  const kind = view.kind.value;
  const isReaction = kind === 'reaction';

  return (
    <Card className="fill-card draw-card">
      <div className="card-header">
        <H5>{isReaction ? 'Draw the reaction' : 'Draw it'}</H5>
        <div className="draw-header-actions">
          {isHidden('examples') ? null : <ExampleMenu />}
          <Button
            size="small"
            icon="eraser"
            text="Clear"
            onClick={() => setInput('')}
          />
        </div>
      </div>
      <StructureEditor
        className="structure-editor"
        // The editor owns the drawing while it is being made, so it is
        // replaced rather than driven: only a structure that came from
        // somewhere else bumps the revision.
        revision={view.editorRevision.value}
        mode={isReaction ? 'reaction' : 'molecule'}
        fragment={kind === 'query'}
        value={view.editorIdCode.value}
        // Every stroke is written in the box at once, and a tab switch reads
        // the box back into the canvas.
        debounce={0}
        onChange={(change) => {
          if (change.mode === 'reaction') setReactionDrawn(change.smiles);
          else setDrawn(change.idCode);
        }}
        minHeight={380}
      />
    </Card>
  );
}
