import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    // The chemistry is shared with the frontend and lives above both, so this
    // is the one runner that covers it.
    include: ['src/**/*.test.ts', '../chemistry/**/*.test.ts'],
    coverage: {
      include: ['src/**/*.ts', '../chemistry/**/*.ts'],
      // openchemlib is a large WebAssembly-backed bundle; profiling it with v8
      // dominates the run, while istanbul only instruments src.
      provider: 'istanbul',
    },
    snapshotFormat: {
      maxOutputLength: Number.MAX_SAFE_INTEGER,
    },
  },
});
