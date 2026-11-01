import { defineConfig, devices } from '@playwright/test';

const PORT = 4174;
// Uses the installed Google Chrome by default; PW_CHANNEL=chromium uses Playwright's own
// browser (after `npx playwright install chromium`), or name another channel such as msedge
const requested = process.env.PW_CHANNEL || 'chrome';
const channel = requested === 'chromium' ? undefined : requested;

export default defineConfig({
  testDir: './e2e',
  timeout: 60_000,
  fullyParallel: true,
  // The page is animation-heavy; many parallel browsers starve each other and time out
  workers: 2,
  retries: process.env.CI ? 1 : 0,
  reporter: [['list'], ['html', { open: 'never', outputFolder: 'playwright-report' }]],
  use: {
    baseURL: `http://localhost:${PORT}/`,
    trace: 'retain-on-failure',
  },
  projects: [
    { name: 'desktop', use: { viewport: { width: 1440, height: 900 }, channel } },
    { name: 'mobile', use: { ...devices['Pixel 7'], channel } },
    // Cross-browser projects (`npm run test:e2e:browsers`). Edge uses the installed Microsoft
    // Edge; Firefox and WebKit need `npx playwright install firefox webkit`
    { name: 'edge', use: { ...devices['Desktop Edge'], channel: 'msedge' } },
    { name: 'firefox', use: { ...devices['Desktop Firefox'] } },
    { name: 'webkit', use: { ...devices['Desktop Safari'] } },
    { name: 'mobile-safari', use: { ...devices['iPhone 14'] } },
  ],
  // Serves the production build (run `npm run build` first; `npm run test:e2e` does both)
  webServer: {
    command: `npx vite preview --port ${PORT} --strictPort`,
    url: `http://localhost:${PORT}/`,
    reuseExistingServer: !process.env.CI,
    timeout: 60_000,
  },
});
