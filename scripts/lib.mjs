// Shared helpers for the audit scripts (Lighthouse + axe).
import { existsSync } from 'node:fs';
import { join } from 'node:path';
import { preview } from 'vite';

export let PORT = Number(process.env.PREVIEW_PORT ?? 4173);
export let BASE_URL = `http://localhost:${PORT}`;

/** Lets a script use its own port (ES module live bindings update every importer). */
export function setPort(port) {
  PORT = port;
  BASE_URL = `http://localhost:${port}`;
}

/** Finds a local Chrome/Edge. Override with CHROME_PATH. */
export function findChrome() {
  const candidates = [
    process.env.CHROME_PATH,
    process.env.LOCALAPPDATA && join(process.env.LOCALAPPDATA, 'Google/Chrome/Application/chrome.exe'),
    'C:/Program Files/Google/Chrome/Application/chrome.exe',
    'C:/Program Files (x86)/Google/Chrome/Application/chrome.exe',
    'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',
    '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
    '/usr/bin/google-chrome',
    '/usr/bin/chromium',
  ].filter(Boolean);
  const found = candidates.find((p) => existsSync(p));
  if (!found) throw new Error('Chrome not found. Set CHROME_PATH to a Chrome/Edge executable.');
  return found;
}

/** Serves the production build (`dist/`) exactly like `npm run preview`. */
export async function startPreview() {
  if (!existsSync('dist/index.html')) throw new Error('No production build found. Run `npm run build` first.');
  const server = await preview({ preview: { port: PORT, strictPort: true, open: false }, logLevel: 'warn' });
  return server;
}

const SESSION = {
  state: {
    user: { id: 'usr_admin', name: 'Alex Admin', email: 'admin@adminflow.dev', role: 'admin' },
    token: 'demo.audit-token',
  },
  version: 0,
};

/** Seeds a signed-in session (same shape the auth store persists) so protected routes can be audited. */
export async function signIn(page, theme = 'light') {
  await page.goto(`${BASE_URL}/login`, { waitUntil: 'networkidle0' });
  await page.evaluate(
    (session, theme) => {
      localStorage.setItem('adminflow-auth', JSON.stringify(session));
      localStorage.setItem('adminflow-ui', JSON.stringify({ state: { theme }, version: 0 }));
    },
    SESSION,
    theme,
  );
}

export async function signOut(page) {
  await page.goto(`${BASE_URL}/login`, { waitUntil: 'networkidle0' });
  await page.evaluate(() => localStorage.clear());
}
