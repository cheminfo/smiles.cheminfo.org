import { Card } from '@blueprintjs/core';
import { useSignals } from '@preact/signals-react/runtime';

import type { ExerciseLevel } from '../../../data/tutorial.ts';
import { TUTORIAL_LEVELS, TUTORIAL_STEPS } from '../../../data/tutorial.ts';
import { openStep, view } from '../../../state/tutorial.ts';

/**
 * The whole tour on one strip: three coloured bands, one per level, each
 * holding the numbers of its steps.
 *
 * A student sees where they are, how much is left, and — because the bands are
 * named — what kind of thing is coming, all without opening anything.
 * @returns The step navigator.
 */
export default function StepNavigator() {
  useSignals();
  const current = view.step.value;

  return (
    <Card className="tutorial-nav no-print">
      {TUTORIAL_LEVELS.map((level) => (
        <div
          key={level.level}
          className="tutorial-nav-row"
          style={{ background: level.background }}
        >
          <span className="tutorial-nav-label">{level.label}</span>
          <div className="tutorial-nav-steps">
            {stepsOf(level.level).map(({ step, index }) => (
              <button
                key={step.title}
                type="button"
                title={step.title}
                className={
                  index === current
                    ? 'tutorial-nav-step tutorial-nav-step--active'
                    : 'tutorial-nav-step'
                }
                style={
                  index === current
                    ? { background: level.activeBackground }
                    : undefined
                }
                onClick={() => openStep(index)}
              >
                {index + 1}
              </button>
            ))}
          </div>
        </div>
      ))}
    </Card>
  );
}

function stepsOf(level: ExerciseLevel) {
  const steps: Array<{ step: (typeof TUTORIAL_STEPS)[number]; index: number }> =
    [];
  for (let index = 0; index < TUTORIAL_STEPS.length; index++) {
    const step = TUTORIAL_STEPS[index];
    if (step?.level === level) steps.push({ step, index });
  }
  return steps;
}
