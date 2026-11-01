import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const scrollTo = vi.fn();
vi.mock('lenis', () => ({
  default: class {
    scrollTo = scrollTo;
    stop() {}
    start() {}
    destroy() {}
  },
}));

const { initSmoothScroll } = await import('../lib/smoothScroll');

describe('history navigation', () => {
  let cleanup;

  beforeEach(() => {
    document.body.innerHTML = '<section id="about"></section>';
    scrollTo.mockClear();
    cleanup = initSmoothScroll();
  });

  afterEach(() => {
    cleanup();
    window.history.replaceState(null, '', '/');
  });

  it('scrolls to the section named by the hash on Back/Forward', () => {
    window.history.replaceState(null, '', '#about');
    window.dispatchEvent(new PopStateEvent('popstate'));
    expect(scrollTo).toHaveBeenCalledWith(document.getElementById('about'), expect.any(Object));
  });

  it('returns to the top when history reaches the hash-less entry', () => {
    window.history.replaceState(null, '', '/');
    window.dispatchEvent(new PopStateEvent('popstate'));
    expect(scrollTo).toHaveBeenCalledWith(0, expect.any(Object));
  });
});
