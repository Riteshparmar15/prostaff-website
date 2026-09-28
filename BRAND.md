# Prostaff Solution: Brand Guide

## Logo

The mark is a **PS monogram inside a double square frame**, drawn as gold strokes. The full lockup adds a thin gold divider, the **PROSTAFF** wordmark (Playfair Display 500) and **SOLUTION** below it (Inter 500, wide tracking).

| File | Use |
| --- | --- |
| `public/logo.svg` | Full lockup, dark text, for light backgrounds |
| `public/logo-dark.svg` | Full lockup on an onyx panel, for dark backgrounds |
| `public/logo-mark.svg` | Monogram only, transparent background |
| `public/favicon.svg` | Browser tab icon (heavier strokes for small sizes) |
| `public/apple-touch-icon.png` | 180 px home-screen icon |
| `public/brand/logo-mark-512.png`, `-1024.png` | Monogram PNG, transparent |
| `public/brand/logo-mark-dark-512.png`, `-1024.png` | Monogram PNG on onyx, for social avatars |

The SVG lockups use live text. Before sending them to a printer, open them in a vector editor and convert the text to outlines so the fonts don't get substituted.

## Clear space and size

- Keep clear space on every side equal to **the height of the "P"** (roughly a quarter of the mark's width).
- Minimum size: **24 px** (screen) or **8 mm** (print) for the monogram, and **120 px** or **30 mm** wide for the full lockup.
- Do not stretch, rotate, recolour, add shadows, or place it on busy photos without a dark overlay.

## Colour

| Name | Hex | Use |
| --- | --- | --- |
| Onyx | `#0F1115` | Primary dark background |
| Midnight | `#151A26` | Secondary dark surface |
| Ivory | `#FBF8F3` | Primary light background, text on dark |
| Champagne | `#F1E9DC` | Alternate light section |
| Sand | `#E6DAC6` | Borders and dividers on light |
| Gold | `#B8955A` | Brand accent, rules, icons |
| Gold light | `#D9BE8B` | Accent text on dark |
| Gold deep | `#7A5C30` | Small gold text on light (passes WCAG AA) |
| Ink | `#1B1B1F` | Body text on light |
| Stone | `#6F6A62` | Secondary text on light |

The logo gradient runs `#EBD6A8` to `#C9A96E` to `#9C7A4B`, top-left to bottom-right.

Gold is the only accent colour. Don't introduce other hues.

## Type

- **Playfair Display** (400, 500, 600, 400 italic) for headings. Use the italic in gold for a single emphasised word.
- **Inter** (300 to 600) for body text, labels and buttons.
- Eyebrow labels are uppercase Inter at 12 px with 0.3em tracking.

Both fonts are self-hosted through `@fontsource`, so no request goes to Google.
