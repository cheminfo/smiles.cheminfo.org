import { Button, Card, H5 } from '@blueprintjs/core';
import { useSignals } from '@preact/signals-react/runtime';

import { TUTORIAL_STEPS } from '../../data/tutorial.ts';
import { openStep, view } from '../../state/tutorial.ts';

import StepNavigator from './components/StepNavigator.tsx';
import StepPlayground from './components/StepPlayground.tsx';

/**
 * The guided tour: eighteen stops, each one a working structure the student is
 * free to take apart. Nothing here is a slide — every step lands in the same
 * live box the converter uses.
 * @returns The tutorial page.
 */
export default function TutorialPage() {
  useSignals();
  const index = view.step.value;
  const step = TUTORIAL_STEPS[index];
  if (!step) return null;

  return (
    <div className="tutorial">
      <StepNavigator />
      <Card className="tutorial-step">
        <div className="card-header">
          <H5>
            <span className="tutorial-step-index">{index + 1}.</span>{' '}
            {step.title}
          </H5>
          <div className="tutorial-step-actions">
            <Button
              size="small"
              icon="chevron-left"
              text="Previous"
              disabled={index === 0}
              onClick={() => openStep(index - 1)}
            />
            <Button
              size="small"
              endIcon="chevron-right"
              text="Next"
              intent="primary"
              disabled={index === TUTORIAL_STEPS.length - 1}
              onClick={() => openStep(index + 1)}
            />
          </div>
        </div>
        <StepPlayground step={step} />
      </Card>
    </div>
  );
}
