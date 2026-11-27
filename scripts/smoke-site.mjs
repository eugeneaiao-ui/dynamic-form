import assert from 'node:assert/strict';
import { createServer } from 'node:http';
import { readFileSync, existsSync, mkdirSync, statSync } from 'node:fs';
import path from 'node:path';
import { chromium } from 'playwright';
const root = path.resolve('site-dist');
const prefix = new URL(JSON.parse(readFileSync('site/config.json', 'utf8')).url).pathname;
const types = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'application/javascript',
  '.css': 'text/css',
  '.json': 'application/json',
  '.png': 'image/png',
  '.txt': 'text/plain',
  '.xml': 'application/xml',
  '.md': 'text/plain',
};
const server = createServer((request, response) => {
  const name = decodeURIComponent(new URL(request.url, 'http://localhost').pathname);
  if (!name.startsWith(prefix)) {
    response.writeHead(404).end();
    return;
  }
  let target = path.resolve(root, name.slice(prefix.length));
  if ((target !== root && !target.startsWith(root + path.sep)) || !existsSync(target)) {
    response.writeHead(404).end();
    return;
  }
  if (statSync(target).isDirectory()) target = path.join(target, 'index.html');
  if (!existsSync(target)) {
    response.writeHead(404).end();
    return;
  }
  response.writeHead(200, { 'Content-Type': types[path.extname(target)] ?? 'application/octet-stream' });
  response.end(readFileSync(target));
});
await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
const origin = 'http://127.0.0.1:' + server.address().port + prefix;
const browser = await chromium.launch({ channel: 'chrome', headless: true });
mkdirSync('.artifacts', { recursive: true });
try {
  const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } });
  const errors = [];
  page.on('pageerror', (error) => errors.push(error.message));
  await page.goto(origin, { waitUntil: 'domcontentloaded' });
  await page.screenshot({ path: '.artifacts/site-desktop.png', fullPage: false });
  await page.getByRole('searchbox').fill('异步');
  await page.locator('#search-results a').first().waitFor();
  assert((await page.locator('#search-results a').count()) > 0);
  await page.getByRole('searchbox').press('Escape');
  assert(await page.locator('#search-results').isHidden());
  await page.getByRole('navigation', { name: '文档目录' }).getByRole('link', { name: '快速开始' }).click();
  assert((await page.title()).includes('快速开始'));
  await page.getByRole('link', { name: 'Playground', exact: true }).click();
  await page.getByRole('tab', { name: 'Long forms', exact: true }).click();
  await page.getByText(/fields mounted/).waitFor();
  const mounted = await page.getByText(/fields mounted/).textContent();
  assert(/\d+ \/ \d+ fields mounted/.test(mounted), mounted);
  await page.getByRole('tab', { name: 'Complex dependencies', exact: true }).click();
  await page.getByRole('tab', { name: 'AI / JSON', exact: true }).click();
  assert((await page.locator('textarea').count()) > 0);
  await page.screenshot({ path: '.artifacts/site-playground.png', fullPage: false });
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto(origin, { waitUntil: 'domcontentloaded' });
  assert(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth));
  await page.screenshot({ path: '.artifacts/site-mobile.png', fullPage: false });
  assert.deepEqual(errors, []);
  console.log(
    'PASS desktop/mobile layout, documentation navigation, full-text search, Escape, nested-path playground assets and long/linked/AI tabs.',
  );
} finally {
  await browser.close();
  await new Promise((resolve) => server.close(resolve));
}
