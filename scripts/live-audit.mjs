// Read-only audit of the deployed site: viewports, console/network errors, links, SEO files,
// headers, redirects and 404 behaviour. It never submits the contact form.
//   node scripts/live-audit.mjs [https://prostaffconsulting.com]
import { chromium } from '@playwright/test';
import { mkdir, writeFile } from 'node:fs/promises';
import { Resolver } from 'node:dns/promises';
import https from 'node:https';

const BASE = (process.argv[2] || 'https://prostaffconsulting.com').replace(/\/$/, '');
const HOST = new URL(BASE).hostname;
const OUT = 'test-results/live-audit';
const VIEWPORTS = [
  [320, 568], [360, 800], [375, 812], [390, 844], [414, 896], [768, 1024],
  [1024, 768], [1280, 800], [1366, 768], [1440, 900], [1920, 1080],
];
const results = [];
const record = (id, name, pass, detail = '') => {
  results.push({ id, name, pass, detail });
  console.log(`${pass ? 'PASS' : 'FAIL'}  ${id}  ${name}${detail ? '  -> ' + detail : ''}`);
};
const get = async (path, init = {}) => {
  try {
    return await fetch(new URL(path, BASE + '/'), { redirect: 'manual', ...init });
  } catch (e) {
    return { status: 0, headers: new Headers(), text: async () => '', error: e.message };
  }
};

await mkdir(OUT, { recursive: true });

/* ---------- HTTP, redirects, headers ---------- */
{
  const http = await get(BASE.replace('https', 'http') + '/');
  record('LIVE-HTTP-001', 'http:// redirects to https://', http.status === 301 || http.status === 308, `${http.status} -> ${http.headers.get('location')}`);
  // The local resolver can hold a stale record for hours, so ask public DNS for the CNAME and
  // test the redirect against the address the apex domain resolves to
  const pub = new Resolver();
  pub.setServers(['8.8.8.8', '1.1.1.1']);
  const cname = await pub.resolveCname(`www.${HOST}`).catch(() => []);
  record('LIVE-DNS-001', 'public DNS: www is a CNAME to the host (not a stale record)', cname.some((c) => /netlify/.test(c)), cname.join(', ') || 'none');
  const [apexIp] = await pub.resolve4(HOST).catch(() => []);
  const www = await new Promise((resolve) => {
    const req = https.request({ host: apexIp, servername: `www.${HOST}`, path: '/', headers: { Host: `www.${HOST}` }, timeout: 15000 }, (res) => {
      res.resume();
      resolve({ status: res.statusCode, location: res.headers.location });
    });
    req.on('error', (e) => resolve({ status: 0, location: e.message }));
    req.end();
  });
  record('LIVE-HTTP-002', 'www redirects to the primary domain', [301, 308].includes(www.status) && www.location === `${BASE}/`, `${www.status} -> ${www.location}`);
  const home = await get('/');
  record('LIVE-HTTP-003', 'home returns 200 text/html', home.status === 200 && /text\/html/.test(home.headers.get('content-type')), `${home.status} ${home.headers.get('content-type')}`);
  const need = {
    'strict-transport-security': /max-age=\d{6,}/,
    'x-content-type-options': /nosniff/,
    'x-frame-options': /SAMEORIGIN|DENY/,
    'referrer-policy': /./,
    'permissions-policy': /./,
  };
  for (const [h, re] of Object.entries(need)) {
    const v = home.headers.get(h);
    record(`LIVE-SEC-${h}`, `header ${h}`, !!v && re.test(v), v || 'missing');
  }
  // Informational: a CSP is a hardening step that needs testing against the inline JSON-LD and the
  // Unsplash / FormSubmit hosts, so its absence is reported but is not a failure
  record('LIVE-SEC-csp', 'INFO Content-Security-Policy header', true, home.headers.get('content-security-policy') || 'not set (recommended hardening)');
  const nf = await get('/this-page-does-not-exist-qa');
  const nfBody = await nf.text();
  record('LIVE-404-001', 'unknown URL returns a 404 status', nf.status === 404, String(nf.status));
  record('LIVE-404-002', 'unknown URL shows the custom 404 page', /404/i.test(nfBody) && /Prostaff/i.test(nfBody), `${nfBody.length} bytes`);
  const nested = await get('/privacy.html');
  record('LIVE-ROUTE-001', '/privacy.html loads directly', nested.status === 200, String(nested.status));
  const terms = await get('/terms.html');
  record('LIVE-ROUTE-002', '/terms.html loads directly', terms.status === 200, String(terms.status));
  const asset = (await home.text()).match(/(?:src|href)="(\/assets\/[^"]+\.(?:js|css))"/g) || [];
  for (const a of asset.slice(0, 4)) {
    const p = a.match(/"([^"]+)"/)[1];
    const r = await get(p);
    record('LIVE-ASSET-' + p.split('.').pop(), `asset ${p}`, r.status === 200 && /immutable/.test(r.headers.get('cache-control') || ''), `${r.status} ${r.headers.get('cache-control')}`);
  }
  const enc = await get('/', { headers: { 'accept-encoding': 'gzip, br' } });
  record('LIVE-PERF-001', 'HTML is compressed', !!enc.headers.get('content-encoding'), enc.headers.get('content-encoding') || 'none');
}

/* ---------- SEO files ---------- */
{
  const robots = await (await get('/robots.txt')).text();
  record('LIVE-SEO-001', 'robots.txt reachable, does not block the site, names the sitemap', /Sitemap:\s*https:\/\/prostaffconsulting\.com\/sitemap\.xml/.test(robots) && !/Disallow:\s*\/\s*$/m.test(robots), robots.replace(/\s+/g, ' ').slice(0, 120));
  const sm = await (await get('/sitemap.xml')).text();
  const locs = [...sm.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]);
  record('LIVE-SEO-002', 'sitemap.xml lists only the live domain', locs.length > 0 && locs.every((l) => l.startsWith(BASE + '/')), locs.join(', '));
  for (const l of locs) {
    const r = await get(new URL(l).pathname);
    record('LIVE-SEO-003', `sitemap URL resolves: ${l}`, r.status === 200, String(r.status));
  }
  for (const f of ['/og-image.jpg', '/favicon.svg', '/apple-touch-icon.png', '/logo-mark.svg']) {
    const r = await get(f);
    record('LIVE-SEO-004', `${f} loads`, r.status === 200, `${r.status} ${r.headers.get('content-type')}`);
  }
}

const browser = await chromium.launch({ channel: process.env.PW_CHANNEL || 'chrome' });

/* ---------- Page content, SEO tags, links ---------- */
{
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  await ctx.addInitScript(() => sessionStorage.setItem('ps-intro-seen', '1'));
  const page = await ctx.newPage();
  const errors = [], failed = [], thirdParty = new Set();
  page.on('pageerror', (e) => errors.push(e.message));
  page.on('console', (m) => ['error', 'warning'].includes(m.type()) && errors.push(`${m.type()}: ${m.text()}`));
  page.on('requestfailed', (r) => failed.push(`${r.url()} ${r.failure()?.errorText}`));
  page.on('response', (r) => { if (r.status() >= 400) failed.push(`${r.status()} ${r.url()}`); });
  page.on('request', (r) => { const h = new URL(r.url()).hostname; if (h !== HOST) thirdParty.add(h); });
  await page.goto(BASE + '/', { waitUntil: 'networkidle' });
  const info = await page.evaluate(() => {
    const m = (s, a = 'content') => document.querySelector(s)?.getAttribute(a) || null;
    return {
      title: document.title,
      lang: document.documentElement.lang,
      desc: m('meta[name=description]'),
      canonical: m('link[rel=canonical]', 'href'),
      ogUrl: m('meta[property="og:url"]'), ogImage: m('meta[property="og:image"]'),
      ogTitle: m('meta[property="og:title"]'), twitter: m('meta[name="twitter:card"]'),
      robots: m('meta[name=robots]'),
      h1: [...document.querySelectorAll('h1')].map((h) => h.textContent.trim()),
      headings: [...document.querySelectorAll('h1,h2,h3')].map((h) => +h.tagName[1]),
      imgNoAlt: [...document.querySelectorAll('img')].filter((i) => !i.hasAttribute('alt')).length,
      imgCount: document.images.length,
      brokenImgs: [...document.images].filter((i) => i.complete && i.naturalWidth === 0).map((i) => i.currentSrc || i.src),
      jsonld: [...document.querySelectorAll('script[type="application/ld+json"]')].map((s) => { try { JSON.parse(s.textContent); return true; } catch { return false; } }),
      lorem: /lorem ipsum|TODO|placeholder text|undefined|\[object/i.test(document.body.innerText),
      links: [...document.querySelectorAll('a[href]')].map((a) => ({ href: a.getAttribute('href'), abs: a.href, text: (a.innerText || a.getAttribute('aria-label') || '').trim().slice(0, 40), target: a.target, rel: a.rel })),
      netlifyBadge: !!document.querySelector('script[src*="netlify/scripts/hud"]'),
      year: document.body.innerText.match(/©\s*(\d{4})/)?.[1] || null,
    };
  });
  record('LIVE-SEO-010', 'title present', info.title.length > 10, info.title);
  record('LIVE-SEO-011', 'lang attribute set', !!info.lang, info.lang);
  record('LIVE-SEO-012', 'meta description 50-170 chars', (info.desc || '').length >= 50 && info.desc.length <= 170, `${(info.desc || '').length} chars`);
  record('LIVE-SEO-013', 'canonical = live domain', info.canonical === BASE + '/', info.canonical);
  record('LIVE-SEO-014', 'og:url and og:image use the live domain', info.ogUrl?.startsWith(BASE) && info.ogImage?.startsWith(BASE), `${info.ogUrl} | ${info.ogImage}`);
  record('LIVE-SEO-015', 'Open Graph title and Twitter card present', !!info.ogTitle && !!info.twitter, `${info.ogTitle} | ${info.twitter}`);
  record('LIVE-SEO-016', 'no noindex directive', !/noindex/i.test(info.robots || ''), info.robots || 'none');
  record('LIVE-SEO-017', 'exactly one h1', info.h1.length === 1, info.h1.join(' / '));
  record('LIVE-SEO-018', 'heading levels never skip down by more than one', info.headings.every((h, i) => i === 0 || h - info.headings[i - 1] <= 1), info.headings.join(','));
  record('LIVE-SEO-019', 'JSON-LD parses', info.jsonld.length > 0 && info.jsonld.every(Boolean), `${info.jsonld.length} block(s)`);
  record('LIVE-IMG-001', 'every <img> has an alt attribute', info.imgNoAlt === 0, `${info.imgNoAlt}/${info.imgCount} missing`);
  record('LIVE-IMG-002', 'no broken images after load', info.brokenImgs.length === 0, info.brokenImgs.join(', '));
  record('LIVE-CNT-001', 'no placeholder / undefined text on the page', !info.lorem);
  record('LIVE-CNT-002', 'copyright year is current', !info.year || +info.year >= 2026, String(info.year));
  record('LIVE-RUN-001', 'no console errors or warnings on load', errors.length === 0, errors.slice(0, 3).join(' | '));
  record('LIVE-RUN-002', 'no failed or 4xx/5xx requests on load', failed.length === 0, failed.slice(0, 3).join(' | '));
  record('LIVE-PRIV-001', 'third-party hosts contacted on load', true, [...thirdParty].join(', ') || 'none');
  record('LIVE-PROD-001', 'Netlify badge script present (platform setting, not code)', !info.netlifyBadge, info.netlifyBadge ? 'badge still enabled' : 'removed');

  // links
  const seen = new Set();
  for (const l of info.links) {
    const key = l.abs; if (seen.has(key)) continue; seen.add(key);
    const u = new URL(l.abs);
    if (l.href === '#' || l.href === '') { record('LIVE-LNK-001', `placeholder href "${l.href}" (${l.text})`, false); continue; }
    if (u.protocol === 'mailto:') { record('LIVE-LNK-002', `mailto ${u.pathname}`, /^[^@\s]+@[^@\s]+\.[a-z]{2,}$/i.test(u.pathname), l.text); continue; }
    if (u.protocol === 'tel:') { record('LIVE-LNK-003', `tel ${u.pathname}`, /^\+?[\d]{8,15}$/.test(u.pathname), l.text); continue; }
    if (u.hostname === HOST) {
      if (u.hash && !u.pathname.replace(/\/$/, '').match(/\.html$/)) {
        const ok = await page.evaluate((id) => !!document.getElementById(id), u.hash.slice(1));
        record('LIVE-LNK-004', `anchor ${u.hash} has a target`, ok, l.text);
      } else {
        const r = await get(u.pathname);
        record('LIVE-LNK-005', `internal ${u.pathname}`, r.status === 200, String(r.status));
      }
      continue;
    }
    // external: one polite request each
    const r = await get(l.abs, { method: 'HEAD', redirect: 'follow' });
    const ok = r.status >= 200 && r.status < 400;
    const blocked = [401, 403, 405, 429, 999].includes(r.status) || r.status === 0;
    record('LIVE-LNK-006', `external ${u.hostname}${u.pathname.slice(0, 30)}`, ok || blocked, `${r.status}${blocked && !ok ? ' (bot protection / network, not proof of a broken link)' : ''}`);
    if (l.target === '_blank') record('LIVE-LNK-007', `target=_blank has rel noopener: ${u.hostname}`, /noopener/.test(l.rel), l.rel || 'no rel');
  }
  await ctx.close();
}

/* ---------- Responsive matrix ---------- */
{
  for (const [w, h] of VIEWPORTS) {
    const ctx = await browser.newContext({ viewport: { width: w, height: h }, hasTouch: w < 800, isMobile: w < 500 });
    await ctx.addInitScript(() => sessionStorage.setItem('ps-intro-seen', '1'));
    const page = await ctx.newPage();
    const errs = [];
    page.on('pageerror', (e) => errs.push(e.message));
    await page.goto(BASE + '/', { waitUntil: 'networkidle' });
    // trigger lazy / reveal content
    for (let y = 0; y < 14000; y += 700) { await page.evaluate((v) => window.scrollTo(0, v), y); await page.waitForTimeout(60); }
    await page.evaluate(() => window.scrollTo(0, 0));
    const m = await page.evaluate(() => {
      const de = document.documentElement;
      const small = [...document.querySelectorAll('a,button,input,select,textarea,[role=button]')]
        .filter((e) => { const r = e.getBoundingClientRect(); return r.width > 0 && r.height > 0 && (r.height < 24 || r.width < 24) && getComputedStyle(e).visibility !== 'hidden' && !e.closest('[aria-hidden=true]') && !(e.tagName === 'A' && e.classList.contains('sr-only')); })
        .map((e) => `${e.tagName.toLowerCase()}:${(e.getAttribute('aria-label') || e.innerText || '').trim().slice(0, 20)}`);
      return { overflow: de.scrollWidth - de.clientWidth, fontMin: Math.min(...[...document.querySelectorAll('p,li,a,label,span')].filter((e) => e.innerText?.trim()).map((e) => parseFloat(getComputedStyle(e).fontSize))), small };
    });
    record(`LIVE-RESP-${w}x${h}`, `no horizontal overflow at ${w}x${h}`, m.overflow <= 0, `overflow=${m.overflow}px, min font=${m.fontMin}px, targets<24px=${m.small.length}${m.small.length ? ' [' + [...new Set(m.small)].slice(0, 4).join('; ') + ']' : ''}`);
    if (errs.length) record(`LIVE-RESP-${w}x${h}-js`, 'no JS errors', false, errs[0]);
    await page.screenshot({ path: `${OUT}/home-${w}x${h}.png`, fullPage: false });
    await ctx.close();
  }
  // 200% zoom (1280 wide viewport at device scale 1 == 640 css px) and reduced motion
  const ctx = await browser.newContext({ viewport: { width: 640, height: 400 }, reducedMotion: 'reduce' });
  await ctx.addInitScript(() => sessionStorage.setItem('ps-intro-seen', '1'));
  const page = await ctx.newPage();
  await page.goto(BASE + '/', { waitUntil: 'networkidle' });
  const o = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
  record('LIVE-RESP-ZOOM200', '200% zoom equivalent (640px css width) has no horizontal overflow', o <= 0, `overflow=${o}px`);
  await ctx.close();
}

await browser.close();
const failed = results.filter((r) => !r.pass);
await writeFile(`${OUT}/results.json`, JSON.stringify({ base: BASE, date: new Date().toISOString(), results }, null, 2));
console.log(`\n${results.length - failed.length} passed, ${failed.length} failed of ${results.length}`);
failed.forEach((f) => console.log(` FAIL ${f.id} ${f.name} -> ${f.detail}`));
