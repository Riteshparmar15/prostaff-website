import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ArrowUp } from 'lucide-react';

const SHOW_AFTER = 600;

/** Floating gold button that appears once the visitor has scrolled a screen. */
export default function BackToTop() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > SHOW_AFTER);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <AnimatePresence>
      {visible && (
        <motion.a
          href="#home"
          aria-label="Back to top"
          initial={{ opacity: 0, y: 16, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 16, scale: 0.9 }}
          transition={{ duration: 0.35 }}
          className="group fixed bottom-6 right-6 z-40 flex h-12 w-12 items-center justify-center rounded-full border border-gold/50 bg-onyx/90 text-gold-light shadow-card-hover backdrop-blur transition-colors hover:bg-gold-gradient hover:text-onyx"
        >
          <ArrowUp
            aria-hidden="true"
            strokeWidth={1.5}
            className="h-5 w-5 transition-transform duration-300 group-hover:-translate-y-0.5"
          />
        </motion.a>
      )}
    </AnimatePresence>
  );
}
