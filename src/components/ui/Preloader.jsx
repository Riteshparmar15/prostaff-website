import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { brand } from '../../data/content';
import { LogoMark } from './Logo';
import { EASE_LUXE } from './Reveal';
import { INTRO_MS, SHOW_INTRO, markIntroSeen } from '../../lib/intro';
import { lockScroll, unlockScroll } from '../../lib/smoothScroll';

/** Brand intro: the logo draws itself on onyx, then the curtain lifts. */
export default function Preloader() {
  const [visible, setVisible] = useState(SHOW_INTRO);

  useEffect(() => {
    if (!visible) return undefined;
    markIntroSeen();
    lockScroll();
    const timer = setTimeout(() => setVisible(false), INTRO_MS);
    return () => {
      clearTimeout(timer);
      unlockScroll();
    };
  }, [visible]);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          key="preloader"
          role="presentation"
          exit={{ y: '-100%' }}
          transition={{ duration: 0.9, ease: EASE_LUXE }}
          className="surface-grain fixed inset-0 z-[70] flex flex-col items-center justify-center bg-onyx"
        >
          <div aria-hidden="true" className="absolute inset-0 -z-10 bg-intro-glow" />

          <LogoMark className="h-20 w-20 md:h-24 md:w-24" />

          <motion.p
            className="wordmark-light mt-8 font-serif text-2xl font-medium uppercase md:text-3xl"
            initial={{ opacity: 0, letterSpacing: '0.7em' }}
            animate={{ opacity: 1, letterSpacing: '0.28em' }}
            transition={{ duration: 0.9, ease: EASE_LUXE, delay: 0.35 }}
          >
            {brand.wordmark}
          </motion.p>
          <motion.p
            className="mt-3 flex items-center gap-3 text-micro font-medium uppercase tracking-eyebrow text-gold-light"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.6 }}
          >
            <span aria-hidden="true" className="h-px w-6 bg-gold/70" />
            {brand.wordmarkSub}
            <span aria-hidden="true" className="h-px w-6 bg-gold/70" />
          </motion.p>

          {/* Loading hairline */}
          <motion.span
            aria-hidden="true"
            className="absolute bottom-16 h-px w-40 origin-left bg-gold-gradient"
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ duration: INTRO_MS / 1000 - 0.2, ease: 'easeInOut' }}
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
}
