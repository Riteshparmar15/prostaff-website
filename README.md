# Prostaff Solution Pvt. Ltd. — Premium Staffing Solutions

Single-page marketing site built with React 18, Vite, Tailwind CSS, Framer Motion and lucide-react.

## Run

```bash
npm install
npm run dev       # http://localhost:5173
npm run build     # production build in /dist, pre-rendered to static HTML
npm run preview   # serve the production build
npm run build:file  # single-file build in /dist-file; open dist-file/index.html by double-clicking
npm run images:hero -- <folder>  # rebuild hero crops (mobile / tablet / desktop) from ≥4000 px originals
npm run lint      # ESLint
npm test          # Vitest suite
npm run format    # Prettier
npm run test:e2e  # Playwright browser tests against the production build
```

## Deploy to Netlify

`netlify.toml` holds the build settings (`npm run build`, publish `dist`, Node 22); headers are in `public/_headers`.

- **From Git (recommended):** push this project to GitHub, then in Netlify choose *Add new site → Import an existing project* and pick the repository. Netlify builds and redeploys on every push.
- **Drag and drop:** run `npm run build`, then drop the `dist` folder on *Add new site → Deploy manually*. Repeat for every update.
- **Contact form:** add `VITE_SHEETS_ENDPOINT` (optional) under *Site configuration → Environment variables* and redeploy. Variables are read at build time, so drag-and-drop uploads need them in a local `.env` before `npm run build`.
- **Domain:** *Domain management → Add a domain*, then follow Netlify's DNS instructions in GoDaddy. Set the primary domain to match the canonical URL in `index.html`, `sitemap.xml` and `robots.txt` (currently `https://www.prostaffconsulting.com/`).

`npm run deploy:ghpages` still publishes to GitHub Pages under `/prostaff-website/`.

## Where things live

| Path | Purpose |
| --- | --- |
| `src/data/content.js` | Every line of copy, links, and the `company` details block |
| `tailwind.config.js` | Design tokens (colours, type scale, spacing, shadows, keyframes) |
| `src/index.css` | Base styles, glow/grain surfaces, marquee, button sheen, form fields |
| `src/components/ui/` | `Reveal`, `SectionHeading`, `Button`, `Logo`, `CountUp`, `RichText`, `BackToTop` |
| `src/components/` | One file per page section, in page order |
| `src/entry-server.jsx`, `scripts/prerender.mjs` | Build-time pre-rendering into `dist/index.html` |
| `public/images/industries/` | Hero slideshow and Industries photos (`<industry>.webp` desktop, `<industry>-mobile.webp` portrait) |
| `public/privacy.html`, `public/terms.html` | Standalone legal pages |
| `netlify.toml` | Netlify build settings |
| `public/_headers`, `vercel.json` | Caching and security headers for Netlify / Cloudflare Pages / Vercel |
| `google-apps-script/Code.gs` | Optional Google Sheets + email backup for enquiries |
| `BRAND.md` | Logo files, colours, clear space and type |

## Before launch

- Contact form emails: set the three `VITE_EMAILJS_*` keys (see `.env.example`) and paste `emails/enquiry-template.html` into your [EmailJS](https://www.emailjs.com) template for branded emails. Without them, the form emails `company.enquiryInbox` via [FormSubmit](https://formsubmit.co) (activate once from the first email it sends).
- Google Sheets copy of every enquiry (optional, runs alongside the email): follow the setup steps at the top of `google-apps-script/Code.gs`, then set `VITE_SHEETS_ENDPOINT` in `.env` and rebuild. The form confirms success when at least one channel saves the enquiry.
- Fill in the remaining `company` fields (CIN, GSTIN, street address, founding year) in `src/data/content.js`. Anything left `null` stays hidden.
- See `REVIEW.md` for the full list.
- `.backup/luxehire-version.zip` holds the previous LuxeHire build of this project.
