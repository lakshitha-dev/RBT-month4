// Runs Lighthouse against the production build (mobile + desktop) for the key routes,
// writes HTML/JSON reports and a combined PDF to docs/lighthouse/.
//
//   npm run build && npm run lighthouse
import { mkdirSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import lighthouse from 'lighthouse';
import desktopConfig from 'lighthouse/core/config/desktop-config.js';
import puppeteer from 'puppeteer-core';
import { PDFDocument } from 'pdf-lib';
import { BASE_URL, findChrome, signIn, signOut, startPreview } from './lib.mjs';

const OUT_DIR = resolve('docs/lighthouse');
const PDF_NAME = process.env.LH_PDF_NAME ?? 'lakshitha-month4-lighthouse.pdf';
const CATEGORIES = ['performance', 'accessibility', 'best-practices', 'seo'];
const RUNS = Number(process.env.LH_RUNS ?? 3);

const ALL_PAGES = [
  { name: 'login', path: '/login', auth: false },
  { name: 'dashboard', path: '/', auth: true },
  { name: 'users', path: '/users', auth: true },
];
const ALL_PROFILES = [
  { name: 'mobile', config: undefined },
  { name: 'desktop', config: desktopConfig },
];
// Optional filters for quick iteration, e.g. LH_PAGES=dashboard LH_PROFILES=mobile (skips the PDF).
const only = (list, env) => (env ? list.filter((x) => env.split(',').includes(x.name)) : list);
const PAGES = only(ALL_PAGES, process.env.LH_PAGES);
const PROFILES = only(ALL_PROFILES, process.env.LH_PROFILES);
const isPartial = Boolean(process.env.LH_PAGES || process.env.LH_PROFILES);

mkdirSync(OUT_DIR, { recursive: true });
const server = await startPreview();
const browser = await puppeteer.launch({ executablePath: findChrome(), headless: true, args: ['--no-sandbox'] });
const results = [];

try {
  for (const profile of PROFILES) {
    for (const target of PAGES) {
      // Lighthouse scores vary between runs, so each configuration runs RUNS times and the
      // median run (by performance score) is kept — the approach Lighthouse CI recommends.
      const runs = [];
      for (let i = 0; i < RUNS; i++) {
        const page = await browser.newPage();
        if (target.auth) await signIn(page);
        else await signOut(page);
        const runnerResult = await lighthouse(
          `${BASE_URL}${target.path}`,
          { output: ['html', 'json'], onlyCategories: CATEGORIES, disableStorageReset: true, logLevel: 'error' },
          profile.config,
          page,
        );
        runs.push(runnerResult);
        await page.close();
      }
      const perf = (r) => r.lhr.categories.performance.score;
      const sortedRuns = [...runs].sort((a, b) => perf(a) - perf(b));
      const median = sortedRuns[Math.floor(sortedRuns.length / 2)];

      const [html, json] = median.report;
      const base = `${target.name}-${profile.name}`;
      writeFileSync(resolve(OUT_DIR, `${base}.html`), html);
      writeFileSync(resolve(OUT_DIR, `${base}.json`), json);

      const scores = Object.fromEntries(
        CATEGORIES.map((c) => [c, Math.round((median.lhr.categories[c]?.score ?? 0) * 100)]),
      );
      const audits = median.lhr.audits;
      results.push({
        page: target.name,
        path: target.path,
        profile: profile.name,
        scores,
        allPerformanceRuns: runs.map((r) => Math.round(perf(r) * 100)),
        benchmarkIndex: Math.round(median.lhr.environment.benchmarkIndex),
        metrics: {
          FCP: audits['first-contentful-paint']?.displayValue,
          LCP: audits['largest-contentful-paint']?.displayValue,
          TBT: audits['total-blocking-time']?.displayValue,
          CLS: audits['cumulative-layout-shift']?.displayValue,
          SI: audits['speed-index']?.displayValue,
        },
      });
      console.log(
        `${base.padEnd(18)} ${CATEGORIES.map((c) => `${c}: ${scores[c]}`).join('  ')}  (perf runs: ${results.at(-1).allPerformanceRuns.join(', ')})`,
      );
    }
  }

  if (isPartial) process.exit(0);

  // Lighthouse's mobile preset (4x CPU slowdown) assumes a fast host (benchmarkIndex > 1000);
  // on slower or busy hosts it simulates a much slower phone. Record it so results can be interpreted.
  const indexes = results.map((r) => r.benchmarkIndex);
  const minIndex = Math.min(...indexes);
  function hostNote(format) {
    const range = `${minIndex}–${Math.max(...indexes)}`;
    const text =
      minIndex > 1000
        ? `Host CPU benchmarkIndex ${range} (above Lighthouse's 1000 threshold).`
        : `Host CPU benchmarkIndex ${range}: below the 1000 threshold at which Lighthouse warns "The tested device appears to have a slower CPU than Lighthouse expects. This can negatively affect your performance score." Mobile performance scores here are therefore pessimistic; re-run on an idle machine with a higher benchmark index for representative mobile numbers.`;
    return format === 'md' ? `> **Note:** ${text}` : text;
  }

  // Summary (markdown + JSON) for the docs.
  const generated = new Date().toISOString();
  writeFileSync(resolve(OUT_DIR, 'summary.json'), JSON.stringify({ generated, results }, null, 2));
  const md = [
    '# Lighthouse summary',
    '',
    `Generated ${generated} against the production build (\`vite preview\`). Each row is the median of ${RUNS} runs (by performance score); the HTML/JSON reports are that median run.`,
    '',
    '| Page | Profile | Performance (median) | All perf runs | Accessibility | Best practices | SEO | FCP | LCP | TBT | CLS |',
    '|------|---------|----------------------|---------------|---------------|----------------|-----|-----|-----|-----|-----|',
    ...results.map(
      (r) =>
        `| ${r.page} (\`${r.path}\`) | ${r.profile} | ${r.scores.performance} | ${r.allPerformanceRuns.join(', ')} | ${r.scores.accessibility} | ${r.scores['best-practices']} | ${r.scores.seo} | ${r.metrics.FCP} | ${r.metrics.LCP} | ${r.metrics.TBT} | ${r.metrics.CLS} |`,
    ),
    '',
    hostNote('md'),
    '',
    'Full reports: `<page>-<profile>.html` in this folder (open in a browser).',
    '',
  ].join('\n');
  writeFileSync(resolve(OUT_DIR, 'summary.md'), md);

  // Combined PDF: a summary cover page followed by every HTML report printed to PDF.
  const merged = await PDFDocument.create();
  const printPage = await browser.newPage();
  const cover = `<!doctype html><meta charset="utf-8"><style>
    body{font:14px system-ui,sans-serif;margin:40px;color:#0f172a}h1{font-size:22px}
    table{border-collapse:collapse;width:100%;margin-top:16px}th,td{border:1px solid #cbd5e1;padding:6px 8px;text-align:left}
    th{background:#f1f5f9}.good{color:#047857;font-weight:600}.mid{color:#b45309;font-weight:600}.bad{color:#b91c1c;font-weight:600}
  </style><h1>AdminFlow Dashboard — Lighthouse report</h1>
  <p>Generated ${generated} · production build served by <code>vite preview</code> · Lighthouse default mobile (simulated Slow 4G, 4× CPU) and desktop presets. Each row is the median of ${RUNS} runs by performance score.</p>
  <table><tr><th>Page</th><th>Profile</th><th>Performance (median)</th><th>Perf runs</th><th>Accessibility</th><th>Best practices</th><th>SEO</th><th>LCP</th><th>TBT</th><th>CLS</th></tr>
  ${results
    .map((r) => {
      const cell = (v) => `<td class="${v >= 90 ? 'good' : v >= 50 ? 'mid' : 'bad'}">${v}</td>`;
      return `<tr><td>${r.page} (${r.path})</td><td>${r.profile}</td>${cell(r.scores.performance)}<td>${r.allPerformanceRuns.join(', ')}</td>${cell(r.scores.accessibility)}${cell(r.scores['best-practices'])}${cell(r.scores.seo)}<td>${r.metrics.LCP}</td><td>${r.metrics.TBT}</td><td>${r.metrics.CLS}</td></tr>`;
    })
    .join('')}</table><p><strong>Host:</strong> ${hostNote('html')}</p><p>The following pages contain the full Lighthouse report for each run.</p>`;
  await printPage.setContent(cover, { waitUntil: 'load' });
  const pdfs = [await printPage.pdf({ format: 'A4', printBackground: true })];
  for (const r of results) {
    await printPage.goto(pathToFileURL(resolve(OUT_DIR, `${r.page}-${r.profile}.html`)).href, { waitUntil: 'networkidle0' });
    pdfs.push(await printPage.pdf({ format: 'A4', printBackground: true }));
  }
  for (const bytes of pdfs) {
    const doc = await PDFDocument.load(bytes);
    const pages = await merged.copyPages(doc, doc.getPageIndices());
    pages.forEach((p) => merged.addPage(p));
  }
  writeFileSync(resolve(OUT_DIR, PDF_NAME), await merged.save());
  console.log(`\nReports written to ${OUT_DIR} (PDF: ${PDF_NAME})`);
} finally {
  await browser.close();
  await new Promise((r) => server.httpServer.close(r));
}
