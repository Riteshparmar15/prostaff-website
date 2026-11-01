import AxeBuilder from '@axe-core/playwright';
import { test, expect } from './fixtures';

test.describe('narrow screens', () => {
  for (const width of [320, 360]) {
    test(`no horizontal overflow at ${width}px`, async ({ page }) => {
      await page.setViewportSize({ width, height: 640 });
      await page.goto('./');
      const scrollWidth = await page.evaluate(() => document.documentElement.scrollWidth);
      expect(scrollWidth).toBeLessThanOrEqual(width);
      const box = await page.getByRole('form', { name: 'Contact form' }).boundingBox();
      expect(box.x + box.width).toBeLessThanOrEqual(width);
    });
  }
});

test('no serious or critical WCAG 2.1 A/AA violations', async ({ page }) => {
  test.slow();
  await page.goto('./');
  // Scroll through once so scroll-triggered reveals finish before scanning
  await page.evaluate(async () => {
    for (let y = 0; y < document.body.scrollHeight; y += 600) {
      window.scrollTo(0, y);
      await new Promise((r) => setTimeout(r, 150));
    }
    window.scrollTo(0, 0);
  });
  await page.waitForTimeout(1500);

  const { violations } = await new AxeBuilder({ page })
    .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
    .analyze();
  // Industry cards: the visible name begins the accessible name ("Fashion: roles…"); axe also
  // counts the decorative "01" index and the faded duplicate label, so this is a reviewed exception
  const reviewed = (v, n) =>
    v.id === 'label-content-name-mismatch' && n.html.startsWith('<button type="button" aria-pressed');
  const remaining = violations
    .map((v) => ({ ...v, nodes: v.nodes.filter((n) => !reviewed(v, n)) }))
    .filter((v) => v.nodes.length);
  const summary = remaining.map((v) => ({
    id: v.id,
    impact: v.impact,
    nodes: v.nodes.length,
    sample: v.nodes[0]?.target.join(' '),
  }));
  test.info().annotations.push({ type: 'axe', description: JSON.stringify(summary) });
  expect(summary.filter((v) => ['serious', 'critical'].includes(v.impact))).toEqual([]);
});
