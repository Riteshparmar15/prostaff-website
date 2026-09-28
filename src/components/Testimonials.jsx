import { Quote } from 'lucide-react';
import { testimonials } from '../data/content';
import SectionHeading from './ui/SectionHeading';
import Reveal, { stagger } from './ui/Reveal';

export default function Testimonials() {
  if (!testimonials.items.length) return null;

  return (
    <section
      id="testimonials"
      aria-labelledby="testimonials-title"
      className="section-pad bg-champagne"
    >
      <div className="container-luxe">
        <SectionHeading
          id="testimonials-title"
          eyebrow={testimonials.eyebrow}
          title={testimonials.title}
          align="center"
        />

        <ul className="mt-16 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {testimonials.items.map((t, i) => (
            <Reveal as="li" key={t.quote} delay={stagger(i)}>
              <figure className="flex h-full flex-col rounded-luxe border border-sand bg-ivory p-8 shadow-card">
                <Quote aria-hidden="true" strokeWidth={1} className="h-8 w-8 text-gold" />
                <blockquote className="mt-5 flex-1 font-serif text-lg italic leading-relaxed text-ink">
                  <p>“{t.quote}”</p>
                </blockquote>
                <figcaption className="mt-6 border-t border-sand pt-5">
                  <span className="block text-sm font-medium text-ink">{t.role}</span>
                  <span className="mt-1 block text-micro uppercase tracking-btn text-gold-deep">
                    {t.org}
                  </span>
                </figcaption>
              </figure>
            </Reveal>
          ))}
        </ul>
      </div>
    </section>
  );
}
