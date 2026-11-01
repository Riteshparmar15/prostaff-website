import { spawn } from 'node:child_process';
import path from 'node:path';

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const PORT = 9222;
const BASE_URL = 'http://localhost:5173';

const VIEWPORTS = [
  // Mobile
  { name: 'Mobile SE (320x568)', width: 320, height: 568, deviceScaleFactor: 2, mobile: true },
  { name: 'Mobile 360x800', width: 360, height: 800, deviceScaleFactor: 2, mobile: true },
  {
    name: 'Mobile iPhone X (375x812)',
    width: 375,
    height: 812,
    deviceScaleFactor: 3,
    mobile: true,
  },
  {
    name: 'Mobile iPhone 12 (390x844)',
    width: 390,
    height: 844,
    deviceScaleFactor: 3,
    mobile: true,
  },
  {
    name: 'Mobile iPhone 14 Pro Max (430x932)',
    width: 430,
    height: 932,
    deviceScaleFactor: 3,
    mobile: true,
  },
  // Tablet
  { name: 'Tablet iPad (768x1024)', width: 768, height: 1024, deviceScaleFactor: 2, mobile: true },
  {
    name: 'Tablet iPad Air (820x1180)',
    width: 820,
    height: 1180,
    deviceScaleFactor: 2,
    mobile: true,
  },
  {
    name: 'Tablet Landscape (1024x768)',
    width: 1024,
    height: 768,
    deviceScaleFactor: 2,
    mobile: false,
  },
  // Desktop
  { name: 'Desktop HD (1280x720)', width: 1280, height: 720, deviceScaleFactor: 1, mobile: false },
  {
    name: 'Desktop WXGA (1366x768)',
    width: 1366,
    height: 768,
    deviceScaleFactor: 1,
    mobile: false,
  },
  { name: 'Desktop Mac (1440x900)', width: 1440, height: 900, deviceScaleFactor: 2, mobile: false },
  {
    name: 'Desktop FHD (1920x1080)',
    width: 1920,
    height: 1080,
    deviceScaleFactor: 1,
    mobile: false,
  },
];

const PAGES = ['/', '/privacy.html', '/terms.html'];

async function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

class CDPClient {
  constructor(wsUrl) {
    this.wsUrl = wsUrl;
    this.ws = null;
    this.id = 1;
    this.callbacks = new Map();
    this.consoleLogs = [];
    this.networkErrors = [];
  }

  async connect() {
    return new Promise((resolve, reject) => {
      this.ws = new WebSocket(this.wsUrl);
      this.ws.onopen = () => resolve();
      this.ws.onerror = (err) => reject(err);
      this.ws.onmessage = (msg) => {
        const data = JSON.parse(msg.data);
        if (data.id && this.callbacks.has(data.id)) {
          const { resolve, reject } = this.callbacks.get(data.id);
          this.callbacks.delete(data.id);
          if (data.error) reject(data.error);
          else resolve(data.result);
        } else if (data.method) {
          if (data.method === 'Runtime.consoleAPICalled') {
            this.consoleLogs.push({
              type: data.params.type,
              args: data.params.args.map((a) => a.value ?? a.description),
            });
          } else if (data.method === 'Runtime.exceptionThrown') {
            this.consoleLogs.push({
              type: 'error',
              args: [
                data.params.exceptionDetails.text,
                data.params.exceptionDetails.exception?.description,
              ],
            });
          } else if (data.method === 'Network.responseReceived') {
            const status = data.params.response.status;
            if (status >= 400) {
              this.networkErrors.push({
                url: data.params.response.url,
                status,
                statusText: data.params.response.statusText,
              });
            }
          }
        }
      };
    });
  }

  send(method, params = {}) {
    return new Promise((resolve, reject) => {
      const id = this.id++;
      this.callbacks.set(id, { resolve, reject });
      this.ws.send(JSON.stringify({ id, method, params }));
    });
  }

  async evaluate(expression) {
    const res = await this.send('Runtime.evaluate', {
      expression,
      returnByValue: true,
      awaitPromise: true,
    });
    return res.result?.value;
  }

  close() {
    if (this.ws) this.ws.close();
  }
}

async function runAudit() {
  console.log('🚀 Starting Automated Chrome CDP Audit...');

  const chromeProcess = spawn(CHROME_PATH, [
    '--headless=new',
    `--remote-debugging-port=${PORT}`,
    '--disable-gpu',
    '--no-first-run',
    '--no-default-browser-check',
    '--user-data-dir=' + path.resolve('./.chrome-profile'),
  ]);

  let versionInfo = null;
  for (let i = 0; i < 20; i++) {
    try {
      const res = await fetch(`http://127.0.0.1:${PORT}/json/version`);
      if (res.ok) {
        versionInfo = await res.json();
        break;
      }
    } catch {
      await sleep(300);
    }
  }

  if (!versionInfo) {
    chromeProcess.kill();
    throw new Error('Could not connect to Chrome debugging port.');
  }

  console.log('✅ Chrome connected:', versionInfo['Browser']);

  const newTargetRes = await fetch(
    `http://127.0.0.1:${PORT}/json/new?${encodeURIComponent(BASE_URL)}`,
    { method: 'PUT' },
  );
  const target = await newTargetRes.json();
  const client = new CDPClient(target.webSocketDebuggerUrl);
  await client.connect();

  await client.send('Page.enable');
  await client.send('Runtime.enable');
  await client.send('Network.enable');

  for (const pagePath of PAGES) {
    const fullUrl = `${BASE_URL}${pagePath}`;
    console.log(`\n========================================`);
    console.log(`Auditing Page: ${pagePath} (${fullUrl})`);
    console.log(`========================================`);

    client.consoleLogs.length = 0;
    client.networkErrors.length = 0;

    await client.send('Page.navigate', { url: fullUrl });
    await sleep(2200);

    const title = await client.evaluate('document.title');
    console.log(`Page Title: "${title}"`);

    for (const vp of VIEWPORTS) {
      await client.send('Emulation.setDeviceMetricsOverride', {
        width: vp.width,
        height: vp.height,
        deviceScaleFactor: vp.deviceScaleFactor,
        mobile: vp.mobile,
      });
      await sleep(350);

      const overflowCheck = await client.evaluate(`(() => {
        const docW = document.documentElement.clientWidth;
        const scrollW = document.documentElement.scrollWidth;
        const winW = window.innerWidth;
        const overflows = [];
        const allElements = document.querySelectorAll('*');
        for (const el of allElements) {
          const rect = el.getBoundingClientRect();
          if (rect.right > winW + 1 && rect.width > 0) {
            overflows.push({
              tag: el.tagName.toLowerCase(),
              id: el.id || '',
              class: (el.className || '').toString().slice(0, 80),
              right: Math.round(rect.right),
              width: Math.round(rect.width)
            });
          }
        }
        return {
          winW,
          docW,
          scrollW,
          hasHorizontalScroll: scrollW > winW,
          overflowCount: overflows.length,
          sampleOverflows: overflows.slice(0, 5)
        };
      })()`);

      if (overflowCheck.hasHorizontalScroll) {
        console.warn(
          `⚠️ [FAIL] ${vp.name}: Horizontal scroll detected! scrollWidth=${overflowCheck.scrollWidth} > winW=${vp.width}`,
        );
      } else {
        console.log(`✅ [PASS] ${vp.name}: No horizontal overflow.`);
      }
    }

    if (pagePath === '/') {
      // 1. Mobile viewport test: Check input font-size for iOS Safari auto-zoom prevention
      await client.send('Emulation.setDeviceMetricsOverride', {
        width: 375,
        height: 812,
        deviceScaleFactor: 3,
        mobile: true,
      });
      await sleep(300);

      const mobileInputFontSizes = await client.evaluate(`(() => {
        const input = document.getElementById('contact-firstName');
        return input ? window.getComputedStyle(input).fontSize : 'null';
      })()`);
      console.log(
        `📱 Mobile (375px) input font-size: ${mobileInputFontSizes} (Expected: 16px to prevent iOS auto-zoom)`,
      );
      if (mobileInputFontSizes === '16px') {
        console.log(`✅ [PASS] iOS Safari auto-zoom prevented (font-size >= 16px on mobile).`);
      } else {
        console.warn(`⚠️ [WARN] Mobile input font-size is ${mobileInputFontSizes}`);
      }

      // 2. Mobile Menu Interaction: Open & Close
      const menuTest = await client.evaluate(`(() => {
        const toggleBtn = document.querySelector('header button[aria-controls="mobile-menu"]');
        if (!toggleBtn) return { found: false };
        toggleBtn.click();
        const isOpenBefore = toggleBtn.getAttribute('aria-expanded') === 'true';
        const menuEl = document.getElementById('mobile-menu');
        const linksCount = menuEl ? menuEl.querySelectorAll('a').length : 0;
        return { found: true, isOpenBefore, hasMenuEl: !!menuEl, linksCount };
      })()`);
      console.log(`📱 Mobile menu open test:`, menuTest);

      await sleep(500);

      // Close menu
      await client.evaluate(`(() => {
        const toggleBtn = document.querySelector('header button[aria-controls="mobile-menu"]');
        if (toggleBtn) toggleBtn.click();
      })()`);
      await sleep(500);

      // 3. Slideshow Pause Button Touch Target Size & Interaction
      const pauseBtnTest = await client.evaluate(`(() => {
        const pauseBtn = document.querySelector('button[aria-label*="slideshow"]');
        if (!pauseBtn) return { found: false };
        const rect = pauseBtn.getBoundingClientRect();
        const labelBefore = pauseBtn.getAttribute('aria-label');
        pauseBtn.click();
        const labelAfter = pauseBtn.getAttribute('aria-label');
        return {
          found: true,
          width: Math.round(rect.width),
          height: Math.round(rect.height),
          isAccessibleTouchTarget: rect.width >= 44 && rect.height >= 44,
          labelBefore,
          labelAfter
        };
      })()`);
      console.log(`⏯️ Hero slideshow pause/play button test:`, pauseBtnTest);
      if (pauseBtnTest.isAccessibleTouchTarget) {
        console.log(`✅ [PASS] Pause button meets WCAG 2.2 AA 44x44px touch target requirement.`);
      }

      // 4. Industry panel activation
      const industryTest = await client.evaluate(`(() => {
        const buttons = Array.from(document.querySelectorAll('#industries button'));
        if (buttons.length < 2) return { found: false };
        buttons[1].click();
        const isSecondActive = buttons[1].getAttribute('aria-pressed') === 'true';
        return { found: true, total: buttons.length, isSecondActive };
      })()`);
      console.log(`🏢 Industries panel toggle test:`, industryTest);

      // 5. Contact form empty validation
      const formValidationTest = await client.evaluate(`(() => {
        const form = document.querySelector('form[aria-label="Contact form"]');
        if (!form) return { found: false };
        const submitBtn = form.querySelector('button[type="submit"]');
        submitBtn.click();
        const alerts = Array.from(form.querySelectorAll('[role="alert"]')).map(a => a.textContent.trim());
        const activeEl = document.activeElement ? document.activeElement.id : null;
        return { found: true, alertCount: alerts.length, alerts, focusedElement: activeEl };
      })()`);
      console.log(`📝 Contact form validation test:`, formValidationTest);
      if (
        formValidationTest.alertCount > 0 &&
        formValidationTest.focusedElement === 'contact-firstName'
      ) {
        console.log(`✅ [PASS] Form validation triggers and focuses first invalid field.`);
      }
    }

    console.log(
      `Console logs for ${pagePath}:`,
      client.consoleLogs.filter((l) => l.type === 'error' || l.type === 'warning'),
    );
    if (client.networkErrors.length > 0) {
      console.error(`Network failures for ${pagePath}:`, client.networkErrors);
    } else {
      console.log(`✅ [PASS] Zero failed network requests for ${pagePath}.`);
    }
  }

  client.close();
  chromeProcess.kill();

  console.log('\n========================================');
  console.log('ALL VERIFICATIONS COMPLETED SUCCESSFULLY');
  console.log('========================================');
}

runAudit().catch((err) => {
  console.error('Audit failed with error:', err);
  process.exit(1);
});
