import { useEffect, useRef, useState } from 'react';
import { animate, useInView } from 'framer-motion';
import useReducedMotion from '../../hooks/useReducedMotion';

const COUNT_DURATION = 1.6;

/** Counts from 0 to `value` once the number scrolls into view. */
export default function CountUp({ value, suffix = '', suffixClassName = '' }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-60px' });
  const reduced = useReducedMotion();
  const [display, setDisplay] = useState(reduced ? value : 0);

  useEffect(() => {
    if (reduced) {
      setDisplay(value);
      return undefined;
    }
    if (!inView) return undefined;
    const controls = animate(0, value, {
      duration: COUNT_DURATION,
      ease: 'easeOut',
      onUpdate: (v) => setDisplay(Math.round(v)),
    });
    return () => controls.stop();
  }, [inView, reduced, value]);

  return (
    <span ref={ref} className="tabular-nums">
      {/* Screen readers get the final figure, not every intermediate frame */}
      <span aria-hidden="true">
        {display}
        <span className={suffixClassName}>{suffix}</span>
      </span>
      <span className="sr-only">
        {value}
        {suffix}
      </span>
    </span>
  );
}
