# Test Execution Report — Prostaff Solution website

Execution dates: 31 October 2026 (initial QA) and 1 November 2026 (follow-up fixes and final regression)

**Environment**
- Windows 11 (build 26300), Node.js 22.16.0
- Vite 8.3.5, Vitest 5.0.5 (upgraded from Vite 5.4.21 and Vitest 2.1.9 on 1 November)
- Playwright 1.64.1:
  - Installed Google Chrome (desktop and Pixel 7 emulation)
  - Installed Microsoft Edge
  - Playwright Firefox
  - Playwright WebKit (desktop Safari and iPhone 14 emulation)
- Lighthouse 12.8.2 with headless Chrome
- Cursor's built-in browser for interactive checks

**Target:** the local production build served by `vite preview` under `/prostaff-website/`. The site is not deployed, so nothing was tested against a live server.

## Decision

### READY WITH DOCUMENTED LIMITATIONS

The code is ready to hand over:
- Every confirmed code defect (BUG-001 to BUG-009, plus the image, font and 404 fixes) is fixed and covered by automated regression tests.
- Lint, unit, build and browser suites pass in six browser setups.

The site should **not go live** until the owner resolves the three P1 items, none of which code can settle:
- **BUG-010:** the final domain, because the canonical and social URLs point to a domain that does not load.
- **BUG-011:** the correct legal entity name on the legal pages.
- **BUG-012:** the enquiry inbox, FormSubmit activation and a confirmed real delivery.

## Results

| Status | Count |
|---|---|
| PASS | 95 |
| FAIL | 3 |
| BLOCKED | 5 |
| NOT RUN | 5 |
| **Total test cases** | **108** |

**Pass rate** = PASS / (PASS + FAIL) × 100 = 95 / 98 × 100 = **96.9%**

**Pass-rate history**
- Initial run: 83.1% (69 / 83).
- After the first fixes: 90.4% (75 / 83).
- After the follow-up fixes: 96.7% (88 / 91).
- After the contact-form deep test and Google Sheets channel: 96.9%.

### Remaining failures (all need an owner decision)

| Test | Bug | Reason |
|---|---|---|
| TC-SEO-002 | BUG-010 | Canonical, OG and sitemap point to a non-working domain |
| TC-PROD-002 | BUG-010 | Custom domain fails HTTPS |
| TC-CNT-003 | BUG-011 | Legal entity name conflict |

### Blocked (need the owner)
- **TC-LNK-005:** LinkedIn destination.
- **TC-FORM-016:** arrival of the test enquiries in the inbox.
- **TC-FORM-023:** live Google Sheets save; the owner must deploy the Apps Script.
- **TC-CNT-004:** permission for logos and claims.
- **TC-PROD-001:** live URL; deploying was not authorised.

### Not run
- **TC-FORM-015:** EmailJS path. EmailJS isn't configured.
- **TC-RESP-008:** real iPhone and Android devices.
- **TC-A11Y-005:** full keyboard-only walkthrough. Parts are automated: skip link, menu, cards and pause buttons.
- **TC-A11Y-006:** screen reader walkthrough.
- **TC-PROD-003:** deploy. Not authorised.

## Automated suites (final regression run, 1 November)

| Suite | Command | Result |
|---|---|---|
| ESLint | `npm run lint` | 0 problems |
| Vitest | `npm test` | 33 / 33 passed (3 files) |
| Contact form e2e, all 6 browser setups | `npx playwright test e2e/contact.spec.js` | 60 / 60 passed |
| Production build | `npm run build` | Success (client, SSR, prerender) |
| Single-file build | `npm run build:file` | Success |
| Playwright + axe, Chrome desktop and mobile | `npm run test:e2e` | 52 tests: 48 passed, 4 skipped by viewport |
| Playwright + axe, all 6 browser setups | `npm run test:e2e:browsers` | 132 tests: 120 passed, 12 skipped by viewport, 0 failed (before the 4 new contact tests; the contact spec was re-run in all 6 setups afterwards, 60 / 60) |
| Production dependency audit | `npm audit --omit=dev` | 0 vulnerabilities |
| Full dependency audit | `npm audit` | 0 vulnerabilities; was 15 including 2 critical and 2 high |

**Lighthouse (local production build)**

| | Performance | Accessibility | Best practices | SEO | Core metrics |
|---|---|---|---|---|---|
| Mobile (simulated slow 4G) | 77 | 100 | 100 | 100 | FCP 3.0 s, LCP 3.9 s, TBT 190 ms, CLS 0 |
| Desktop | 97 | 100 | 100 | 100 | FCP 0.6 s, LCP 0.9 s, TBT 0 ms, CLS 0.005 |

Mobile performance started at 73 and rose after the image fixes. The remaining gap is the animated hero headline (BUG-019, needs design approval). Reports are in `lighthouse/`.

### Playwright coverage
- **`e2e/navigation.spec.js`:**
  - Page load with no console errors and no failed or 4xx local requests.
  - Legal pages, including no third-party font requests.
  - Custom 404 page.
  - Desktop nav scrolling and hash updates.
  - Back/Forward.
  - Mobile menu: Escape, focus return, link navigation and focus, with the page behind it inert.
  - Brand intro once per session.
  - Skip link.
  - Back-to-top button.
  - Industry card expansion.
  - Brand strip pause/play.
  - Hero image fallback with Unsplash blocked.
- **`e2e/contact.spec.js`:**
  - Empty submission and invalid email.
  - Valid submission: a double-click sends exactly one request; payload, success message and reset are checked.
  - HTTP 500, network failure and the FormSubmit "needs activation" reply.
  - A non-JSON 200 reply and a request that never answers (15-second timeout).
  - The exact FormSubmit payload, and reuse after a failure and after a success.
- **`src/test/appsScript.test.js`:** the Google Sheets Apps Script running against stubbed Google services.
- **`e2e/layout-a11y.spec.js`:**
  - No horizontal overflow at 320px and 360px.
  - axe WCAG 2.1 A/AA scan with no serious or critical violations.

Every form test intercepts requests to `formsubmit.co`, `api.emailjs.com` and `script.google.com` (`e2e/fixtures.js`), so the automated suite cannot send real email or write to a real Sheet.

**Browser notes**
- WebKit follows Safari's defaults: Tab skips links, and clicking a button doesn't focus it. The tests account for this, and the site's keyboard behaviour passes in every engine.
- WebKit is Safari's engine but not Safari itself, so a check on a real iPhone or Mac is still recommended.

## Safety notes
- No automated test sent real email, WhatsApp messages or payments. Three real FormSubmit enquiries were sent by hand at your request: one in the first session and two on 1 November. Each was clearly marked as a test.
- Nothing was deployed, and no DNS or production settings were changed.
- No credentials appear in the reports. The production bundle was scanned and contains no keys or tokens.
- Existing uncommitted changes to `.env.example`, `README.md`, `src/data/content.js` and `emails/` were left untouched.

## Commands to reproduce

```powershell
npm install
npm run lint
npm test
npm run build
npm run preview                 # http://localhost:4173/prostaff-website/
npm run test:e2e                # builds, then runs Playwright in Chrome (desktop + mobile)
npx playwright install firefox webkit   # one-time, for the cross-browser run
npm run test:e2e:browsers       # builds, then runs Chrome, Edge, Firefox and WebKit
npx playwright show-report      # HTML report of the last e2e run
```

If Google Chrome is not installed, download Playwright's own browser and select it with `PW_CHANNEL`:

```powershell
npx playwright install chromium
$env:PW_CHANNEL='chromium'; npm run test:e2e
```
