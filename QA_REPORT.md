# QA Report — Prostaff Solution website

Date: 31 October 2026 · Scope: the full website in this repository, tested locally as a production build

**Related documents**
- `TEST_CASES.md`: all 98 test cases and their results.
- `BUG_REPORT.md`: 18 findings, with fixes and owner questions.
- `TEST_EXECUTION_REPORT.md`: counts, pass rate, decision and commands.

## Outcome

**READY WITH DOCUMENTED LIMITATIONS.** Pass rate is 96.9% across 108 test cases: 95 passed, 3 failed, 5 blocked and 5 not run (updated 1 November 2026, after the contact-form deep test and the new Google Sheets channel).

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

Before the site goes live, the owner must settle three things:
- The final domain, because the canonical and social URLs point to a domain that doesn't load.
- The legal entity name on the privacy and terms pages.
- Which inbox receives enquiries, including activating FormSubmit and confirming one real delivery.

## Project overview
- **Stack:** React 18 single-page site built with Vite 5 and Tailwind 3.
  - Framer Motion animations and Lenis smooth scrolling.
  - Self-hosted fonts.
  - Build-time prerendering (`src/entry-server.jsx` and `scripts/prerender.mjs`) so the HTML contains content before JavaScript runs.
- **Hosting:** Netlify is the target. `npm run build` produces a root-based (`/`) `dist/`, and `netlify.toml` holds the build settings; headers are in `public/_headers`. `npm run deploy:ghpages` still publishes to GitHub Pages under `/prostaff-website/`. The site is not deployed yet.
- **Contact form:** sends via EmailJS when the `VITE_EMAILJS_*` variables are set. Otherwise it sends to FormSubmit's AJAX endpoint, which `VITE_CONTACT_ENDPOINT` can override. When `VITE_SHEETS_ENDPOINT` is set, each enquiry is also saved to the owner's Google Sheet by `google-apps-script/Code.gs`, and the visitor sees success if either channel accepts it. It has a honeypot field for spam, and requests time out after 15 seconds.
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
- **Live URLs:** GitHub Pages returns 404 (not deployed), and the custom domain fails HTTPS.

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

Visible design changes:
- **BUG-006:** italic gold heading words on light backgrounds are a slightly deeper gold, needed to meet WCAG AA contrast.
- **BUG-008:** a small pause/play button under the brand logo strip (owner-approved).

Everything else keeps the existing design, content and behaviour.

## Manual checks still needed
1. Real devices: iPhone (Safari) and Android (Chrome). Firefox, Edge and Safari's engine (WebKit) are covered by automated tests, but real Safari is not.
2. Full keyboard-only walkthrough and a screen reader pass (NVDA or VoiceOver).
3. After the owner activates FormSubmit, send one real test enquiry and confirm it arrives in the right inbox.
4. After deployment:
   - Lighthouse or PageSpeed Insights on the live URL.
   - Check the share preview with a social debugger.
   - Confirm the LinkedIn link opens the official page.
5. Owner sign-off on BUG-013 (logo permissions and claims), BUG-016 (privacy wording) and BUG-019 (whether to simplify the hero headline animation for mobile speed).

## Limitations of this QA
- All browser testing was done against the local production build. No live environment exists yet.
- Automated browser tests ran in Chrome (desktop and Pixel 7 emulation), Edge, Firefox and WebKit (desktop and iPhone 14 emulation). They did not run on physical devices.
- Emulated viewports were verified by DOM measurement. Screenshots taken under emulation were scaled, so they were used only for visual review.
