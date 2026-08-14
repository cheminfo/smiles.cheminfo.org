import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    // The specs under e2e/ belong to Playwright, which has its own runner.
    include: ['src/**/*.test.{ts,tsx}'],
    coverage: {
      include: ['src/**/*.{ts,tsx}'],
      // The chemistry runs in the browser here, so every test loads
      // openchemlib: v8 precise coverage profiles that whole bundle, istanbul
      // instruments src alone.
      provider: 'istanbul',
    },
    snapshotFormat: {
      maxOutputLength: Number.MAX_SAFE_INTEGER,
    },
  },
});
