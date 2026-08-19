import { useSignals } from '@preact/signals-react/runtime';
import { TutorialStepStrip } from 'react-cheminfo/ui';

import {
  TUTORIAL_LEVEL_LABELS,
  TUTORIAL_STEPS,
} from '../../../data/tutorial.ts';
import { openStep, view } from '../../../state/tutorial.ts';

/**
 * The whole tour on one strip: three coloured bands, one per level, each
 * holding the numbers of its steps, then the pager.
 *
 * A student sees where they are, how much is left, and — because the bands are
 * named — what kind of thing is coming, all without opening anything.
 * @returns The step navigator.
 */
export default function StepNavigator() {
  useSignals();

  return (
    <div className="no-print">
      <TutorialStepStrip
        steps={TUTORIAL_STEPS}
        activeIndex={view.step.value}
        onSelect={openStep}
        levelLabels={TUTORIAL_LEVEL_LABELS}
      />
    </div>
  );
}
