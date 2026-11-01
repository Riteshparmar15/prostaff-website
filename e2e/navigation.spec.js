import { test, expect } from './fixtures';

const SECTIONS = ['home', 'brands', 'about', 'services', 'industries', 'contact'];

/** Distance of a section's top edge from the viewport top (the fixed header is ~81px). */
const sectionTop = (page, id) =>
  page.evaluate((s) => document.getElementById(s).getBoundingClientRect().top, id);

async function expectSectionAtTop(page, id) {
  await expect.poll(() => sectionTop(page, id), { timeout: 5000 }).toBeGreaterThanOrEqual(-2);
  await expect.poll(() => sectionTop(page, id), { timeout: 5000 }).toBeLessThan(120);
}

test('home page loads without errors or broken local resources', async ({ page, errors }) => {
  await page.goto('./');
  await expect(page).toHaveTitle(/Prostaff Solution/);
  await expect(page.getByRole('heading', { level: 1 })).toHaveCount(1);
  for (const id of SECTIONS) await expect(page.locator(`#${id}`)).toHaveCount(1);
  await page.waitForLoadState('networkidle');
  expect(errors).toEqual([]);
});

test('legal pages load and link back to the site', async ({ page, errors }) => {
  for (const path of ['privacy.html', 'terms.html']) {
    const res = await page.goto(path);
    expect(res.status()).toBe(200);
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
  }
  expect(errors).toEqual([]);
});

test.describe('desktop navigation', () => {
  test.skip(({ isMobile }) => isMobile, 'desktop nav is hidden on small screens');

  test('primary nav links scroll to their sections and update the URL', async ({ page }) => {
    await page.goto('./');
    const nav = page.getByRole('navigation', { name: 'Primary' });
    for (const id of ['about', 'services', 'industries', 'contact', 'brands']) {
      await nav.locator(`a[href="#${id}"]`).click();
      await expect(page).toHaveURL(new RegExp(`#${id}$`));
      await expectSectionAtTop(page, id);
    }
  });

  test('Back and Forward return to the previous section', async ({ page }) => {
    await page.goto('./');
    const nav = page.getByRole('navigation', { name: 'Primary' });
    await nav.locator('a[href="#about"]').click();
    await expectSectionAtTop(page, 'about');
    await nav.locator('a[href="#contact"]').click();
    await expectSectionAtTop(page, 'contact');

    await page.goBack();
    await expect(page).toHaveURL(/#about$/);
    await expectSectionAtTop(page, 'about');

    await page.goForward();
    await expect(page).toHaveURL(/#contact$/);
    await expectSectionAtTop(page, 'contact');
  });
});

test.describe('mobile menu', () => {
  test.skip(({ isMobile }) => !isMobile, 'menu button only shows on small screens');

  test('opens, closes with Escape and navigates from a link', async ({ page }) => {
    await page.goto('./');
    const toggle = page.getByRole('button', { name: 'Open menu' });
    // Opened from the keyboard: Safari never focuses buttons on click, so there would be no focus to return
    await toggle.focus();
    await page.keyboard.press('Enter');
    const menu = page.getByRole('navigation', { name: 'Mobile' });
    await expect(menu).toBeVisible();

    await page.keyboard.press('Escape');
    await expect(menu).toBeHidden();
    await expect(page.getByRole('button', { name: 'Open menu' })).toBeFocused();

    await page.getByRole('button', { name: 'Open menu' }).click();
    await menu.locator('a[href="#services"]').click();
    await expect(menu).toBeHidden();
    await expect(page).toHaveURL(/#services$/);
    await expectSectionAtTop(page, 'services');
    await expect(page.locator('#services')).toBeFocused();
  });

  test('keeps keyboard focus out of the page behind the open menu', async ({ page }) => {
    await page.goto('./');
    await page.getByRole('button', { name: 'Open menu' }).click();
    await expect(page.locator('#main')).toHaveAttribute('inert', '');
    for (let i = 0; i < 15; i += 1) {
      await page.keyboard.press('Tab');
      const behind = await page.evaluate(
        () => !!document.activeElement?.closest('#main, footer, a[href="#main"]'),
      );
      expect(behind).toBe(false);
    }
    await page.keyboard.press('Escape');
    await expect(page.locator('#main')).not.toHaveAttribute('inert', '');
  });
});

test.describe('brand intro', () => {
  test.use({ skipIntro: false });

  test('plays once per session, then lifts', async ({ page }) => {
    await page.goto('./');
    const intro = page.locator('[role="presentation"].fixed');
    await expect(intro).toBeVisible();
    await expect(intro).toBeHidden({ timeout: 6000 });
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();

    await page.reload();
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
    await expect(intro).toHaveCount(0);
  });
});

test('skip link moves keyboard focus to the main content', async ({ page, browserName }) => {
  await page.goto('./');
  const skip = page.getByRole('link', { name: 'Skip to content' });
  // Safari's Tab key skips links unless "Press Tab to highlight each item" is enabled
  if (browserName === 'webkit') await skip.focus();
  else await page.keyboard.press('Tab');
  await expect(skip).toBeFocused();
  await expect(skip).toBeInViewport();
  await page.keyboard.press('Enter');
  await expect(page.locator('#main')).toBeFocused();
});

test('back-to-top button appears after scrolling and returns to the top', async ({ page }) => {
  await page.goto('./');
  const button = page.getByRole('link', { name: 'Back to top', exact: true });
  await expect(button).toHaveCount(0);
  await page.evaluate(() => window.scrollTo(0, 3000));
  await expect(button).toBeVisible();
  await button.click();
  await expect.poll(() => page.evaluate(() => window.scrollY), { timeout: 5000 }).toBeLessThan(5);
  await expect(button).toHaveCount(0);
});

test('industry cards expand on click and keyboard focus', async ({ page, isMobile }) => {
  await page.goto('./#industries');
  const cards = page.locator('#industries button[aria-pressed]');
  await expect(cards).toHaveCount(5);
  await expect(cards.nth(0)).toHaveAttribute('aria-pressed', 'true');

  await cards.nth(2).click();
  await expect(cards.nth(2)).toHaveAttribute('aria-pressed', 'true');
  await expect(cards.nth(0)).toHaveAttribute('aria-pressed', 'false');

  // Park the pointer away so resizing cards don't slide under it and take over via hover
  await page.mouse.move(0, 0);
  await cards.nth(3).focus();
  await expect(cards.nth(3)).toHaveAttribute('aria-pressed', 'true');

  if (!isMobile) {
    // On desktop the active card widens into the space the others give up
    const width = (i) => cards.nth(i).evaluate((el) => el.getBoundingClientRect().width);
    await expect.poll(async () => (await width(3)) > (await width(0)) * 2).toBe(true);
  }
});

test('brand logo strip can be paused and resumed', async ({ page }) => {
  await page.goto('./#brands');
  const track = page.locator('#brands .animate-marquee').first();
  const state = () => track.evaluate((el) => getComputedStyle(el).animationPlayState);
  await expect.poll(state).toBe('running');

  await page.getByRole('button', { name: 'Pause brand logos' }).click();
  await expect.poll(state).toBe('paused');

  await page.getByRole('button', { name: 'Play brand logos' }).click();
  await expect.poll(state).toBe('running');
});

test('custom 404 page links back with the correct base path', async ({ page, errors }) => {
  await page.goto('404.html');
  await expect(page.getByRole('heading', { level: 1, name: 'Page not found' })).toBeVisible();
  await expect(page.getByRole('link', { name: 'Back to Prostaff Solution' })).toHaveAttribute(
    'href',
    '/',
  );
  expect(await page.content()).not.toContain('%BASE%');
  await page.waitForLoadState('networkidle');
  expect(errors).toEqual([]);
});

test('hero falls back to the local image when the remote photo fails', async ({ page }) => {
  test.slow();
  await page.route(/images\.unsplash\.com/, (route) => route.abort('failed'));
  await page.goto('./');
  // Slide 2 is the first remote image; the slideshow advances every 7 seconds
  await expect
    .poll(
      () =>
        page.evaluate(() =>
          [...document.querySelectorAll('#home img')].some(
            (img) =>
              img.currentSrc.startsWith(`${location.origin}/images/hero/interview`) &&
              img.complete &&
              img.naturalWidth > 0,
          ),
        ),
      { timeout: 25_000 },
    )
    .toBe(true);
});
