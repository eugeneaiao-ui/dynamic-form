import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { execFileSync } from 'node:child_process';
import { mkdirSync, readFileSync, readdirSync, writeFileSync } from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { build, preview } from 'vite';
import { chromium } from 'playwright';
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
process.chdir(root);
const screenshotsOnly = process.argv.includes('--screenshots-only');
const smoke = process.argv.includes('--smoke') || screenshotsOnly;
const samples = smoke ? 1 : Number(process.env.BENCH_SAMPLES ?? 7);
assert(Number.isInteger(samples) && samples >= 1 && samples <= 50);
const warmups = smoke ? 0 : 1;
const channel = process.env.BENCH_BROWSER ?? 'chrome';
const counts = smoke ? [100] : [100, 300, 1000];
const cases = counts.flatMap((count) => [false, true].map((progressive) => ({ count, progressive, kind: 'input' })));
cases.push({ count: 100, progressive: false, kind: 'linked' });
if (screenshotsOnly) cases.length = 0;
function files(directory) {
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const name = path.join(directory, entry.name);
    return entry.isDirectory() ? files(name) : /\.(tsx?|json)$/.test(name) ? [name] : [];
  });
}
const hash = createHash('sha256');
for (const name of [
  ...files('src'),
  ...files('examples'),
  'package.json',
  'package-lock.json',
  'scripts/benchmark.mjs',
  'vite.demo.config.ts',
].sort()) {
  hash.update(name.replaceAll('\\', '/'));
  hash.update(readFileSync(name));
}
const sourceHash = hash.digest('hex');
const manifest = JSON.parse(readFileSync('package.json', 'utf8'));
const dependencyVersion = (name) =>
  JSON.parse(readFileSync(path.join('node_modules', name, 'package.json'), 'utf8')).version;
const report = {
  generatedAt: new Date().toISOString(),
  environment: {
    os: os.platform() + ' ' + os.release(),
    architecture: os.arch(),
    cpu: os.cpus()[0]?.model,
    logicalCpus: os.cpus().length,
    memoryGiB: Math.round(os.totalmem() / 1024 ** 3),
    node: process.version,
    react: dependencyVersion('react'),
    antd: dependencyVersion('antd'),
    playwright: dependencyVersion('playwright'),
    libraryVersion: manifest.version,
    browser: '',
    channel,
    headless: true,
    viewport: { width: 1365, height: 900 },
    cpuThrottling: 'none',
    network: 'local Vite production preview; no data requests',
    build: 'production; benchmark entry without React.StrictMode',
  },
  source: {
    parentCommit: execFileSync('git', ['rev-parse', 'HEAD'], { encoding: 'utf8' }).trim(),
    dirty: execFileSync('git', ['status', '--porcelain'], { encoding: 'utf8' }).trim().length > 0,
    sha256: sourceHash,
  },
  methodology: {
    samples,
    warmups,
    rowsPerBatch: 3,
    columns: 3,
    fieldsPerBatch: 9,
    percentile: 'nearest-rank',
    scope:
      'Warm-page fresh form mounts; fixture creation and bundle transfer excluded. Includes config generation, real AntD fields, DOM/layout and effect work before two-frame settling. Not FCP, LCP or INP.',
  },
  complete: false,
  cases: [],
};
const output = screenshotsOnly
  ? '.artifacts/screenshots-run.json'
  : smoke
    ? '.artifacts/benchmark-smoke.json'
    : 'docs/benchmarks/latest.json';
mkdirSync(path.dirname(output), { recursive: true });
const save = () => writeFileSync(output, JSON.stringify(report, null, 2) + '\n');
function summary(rows) {
  return Object.fromEntries(
    Object.keys(rows[0]).map((metric) => {
      const values = rows.map((row) => row[metric]).sort((a, b) => a - b);
      const quantile = (p) => values[Math.max(0, Math.ceil(p * values.length) - 1)];
      return [metric, { median: quantile(0.5), p95: quantile(0.95), min: values[0], max: values.at(-1) }];
    }),
  );
}
await build({ configFile: 'vite.demo.config.ts', build: { outDir: '.artifacts/benchmark-dist' }, logLevel: 'warn' });
const server = await preview({
  configFile: 'vite.demo.config.ts',
  build: { outDir: '.artifacts/benchmark-dist' },
  preview: { host: '127.0.0.1', port: 0 },
});
const base = server.resolvedUrls.local[0];
let browser;
try {
  browser = await chromium.launch({ headless: true, ...(channel === 'chromium' ? {} : { channel }) });
  report.environment.browser = browser.version();
  for (const testCase of cases) {
    const page = await browser.newPage({
      viewport: report.environment.viewport,
      deviceScaleFactor: 1,
      reducedMotion: 'reduce',
    });
    const errors = [];
    page.on('pageerror', (error) => errors.push(error.message));
    await page.goto(new URL('benchmark.html', base).href);
    await page.waitForFunction(() => window.benchmarkReady);
    const rows = [];
    for (let index = -warmups; index < samples; index++) {
      const mounted = await page.evaluate((options) => window.runFormBenchmark(options), testCase);
      await page.evaluate((value) => window.startEditMeasurement(value), testCase.kind === 'linked' ? '3' : 'Updated');
      await page.locator('#benchmark_field_0').fill(testCase.kind === 'linked' ? '3' : 'Updated');
      const editSettledMs = await page.evaluate(() => window.finishEditMeasurement());
      const validationMs = await page.evaluate(() => window.validateBenchmark());
      assert.equal(mounted.mountedFields, testCase.count);
      assert.equal(mounted.registeredFields, testCase.count);
      assert.deepEqual(errors, []);
      if (index >= 0) rows.push({ ...mounted, editSettledMs, validationMs });
    }
    const result = { ...testCase, samples: rows, summary: summary(rows) };
    report.cases.push(result);
    save();
    console.log(
      JSON.stringify({
        count: testCase.count,
        kind: testCase.kind,
        progressive: testCase.progressive,
        firstCommitMedian: result.summary.firstCommitMs.median,
        settledMedian: result.summary.settledMs.median,
      }),
    );
    await page.close();
  }
  report.complete = true;
  save();
  if (!smoke) {
    const format = (value) => value.toFixed(1);
    const cell = (item, metric) => format(item.summary[metric].median) + ' / ' + format(item.summary[metric].p95);
    const lines = [
      '| 字段数 / 场景 | 挂载方式 | 首批 DOM p50 / p95 | 全部就绪 p50 / p95 | 编辑稳定 p50 / p95 | 校验 p50 / p95 |',
      '| --- | --- | --- | --- | --- | --- |',
      ...report.cases.map(
        (item) =>
          '| ' +
          item.count +
          (item.kind === 'linked' ? '（99 项计算联动）' : '（Input）') +
          ' | ' +
          (item.progressive ? '分批：每批 9 项' : '完整') +
          ' | ' +
          cell(item, 'firstCommitMs') +
          ' | ' +
          cell(item, 'settledMs') +
          ' | ' +
          cell(item, 'editSettledMs') +
          ' | ' +
          cell(item, 'validationMs') +
          ' |',
      ),
      '',
      '**单位：ms。每格为 p50 / p95。**',
      '',
      '环境：' +
        report.environment.cpu +
        '；' +
        report.environment.logicalCpus +
        ' 个逻辑处理器；' +
        report.environment.memoryGiB +
        ' GiB RAM；' +
        report.environment.os +
        ' ' +
        report.environment.architecture +
        '；Chrome ' +
        report.environment.browser +
        '（headless）；React ' +
        report.environment.react +
        ' / AntD ' +
        report.environment.antd +
        '。',
      '',
      '时间：' +
        report.generatedAt +
        '；每场景预热 ' +
        warmups +
        ' 次，正式 ' +
        samples +
        ' 次；未限速。源码 SHA-256：' +
        sourceHash +
        '。',
    ];
    const file = 'docs/PERFORMANCE.md';
    const text = readFileSync(file, 'utf8').replace(
      /<!-- benchmark-results -->[\s\S]*?<!-- \/benchmark-results -->/,
      '<!-- benchmark-results -->\n\n' + lines.join('\n') + '\n\n<!-- /benchmark-results -->',
    );
    writeFileSync(file, text);
  }
  mkdirSync('docs/images', { recursive: true });
  const page = await browser.newPage({
    viewport: { width: 1440, height: 1200 },
    deviceScaleFactor: 1,
    reducedMotion: 'reduce',
  });
  for (const name of ['basic', 'long', 'linked', 'ai']) {
    await page.goto(new URL('?example=' + name, base).href);
    if (name === 'long') await page.getByText('300 / 300 fields mounted', { exact: true }).waitFor();
    if (name === 'linked') {
      await page.getByRole('spinbutton', { name: 'Quantity', exact: true }).fill('20');
      await page.getByRole('spinbutton', { name: 'Unit price', exact: true }).fill('300');
      await page.waitForFunction(() => Number(document.querySelector('#linked-example_total')?.value) === 6480);
      await page.getByRole('button', { name: 'Validate & submit linked form', exact: true }).click();
      await page.getByText('Please justify totals above 5,000.', { exact: true }).waitFor();
      await page.screenshot({ path: 'docs/images/linked-validation.png', fullPage: true, animations: 'disabled' });
      await page.getByRole('combobox', { name: 'Country', exact: true }).press('ArrowDown');
      await page.getByText('Philippines', { exact: true }).last().click();
      await page.getByRole('status').filter({ hasText: 'Latest options loaded for PH.' }).waitFor();
      await page.getByRole('combobox', { name: 'City · async options', exact: true }).press('ArrowDown');
      await page.getByText('Manila', { exact: true }).last().click();
      await page
        .getByRole('textbox', { name: 'Justification · required when total > 5,000', exact: true })
        .fill('Additional capacity for the regional rollout.');
      await page.getByRole('button', { name: 'Validate & submit linked form', exact: true }).click();
      await page.getByLabel('Linked form submission').waitFor();
    }
    if (name === 'ai') await page.getByRole('button', { name: 'Submit generated form', exact: true }).waitFor();
    await page.screenshot({ path: 'docs/images/' + name + '.png', fullPage: true, animations: 'disabled' });
    console.log('Screenshot: ' + name);
    if (name === 'basic') {
      await page.getByText('preview', { exact: true }).click();
      await page.screenshot({ path: 'docs/images/preview.png', fullPage: true, animations: 'disabled' });
      await page.getByText('snapshot', { exact: true }).click();
      await page.getByLabel('Previous value').first().waitFor();
      await page.screenshot({ path: 'docs/images/snapshot.png', fullPage: true, animations: 'disabled' });
    }
  }
  await page.close();
} finally {
  await browser?.close();
  await new Promise((resolve) => server.httpServer.close(resolve));
}
