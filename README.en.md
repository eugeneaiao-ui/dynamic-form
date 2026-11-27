# Formino — schema-driven forms for low-code and AI-assisted development

[![npm version](https://img.shields.io/npm/v/forminojs?color=315efb)](https://www.npmjs.com/package/forminojs) [![MIT license](https://img.shields.io/github/license/eugeneaiao-ui/formino)](https://github.com/eugeneaiao-ui/formino/blob/main/LICENSE) [![GitHub release](https://img.shields.io/github/v/release/eugeneaiao-ui/formino)](https://github.com/eugeneaiao-ui/formino/releases/latest)

[Documentation](https://eugeneaiao-ui.github.io/formino/) · [Live playground](https://eugeneaiao-ui.github.io/formino/playground/) · [Release](https://github.com/eugeneaiao-ui/formino/releases/latest) · [Discussions](https://github.com/eugeneaiao-ui/formino/discussions) · [Support](https://github.com/eugeneaiao-ui/formino/blob/main/SUPPORT.md) · [Adoption guide](https://github.com/eugeneaiao-ui/formino/blob/main/docs/ADOPTION.md)

[中文](https://github.com/eugeneaiao-ui/formino/blob/formino-v0.1.0/README.md) · [Quick start](https://github.com/eugeneaiao-ui/formino/blob/formino-v0.1.0/docs/GETTING_STARTED.md) · [Configuration](https://github.com/eugeneaiao-ui/formino/blob/formino-v0.1.0/docs/CONFIGURATION.md) · [Recipes](https://github.com/eugeneaiao-ui/formino/blob/formino-v0.1.0/docs/RECIPES.md) · [API](https://github.com/eugeneaiao-ui/formino/blob/formino-v0.1.0/docs/API.md)

A TypeScript form library with an independent configuration engine and a React / Ant Design adapter. Configure field order, layout, validation, data sources, dependencies, and edit / preview / snapshot rendering.

## Long forms and complex dependencies

- Try 100, 300 or 1,000 fields with complete or progressive mounting and full-form validation.
- Combine asynchronous dependent options, multi-stage calculations, dynamic attributes and conditional validation.
- Read the [illustrated examples](https://github.com/eugeneaiao-ui/formino/blob/formino-v0.1.0/docs/EXAMPLES.md), [browser benchmark report](https://github.com/eugeneaiao-ui/formino/blob/formino-v0.1.0/docs/PERFORMANCE.md) and raw samples. Progressive mounting trades first-batch latency against total completion time; it is not virtualization.

![Long form with 300 mounted fields](https://raw.githubusercontent.com/eugeneaiao-ui/formino/formino-v0.1.0/docs/images/long.png)

## Low-code and AI integration

Use Formino as a rendering layer for stored form definitions, validate AI-generated JSON before rendering, or give a coding assistant the typed API and examples. The repository includes a [configuration JSON Schema](https://github.com/eugeneaiao-ui/formino/blob/formino-v0.1.0/schemas/form-definition.schema.json), a working [JSON form example](https://github.com/eugeneaiao-ui/formino/blob/formino-v0.1.0/examples/ai/JsonFormExample.tsx), and [llms.txt](https://github.com/eugeneaiao-ui/formino/blob/formino-v0.1.0/llms.txt). See the [AI integration guide](https://github.com/eugeneaiao-ui/formino/blob/formino-v0.1.0/docs/AI_INTEGRATION.md) for the full workflow and supported subset.

This is a form engine, not a complete drag-and-drop builder or an LLM backend. It does not render arbitrary JSON Schema documents.

## Try the playground

Use Node.js 22.12+ (or Node.js 20.19+).

```bash
git clone https://github.com/eugeneaiao-ui/formino.git
cd formino
npm ci
npm run dev
```

## Install in an application

```bash
npm install forminojs
```

Formino is published as forminojs@0.1.0. The previous @eugenedfsfsvg/dynamic-form package remains available. To migrate, replace the package name and import paths; public APIs are unchanged. For local development, build this repository and use npm pack to install a tarball.

The UI adapter requires React, ReactDOM, and Ant Design in the host application. Verified combinations are React 16.14 + AntD 4.24, React 18.3 + AntD 5.27, and React 19.1 + AntD 5.27. AntD 4 requires a moment date adapter; AntD 5 uses dayjs by default.

## Minimal form

```tsx
import React from 'react';
import { DynamicForm, FormComponent, FormFieldType, useDynamicConfig } from 'forminojs';
import 'forminojs/style.css';

const template = [{ name: 'name', type: FormFieldType.Input }];
const fields = { name: { label: 'Name', rules: [{ required: true }] } };

function Fields() {
  const { formConfig } = useDynamicConfig({ template, fields });
  return <FormComponent formConfig={formConfig} />;
}

export function Example() {
  return (
    <DynamicForm onFinish={(values) => console.log(values)}>
      <Fields />
      <button type="submit">Submit</button>
    </DynamicForm>
  );
}
```

Keep hooks in a child of DynamicForm / DynamicFormProvider. Import the library stylesheet explicitly and configure AntD styles in the host application.

## Configuration model

| Layer         | Responsibility                                                |
| ------------- | ------------------------------------------------------------- |
| template      | Field names, order, type, and 24-column layout                |
| fields        | Labels, rules, componentProps, dataSource, dependenciesConfig |
| middlewares   | Synchronous configuration transformations                     |
| DynamicForm   | Form state, validation, submission, mode, adapters            |
| FormComponent | Rendering the generated formConfig                            |

Field definitions override template properties with a shallow merge; middleware runs afterwards. Use immutable configuration updates. API sources must declare dependsOn for reactive parameters. Custom controls and application services are injected through registry / dataSources / dataContext.

The `/core` entry has no React or AntD imports. Root and `/antd` exports provide the UI adapter. All JavaScript entries support ESM / CommonJS with matching declarations.

The detailed guides are currently in Chinese. The [quick-start source](https://github.com/eugeneaiao-ui/formino/blob/formino-v0.1.0/examples/quick-start/ProfileForm.tsx) and [configuration recipes](https://github.com/eugeneaiao-ui/formino/blob/formino-v0.1.0/examples/configuration/recipes.tsx) are typechecked examples with English field labels.

## Development

```bash
npm run check
npm run check:docs
npm run test:package
```

See [CONTRIBUTING](https://github.com/eugeneaiao-ui/formino/blob/formino-v0.1.0/CONTRIBUTING.md) for the development and manual release process, and [CHANGELOG](https://github.com/eugeneaiao-ui/formino/blob/formino-v0.1.0/CHANGELOG.md) for changes. CI does not publish npm packages.

## License

[MIT](https://github.com/eugeneaiao-ui/formino/blob/formino-v0.1.0/LICENSE).
