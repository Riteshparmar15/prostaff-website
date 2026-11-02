import { test as base, expect } from '@playwright/test';

/**
 * Every test starts with the brand intro already seen (unless `skipIntro` is false) and with all outgoing
 * form submissions intercepted, so no real enquiry email can ever be sent.
 * Tests read `formMock.submissions` and can change `formMock.reply` ('abort', 'hang' or a response).
 */
export const test = base.extend({
  skipIntro: [true, { option: true }],
  formMock: [async ({ page, skipIntro }, use) => {
    const state = {
      submissions: [],
      reply: { status: 200, json: { success: 'true' } },
      delayMs: 0,
    };
    if (skipIntro) {
      await page.addInitScript(() => window.sessionStorage.setItem('ps-intro-seen', '1'));
    }
    // Firefox enforces CORS on fulfilled responses, as the real services' headers would satisfy
    const cors = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
    };
    await page.route(/formsubmit\.co/, async (route) => {
      if (route.request().method() === 'OPTIONS') return route.fulfill({ status: 204, headers: cors });
      state.submissions.push(route.request());
      if (state.delayMs) await new Promise((r) => setTimeout(r, state.delayMs));
      if (state.reply === 'abort') return route.abort('failed');
      if (state.reply === 'hang') return new Promise(() => {});
      const { status, json, body, contentType } = state.reply;
      return route.fulfill({ status, json, body, contentType, headers: cors });
    });
    await use(state);
  }, { auto: true }],
  errors: async ({ page, baseURL }, use) => {
    const errors = [];
    // Failed requests are only counted for the site under test (localhost locally, the real domain live)
    const appHost = new URL(baseURL).hostname;
    page.on('pageerror', (e) => errors.push(`pageerror: ${e.message}`));
    page.on('console', (m) => m.type() === 'error' && errors.push(`console: ${m.text()}`));
    page.on('requestfailed', (r) => {
      if (new URL(r.url()).hostname === appHost) errors.push(`requestfailed: ${r.url()}`);
    });
    page.on('response', (r) => {
      if (new URL(r.url()).hostname === appHost && r.status() >= 400) {
        errors.push(`HTTP ${r.status()}: ${r.url()}`);
      }
    });
    await use(errors);
  },
});

export { expect };

export async function fillValidEnquiry(page) {
  const form = page.getByRole('form', { name: 'Contact form' });
  await form.getByLabel(/First Name/).fill('QA');
  await form.getByLabel(/Last Name/).fill('Automation');
  await form.getByLabel(/Email Address/).fill('qa.automation@example.com');
  await form.getByLabel(/I am a/).selectOption('Other');
  await form.getByLabel(/Message/).fill('Automated test enquiry. Please ignore.');
  return form;
}
