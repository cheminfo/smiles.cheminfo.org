import {
  Button,
  Checkbox,
  Dialog,
  DialogBody,
  DialogFooter,
  H6,
} from '@blueprintjs/core';
import { useSignals } from '@preact/signals-react/runtime';
import { useState } from 'react';

import { EXERCISES_PARAM, SET_PARAM, data } from '../../state/exercises.ts';
import { PATHS, route } from '../../state/router.ts';
import type { HideKey, ShareConfig } from '../../state/shareConfig.ts';
import {
  SHARE_PARAM_KEYS,
  applyShareConfig,
  isShareConfigured,
  shareConfig,
  stringifyParams,
} from '../../state/shareConfig.ts';
import {
  defaultShareConfig,
  shareOptionsOf,
} from '../../state/shareOptions.ts';
import CodeBlock from '../CodeBlock.tsx';
import CopyButton from '../CopyButton.tsx';

import ShareExerciseSet from './ShareExerciseSet.tsx';

/**
 * Build a link to the page as it is set up now, and the iframe that frames it
 * in a course. What the page is working on comes from the address; what an
 * embedder may change comes from this dialog.
 * @param props - Whether the dialog is open, and how to dismiss it.
 * @returns The share dialog component.
 */
export default function ShareDialog(props: {
  isOpen: boolean;
  onClose: () => void;
}) {
  useSignals();
  const options = shareOptionsOf(route.page.value);
  // The dialog opens on the link one actually hands out — a tile inside a
  // course, without the parts that course has no use for. A page already
  // running a configuration shows that one instead of resetting it.
  const [draft, setDraft] = useState<ShareConfig>(() =>
    isShareConfigured(shareConfig.value)
      ? shareConfig.value
      : defaultShareConfig(options),
  );
  // Until the teacher touches the list, the link hands out the whole set —
  // derived rather than copied at mount, so a set still loading when the
  // dialog opens does not leave it ticking nothing.
  const [chosen, setChosen] = useState<string[] | null>(null);
  const selected =
    chosen ?? data.set.value.exercises.map((exercise) => exercise.id);

  function setHidden(key: HideKey, hidden: boolean): void {
    setDraft((previous) => {
      const rest = previous.hidden.filter((entry) => entry !== key);
      return { ...previous, hidden: hidden ? [...rest, key] : rest };
    });
  }

  const hidden = new Set(draft.hidden);
  const url = buildUrl(draft, options.hasExercises ? selected : null);

  return (
    <Dialog
      isOpen={props.isOpen}
      onClose={props.onClose}
      title="Share or embed"
      icon="share"
      className="share-dialog"
    >
      {/* The link is what one came for, so it sits outside the scrolling body:
          always in view, and showing what every box below does to it. */}
      <div className="share-link">
        <p className="muted share-link-intro">
          A link to <b>{options.title}</b> as you have it set up now.
        </p>
        <CodeBlock code={url} />
        <div className="share-link-actions">
          <CopyButton code={url} text="Copy the link" />
          <Button
            icon="share"
            text="Open in a new tab"
            onClick={() => globalThis.open(url, '_blank', 'noopener')}
          />
          {/* The markup itself is never read: it is pasted. */}
          <CopyButton
            code={buildIframe(url, options.title)}
            text="Copy the iframe"
          />
        </div>
      </div>
      <DialogBody>
        <section className="share-section">
          <H6>Layout</H6>
          <Checkbox
            checked={draft.embed}
            label="Frame it: no header, no navigation"
            onChange={(event) => {
              const embed = event.currentTarget.checked;
              setDraft((previous) => ({ ...previous, embed }));
            }}
          />
        </section>

        {options.features.length > 0 ? (
          <section className="share-section">
            <H6>Show on the page</H6>
            {options.features.map((feature) => (
              <div key={feature.key} className="share-feature">
                <Checkbox
                  checked={!hidden.has(feature.key)}
                  label={feature.label}
                  onChange={(event) =>
                    setHidden(feature.key, !event.currentTarget.checked)
                  }
                />
                <span className="share-hint">{feature.description}</span>
              </div>
            ))}
          </section>
        ) : null}

        {options.hasExercises ? (
          <section className="share-section">
            <H6>Exercises</H6>
            <ShareExerciseSet selected={selected} onChange={setChosen} />
          </section>
        ) : null}
      </DialogBody>
      <DialogFooter
        actions={
          <Button intent="primary" text="Done" onClick={props.onClose} />
        }
      />
    </Dialog>
  );
}

/**
 * The address of the page, with the configuration of the dialog written over
 * whatever the current one carries.
 * @param config - What the dialog holds.
 * @param exercises - The chosen exercises, or null on a page without a set.
 * @returns The absolute address.
 */
function buildUrl(config: ShareConfig, exercises: readonly string[] | null) {
  const params = new URLSearchParams(globalThis.location.search);
  for (const key of SHARE_PARAM_KEYS) params.delete(key);
  applyShareConfig(params, config);
  const chosen = exercises ? applyExercises(params, exercises) : null;

  const search = stringifyParams(params);
  const { origin, pathname } = globalThis.location;
  // A set assembled question by question has no address of its own: the link
  // carries the list, so it opens the page holding them rather than a set the
  // site does not ship.
  return `${origin}${chosen ?? pathname}${search ? `?${search}` : ''}`;
}

/**
 * Write the chosen exercises into the link.
 * @param params - The query string being built.
 * @param exercises - The chosen exercise ids, in the order they were picked.
 * @returns The path the link must open, or null to keep the current one.
 */
function applyExercises(
  params: URLSearchParams,
  exercises: readonly string[],
): string | null {
  const set = data.set.peek();
  const whole = set.exercises.map((exercise) => exercise.id);
  const isWholeSet =
    exercises.length === whole.length &&
    exercises.every((id, index) => id === whole[index]);

  if (isWholeSet && set.id !== 'custom') {
    // The whole set is named by the address itself, which is shorter, readable,
    // and survives the set gaining a question later.
    params.delete(EXERCISES_PARAM);
    params.delete(SET_PARAM);
    return null;
  }

  params.delete(SET_PARAM);
  params.set(EXERCISES_PARAM, exercises.join(','));

  const open = params.get('exercise');
  if (open && exercises.length > 0 && !exercises.includes(open)) {
    params.delete('exercise');
  }
  return PATHS.exercises;
}

function buildIframe(url: string, title: string): string {
  return `<iframe
  src="${url.replaceAll('&', '&amp;')}"
  width="100%"
  height="800"
  style="border: 1px solid #d3d8de; border-radius: 8px"
  title="SMILES — ${title}"
></iframe>`;
}
