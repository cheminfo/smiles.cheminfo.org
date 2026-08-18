import { effect } from '@preact/signals-react';
import { StrictMode } from 'react';
import { startDocumentMeta } from 'react-cheminfo/core';
import { createRoot } from 'react-dom/client';

import '@blueprintjs/core/lib/css/blueprint.css';
import '@blueprintjs/icons/lib/css/blueprint-icons.css';
import App from './App.tsx';
import { readAddress as readConverterAddress } from './state/converter.ts';
import { loadProgress } from './state/exerciseProgress.ts';
import { readAddress as readExercisesAddress } from './state/exercises.ts';
import { readAddress as readListsAddress } from './state/lists.ts';
import { route } from './state/router.ts';
import { SITE_ROUTES, indexedPath } from './state/routes.ts';
import { readAddress as readTutorialAddress } from './state/tutorial.ts';
import './index.css';

// Before the first paint, so a link opens on what it names rather than on the
// last thing this browser looked at. What was found comes back first, because
// an exercise opens on the answer it was left with.
await loadProgress();
readConverterAddress();
readListsAddress();
readTutorialAddress();
readExercisesAddress();

const container = document.querySelector('#root');
if (container) {
  startDocumentMeta({
    site: 'smiles',
    routes: SITE_ROUTES,
    url: () => indexedPath(route.path.value),
    follow: effect,
  });

  createRoot(container).render(
    <StrictMode>
      <App />
    </StrictMode>,
  );
}
