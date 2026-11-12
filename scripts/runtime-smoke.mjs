#!/usr/bin/env node
/**
 * Headless runtime smoke test for the exported web bundle.
 *
 * Verifies what a static HTML check cannot: does the SPA actually boot past the
 * startup failure screen, is the database backend ready, and which console
 * errors remain. Always exits 0 - the report is the product, and the CI step is
 * marked continue-on-error so a red smoke run still yields an artifact.
 *
 * Env: SMOKE_URL (default http://127.0.0.1:8099/), SMOKE_REPORT (report path),
 *      CHROME_PATH (optional executable override).
 */
import fs from 'node:fs';
import path from 'node:path';
import puppeteer from 'puppeteer-core';

const URL_TO_OPEN = process.env.SMOKE_URL || 'http://127.0.0.1:8099/';
const REPORT_PATH = process.env.SMOKE_REPORT || 'RUNTIME-SMOKE.md';
const VIEWPORT = { width: 1280, height: 900 };

const CANDIDATES = [
  process.env.CHROME_PATH,
  '/usr/bin/google-chrome',
  '/usr/bin/google-chrome-stable',
  '/usr/bin/chromium',
  '/usr/bin/chromium-browser',
  '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
].filter(Boolean);

function findChrome() {
  for (const candidate of CANDIDATES) {
    try {
      if (fs.existsSync(candidate)) return candidate;
    } catch {
      /* ignore */
    }
  }
  return null;
}

const report = [];
const push = (line = '') => report.push(line);

const consoleErrors = [];
const pageErrors = [];
const failedRequests = [];
const badResponses = [];

function summarise(text, limit = 300) {
  const single = String(text).replace(/\s+/g, ' ').trim();
  return single.length > limit ? `${single.slice(0, limit)}...` : single;
}

const browser = await puppeteer.launch({
  executablePath: findChrome(),
  headless: true,
  args: [
    '--no-sandbox',
    '--disable-dev-shm-usage',
    '--disable-gpu',
    '--window-size=1280,900',
    '--allow-insecure-localhost',
  ],
});

try {
  const page = await browser.newPage();
  await page.setViewport(VIEWPORT);

  page.on('console', (message) => {
    if (message.type() === 'error') consoleErrors.push(message.text());
  });
  page.on('pageerror', (error) => pageErrors.push(error && error.message ? error.message : String(error)));
  page.on('requestfailed', (request) => {
    failedRequests.push(`${request.method()} ${request.url()} :: ${request.failure()?.errorText || 'unknown'}`);
  });
  page.on('response', (response) => {
    if (response.status() >= 400) badResponses.push(`${response.status()} ${response.url()}`);
  });

  const started = Date.now();
  await page.goto(URL_TO_OPEN, { waitUntil: 'networkidle2', timeout: 60000 });
  // The backend seeds a database on first boot; give it room beyond network idle.
  await new Promise((resolve) => setTimeout(resolve, 15000));
  const bootMs = Date.now() - started;

  const state = await page.evaluate(() => {
    const root = document.getElementById('root');
    const bodyText = (document.body && document.body.innerText) || '';
    return {
      title: document.title,
      rootChildren: root ? root.children.length : -1,
      bodyTextLength: bodyText.length,
      bodyExcerpt: bodyText.replace(/\s+/g, ' ').slice(0, 400),
      sqlite: window.__CHERRY_SQLITE__ || 'unset',
      crossOriginIsolated: window.crossOriginIsolated,
      sharedArrayBuffer: typeof SharedArrayBuffer !== 'undefined',
      hasWorker: typeof Worker !== 'undefined',
      hardwareConcurrency: navigator.hardwareConcurrency,
      scripts: Array.from(document.scripts).map((script) => script.src).filter(Boolean),
    };
  });

  const resources = await page.evaluate(() =>
    performance
      .getEntriesByType('resource')
      .map((entry) => entry.name)
      .filter((name) => name.endsWith('.js') || name.endsWith('.wasm')),
  );

  const workers = page.workers();
  const workerProbes = [];
  for (const worker of workers) {
    const href = worker.url();
    try {
      const probe = await worker.evaluate(() => ({
        href: typeof location !== 'undefined' ? location.href : '',
        hasOnmessage: typeof self !== 'undefined' && self.onmessage !== null,
        hasPostMessage: typeof self !== 'undefined' && typeof self.postMessage === 'function',
        crossOriginIsolated: typeof self !== 'undefined' ? self.crossOriginIsolated : undefined,
      }));
      workerProbes.push(`- ${href}\n  - probe: ${JSON.stringify(probe)}`);
    } catch (error) {
      workerProbes.push(`- ${href}\n  - probe failed: ${summarise(error.message)}`);
    }
  }

  // Map "Requiring unknown module \"<id>\"" back to a file by scanning chunks for
  // Metro's `__d(<id>, ...)` registration.
  const unknownIds = [];
  for (const message of [...consoleErrors, ...pageErrors]) {
    const match = message.match(/Requiring unknown module "(\d+)"/);
    if (match && !unknownIds.includes(match[1])) unknownIds.push(match[1]);
  }

  const chunkSources = [...new Set([...state.scripts, ...resources])];
  const mappings = [];
  for (const id of unknownIds) {
    for (const source of chunkSources) {
      if (source.startsWith('blob:') || source.startsWith('data:')) continue;
      try {
        const text = await page.evaluate(async (url) => {
          const response = await fetch(url);
          if (!response.ok) return '';
          return response.text();
        }, source);
        const index = text.indexOf(`__d(${id},`);
        if (index === -1) continue;
        mappings.push(`- id ${id} in ${path.basename(new URL(source).pathname)} -> ${summarise(text.slice(index, index + 400), 220)}`);
      } catch {
        /* ignore */
      }
    }
  }

  const fatalSignals = ["couldn't start", 'StartupFailureScreen', 'failed to initialize (fail-fast)', 'Sync operation timeout', 'Requiring unknown module'];
  const fatal = fatalSignals.filter((needle) => state.bodyExcerpt.toLowerCase().includes(needle.toLowerCase()));
  const failFast = [...consoleErrors, ...pageErrors].filter((line) => /fail-fast|failed to initialize/i.test(line));

  const verdict = [];
  if (fatal.length) verdict.push(`FAIL: startup failure markers -> ${fatal.join(', ')}`);
  if (state.rootChildren <= 0) verdict.push('FAIL: #root has no children');
  if (state.bodyTextLength < 20) verdict.push('FAIL: body text too short');
  if (state.sqlite !== 'ready') verdict.push(`FAIL: sqlite backend state = ${state.sqlite}`);
  if (pageErrors.length) verdict.push(`FAIL: ${pageErrors.length} uncaught page error(s)`);
  if (failFast.length) verdict.push(`FAIL: service init failure (${failFast.length})`);

  push('# Runtime smoke report');
  push();
  push(`- url: ${URL_TO_OPEN}`);
  push(`- boot wait: ${bootMs} ms`);
  push(`- title: ${state.title}`);
  push(`- verdict: ${verdict.length ? verdict.join(' | ') : 'PASS (no startup failure markers)'}`);
  push(`- #root children: ${state.rootChildren} | body text length: ${state.bodyTextLength}`);
  push(`- sqlite backend: ${state.sqlite}`);
  push(`- crossOriginIsolated: ${state.crossOriginIsolated} | SAB: ${state.sharedArrayBuffer} | Worker: ${state.hasWorker}`);
  push(`- hardwareConcurrency: ${state.hardwareConcurrency}`);
  push();
  push('## body excerpt');
  push('```');
  push(state.bodyExcerpt || '(empty)');
  push('```');
  push();
  push(`## page errors (${pageErrors.length})`);
  for (const line of pageErrors.slice(0, 12)) push(`- ${summarise(line)}`);
  push();
  push(`## console errors (${consoleErrors.length})`);
  for (const line of consoleErrors.slice(0, 20)) push(`- ${summarise(line)}`);
  push();
  push(`## unknown module analysis (${unknownIds.length})`);
  for (const line of mappings.slice(0, 10)) push(line);
  if (!mappings.length) push('- no mapping recovered');
  push();
  push(`## bad responses (${badResponses.length})`);
  for (const line of badResponses.slice(0, 20)) push(`- ${line}`);
  push();
  push(`## failed requests (${failedRequests.length})`);
  for (const line of failedRequests.slice(0, 20)) push(`- ${line}`);
  push();
  push(`## workers (${workers.length})`);
  for (const line of workerProbes) push(line);
  if (!workers.length) push('- none');
  push();
  push('## scripts');
  for (const line of chunkSources.slice(0, 12)) push(`- ${line}`);
} catch (error) {
  push('# Runtime smoke report');
  push();
  push(`- fatal: ${summarise(error && error.message ? error.message : error, 800)}`);
} finally {
  await browser.close().catch(() => {});
  fs.writeFileSync(REPORT_PATH, `${report.join('\n')}\n`);
  console.log(report.join('\n'));
}
