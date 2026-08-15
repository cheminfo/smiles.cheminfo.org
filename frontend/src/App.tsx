import { Icon } from '@blueprintjs/core';
import { useSignals } from '@preact/signals-react/runtime';
import { useState } from 'react';

import { BrandMark, Wordmark } from './components/Brand.tsx';
import ShareDialog from './components/share/ShareDialog.tsx';
import ConverterPage from './pages/converter/ConverterPage.tsx';
import ExercisesPage from './pages/exercises/ExercisesPage.tsx';
import ListsPage from './pages/lists/ListsPage.tsx';
import ReferencePage from './pages/reference/ReferencePage.tsx';
import SpecificationPage from './pages/specification/SpecificationPage.tsx';
import TutorialPage from './pages/tutorial/TutorialPage.tsx';
import type { Page } from './state/router.ts';
import { navigate, route } from './state/router.ts';
import { isEmbedded } from './state/shareConfig.ts';

const TABS: Array<{ page: Page; label: string }> = [
  { page: 'converter', label: 'Converter' },
  { page: 'lists', label: 'Lists & search' },
  { page: 'tutorial', label: 'Tutorial' },
  { page: 'exercises', label: 'Exercises' },
  { page: 'reference', label: 'Cheatsheet' },
  { page: 'specification', label: 'Specification' },
];

/**
 * Application shell: the header, the pages, and nothing else. Framed in a
 * course, the header is left out so the activity gets the whole surface.
 * @returns The application component.
 */
export default function App() {
  useSignals();
  const page = route.page.value;

  return (
    <>
      {isEmbedded() ? null : <Header page={page} />}
      <div className="page">
        <CurrentPage page={page} />
      </div>
    </>
  );
}

function CurrentPage(props: { page: Page }) {
  switch (props.page) {
    case 'lists':
      return <ListsPage />;
    case 'tutorial':
      return <TutorialPage />;
    case 'exercises':
      return <ExercisesPage />;
    case 'reference':
      return <ReferencePage />;
    case 'specification':
      return <SpecificationPage />;
    case 'converter':
      return <ConverterPage />;
    // no default
  }
}

function Header(props: { page: Page }) {
  const [isSharing, setSharing] = useState(false);

  return (
    <>
      <header className="app-header no-print">
        <div className="app-header__inner">
          <a href="/" className="brand" title="smiles.cheminfo.org">
            <BrandMark />
            <Wordmark />
          </a>
          <nav className="page-nav">
            {TABS.map((tab) => (
              <button
                key={tab.page}
                type="button"
                className={
                  tab.page === props.page
                    ? 'nav-link nav-link--active'
                    : 'nav-link'
                }
                onClick={() => navigate(tab.page)}
              >
                {tab.label}
              </button>
            ))}
            <a className="nav-link" href="/docs">
              API
            </a>
            <button
              type="button"
              className="nav-link"
              title="Share a link to this page, or frame it in your own site"
              onClick={() => setSharing(true)}
            >
              <Icon icon="share" size={14} />
              Share
            </button>
          </nav>
        </div>
      </header>
      <p className="app-tagline no-print">a molecule, written on one line</p>
      {isSharing ? (
        <ShareDialog isOpen onClose={() => setSharing(false)} />
      ) : null}
    </>
  );
}
