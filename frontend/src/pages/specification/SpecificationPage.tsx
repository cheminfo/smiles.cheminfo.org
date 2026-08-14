import { Card, H4, Tag } from '@blueprintjs/core';
import { useSignals } from '@preact/signals-react/runtime';
import { useEffect } from 'react';

import { isHidden } from '../../state/shareConfig.ts';
import {
  SPECIFICATION_REPOSITORY,
  SPECIFICATION_SOURCE,
  loadSpecification,
} from '../../state/specification.ts';

import SpecificationArticle from './components/SpecificationArticle.tsx';
import SpecificationContents from './components/SpecificationContents.tsx';

/**
 * The OpenSMILES specification, served from here.
 *
 * It is a copy, not a frame and not a rewrite: the document is imported by
 * `scripts/importSpecification.js` exactly as its authors generated it, and
 * only its stylesheet is this site's. opensmiles.org answers with a
 * certificate for another name, so a browser refuses the original outright —
 * which leaves the definition of the notation this whole site teaches
 * unreachable for most visitors.
 * @returns The specification page.
 */
export default function SpecificationPage() {
  useSignals();

  useEffect(() => {
    void loadSpecification();
  }, []);

  return (
    <div className="specification">
      {isHidden('list') ? null : <SpecificationContents />}
      <div className="specification-body">
        <Card className="prose-card spec-intro no-print">
          <div className="card-header">
            <H4>OpenSMILES specification</H4>
            <Tag minimal>version 1.0 — 2016-05-15</Tag>
          </div>
          <p>
            Craig A. James and the Blue Obelisk contributors, copied here word
            for word under the{' '}
            <a
              href="https://www.gnu.org/licenses/fdl-1.2.html"
              target="_blank"
              rel="noreferrer"
            >
              GNU Free Documentation License 1.2
            </a>
            . This page is a mirror: the specification is theirs, the reading is
            ours.
          </p>
          <p className="muted">
            The original at{' '}
            <a href={SPECIFICATION_SOURCE} target="_blank" rel="noreferrer">
              opensmiles.org
            </a>{' '}
            is served with a certificate issued for another name, so most
            browsers refuse to open it. The document is written and revised at{' '}
            <a href={SPECIFICATION_REPOSITORY} target="_blank" rel="noreferrer">
              github.com/opensmiles/OpenSMILES
            </a>
            .
          </p>
        </Card>
        <SpecificationArticle />
      </div>
    </div>
  );
}
