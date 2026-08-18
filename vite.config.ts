import react from '@vitejs/plugin-react';
import { cheminfoPrerender } from 'react-cheminfo/vite';
import { defineConfig } from 'vite';

import { NOSCRIPT_ROUTES, PAGE_ROUTES } from './src/state/routes.ts';
import { configuredSiteUrl } from './src/state/sitePath.ts';

// Both ports derive from a date no sibling has claimed, never from Vite's stock
// 5173, so two checkouts never fight over the same port. The site is served on
// PORT; the dev server takes the one above it.
const sitePort = Number(process.env.PORT ?? 10606);
const devServerPort = Number(process.env.VITE_PORT ?? sitePort + 1);

// The address this build names as its own, for the canonical link, the social
// card and the sitemap. It says nothing about where the build is *mounted* —
// see `base` below — but it does carry the path a mirrored deployment is
// published under, which every absolute address it writes has to start with.
const siteUrl = configuredSiteUrl();

export default defineConfig({
  // The build carries no mount path. Every asset is written relative, so the
  // one `dist` serves the site's own host and a path of a shared one without
  // being rebuilt: the `<base>` the container stamps in at startup is what
  // resolves them, and the page reads its mount back off that.
  base: './',
  plugins: [
    react(),
    cheminfoPrerender({
      site: 'smiles',
      routes: PAGE_ROUTES,
      // The published address, mount path included, so every canonical link,
      // `og:url`, card and sitemap entry starts where the site is served.
      origin: siteUrl,
      // What the tool does, in the words a search result is read in: the line
      // the family menu carries names one of the three things it offers.
      description:
        'Convert between chemical structures and SMILES in both directions, search a list of structures by substructure or SMARTS, and learn the notation through a tutorial and graded exercises.',
      operatingSystem: 'Any',
      noscript: {
        heading: 'smiles.cheminfo.org — structures in, structures out',
        intro:
          'Convert between chemical structures and SMILES in both directions, search a list of structures by substructure or SMARTS, and learn the notation step by step. Everything runs in your browser — no structure you open ever leaves your machine — so the tool needs JavaScript.',
        // The build bakes in no mount, so the crawl path is written against the
        // `<base>` the container stamps in at startup rather than the root of a
        // host this deployment may only share.
        hrefs: 'relative',
        routes: NOSCRIPT_ROUTES,
        ecosystem: { taglines: false },
      },
    }),
  ],
  build: {
    target: 'esnext',
  },
  server: {
    port: devServerPort,
    // Fail loudly rather than drifting to the next free port, which would
    // leave the dev script, the Playwright base URL and the README
    // disagreeing.
    strictPort: true,
  },
});
