# Test Cases — Prostaff Solution website

Test date: 31 October 2026, updated 1 and 2 November 2026 · Builds under test: the local production build (`npm run build`, served by `vite preview`) and, since 2 November, the live site `https://prostaffconsulting.com` on Netlify (section "Live site" at the end)

**Method key**
- **U**: Vitest unit or integration test (`npm test`)
- **E**: Playwright end-to-end test in Chrome desktop (1440×900) and mobile (Pixel 7) (`npm run test:e2e`), and also in Edge, Firefox, WebKit desktop and iPhone 14 WebKit (`npm run test:e2e:browsers`)
- **B**: interactive browser session, driving the page with DevTools Protocol scripts and measuring the DOM
- **C**: command line or HTTP check
- **R**: code or content review
- **L**: live-site check against `https://prostaffconsulting.com`: `npx playwright test --config playwright.live.config.js` (e2e, form requests still mocked), `node scripts/live-audit.mjs` (read-only audit), Lighthouse 12.8.2 and a TLS handshake probe

**Status** is the result after fixes and regression. "Fixed" means the test failed at first and passed after the fix shown.

## Build and tooling

| ID | Test | Method | Expected | Status | Notes |
|---|---|---|---|---|---|
| TC-BLD-001 | Install dependencies | C | `npm install` succeeds | PASS | |
| TC-BLD-002 | Lint | C | `npm run lint` reports 0 problems | PASS | |
| TC-BLD-003 | Unit tests | U | All pass | PASS | Re-run in the 2 Nov audit: 91/91 across 4 files (form validation, Netlify Forms and FormSubmit channels, failure messages, payload integrity, Apps Script, page structure), on Vitest 5 |
| TC-BLD-004 | Production build | C | Client, SSR and prerender steps succeed | PASS | |
| TC-BLD-005 | Single-file build | C | `npm run build:file` succeeds | PASS | `dist-file/index.html` is 2.2 MB |
| TC-BLD-006 | Preview of production build | C | `npm run preview` serves working JS/CSS | PASS | Fixed: BUG-001 |
| TC-BLD-007 | Production dependency audit | C | No known vulnerabilities | PASS | `npm audit --omit=dev`: 0 |
| TC-BLD-008 | Dev dependency audit | C | No high or critical advisories | PASS | Fixed: BUG-014. `npm audit` reports 0 vulnerabilities |
| TC-BLD-009 | No secrets in repo or bundle | C/R | No keys or tokens; `.env` git-ignored | PASS | |

## Page load

| ID | Test | Method | Expected | Status | Notes |
|---|---|---|---|---|---|
| TC-LOAD-001 | Home page renders | E | Title set, exactly one H1, all 6 sections present | PASS | |
| TC-LOAD-002 | Console clean | E/B | No console errors, page errors or unhandled rejections | PASS | |
| TC-LOAD-003 | Local resources | E | No failed or 4xx/5xx local requests | PASS | |
| TC-LOAD-004 | Legal pages | E | `privacy.html` and `terms.html` return 200 and show an H1 | PASS | |
| TC-LOAD-005 | Static files | C | robots, sitemap, favicon, apple-touch-icon, og-image, logo-mark and legal.css return 200 | PASS | |
| TC-LOAD-006 | Base path | C/R | Netlify build uses `/` with no `/prostaff-website/` left; `build:ghpages` uses `/prostaff-website/` | PASS | Re-checked 1 November for Netlify |
| TC-LOAD-007 | Unknown URL | B | Visitor does not see a broken page | PASS | Superseded by TC-LOAD-009 and TC-LIVE-006 (the earlier note "no custom 404 page" was out of date) |
| TC-LOAD-008 | Brand intro | E | Plays once per session, then hides | PASS | |
| TC-LOAD-009 | Custom 404 page | E/C | Branded page with base-correct links and no missing resources | PASS | New page (BUG-017) |

## Navigation

| ID | Test | Method | Expected | Status | Notes |
|---|---|---|---|---|---|
| TC-NAV-001 | Desktop nav links | E | Each link scrolls its section under the header and updates the hash | PASS | |
| TC-NAV-002 | Header "Get in Touch" | B | Scrolls to Contact | PASS | |
| TC-NAV-003 | Hero CTAs and "Discover" cue | B | Scroll to Services, Contact and About | PASS | |
| TC-NAV-004 | Footer quick links | B | Each scrolls to its section | PASS | |
| TC-NAV-005 | Logo link | B | Returns to top | PASS | |
| TC-NAV-006 | Focus follows navigation | B | Target section receives focus | PASS | |
| TC-NAV-007 | Browser Back/Forward | U/E | Page scrolls to the section in the URL | PASS | Fixed: BUG-002 |
| TC-NAV-008 | Anchor integrity | B | Every `#id` link has a target; no duplicate IDs | PASS | |
| TC-NAV-009 | Mobile menu | E | Opens; Escape closes and returns focus; a link closes it and navigates | PASS | |
| TC-NAV-010 | Mobile menu scroll | B | Page scroll locked while open; menu scrolls in landscape | PASS | |
| TC-NAV-011 | Mobile menu focus containment | E | Tab cannot reach the page behind the open menu | PASS | Fixed: BUG-009 |
| TC-NAV-012 | Skip-to-content link | E | First Tab shows it; Enter moves focus to main content | PASS | In Safari, Tab reaches links only when "Press Tab to highlight each item" is on (Safari default) |
| TC-NAV-013 | Back-to-top button | E | Appears after scrolling and returns to top | PASS | |

## Buttons and links

| ID | Test | Method | Expected | Status | Notes |
|---|---|---|---|---|---|
| TC-LNK-001 | Email link | B | `mailto:` with the public business address | PASS | |
| TC-LNK-002 | Phone link | U/B | `tel:+919023558486` | PASS | |
| TC-LNK-003 | WhatsApp link | B | `wa.me` URL, new tab, `noopener noreferrer` | PASS | No message sent |
| TC-LNK-004 | LinkedIn link | U/B | Correct `href`, new tab, `noopener` | PASS | |
| TC-LNK-005 | LinkedIn destination | — | Opens the official company page | BLOCKED | Needs owner confirmation (BUG-018) |
| TC-LNK-006 | No placeholder links | B | No `href="#"` or empty links | PASS | |
| TC-LNK-007 | Legal links | U/E | Point to base-correct legal pages | PASS | |
| TC-LNK-008 | Hero slideshow pause/play | U | Toggles and updates its label | PASS | |
| TC-LNK-009 | Industry cards accessible names | U | Name and roles exposed | PASS | |
| TC-LNK-010 | Industry card expand | E | Click or keyboard focus expands the card | PASS | |

## Contact form (automated submissions are mocked; the manual live sends are marked)

| ID | Test | Method | Expected | Status | Notes |
|---|---|---|---|---|---|
| TC-FORM-001 | Empty submission | U/E | 5 errors, first field focused, nothing sent | PASS | |
| TC-FORM-002 | Error semantics | B/E | `aria-invalid` and `aria-describedby` link the errors | PASS | |
| TC-FORM-003 | Whitespace-only input | B | Rejected as empty | PASS | |
| TC-FORM-004 | Invalid emails | B/E | `asha@example`, `plainaddress`, `a@b.c`, `a b@c.com` and `@example.com` rejected | PASS | |
| TC-FORM-005 | Payload integrity | U | Trimmed; Unicode, HTML characters and URL syntax (`&`, `=`, `%`, `+`) intact on both channels | PASS | Re-verified 2 Nov by two unit tests (Netlify body and FormSubmit JSON). The earlier "5,000-character message" case no longer applies: the message field is now capped at 2,000 characters (by design, see TC-FORM-026) |
| TC-FORM-006 | Sending state | E/B | Button shows "Sending…", disabled, `aria-busy` | PASS | |
| TC-FORM-007 | Success | U/E | Success message shown, then the form resets | PASS | |
| TC-FORM-008 | Double-click | U/E | Exactly one request sent | PASS | Fixed: BUG-003 |
| TC-FORM-009 | Network failure | E/B | Failure alert; input kept | PASS | |
| TC-FORM-010 | HTTP 500 | E/B | Failure alert; input kept | PASS | |
| TC-FORM-011 | FormSubmit "needs activation" reply | U/E | Treated as failure, not success | PASS | |
| TC-FORM-012 | Honeypot | U | Filled honeypot sends nothing | PASS | |
| TC-FORM-013 | Enter key | B | Submits once | PASS | |
| TC-FORM-014 | Live FormSubmit acceptance | B | Real request accepted, inbox activated | PASS | 1 Nov: HTTP 200 `{"success":"true"}` in 1.3 s; Unicode and HTML characters intact; UI confirmed and reset |
| TC-FORM-015 | EmailJS path | — | Sends via EmailJS when configured | NOT RUN | EmailJS not configured |
| TC-FORM-016 | Inbox arrival | L | Test enquiries appear in the enquiry inbox | PASS | Re-verified 2 Nov for the new inbox `adarsh.dubeyenterprises@gmail.com` (the inbox moved from the earlier personal address): FormSubmit emails at 12:25 and 12:29 and a Netlify Forms email at 12:37 were seen in that inbox in this session |
| TC-FORM-017 | Non-JSON 200 reply | E/U | Failure shown, not success; input kept | PASS | Fixed: BUG-020 |
| TC-FORM-018 | Request never answers | E | Fails after 15 s, button re-enabled, input kept | PASS | Fixed: BUG-020 |
| TC-FORM-019 | FormSubmit payload contract | E | Exact fields, `_subject`, `_replyto`, `_template`, `_captcha`, JSON Accept header | PASS | |
| TC-FORM-020 | Reuse after failure and success | E | Retry works; error cleared; second enquiry sends | PASS | |
| TC-FORM-021 | Two channels (FormSubmit + Google Sheets) | U | Both receive it; success if either saves; failure only if both fail; non-JSON Sheet reply is a failure | PASS | 5 tests |
| TC-FORM-022 | Apps Script endpoint | U | Saves row and emails owner; rejects bad input; honeypot; formula injection blocked; HTML escaped; length caps; rate limit; row kept if email fails | PASS | 12 tests, Google services stubbed |
| TC-FORM-023 | Live Google Sheets save | — | Real enquiry appears as a Sheet row | BLOCKED | Owner must deploy `google-apps-script/Code.gs` and set `VITE_SHEETS_ENDPOINT`. Confirmed 2 Nov: the live bundle contains no `script.google.com` URL, so the Sheet channel is **not enabled** |
| TC-FORM-024 | Netlify Forms is the primary channel, FormSubmit the backup | U | Netlify first; FormSubmit used only if Netlify fails; failure only if both fail; no duplicate sends | PASS | 3 unit tests in `App.test.jsx` ("contact form on Netlify"). The backup path with a real Netlify failure was not run live, only with Netlify mocked |
| TC-FORM-025 | Real submission on the live site through Netlify Forms | B | Fast success message; enquiry reaches the inbox | PASS | 2 Nov, first Netlify build: success panel after 0.5 s (was about 10 s with FormSubmit); email "New website enquiry (Other) — QA Netlify Test" arrived in the inbox at 12:37 pm. One manual run, not repeatable by script |
| TC-FORM-026 | Field validation rules | U | First name 2+ letters (surname may be 1), letters/space/`.`/`'`/`’`/`-` only, valid email, optional phone 10 to 15 digits, message 10+ characters, length caps | PASS | 46 unit tests (boundaries, Unicode names, formatted phones) plus UI tests. Fixed in this audit: BUG-027 |
| TC-FORM-027 | Failure message by cause | U/B | Offline, timeout, network and server errors each show a specific "Message not sent" panel with the inbox address; input kept | PASS | Unit tests for all four causes; network and server cases also simulated on the live site by replacing `fetch` in the page (nothing was sent) |
| TC-FORM-028 | One click on Send after typing an invalid value | E | A single click shows the errors | PASS | **Failed in this audit** (BUG-023: the click was swallowed by blur validation); fixed and covered by two new e2e tests in Chrome desktop, Chrome mobile and Edge |
| TC-FORM-029 | Real browser offline | B | "You appear to be offline" panel | NOT RUN | The DevTools offline switch did not actually block requests in the test browser (it sent a real enquiry by mistake). The offline message is covered only by a unit test |
| TC-FORM-030 | Automated suites cannot send real enquiries | E | Every form request is intercepted, including Netlify Forms | PASS | **Failed in this audit** (BUG-025: the fixture did not intercept the Netlify POST, so the live suite would have sent real enquiries). Fixed before the live suite was run; TC-LIVE-021 asserts the Netlify POST was intercepted |
| TC-FORM-031 | Netlify spam filtering | — | Spam submissions are discarded | NOT RUN | A honeypot field is declared in the form definition, but no spam submission was sent to confirm Netlify discards it |

## Responsive (DOM measurements; screenshots for review)

| ID | Test | Method | Expected | Status | Notes |
|---|---|---|---|---|---|
| TC-RESP-001 | 320×568 | E/B | No horizontal overflow; form fits | PASS | Fixed: BUG-004 |
| TC-RESP-002 | Phones 360, 375, 390, 414 | B/E | No clipping or overflow | PASS | |
| TC-RESP-003 | Tablet 768×1024 | B | No clipping | PASS | |
| TC-RESP-004 | 1024×768 | B | Desktop nav and CTA fit | PASS | |
| TC-RESP-005 | Desktop 1280, 1366, 1440, 1920 | B | No clipping | PASS | |
| TC-RESP-006 | 200% zoom | B | Content reflows; nothing cut off | PASS | |
| TC-RESP-007 | Landscape phone 844×390 | B | Menu and content usable | PASS | |
| TC-RESP-008 | Real iOS Safari and Android devices | — | Renders and works | NOT RUN | Manual check |
| TC-RESP-009 | Firefox, Safari and Edge | E | Full suite passes | NOT RUN | Edge re-verified 2 Nov (all specs pass). Playwright Firefox and WebKit are not installed on this machine, so the earlier "all six browser setups" result could not be reproduced and is not counted |
| TC-RESP-010 | Contact form states at 320, 375, 768, 1024, 1366 and 1920px | E | Invalid, failure and success states: no page overflow and nothing inside the form past its right edge | PASS | **Failed in this audit at 320px** (BUG-024: the failure text ran 41px past the form). Fixed; 6 widths x 3 browser setups (Chrome desktop, Chrome mobile emulation, Edge) = 18 tests passing |

## Visual

| ID | Test | Method | Expected | Status | Notes |
|---|---|---|---|---|---|
| TC-VIS-001 | Hero image fallback | E | Local image shown when the remote photo fails | PASS | Fixed: BUG-005 |
| TC-VIS-002 | Layout review | B | No overlaps or broken sections | PASS | |
| TC-VIS-003 | Image alt text | B | Content images have alt text; decorative hero uses `alt=""` | PASS | |
| TC-VIS-004 | Fonts | E | Self-hosted fonts load | PASS | |

## Accessibility

| ID | Test | Method | Expected | Status | Notes |
|---|---|---|---|---|---|
| TC-A11Y-001 | axe WCAG 2.1 A/AA scan | E | No serious or critical violations | PASS | Fixed: BUG-006, BUG-007; one reviewed axe false positive documented in `BUG_REPORT.md` |
| TC-A11Y-002 | Headings | B/U | One H1; logical H2/H3 order | PASS | |
| TC-A11Y-003 | Form labels | B | Every control has a visible label | PASS | |
| TC-A11Y-004 | Pausing moving content | E | Auto-moving content can be paused (WCAG 2.2.2) | PASS | Fixed: BUG-008 |
| TC-A11Y-005 | Full keyboard walkthrough | — | Everything reachable, with visible focus | NOT RUN | Manual check |
| TC-A11Y-006 | Screen reader walkthrough | — | NVDA or VoiceOver reads content sensibly | NOT RUN | Manual check |
| TC-A11Y-007 | Count-up statistics | R | Final values exposed to screen readers | PASS | |

## SEO

| ID | Test | Method | Expected | Status | Notes |
|---|---|---|---|---|---|
| TC-SEO-001 | Basic meta | R | Title, description, `lang` and viewport present | PASS | |
| TC-SEO-002 | Canonical, OG and sitemap URLs | R/C/L | Match the live, working URL | PASS | Fixed: BUG-010. All use `https://prostaffconsulting.com/`; every sitemap URL returns 200 on the live site (re-tested 2 Nov) |
| TC-SEO-003 | robots.txt | R | Allows crawling and lists the sitemap | PASS | |
| TC-SEO-004 | JSON-LD | R | Valid; matches the visible contact details | PASS | |
| TC-SEO-005 | OG image | C | 1200×630 file served | PASS | |
| TC-SEO-006 | Prerendered HTML | C | `dist/index.html` contains page content | PASS | |

## Performance

| ID | Test | Method | Expected | Status | Notes |
|---|---|---|---|---|---|
| TC-PERF-001 | Bundle size | C | Reasonable for a single page | PASS | JS 362 KB (117 KB gzip); CSS 64.5 KB (10.8 KB gzip) |
| TC-PERF-002 | Hero image priority | R | Hero image preloaded with responsive srcset | PASS | |
| TC-PERF-003 | Image weights | C | File sizes proportionate to dimensions | PASS | Fixed: BUG-015 |
| TC-PERF-004 | Lighthouse | C/L | Scores recorded | PASS | Local build: mobile performance 77, desktop 97, others 100. Live URL (2 Nov): see TC-LIVE-017 (BUG-019) |

## Security

| ID | Test | Method | Expected | Status | Notes |
|---|---|---|---|---|---|
| TC-SEC-001 | External links | B | `rel="noopener noreferrer"` on new-tab links | PASS | |
| TC-SEC-002 | Security headers | R/L | nosniff, Referrer-Policy, X-Frame-Options, Permissions-Policy, HSTS and cache rules configured | PASS | Confirmed on the live Netlify responses (TC-LIVE-005). No Content-Security-Policy (hardening only, BUG-017) |
| TC-SEC-003 | Form spam protection | U | Honeypot active | PASS | |
| TC-SEC-004 | Third-party origins | B | Only expected origins contacted | PASS | images.unsplash.com and the form endpoint |
| TC-SEC-005 | Legal pages third-party requests | E | No third-party font requests | PASS | Fonts now self-hosted (BUG-016) |

## Content

| ID | Test | Method | Expected | Status | Notes |
|---|---|---|---|---|---|
| TC-CNT-001 | Contact details | R | Phone, email and address consistent across the page, JSON-LD and legal pages | PASS | |
| TC-CNT-002 | Copyright year | R | Current year | PASS | Uses the current date |
| TC-CNT-003 | Legal entity name | R | Same entity named everywhere | FAIL | BUG-011 |
| TC-CNT-004 | Brand logos, statistics and testimonials | — | Permission or evidence on file | BLOCKED | Needs owner confirmation (BUG-013) |
| TC-CNT-005 | Privacy policy coverage | R | Names the form processor and third-party image host | PASS | Fixed: BUG-016. Wording needs owner/legal approval |
| TC-CNT-006 | Privacy policy matches the actual processors | R/C | Names Netlify (primary) and FormSubmit (backup); no claim about a Google Sheet that is not enabled | PASS | **Failed in this audit** (BUG-026). Fixed in the repository only; the live page still shows the old text until deployed (TC-LIVE-022). Wording needs owner/legal approval |

## Production readiness

| ID | Test | Method | Expected | Status | Notes |
|---|---|---|---|---|---|
| TC-PROD-001 | Live URL | C/L | Site served | PASS | 2 Nov: served by Netlify at `https://prostaffconsulting.com` (GitHub Pages is no longer used; the `gh-pages` branch was deleted) |
| TC-PROD-002 | Custom domain over HTTPS | C/L | Loads with a valid certificate | PASS | Fixed: BUG-010. Let's Encrypt certificate, valid to 2027-01-30 (TC-LIVE-003) |
| TC-PROD-003 | Deploy | L | A push to `master` publishes | PASS | Done at the owner's request: three Netlify deployments checked by the changed bundle name (`index-CvEo2IUV` → `Du9ix54K` → `8RpoIQC1`) |
| TC-PROD-004 | Automated browser suite | E | Playwright suite passes | PASS | Re-run 2 Nov in 3 setups (Chrome desktop, Chrome Pixel 7 emulation, Edge): 102 passed, 9 skipped by viewport, 0 failed. Firefox, WebKit and iPhone 14 were not re-run (not installed here); the earlier six-setup figure is not reproduced |

## Live site (https://prostaffconsulting.com, tested 2 November 2026)

Method L. Contact-form requests were mocked in every automated live test, so no real email was sent by the suites. Two real sends are listed in TC-LIVE-018.

| ID | Test | Expected | Status | Evidence |
|---|---|---|---|---|
| TC-LIVE-001 | `http://` redirects to `https://` | 301 to the https URL | PASS | `301 -> https://prostaffconsulting.com/` |
| TC-LIVE-002 | `www` redirects to the primary domain, and public DNS is correct | CNAME to Netlify; 301 to the apex | PASS | Public DNS (8.8.8.8, 1.1.1.1, 9.9.9.9) and GoDaddy's own name servers return `prostaffconsulting.netlify.app`; `301 -> https://prostaffconsulting.com/`. This PC's own resolver kept the old GitHub record for hours, which is a local cache and not a site fault |
| TC-LIVE-003 | TLS certificate | Valid, trusted, covers both names, not near expiry | PASS | Let's Encrypt (YE1), CN `prostaffconsulting.com`, SANs `prostaffconsulting.com` and `www.prostaffconsulting.com`, valid 2026-11-01 to 2027-01-30, chain builds |
| TC-LIVE-004 | TLS protocol versions | TLS 1.2 and 1.3 accepted; 1.0 and 1.1 rejected | PASS | Handshake probe: TLS 1.3 negotiated; TLS 1.0 and 1.1 rejected; TLS 1.2 accepted |
| TC-LIVE-005 | Security headers on the live response | HSTS, nosniff, X-Frame-Options, Referrer-Policy, Permissions-Policy | PASS | `max-age=31536000`, `nosniff`, `SAMEORIGIN`, `strict-origin-when-cross-origin`, `camera=(), microphone=(), geolocation=()`. No Content-Security-Policy: recorded under BUG-017, not a failure |
| TC-LIVE-006 | Unknown URL | 404 status with the custom page | PASS | `/this-page-does-not-exist-qa` returns 404 with the branded page |
| TC-LIVE-007 | Direct load of the other pages | 200 | PASS | `/privacy.html` and `/terms.html` return 200 |
| TC-LIVE-008 | robots, sitemap and share assets | Reachable and on the live domain | PASS | robots allows all and names the sitemap; sitemap lists 3 URLs, all 200; `og-image.jpg`, `favicon.svg`, `apple-touch-icon.png`, `logo-mark.svg` return 200 |
| TC-LIVE-009 | Page metadata | Title, description 50-170 characters, `lang`, canonical, Open Graph, Twitter card, no `noindex`, one H1, no skipped heading levels, valid JSON-LD | PASS | All present; canonical, `og:url` and `og:image` use the live domain; description 165 characters |
| TC-LIVE-010 | Asset caching and compression | Hashed assets immutable; HTML compressed | PASS | JS and CSS `public,max-age=31536000,immutable`; HTML served with Brotli |
| TC-LIVE-011 | Console and network on load | No console errors or warnings, no failed or 4xx/5xx requests | PASS | 0 messages, 0 failed requests; the only third-party host is `images.unsplash.com` |
| TC-LIVE-012 | Links | Anchors have targets; mailto and tel valid; external links reachable; `noopener` on new-tab links | PASS | 7 anchors, `mailto:` and `tel:` valid, WhatsApp 200, LinkedIn 200 (it responds, but whether it is the official page is still TC-LNK-005), both new-tab links have `noopener noreferrer`, no placeholder `href`, 31 of 31 images have `alt` and none are broken |
| TC-LIVE-013 | Responsive at 320x568, 360x800, 375x812, 390x844, 414x896, 768x1024, 1024x768, 1280x800, 1366x768, 1440x900, 1920x1080 and a 640px-wide (200% zoom) viewport | No horizontal overflow, no JavaScript errors | PASS | 0px overflow in all 12; screenshots in `test-results/live-audit/` |
| TC-LIVE-014 | Full e2e suite on the live site | Desktop and mobile pass | PASS | Re-run 2 Nov against the deployed build `cbf8b68`: 54 passed, 0 failed, 4 skipped (desktop-only tests on mobile and the reverse) |
| TC-LIVE-015 | axe WCAG 2.1 A/AA on the live site | No serious or critical violations | PASS | Desktop and mobile |
| TC-LIVE-016 | WCAG 2.2 AA target size (SC 2.5.8) | No violations; standalone links at least 24px | PASS | Fixed: BUG-021 (the footer legal links were 15px). Test added in `e2e/layout-a11y.spec.js` and passing locally and on the live site |
| TC-LIVE-017 | Lighthouse on the live URL | Scores recorded | PASS | Mobile: performance 85, accessibility 100, best practices 100, SEO 100; FCP 2.7 s, LCP 3.4 s, TBT 0 ms, CLS 0. Desktop: 97, 100, 100, 100; FCP 0.6 s, LCP 0.8 s, TBT 0 ms, CLS 0.005. Lab data only, not field data |
| TC-LIVE-018 | Real enquiry from the live form | Accepted by the form service; visitor sees the confirmation | PASS | A headless Chrome run on `https://prostaffconsulting.com` returned HTTP 200 `{"success":"true"}` with all six fields in the payload and showed "Thank you. We'll be in touch within 24 hours." Marked as a test. This was an earlier, FormSubmit-only build; its arrival was not confirmed at the time. Arrival for the current build is TC-FORM-016 and TC-FORM-025 |
| TC-LIVE-019 | "Powered by Netlify" badge | Not shown | PASS | The owner switched it off in Netlify; the live page no longer loads the badge script |
| TC-LIVE-020 | Netlify deploy follows `git push` | New bundle served after each push | PASS | Bundle name changed after each of three pushes |
| TC-LIVE-021 | Live form posts to Netlify Forms first with the right fields | `form-name=enquiry` and name, email, phone, profile, message, submitted_at, subject; then the backup is used when Netlify answers 404 | PASS | New e2e test, Chrome desktop and mobile, against the live URL, with the Netlify and FormSubmit requests intercepted so nothing was sent |
| TC-LIVE-022 | The live site runs the audited code | Deployed build includes every fix from this audit | BLOCKED | Not deployed, as instructed. The live site (`cbf8b68`) still has BUG-023 (a click swallowed after typing an invalid value), BUG-024 (failure text overflows the form at 320px), BUG-026 (outdated privacy text) and BUG-027 (single-letter surname rejected). Owner action: push the committed fixes and re-run `npm run test:live` |
