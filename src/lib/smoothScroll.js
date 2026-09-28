import Lenis from 'lenis';
import { HONOUR_REDUCED_MOTION, prefersReducedMotion } from './motion';

const SCROLL_DURATION = 1.4;
const easeOutExpo = (t) => (t === 1 ? 1 : 1 - 2 ** (-10 * t));

let lenis = null;
let locks = 0;

/** Pause page scrolling (overlays, menus). Calls nest; each lock needs an unlock. */
export function lockScroll() {
  locks += 1;
  if (locks > 1) return;
  document.body.style.overflow = 'hidden';
  lenis?.stop();
}

export function unlockScroll() {
  locks = Math.max(0, locks - 1);
  if (locks > 0) return;
  document.body.style.overflow = '';
  lenis?.start();
}

/** Glide to an element; both paths honour the CSS scroll-padding that clears the fixed header. */
export function scrollToTarget(target) {
  if (lenis) {
    lenis.scrollTo(target, { duration: SCROLL_DURATION, easing: easeOutExpo });
    return;
  }
  target.scrollIntoView();
}

// Move focus with the scroll so keyboard and screen-reader users land in the new section
function focusTarget(target) {
  if (!target.matches('a[href], button, input, select, textarea, [tabindex]')) {
    target.setAttribute('tabindex', '-1');
  }
  target.focus({ preventScroll: true });
}

function onAnchorClick(e) {
  if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) {
    return;
  }
  const link = e.target.closest?.('a[href^="#"]');
  const id = link?.getAttribute('href').slice(1);
  const target = id && document.getElementById(decodeURIComponent(id));
  if (!target) return;

  e.preventDefault();
  if (window.location.hash !== `#${id}`) window.history.pushState(null, '', `#${id}`);
  focusTarget(target);
  // Wait a frame so overlays closed by the same click can release their scroll lock
  requestAnimationFrame(() => scrollToTarget(target));
}

/** Site-wide inertial scrolling plus smooth in-page anchor navigation. Returns a cleanup. */
export function initSmoothScroll() {
  window.scrollTo(0, 0);
  if (!prefersReducedMotion() && !lenis) {
    lenis = new Lenis({
      lerp: 0.09,
      wheelMultiplier: 0.9,
      autoRaf: true,
      respectReducedMotion: HONOUR_REDUCED_MOTION,
    });
    if (locks > 0) lenis.stop();
  }
  document.addEventListener('click', onAnchorClick);

  return () => {
    document.removeEventListener('click', onAnchorClick);
    lenis?.destroy();
    lenis = null;
  };
}
