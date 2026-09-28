import { motion } from 'framer-motion';
import useReducedMotion from '../../hooks/useReducedMotion';

/** Shared motion tokens — keep every entrance on the same curve. */
export const EASE_LUXE = [0.22, 1, 0.36, 1];
export const REVEAL_DURATION = 0.8;
export const REVEAL_OFFSET = 32;
export const STAGGER_STEP = 0.1;
export const HOVER_SPRING = { type: 'spring', stiffness: 300, damping: 24 };

/** Delay for the nth item of a staggered group. */
export const stagger = (index, base = 0, step = STAGGER_STEP) => base + index * step;

/**
 * Fade-up / lift wrapper.
 *  - Default: animates once when scrolled into view.
 *  - `onMount`: animates immediately on page load (used by the hero).
 *  - Renders static content when the user prefers reduced motion.
 */
export default function Reveal({
  as = 'div',
  delay = 0,
  onMount = false,
  className,
  children,
  ...rest
}) {
  const reduced = useReducedMotion();
  const Tag = motion[as] ?? motion.div;

  if (reduced) {
    const Static = as;
    return (
      <Static className={className} {...rest}>
        {children}
      </Static>
    );
  }

  const hidden = { opacity: 0, y: REVEAL_OFFSET };
  const shown = { opacity: 1, y: 0 };
  const trigger = onMount
    ? { animate: shown }
    : { whileInView: shown, viewport: { once: true, margin: '-80px' } };

  return (
    <Tag
      className={className}
      initial={hidden}
      {...trigger}
      transition={{ duration: REVEAL_DURATION, ease: EASE_LUXE, delay }}
      {...rest}
    >
      {children}
    </Tag>
  );
}
