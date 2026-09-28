import { useEffect } from 'react';
import { MotionConfig } from 'framer-motion';
import Header from './components/Header';
import Hero from './components/Hero';
import Stats from './components/Stats';
import About from './components/About';
import Services from './components/Services';
import Industries from './components/Industries';
import Testimonials from './components/Testimonials';
import Contact from './components/Contact';
import Footer from './components/Footer';
import BackToTop from './components/ui/BackToTop';
import Preloader from './components/ui/Preloader';
import { initSmoothScroll } from './lib/smoothScroll';
import { HONOUR_REDUCED_MOTION } from './lib/motion';

export default function App() {
  useEffect(() => initSmoothScroll(), []);

  return (
    <MotionConfig reducedMotion={HONOUR_REDUCED_MOTION ? 'user' : 'never'}>
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[60] focus:bg-onyx focus:px-4 focus:py-2 focus:text-ivory"
      >
        Skip to content
      </a>

      <Preloader />
      <Header />

      <main id="main">
        <Hero />
        <Stats />
        <About />
        <Services />
        <Industries />
        <Testimonials />
        <Contact />
      </main>

      <Footer />
      <BackToTop />
    </MotionConfig>
  );
}
