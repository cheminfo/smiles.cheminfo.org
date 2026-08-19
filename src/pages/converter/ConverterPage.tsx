import { useSignals } from '@preact/signals-react/runtime';

import { view } from '../../state/converter.ts';
import { isHidden } from '../../state/shareConfig.ts';

import DrawPanel from './components/DrawPanel.tsx';
import KindTabs from './components/KindTabs.tsx';
import NotationPanel from './components/NotationPanel.tsx';
import ReactionResultPanel from './components/ReactionResultPanel.tsx';
import ResultPanel from './components/ResultPanel.tsx';

/**
 * The converter: a structure drawn on the left, the same structure written on
 * the right, and neither one in charge.
 * @returns The converter page.
 */
export default function ConverterPage() {
  useSignals();
  const isReaction = view.kind.value === 'reaction';

  return (
    <>
      {isHidden('kinds') ? null : <KindTabs />}
      <div className="converter">
        {isHidden('editor') ? null : (
          <div className="panel-stack">
            <DrawPanel />
          </div>
        )}
        <div className="panel-stack">
          <NotationPanel />
          {isReaction ? <ReactionResultPanel /> : <ResultPanel />}
        </div>
      </div>
    </>
  );
}
