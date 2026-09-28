/**
 * Brand intro (preloader) timing. The intro plays once per browser session
 * and never for visitors who prefer reduced motion. Entrance animations
 * elsewhere add INTRO_DELAY so they start as the intro lifts.
 */
import { prefersReducedMotion } from './motion';

const STORAGE_KEY = 'ps-intro-seen';
const hasWindow = typeof window !== 'undefined';

export const SHOW_INTRO =
  hasWindow && !prefersReducedMotion() && !window.sessionStorage.getItem(STORAGE_KEY);
export const INTRO_MS = 1600;
export const INTRO_DELAY = SHOW_INTRO ? INTRO_MS / 1000 : 0;

export const markIntroSeen = () => {
  if (hasWindow) window.sessionStorage.setItem(STORAGE_KEY, '1');
};
