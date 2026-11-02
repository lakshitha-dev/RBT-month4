// Runs axe-core (WCAG 2.0/2.1 A + AA + best practices) against every route and key
// interactive states, in light and dark themes, on the production build.
//
//   npm run build && npm run a11y
import { mkdirSync, writeFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { resolve } from 'node:path';
import puppeteer from 'puppeteer-core';
import { BASE_URL, findChrome, setPort, signIn, signOut, startPreview } from './lib.mjs';

const require = createRequire(import.meta.url);
const AXE_PATH = require.resolve('axe-core/axe.min.js');
const OUT = resolve('docs/accessibility');
const TAGS = ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'best-practice'];

const waitIdle = (page) => page.waitForNetworkIdle({ idleTime: 400 }).catch(() => {});
const settle = (ms = 900) => new Promise((r) => setTimeout(r, ms));

/** Each scenario navigates and optionally interacts before axe runs. */
const SCENARIOS = [
  { name: 'Login', path: '/login', auth: false },
  {
    name: 'Login — validation errors',
    path: '/login',
    auth: false,
    act: async (page) => {
      await page.click('button[type="submit"]');
      await settle(300);
    },
  },
  { name: 'Dashboard', path: '/' },
  { name: 'Users list', path: '/users' },
  {
    name: 'Users — edit modal',
    path: '/users',
    act: async (page) => {
      await page.click('button[aria-label^="Edit "]');
      await page.waitForSelector('[role="dialog"]');
      await settle(300);
    },
  },
  {
    name: 'Users — delete confirmation',
    path: '/users',
    act: async (page) => {
      await page.click('button[aria-label^="Delete "]');
      await page.waitForSelector('[role="alertdialog"]');
      await settle(300);
    },
  },
  { name: 'Users — filtered (no results)', path: '/users?q=zzzz-nobody' },
  {
    name: 'Add user wizard — validation errors',
    path: '/users/new',
    act: async (page) => {
      const [btn] = await page.$$('xpath/.//button[normalize-space()="Continue"]');
      await btn.click();
      await settle(300);
    },
  },
  { name: 'Activity log (virtualised)', path: '/activity' },
  { name: 'Notifications', path: '/notifications' },
  {
    name: 'Notification bell popover',
    path: '/',
    act: async (page) => {
      await page.click('button[aria-label^="Notifications"]');
      await settle(300);
    },
  },
  { name: 'Settings', path: '/settings' },
  {
    name: 'Mobile navigation drawer',
    path: '/',
    viewport: { width: 390, height: 844 },
    act: async (page) => {
      await page.click('button[aria-label="Open menu"]');
      await settle(300);
    },
  },
];

mkdirSync(OUT, { recursive: true });
// Own port so it can run alongside the Lighthouse script.
setPort(Number(process.env.A11Y_PORT ?? 4174));
const server = await startPreview();
const browser = await puppeteer.launch({ executablePath: findChrome(), headless: true });
const report = [];

try {
  for (const theme of ['light', 'dark']) {
    for (const s of SCENARIOS) {
      const page = await browser.newPage();
      await page.setViewport(s.viewport ?? { width: 1366, height: 900 });
      await page.emulateMediaFeatures([{ name: 'prefers-reduced-motion', value: 'reduce' }]);
      if (s.auth === false) {
        await signOut(page);
        await page.evaluate((t) => localStorage.setItem('adminflow-ui', JSON.stringify({ state: { theme: t }, version: 0 })), theme);
      } else {
        await signIn(page, theme);
      }
      await page.goto(`${BASE_URL}${s.path}`, { waitUntil: 'networkidle0' });
      await waitIdle(page);
      await settle();
      if (s.act) await s.act(page);

      await page.addScriptTag({ path: AXE_PATH });
      const result = await page.evaluate(
        (tags) => window.axe.run(document, { runOnly: { type: 'tag', values: tags }, resultTypes: ['violations'] }),
        TAGS,
      );
      const violations = result.violations.map((v) => ({
        id: v.id,
        impact: v.impact,
        help: v.help,
        nodes: v.nodes.map((n) => n.target.join(' ')).slice(0, 5),
      }));
      // WCAG 1.4.10 Reflow: at 320 CSS px nothing outside a horizontally scrollable region
      // (e.g. a data table) may extend past the viewport.
      await page.setViewport({ width: 320, height: 800 });
      await settle(300);
      const overflow = await page.evaluate(() => {
        const vw = document.documentElement.clientWidth;
        const inScroller = (el) => {
          for (let p = el.parentElement; p; p = p.parentElement) {
            if (['auto', 'scroll'].includes(getComputedStyle(p).overflowX)) return true;
          }
          return false;
        };
        return [...document.body.querySelectorAll('*')]
          .filter((el) => el.getClientRects().length && el.getBoundingClientRect().right > vw + 1 && !inScroller(el))
          .filter((el) => !el.closest('.sr-only'))
          .slice(0, 3)
          .map((el) => `${el.tagName.toLowerCase()}.${String(el.className).split(' ').slice(0, 3).join('.')}`);
      });
      if (overflow.length) {
        violations.push({ id: 'reflow-320px', impact: 'serious', help: 'Content overflows a 320px viewport (WCAG 1.4.10)', nodes: overflow });
      }
      report.push({ scenario: s.name, theme, path: s.path, passes: result.passes?.length, violations });
      console.log(`${theme.padEnd(5)} ${s.name.padEnd(38)} ${violations.length ? `✗ ${violations.map((v) => v.id).join(', ')}` : '✓ no violations'}`);
      await page.close();
    }
  }

  const total = report.reduce((n, r) => n + r.violations.length, 0);
  writeFileSync(resolve(OUT, 'axe-results.json'), JSON.stringify({ generated: new Date().toISOString(), tags: TAGS, report }, null, 2));
  console.log(`\n${report.length} scenario runs, ${total} violation types found. Results: docs/accessibility/axe-results.json`);
  process.exitCode = total ? 1 : 0;
} finally {
  await browser.close();
  server.httpServer.close();
  setTimeout(() => process.exit(process.exitCode ?? 0), 200);
}
