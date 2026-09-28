import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { industries } from '../data/content';
import Reveal, { EASE_LUXE, stagger } from './ui/Reveal';
import useReducedMotion from '../hooks/useReducedMotion';

const pad = (n) => String(n).padStart(2, '0');

function Panel({ item, index, active, onActivate, reduced }) {
  const { icon: Icon, name, image, roles } = item;

  return (
    <motion.li
      className={`relative min-w-0 lg:h-full ${index === 4 ? 'col-span-2' : ''} ${index < 3 ? 'md:col-span-2' : 'md:col-span-3'}`}
      initial={false}
      animate={{ flexGrow: active ? 3.4 : 1 }}
      transition={{ duration: 0.8, ease: EASE_LUXE }}
      style={{ flexBasis: 0 }}
    >
      <button
        type="button"
        aria-pressed={active}
        aria-label={roles?.length ? `${name}: ${roles.join(', ')}` : name}
        onMouseEnter={onActivate}
        onFocus={onActivate}
        onClick={onActivate}
        className={`group relative block h-full w-full overflow-hidden rounded-luxe border text-left transition-[border-color,box-shadow] duration-700 ease-luxe lg:aspect-auto ${
          index === 4 ? 'aspect-[16/9]' : 'aspect-[3/4]'
        } ${index < 3 ? 'md:aspect-[3/4]' : 'md:aspect-[16/10]'} ${
          active
            ? 'border-gold/60 shadow-[0_30px_80px_-30px_rgba(184,149,90,0.45)]'
            : 'border-ivory/10 hover:border-gold/30'
        }`}
      >
        <picture>
          <source srcSet={image.webpMobile.replace(/\.webp$/, '.avif')} type="image/avif" />
          <img
            src={image.webpMobile}
            alt=""
            loading="lazy"
            decoding="async"
            width="900"
            height="1200"
            className={`absolute inset-0 h-full w-full object-cover transition-[transform,filter] duration-[1.6s] ease-luxe ${
              active ? 'scale-105 grayscale-0' : 'scale-100 grayscale-[70%] group-hover:scale-105'
            }`}
          />
        </picture>

        {/* Legibility gradient + dim for closed panels */}
        <span
          aria-hidden="true"
          className="absolute inset-0 bg-gradient-to-t from-onyx via-onyx/40 to-onyx/10"
        />
        <span
          aria-hidden="true"
          className={`absolute inset-0 bg-onyx transition-opacity duration-700 ${active ? 'opacity-0' : 'opacity-[0.35] lg:opacity-50'}`}
        />

        {/* Index + gold rule */}
        <span className="absolute left-5 top-5 flex items-center gap-3 font-sans text-micro font-medium tracking-btn text-gold-light">
          {pad(index + 1)}
          <span
            aria-hidden="true"
            className={`h-px bg-gold transition-all duration-700 ease-luxe ${active ? 'w-10' : 'w-4'}`}
          />
        </span>

        {/* Collapsed desktop label: vertical name */}
        <span
          aria-hidden="true"
          className={`absolute bottom-6 left-1/2 hidden -translate-x-1/2 whitespace-nowrap font-serif text-2xl italic text-ivory/90 transition-opacity duration-500 [writing-mode:vertical-rl] lg:block ${
            active ? 'opacity-0' : 'rotate-180'
          }`}
        >
          {name}
        </span>

        {/* Open label: icon ring + name (always shown on small screens) */}
        <span className={`absolute inset-x-0 bottom-0 p-5 md:p-7 ${active ? '' : 'lg:hidden'}`}>
          <AnimatePresence mode="wait">
            <motion.span
              key={active ? 'open' : 'closed'}
              className="block"
              initial={reduced ? false : { opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease: EASE_LUXE, delay: active ? 0.25 : 0 }}
            >
              <span className="flex h-12 w-12 items-center justify-center rounded-full border border-gold/60 bg-onyx/40 text-gold-light md:h-14 md:w-14">
                <Icon aria-hidden="true" strokeWidth={1.25} className="h-5 w-5 md:h-6 md:w-6" />
              </span>
              <span className="mt-4 block font-serif text-xl leading-tight text-ivory md:text-3xl lg:text-4xl">
                {name}
              </span>
              <span aria-hidden="true" className="mt-4 block h-px w-14 bg-gold-gradient" />
              {roles?.length > 0 && (
                <span
                  className={`mt-4 flex-wrap gap-x-4 gap-y-1.5 ${active ? 'hidden md:flex' : 'hidden'}`}
                >
                  {roles.map((role) => (
                    <span
                      key={role}
                      className="flex items-center gap-2 text-micro font-medium uppercase tracking-btn text-ivory/80"
                    >
                      <span aria-hidden="true" className="h-1 w-1 rotate-45 bg-gold" />
                      {role}
                    </span>
                  ))}
                </span>
              )}
            </motion.span>
          </AnimatePresence>
        </span>
      </button>
    </motion.li>
  );
}

export default function Industries() {
  const reduced = useReducedMotion();
  const [active, setActive] = useState(0);
  const title = industries.title.split(' ');
  const lastWord = title.pop();

  return (
    <section
      id="industries"
      aria-labelledby="industries-title"
      className="surface-grain relative isolate overflow-hidden bg-onyx py-20 md:py-28"
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute left-1/2 top-0 -z-10 h-80 w-[48rem] max-w-full -translate-x-1/2 rounded-full bg-gold/10 blur-3xl"
      />

      <div className="container-luxe">
        <div className="mx-auto max-w-2xl text-center">
          <Reveal aria-hidden="true" className="flex items-center justify-center gap-3">
            <span className="h-px w-10 bg-gradient-to-l from-gold/70 to-transparent" />
            <span className="h-1.5 w-1.5 rotate-45 bg-gold" />
            <span className="h-px w-10 bg-gradient-to-r from-gold/70 to-transparent" />
          </Reveal>
          <Reveal
            as="h2"
            id="industries-title"
            delay={stagger(1)}
            className="mt-6 text-h2 font-normal text-ivory"
          >
            {title.join(' ')} <em className="font-normal italic text-gold-light">{lastWord}</em>
          </Reveal>
          <Reveal as="p" delay={stagger(2)} className="mt-4 font-serif text-lg italic text-mist">
            {industries.subtitle}
          </Reveal>
        </div>

        <Reveal delay={stagger(3)}>
          <ul className="mt-14 grid grid-cols-2 gap-3 md:grid-cols-6 lg:flex lg:h-[34rem] lg:gap-3">
            {industries.items.map((item, i) => (
              <Panel
                key={item.name}
                item={item}
                index={i}
                active={i === active}
                onActivate={() => setActive(i)}
                reduced={reduced}
              />
            ))}
          </ul>
        </Reveal>
      </div>
    </section>
  );
}
