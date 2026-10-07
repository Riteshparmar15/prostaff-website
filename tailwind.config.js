/**
 * Prostaff design tokens — the single source of truth for colour, type,
 * spacing, shadows and motion. Components should only reference these.
 * @type {import('tailwindcss').Config}
 */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    screens: {
      xs: '360px',
      sm: '640px',
      md: '768px',
      lg: '1024px',
      xl: '1280px',
      '2xl': '1536px',
    },
    extend: {
      colors: {
        ivory: '#FBF8F3',
        champagne: '#F1E9DC',
        sand: '#E6DAC6',
        onyx: '#0F1115',
        midnight: '#151A26',
        gold: {
          DEFAULT: '#B8955A',
          light: '#D9BE8B',
          // AA-compliant shade for small gold text on ivory/champagne
          deep: '#7A5C30',
        },
        bronze: '#9C7A4B',
        ink: '#1B1B1F',
        stone: '#6F6A62',
        mist: '#B9B2A5',
      },
      fontFamily: {
        serif: ['"Playfair Display"', 'Georgia', 'serif'],
        sans: ['Inter', 'system-ui', '-apple-system', 'Segoe UI', 'sans-serif'],
      },
      fontSize: {
        eyebrow: ['0.75rem', { lineHeight: '1.4', letterSpacing: '0.3em' }],
        nav: ['0.8125rem', { lineHeight: '1.4' }],
        micro: ['0.6875rem', { lineHeight: '1.4' }],
        btn: ['0.75rem', { lineHeight: '1', letterSpacing: '0.18em' }],
        body: ['1rem', { lineHeight: '1.75' }],
        'body-sm': ['0.9375rem', { lineHeight: '1.75' }],
        'card-title': ['1.25rem', { lineHeight: '1.35' }],
        h2: ['clamp(2rem, 4vw, 3rem)', { lineHeight: '1.15' }],
        h1: ['clamp(2.6rem, 6vw, 5rem)', { lineHeight: '1.08' }],
        stat: ['clamp(2.5rem, 5vw, 3.75rem)', { lineHeight: '1' }],
      },
      letterSpacing: {
        eyebrow: '0.3em',
        btn: '0.18em',
        wordmark: '0.22em',
      },
      maxWidth: {
        container: '1200px',
        grid: '1080px',
        founders: '900px',
        prose: '640px',
      },
      spacing: {
        header: '5rem',
        'section-sm': '4.5rem',
        section: '7rem',
        'btn-y': '0.875rem',
        'btn-x': '1.75rem',
      },
      scale: {
        104: '1.04',
        106: '1.06',
      },
      borderRadius: {
        luxe: '2px',
      },
      boxShadow: {
        card: '0 1px 2px rgba(15,17,21,.04), 0 12px 32px -12px rgba(15,17,21,.12)',
        'card-hover': '0 2px 4px rgba(15,17,21,.05), 0 24px 48px -16px rgba(15,17,21,.22)',
        'gold-glow': '0 0 0 3px rgba(184,149,90,.18)',
      },
      backgroundImage: {
        'gold-gradient': 'linear-gradient(135deg, #C9A96E 0%, #9C7A4B 100%)',
        'hero-overlay':
          'linear-gradient(90deg, rgba(15,17,21,.65) 0%, rgba(15,17,21,.45) 45%, rgba(15,17,21,.15) 100%)',
        'hero-fade': 'linear-gradient(to bottom, transparent 0%, #151A26 100%)',
        'gold-shimmer': 'linear-gradient(90deg, transparent 0%, rgba(217,190,139,.9) 50%, transparent 100%)',
        'intro-glow': 'radial-gradient(circle at 50% 45%, rgba(201,169,110,.16) 0%, transparent 45%)',
        'hero-glow': 'radial-gradient(ellipse at 30% 50%, rgba(201,169,110,.14) 0%, transparent 60%)',
        'portrait-fade': 'linear-gradient(to top, rgba(15,17,21,.55) 0%, rgba(184,149,90,.12) 35%, transparent 60%)',
      },
      keyframes: {
        kenburns: {
          from: { transform: 'scale(1)' },
          to: { transform: 'scale(1.08)' },
        },
        float: {
          '0%, 100%': { transform: 'translate3d(0, 0, 0)', opacity: '0' },
          '20%, 80%': { opacity: '1' },
          '50%': { transform: 'translate3d(12px, -60px, 0)' },
        },
        'bounce-slow': {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(6px)' },
        },
        shimmer: {
          from: { backgroundPosition: '200% 0' },
          to: { backgroundPosition: '-200% 0' },
        },
        twinkle: {
          '0%, 70%, 100%': { transform: 'scale(1)', opacity: '1' },
          '80%': { transform: 'scale(1.35)', opacity: '0.7' },
          '90%': { transform: 'scale(0.9)', opacity: '1' },
        },
        marquee: {
          '0%': { transform: 'translate3d(0, 0, 0)' },
          '100%': { transform: 'translate3d(-100%, 0, 0)' },
        },
        'marquee-reverse': {
          '0%': { transform: 'translate3d(-100%, 0, 0)' },
          '100%': { transform: 'translate3d(0, 0, 0)' },
        },
      },
      animation: {
        kenburns: 'kenburns 20s ease-in-out infinite alternate',
        float: 'float 10s ease-in-out infinite',
        'bounce-slow': 'bounce-slow 2.2s ease-in-out infinite',
        shimmer: 'shimmer 6s linear infinite',
        twinkle: 'twinkle 4s ease-in-out infinite',
        'spin-slow': 'spin 28s linear infinite',
        marquee: 'marquee 35s linear infinite',
        'marquee-reverse': 'marquee-reverse 35s linear infinite',
      },
      transitionTimingFunction: {
        luxe: 'cubic-bezier(0.22, 1, 0.36, 1)',
      },
    },
  },
  plugins: [],
};
