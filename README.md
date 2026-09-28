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
```

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
| `public/_headers`, `vercel.json` | Caching and security headers for Netlify / Cloudflare Pages / Vercel |
| `BRAND.md` | Logo files, colours, clear space and type |

## Before launch

- Set `VITE_CONTACT_ENDPOINT` (see `.env.example`). In dev, `vite.config.js` mocks `POST /api/contact`.
- Fill in the remaining `company` fields (CIN, GSTIN, street address, founding year) in `src/data/content.js`. Anything left `null` stays hidden.
- See `REVIEW.md` for the full list.
- `.backup/luxehire-version.zip` holds the previous LuxeHire build of this project.
