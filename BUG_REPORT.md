# Bug Report — Prostaff Solution website

Test date: 31 October 2026, updated 1 and 2 November 2026. Test case IDs refer to `TEST_CASES.md`. On 2 November the site went live at `https://prostaffconsulting.com` (Netlify), and the whole suite was re-run against it.

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
| BUG-010 | P1 | Fixed (2 Nov) | Canonical, social and sitemap URLs pointed to a domain that did not load |
| BUG-011 | P1 | Needs confirmation | Legal entity name conflicts across the site |
| BUG-012 | P2 | Mostly resolved; inbox choice needs confirmation | Enquiry inbox and real delivery |
| BUG-013 | P2 | Needs confirmation | Permission and evidence for brand logos, statistics and testimonials |
| BUG-014 | P3 | Fixed | Dev-dependency security advisories |
| BUG-015 | P3 | Fixed (Unsplash part needs confirmation) | Oversized images and remote hero photos |
| BUG-016 | P3 | Fixed (wording needs approval) | Privacy policy omitted the form processor; legal pages used Google Fonts |
| BUG-017 | P3 | Partly fixed | Hosting hardening observations (headers now confirmed live; no CSP) |
| BUG-018 | P3 | Needs confirmation | LinkedIn URL spelling |
| BUG-019 | P3 | Open (needs design approval) | Mobile Lighthouse performance 77: hero headline entrance delays the largest paint |
| BUG-020 | P2 | Fixed | Contact form could hang on "Sending…" or confirm an enquiry that was never accepted |
| BUG-021 | P3 | Fixed (2 Nov) | Footer "Privacy Policy" and "Terms of Use" links were 15px tall (WCAG 2.2 SC 2.5.8 asks for 24px) |
| BUG-022 | P3 | Fixed (2 Nov) | An unexpected reply from the form service threw a confusing error instead of the normal failure message |
| BUG-023 | P2 | Fixed in repo, **not deployed** | One click on "Send Message" did nothing if the last field typed was invalid (blur validation moved the button mid-click) |
| BUG-024 | P3 | Fixed in repo, **not deployed** | The "Message not sent" text ran past the form edge at 320px |
| BUG-025 | P2 | Fixed (never ran live) | The live e2e suite would have sent real enquiries through Netlify Forms |
| BUG-026 | P2 | Fixed in repo, **not deployed** (wording needs approval) | Privacy policy named the wrong form processors and claimed a Google Sheet copy that is not enabled |
| BUG-027 | P3 | Fixed in repo, **not deployed** | Names were over-strict: a surname written as an initial or a curly apostrophe was rejected |

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
- **2 Nov update:** the site is now on Netlify, so `public/_headers` applies. The live responses carry HSTS, `nosniff`, `X-Frame-Options`, `Referrer-Policy` and `Permissions-Policy`, and hashed assets are cached as immutable (TC-LIVE-005, TC-LIVE-010).
- **Still open:**
  - There is no Content-Security-Policy. It is a hardening step, not a defect, and it needs testing against the inline JSON-LD and the Unsplash and FormSubmit hosts before it is switched on.
  - Brand-strip captions on the home page use 9–10px text (for example "LUXURY WATCHES"). Readable text is normally 12px or more, but changing it alters the design, so it needs design approval.
  - A non-JSON 200 response from the form endpoint counted as success, and the footer legal links were 14px tall: fixed under BUG-020 and BUG-021.

### BUG-019: Mobile Lighthouse performance (P3, needs design approval)
- **Test:** TC-PERF-004
- Lighthouse on the local build, mobile (simulated slow 4G): performance 77; accessibility, best practices and SEO 100. FCP 3.0 s, LCP 3.9 s, TBT 190 ms, CLS 0.
- Desktop: performance 97; others 100. LCP 0.9 s.
- The largest element on mobile is the hero headline, and its entrance animation delays when it is painted. Showing the headline without the animated reveal would raise the score but changes the design.
- Reports are saved in `lighthouse/` (HTML and JSON, git-ignored).
- **2 Nov, live URL (Lighthouse 12.8.2, lab data):** mobile performance 85 (FCP 2.7 s, LCP 3.4 s, TBT 0 ms, CLS 0); desktop 97 (LCP 0.8 s, CLS 0.005). Accessibility, best practices and SEO are 100 on both. The mobile LCP of 3.4 s is above the 2.5 s target, and the cause is unchanged, so the item stays open pending design approval.

### BUG-020: Contact form could hang or confirm an unaccepted enquiry (P2), fixed 1 November
- **Tests:** TC-FORM-017, TC-FORM-018
- **Steps:**
  - (a) Make the form endpoint never answer: the button stays on "Sending…" for ever and the visitor cannot retry.
  - (b) Make it answer 200 with an HTML page (a proxy, captive portal or bot-challenge page): the visitor sees "Thank you" although nothing was accepted.
- **Fix:** every form request now times out after 15 seconds, and only a JSON reply that confirms success counts. Both cases show the failure message, keep the visitor's input and re-enable the button.
- **Regression tests:** two new e2e tests, passing in all six browser setups.

### BUG-021: Footer legal links too small to tap (P3, WCAG 2.2 SC 2.5.8), fixed 2 November
- **Tests:** TC-LIVE-016 (found by the live audit, which measured link boxes at 390px)
- **Steps:** open the live site at any width and measure the footer links "Privacy Policy" and "Terms of Use".
- **Actual:** each was 15px tall. Standalone links should be at least 24 × 24px. The "Privacy Policy" link inside the form's consent sentence is exempt because it sits in running text, and it was left alone.
- **Cause:** the links were plain inline text at 12px.
- **Fix:** `src/components/Footer.jsx` gives them `inline-flex min-h-[24px] items-center`. The text, colour and spacing look the same.
- **Regression tests:** two new tests in `e2e/layout-a11y.spec.js`: a size check on both links, and an axe `wcag22aa` scan. Both pass on desktop and mobile, locally and on the live site.

### BUG-022: Unexpected form reply produced a confusing error (P3), fixed 2 November
- **Tests:** TC-FORM-017
- In `src/components/Contact.jsx`, the form-endpoint error path read `data.message` when `data` could be `null` (a non-JSON reply), which threw "Cannot read properties of null" instead of the intended message. The visitor still saw the normal failure alert, but the logged error was wrong.
- **Fix:** `data?.message`. Existing tests for the non-JSON reply still pass.

---

## Found by the independent audit (2 November, evening)

BUG-023 and BUG-027 come from the form changes made earlier on 2 November (commit `0072b4e`), and BUG-024 and BUG-026 were in the same build. All four are live now. The fixes are committed in the repository and have **not** been deployed, as instructed. The live site keeps them until the owner pushes.

### BUG-023: A click on "Send Message" was swallowed (P2), fixed in repo
- **Test:** TC-FORM-028 (found by a new e2e test failing at every width)
- **Steps:** type a too-short message (for example "Hi") in the last field, then click "Send Message" once with the mouse.
- **Actual:** nothing happens. The field loses focus, its error message appears and pushes the button down before the mouse is released, so the browser drops the click. The visitor must click again.
- **Cause:** the on-blur validation added with the new form (`0072b4e`). The earlier live checks used scripted clicks, which do not move between press and release, so they missed it.
- **Fix:** `src/components/Contact.jsx` skips blur validation while the submit button is being pressed. Submit still validates every field, so nothing is lost.
- **Regression tests:** two e2e tests in `e2e/contact.spec.js` (invalid last field, then valid last field), passing in Chrome desktop, Chrome mobile emulation and Edge. **Not tested:** a real finger on a real phone, or Safari.

### BUG-024: Failure message overflowed the form at 320px (P3), fixed in repo
- **Test:** TC-RESP-010
- The "Message not sent" and "Message sent successfully" text could not wrap. The long email address in the message pushed it 41px past the form's right edge (the page itself did not scroll sideways).
- **Fix:** `min-w-0 break-words` on the message text in `Contact.jsx`.
- **Regression tests:** six widths (320, 375, 768, 1024, 1366, 1920) in three browser setups, checking the invalid, failure and success states.

### BUG-025: The live e2e suite could have sent real enquiries (P2), fixed before it ran live
- **Test:** TC-FORM-030
- `e2e/fixtures.js` intercepted FormSubmit, EmailJS and Google Sheets but not the new Netlify Forms request (a POST to `/`). Running `npm run test:live` would have sent a real enquiry from every form test.
- **Found by:** reading the fixture before running the live suite. The audit's automated runs were meant not to send real email (the new live test asserts the Netlify POST is intercepted), but the inbox was not re-checked afterwards.
- **Fix:** the fixture now answers any POST to `/` with a mocked 404, so the form uses its backup channel, which is also mocked.

### BUG-026: Privacy policy described the wrong processors (P2), fixed in repo
- **Test:** TC-CNT-006
- The policy said enquiries go through FormSubmit and that a copy is saved to the company's Google Sheet. Enquiries now go through Netlify Forms first (FormSubmit is only the backup), and the live site does not contain the Google Sheet channel at all.
- **Fix:** `public/privacy.html` now names Netlify as the receiver and FormSubmit as the backup, drops the Sheet claim and is dated 2 November 2026. **Owner or legal approval of the wording is still needed.**

### BUG-027: Name checks were too strict (P3), fixed in repo
- **Test:** TC-FORM-026
- The first version required 2 letters in both name fields and only accepted a straight apostrophe, which rejects surnames written as an initial ("Raman S") and names like O’Brien.
- **Fix:** only the first name needs 2 letters; the curly apostrophe is allowed. Covered by the 46 tests in `src/test/enquiry.test.js`.

---

## Resolved or mostly resolved after going live

### BUG-010: Site URLs pointed to a domain that did not load (P1), fixed 2 November
- **Tests:** TC-SEO-002, TC-PROD-002, TC-LIVE-001 to TC-LIVE-003, TC-LIVE-008, TC-LIVE-009
- **Before:** `index.html` (canonical, `og:url`, `og:image`, JSON-LD), `robots.txt` and `sitemap.xml` used `https://www.prostaffsolution.com/`, a domain that failed HTTPS, and nothing was deployed.
- **Fix:** the owner's domain is `prostaffconsulting.com`. The URLs were changed to `https://prostaffconsulting.com/` (the bare domain is Netlify's primary; `www` redirects to it), the site was deployed on Netlify, GoDaddy DNS was pointed at it, and a Let's Encrypt certificate was issued.
- **Verified live:** HTTP and `www` redirect correctly, the certificate is valid to 2027-01-30, TLS 1.2 and 1.3 only, every sitemap URL returns 200.
- **Note:** GitHub Pages no longer serves the domain. The old `gh-pages` branch was deleted from GitHub at the owner's request.

### BUG-012: Enquiry inbox and delivery (now P2), updated in the 2 Nov audit
- **Tests:** TC-FORM-014, TC-FORM-016, TC-FORM-025, TC-LIVE-018 (pass); TC-FORM-023 (blocked)
- **Resolved:** the owner moved the inbox to the business address `adarsh.dubeyenterprises@gmail.com`. Enquiries now go through Netlify Forms first (about 0.5 s) with FormSubmit as the automatic backup. In this session, a FormSubmit email (12:25 and 12:29) and a Netlify Forms email (12:37) were seen in that inbox, and the Netlify email notification is configured in the Netlify dashboard.
- **Still needs the owner:**
  - Netlify's free plan accepts 100 form submissions a month. Beyond that the form falls back to FormSubmit (slower, and its emails carry a "Sponsor" advertisement block).
  - Netlify's spam filter is not tested (TC-FORM-031). Check the spam list in the Netlify Forms page if an enquiry seems to be missing.
  - The Google Sheets channel is not enabled on the live site (TC-FORM-023). Optional.

---

## Needs business-owner confirmation

### BUG-011: Legal entity name conflict (P1)
- **Test:** TC-CNT-003
- The page title, `og:title`, `package.json`, `privacy.html` and `terms.html` name "Prostaff Solution Pvt. Ltd."
- The About section and footer say Prostaff "is not a separate legal entity" and is "A Division of Dubey Enterprises".
- The LinkedIn URL slug includes "private-limited".
- The privacy policy and terms should name the actual legal entity. **Owner or legal decision needed.**

### BUG-013: Brand logos, statistics and testimonials (P2)
- **Test:** TC-CNT-004
- The page shows third-party trademarks (including Rolex, Apple, Versace, Valentino, Balenciaga, Sabyasachi) under "Trusted by Iconic Brands". It also claims "500+ Candidates Placed" and "100% Client Retention Rate", and includes named testimonials.
- **Owner action:** confirm permission for the logos and evidence for the figures and quotes. Do not publish them otherwise.

### BUG-018: LinkedIn URL spelling (P3)
- **Test:** TC-LNK-005
- The link is `linkedin.com/company/prostafff-solution-private-limited/`, with three "f"s. It may be the real slug, but please confirm it opens the official page.
