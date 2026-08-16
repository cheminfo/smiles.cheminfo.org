import { Button, Menu, MenuItem, PopoverNext } from '@blueprintjs/core';
import { useSignals } from '@preact/signals-react/runtime';

import { examplesFor } from '../../../data/examples.ts';
import { setInput, view } from '../../../state/converter.ts';

/**
 * The examples of whatever tab is open: molecules, patterns or reactions.
 * Clicking one replaces what is on screen, which is what such a menu is mostly
 * used for — trying one after another.
 * @returns The example menu button.
 */
export default function ExampleMenu() {
  useSignals();
  const examples = examplesFor(view.kind.value);

  return (
    <PopoverNext
      placement="bottom-end"
      content={
        <Menu className="example-menu">
          {examples.map((example) => (
            <MenuItem
              key={example.notation}
              text={example.name}
              label={example.notation}
              title={example.note}
              onClick={() => setInput(example.notation)}
            />
          ))}
        </Menu>
      }
    >
      <Button
        size="small"
        icon="lightbulb"
        text="Examples"
        endIcon="caret-down"
      />
    </PopoverNext>
  );
}
