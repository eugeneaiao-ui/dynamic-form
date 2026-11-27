import assert from 'node:assert/strict';
import { cpSync, existsSync, mkdirSync, readFileSync, readdirSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { Marked } from 'marked';
import { build } from 'vite';
const config = JSON.parse(readFileSync('site/config.json', 'utf8'));
const manifest = JSON.parse(readFileSync('package.json', 'utf8'));
const origin = new URL(config.url),
  base = origin.pathname;
assert(base.startsWith('/') && base.endsWith('/'));
const output = path.resolve('site-dist');
mkdirSync(output, { recursive: true });
const documents = [
  'README.md',
  'README.en.md',
  'CONTRIBUTING.md',
  'CHANGELOG.md',
  'SECURITY.md',
  'SUPPORT.md',
  ...readdirSync('docs')
    .filter((name) => name.endsWith('.md'))
    .map((name) => 'docs/' + name),
].filter(existsSync);
const routes = new Map(
  documents.map((file) => [
    file,
    file === 'README.md'
      ? 'index.html'
      : file === 'README.en.md'
        ? 'en/index.html'
        : 'docs/' + path.basename(file, '.md').toLowerCase().replaceAll('_', '-') + '.html',
  ]),
);
const escape = (value) =>
  String(value).replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;');
const href = (route) => base + route;
const nav = [
  ['快速开始', 'docs/GETTING_STARTED.md'],
  ['图文示例', 'docs/EXAMPLES.md'],
  ['配置手册', 'docs/CONFIGURATION.md'],
  ['常用场景', 'docs/RECIPES.md'],
  ['API', 'docs/API.md'],
  ['AI / 低代码', 'docs/AI_INTEGRATION.md'],
  ['性能与测量', 'docs/PERFORMANCE.md'],
  ['迁移指南', 'docs/MIGRATION.md'],
  ['常见问题', 'docs/FAQ.md'],
  ['版本与发布', 'docs/RELEASING.md'],
  ['贡献指南', 'CONTRIBUTING.md'],
  ['安全反馈', 'SECURITY.md'],
];
const assets = [
  'LICENSE',
  'docs/images',
  'docs/benchmarks/latest.json',
  'schemas/form-definition.schema.json',
  'examples/ai/service-request.json',
];
for (const asset of assets) {
  mkdirSync(path.dirname(path.join(output, asset)), { recursive: true });
  cpSync(asset, path.join(output, asset), { recursive: true });
}
function localLink(link, file) {
  if (link.startsWith('#') || /^(mailto:|tel:)/.test(link)) return link;
  let target,
    fragment = '';
  const external = /^https?:/.test(link);
  if (external) {
    const match = link.match(
      /^https:\/\/(?:github\.com\/eugeneaiao-ui\/formino\/blob|raw\.githubusercontent\.com\/eugeneaiao-ui\/formino)\/(?:main|formino-v0\.1\.0)\/([^#?]+)(#[^?]*)?$/,
    );
    if (!match) return link;
    target = match[1];
    fragment = match[2] ?? '';
  } else {
    const url = new URL(link, 'https://source.local/' + file);
    target = decodeURIComponent(url.pathname.slice(1));
    fragment = url.hash;
  }
  if (routes.has(target)) return href(routes.get(target)) + fragment;
  if (assets.some((asset) => target === asset || target.startsWith(asset + '/'))) return href(target) + fragment;
  if (existsSync(target)) return config.repository + '/blob/main/' + target + fragment;
  throw new Error(file + ': unresolved local link ' + link);
}
const search = [];
for (const file of documents) {
  const markdown = readFileSync(file, 'utf8');
  const title = markdown.match(/^# (.+)$/m)?.[1] ?? path.basename(file);
  const route = routes.get(file);
  const ids = new Map();
  const renderer = new Marked({
    gfm: true,
    renderer: {
      image(token) {
        if (!token.href.startsWith('https://img.shields.io/')) return false;
        const label = token.text.includes('MIT')
          ? 'MIT'
          : token.text.includes('release')
            ? 'Release ' + manifest.version
            : 'npm ' + manifest.version;
        return '<span class="badge">' + escape(label) + '</span>';
      },
      heading({ tokens, depth, text }) {
        const id = text
          .toLowerCase()
          .replace(/[^\p{L}\p{M}\p{N}_\- ]/gu, '')
          .replaceAll(' ', '-');
        const count = ids.get(id) ?? 0;
        ids.set(id, count + 1);
        const anchor = count ? id + '-' + count : id;
        return '<h' + depth + ' id="' + escape(anchor) + '">' + this.parser.parseInline(tokens) + '</h' + depth + '>\n';
      },
    },
    walkTokens(token) {
      if (token.type === 'link' || token.type === 'image') token.href = localLink(token.href, file);
    },
  });
  const content = renderer.parse(markdown);
  const canonical = new URL(route === 'index.html' ? '' : route, origin).href;
  const english = file === 'README.en.md';
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'SoftwareSourceCode',
    name: 'Formino',
    description: config.description,
    url: config.url,
    codeRepository: config.repository,
    programmingLanguage: 'TypeScript',
    softwareVersion: manifest.version,
    license: config.repository + '/blob/main/LICENSE',
    downloadUrl: config.package,
    keywords: manifest.keywords.join(', '),
  };
  const hero =
    file === 'README.md'
      ? '<section class="start"><span class="version">MIT · ' +
        escape(manifest.name + ' ' + manifest.version) +
        '</span><h1>配置描述表单，<br>引擎负责渲染。</h1><p>用可复用的定义表达字段、布局与规则。配置可以由后端下发，也可以由 AI 按契约生成，再由共享引擎转成表单。</p><div class="actions"><a class="primary" href="' +
        href(routes.get('docs/GETTING_STARTED.md')) +
        '">开始接入 →</a><a href="' +
        href('playground/') +
        '">打开交互示例 ↗</a></div></section>'
      : '';
  const html =
    '<!doctype html><html lang="' +
    (english ? 'en' : 'zh-CN') +
    '"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>' +
    escape(title) +
    ' | Formino</title><meta name="description" content="' +
    escape(config.description) +
    '"><link rel="canonical" href="' +
    escape(canonical) +
    '"><meta name="robots" content="index,follow"><meta property="og:type" content="website"><meta property="og:title" content="' +
    escape(title) +
    '"><meta property="og:description" content="' +
    escape(config.description) +
    '"><meta property="og:url" content="' +
    escape(canonical) +
    '"><meta property="og:image" content="' +
    new URL('docs/images/long.png', origin).href +
    '"><meta name="twitter:card" content="summary_large_image"><link rel="stylesheet" href="' +
    href('site.css') +
    '"><script type="application/ld+json">' +
    JSON.stringify(schema).replaceAll('<', '\\u003c') +
    '</script><script src="' +
    href('site.js') +
    '" defer></script></head><body><a class="skip" href="#content">跳到正文</a><header class="top"><a class="brand" href="' +
    base +
    '"><span>F</span> Formino</a><nav aria-label="主导航"><a href="' +
    href('playground/') +
    '">Playground</a><a href="' +
    href('en/') +
    '">English</a><a href="' +
    config.package +
    '">npm ↗</a><a href="' +
    config.repository +
    '">GitHub ↗</a></nav></header><div class="layout"><aside><form role="search"><label for="docs-search">搜索文档</label><input id="docs-search" type="search" placeholder="联动、数据源、校验…" autocomplete="off" aria-controls="search-results"><p id="search-status" role="status" class="search-status"></p><div id="search-results" hidden></div></form><nav aria-label="文档目录">' +
    nav
      .filter(([, target]) => routes.has(target))
      .map(
        ([label, target]) =>
          '<a ' +
          (file === target ? 'aria-current="page" ' : '') +
          'href="' +
          href(routes.get(target)) +
          '">' +
          label +
          '</a>',
      )
      .join('') +
    '</nav><div class="install"><code>npm i forminojs</code><button type="button" id="copy-install" aria-label="复制安装命令">复制</button><span id="copy-status" role="status"></span></div><a class="discuss" href="' +
    config.repository +
    '/discussions">提问与交流 ↗</a></aside><main id="content">' +
    hero +
    '<article>' +
    content +
    '</article><footer><a href="' +
    config.repository +
    '/edit/main/' +
    file +
    '">改进这页文档</a><a href="' +
    config.repository +
    '/releases/latest">最新 Release</a><span>Formino ' +
    manifest.version +
    ' · MIT</span></footer></main></div></body></html>';
  mkdirSync(path.dirname(path.join(output, route)), { recursive: true });
  writeFileSync(path.join(output, route), html);
  mkdirSync(path.dirname(path.join(output, file)), { recursive: true });
  writeFileSync(path.join(output, file), markdown);
  search.push({
    title,
    href: href(route),
    text: markdown
      .replace(/https?:\/\/\S+/g, '')
      .replace(/[#*|]/g, '')
      .slice(0, 80000),
  });
}
writeFileSync(path.join(output, 'search-index.json'), JSON.stringify(search));
for (const name of ['site.css', 'site.js']) cpSync('site/' + name, path.join(output, name));
writeFileSync(path.join(output, '.nojekyll'), '');
writeFileSync(
  path.join(output, 'robots.txt'),
  'User-agent: *\nAllow: /\nSitemap: ' + new URL('sitemap.xml', origin).href + '\n',
);
writeFileSync(
  path.join(output, 'sitemap.xml'),
  '<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">' +
    ['', ...[...routes.values()].filter((route) => route !== 'index.html'), 'playground/']
      .map((route) => '<url><loc>' + escape(new URL(route, origin).href) + '</loc></url>')
      .join('') +
    '</urlset>',
);
const llms = readFileSync('llms.txt', 'utf8').replace(
  /https:\/\/raw\.githubusercontent\.com\/eugeneaiao-ui\/formino\/(?:main|formino-v0\.1\.0)\/([^\s)]+)/g,
  (_, target) => new URL(target, origin).href,
);
writeFileSync(
  path.join(output, 'llms.txt'),
  llms + '\nWebsite: ' + config.url + '\nPlayground: ' + new URL('playground/', origin).href + '\n',
);
await build({
  configFile: 'vite.demo.config.ts',
  base: href('playground/'),
  build: { outDir: 'site-dist/playground', emptyOutDir: true },
  logLevel: 'warn',
});
console.log('Built ' + documents.length + ' searchable static documents, SEO/AI files and the interactive playground.');
