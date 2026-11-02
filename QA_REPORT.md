# QA Report — Prostaff Solution website

Date: 31 October 2026, updated 1 and 2 November 2026 · Scope: the full website in this repository, tested as a local production build and, since 2 November, as the live site at https://prostaffconsulting.com

**Related documents**
- `TEST_CASES.md`: all 140 test cases and their results.
- `BUG_REPORT.md`: 27 findings, with fixes and owner questions.
- `TEST_EXECUTION_REPORT.md`: counts, pass rate, decision and commands.

## Outcome

**READY WITH DOCUMENTED LIMITATIONS, on three conditions.** Pass rate is 99.2% across 140 test cases: 128 passed, 1 failed, 4 blocked and 7 not run (independent audit, 2 November 2026, evening).

**What the independent audit found.** The contact-form work earlier on 2 November (Netlify Forms, new validation, new inbox) introduced five defects, BUG-023 to BUG-027:
- A single click on "Send Message" could be swallowed after typing an invalid value (P2).
- The failure message overflowed the form at 320px (P3).
- The live e2e suite would have sent real enquiries through Netlify Forms (P2, caught before it ran live).
- The privacy policy named the wrong form processors (P2).
- Surnames written as an initial were rejected (P3).

All five are fixed in the repository with regression tests. **They are not deployed** (the audit was told not to deploy), so the live site `cbf8b68` still has four of them.

**Conditions for handover**
1. Push the committed fixes, then re-run `npm run test:live` (TC-LIVE-022).
2. Owner decisions: BUG-011 (legal entity name, P1), BUG-013 (logo permission and claims) and approval of the privacy wording (BUG-026).
3. The manual checks below.

The summary that follows is the earlier 2 November (daytime) summary and is kept for history.

The live site, checked on 2 November:
- Served by Netlify over HTTPS with a valid Let's Encrypt certificate (TLS 1.2 and 1.3 only); `http://` and `www` redirect to `https://prostaffconsulting.com/`.
- 48 of 48 applicable end-to-end tests, a 71-check read-only audit and the WCAG 2.1 and 2.2 AA scans all pass.
- Lighthouse (lab): mobile 85 / 100 / 100 / 100, desktop 97 / 100 / 100 / 100.
- One new defect found and fixed: the footer legal links were 15px tall (BUG-021). A minor error-handling slip in the form was also fixed (BUG-022).
- The old site-URL blocker (BUG-010) is resolved. The one remaining failure is the legal-entity-name conflict (BUG-011), which needs the owner.

The follow-up on 1 November, approved by the owner:
- Fixed the brand-strip pause control and mobile-menu focus.
- Compressed images.
- Self-hosted the legal-page fonts and updated the privacy wording.
- Added a custom 404 page.
- Upgraded Vite and Vitest, clearing all critical and high advisories.
- Added automated tests for the intro, skip link, back-to-top button and industry cards.
- Ran the suite in Edge, Firefox and WebKit.
- Recorded Lighthouse scores: mobile 77/100/100/100, desktop 97/100/100/100.

The 3 remaining failures all need an owner decision.

All seven confirmed code defects were fixed and are covered by regression tests:
- A broken production preview.
- Back/Forward not scrolling.
- Duplicate enquiries on double-click.
- Contact form overflow on 320px phones.
- Broken hero image fallback.
- Two accessibility failures.

Still needed from the owner:
- The legal entity name on the privacy and terms pages (BUG-011, P1).
- Permission for the third-party brand logos and evidence for the statistics and testimonials (BUG-013).
- Confirmation of which inbox receives enquiries; it is currently a personal Gmail, and the free FormSubmit emails carry a sponsor advert (BUG-012).

## Project overview
- **Stack:** React 18 single-page site built with Vite 5 and Tailwind 3.
  - Framer Motion animations and Lenis smooth scrolling.
  - Self-hosted fonts.
  - Build-time prerendering (`src/entry-server.jsx` and `scripts/prerender.mjs`) so the HTML contains content before JavaScript runs.
- **Hosting:** live on Netlify at `https://prostaffconsulting.com`, built from the `master` branch on GitHub (every push redeploys). `npm run build` produces a root-based (`/`) `dist/`, `netlify.toml` holds the build settings and `public/_headers` the security and cache headers. DNS is at GoDaddy (A record to Netlify, `www` CNAME). `npm run deploy:ghpages` still exists for GitHub Pages under `/prostaff-website/`, but nothing is published there now.
- **Contact form** (code in `src/lib/enquiry.js` and `src/components/Contact.jsx`): on Netlify builds it posts to Netlify Forms first (declared as the hidden `enquiry` form in `index.html`; Netlify emails each enquiry to `adarsh.dubeyenterprises@gmail.com` and stores it on its Forms page). If Netlify does not accept it within 8 seconds, it uses the backup: EmailJS when the `VITE_EMAILJS_*` variables are set, otherwise FormSubmit's AJAX endpoint (which `VITE_CONTACT_ENDPOINT` can override), with a 20-second timeout. When `VITE_SHEETS_ENDPOINT` is set, each enquiry is also saved to a Google Sheet, but that channel is **not enabled** on the live site. The visitor sees success as soon as one channel accepts it. It has a honeypot field, per-field validation with specific messages, and a "Message sent" or "Message not sent" panel with the cause. Netlify Forms is switched on only when the build runs on Netlify (`vite.config.js`), so local builds and tests use FormSubmit.
- **Content:** all copy and contact details are in `src/data/content.js`.

## Page and feature inventory

| Page or section | Anchor or file | Key features tested |
|---|---|---|
| Header | (fixed) | Logo, 6 nav links, "Get in Touch" CTA, mobile menu |
| Hero | `#home` | Four-slide background slideshow, pause/play, 2 CTAs, "Discover" cue, image fallback |
| Statistics | (band labelled "Prostaff Solution in numbers") | Count-up numbers with screen-reader values |
| Brands | `#brands` | Auto-scrolling logo marquee |
| About | `#about` | Copy, corporate structure note |
| Services | `#services` | Service cards, CTA |
| Industries | `#industries` | Five expandable cards with roles |
| Testimonials | `#testimonials` | Quotes |
| Contact | `#contact` | Contact details (email, phone, WhatsApp, address, hours), enquiry form |
| Footer | (bottom) | Quick links, contact, LinkedIn, legal links, copyright |
| Back to top | (floating) | Anchor to `#home` |
| Privacy Policy | `privacy.html` | Static page |
| Terms of Use | `terms.html` | Static page |
| SEO files | `robots.txt`, `sitemap.xml`, `og-image.jpg`, JSON-LD in `index.html` | Presence, format, URLs |

## What was tested
- **Build and tooling:** install, lint, unit tests, production build, single-file build, preview, dependency audit, secrets scan.
- **Navigation:** every header, hero, footer and CTA link; focus handling; Back/Forward; mobile menu; anchor integrity.
- **Contact form:** validation (empty, whitespace, five invalid email formats), payload integrity (Unicode, HTML characters, 5,000 characters), sending state, success and reset, double submission, network error, HTTP 500, FormSubmit activation reply, non-JSON reply, timeout, payload contract, reuse after errors, honeypot, Enter key, the two-channel logic and the Apps Script endpoint. Automated submissions were all mocked. On 1 November one live FormSubmit send was recorded, returning HTTP 200 `success: true`.
- **Responsive:** 12 viewports from 320px to 1920px, 200% zoom and landscape phone, all measured in the DOM for overflow and clipping.
- **Accessibility:** automated axe scan (WCAG 2.1 A/AA), heading order, labels, error semantics, focus movement, moving-content controls.
- **SEO, performance, security and content:** meta and structured data, bundle and image sizes, external-link safety, headers, third-party origins, consistency of contact and legal details.
- **Live site (2 Nov):** HTTP to HTTPS and `www` redirects, certificate and TLS versions, security and cache headers, custom 404, direct loads of the legal pages, robots, sitemap and share image, page metadata and structured data, every link, console and network errors, 12 viewport sizes, the full e2e suite, axe WCAG 2.1 and 2.2, Lighthouse, and one real form submission.

## Changes made

| File | Change | Bug |
|---|---|---|
| `vite.config.js` | Preview uses the build's base path; Vitest limited to `src/**/*.test.*` | BUG-001 |
| `src/lib/smoothScroll.js` | `popstate` handler scrolls to the section in the URL | BUG-002 |
| `src/components/Contact.jsx` | Synchronous double-submit guard; `grid-cols-1` on the small-screen grid | BUG-003, BUG-004 |
| `src/components/Hero.jsx` | Fallback images built with `asset()` | BUG-005 |
| `src/components/ui/RichText.jsx` | Heading emphasis colour changed from `gold` to `bronze` on light backgrounds | BUG-006 |
| `src/components/ui/Logo.jsx` | Whitespace between the wordmark lines (no visual change) | BUG-007 |
| `src/test/App.test.jsx` | Regression tests for double submission and the narrow-screen grid | — |
| `src/test/smoothScroll.test.js` | New: Back/Forward regression tests | — |
| `playwright.config.js` and `e2e/*` | New: Playwright and axe browser suite with mocked form endpoints | — |
| `package.json` and lock file | Added `@playwright/test` and `@axe-core/playwright` (dev); new `test:e2e` script | — |
| `eslint.config.js` and `.gitignore` | Lint config for `e2e/`; ignore Playwright and Lighthouse output folders | — |
| `src/components/BrandShowcase.jsx` | Pause/play button for the logo strip; logos lazy-load | BUG-008, BUG-015 |
| `src/components/Header.jsx`, `src/lib/smoothScroll.js` | Page behind the open mobile menu is `inert`; focus moves after the menu closes | BUG-009 |
| `public/images/**`, `public/og-image.jpg` | Re-encoded or resized oversized images | BUG-015 |
| `public/fonts/*`, `privacy.html`, `terms.html` | Self-hosted fonts; privacy policy names FormSubmit and Unsplash | BUG-016 |
| `public/404.html`, `vite.config.js` | Custom 404 page with build-time base path | BUG-017 |
| `package.json` and lock file | Vite 8, Vitest 5, plugin-react 6, singlefile 2.3.4, ESLint 10 with `@eslint-react`, `minimatch` override; `test:e2e:browsers` script | BUG-014 |
| `eslint.config.js` | Rewritten for ESLint 10 and `@eslint-react/eslint-plugin` | BUG-014 |
| `playwright.config.js`, `e2e/*` | Edge, Firefox and WebKit projects; new tests | — |
| `src/components/Contact.jsx` | 15-second request timeout; only a JSON success reply counts; optional Google Sheets channel sent alongside FormSubmit | BUG-020, BUG-012 |
| `google-apps-script/Code.gs` (new), `src/data/content.js`, `.env.example`, `privacy.html` | Apps Script that saves enquiries to a Sheet and emails the owner; `VITE_SHEETS_ENDPOINT`; privacy policy names Google | BUG-012 |
| `src/test/App.test.jsx`, `src/test/appsScript.test.js` (new), `e2e/contact.spec.js` | Two-channel, Apps Script, timeout, non-JSON, payload contract and reuse tests | — |
| `index.html`, `public/privacy.html`, `public/terms.html`, `public/sitemap.xml`, `public/robots.txt`, `README.md` | Canonical, social, sitemap and robots URLs changed from `prostaffsolution.com` to `https://prostaffconsulting.com` | BUG-010 |
| `src/components/Footer.jsx`, `e2e/layout-a11y.spec.js` | Footer legal links at least 24px tall; new size test and WCAG 2.2 AA scan | BUG-021 |
| `src/components/Contact.jsx` | `data?.message` so an unexpected reply gives the normal failure message | BUG-022 |
| `playwright.live.config.js`, `scripts/live-audit.mjs` (new), `e2e/fixtures.js`, `eslint.config.js`, `package.json`, `.gitignore` | Run the e2e specs against a live URL, a read-only live audit, request checks that follow the configured host, a `test:live` script | — |

Changes in the 2 Nov independent audit (committed, not deployed):

| File | Change | Bug |
|---|---|---|
| `src/components/Contact.jsx` | Blur validation is skipped while the submit button is pressed; message text wraps | BUG-023, BUG-024 |
| `e2e/fixtures.js` | Any POST to `/` (Netlify Forms) is answered with a mocked 404 | BUG-025 |
| `public/privacy.html` | Names Netlify and FormSubmit; removes the Google Sheet claim; dated 2 Nov | BUG-026 |
| `src/lib/enquiry.js` | Surname may be one letter; curly apostrophe allowed | BUG-027 |
| `src/test/enquiry.test.js` (new) | 46 tests: field rules, failure messages, payload integrity | — |
| `e2e/contact.spec.js`, `e2e/layout-a11y.spec.js` | Live Netlify-first test, two click tests, form states at 6 widths | — |

Visible design changes:
- **BUG-006:** italic gold heading words on light backgrounds are a slightly deeper gold, needed to meet WCAG AA contrast.
- **BUG-008:** a small pause/play button under the brand logo strip (owner-approved).

Everything else keeps the existing design, content and behaviour.

## Manual checks still needed
1. Real devices: iPhone (Safari) and Android (Chrome). In particular, tap "Send Message" once right after typing an invalid value (BUG-023) on a real phone. Edge and Chrome are covered by automated tests; Firefox and Safari's engine (WebKit) were not re-run in the 2 Nov audit.
2. Full keyboard-only walkthrough and a screen reader pass (NVDA or VoiceOver).
3. Check the inbox and the Netlify Forms page after the audit: delete the test enquiries ("QA Live Test", "QA Netlify Test", "QA Offline Test") and confirm no "QA Automation" enquiries arrived from the live e2e run (they should not have). After deploying, send one real enquiry and confirm it arrives.
3a. Confirm Netlify's spam filter and the 100-submissions-a-month free limit are acceptable (TC-FORM-031).
4. On the live site:
   - Check the share preview with a social debugger (Facebook Sharing Debugger, LinkedIn Post Inspector).
   - Confirm the LinkedIn link opens the official page.
   - Submit the site in Google Search Console and read the field Core Web Vitals once there is traffic.
5. Owner sign-off on BUG-013 (logo permissions and claims), BUG-016 (privacy wording) and BUG-019 (whether to simplify the hero headline animation for mobile speed).

## Limitations of this QA
- Until 2 November all browser testing was against the local production build; the live checks that day cover the deployed site. Live Lighthouse numbers are lab data, not real-visitor data.
- This PC's own DNS resolver kept the old GitHub record for `www` for hours after the change. Public resolvers (Google, Cloudflare, Quad9) and GoDaddy's name servers were correct, so visitors on a stale resolver may briefly see the old answer after a DNS change.
- Automated browser tests ran in Chrome (desktop and Pixel 7 emulation), Edge, Firefox and WebKit (desktop and iPhone 14 emulation). They did not run on physical devices.
- Emulated viewports were verified by DOM measurement. Screenshots taken under emulation were scaled, so they were used only for visual review.
