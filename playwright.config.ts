import { defineConfig, devices } from '@playwright/test';

const sitePort = Number(process.env.PORT ?? 10606);
const devServerPort = Number(process.env.VITE_PORT ?? sitePort + 1);

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: process.env.CI ? [['list'], ['html']] : 'html',
  use: {
    baseURL: `http://localhost:${devServerPort}`,
    trace: 'on-first-retry',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
  // One server: the chemistry runs in the page, so there is nothing behind it.
  webServer: {
    command: 'npm run dev',
    url: `http://localhost:${devServerPort}`,
    reuseExistingServer: !process.env.CI,
  },
});
