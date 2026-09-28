import { useEffect, useState } from 'react';
import { HONOUR_REDUCED_MOTION, REDUCED_MOTION_QUERY, prefersReducedMotion } from '../lib/motion';

/**
 * Returns `true` when motion should be minimised (see lib/motion.js).
 * Stays in sync if the preference changes while the page is open.
 */
export default function useReducedMotion() {
  const [reduced, setReduced] = useState(prefersReducedMotion);

  useEffect(() => {
    if (!HONOUR_REDUCED_MOTION) return undefined;
    const mql = window.matchMedia(REDUCED_MOTION_QUERY);
    const onChange = (e) => setReduced(e.matches);
    mql.addEventListener('change', onChange);
    return () => mql.removeEventListener('change', onChange);
  }, []);

  return reduced;
}
