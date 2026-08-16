import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

// Both ports derive from the project creation date, never from Vite's stock
// 5173, so two checkouts never fight over the same port. The site is served on
// PORT; the dev server takes the one above it.
const sitePort = Number(process.env.PORT ?? 10814);
const devServerPort = Number(process.env.VITE_PORT ?? sitePort + 1);

export default defineConfig({
  plugins: [react()],
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
