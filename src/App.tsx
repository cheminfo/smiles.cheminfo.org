import { Icon } from '@blueprintjs/core';
import { useSignals } from '@preact/signals-react/runtime';
import { useState } from 'react';
import { EcosystemButton, SiteFooter, SiteHeader } from 'react-cheminfo/ui';

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
import { withBase } from './state/site.ts';

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
      <SiteFooter siteId="smiles" embedded={isEmbedded()} />
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
      <SiteHeader
        siteId="smiles"
        homeHref={withBase('/')}
        activeId={props.page}
        nav={TABS.map((tab) => ({
          id: tab.page,
          label: tab.label,
          onSelect: () => navigate(tab.page),
        }))}
        actions={
          <>
            <EcosystemButton currentSiteId="smiles" />
            <button
              type="button"
              className="nav-link"
              title="Share a link to this page, or frame it in your own site"
              onClick={() => setSharing(true)}
            >
              <Icon icon="share" size={14} />
              Share
            </button>
          </>
        }
      />
      <p className="app-tagline no-print">a molecule, written on one line</p>
      {isSharing ? (
        <ShareDialog isOpen onClose={() => setSharing(false)} />
      ) : null}
    </>
  );
}
