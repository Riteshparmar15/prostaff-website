import { Instagram, Linkedin } from 'lucide-react';
import { footer } from '../data/content';
import Logo, { LogoSeal } from './ui/Logo';
import Reveal, { stagger } from './ui/Reveal';

const SOCIAL_ICONS = { linkedin: Linkedin, instagram: Instagram };

export default function Footer() {
  return (
    <footer className="surface-grain relative border-t border-gold/20 bg-onyx">
      <div
        aria-hidden="true"
        className="absolute inset-x-0 top-0 h-px animate-shimmer bg-[length:200%_100%] bg-gold-shimmer"
      />

      <div className="container-luxe pb-10 pt-16 md:pt-20">
        <div className="grid gap-12 md:grid-cols-[2fr_1fr_1fr] md:gap-16 lg:grid-cols-[2fr_1fr_1fr_auto]">
          <Reveal delay={stagger(0)}>
            <Logo />
            <p className="mt-6 max-w-xs text-body-sm text-mist">{footer.tagline}</p>
            {footer.social.length > 0 && (
              <ul className="mt-6 flex gap-3">
                {footer.social.map(({ label, href, icon }) => {
                  const Icon = SOCIAL_ICONS[icon];
                  return (
                    <li key={label}>
                      <a
                        href={href}
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label={label}
                        className="flex h-10 w-10 items-center justify-center rounded-full border border-gold/30 text-gold-light transition-colors duration-300 hover:border-gold hover:bg-gold/10"
                      >
                        <Icon aria-hidden="true" strokeWidth={1.5} className="h-4 w-4" />
                      </a>
                    </li>
                  );
                })}
              </ul>
            )}
          </Reveal>

          {footer.columns.map((col, i) => (
            <Reveal
              as={col.nav ? 'nav' : 'div'}
              key={col.title}
              delay={stagger(i + 1)}
              aria-label={col.nav ? col.title : undefined}
            >
              <h2 className="font-sans text-micro font-semibold uppercase tracking-eyebrow text-gold-light">
                {col.title}
              </h2>
              <ul className="mt-6 space-y-3.5">
                {col.links.map((link) => (
                  <li key={link.label}>
                    {link.href ? (
                      <a
                        href={link.href}
                        className="group inline-flex items-center break-all text-body-sm text-mist transition-colors duration-300 hover:text-gold-light"
                      >
                        <span
                          aria-hidden="true"
                          className="h-px w-0 shrink-0 bg-gold-light transition-all duration-300 ease-luxe group-hover:mr-2 group-hover:w-3"
                        />
                        {link.label}
                      </a>
                    ) : (
                      <span className="text-body-sm text-mist">{link.label}</span>
                    )}
                  </li>
                ))}
              </ul>
            </Reveal>
          ))}

          <Reveal delay={stagger(3)} className="hidden lg:block">
            <LogoSeal className="h-36 w-36" />
          </Reveal>
        </div>

        <div className="mt-14 border-t border-gold/25 pt-8">
          <div className="flex flex-wrap items-center justify-center gap-x-5 gap-y-3 text-center text-sm md:justify-start md:text-left">
            <ul className="flex items-center gap-5 font-medium">
              {footer.legal.map((link) => (
                <li key={link.label}>
                  <a
                    href={link.href}
                    className="text-ivory/90 transition-colors duration-200 hover:text-gold-light"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
            <span className="hidden text-gold/40 md:inline" aria-hidden="true">·</span>
            <p className="text-mist">
              {footer.copyright}
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
