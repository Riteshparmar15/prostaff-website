# Test Execution Report — Prostaff Solution website

Execution dates: 31 October 2026 (initial QA), 1 November 2026 (follow-up fixes and regression) and 2 November 2026 (live-site testing at `https://prostaffconsulting.com`, then a second independent audit that evening)

> **Read this first.** The independent audit on the evening of 2 November found five new defects (BUG-023 to BUG-027) in the contact-form work done earlier that day. The fixes are committed in the repository but **not deployed**, as instructed, so the live site still has four of them. Numbers marked "2 Nov audit" were re-run in that audit; older figures that could not be reproduced are called out as such.

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

The repository is in a good state: lint, 91 unit tests, the production and single-file builds, and 102 browser tests (Chrome desktop, Chrome mobile emulation, Edge) all pass, and every confirmed code defect, including the five found in the 2 Nov audit, is fixed with a regression test. The live site passes its 71-check audit and 54 live e2e tests, and a real enquiry reaches the business inbox in about 0.5 seconds.

The handover has three conditions:
1. **Deploy the committed fixes.** The live site (`cbf8b68`) still has BUG-023 (one click on Send can be swallowed), BUG-024 (failure text overflows at 320px), BUG-026 (privacy text names the wrong processors) and BUG-027 (surname initial rejected). The fixes are committed locally and were deliberately not pushed. After deploying, re-run `npm run test:live` (TC-LIVE-022).
2. **Owner decisions that code cannot settle:**
   - **BUG-011 (P1):** the legal entity name. The page title, privacy policy and terms say "Prostaff Solution Pvt. Ltd.", while the About section and footer say Prostaff is a division of Dubey Enterprises and "not a separate legal entity".
   - **BUG-013 (P2):** permission for third-party brand logos, the "500+ candidates placed" and "100% retention" claims, and the named testimonials.
   - **BUG-026:** approval of the corrected privacy wording.
3. **Manual checks** listed in `QA_REPORT.md` (real phones, screen reader, inbox check after the live suite).

## Results

| Status | Count |
|---|---|
| PASS | 128 |
| FAIL | 1 |
| BLOCKED | 4 |
| NOT RUN | 7 |
| NOT APPLICABLE | 0 |
| **Total test cases** | **140** |

These were counted from the table in `TEST_CASES.md` by script, not by hand.

**Pass rate** = PASS / (PASS + FAIL) × 100 = 128 / 129 × 100 = **99.2%**. The 11 blocked and not-run cases are excluded from the rate and are not counted as passed. The rate says nothing about the live site's missing fixes: TC-LIVE-022 (the live site runs the audited code) is BLOCKED, so it is not in the rate.

**Changes in the 2 Nov audit:** 12 cases added (TC-FORM-024 to 031, TC-RESP-010, TC-CNT-006, TC-LIVE-021, TC-LIVE-022); TC-RESP-009 moved from PASS to NOT RUN because Firefox and WebKit could not be reproduced; the notes on TC-BLD-003, TC-FORM-005, TC-FORM-016, TC-LOAD-007, TC-PROD-004, TC-LIVE-014 and TC-LIVE-018 were corrected.

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
- **TC-FORM-023:** live Google Sheets save; the owner must deploy the Apps Script (the live site does not have this channel).
- **TC-CNT-004:** permission for logos and claims.
- **TC-LIVE-022:** the live site does not yet run the audited code (not deployed, as instructed).

### Not run
- **TC-FORM-015:** EmailJS path. EmailJS isn't configured.
- **TC-FORM-029:** real browser offline. The test browser's offline switch did not block requests.
- **TC-FORM-031:** Netlify's spam filtering.
- **TC-RESP-009:** Firefox and WebKit (not installed on the test machine).
- **TC-RESP-008:** real iPhone and Android devices.
- **TC-A11Y-005:** full keyboard-only walkthrough. Parts are automated: skip link, menu, cards, pause buttons and the footer targets.
- **TC-A11Y-006:** screen reader walkthrough.

### Resolved on 2 November
- TC-SEO-002 and TC-PROD-002 (FAIL → PASS): the domain, canonical URLs and certificate.
- TC-PROD-001 and TC-PROD-003 (BLOCKED / NOT RUN → PASS): the site is deployed on Netlify.
- TC-FORM-016 (BLOCKED → PASS): a FormSubmit test email arrived in the inbox.
- 20 new live-site cases (TC-LIVE-001 to TC-LIVE-020), all PASS.

## Independent audit run (2 November, evening)

| Check | Command | Result |
|---|---|---|
| Lint | `npx eslint .` | 0 errors, 0 warnings |
| Unit tests | `npx vitest run` | 91 / 91 passed (4 files) |
| Production build | `npm run build` | Success (client, SSR, prerender); JS 358 KB, CSS 60 KB |
| Single-file build | `npm run build:file` | Success, `dist-file/index.html` 2.15 MB |
| Dependency audit | `npm audit`, `npm audit --omit=dev` | 0 vulnerabilities in both |
| Browser suite, local build | `npx playwright test --project=desktop --project=mobile --project=edge` | 111 tests: 102 passed, 9 skipped by viewport, 0 failed (after fixing BUG-023 and BUG-024) |
| Browser suite, live site | `npx playwright test --config playwright.live.config.js` | 58 tests against deployed `cbf8b68`: 54 passed, 4 skipped by viewport, 0 failed. Run before the 4 new e2e form tests and the 6 width tests were added, so those ran locally only |
| Live read-only audit | `node scripts/live-audit.mjs` | 71 / 71 passed: redirects, headers, SEO, links, 31 images, no console errors, no failed requests, 12 viewports including 320, 375, 768, 1024, 1366 and 1920 |
| Nested and unknown routes, live | HTTP checks | `/a/b/c/d` and `/assets/nope.js` return 404; the custom 404 page links back correctly (e2e) |
| Security headers, live | HTTP check | `nosniff`, `SAMEORIGIN`, `strict-origin-when-cross-origin`, HSTS and `Permissions-Policy` present; **no Content-Security-Policy** |

Defects found while running these: BUG-023 to BUG-027 (see `BUG_REPORT.md`).

**Evidence that rests only on one manual run** (no script can repeat it): the 0.5 s live submission and its inbox arrival (TC-FORM-025), and the simulated network and server failures on the live page (TC-FORM-027).

**Cases marked PASS earlier with thin evidence, as reviewed in this audit**
- Method B ("interactive browser session") cases have no saved artifact. Re-covered by a script today: form validation (TC-FORM-003, 004, 005), responsive widths (TC-RESP-001 to 005 by the live audit) and links (TC-LNK-*, by the live audit). Still resting on manual evidence only: TC-NAV-002 to 006, 008, 010; TC-RESP-006, 007; TC-VIS-002; TC-A11Y-002, 003; TC-SEC-004. Treat them as likely but not re-verified.
- TC-LIVE-018 was marked PASS although the arrival of its email was never confirmed. It now points at TC-FORM-016 and TC-FORM-025, which have inbox evidence.
- TC-RESP-009 and the "six browser setups" claim in TC-PROD-004 could not be reproduced here.

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
- Real enquiries sent during the 2 Nov session, all clearly marked as tests: "QA Live Test" (12:29, FormSubmit), "QA Netlify Test" (12:37, Netlify Forms) and "QA Offline Test" (sent **by mistake**: the DevTools offline switch did not block requests). All three can be deleted from the inbox and from the Netlify Forms page. A fourth email, from "Manav Soni" at 12:25, was a real person's submission during a screen-share and is not a test.
- The 2 Nov audit sent no enquiries by design (the Netlify POST is intercepted), but the inbox was not re-checked afterwards because the check was declined.
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
