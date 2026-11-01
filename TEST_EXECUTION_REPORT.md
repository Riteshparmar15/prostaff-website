# Test Execution Report — Prostaff Solution website

Execution dates: 31 October 2026 (initial QA), 1 November 2026 (follow-up fixes and regression) and 2 November 2026 (live-site testing at `https://prostaffconsulting.com`)

**Environment**
- Windows 11 (build 26300), Node.js 22.16.0
- Vite 8.3.5, Vitest 5.0.5
- Playwright 1.64.1:
  - Installed Google Chrome (desktop and Pixel 7 emulation)
  - Installed Microsoft Edge
  - Playwright Firefox
  - Playwright WebKit (desktop Safari and iPhone 14 emulation)
- Lighthouse 12.8.2 with headless Chrome (local build and live URL)
- Cursor's built-in browser for interactive checks

**Targets**
- Local production build served by `vite preview` (31 Oct and 1 Nov).
- Live site `https://prostaffconsulting.com`, hosted on Netlify (2 Nov). Automated live tests mock the form endpoints; nothing in them sends real email.

## Decision

### READY WITH DOCUMENTED LIMITATIONS

The site is live and working: HTTPS, redirects, pages, links, forms, responsive layouts and accessibility all pass on the real URL, and every confirmed code defect (BUG-001 to BUG-009, BUG-020 to BUG-022, plus the image, font and 404 fixes) is fixed with a regression test.

Not handover-ready without the owner, because code cannot settle these:
- **BUG-011 (P1):** the legal entity name. The page title, privacy policy and terms say "Prostaff Solution Pvt. Ltd.", while the About section and footer say Prostaff is a division of Dubey Enterprises and "not a separate legal entity".
- **BUG-013 (P2):** permission for third-party brand logos, the "500+ candidates placed" and "100% retention" claims, and the named testimonials.
- **BUG-012 (P2):** confirm that the personal Gmail should receive enquiries, not the business address.

## Results

| Status | Count |
|---|---|
| PASS | 120 |
| FAIL | 1 |
| BLOCKED | 3 |
| NOT RUN | 4 |
| NOT APPLICABLE | 0 |
| **Total test cases** | **128** |

**Pass rate** = PASS / (PASS + FAIL) × 100 = 120 / 121 × 100 = **99.2%**. The 7 blocked and not-run cases are excluded from the rate and are not counted as passed.

**Pass-rate history**
- Initial run: 83.1% (69 / 83).
- After the first fixes: 90.4% (75 / 83).
- After the follow-up fixes: 96.7% (88 / 91).
- After the contact-form deep test and Google Sheets channel: 96.9% (95 / 98).
- After going live and the live-site tests (2 Nov): 99.2% (120 / 121).

### Remaining failure

| Test | Bug | Reason |
|---|---|---|
| TC-CNT-003 | BUG-011 | Legal entity name conflicts across the site; needs the owner |

### Blocked (need the owner)
- **TC-LNK-005:** the LinkedIn address responds (HTTP 200), but only the owner can confirm it is the official page.
- **TC-FORM-023:** live Google Sheets save; the owner must deploy the Apps Script.
- **TC-CNT-004:** permission for logos and claims.

### Not run
- **TC-FORM-015:** EmailJS path. EmailJS isn't configured.
- **TC-RESP-008:** real iPhone and Android devices.
- **TC-A11Y-005:** full keyboard-only walkthrough. Parts are automated: skip link, menu, cards, pause buttons and the footer targets.
- **TC-A11Y-006:** screen reader walkthrough.

### Resolved on 2 November
- TC-SEO-002 and TC-PROD-002 (FAIL → PASS): the domain, canonical URLs and certificate.
- TC-PROD-001 and TC-PROD-003 (BLOCKED / NOT RUN → PASS): the site is deployed on Netlify.
- TC-FORM-016 (BLOCKED → PASS): a FormSubmit test email arrived in the inbox.
- 20 new live-site cases (TC-LIVE-001 to TC-LIVE-020), all PASS.

## Live-site run (2 November)

| Check | Command | Result |
|---|---|---|
| Playwright e2e on the live URL, Chrome desktop and mobile | `npx playwright test --config playwright.live.config.js` | 52 tests: 48 passed, 4 skipped by viewport, 0 failed. After the footer fix was deployed, `e2e/layout-a11y.spec.js` (now with the 24px and WCAG 2.2 tests) was re-run live: 10 / 10 passed |
| Read-only live audit: redirects, headers, 404, SEO files and tags, links, 12 viewports | `node scripts/live-audit.mjs` | 71 checks: 71 passed, 0 failed (the first run found the 15px footer links, since fixed) |
| Lighthouse, mobile (lab) | `npx lighthouse@12.8.2 https://prostaffconsulting.com/` | Performance 85, accessibility 100, best practices 100, SEO 100; FCP 2.7 s, LCP 3.4 s, TBT 0 ms, CLS 0 |
| Lighthouse, desktop (lab) | same, with `--preset=desktop` | 97 / 100 / 100 / 100; FCP 0.6 s, LCP 0.8 s, TBT 0 ms, CLS 0.005 |
| TLS handshake probe | .NET `SslStream` against the live address | Let's Encrypt, valid 2026-11-01 to 2027-01-30, chain trusted; TLS 1.3 and 1.2 accepted, 1.1 and 1.0 rejected |
| Real enquiry from the live form | headless Chrome | FormSubmit HTTP 200 `{"success":"true"}`, six fields in the payload, success message shown |

Lab Lighthouse numbers are not field data. Core Web Vitals from real visitors (LCP 2.5 s, INP 200 ms, CLS 0.1) will need Search Console or PageSpeed Insights field data once the site has traffic.
## Automated suites (regression runs)

Re-run on 2 November after the footer and error-handling fixes: ESLint 0 problems; Vitest 33 / 33; local Playwright (Chrome desktop and mobile) 56 tests: 52 passed, 4 skipped by viewport, 0 failed; production build succeeds. The table below is the fuller 1 November run in all six browser setups.

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
- On 2 November, at the owner's request, the site was deployed to Netlify, the owner pointed GoDaddy DNS at it, and the old `gh-pages` branch was deleted. No credentials were read or stored by the tests.
- Three more real FormSubmit enquiries were sent on 2 November, each marked as a test: a command-line activation test, a replay of the form's exact request, and one run of the live form in headless Chrome. No other automated live test sent anything.
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
npx playwright test --config playwright.live.config.js   # same specs against https://prostaffconsulting.com (form requests mocked)
node scripts/live-audit.mjs     # read-only live audit; add a URL argument to test another site
```

If Google Chrome is not installed, download Playwright's own browser and select it with `PW_CHANNEL`:

```powershell
npx playwright install chromium
$env:PW_CHANNEL='chromium'; npm run test:e2e
```
