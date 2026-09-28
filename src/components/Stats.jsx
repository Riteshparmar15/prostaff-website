import { stats } from '../data/content';
import CountUp from './ui/CountUp';
import Reveal, { stagger } from './ui/Reveal';

export default function Stats() {
  return (
    <section
      aria-label="Prostaff Solution in numbers"
      className="surface-grain relative bg-midnight py-16 md:py-20"
    >
      {/* Gold hairline shimmer along the top edge */}
      <div
        aria-hidden="true"
        className="absolute inset-x-0 top-0 h-px animate-shimmer bg-[length:200%_100%] bg-gold-shimmer"
      />

      <div className="container-luxe">
        <dl className="grid grid-cols-2 gap-y-12 lg:grid-cols-4">
          {stats.map((stat, i) => (
            <Reveal
              key={stat.label}
              delay={stagger(i)}
              className={[
                'flex flex-col-reverse items-center px-4 text-center',
                i % 2 === 1 ? 'border-l border-gold/25' : '',
                i > 0 ? 'lg:border-l lg:border-gold/25' : 'lg:border-l-0',
              ].join(' ')}
            >
              <dt className="mt-4 text-eyebrow font-medium uppercase tracking-eyebrow text-mist">
                {stat.label}
              </dt>
              <dd className="font-serif text-stat font-normal text-gold-light">
                <CountUp
                  value={stat.value}
                  suffix={stat.suffix}
                  suffixClassName="ml-0.5 text-[0.55em] align-top"
                />
              </dd>
            </Reveal>
          ))}
        </dl>
      </div>
    </section>
  );
}
