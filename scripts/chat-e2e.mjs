#!/usr/bin/env node
/**
 * Chat end-to-end test: onboarding -> provider key -> model -> send message.
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

try {
  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 900 });
  page.on('console', (message) => {
    if (message.type() === 'error') console.log(`[console.error] ${summary(message.text(), 200)}`);
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

  await page.goto(URL_TO_OPEN, { waitUntil: 'networkidle2', timeout: 60000 });
  const boot = await waitFor(/(Welcome to Cherry|欢迎使用 Cherry)/i, 45000);
  log('boot', Boolean(boot), summary(boot || '(no onboarding)'));

  if (boot) {
    const accepted = await clickText(['Accept and continue', '同意并继续']);
    log('privacy accept', accepted);
    await new Promise((r) => setTimeout(r, 2000));
    const skipped = await clickText(['Set up later', '稍后设置']);
    log('skip setup', skipped);
    await new Promise((r) => setTimeout(r, 2000));
  }

  const home = await waitFor(/(Select model|选择模型)/, 30000);
  log('home reached', Boolean(home), summary(home || '(no home)'));

  // Provider: preset deepseek, fake key; endpoint stays api.deepseek.com and is
  // redirected to the fake server by the test proxy.
  await page.goto(`${ORIGIN}/settings/provider/new?providerId=deepseek&providerName=deepseek`, {
    waitUntil: 'networkidle2',
    timeout: 60000,
  });
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
  await new Promise((r) => setTimeout(r, 4000));

  // The provider wizard opens a model-sync sheet; enable everything it found.
  const syncPage = await waitFor(/(同步模型|Sync models)/, 20000);
  log('model sync page', Boolean(syncPage), summary(syncPage || '(none)'));
  if (syncPage) {
    const allSelected = await clickText(['全选', 'Select all']);
    log('models selected', allSelected);
    await new Promise((r) => setTimeout(r, 1000));
    const finished = await clickText(['完成配置', 'Finish setup', 'Done']);
    log('setup finished', finished);
    await new Promise((r) => setTimeout(r, 3000));
  }

  pageText = await text();
  log('provider saved', !/加载服务商配置失败/.test(pageText), summary(pageText, 200));

  // Back to chat and pick the fake model.
  await page.goto(`${ORIGIN}/home`, { waitUntil: 'networkidle2', timeout: 60000 });
  const composerReady = await page
    .waitForSelector('[data-testid="chat-composer"]', { timeout: 30000 })
    .then(() => true)
    .catch(() => false);
  log('home composer', composerReady, page.url());
  const openedPicker = await page.evaluate(() => {
    const btn = document.querySelector('[data-testid="composer-model-button"]');
    if (!btn) return false;
    btn.click();
    return true;
  });
  log('model picker opened', openedPicker);
  const pickerReady = await page
    .waitForSelector('[data-testid="model-picker"]', { timeout: 15000 })
    .then(() => true)
    .catch(() => false);
  log('model picker mounted', pickerReady);
  pickerText = pickerReady
    ? await page.evaluate(() => {
        const node = document.querySelector('[data-testid="model-picker"]');
        return node ? node.innerText : '';
      })
    : '';
  log('model picker text', Boolean(pickerText), summary(pickerText, 400));
  const picked = await page.evaluate(() => {
    const nodes = Array.from(document.querySelectorAll('*'));
    const target = nodes.find((node) => (node.innerText || '').trim() === 'fake-model');
    if (!target) return false;
    target.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true, view: window }));
    return true;
  });
  log('model picked', picked, summary(pickerText, 200));
  await new Promise((r) => setTimeout(r, 1500));

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
    log('message typed', true);
  } else {
    log('message typed', false, 'no composer input');
  }

  const sent = await page.evaluate(() => {
    const btn = document.querySelector('[data-testid="chat-composer-send"]');
    if (!btn) return false;
    btn.click();
    return true;
  });
  log('send clicked', sent);

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
  '## model picker text',
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
