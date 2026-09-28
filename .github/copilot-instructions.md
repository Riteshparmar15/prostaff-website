# Prostaff Solution

## Project

- This is a React 18 single-page marketing site built with Vite.
- Use the existing component structure in `src/components/` and keep page copy in `src/data/content.js`.
- Preserve the existing visual language, responsive behavior, accessibility support, and reduced-motion handling.
- Reuse existing UI components and helpers in `src/components/ui/`, `src/hooks/`, and `src/lib/` before adding new abstractions.
- Keep public/legal pages and generated output behavior compatible with the existing Vite and prerender scripts.

## Validation

- Run `npm run lint` for ESLint checks.
- Run `npm test` for the Vitest suite.
- Run `npm run build` when changes affect production output, routing, SEO, or prerendering.
- Do not edit `dist/`, `dist-ssr/`, or `dist-file/` directly; regenerate them with the relevant npm script.

## Conventions

- Keep edits focused and preserve existing APIs and styling conventions.
- Use accessible landmarks, labels, keyboard focus states, and semantic controls for interactive UI.
- Keep content data-driven where the repository already uses data modules.
- Do not commit `.env` files or secrets; use `.env.example` for documented configuration.