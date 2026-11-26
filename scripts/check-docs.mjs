import assert from 'node:assert/strict';
import { existsSync, readFileSync, readdirSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import ts from 'typescript';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const ignored = new Set(['node_modules', '.git', 'dist', 'demo-dist', 'coverage', '.artifacts']);
function markdownFiles(directory) {
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    if (ignored.has(entry.name)) return [];
    const fullPath = path.join(directory, entry.name);
    return entry.isDirectory() ? markdownFiles(fullPath) : entry.name.endsWith('.md') ? [fullPath] : [];
  });
}
function anchors(markdown) {
  const counts = new Map();
  return new Set(
    [...markdown.matchAll(/^#{1,6}\s+(.+)$/gm)].map((match) => {
      const base = match[1]
        .toLowerCase()
        .replace(/[^\p{L}\p{M}\p{N}_\- ]/gu, '')
        .replaceAll(' ', '-');
      const count = counts.get(base) ?? 0;
      counts.set(base, count + 1);
      return count === 0 ? base : base + '-' + count;
    }),
  );
}
function canonical(source) {
  return ts
    .createPrinter({ removeComments: true })
    .printFile(ts.createSourceFile('example.tsx', source, ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX));
}
let links = 0,
  examples = 0;
const files = markdownFiles(root);
for (const file of files) {
  const markdown = readFileSync(file, 'utf8');
  // Code fences can contain illustrative links; check rendered Markdown links only.
  const prose = markdown.replace(/^```[^\n]*\n[\s\S]*?^```\s*$/gm, '');
  for (const match of prose.matchAll(/\[[^\]]*\]\(([^)]+)\)/g)) {
    const href = match[1];
    if (/^(https?:|mailto:)/.test(href)) continue;
    const [relativePath, fragment] = href.split('#');
    const target = relativePath ? path.resolve(path.dirname(file), decodeURIComponent(relativePath)) : file;
    assert(existsSync(target), path.relative(root, file) + ': broken link ' + href);
    if (fragment && target.endsWith('.md')) {
      assert(anchors(readFileSync(target, 'utf8')).has(decodeURIComponent(fragment)), 'Missing heading: ' + href);
    }
    links++;
  }
  for (const match of markdown.matchAll(/<!-- example: ([^ ]+) -->\s*```tsx\n([\s\S]*?)\n```/g)) {
    const source = readFileSync(path.join(root, match[1]), 'utf8').replaceAll(
      "from '../../src'",
      "from '@eugeneaiao-ui/dynamic-form'",
    );
    assert.equal(canonical(match[2]), canonical(source), 'Quick-start snippet is out of sync with ' + match[1]);
    examples++;
  }
}
const manifest = JSON.parse(readFileSync(path.join(root, 'package.json'), 'utf8'));
const lock = JSON.parse(readFileSync(path.join(root, 'package-lock.json'), 'utf8'));
assert.equal(manifest.license, 'MIT');
assert.equal(lock.packages[''].license, manifest.license);
assert.equal(manifest.publishConfig.access, 'public');
assert(readFileSync(path.join(root, 'LICENSE'), 'utf8').startsWith('MIT License'));
assert(manifest.files.includes('LICENSE') && manifest.files.includes('README.en.md'));
assert(examples > 0, 'The guide must include a checked quick-start example.');
console.log(
  'PASS ' +
    files.length +
    ' Markdown files, ' +
    links +
    ' local links, ' +
    examples +
    ' synced example, license and package metadata.',
);
