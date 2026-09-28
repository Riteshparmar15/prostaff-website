import { useEffect, useState } from 'react';
import { AnimatePresence, motion, useScroll, useSpring } from 'framer-motion';
import { Menu, X } from 'lucide-react';
import { nav } from '../data/content';
import Button from './ui/Button';
import Logo from './ui/Logo';
import { EASE_LUXE, stagger } from './ui/Reveal';
import { INTRO_DELAY } from '../lib/intro';
import { lockScroll, unlockScroll } from '../lib/smoothScroll';

const SCROLL_THRESHOLD = 40;
const SPY_OFFSET = 140;

/** Id of the last nav section whose top has scrolled past the header. */
function getActiveSection() {
  // The last section can be too short to reach the header, so the page end selects it
  const atBottom = window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 2;
  if (atBottom) return nav.links[nav.links.length - 1].id;
  let current = nav.links[0].id;
  nav.links.forEach(({ id }) => {
    const el = document.getElementById(id);
    if (el && el.getBoundingClientRect().top <= SPY_OFFSET) current = id;
  });
  return current;
}

export default function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [active, setActive] = useState(nav.links[0].id);
  const [open, setOpen] = useState(false);

  const { scrollYProgress } = useScroll();
  const progress = useSpring(scrollYProgress, { stiffness: 120, damping: 30, restDelta: 0.001 });

  useEffect(() => {
    const onScroll = () => {
      setScrolled(window.scrollY > SCROLL_THRESHOLD);
      setActive(getActiveSection());
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Lock page scroll and allow Esc to close while the mobile menu is open.
  useEffect(() => {
    if (!open) return undefined;
    lockScroll();
    const onKey = (e) => e.key === 'Escape' && setOpen(false);
    window.addEventListener('keydown', onKey);
    return () => {
      unlockScroll();
      window.removeEventListener('keydown', onKey);
    };
  }, [open]);

  const solid = scrolled || open;
  const close = () => setOpen(false);

  return (
    <>
      <header
        className={[
          'fixed inset-x-0 top-0 z-50 transition-[background-color,border-color] duration-500 ease-luxe',
          solid
            ? 'border-b border-gold/25 bg-onyx/85 backdrop-blur-md'
            : 'border-b border-transparent bg-transparent',
        ].join(' ')}
      >
        <div className="container-luxe flex h-header items-center justify-between gap-6">
          <Logo delay={INTRO_DELAY} />

          <nav aria-label="Primary" className="hidden lg:block">
            <ul className="flex items-center gap-10">
              {nav.links.map((link) => {
                const isActive = active === link.id;
                return (
                  <li key={link.id}>
                    <a
                      href={`#${link.id}`}
                      aria-current={isActive ? 'true' : undefined}
                      className={`relative py-2 text-micro font-medium uppercase tracking-btn transition-colors duration-300 hover:text-gold-light ${
                        isActive ? 'text-gold-light' : 'text-ivory/80'
                      }`}
                    >
                      {link.label}
                      {isActive && (
                        <motion.span
                          layoutId="nav-underline"
                          aria-hidden="true"
                          className="absolute inset-x-0 -bottom-0.5 h-px bg-gold-light"
                          transition={{ type: 'spring', stiffness: 380, damping: 32 }}
                        />
                      )}
                    </a>
                  </li>
                );
              })}
            </ul>
          </nav>

          <div className="flex items-center gap-3">
            <Button href={nav.cta.href} variant="outline-gold" className="hidden sm:inline-flex">
              {nav.cta.label}
            </Button>

            <button
              type="button"
              onClick={() => setOpen((v) => !v)}
              aria-expanded={open}
              aria-controls="mobile-menu"
              aria-label={open ? 'Close menu' : 'Open menu'}
              className="flex h-11 w-11 items-center justify-center rounded-full border border-ivory/25 text-ivory transition-colors hover:border-gold-light hover:text-gold-light lg:hidden"
            >
              {open ? (
                <X strokeWidth={1.5} className="h-5 w-5" />
              ) : (
                <Menu strokeWidth={1.5} className="h-5 w-5" />
              )}
            </button>
          </div>
        </div>

        {/* Reading progress */}
        <motion.div
          aria-hidden="true"
          style={{ scaleX: progress }}
          className="absolute inset-x-0 bottom-0 h-px origin-left bg-gold-gradient"
        />
      </header>

      {/* Kept outside <header>: its backdrop-filter would otherwise become this fixed overlay's containing block */}
      <AnimatePresence>
        {open && (
          <motion.div
            id="mobile-menu"
            key="mobile-menu"
            initial={{ opacity: 0, y: -16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -16 }}
            transition={{ duration: 0.45, ease: EASE_LUXE }}
            className="surface-grain fixed inset-0 z-40 flex flex-col bg-onyx pt-header lg:hidden"
          >
            <nav aria-label="Mobile" className="container-luxe flex flex-1 flex-col justify-center">
              <ul className="space-y-6">
                {nav.links.map((link, i) => (
                  <motion.li
                    key={link.id}
                    initial={{ opacity: 0, x: -24 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.6, ease: EASE_LUXE, delay: stagger(i, 0.1, 0.07) }}
                  >
                    <a
                      href={`#${link.id}`}
                      onClick={close}
                      className={`font-serif text-4xl transition-colors hover:text-gold-light ${
                        active === link.id ? 'italic text-gold-light' : 'text-ivory'
                      }`}
                    >
                      {link.label}
                    </a>
                  </motion.li>
                ))}
              </ul>
              <div className="mt-12">
                <Button href={nav.cta.href} variant="gold" arrow onClick={close}>
                  {nav.cta.label}
                </Button>
              </div>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
