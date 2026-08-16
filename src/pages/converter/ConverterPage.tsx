import { Card, H5 } from '@blueprintjs/core';
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
          {isHidden('about') ? null : <AboutPanel />}
        </div>
      </div>
    </>
  );
}

function AboutPanel() {
  return (
    <Card className="prose-card">
      <H5>Both directions, in your browser</H5>
      <p>
        Draw a structure and its SMILES appears. Write a SMILES and the
        structure appears. Nothing is uploaded: the whole conversion runs in
        this page, on{' '}
        <a
          href="https://github.com/cheminfo/openchemlib-js"
          target="_blank"
          rel="noreferrer"
        >
          openchemlib
        </a>{' '}
        — a JavaScript port of{' '}
        <a
          href="https://github.com/Actelion/openchemlib"
          target="_blank"
          rel="noreferrer"
        >
          the Java library
        </a>{' '}
        written by Thomas Sander.
      </p>
      <p>
        A <b>canonical</b> SMILES is the one string a toolkit picks out of the
        many that describe the same molecule, so two people who wrote a molecule
        differently can still tell they meant the same one. That is what makes
        the exercises gradable, and it is the subject of the second SMILES
        paper.
      </p>
      <p className="muted">
        Weininger, D.{' '}
        <i>
          SMILES, a chemical language and information system. 1. Introduction to
          methodology and encoding rules.
        </i>{' '}
        J. Chem. Inf. Comput. Sci. <b>1988</b>, 28, 31–36.{' '}
        <a
          href="https://doi.org/10.1021/ci00057a005"
          target="_blank"
          rel="noreferrer"
        >
          10.1021/ci00057a005
        </a>
      </p>
      <p className="muted">
        Sander, T.; Freyss, J.; von Korff, M.; Reich, J. R.; Rufener, C.{' '}
        <i>
          OSIRIS, an entirely in-house developed drug discovery informatics
          system.
        </i>{' '}
        J. Chem. Inf. Model. <b>2009</b>, 49, 232–246.{' '}
        <a
          href="https://doi.org/10.1021/ci800305f"
          target="_blank"
          rel="noreferrer"
        >
          10.1021/ci800305f
        </a>
      </p>
    </Card>
  );
}
