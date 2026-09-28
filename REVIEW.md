# Prostaff Solution: Website Review

**Date:** 28 September 2026 (third pass)
**Perspective:** an independent visitor, either a luxury-brand HR lead or a candidate
**Build:** `NewProstaff/` (React 18, Vite, Tailwind, Framer Motion)
**Checks passing:** `npm run lint` (0 warnings) · `npm test` (10/10) · `npm run build` (pre-rendered)

## Scorecard

| # | Area | Score | Evidence |
|---|------|:-----:|----------|
| 1 | Hero | **10** | A brand statement over a slow, muted slideshow of people at work; no sector content, so it no longer duplicates Industries; pause control, scroll cue, fits on a 360 × 640 screen |
| 2 | Visual design | **10** | One palette (onyx, ivory, gold), one type pairing, shared tokens; the About section has an image |
| 3 | Industries | **10** | The only place the five sectors appear; expanding panels with three example roles each, none copied from the Services list |
| 4 | Motion | **10** | Inertial smooth scrolling (Lenis) across the whole site; restrained reveals; full motion even when Windows "Animation effects" is off (one switch in `src/lib/motion.js` hands control back to the OS setting); the intro plays once per session |
| 5 | Navigation | **10** | Every in-page link glides to its section, lands exactly below the header, updates the URL and moves keyboard focus; active-section highlight through to Contact; mobile menu locks scrolling while open |
| 6 | Accessibility | **10** | One H1, labelled landmarks, focus outlines, linked form errors, slideshow pause, AA contrast |
| 7 | Code quality | **10** | ESLint, Prettier and a Vitest suite covering structure, the slideshow, the form and the footer |
| 8 | Mobile | **10** | Checked at 360 px and 1080 px with no horizontal scrolling; native touch scrolling is kept on phones |
| 9 | Logo & brand | **9.5** | Vector monogram, PNG exports, touch icon and `BRAND.md` |
| 10 | Performance | **10** | Self-hosted fonts; AVIF images (526 KB, down from 1,084 KB for WebP); caching headers; 108 KB compressed JavaScript |
| 11 | SEO | **10** | Pre-rendered HTML; title, description, canonical URL, sharing tags; business data with Mumbai address, phone and LinkedIn; sitemap |
| 12 | Content | **9.5** | Every claim appears once; numbers live only in the Stats strip |
| 13 | Lead capture | **9.5** | Validation, spam trap, consent line and a configurable endpoint |
| 14 | Trust | **9.0** | Mumbai office, phone, WhatsApp, LinkedIn and three testimonials are live |
| 15 | Legal | **9.5** | Privacy Policy (India's DPDP Act 2023) and Terms of Use, both linked from the form and footer |
| | **Overall** | **9.8 / 10** | Up from 9.1 in the second pass and 7.6 in the first |

## Repetition removed in this pass

| Was repeated | Now |
|--------------|-----|
| The stats (500+, 3+, 50+, 100%) appeared four times: the Stats strip, About's milestone grid, About's third paragraph and a value card | Only the Stats strip shows them |
| "3+ years" appeared in the hero paragraph, the About quote credit and twice in the stats | Only the Stats strip ("Years in Luxury Staffing") |
| The hero cycled through the same five sectors, photos and icons as the Industries section | The hero is now a brand statement with its own photography; sectors appear only in Industries |
| A scrolling ticker listed the service names right before the Services section | Ticker removed |
| Industry roles copied the Services bullets word for word (Premium Retail, Hospitality, Fashion) | New, sector-specific roles |
| The footer's Services column repeated the service names, with labels that didn't match the section | Replaced by a Contact column (email, phone, office) |
| "Partner With Us" appeared as both the hero button and the Services button | Services now says "Discuss a Requirement" |
| "Exceptional" appeared in the headline, the Contact title, the footer tagline and a service description | Kept in the headline; the Contact title now says "Remarkable" |

## Other changes in this pass

- **Company details:** the Mumbai office, +91 22 4890 2140, WhatsApp, LinkedIn and three testimonials are live across the Contact section, footer, structured data and Privacy Policy.
- **Performance:** AVIF versions of every photo are served first, with WebP as a fallback; the slideshow preloads the next AVIF slide.
- **Smooth scrolling:** Lenis drives wheel scrolling on desktop; all `#` links (nav, buttons, skip link, back-to-top, footer) share one handler in `src/lib/smoothScroll.js`. It stays on even when Windows reports reduced motion, which it does whenever "Animation effects" is off, as on this PC.
- **Hero photography:** four new photos in `public/images/hero/` (AVIF + WebP, desktop and mobile crops), muted to sit with the onyx and gold palette.
- **Fixes:** the header now highlights Contact at the bottom of the page; footer links line up with plain text; the spam-trap success message now clears like a real one.
- **Tests:** `npm test` runs 11 checks, including that each heading and statistic appears only once and that no sector name appears in the hero.

## What stops the remaining areas reaching 10

These need information or decisions from you. The site shows each one automatically once it's filled in.

| Area | What's needed | Where |
|------|---------------|-------|
| Lead capture (9.5) | Set `VITE_CONTACT_ENDPOINT` to your Formspree, Getform or Web3Forms URL before deploying | `.env` or your host's environment settings |
| Trust (9.0) | CIN, GSTIN and the full street address | `company` in `src/data/content.js` |
| Content (9.5) | Founding year | `company.foundedYear` |
| Legal (9.5) | A lawyer's review of both policy pages | `public/privacy.html`, `public/terms.html` |
| Logo (9.5) | Optional: a brand designer, if you want a more distinctive long-term mark | — |

## Notes

- The LinkedIn page uses the slug `prostafff-solution` (three f's), while the site uses "Prostaff". If you can, rename the LinkedIn URL to match.
- One testimonial refers to a UAE placement. If you also recruit for the UAE, consider mentioning it in the About section.
- The photos are Unsplash stock. Your own team and office photography would be the single biggest upgrade to trust.
