import { Button } from '@blueprintjs/core';
import { useEffect, useRef, useState } from 'react';

/** How long the button says it copied, in milliseconds. */
const CONFIRMATION = 1500;

/**
 * A button that puts a piece of text on the clipboard and says so.
 * @param props - The text to copy, what the button reads, and its size.
 * @returns The copy button component.
 */
export default function CopyButton(props: {
  /**
   * What to copy. A function is called when the button is pressed, which is
   * what a whole list has to be: writing ten thousand structures out on every
   * render, for a button nobody may press, is a page that stutters as it is
   * scrolled.
   */
  code: string | (() => string);
  /** Left out for an icon-only button, which is what a dense row of them needs. */
  text?: string;
  size?: 'small' | 'medium' | 'large';
  title?: string;
  /**
   * Nothing to copy.
   * @default false
   */
  disabled?: boolean;
}) {
  const [copied, setCopied] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);

  useEffect(() => () => clearTimeout(timer.current), []);

  return (
    <Button
      size={props.size}
      disabled={props.disabled}
      title={props.title ?? 'Copy'}
      icon={copied ? 'tick' : 'duplicate'}
      intent={copied ? 'success' : 'none'}
      text={
        props.text === undefined ? undefined : copied ? 'Copied' : props.text
      }
      onClick={() => {
        const code =
          typeof props.code === 'function' ? props.code() : props.code;
        void navigator.clipboard.writeText(code);
        setCopied(true);
        clearTimeout(timer.current);
        timer.current = setTimeout(() => setCopied(false), CONFIRMATION);
      }}
    />
  );
}
