import { Fragment, useEffect, useRef, useState } from 'react';
import {
  AnimatePresence,
  motion,
  useInView,
  useMotionValue,
  useScroll,
  useSpring,
  useTransform,
} from 'framer-motion';
import { Pause, Play } from 'lucide-react';
import { hero } from '../data/content';
import Button from './ui/Button';
import Reveal, { EASE_LUXE, stagger } from './ui/Reveal';
import useReducedMotion from '../hooks/useReducedMotion';
import { INTRO_DELAY } from '../lib/intro';

const LOAD_DELAY = 0.35 + INTRO_DELAY;
const LINE_STEP = 0.14;
const WORD_STEP = 0.07;
const SLIDE_MS = 7000;
const WIPE_S = 1.4;
const POINTER_SPRING = { stiffness: 70, damping: 20, mass: 0.6 };

const slides = hero.slides;
const pad = (n) => String(n).padStart(2, '0');

// Art-directed crops with non-overlapping media; widths must match scripts/hero-images.mjs
const HERO_VARIANTS = [
  {
    name: 'mobile',
    media: '(max-width: 767px) and (orientation: portrait)',
    widths: [640, 1080],
  },
  {
    name: 'tablet',
    media: '(min-width: 768px) and (max-width: 1199px) and (orientation: portrait)',
    widths: [1024, 1600],
  },
  {
    name: 'desktop',
    media: '(min-width: 1200px), (orientation: landscape)',
    widths: [1280, 1920, 2560],
  },
];
const DESKTOP = HERO_VARIANTS[2];
// The image layer overhangs the viewport by 2.5rem each side for parallax and pointer depth
const HERO_SIZES = 'calc(100vw + 5rem)';

const srcSet = (slide, { name, widths }, ext) =>
  widths.map((w) => `${slide.base}-${name}-${w}.${ext} ${w}w`).join(', ');

// Media-scoped, typed preload hints: only the matching crop is fetched, and only if AVIF decodes
function preload(slide) {
  if (typeof document === 'undefined') return;
  HERO_VARIANTS.forEach((variant) => {
    const imagesrcset = srcSet(slide, variant, 'avif');
    if (document.head.querySelector(`link[imagesrcset="${imagesrcset}"]`)) return;
    const link = document.createElement('link');
    link.rel = 'preload';
    link.as = 'image';
    link.type = 'image/avif';
    link.media = variant.media;
    link.setAttribute('imagesrcset', imagesrcset);
    link.setAttribute('imagesizes', HERO_SIZES);
    document.head.appendChild(link);
  });
}

const hasFinePointer = () =>
  typeof window !== 'undefined' && window.matchMedia('(hover: hover) and (pointer: fine)').matches;

/**
 * Headline line whose words flip up out of the page in 3D.
 * Accepts the same segment arrays as RichText.
 */
function FlipLine({ segments, delay, reduced }) {
  let index = 0;
  return segments.map((seg, s) => {
    const words = seg.text.trim().split(/\s+/);
    const accent = seg.em ? 'font-normal italic text-gold-light' : '';
    return (
      <Fragment key={s}>
        {words.map((word, w) => {
          const at = delay + index++ * WORD_STEP;
          return (
            <Fragment key={w}>
              <motion.span
                className={`inline-block will-change-transform ${accent}`}
                style={{ transformOrigin: '50% 100% -20px' }}
                initial={reduced ? false : { opacity: 0, rotateX: -70, y: '30%' }}
                animate={{ opacity: 1, rotateX: 0, y: 0 }}
                transition={{ duration: 1.1, ease: EASE_LUXE, delay: at }}
              >
                {word}
              </motion.span>{' '}
            </Fragment>
          );
        })}
      </Fragment>
    );
  });
}

export default function Hero() {
  const ref = useRef(null);
  const reduced = useReducedMotion();
  const inView = useInView(ref, { amount: 0.3 });
  const [active, setActive] = useState(0);
  const [changes, setChanges] = useState(0);
  const [ready, setReady] = useState(false);
  const [tilt, setTilt] = useState(false);
  const [paused, setPaused] = useState(false);
  const lineCount = hero.headingLines.length;
  const current = slides[active];
  const playing = ready && inView && !reduced && !paused && slides.length > 1;
  const depth = tilt && !reduced;

  const progress = useMotionValue(0);

  /* ── Scroll: background drifts, content tilts back into the page ── */
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end start'] });
  const imageY = useTransform(scrollYProgress, [0, 1], ['0%', '18%']);
  const imageScale = useTransform(scrollYProgress, [0, 1], [1, 1.12]);
  const contentY = useTransform(scrollYProgress, [0, 1], ['0%', '-10%']);
  const contentRotateX = useTransform(scrollYProgress, [0, 0.8], [0, 8]);
  const contentScale = useTransform(scrollYProgress, [0, 0.8], [1, 0.94]);
  const contentOpacity = useTransform(scrollYProgress, [0, 0.7], [1, 0]);

  /* ── Pointer: layers move at different depths ── */
  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const sx = useSpring(mx, POINTER_SPRING);
  const sy = useSpring(my, POINTER_SPRING);
  const bgX = useTransform(sx, [-0.5, 0.5], [14, -14]);
  const bgY = useTransform(sy, [-0.5, 0.5], [10, -10]);
  const textX = useTransform(sx, [-0.5, 0.5], [-5, 5]);
  const textY = useTransform(sy, [-0.5, 0.5], [-3, 3]);

  useEffect(() => setTilt(hasFinePointer()), []);

  const onPointerMove = (e) => {
    if (!depth) return;
    const r = e.currentTarget.getBoundingClientRect();
    mx.set((e.clientX - r.left) / r.width - 0.5);
    my.set((e.clientY - r.top) / r.height - 0.5);
  };
  const onPointerLeave = () => {
    mx.set(0);
    my.set(0);
  };

  // Hold the first slide until the intro and headline have played
  useEffect(() => {
    const t = setTimeout(() => setReady(true), LOAD_DELAY * 1000);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    preload(slides[(active + 1) % slides.length]);
  }, [active]);

  // One clock drives both the progress line and the slide change, so pausing freezes both
  useEffect(() => {
    if (!playing) return undefined;
    let raf;
    let last = performance.now();
    const tick = (now) => {
      const next = progress.get() + (now - last) / SLIDE_MS;
      last = now;
      if (next >= 1) {
        progress.set(0);
        setActive((active + 1) % slides.length);
        setChanges((c) => c + 1);
        return;
      }
      progress.set(next);
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [active, playing, progress]);

  return (
    <section
      ref={ref}
      id="home"
      aria-labelledby="hero-title"
      onPointerMove={onPointerMove}
      onPointerLeave={onPointerLeave}
      className="relative isolate flex min-h-screen min-h-[100svh] flex-col overflow-hidden bg-onyx"
    >
      {/* ── Background: scroll parallax → pointer depth → 3D wipe between slides ── */}
      <motion.div
        style={reduced ? undefined : { y: imageY, scale: imageScale }}
        className="absolute inset-0 -z-20"
      >
        <motion.div
          style={depth ? { x: bgX, y: bgY } : undefined}
          className="absolute -inset-10 [perspective:1400px]"
        >
          <AnimatePresence initial={false}>
            <motion.picture
              key={current.base}
              className="absolute inset-0 block origin-center will-change-transform"
              initial={{
                zIndex: 1,
                clipPath: 'inset(0% 0% 0% 100%)',
                rotateY: -4,
                scale: 1.08,
              }}
              animate={{ zIndex: 1, clipPath: 'inset(0% 0% 0% 0%)', rotateY: 0, scale: 1 }}
              exit={{ zIndex: 0, rotateY: 3, scale: 0.97, opacity: 0.4 }}
              transition={{ duration: WIPE_S, ease: EASE_LUXE }}
            >
              {HERO_VARIANTS.flatMap((variant) =>
                ['avif', 'webp'].map((ext) => (
                  <source
                    key={`${variant.name}-${ext}`}
                    media={variant.media}
                    srcSet={srcSet(current, variant, ext)}
                    sizes={HERO_SIZES}
                    type={`image/${ext}`}
                  />
                )),
              )}
              <motion.img
                src={`${current.base}-desktop-1920.webp`}
                srcSet={srcSet(current, DESKTOP, 'webp')}
                sizes={HERO_SIZES}
                alt=""
                width="1920"
                height="1080"
                fetchpriority={active === 0 ? 'high' : undefined}
                decoding="async"
                className="h-full w-full object-cover saturate-[0.6]"
                initial={reduced ? false : { scale: 1.1 }}
                animate={{ scale: 1 }}
                transition={{ duration: SLIDE_MS / 1000 + 2, ease: 'linear' }}
              />
            </motion.picture>
          </AnimatePresence>
        </motion.div>
      </motion.div>

      {/* Gold light edge that rides the wipe */}
      {changes > 0 && !reduced && (
        <motion.span
          key={changes}
          aria-hidden="true"
          className="pointer-events-none absolute inset-y-0 -z-10 w-px bg-gradient-to-b from-transparent via-gold-light to-transparent shadow-[0_0_24px_4px_rgba(217,190,139,0.45)]"
          initial={{ left: '100%', opacity: 1 }}
          animate={{ left: '0%', opacity: [1, 1, 0] }}
          transition={{
            duration: WIPE_S,
            ease: EASE_LUXE,
            opacity: { duration: WIPE_S, times: [0, 0.7, 1] },
          }}
        />
      )}

      {/* Legibility overlays + warm radial glow */}
      <div aria-hidden="true" className="absolute inset-0 -z-10 bg-hero-overlay" />
      <div aria-hidden="true" className="absolute inset-0 -z-10 bg-onyx/45 md:bg-onyx/30" />
      <div aria-hidden="true" className="absolute inset-0 -z-10 bg-hero-glow" />
      <div
        aria-hidden="true"
        className="absolute inset-x-0 bottom-0 -z-10 h-72 bg-gradient-to-t from-onyx via-onyx/70 to-transparent"
      />

      <motion.div
        style={
          reduced
            ? undefined
            : {
                y: contentY,
                rotateX: contentRotateX,
                scale: contentScale,
                opacity: contentOpacity,
                transformPerspective: 1200,
                transformOrigin: '50% 100%',
              }
        }
        className="container-luxe flex flex-1 items-center pb-6 pt-24 sm:pb-8 sm:pt-28 md:pt-32"
      >
        <motion.div style={depth ? { x: textX, y: textY } : undefined} className="max-w-4xl">
          <Reveal
            as="p"
            onMount
            delay={LOAD_DELAY}
            className="eyebrow flex items-center gap-4 text-gold-light"
          >
            <motion.span
              aria-hidden="true"
              className="hidden h-px w-10 origin-left bg-gold-light sm:block"
              initial={reduced ? false : { scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ duration: 1, ease: EASE_LUXE, delay: LOAD_DELAY + 0.2 }}
            />
            {hero.eyebrow}
          </Reveal>

          <h1
            id="hero-title"
            className="mt-5 text-h1 font-normal text-ivory max-sm:text-[2.3rem] sm:mt-6"
          >
            {hero.headingLines.map((line, i) => (
              <span key={i} className="block pb-1 [perspective:900px]">
                <FlipLine
                  segments={line}
                  delay={stagger(i + 1, LOAD_DELAY, LINE_STEP * 2)}
                  reduced={reduced}
                />
              </span>
            ))}
          </h1>

          <Reveal
            as="p"
            onMount
            delay={stagger(lineCount + 2, LOAD_DELAY, LINE_STEP * 2)}
            className="mt-4 max-w-xl text-body-sm text-ivory/75 sm:mt-6 sm:text-body md:text-lg md:leading-relaxed"
          >
            {hero.subheading}
          </Reveal>

          <Reveal
            onMount
            delay={stagger(lineCount + 3, LOAD_DELAY, LINE_STEP * 2)}
            className="mt-6 flex flex-col gap-3 xs:flex-row xs:flex-wrap sm:mt-10 sm:gap-4"
          >
            <Button href={hero.primaryCta.href} variant="gold" arrow className="max-sm:py-3">
              {hero.primaryCta.label}
            </Button>
            <Button href={hero.secondaryCta.href} variant="outline-light" className="max-sm:py-3">
              {hero.secondaryCta.label}
            </Button>
          </Reveal>
        </motion.div>
      </motion.div>

      {/* ── Footer rail: scroll cue + ambient slideshow controls ── */}
      <Reveal
        onMount
        delay={stagger(lineCount + 4, LOAD_DELAY, LINE_STEP * 2)}
        className="container-luxe flex items-center justify-between gap-6 pb-6 sm:pb-8 md:pb-10"
      >
        <a
          href={hero.scrollCue.href}
          className="group flex items-center gap-4 text-ivory/65 transition-colors duration-300 hover:text-gold-light"
        >
          <span
            aria-hidden="true"
            className="relative block h-10 w-px overflow-hidden bg-ivory/20 sm:h-12"
          >
            {!reduced && (
              <motion.span
                className="absolute inset-x-0 top-0 block h-1/2 bg-gold-gradient"
                animate={{ y: ['-100%', '200%'] }}
                transition={{ duration: 2.2, ease: EASE_LUXE, repeat: Infinity, repeatDelay: 0.4 }}
              />
            )}
          </span>
          <span className="font-sans text-micro font-medium uppercase tracking-eyebrow">
            {hero.scrollCue.label}
          </span>
        </a>

        {slides.length > 1 && (
          <div className="flex items-center gap-4">
            <p
              aria-hidden="true"
              className="font-sans text-micro font-medium uppercase tracking-eyebrow text-ivory/55"
            >
              <span className="text-gold-light">{pad(active + 1)}</span> / {pad(slides.length)}
            </p>
            <span aria-hidden="true" className="relative block h-px w-16 bg-ivory/20 sm:w-24">
              <motion.span
                className="absolute inset-0 block origin-left bg-gold-gradient"
                style={{ scaleX: reduced ? 1 : progress }}
              />
            </span>
            {!reduced && (
              <button
                type="button"
                onClick={() => setPaused((p) => !p)}
                aria-label={paused ? 'Play background slideshow' : 'Pause background slideshow'}
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-ivory/25 text-ivory/70 transition-colors duration-300 hover:border-gold hover:text-gold-light"
              >
                {paused ? (
                  <Play
                    aria-hidden="true"
                    strokeWidth={1.5}
                    className="h-3.5 w-3.5 translate-x-px"
                  />
                ) : (
                  <Pause aria-hidden="true" strokeWidth={1.5} className="h-3.5 w-3.5" />
                )}
              </button>
            )}
          </div>
        )}
      </Reveal>
    </section>
  );
}
