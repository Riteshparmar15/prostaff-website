# Bug Report — Prostaff Solution website

Test date: 31 October 2026, updated 1 November 2026. Test case IDs refer to `TEST_CASES.md`.

**Priority**
- **P0**: site down, data loss or security breach
- **P1**: core journey broken, or a launch blocker
- **P2**: significant defect with a workaround, or an accessibility failure
- **P3**: minor, cosmetic or hardening

**Status**
- **Fixed**: code changed and covered by a regression test
- **Open**: confirmed, not changed
- **Needs confirmation**: depends on a business-owner decision, so no code was changed

## Summary

| ID | Priority | Status | Title |
|---|---|---|---|
| BUG-001 | P2 | Fixed | `npm run preview` served a broken page |
| BUG-002 | P2 | Fixed | Browser Back/Forward changed the URL but not the scroll position |
| BUG-003 | P2 | Fixed | Double-clicking "Send Message" sent duplicate enquiries |
| BUG-004 | P2 | Fixed | Contact form overflowed the screen at 320px |
| BUG-005 | P2 | Fixed | Hero fallback images pointed to the wrong path |
| BUG-006 | P2 | Fixed | Gold italic heading words failed colour contrast |
| BUG-007 | P3 | Fixed | Logo link's visible text was not part of its accessible name |
| BUG-008 | P2 | Fixed | Brand logo marquee could not be paused by keyboard or touch users |
| BUG-009 | P3 | Fixed | Open mobile menu did not contain keyboard focus |
| BUG-010 | P1 | Needs confirmation | Canonical, social and sitemap URLs point to a domain that does not load |
| BUG-011 | P1 | Needs confirmation | Legal entity name conflicts across the site |
| BUG-012 | P1 | Needs confirmation | Enquiry inbox and real delivery unverified |
| BUG-013 | P2 | Needs confirmation | Permission and evidence for brand logos, statistics and testimonials |
| BUG-014 | P3 | Fixed | Dev-dependency security advisories |
| BUG-015 | P3 | Fixed (Unsplash part needs confirmation) | Oversized images and remote hero photos |
| BUG-016 | P3 | Fixed (wording needs approval) | Privacy policy omitted the form processor; legal pages used Google Fonts |
| BUG-017 | P3 | Partly fixed | Hosting hardening observations |
| BUG-018 | P3 | Needs confirmation | LinkedIn URL spelling |
| BUG-019 | P3 | Open (needs design approval) | Mobile Lighthouse performance 77: hero headline entrance delays the largest paint |
| BUG-020 | P2 | Fixed | Contact form could hang on "Sending…" or confirm an enquiry that was never accepted |

---

## Fixed

### BUG-001: `npm run preview` served a broken page (P2)
- **Test:** TC-BLD-006
- **Steps:** Run `npm run build`, then `npm run preview`, then open the printed URL.
- **Actual:** Every `/prostaff-website/assets/*` request fell back to `index.html`. The browser received HTML instead of JS and CSS, so the page did not work. This blocked any check of the production build before deploying.
- **Cause:** `vite preview` runs the config with `command === 'serve'`, so it used the dev base `/` instead of the build base.
- **Fix:** `vite.config.js` now uses the `isPreview` flag so preview uses the same base as the build.
- **Verified:** Assets return `200 text/javascript`, and the Playwright suite runs against preview.

### BUG-002: Back/Forward did not move the page (P2)
- **Test:** TC-NAV-007
- **Steps:** Click "About", then "Contact", then press the browser's Back button.
- **Actual:** The URL changed to `#about`, but the page stayed at Contact.
- **Cause:** Section links add history entries with `pushState`, and `index.html` sets `history.scrollRestoration = 'manual'`. Nothing handled `popstate`.
- **Fix:** `src/lib/smoothScroll.js` now has a `popstate` listener that scrolls to the section named in the hash, or to the top when there is no hash. The listener is removed in cleanup.
- **Regression tests:** `src/test/smoothScroll.test.js` and `e2e/navigation.spec.js`.

### BUG-003: Duplicate enquiries on double-click (P2)
- **Test:** TC-FORM-008
- **Steps:** Fill the form validly and double-click "Send Message".
- **Actual:** Two POST requests were sent, so the business would receive the same enquiry twice.
- **Cause:** The button is disabled only after React re-renders, so a second click lands first.
- **Fix:** `src/components/Contact.jsx` adds a synchronous `useRef` guard. It is set before sending and cleared in `finally`.
- **Regression tests:** unit test "sends only one request when submitted twice in quick succession", plus the e2e double-click test.

### BUG-004: Contact form overflow at 320px (P2)
- **Test:** TC-RESP-001
- **Actual:** At 320px wide (iPhone SE first generation, and small Android phones), the form was 316px wide inside a 280px column. Twenty-five elements in `#contact` were clipped.
- **Cause:** Below the `lg` breakpoint the grid had no column definition, so the implicit column grew to fit its content.
- **Fix:** Added `grid-cols-1` (`minmax(0, 1fr)`) to the Contact grid. Layout at `lg` and above is unchanged.
- **Regression tests:** unit class check, plus e2e no-overflow tests at 320px and 360px.

### BUG-005: Hero fallback images used the wrong path (P2)
- **Test:** TC-VIS-001
- **Actual:** Hero slides 2–4 load from images.unsplash.com. When that fails (network filter, outage, or the photo being removed), the `onError` fallback used `/images/hero/...`. That path is a 404 under the deployed `/prostaff-website/` base and in the single-file build, so the hero went blank.
- **Fix:** `src/components/Hero.jsx` builds the fallbacks with the existing `asset()` helper.
- **Regression test:** an e2e test blocks Unsplash and checks that the local image loads.

### BUG-006: Gold heading accents failed colour contrast (P2, WCAG 1.4.3 AA)
- **Test:** TC-A11Y-001
- **Actual:** Italic emphasis words in headings on light backgrounds used `text-gold` (#B8955A). The ratio was 2.3:1 on champagne and 2.6:1 on ivory, below the 3:1 minimum for large text. axe flagged "In Their *Words*". The same style is used by "Iconic Brands", "Excellence", "Discerning" and "Remarkable".
- **Fix:** `src/components/ui/RichText.jsx` now uses the palette's existing `bronze` (#9C7A4B), at 3.3:1 on champagne and 3.7:1 on ivory. This is the smallest visual change that passes: a slightly deeper gold. Dark-background headings are unchanged.

### BUG-007: Logo link name mismatch (P3, WCAG 2.5.3)
- **Test:** TC-A11Y-001
- **Actual:** The wordmark lines "Prostaff" and "Solution" had no whitespace between them, so their visible text ("ProstaffSolution") was not found inside the label "Prostaff Solution — back to top". This affects speech-input users.
- **Fix:** `src/components/ui/Logo.jsx` adds a whitespace node between the two lines. There is no visual change because whitespace between flex items is not rendered.

### Reviewed axe finding, not a defect
axe also reports `label-content-name-mismatch` on the five Industry cards. Each card's visible name begins its accessible name, for example "Fashion: Boutique Directors, …". axe additionally counts the decorative "01"–"05" index and a faded duplicate label used during the animation, so speech-input users can still activate the cards by saying the visible name. The e2e accessibility test allow-lists only that rule on those buttons, with the reason in a comment.

---

## Follow-up fixes (1 November) and remaining open items

### BUG-008: Brand marquee had no pause control (P2, WCAG 2.2.2 Level A), fixed 1 November
- **Test:** TC-A11Y-004
- The "Brands We Serve" logo strip scrolled continuously and paused only on mouse hover, so keyboard and touch users could not stop it.
- **Fix (approved by owner):** `src/components/BrandShowcase.jsx` adds a round pause/play button under the strip, styled like the hero control in gold on light. Hover still pauses as before.
- **Regression test:** e2e "brand logo strip can be paused and resumed".

### BUG-009: Mobile menu did not contain focus (P3), fixed 1 November
- **Test:** TC-NAV-011
- While the full-screen menu was open, Tab could move focus to links on the page behind it.
- **Fix:** `src/components/Header.jsx` makes everything except the header and the menu `inert` while the menu is open. Focus from a menu link now moves to its section after the menu releases the page (`src/lib/smoothScroll.js`).
- **Regression test:** e2e "keeps keyboard focus out of the page behind the open menu". The existing menu test now also checks that focus lands on the target section.

### BUG-014: Dev-dependency advisories (P3), fixed 1 November
- **Test:** TC-BLD-008
- Before: 15 advisories, including 2 critical (vitest, tinypool) and 2 high (vite, source-map-js). All were development tooling, and the production dependency audit was clean throughout.
- **Fix (approved by owner):** upgraded Vite 5 → 8.3.5, Vitest 2 → 5.0.5, `@vitejs/plugin-react` 4 → 6.1.2 and `vite-plugin-singlefile` → 2.3.4, then ran `npm audit fix`. Lint, unit tests, both builds, preview and every browser test pass on the new versions.
- **Follow-up fix (same day):** the 6 remaining moderate advisories were all GHSA-g3hv-75wg-m249 in `minimatch` below 11.0.1. Upgrading to ESLint 10.14 alone did not clear them, because ESLint 10 still depends on `minimatch` 10.2.6. The fix was:
  - Upgrade ESLint to 10.14.0, `@eslint/js` to 10.0.1 and `eslint-plugin-react-hooks` to 7.1.1.
  - Replace `eslint-plugin-react` with `@eslint-react/eslint-plugin` 5.28.8, because `eslint-plugin-react` does not support ESLint 10.
  - Add an npm `overrides` entry forcing `minimatch` to `^11.0.3`, which has the same API and supports Node 22.
  - Keep the lint rules as strict as before, and disable two new stylistic rules (`no-array-index-key`, `set-state-in-effect`) that only flagged static lists and mount-time scroll reads.
- **Result:** `npm audit` reports 0 vulnerabilities. Lint passes with 0 errors and 0 warnings, 16/16 unit tests pass, both builds succeed, and the 40 Playwright desktop and mobile tests pass.
- **Rollback:** the pre-upgrade `package.json` and lock file are saved in `%TEMP%\prostaff-pre-upgrade`; the pre-ESLint-10 state is in `%TEMP%\prostaff-pre-eslint10`.

### BUG-015: Image weights (P3), fixed 1 November
- **Test:** TC-PERF-003
- Re-encoded at the project's own `hero-images.mjs` quality (WebP 72), keeping a result only when it saved at least 15%:
  - `hero/interview-tablet-1600.webp` 331 → 236 KB.
  - `hero/interview-mobile-1080.webp` 169 → 111 KB.
  - `industries/retail.webp` 151 → 123 KB, and `retail-mobile.webp` 74 → 60 KB.
  - `og-image.jpg` 157 → 117 KB.
- Brand logos resized to fit 480 × 168 px (3× their largest display size) and palette-compressed, about 620 KB → 88 KB in total. They now lazy-load. All were checked visually.
- **Still needs confirmation:** hero slides 2–4 load from images.unsplash.com even though local copies exist in `public/images/hero/`. Switching to the local copies would remove that third-party dependency.

### BUG-016: Privacy policy and legal-page fonts (P3), fixed 1 November
- **Test:** TC-CNT-005, TC-SEC-005
- **Fonts:** `privacy.html` and `terms.html` now load self-hosted copies of Inter and Playfair Display (`public/fonts/`) instead of Google Fonts.
- **Wording:** the privacy policy now names FormSubmit as the enquiry email service and Unsplash as the image host, and its "Last updated" date is 1 November 2026. **The wording needs owner or legal approval.**

### BUG-017: Hosting hardening observations (P3), partly fixed
- **Fixed:** added a branded `public/404.html`. GitHub Pages serves it for any missing URL, and a build step fills in its absolute base path.
- **Still open:**
  - GitHub Pages ignores `vercel.json` and `public/_headers`, so those security and cache headers only apply on Vercel, Netlify or Cloudflare. There is no Content-Security-Policy.
  - A non-JSON 200 response from the form endpoint counted as success. Fixed under BUG-020.
  - Footer legal links are 14px tall.

### BUG-019: Mobile Lighthouse performance (P3, needs design approval)
- **Test:** TC-PERF-004
- Lighthouse on the local build, mobile (simulated slow 4G): performance 77; accessibility, best practices and SEO 100. FCP 3.0 s, LCP 3.9 s, TBT 190 ms, CLS 0.
- Desktop: performance 97; others 100. LCP 0.9 s.
- The largest element on mobile is the hero headline, and its entrance animation delays when it is painted. Showing the headline without the animated reveal would raise the score but changes the design.
- Reports are saved in `lighthouse/` (HTML and JSON, git-ignored).

### BUG-020: Contact form could hang or confirm an unaccepted enquiry (P2), fixed 1 November
- **Tests:** TC-FORM-017, TC-FORM-018
- **Steps:**
  - (a) Make the form endpoint never answer: the button stays on "Sending…" for ever and the visitor cannot retry.
  - (b) Make it answer 200 with an HTML page (a proxy, captive portal or bot-challenge page): the visitor sees "Thank you" although nothing was accepted.
- **Fix:** every form request now times out after 15 seconds, and only a JSON reply that confirms success counts. Both cases show the failure message, keep the visitor's input and re-enable the button.
- **Regression tests:** two new e2e tests, passing in all six browser setups.

---

## Needs business-owner confirmation

### BUG-010: Site URLs point to a domain that does not load (P1)
- **Tests:** TC-SEO-002, TC-PROD-002
- `index.html` (canonical, `og:url`, `og:image`, JSON-LD), `robots.txt` and `sitemap.xml` all use `https://www.prostaffsolution.com/`. During testing that domain failed the HTTPS (TLS) connection.
- The deploy script publishes to GitHub Pages under `/prostaff-website/`, which currently returns 404 because the site is not deployed.
- If the site goes live on GitHub Pages as configured, search engines are told the real page is on a domain that does not work, and shared links show no preview image.
- **Owner decision needed:** the final public URL. Then either connect the custom domain (DNS, HTTPS and a `CNAME` file, which also means changing the `/prostaff-website/` base to `/`) or update these URLs to the GitHub Pages address.

### BUG-011: Legal entity name conflict (P1)
- **Test:** TC-CNT-003
- The page title, `og:title`, `package.json`, `privacy.html` and `terms.html` name "Prostaff Solution Pvt. Ltd."
- The About section and footer say Prostaff "is not a separate legal entity" and is "A Division of Dubey Enterprises".
- The LinkedIn URL slug includes "private-limited".
- The privacy policy and terms should name the actual legal entity. **Owner or legal decision needed.**

### BUG-012: Enquiry inbox and delivery (P1)
- **Tests:** TC-FORM-014 (pass), TC-FORM-016 and TC-FORM-023 (blocked)
- With no EmailJS keys configured, enquiries go to FormSubmit, addressed to `company.enquiryInbox` in `src/data/content.js`. That is a personal Gmail address, different from the public business email shown on the site.
- **1 November:** at your request, three real test enquiries were sent: one in the first session and two on 1 November. The second 1 November send was recorded: FormSubmit answered HTTP 200 `{"success":"true","message":"The form was submitted successfully."}`, which means the inbox is activated. Arrival in the inbox has **not** been confirmed by the inbox owner.
- The form can now also save each enquiry to the owner's Google Sheet (`google-apps-script/Code.gs`). This is not deployed yet.
- **Owner action:**
  - Confirm which inbox should receive enquiries. If it changes, activate FormSubmit for the new address.
  - Check that the test enquiries arrived.
  - Optionally deploy the Google Sheets script and send one test enquiry.

### BUG-013: Brand logos, statistics and testimonials (P2)
- **Test:** TC-CNT-004
- The page shows third-party trademarks (including Rolex, Apple, Versace, Valentino, Balenciaga, Sabyasachi) under "Trusted by Iconic Brands". It also claims "500+ Candidates Placed" and "100% Client Retention Rate", and includes named testimonials.
- **Owner action:** confirm permission for the logos and evidence for the figures and quotes. Do not publish them otherwise.

### BUG-018: LinkedIn URL spelling (P3)
- **Test:** TC-LNK-005
- The link is `linkedin.com/company/prostafff-solution-private-limited/`, with three "f"s. It may be the real slug, but please confirm it opens the official page.
