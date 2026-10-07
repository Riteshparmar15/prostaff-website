import { MapPin, ShieldCheck } from 'lucide-react';
import { brandPartners } from '../data/content';
import SectionHeading from './ui/SectionHeading';
import Reveal, { stagger } from './ui/Reveal';
import useReducedMotion from '../hooks/useReducedMotion';

export default function BrandShowcase() {
  const reduced = useReducedMotion();
  const brands = brandPartners.items;

  return (
    <section
      id="brands"
      aria-labelledby="brands-title"
      className="surface-glow relative overflow-hidden border-y border-sand/70 bg-gradient-to-b from-champagne/35 via-ivory to-champagne/25 py-16 md:py-24"
    >
      {/* Ambient background gold glow */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 h-[380px] w-[800px] rounded-full bg-gold/5 blur-[120px]"
      />

      <div className="container-luxe relative">
        {/* Section Heading — clean, concise, no descriptions */}
        <div className="flex flex-col items-center text-center">
          <SectionHeading
            id="brands-title"
            eyebrow={brandPartners.eyebrow}
            title={brandPartners.title}
            align="center"
          />

          {/* Pan-India Footprint Badge */}
          <Reveal delay={stagger(2)} className="mt-6 flex flex-wrap items-center justify-center gap-3">
            <span className="inline-flex items-center gap-2 rounded-full border border-gold/40 bg-white/95 px-4 py-1.5 font-sans text-micro font-medium uppercase tracking-wider text-gold-deep shadow-sm backdrop-blur-sm">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-gold opacity-75" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-gold" />
              </span>
              {brandPartners.badge}
            </span>

            <span className="hidden items-center gap-2 text-micro text-stone md:inline-flex">
              <ShieldCheck className="h-4 w-4 text-gold" strokeWidth={1.5} />
              Boutique, Flagship & Retail Placements Across India
            </span>
          </Reveal>
        </div>
      </div>

      {/* ------------------------------------------------------------------ */}
      {/* Infinite Seamless Brand Logo Marquee Ribbon                        */}
      {/* ------------------------------------------------------------------ */}
      <div className="relative mt-12 overflow-hidden py-4 select-none">
        {/* Soft edge-fade masks for seamless infinite dissolve */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-y-0 left-0 z-20 w-24 bg-gradient-to-r from-ivory via-ivory/80 to-transparent md:w-48"
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-y-0 right-0 z-20 w-24 bg-gradient-to-l from-ivory via-ivory/80 to-transparent md:w-48"
        />

        {/* Dual-track continuous seamless loop */}
        <div className="group flex w-max">
          {/* Track 1 */}
          <div
            className={`flex shrink-0 items-center gap-6 pr-6 ${
              reduced ? '' : 'animate-marquee'
            } group-hover:[animation-play-state:paused]`}
          >
            {brands.map((brand) => (
              <div
                key={`t1-${brand.id}`}
                className="group/card relative flex h-24 w-52 shrink-0 flex-col items-center justify-center rounded-luxe border border-sand/75 bg-white/90 p-5 shadow-card transition-all duration-300 ease-luxe hover:-translate-y-1 hover:border-gold hover:shadow-card-hover md:h-28 md:w-60"
              >
                {/* Hairline gold accent top border on hover */}
                <span
                  aria-hidden="true"
                  className="absolute inset-x-0 top-0 h-0.5 scale-x-0 bg-gold-gradient transition-transform duration-300 ease-luxe group-hover/card:scale-x-100"
                />

                <div className="flex h-12 w-full items-center justify-center">
                  <img
                    src={brand.logo}
                    alt={`${brand.name} logo`}
                    loading="lazy"
                    decoding="async"
                    className={`${brand.imgClass} object-contain transition-transform duration-300 ease-luxe group-hover/card:scale-105`}
                  />
                </div>

                {brand.region && (
                  <span className={`mt-2 font-sans text-[0.5625rem] font-semibold uppercase tracking-widest ${
                    brand.region.includes('Dubai') ? 'text-gold-deep font-bold' : 'text-stone/75'
                  }`}>
                    {brand.region}
                  </span>
                )}
              </div>
            ))}
          </div>

          {/* Track 2 (exact duplicate track for infinite seamless wrapping) */}
          <div
            aria-hidden="true"
            className={`flex shrink-0 items-center gap-6 pr-6 ${
              reduced ? '' : 'animate-marquee'
            } group-hover:[animation-play-state:paused]`}
          >
            {brands.map((brand) => (
              <div
                key={`t2-${brand.id}`}
                className="group/card relative flex h-24 w-52 shrink-0 flex-col items-center justify-center rounded-luxe border border-sand/75 bg-white/90 p-5 shadow-card transition-all duration-300 ease-luxe hover:-translate-y-1 hover:border-gold hover:shadow-card-hover md:h-28 md:w-60"
              >
                <span
                  aria-hidden="true"
                  className="absolute inset-x-0 top-0 h-0.5 scale-x-0 bg-gold-gradient transition-transform duration-300 ease-luxe group-hover/card:scale-x-100"
                />

                <div className="flex h-12 w-full items-center justify-center">
                  <img
                    src={brand.logo}
                    alt={`${brand.name} logo`}
                    loading="lazy"
                    decoding="async"
                    className={`${brand.imgClass} object-contain transition-transform duration-300 ease-luxe group-hover/card:scale-105`}
                  />
                </div>

                {brand.region && (
                  <span className={`mt-2 font-sans text-[0.5625rem] font-semibold uppercase tracking-widest ${
                    brand.region.includes('Dubai') ? 'text-gold-deep font-bold' : 'text-stone/75'
                  }`}>
                    {brand.region}
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ------------------------------------------------------------------ */}
      {/* Pan-India & International Cities Footprint Bar                     */}
      {/* ------------------------------------------------------------------ */}
      <div className="container-luxe mt-10">
        <Reveal delay={stagger(1)}>
          <div className="mx-auto flex max-w-4xl flex-col items-center justify-between gap-3 rounded-luxe border border-sand/80 bg-white/80 p-3.5 shadow-sm backdrop-blur-md md:flex-row md:px-6 md:py-3">
            <div className="flex items-center gap-2 text-xs font-semibold tracking-wider text-onyx">
              <MapPin className="h-3.5 w-3.5 text-gold shrink-0" strokeWidth={2} />
              <span className="uppercase text-gold-deep">Network Footprint:</span>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-2 text-xs text-stone">
              {brandPartners.coverageCities.map((city) => (
                <span
                  key={city}
                  className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 font-sans text-micro font-medium transition-colors ${
                    city.includes('Dubai')
                      ? 'border border-gold/50 bg-gold/15 text-gold-deep font-semibold'
                      : 'bg-champagne/60 text-ink hover:bg-gold/15'
                  }`}
                >
                  <span className={`h-1 w-1 rounded-full ${city.includes('Dubai') ? 'bg-gold-deep' : 'bg-gold'}`} />
                  {city}
                </span>
              ))}
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
