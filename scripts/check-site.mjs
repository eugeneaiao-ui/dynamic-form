import assert from 'node:assert/strict';
import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs';
import path from 'node:path';
import { JSDOM } from 'jsdom';
const root = path.resolve('site-dist');
const site = new URL(JSON.parse(readFileSync('site/config.json', 'utf8')).url);
function files(folder) {
  return readdirSync(folder, { withFileTypes: true }).flatMap((entry) =>
    entry.isDirectory() ? files(path.join(folder, entry.name)) : [path.join(folder, entry.name)],
  );
}
const htmlFiles = files(root).filter((file) => file.endsWith('.html'));
let links = 0;
const doms = new Map();
for (const file of htmlFiles) doms.set(file, new JSDOM(readFileSync(file, 'utf8')));
for (const [file, dom] of doms) {
  const current = new URL(path.relative(root, file).replaceAll('\\', '/'), site);
  for (const element of dom.window.document.querySelectorAll('[href],[src]')) {
    const raw = element.getAttribute('href') ?? element.getAttribute('src');
    if (!raw || /^(data:|mailto:|tel:)/.test(raw)) continue;
    const url = new URL(raw, current);
    if (url.origin !== site.origin) continue;
    assert(url.pathname.startsWith(site.pathname), 'Link escaped project base: ' + raw);
    let target = path.resolve(root, decodeURIComponent(url.pathname.slice(site.pathname.length)));
    assert(target === root || target.startsWith(root + path.sep));
    assert(existsSync(target), path.relative(root, file) + ': missing target ' + raw);
    if (statSync(target).isDirectory()) target = path.join(target, 'index.html');
    assert(existsSync(target), 'Missing index: ' + raw);
    if (url.hash && target.endsWith('.html') && !target.includes(path.sep + 'playground' + path.sep)) {
      assert(
        doms.get(target)?.window.document.getElementById(decodeURIComponent(url.hash.slice(1))),
        file + ': missing anchor ' + raw,
      );
    }
    links++;
  }
  if (!file.includes(path.sep + 'playground' + path.sep)) {
    assert(dom.window.document.querySelector('link[rel="canonical"]')?.href.startsWith(site.href));
    assert(dom.window.document.querySelector('meta[name="description"]')?.content);
    assert.equal(
      JSON.parse(dom.window.document.querySelector('script[type="application/ld+json"]').textContent)['@type'],
      'SoftwareSourceCode',
    );
  }
}
for (const file of [
  'sitemap.xml',
  'robots.txt',
  'llms.txt',
  '.nojekyll',
  'search-index.json',
  'schemas/form-definition.schema.json',
])
  assert(existsSync(path.join(root, file)), file);
const index = JSON.parse(readFileSync(path.join(root, 'search-index.json'), 'utf8'));
assert(index.some((page) => page.text.includes('复杂联动')));
assert(readFileSync(path.join(root, 'llms.txt'), 'utf8').includes('Package name: forminojs'));
console.log(
  'PASS ' +
    htmlFiles.length +
    ' HTML pages, ' +
    links +
    ' local links/assets/anchors, search index, canonical metadata, sitemap, robots and llms.txt.',
);
