import { motion } from 'framer-motion';
import Reveal, { EASE_LUXE, stagger } from './Reveal';
import RichText from './RichText';
import useReducedMotion from '../../hooks/useReducedMotion';

/**
 * Eyebrow (with a gold rule that draws in) + H2 + optional intro.
 * `title` accepts a plain string or a RichText segment array.
 */
export default function SectionHeading({
  id,
  eyebrow,
  title,
  description,
  tone = 'light',
  align = 'left',
  className = '',
}) {
  const reduced = useReducedMotion();
  const dark = tone === 'dark';
  const centered = align === 'center';

  return (
    <div className={`${centered ? 'mx-auto max-w-prose text-center' : 'max-w-2xl'} ${className}`}>
      <Reveal
        as="p"
        delay={stagger(0)}
        className={`eyebrow flex items-center gap-4 ${centered ? 'justify-center' : ''} ${
          dark ? 'text-gold-light' : 'text-gold-deep'
        }`}
      >
        <motion.span
          aria-hidden="true"
          className="block h-px w-10 origin-left bg-gold"
          initial={reduced ? false : { scaleX: 0 }}
          whileInView={{ scaleX: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 1, ease: EASE_LUXE, delay: 0.2 }}
        />
        {eyebrow}
      </Reveal>

      <Reveal
        as="h2"
        id={id}
        delay={stagger(1)}
        className={`mt-5 text-h2 font-normal ${dark ? 'text-ivory' : 'text-ink'}`}
      >
        {typeof title === 'string' ? title : <RichText segments={title} tone={tone} />}
      </Reveal>

      {description && (
        <Reveal
          as="p"
          delay={stagger(2)}
          className={`mt-6 text-body ${dark ? 'text-mist' : 'text-stone'}`}
        >
          {description}
        </Reveal>
      )}
    </div>
  );
}
