import { motion } from 'framer-motion';
import { Building2, Quote } from 'lucide-react';
import { about } from '../data/content';
import SectionHeading from './ui/SectionHeading';
import RichText from './ui/RichText';
import Reveal, { EASE_LUXE, stagger } from './ui/Reveal';
import useReducedMotion from '../hooks/useReducedMotion';

function ValueItem({ icon: Icon, title, description, delay }) {
  return (
    <Reveal delay={delay}>
      <div className="group relative flex gap-5 overflow-hidden rounded-luxe border border-sand bg-white/70 p-6 shadow-card transition-[border-color,box-shadow,transform] duration-500 ease-luxe hover:translate-x-1 hover:border-gold/60 hover:shadow-card-hover">
        {/* Gold rail that grows on hover */}
        <span
          aria-hidden="true"
          className="absolute inset-y-0 left-0 w-0.5 origin-top scale-y-50 bg-gold-gradient transition-transform duration-500 ease-luxe group-hover:scale-y-100"
        />
        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-gold/60 text-gold transition-colors duration-500 group-hover:bg-gold/10">
          <Icon aria-hidden="true" strokeWidth={1.25} className="h-5 w-5" />
        </span>
        <div>
          <h3 className="font-sans text-eyebrow font-semibold uppercase tracking-btn text-gold-deep">
            {title}
          </h3>
          <p className="mt-2 text-body-sm text-stone">{description}</p>
        </div>
      </div>
    </Reveal>
  );
}

export default function About() {
  const reduced = useReducedMotion();

  return (
    <section id="about" aria-labelledby="about-title" className="surface-glow section-pad bg-ivory">
      <div className="container-luxe">
        <SectionHeading id="about-title" eyebrow={about.eyebrow} title={about.title} />

        <div className="mt-16 grid gap-14 lg:grid-cols-2 lg:gap-20">
          {/* Story + values */}
          <div>
            {about.paragraphs.map((para, i) => (
              <Reveal as="p" key={i} delay={stagger(i)} className="mb-6 text-body text-stone">
                <RichText segments={para} />
              </Reveal>
            ))}

            <motion.div
              aria-hidden="true"
              className="my-10 h-px w-16 origin-left bg-gold"
              initial={reduced ? false : { scaleX: 0 }}
              whileInView={{ scaleX: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 1, ease: EASE_LUXE }}
            />

            <div className="space-y-4">
              {about.values.map((v, i) => (
                <ValueItem key={v.title} {...v} delay={stagger(i)} />
              ))}
            </div>
          </div>

          {/* Image + quote */}
          <div className="lg:sticky lg:top-28 lg:self-start">
            <Reveal className="relative mb-0.5 overflow-hidden rounded-luxe">
              <picture>
                <source srcSet={about.image.src.replace(/\.webp$/, '.avif')} type="image/avif" />
                <img
                  src={about.image.src}
                  alt={about.image.alt}
                  width="1100"
                  height="690"
                  loading="lazy"
                  decoding="async"
                  className="aspect-[16/10] w-full object-cover grayscale-[25%] transition-[filter,transform] duration-1000 ease-luxe hover:scale-[1.03] hover:grayscale-0"
                />
              </picture>
              <span
                aria-hidden="true"
                className="pointer-events-none absolute inset-0 bg-gradient-to-t from-onyx/50 to-transparent"
              />
              <span
                aria-hidden="true"
                className="pointer-events-none absolute inset-3 border border-gold/40"
              />
            </Reveal>
            <Reveal delay={stagger(1)}>
              <figure className="surface-grain relative overflow-hidden rounded-luxe bg-onyx p-10 shadow-card-hover md:p-12">
                <div
                  aria-hidden="true"
                  className="pointer-events-none absolute -right-20 -top-20 -z-10 h-64 w-64 rounded-full bg-gold/15 blur-3xl"
                />
                <Quote aria-hidden="true" strokeWidth={1} className="h-12 w-12 text-gold/70" />
                <blockquote className="mt-6 font-serif text-2xl font-normal italic leading-relaxed text-ivory md:text-[1.75rem]">
                  <p>“{about.quote.text}”</p>
                </blockquote>
                <figcaption className="mt-8 flex items-center gap-4 text-eyebrow font-medium uppercase tracking-btn text-gold-light">
                  <span aria-hidden="true" className="h-px w-8 bg-gold-light" />
                  {about.quote.cite}
                </figcaption>
              </figure>
            </Reveal>
          </div>
        </div>

        {/* Prostaff – A Division of Dubey Enterprises */}
        {about.division && (
          <Reveal delay={stagger(2)} className="mt-16 lg:mt-24">
            <div
              id="corporate-identity"
              className="group relative overflow-hidden rounded-luxe border border-sand bg-white/85 p-8 shadow-card backdrop-blur-sm transition-all duration-500 ease-luxe hover:border-gold/60 hover:shadow-card-hover md:p-10 lg:p-12"
            >
              {/* Gold rail & subtle luxury radiance */}
              <span
                aria-hidden="true"
                className="absolute inset-y-0 left-0 w-1 bg-gold-gradient"
              />
              <div
                aria-hidden="true"
                className="pointer-events-none absolute -right-20 -top-20 -z-10 h-64 w-64 rounded-full bg-gold/10 blur-3xl transition-opacity duration-500 group-hover:opacity-100"
              />

              <div className="flex flex-col gap-6 lg:gap-8">
                {/* Header row */}
                <div className="flex flex-col gap-4 border-b border-sand pb-6 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex items-start gap-4">
                    <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full border border-gold/40 bg-gold/10 text-gold-deep transition-colors duration-500 group-hover:bg-gold/20">
                      <Building2 aria-hidden="true" strokeWidth={1.25} className="h-6 w-6" />
                    </span>
                    <div>
                      <span className="font-sans text-micro font-semibold uppercase tracking-eyebrow text-gold-deep">
                        {about.division.eyebrow}
                      </span>
                      <h3 className="mt-1 font-serif text-2xl font-normal text-onyx md:text-3xl">
                        {about.division.title}
                      </h3>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    {about.division.badges.map((badge) => (
                      <span
                        key={badge}
                        className="rounded-full border border-gold/30 bg-gold/5 px-3.5 py-1 font-sans text-micro font-medium text-gold-deep"
                      >
                        {badge}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Narrative paragraphs */}
                <div className="grid gap-6 md:grid-cols-2 md:gap-10">
                  {about.division.paragraphs.map((para, i) => (
                    <div
                      key={i}
                      className="relative rounded-luxe border border-sand/60 bg-ivory/60 p-6 transition-colors duration-300 hover:border-gold/40 hover:bg-ivory/90"
                    >
                      <span
                        aria-hidden="true"
                        className="absolute left-0 top-6 h-6 w-0.5 rounded-r bg-gold"
                      />
                      <p className="pl-2 text-body leading-relaxed text-stone">
                        {para}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </Reveal>
        )}
      </div>
    </section>
  );
}
