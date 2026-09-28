import { useId, useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { brand } from '../../data/content';
import { EASE_LUXE } from './Reveal';
import useReducedMotion from '../../hooks/useReducedMotion';

/*
 * Prostaff Solution logo
 * ──────────────────────
 * A geometric "PS" monogram drawn as vector strokes (so it renders identically
 * everywhere, independent of web fonts), framed by a double gold keyline.
 * Keep in sync with public/logo*.svg and public/favicon.svg.
 */
const PATHS = {
  frame: 'M1 1H47V47H1Z',
  inner: 'M4 4H44V44H4Z',
  p: 'M10.9 35V13h6.25a5.75 5.75 0 0 1 0 11.5H10.9',
  s: 'M37.1 15.8C35.6 14 33.9 13 31.5 13c-3.1 0-5.5 2.2-5.5 5.1 0 6 11.1 4.1 11.1 11.5 0 3.1-2.5 5.4-5.8 5.4-2.6 0-4.5-1.1-6-3.2',
};

function GoldGradient({ id }) {
  return (
    <linearGradient id={id} x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stopColor="#EBD6A8" />
      <stop offset="50%" stopColor="#C9A96E" />
      <stop offset="100%" stopColor="#9C7A4B" />
    </linearGradient>
  );
}

/**
 * The monogram. Draws itself in on mount (frame → P → S), then a single
 * glint sweeps across. Hover effects are driven by a parent `group` class.
 */
export function LogoMark({ className = 'h-11 w-11', delay = 0, animate = true, title }) {
  const reduced = useReducedMotion();
  const uid = useId().replace(/:/g, '');
  const gold = `url(#ps-gold-${uid})`;
  const play = animate && !reduced;

  const draw = (at, duration = 1.2) =>
    play
      ? {
          initial: { pathLength: 0, opacity: 0 },
          animate: { pathLength: 1, opacity: 1 },
          transition: {
            pathLength: { duration, ease: EASE_LUXE, delay: delay + at },
            opacity: { duration: 0.2, delay: delay + at },
          },
        }
      : {};

  return (
    <svg
      viewBox="0 0 48 48"
      className={className}
      role={title ? 'img' : undefined}
      aria-hidden={title ? undefined : 'true'}
      aria-label={title}
    >
      <defs>
        <GoldGradient id={`ps-gold-${uid}`} />
        <linearGradient id={`ps-glint-${uid}`} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#FFF6E0" stopOpacity="0" />
          <stop offset="50%" stopColor="#FFF6E0" stopOpacity="0.55" />
          <stop offset="100%" stopColor="#FFF6E0" stopOpacity="0" />
        </linearGradient>
        <clipPath id={`ps-clip-${uid}`}>
          <rect width="48" height="48" />
        </clipPath>
      </defs>

      <motion.path d={PATHS.frame} fill="none" stroke={gold} strokeWidth="1.2" {...draw(0, 1.4)} />
      <g className="opacity-60 transition-opacity duration-500 group-hover:opacity-100">
        <motion.path
          d={PATHS.inner}
          fill="none"
          stroke={gold}
          strokeWidth="0.5"
          initial={play ? { opacity: 0 } : false}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: delay + 0.7 }}
        />
      </g>

      <motion.path d={PATHS.p} fill="none" stroke={gold} strokeWidth="2.6" {...draw(0.55, 1)} />
      <motion.path d={PATHS.s} fill="none" stroke={gold} strokeWidth="2.6" {...draw(0.8, 1.1)} />

      {play && (
        <g clipPath={`url(#ps-clip-${uid})`}>
          <motion.rect
            y="-12"
            width="14"
            height="72"
            fill={`url(#ps-glint-${uid})`}
            transform="rotate(20 24 24)"
            initial={{ x: -30 }}
            animate={{ x: 70 }}
            transition={{ duration: 1.1, ease: 'easeInOut', delay: delay + 1.9 }}
          />
        </g>
      )}
    </svg>
  );
}

/**
 * Circular seal: the monogram ringed by slowly rotating brand text.
 * Used in the footer.
 */
export function LogoSeal({ className = 'h-32 w-32', delay = 0, text }) {
  const reduced = useReducedMotion();
  const uid = useId().replace(/:/g, '');
  const ref = useRef(null);
  // Mount the monogram on first view so its draw-in plays where it can be seen
  const inView = useInView(ref, { once: true, margin: '-40px' });
  const ringText = text ?? `${brand.wordmark} ${brand.wordmarkSub} ✦ Premium Staffing Solutions ✦ `;

  return (
    <div ref={ref} className={`group relative ${className}`}>
      <svg
        viewBox="0 0 120 120"
        aria-hidden="true"
        className={`absolute inset-0 h-full w-full ${reduced ? '' : 'animate-spin-slow'}`}
      >
        <defs>
          <path id={`seal-${uid}`} d="M60 60m-49 0a49 49 0 1 1 98 0a49 49 0 1 1-98 0" />
        </defs>
        <text
          className="fill-gold-light font-sans text-[8.2px] font-medium uppercase"
          letterSpacing="3.1"
        >
          <textPath href={`#seal-${uid}`} startOffset="0">
            {ringText}
          </textPath>
        </text>
      </svg>
      <div className="absolute inset-[27%]">
        {(inView || reduced) && <LogoMark className="h-full w-full" delay={delay} />}
      </div>
    </div>
  );
}

/** Full lockup: monogram + divider + wordmark. Links back to the top of the page. */
export default function Logo({ tone = 'light', delay = 0, className = '' }) {
  const reduced = useReducedMotion();
  const light = tone === 'light';

  return (
    <a
      href="#home"
      aria-label={`${brand.name} — back to top`}
      className={`group inline-flex items-center gap-3.5 ${className}`}
    >
      <LogoMark
        className="h-11 w-11 transition-transform duration-700 ease-luxe group-hover:scale-106"
        delay={delay}
      />

      <motion.span
        aria-hidden="true"
        className="h-9 w-px origin-top bg-gold/40"
        initial={reduced ? false : { scaleY: 0 }}
        animate={{ scaleY: 1 }}
        transition={{ duration: 0.8, ease: EASE_LUXE, delay: delay + 0.4 }}
      />

      <span className="flex flex-col leading-none">
        <motion.span
          className={`font-serif text-xl font-medium uppercase ${light ? 'wordmark-light' : 'wordmark-dark'}`}
          initial={reduced ? false : { opacity: 0, letterSpacing: '0.45em' }}
          animate={{ opacity: 1, letterSpacing: '0.2em' }}
          transition={{ duration: 1.2, ease: EASE_LUXE, delay: delay + 0.5 }}
        >
          {brand.wordmark}
        </motion.span>
        <motion.span
          className="mt-2 font-sans text-micro font-medium uppercase tracking-[0.42em] text-gold-light"
          initial={reduced ? false : { opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: delay + 1 }}
        >
          {brand.wordmarkSub}
        </motion.span>
      </span>
    </a>
  );
}
