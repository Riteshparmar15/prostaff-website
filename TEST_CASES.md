# Test Cases — Prostaff Solution website

Test date: 31 October 2026, updated 1 November 2026 · Build under test: local production build (`npm run build`, served by `vite preview` at `/prostaff-website/`)

**Method key**
- **U**: Vitest unit or integration test (`npm test`)
- **E**: Playwright end-to-end test in Chrome desktop (1440×900) and mobile (Pixel 7) (`npm run test:e2e`), and also in Edge, Firefox, WebKit desktop and iPhone 14 WebKit (`npm run test:e2e:browsers`)
- **B**: interactive browser session, driving the page with DevTools Protocol scripts and measuring the DOM
- **C**: command line or HTTP check
- **R**: code or content review

**Status** is the result after fixes and regression. "Fixed" means the test failed at first and passed after the fix shown.

## Build and tooling

| ID | Test | Method | Expected | Status | Notes |
|---|---|---|---|---|---|
| TC-BLD-001 | Install dependencies | C | `npm install` succeeds | PASS | |
| TC-BLD-002 | Lint | C | `npm run lint` reports 0 problems | PASS | |
| TC-BLD-003 | Unit tests | U | All pass | PASS | 33/33 across 3 files (includes the two-channel and Apps Script tests), on Vitest 5 |
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
| TC-LOAD-007 | Unknown URL | B | Visitor does not see a broken page | PASS | No custom 404 page (BUG-017) |
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

## Contact form (every submission mocked; no real email sent)

| ID | Test | Method | Expected | Status | Notes |
|---|---|---|---|---|---|
| TC-FORM-001 | Empty submission | U/E | 5 errors, first field focused, nothing sent | PASS | |
| TC-FORM-002 | Error semantics | B/E | `aria-invalid` and `aria-describedby` link the errors | PASS | |
| TC-FORM-003 | Whitespace-only input | B | Rejected as empty | PASS | |
| TC-FORM-004 | Invalid emails | B/E | `asha@example`, `plainaddress`, `a@b.c`, `a b@c.com` and `@example.com` rejected | PASS | |
| TC-FORM-005 | Payload integrity | B | Trimmed; Unicode, HTML characters and a 5,000-character message intact | PASS | |
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
| TC-FORM-016 | Inbox arrival | — | Test enquiries appear in the enquiry inbox | BLOCKED | Inbox owner must check `company.enquiryInbox` (BUG-012) |
| TC-FORM-017 | Non-JSON 200 reply | E/U | Failure shown, not success; input kept | PASS | Fixed: BUG-020 |
| TC-FORM-018 | Request never answers | E | Fails after 15 s, button re-enabled, input kept | PASS | Fixed: BUG-020 |
| TC-FORM-019 | FormSubmit payload contract | E | Exact fields, `_subject`, `_replyto`, `_template`, `_captcha`, JSON Accept header | PASS | |
| TC-FORM-020 | Reuse after failure and success | E | Retry works; error cleared; second enquiry sends | PASS | |
| TC-FORM-021 | Two channels (FormSubmit + Google Sheets) | U | Both receive it; success if either saves; failure only if both fail; non-JSON Sheet reply is a failure | PASS | 5 tests |
| TC-FORM-022 | Apps Script endpoint | U | Saves row and emails owner; rejects bad input; honeypot; formula injection blocked; HTML escaped; length caps; rate limit; row kept if email fails | PASS | 12 tests, Google services stubbed |
| TC-FORM-023 | Live Google Sheets save | — | Real enquiry appears as a Sheet row | BLOCKED | Owner must deploy `google-apps-script/Code.gs` and set `VITE_SHEETS_ENDPOINT` |

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
| TC-RESP-009 | Firefox, Safari and Edge | E | Full suite passes | PASS | Playwright Firefox, WebKit (Safari's engine, desktop and iPhone 14) and installed Edge |

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
| TC-SEO-002 | Canonical, OG and sitemap URLs | R/C | Match the live, working URL | FAIL | BUG-010 |
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
| TC-PERF-004 | Lighthouse | C | Scores recorded | PASS | Local build. Mobile: performance 77, others 100. Desktop: performance 97, others 100 (BUG-019). Re-run on the live URL |

## Security

| ID | Test | Method | Expected | Status | Notes |
|---|---|---|---|---|---|
| TC-SEC-001 | External links | B | `rel="noopener noreferrer"` on new-tab links | PASS | |
| TC-SEC-002 | Security headers | R | nosniff, Referrer-Policy, X-Frame-Options, Permissions-Policy and cache rules configured | PASS | No Content-Security-Policy. Applies only on Vercel, Netlify or Cloudflare; GitHub Pages ignores them (BUG-017) |
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

## Production readiness

| ID | Test | Method | Expected | Status | Notes |
|---|---|---|---|---|---|
| TC-PROD-001 | GitHub Pages URL | C | Site served | BLOCKED | Not deployed yet (404); deploying was not authorised |
| TC-PROD-002 | Custom domain over HTTPS | C | Loads with a valid certificate | FAIL | TLS connection fails (BUG-010) |
| TC-PROD-003 | Deploy | — | `npm run deploy` publishes | NOT RUN | Not authorised |
| TC-PROD-004 | Automated browser suite | E | Playwright suite passes | PASS | 120 passed, 12 skipped by viewport, across 6 browser setups |
