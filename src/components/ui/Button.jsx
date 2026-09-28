import { ArrowRight } from 'lucide-react';

const VARIANTS = {
  // Solid dark — header & hero
  dark: 'bg-onyx text-ivory border border-gold/40 hover:border-gold-light hover:bg-midnight',
  // Bronze-gold gradient — section CTAs & form submit
  gold: 'bg-gold-gradient text-onyx border border-transparent shadow-card hover:shadow-card-hover',
  // Outline on dark imagery
  'outline-light':
    'bg-transparent text-ivory border border-ivory/70 hover:border-gold-light hover:text-gold-light',
  // Gold outline — header CTA
  'outline-gold':
    'bg-transparent text-gold-light border border-gold/70 hover:bg-gold-gradient hover:text-onyx hover:border-transparent',
  // Outline on light sections
  outline: 'bg-transparent text-ink border border-ink/40 hover:border-gold hover:text-gold-deep',
};

/**
 * Luxury button: uppercase, tracked, near-square, with an arrow nudge and
 * sheen sweep on hover. Renders an <a> when `href` is supplied.
 */
export default function Button({
  href,
  variant = 'dark',
  arrow = false,
  fullWidth = false,
  className = '',
  children,
  ...rest
}) {
  const classes = [
    'btn-sheen group inline-flex items-center justify-center gap-3 rounded-luxe px-btn-x py-btn-y',
    'font-sans text-btn font-medium uppercase tracking-btn',
    'transition-all duration-300 ease-luxe disabled:cursor-not-allowed disabled:opacity-70',
    VARIANTS[variant],
    fullWidth ? 'w-full' : '',
    className,
  ].join(' ');

  const content = (
    <>
      <span className="relative">{children}</span>
      {arrow && (
        <ArrowRight
          aria-hidden="true"
          strokeWidth={1.5}
          className="h-4 w-4 transition-transform duration-300 ease-luxe group-hover:translate-x-1"
        />
      )}
    </>
  );

  if (href) {
    return (
      <a href={href} className={classes} {...rest}>
        {content}
      </a>
    );
  }

  return (
    <button type="button" className={classes} {...rest}>
      {content}
    </button>
  );
}
