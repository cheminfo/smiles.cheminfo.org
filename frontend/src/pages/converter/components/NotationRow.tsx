import CopyButton from '../../../components/CopyButton.tsx';

interface NotationRowProps {
  label: string;
  /** Why this notation exists, for someone meeting it for the first time. */
  hint: string;
  text: string;
  /**
   * Show the value as a block that scrolls rather than one that grows: a
   * reaction file is a hundred lines and would bury everything under it.
   * @default false
   */
  block?: boolean;
}

/**
 * One notation of the structure in the box, with a button to take it away.
 * @param props - The notation and how to label it.
 * @returns The row.
 */
export default function NotationRow(props: NotationRowProps) {
  const { label, hint, text, block = false } = props;
  return (
    <div className="notation-row">
      <div className="notation-row-header">
        <span className="notation-row-label" title={hint}>
          {label}
        </span>
        <CopyButton size="small" code={text} title={`Copy the ${label}`} />
      </div>
      <code
        className={`notation-row-value${block ? ' notation-row-value--block' : ''}`}
      >
        {text}
      </code>
    </div>
  );
}
