import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { existsSync, mkdirSync, mkdtempSync, readdirSync, realpathSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const npm = process.env.npm_execpath;
assert(npm, 'Run this script with npm run test:package.');
const artifacts = path.join(root, '.artifacts');
mkdirSync(artifacts, { recursive: true });
function run(command, args, cwd) {
  const result = spawnSync(command, args, {
    cwd,
    encoding: 'utf8',
    timeout: 240_000,
    env: { ...process.env, NODE_ENV: 'production' },
  });
  if (result.error || result.status !== 0) {
    throw new Error(
      [command, ...args].join(' ') + '\n' + (result.error?.message ?? '') + '\n' + result.stdout + '\n' + result.stderr,
    );
  }
  return result.stdout;
}
const packed = JSON.parse(
  run(process.execPath, [npm, 'pack', '--ignore-scripts', '--json', '--pack-destination', artifacts], root),
)[0];
assert(packed.files.some(({ path: name }) => name === 'dist/core.d.cts'));
for (const name of [
  'LICENSE',
  'llms.txt',
  'schemas/form-definition.schema.json',
  'examples/ai/service-request.json',
  'examples/ai/parse-definition.ts',
  'README.en.md',
  'CONTRIBUTING.md',
  'docs/CONFIGURATION.md',
  'examples/quick-start/ProfileForm.tsx',
  'examples/configuration/recipes.tsx',
]) {
  assert(
    packed.files.some((file) => file.path === name),
    'Missing documentation artifact: ' + name,
  );
}
assert(!packed.files.some(({ path: name }) => /^(src|tests|node_modules)\//.test(name)));
const tarball = path.join(artifacts, packed.filename);
const temporaryRoot = realpathSync(tmpdir());
const directory = mkdtempSync(path.join(temporaryRoot, 'dynamic-form-smoke-'));
const variants = [
  { name: 'core-only' },
  { name: 'react16-antd4', react: '16.14.0', antd: '4.24.16', types: '16', typescript: '4.9.5' },
  { name: 'react18-antd5', react: '18.3.1', antd: '5.27.6', types: '18' },
  { name: 'react19-antd5', react: '19.1.1', antd: '5.27.6', types: '19' },
];
try {
  for (const variant of variants) {
    const cwd = path.join(directory, variant.name);
    mkdirSync(cwd);
    writeFileSync(path.join(cwd, 'package.json'), JSON.stringify({ private: true, type: 'module' }));
    const dependencies = [
      tarball,
      ...(variant.react
        ? [
            'react@' + variant.react,
            'react-dom@' + variant.react,
            'antd@' + variant.antd,
            '@types/react@' + variant.types,
            '@types/react-dom@' + variant.types,
            'typescript@' + (variant.typescript ?? '5.9.3'),
            ...(variant.antd.startsWith('4') ? ['moment@2.30.1'] : []),
          ]
        : []),
    ];
    run(
      process.execPath,
      [
        npm,
        'install',
        '--include=dev',
        '--ignore-scripts',
        '--no-audit',
        '--no-fund',
        '--fetch-retries=0',
        '--fetch-timeout=30000',
        '--registry=https://registry.npmjs.org',
        ...dependencies,
      ],
      cwd,
    );
    const coreScript = `
      import assert from 'node:assert/strict';
      import { createRequire } from 'node:module';
      const require = createRequire(import.meta.url);
      const esm = await import('forminojs/core');
      const cjs = require('forminojs/core');
      const schema = require('forminojs/schemas/form-definition.schema.json');
      assert.equal(schema.$defs.templateField.properties.type.enum.includes('Input'), true);
      for (const engine of [esm, cjs]) {
        const result = new engine.FormConfigBuilder([{ type: engine.FormFieldType.Input, name: 'name' }], { name: { label: 'Name' } }).build();
        assert.equal(result[0].label, 'Name');
      }
    `;
    writeFileSync(path.join(cwd, 'core.mjs'), coreScript);
    run(process.execPath, ['core.mjs'], cwd);
    if (!variant.react) {
      const installed = readdirSync(path.join(cwd, 'node_modules'));
      assert(!installed.includes('react') && !installed.includes('antd'), 'Core must not install UI peers.');
    } else {
      const uiScript = `
        import assert from 'node:assert/strict';
        import { createRequire } from 'node:module';
        const require = createRequire(import.meta.url);
        const React = require('react');
        const { renderToString } = require('react-dom/server');
        const moment = ${variant.antd.startsWith('4') ? "require('moment')" : 'null'};
        const adapter = moment ? { parse: (value, format) => moment(value, format), format: (value, format) => moment(value).format(format) } : undefined;
        const modules = [require('forminojs'), require('forminojs/antd'), await import('forminojs')];
        for (const lib of modules) {
          const html = renderToString(React.createElement(lib.DynamicForm, { initialValues: { name: 'Installed', date: '2025-01-01' }, dateAdapter: adapter },
            React.createElement(lib.FormComponent, { formConfig: [
              { type: lib.FormFieldType.Input, name: 'name', label: 'Name' },
              { type: lib.FormFieldType.Date, name: 'date', label: 'Date' }
            ] })));
          assert(html.includes('Installed'));
          assert(html.includes('id="date"'));
          const preview = renderToString(React.createElement(lib.DynamicForm, { displayMode: lib.FormMode.preview, initialValues: { date: '2025-01-01' }, dateAdapter: adapter },
            React.createElement(lib.FormComponent, { formConfig: [{ type: lib.FormFieldType.Date, name: 'date', label: 'Date' }] })));
          assert(preview.includes('2025-01-01'));
        }
      `;
      writeFileSync(path.join(cwd, 'ui.mjs'), uiScript);
      run(process.execPath, ['ui.mjs'], cwd);
      const fixture = `
        import * as React from 'react';
        import { DynamicForm, FormComponent, FormFieldType, FormConfigBuilder, guideMiddleware } from 'forminojs';
        import type { FormTemplate, FormConfigFields } from 'forminojs';
        interface Values { name: string; count: number }
        const template: FormTemplate<Values> = [{ type: FormFieldType.Input, name: 'name' }];
        const fields: Record<string, FormConfigFields<Values>> = { name: { label: 'Name', rules: [{ required: true }] } };
        new FormConfigBuilder<Values>(template, fields).addMiddleware(guideMiddleware).build();
        React.createElement(DynamicForm<Values>, { initialValues: { name: 'Typed' } },
          React.createElement(FormComponent<Values>, { formConfig: template }));
        // @ts-expect-error Unknown top-level field names must be rejected.
        const invalid: FormTemplate<Values> = [{ type: FormFieldType.Input, name: 'unknown' }];
        void invalid;
      `;
      for (const extension of ['mts', 'cts']) writeFileSync(path.join(cwd, 'consumer.' + extension), fixture);
      run(
        process.execPath,
        [
          path.join(cwd, 'node_modules/typescript/bin/tsc'),
          '--noEmit',
          '--strict',
          '--skipLibCheck',
          '--esModuleInterop',
          '--target',
          'ES2020',
          '--module',
          'NodeNext',
          '--moduleResolution',
          'NodeNext',
          'consumer.mts',
          'consumer.cts',
        ],
        cwd,
      );
      assert(existsSync(path.join(cwd, 'node_modules/forminojs/dist/style.css')));
    }
    console.log(
      'PASS ' +
        variant.name +
        ': installed tarball, ESM/CJS' +
        (variant.react ? ', SSR and consumer types' : ', no UI dependencies'),
    );
  }
} finally {
  // Verify the resolved deletion target remains the exact task-owned temporary directory.
  const resolved = realpathSync(directory);
  assert.equal(path.dirname(resolved).toLowerCase(), temporaryRoot.toLowerCase());
  assert(path.basename(resolved).startsWith('dynamic-form-smoke-'));
  rmSync(resolved, { recursive: true, force: true });
}
