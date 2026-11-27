# Formino — a configuration-driven form engine

[![npm version](https://img.shields.io/npm/v/forminojs?color=315efb)](https://www.npmjs.com/package/forminojs) [![MIT license](https://img.shields.io/github/license/eugeneaiao-ui/formino)](https://github.com/eugeneaiao-ui/formino/blob/main/LICENSE) [![GitHub release](https://img.shields.io/github/v/release/eugeneaiao-ui/formino)](https://github.com/eugeneaiao-ui/formino/releases/latest)

[Documentation](https://eugeneaiao-ui.github.io/formino/) · [Live playground](https://eugeneaiao-ui.github.io/formino/playground/) · [Release](https://github.com/eugeneaiao-ui/formino/releases/latest) · [Discussions](https://github.com/eugeneaiao-ui/formino/discussions) · [Support](https://github.com/eugeneaiao-ui/formino/blob/main/SUPPORT.md) · [Adoption guide](https://github.com/eugeneaiao-ui/formino/blob/main/docs/ADOPTION.md)

[中文](https://github.com/eugeneaiao-ui/formino/blob/main/README.md) · [Quick start](https://github.com/eugeneaiao-ui/formino/blob/formino-v0.1.0/docs/GETTING_STARTED.md) · [Configuration](https://github.com/eugeneaiao-ui/formino/blob/formino-v0.1.0/docs/CONFIGURATION.md) · [Recipes](https://github.com/eugeneaiao-ui/formino/blob/formino-v0.1.0/docs/RECIPES.md) · [API](https://github.com/eugeneaiao-ui/formino/blob/formino-v0.1.0/docs/API.md)

A TypeScript **configuration-driven form engine** for React and Ant Design. Describe fields, layout, validation and data sources in a form definition; let a shared engine compose that definition, handle dependencies and render the form.

## Why I created Formino

I wanted a form to be a definition that can be read, managed and passed between systems. When a form changes, developers should be able to describe the business differences in configuration and reuse the rendering and interaction code already in place.

**Configuration-driven design is the starting point. Long forms, complex dependencies, previews and snapshots are features supported by that model.**

## Separate form definitions from rendering

The definition describes which fields exist, how they are arranged and which rules apply. The rendering layer implements controls, state bindings and interactions. An explicit configuration contract connects the two.

```text
Requirements / human editing / AI generation
                    ↓
Form definition (local TypeScript / supported JSON from a backend)
                    ↓
Host validation and adaptation → Formino configuration engine
                    ↓
React / Ant Design rendering, validation and interaction
```

| Responsibility             | What it owns                                                                                    |
| -------------------------- | ----------------------------------------------------------------------------------------------- |
| Form definition            | Fields, layout, rules, options and supported data-source references                             |
| Formino engine and adapter | Configuration composition, field dependencies, reusable rendering, form state and display modes |
| Host application           | Definition storage and publishing, business APIs, custom controls and executable logic          |

`template` defines field order, types and layout; `fields` defines labels, validation and control properties. Shared behavior belongs in the engine, while business differences enter through definitions and host adapters.

### Store and deliver definitions from a backend

A serializable definition can be stored, delivered for different scenarios and versioned by a backend while the frontend reuses its rendering implementation. This provides a foundation for configuration review, version management and reuse across application screens.

Within the controls and rules already supported by the renderer, a field, layout or validation change can be delivered as configuration. New controls and executable behavior still require application code. Persist the supported **JSON configuration subset**; functions, custom components and advanced dependencies use trusted TypeScript configuration and host registrations.

The host owns storage, authorization and publishing services. Formino supplies the configuration contract, engine and integration examples. See [JSON and backend integration](https://github.com/eugeneaiao-ui/formino/blob/main/docs/AI_INTEGRATION.md).

### Give AI a stable configuration contract

Provide the contract, relevant examples and business requirements so a model can generate or update a definition, reusing the engine's existing rendering and interaction behavior. This separation aims to reduce repeated reasoning and code generation around form implementation.

- **Less repeated context:** focus on relevant fields, rules and registered capabilities, reducing the need to revisit page implementation details.
- **Less repeated output:** reuse the renderer instead of generating similar JSX, state wiring and event handlers for every form.
- **Smaller changes:** review and validate field or rule changes as configuration differences.

The aim is to reduce context size, output tokens and revision overhead. Actual savings depend on the task, model and definition size; the project has not published a comparative AI-cost benchmark. Validate generated definitions against the contract before host adaptation and rendering.

## Features supported by this model

- Long forms with 100, 300 or 1,000 fields, complete or progressive mounting and full-form validation.
- Asynchronous cascading options, multi-stage calculations, dynamic attributes and conditional validation.
- Edit, preview and snapshot modes using shared field definitions.
- Custom controls, business data sources, application context and date adapters supplied by the host.
- An independent core without React or AntD imports, plus ESM / CommonJS outputs and type declarations.
- Reactive configuration updates and cancellation of outdated asynchronous results.

Read the [illustrated examples](https://github.com/eugeneaiao-ui/formino/blob/formino-v0.1.0/docs/EXAMPLES.md) and [browser benchmark report](https://github.com/eugeneaiao-ui/formino/blob/formino-v0.1.0/docs/PERFORMANCE.md). Progressive mounting trades first-batch latency against total completion time; it retains the full DOM.

![Long form with 300 mounted fields](https://raw.githubusercontent.com/eugeneaiao-ui/formino/formino-v0.1.0/docs/images/long.png)

## Low-code and AI integration

Use Formino as the rendering layer for stored definitions, validate AI-generated JSON, or give a coding assistant the typed API and examples. The repository includes a [configuration JSON Schema](https://github.com/eugeneaiao-ui/formino/blob/formino-v0.1.0/schemas/form-definition.schema.json), a working [JSON form example](https://github.com/eugeneaiao-ui/formino/blob/formino-v0.1.0/examples/ai/JsonFormExample.tsx), and [llms.txt](https://github.com/eugeneaiao-ui/formino/blob/main/llms.txt). See the [integration guide](https://github.com/eugeneaiao-ui/formino/blob/main/docs/AI_INTEGRATION.md) for the supported subset and workflow.

The project provides a form engine and integration examples. Hosts can build a visual editor, configuration backend or LLM service around it. The supplied schema describes Formino configuration rather than arbitrary JSON Schema documents.

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

Contribute through **Fork → short-lived branch → PR to main → review → squash merge**. Start with [CONTRIBUTING](https://github.com/eugeneaiao-ui/formino/blob/main/CONTRIBUTING.md) and the [branch/review workflow](https://github.com/eugeneaiao-ui/formino/blob/main/docs/CONTRIBUTION_WORKFLOW.md).

```bash
npm run check
npm run check:docs
npm run test:package
```

See [CONTRIBUTING](https://github.com/eugeneaiao-ui/formino/blob/main/CONTRIBUTING.md) for the development and manual release process, and [CHANGELOG](https://github.com/eugeneaiao-ui/formino/blob/formino-v0.1.0/CHANGELOG.md) for changes. CI does not publish npm packages.

## License

[MIT](https://github.com/eugeneaiao-ui/formino/blob/formino-v0.1.0/LICENSE).
