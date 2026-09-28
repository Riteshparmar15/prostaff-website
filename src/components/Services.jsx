import { motion } from 'framer-motion';
import { services } from '../data/content';
import SectionHeading from './ui/SectionHeading';
import Button from './ui/Button';
import Reveal, { HOVER_SPRING, stagger } from './ui/Reveal';
import useReducedMotion from '../hooks/useReducedMotion';

function ServiceCard({ index, icon: Icon, title, description, points }) {
  const reduced = useReducedMotion();
  const number = String(index + 1).padStart(2, '0');

  return (
    <Reveal delay={stagger(index % 3)} className="h-full">
      <motion.article
        whileHover={reduced ? undefined : { y: -6 }}
        transition={HOVER_SPRING}
        className="group relative flex h-full flex-col overflow-hidden rounded-luxe border border-sand bg-white/70 p-8 shadow-card backdrop-blur-sm transition-[border-color,box-shadow] duration-500 ease-luxe hover:border-gold hover:shadow-card-hover md:p-10"
      >
        {/* Top gold bar sweeps in on hover */}
        <span
          aria-hidden="true"
          className="absolute inset-x-0 top-0 h-0.5 origin-left scale-x-0 bg-gold-gradient transition-transform duration-500 ease-luxe group-hover:scale-x-100"
        />

        <div className="flex items-start justify-between">
          <span className="flex h-12 w-12 items-center justify-center rounded-full border border-gold/60 text-gold transition-colors duration-500 group-hover:border-gold group-hover:bg-gold/10">
            <Icon aria-hidden="true" strokeWidth={1.25} className="h-5 w-5" />
          </span>
          <span
            aria-hidden="true"
            className="font-serif text-5xl font-normal leading-none text-sand transition-colors duration-500 group-hover:text-gold/50"
          >
            {number}
          </span>
        </div>

        <h3 className="mt-8 text-card-title font-medium text-ink">{title}</h3>
        <p className="mt-3 text-body-sm text-stone">{description}</p>

        <ul className="mt-6 space-y-2.5 border-t border-sand/80 pt-6">
          {points.map((point) => (
            <li key={point} className="flex items-start gap-3 text-sm text-stone">
              <span aria-hidden="true" className="mt-2.5 h-px w-3 shrink-0 bg-gold" />
              {point}
            </li>
          ))}
        </ul>
      </motion.article>
    </Reveal>
  );
}

export default function Services() {
  return (
    <section
      id="services"
      aria-labelledby="services-title"
      className="surface-glow section-pad bg-champagne"
    >
      <div className="container-luxe">
        <div className="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
          <SectionHeading id="services-title" eyebrow={services.eyebrow} title={services.title} />
          <Reveal delay={stagger(2)} className="shrink-0">
            <Button href={services.cta.href} variant="outline" arrow>
              {services.cta.label}
            </Button>
          </Reveal>
        </div>

        <div className="mt-16 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {services.items.map((s, i) => (
            <ServiceCard key={s.title} index={i} {...s} />
          ))}
        </div>
      </div>
    </section>
  );
}
