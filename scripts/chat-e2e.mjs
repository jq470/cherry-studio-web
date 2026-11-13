#!/usr/bin/env node
/**
 * Chat end-to-end test: first-use onboarding -> provider key -> model -> send.
 *
 * Runs against scripts/e2e-server.mjs with scripts/fake-openai.mjs behind it.
 * Writes CHAT-E2E.md and exits 0 unless the reply never arrives (the report is
 * the product; the workflow commits it either way).
 */
import fs from 'node:fs';
import puppeteer from 'puppeteer-core';

const URL_TO_OPEN = process.env.E2E_URL || 'http://127.0.0.1:8099/?e2e=1';
const ORIGIN = new URL(URL_TO_OPEN).origin;
const REPORT = process.env.E2E_REPORT || 'CHAT-E2E.md';
const CHROME = process.env.CHROME_PATH || '/usr/bin/google-chrome';

const steps = [];
const log = (name, ok, detail) => {
  steps.push({ name, ok, detail });
  console.log(`[e2e] ${ok ? 'ok' : 'FAIL'} ${name}${detail ? ` — ${detail}` : ''}`);
};
const summary = (text, limit = 240) => String(text).replace(/\s+/g, ' ').trim().slice(0, limit);

const browser = await puppeteer.launch({
  executablePath: CHROME,
  headless: true,
  args: ['--no-sandbox', '--disable-dev-shm-usage', '--disable-gpu', '--window-size=1280,900'],
});

let replySeen = false;
let pageText = '';
let pickerText = '';
let failureShot = null;
const consoleErrors = [];
const apiRequests = [];

try {
  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 900 });
  page.on('console', (message) => {
    if (message.type() === 'error') {
      console.log(`[console.error] ${summary(message.text(), 200)}`);
      consoleErrors.push(summary(message.text(), 500));
    }
  });
  page.on('request', (request) => {
    if (request.url().includes('api.deepseek.com')) apiRequests.push(request.url());
  });
  page.on('pageerror', (error) => {
    consoleErrors.push(`pageerror: ${summary(error && error.stack ? error.stack : error, 500)}`);
  });

  const text = () => page.evaluate(() => (document.body && document.body.innerText) || '');
  const waitFor = async (re, ms = 30000) => {
    const deadline = Date.now() + ms;
    while (Date.now() < deadline) {
      const value = await text();
      if (re.test(value)) return value;
      await new Promise((r) => setTimeout(r, 1000));
    }
    return null;
  };
  const clickText = (labels) =>
    page.evaluate((wanted) => {
      const nodes = Array.from(document.querySelectorAll('[role="button"], button, [role="menuitem"]'));
      const target = nodes.find((node) => wanted.includes((node.innerText || '').trim()));
      if (!target) return false;
      target.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true, view: window }));
      return true;
    }, labels);
  const clickTestId = (id) =>
    page.evaluate((testId) => {
      const node = document.querySelector(`[data-testid="${testId}"]`);
      if (!node) return false;
      node.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true, view: window }));
      return true;
    }, id);

  await page.goto(URL_TO_OPEN, { waitUntil: 'networkidle2', timeout: 60000 });
  const boot = await waitFor(/(Welcome to Cherry|欢迎使用 Cherry)/i, 45000);
  log('boot', Boolean(boot), summary(boot || '(no onboarding)'));

  if (boot) {
    const accepted = await clickText(['Accept and continue', '同意并继续']);
    log('privacy accept', accepted);
    await new Promise((r) => setTimeout(r, 2000));
    const connect = await clickText(['Connect a provider', '连接服务商']);
    log('connect provider', connect);
    await new Promise((r) => setTimeout(r, 3000));
  }

  // First-use provider catalog -> deepseek config (setupIntent=chat).
  const catalog = await waitFor(/(Choose a provider|选择服务商)/, 30000);
  log('provider catalog', Boolean(catalog), summary(catalog || '(none)'));
  const choseProvider =
    (await clickTestId('provider-catalog-entry-deepseek')) ||
    (await page.evaluate(() => {
      const node = Array.from(document.querySelectorAll('*')).find(
        (item) => (item.innerText || '').trim() === 'DeepSeek',
      );
      if (!node) return false;
      node.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true, view: window }));
      return true;
    }));
  log('provider chosen', choseProvider);
  await new Promise((r) => setTimeout(r, 3000));

  const provider = await waitFor(/(配置 deepseek|Configure deepseek|API)/i, 20000);
  log('provider page', Boolean(provider), summary(provider || '(blank)'));

  const keyInput = await page.$('input[type="password"]');
  if (keyInput) {
    await keyInput.click();
    await keyInput.type('sk-fake-e2e');
    log('api key typed', true);
  } else {
    log('api key typed', false, 'no password input');
  }

  const added = await clickText(['Add', '添加']);
  log('key added', added);
  await new Promise((r) => setTimeout(r, 1500));

  const continued = await clickText(['Continue', '继续']);
  log('provider continue', continued);
  await new Promise((r) => setTimeout(r, 5000));

  // Onboarding model selection; the fake provider's /v1/models result lands first.
  const modelScreen = await waitFor(/(选择聊天模型|Choose a chat model)/, 30000);
  log('model screen', Boolean(modelScreen), summary(modelScreen || '(none)'));
  pickerText = await page.evaluate(() => {
    const node = document.querySelector('[data-testid="onboarding-model"]');
    return node ? node.innerText : '';
  });
  const picked = await page.evaluate(() => {
    const node = Array.from(document.querySelectorAll('*')).find(
      (item) => (item.innerText || '').trim() === 'fake-model',
    );
    if (!node) return false;
    node.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true, view: window }));
    return true;
  });
  log('model picked', picked, summary(pickerText, 300));
  await new Promise((r) => setTimeout(r, 1000));
  const started =
    (await clickTestId('onboarding-model-start')) ||
    (await clickText(['Start chatting', '开始聊天']));
  log('onboarding start', started);
  await new Promise((r) => setTimeout(r, 4000));

  // Chat composer should now be admitted by FirstUseGate.
  const composerReady = await page
    .waitForSelector('[data-testid="chat-composer"]', { timeout: 30000 })
    .then(() => true)
    .catch(() => false);
  log('home composer', composerReady, page.url());

  // Type into the composer and send.
  const inputHandle = await page.evaluateHandle(() => {
    const root = document.querySelector('[data-testid="chat-composer"]') || document.body;
    return (
      root.querySelector('textarea') ||
      root.querySelector('[contenteditable="true"]') ||
      root.querySelector('input[type="text"]') || null
    );
  });
  const input = inputHandle.asElement();
  if (input) {
    await input.click();
    await input.type('ping');
    const state = await page.evaluate(() => {
      const field = document.querySelector('[data-testid="chat-composer"] textarea');
      const btn = document.querySelector('[data-testid="chat-composer-send"]');
      return {
        value: field ? field.value : null,
        disabled: btn ? btn.getAttribute('aria-disabled') : 'missing',
      };
    });
    log('message typed', true, JSON.stringify(state));
  } else {
    log('message typed', false, 'no composer input');
  }

  if (input) {
    await input.press('Enter');
    await new Promise((r) => setTimeout(r, 1000));
  }
  const sent = await page.evaluate(() => {
    const btn = document.querySelector('[data-testid="chat-composer-send"]');
    if (!btn) return false;
    btn.click();
    return true;
  });
  log('send clicked', sent, `api requests: ${apiRequests.length}`);
  await new Promise((r) => setTimeout(r, 2000));
  log(
    'after send',
    apiRequests.length > 0,
    `${apiRequests.slice(-2).join(' | ')} :: ${summary(await text(), 300)}`,
  );

  const reply = await waitFor(/pong/i, 40000);
  replySeen = Boolean(reply);
  log('reply received', replySeen, summary(reply || '(no reply)'));
  pageText = await text();

  if (!replySeen) {
    failureShot = 'CHAT-E2E-FAILURE.png';
    await page.screenshot({ path: failureShot, fullPage: false }).catch(() => {});
  }
} catch (error) {
  log('exception', false, summary(error && error.message ? error.message : error));
} finally {
  await browser.close().catch(() => {});
}

const verdict = replySeen ? 'PASS' : 'FAIL';
const report = [
  '# Chat end-to-end report',
  '',
  `- url: ${URL_TO_OPEN}`,
  `- verdict: ${verdict}`,
  `- reply seen: ${replySeen}`,
  failureShot ? `- failure screenshot: ${failureShot}` : '',
  '',
  '## steps',
  '```',
  ...steps.map((s) => `${s.ok ? 'ok  ' : 'FAIL'} ${s.name}${s.detail ? ` — ${s.detail}` : ''}`),
  '```',
  '',
  '## console errors',
  '```',
  ...consoleErrors.slice(-10),
  '```',
  '',
  '## model screen text',
  '```',
  summary(pickerText, 600),
  '```',
  '',
  '## page text (last)',
  '```',
  summary(pageText, 1200),
  '```',
].join('\n');

fs.writeFileSync(REPORT, `${report}\n`);
console.log(report);
process.exit(replySeen ? 0 : 1);
