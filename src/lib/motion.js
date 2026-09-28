/**
 * Site-wide motion policy.
 *
 * Windows reports "prefers reduced motion" whenever Settings → Accessibility →
 * Visual effects → Animation effects is off, which is common on office PCs.
 * Honouring it there switches off smooth scrolling and every entrance
 * animation, so the brand experience is always shown in full. Set this to
 * `true` to hand control back to the visitor's OS setting.
 */
export const HONOUR_REDUCED_MOTION = false;

export const REDUCED_MOTION_QUERY = '(prefers-reduced-motion: reduce)';

export function prefersReducedMotion() {
  return (
    HONOUR_REDUCED_MOTION &&
    typeof window !== 'undefined' &&
    window.matchMedia(REDUCED_MOTION_QUERY).matches
  );
}
