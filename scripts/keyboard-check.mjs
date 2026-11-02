// Keyboard-only and focus-management checks that axe cannot test (focus traps, Esc,
// focus restore, roving tabindex, route-change focus). Runs on the production build.
//
//   npm run build && node scripts/keyboard-check.mjs
import { mkdirSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import puppeteer from 'puppeteer-core';
import { BASE_URL, findChrome, setPort, signIn, signOut, startPreview } from './lib.mjs';

setPort(Number(process.env.KB_PORT ?? 4175));
const settle = (ms = 400) => new Promise((r) => setTimeout(r, ms));

/** Describes the focused element as "role/tag: accessible-ish name". */
const focused = (page) =>
  page.evaluate(() => {
    const el = document.activeElement;
    if (!el || el === document.body) return 'body';
    const name = el.getAttribute('aria-label') || el.textContent?.trim().replace(/\s+/g, ' ').slice(0, 40) || el.id;
    return `${el.getAttribute('role') || el.tagName.toLowerCase()}: ${name}`;
  });

const insideDialog = (page) =>
  page.evaluate(() => Boolean(document.activeElement?.closest('[role="dialog"], [role="alertdialog"]')));

async function open(page, path, { auth = true, viewport } = {}) {
  await page.setViewport(viewport ?? { width: 1366, height: 900 });
  if (auth) await signIn(page);
  else await signOut(page);
  await page.goto(`${BASE_URL}${path}`, { waitUntil: 'networkidle0' });
  await settle(900);
}

const CHECKS = [
  {
    name: 'First Tab reaches the skip link; activating it moves focus to <main>',
    run: async (page) => {
      await open(page, '/');
      await page.keyboard.press('Tab');
      const first = await focused(page);
      await page.keyboard.press('Enter');
      await settle(200);
      const afterId = await page.evaluate(() => document.activeElement?.id);
      return { pass: first.includes('Skip to main content') && afterId === 'main-content', detail: `first Tab → "${first}", after Enter → #${afterId}` };
    },
  },
  {
    name: 'Client-side navigation moves focus to the new page <h1> and updates the title',
    run: async (page) => {
      await open(page, '/');
      await page.click('nav[aria-label="Main"] a[href="/users"]');
      await page.waitForFunction(() => document.activeElement?.tagName === 'H1', { timeout: 5000 }).catch(() => {});
      const f = await focused(page);
      const title = await page.title();
      return { pass: f === 'h1: Users' && title.startsWith('Users'), detail: `focus → "${f}", title "${title}"` };
    },
  },
  {
    name: 'Edit modal: focus moves in, Tab is trapped, Esc closes and focus returns to the trigger',
    run: async (page) => {
      await open(page, '/users');
      const label = await page.$eval('button[aria-label^="Edit "]', (b) => b.getAttribute('aria-label'));
      await page.focus('button[aria-label^="Edit "]');
      await page.keyboard.press('Enter');
      await page.waitForSelector('[role="dialog"]');
      await settle(200);
      const startsInside = await insideDialog(page);
      let staysInside = true;
      for (let i = 0; i < 15; i++) {
        await page.keyboard.press('Tab');
        staysInside &&= await insideDialog(page);
      }
      for (let i = 0; i < 5; i++) {
        await page.keyboard.down('Shift');
        await page.keyboard.press('Tab');
        await page.keyboard.up('Shift');
        staysInside &&= await insideDialog(page);
      }
      await page.keyboard.press('Escape');
      await settle(200);
      const closed = !(await page.$('[role="dialog"]'));
      const back = await focused(page);
      return {
        pass: startsInside && staysInside && closed && back === `button: ${label}`,
        detail: `starts inside: ${startsInside}, trapped over 20 Tab/Shift+Tab: ${staysInside}, closed on Esc: ${closed}, focus back on "${back}"`,
      };
    },
  },
  {
    name: 'Delete confirmation opens with focus on the safe "Cancel" action',
    run: async (page) => {
      await open(page, '/users');
      await page.focus('button[aria-label^="Delete "]');
      await page.keyboard.press('Enter');
      await page.waitForSelector('[role="alertdialog"]');
      await settle(200);
      const f = await focused(page);
      return { pass: f === 'button: Cancel', detail: `initial focus → "${f}"` };
    },
  },
  {
    name: 'Tabs: arrow keys move focus and selection (roving tabindex), Home/End jump',
    run: async (page) => {
      await open(page, '/');
      await page.focus('[role="tab"][aria-selected="true"]');
      await page.keyboard.press('ArrowRight');
      await settle(100);
      const a = await page.evaluate(() => [document.activeElement?.textContent, document.activeElement?.getAttribute('aria-selected')]);
      await page.keyboard.press('Home');
      await settle(100);
      const b = await page.evaluate(() => document.activeElement?.textContent);
      const tabbable = await page.$$eval('[role="tab"]', (tabs) => tabs.filter((t) => t.tabIndex === 0).length);
      return {
        pass: a[0] === '90 days' && a[1] === 'true' && b === '7 days' && tabbable === 1,
        detail: `30 days →ArrowRight→ "${a[0]}" (selected=${a[1]}), Home → "${b}", tabbable tabs: ${tabbable}`,
      };
    },
  },
  {
    name: 'Sortable column header is a button operable from the keyboard (aria-sort updates)',
    run: async (page) => {
      await open(page, '/users');
      const before = await page.$eval('th[aria-sort] button', (b) => b.closest('th').getAttribute('aria-sort'));
      await page.focus('th[aria-sort] button');
      await page.keyboard.press('Enter');
      await page.waitForNetworkIdle({ idleTime: 300 }).catch(() => {});
      await settle(800);
      const after = await page.$eval('th[aria-sort] button', (b) => b.closest('th').getAttribute('aria-sort'));
      return { pass: before === 'none' && after === 'ascending', detail: `Name column aria-sort: ${before} → ${after}` };
    },
  },
  {
    name: 'Notification menu: Enter opens (aria-expanded), Esc closes and returns focus',
    run: async (page) => {
      await open(page, '/');
      await page.focus('button[aria-label^="Notifications"]');
      await page.keyboard.press('Enter');
      await settle(200);
      const expanded = await page.$eval('button[aria-label^="Notifications"]', (b) => b.getAttribute('aria-expanded'));
      await page.keyboard.press('Escape');
      await settle(200);
      const collapsed = await page.$eval('button[aria-label^="Notifications"]', (b) => b.getAttribute('aria-expanded'));
      const f = await focused(page);
      return { pass: expanded === 'true' && collapsed === 'false' && f.startsWith('button: Notifications'), detail: `expanded ${expanded} → ${collapsed}, focus "${f}"` };
    },
  },
  {
    name: 'Mobile drawer: focus trapped inside, Esc closes and returns focus to the menu button',
    run: async (page) => {
      await open(page, '/', { viewport: { width: 390, height: 844 } });
      await page.focus('button[aria-label="Open menu"]');
      await page.keyboard.press('Enter');
      await page.waitForSelector('#mobile-nav');
      await settle(200);
      let inside = await insideDialog(page);
      for (let i = 0; i < 10; i++) {
        await page.keyboard.press('Tab');
        inside &&= await insideDialog(page);
      }
      await page.keyboard.press('Escape');
      await settle(200);
      const f = await focused(page);
      const closed = !(await page.$('#mobile-nav'));
      return { pass: inside && closed && f === 'button: Open menu', detail: `trapped: ${inside}, closed: ${closed}, focus "${f}"` };
    },
  },
  {
    name: 'Login: submitting empty form focuses the first invalid field and links its error',
    run: async (page) => {
      await open(page, '/login', { auth: false });
      await page.focus('button[type="submit"]');
      await page.keyboard.press('Enter');
      await settle(300);
      const info = await page.evaluate(() => {
        const el = document.activeElement;
        const desc = el?.getAttribute('aria-describedby');
        return { id: el?.getAttribute('name'), invalid: el?.getAttribute('aria-invalid'), error: desc ? document.getElementById(desc.split(' ').pop())?.textContent : null };
      });
      return { pass: info.id === 'email' && info.invalid === 'true' && Boolean(info.error), detail: `focus → ${info.id}, aria-invalid=${info.invalid}, described by "${info.error}"` };
    },
  },
  {
    name: 'Wizard: invalid step keeps you on it and focuses the first error; valid step moves focus to the next step heading',
    run: async (page) => {
      await open(page, '/users/new');
      const [cont] = await page.$$('xpath/.//button[normalize-space()="Continue"]');
      await cont.click();
      await settle(300);
      const first = await page.evaluate(() => document.activeElement?.getAttribute('name'));
      await page.type('input[name="name"]', 'Keyboard Tester');
      await page.type('input[name="email"]', 'keyboard.tester@example.com');
      await page.focus('select[name="department"]');
      await page.keyboard.press('ArrowDown'); // keyboard choice, as a real user would make it
      await page.focus('input[name="name"]');
      await page.keyboard.press('Enter');
      await settle(400);
      const f = await focused(page);
      return { pass: first === 'name' && f.startsWith('h2: Step 2 of 3'), detail: `empty Continue → focus "${first}", Enter on valid step → "${f}"` };
    },
  },
];

mkdirSync(resolve('docs/accessibility'), { recursive: true });
const server = await startPreview();
const browser = await puppeteer.launch({ executablePath: findChrome(), headless: true });
const results = [];
try {
  for (const check of CHECKS) {
    const page = await browser.newPage();
    let outcome;
    try {
      outcome = await check.run(page);
    } catch (error) {
      outcome = { pass: false, detail: `error: ${error.message}` };
    }
    results.push({ check: check.name, ...outcome });
    console.log(`${outcome.pass ? '✓' : '✗'} ${check.name}\n    ${outcome.detail}`);
    await page.close();
  }
  writeFileSync(resolve('docs/accessibility/keyboard-results.json'), JSON.stringify({ generated: new Date().toISOString(), results }, null, 2));
  const failed = results.filter((r) => !r.pass).length;
  console.log(`\n${results.length - failed}/${results.length} keyboard checks passed.`);
  process.exitCode = failed ? 1 : 0;
} finally {
  await browser.close();
  server.httpServer.close();
  setTimeout(() => process.exit(process.exitCode ?? 0), 200);
}
