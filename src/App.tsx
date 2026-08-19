import { Icon } from '@blueprintjs/core';
import { useSignals } from '@preact/signals-react/runtime';
import { useState } from 'react';
import {
  EcosystemButton,
  NavLink,
  SiteFooter,
  SiteHeader,
  SiteTheme,
} from 'react-cheminfo/ui';

import ShareDialog from './components/share/ShareDialog.tsx';
import AboutPage from './pages/about/AboutPage.tsx';
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
  { page: 'smiles', label: 'SMILES sheet' },
  { page: 'smarts', label: 'SMARTS sheet' },
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
      <SiteTheme siteId="smiles" />
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
    case 'smiles':
      return <ReferencePage notation="smiles" />;
    case 'smarts':
      return <ReferencePage notation="smarts" />;
    case 'specification':
      return <SpecificationPage />;
    case 'about':
      return <AboutPage />;
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
            {/* About leads the utilities on every site of the family, and is a
                real address rather than a dialog: a page is indexed, linkable
                and printable. */}
            <NavLink
              item={{
                id: 'about',
                label: 'About',
                icon: 'info-sign',
                href: withBase('/about'),
                title: 'What this tool is, what it runs on, and how to cite it',
                onSelect: () => navigate('about'),
              }}
              active={props.page === 'about'}
            />
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
      {props.page === 'about' ? null : (
        <p className="app-tagline no-print">a molecule, written on one line</p>
      )}
      {isSharing ? (
        <ShareDialog isOpen onClose={() => setSharing(false)} />
      ) : null}
    </>
  );
}
