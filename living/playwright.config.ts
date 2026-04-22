import { defineConfig, devices } from '@playwright/test'

/**
 * Playwright E2E configuration.
 *
 * First-time setup:
 *   npx playwright install --with-deps
 *
 * Run all E2E tests:
 *   npx playwright test
 *
 * Run with UI:
 *   npx playwright test --ui
 *
 * View last report:
 *   npx playwright show-report
 */
export default defineConfig({
  testDir: './e2e',
  /* Run tests in parallel */
  fullyParallel: true,
  /* Fail the build on CI if you accidentally left test.only */
  forbidOnly: !!process.env.CI,
  /* Retry on CI only */
  retries: process.env.CI ? 2 : 0,
  /* Fewer workers on CI */
  workers: process.env.CI ? 1 : undefined,
  /* Reporter */
  reporter: [
    ['html', { outputFolder: 'playwright-report' }],
    ['list'],
  ],

  use: {
    /* Base URL — matches the dev server port from package.json */
    baseURL: process.env.PLAYWRIGHT_BASE_URL || 'http://localhost:3002',
    /* Collect traces on retry */
    trace: 'on-first-retry',
    /* Screenshot on failure */
    screenshot: 'only-on-failure',
    /* Locale */
    locale: 'es-CL',
  },

  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'mobile-chrome',
      use: { ...devices['Pixel 5'] },
    },
  ],

  /* Start dev server automatically when running E2E locally */
  webServer: process.env.CI
    ? undefined
    : {
        command: 'npm run dev',
        url: 'http://localhost:3002',
        reuseExistingServer: true,
        timeout: 60_000,
      },
})
