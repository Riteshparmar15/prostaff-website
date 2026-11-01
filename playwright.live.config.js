import { defineConfig, devices } from '@playwright/test';

// Runs the same e2e specs against the deployed site (default https://prostaffconsulting.com/).
//   npm run test:live
//   $env:LIVE_URL='https://staging.example.com/'; npm run test:live
// Form submissions stay intercepted by e2e/fixtures.js, so no real enquiry email is ever sent.
const LIVE_URL = (process.env.LIVE_URL || 'https://prostaffconsulting.com/').replace(/\/?$/, '/');
const requested = process.env.PW_CHANNEL || 'chrome';
const channel = requested === 'chromium' ? undefined : requested;

export default defineConfig({
  testDir: './e2e',
  timeout: 60_000,
  fullyParallel: true,
  workers: 2,
  retries: 1,
  reporter: [['list'], ['html', { open: 'never', outputFolder: 'playwright-report-live' }]],
  use: { baseURL: LIVE_URL, trace: 'retain-on-failure' },
  projects: [
    { name: 'desktop', use: { viewport: { width: 1440, height: 900 }, channel } },
    { name: 'mobile', use: { ...devices['Pixel 7'], channel } },
  ],
});
