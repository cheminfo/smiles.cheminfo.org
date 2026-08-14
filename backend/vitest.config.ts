import { defineConfig } from 'vitest/config';

export default defineConfig({
  // The repo root, not this workspace: the chemistry is shared with the
  // frontend and lives above both, and a coverage `include` reaching out
  // through `../` matches nothing at all — the core of the application was
  // silently reported as no code rather than as uncovered code.
  root: '..',
  test: {
    include: ['backend/src/**/*.test.ts', 'chemistry/**/*.test.ts'],
    coverage: {
      include: ['backend/src/**/*.ts', 'chemistry/**/*.ts'],
      // openchemlib is a large WebAssembly-backed bundle; profiling it with v8
      // dominates the run, while istanbul only instruments what is included.
      provider: 'istanbul',
    },
    snapshotFormat: {
      maxOutputLength: Number.MAX_SAFE_INTEGER,
    },
  },
});
