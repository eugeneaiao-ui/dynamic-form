# AI-assisted development and low-code integration

[Overview](../README.en.md) · [配置手册](CONFIGURATION.md) · [JSON Schema](../schemas/form-definition.schema.json) · [Example adapter](../examples/ai/parse-definition.ts)

Formino is a TypeScript form engine for React and Ant Design. Use it as a rendering layer in a low-code application, as a target for AI-generated form definitions, or as a typed form API for an AI coding assistant.

## What is supported?

| Scenario                                                      | Integration                                                                                            |
| ------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------ |
| A coding assistant writes React / TypeScript forms            | Provide README, API reference and examples as context; generate template / fields using exported enums |
| A model outputs a JSON form definition                        | Validate against the supplied configuration schema, then run the example adapter before rendering      |
| A low-code application stores form definitions                | Store the JSON subset; let application code approve data sources and provide initial values            |
| A form needs calculations, custom uploads or richer rendering | Extend the validated configuration in trusted TypeScript; use middleware / dependencies / registry     |

The project does not include a drag-and-drop editor, an LLM backend, or an importer for arbitrary JSON Schema documents. The supplied JSON Schema describes **Formino configuration**, not the values submitted by a user.

## Working example

Run npm ci and npm run dev in this repository. The playground includes **Low-code / AI-generated JSON**. Edit the JSON, see valid fields render, and submit them. Invalid definitions replace the form with validation errors.

Source files:

- [service-request.json](../examples/ai/service-request.json): sample definition.
- [parse-definition.ts](../examples/ai/parse-definition.ts): validation adapter.
- [JsonFormExample.tsx](../examples/ai/JsonFormExample.tsx): editor, preview and submission.

## JSON contract v1

```json
{
  "schemaVersion": 1,
  "template": [
    { "name": "name", "type": "Input", "span": 12 },
    { "name": "country", "type": "Select", "span": 12 }
  ],
  "fields": {
    "name": {
      "label": "Name",
      "rules": [{ "required": true, "message": "Please enter a name." }]
    },
    "country": {
      "label": "Country",
      "componentProps": {
        "options": [{ "label": "Singapore", "value": "SG" }]
      }
    }
  }
}
```

This is the same template / fields model as the TypeScript API, limited to serializable properties.

- schemaVersion is 1.
- type is one of Input, NumberInput, Select, RichTextSelect, TextArea, Date, Span or Title.
- Normal controls require name; layout items are unnamed. Field paths are identifiers or arrays of identifiers / non-negative indexes.
- span is an integer from 1 to 24.
- Rules support required, type, min, max, len, whitespace and message.
- componentProps supports the explicit property list in the schema, including placeholders, options, numeric limits and text limits.
- dataSource is a registered source name approved by the host, not an API descriptor.
- Functions, custom component names, callback strings, arbitrary URLs and extra properties are rejected.
- The contract limits template size, path depth and option counts. Applications should also bound incoming response size.

## Generation → validation → rendering

1. Give the model the schema, this guide, the example JSON, and the user's field requirements.
2. Parse the model response as JSON; validate it locally.
3. Run the example adapter for duplicate fields, overlapping paths, unused definitions and approved source names.
4. Render through useDynamicConfig + FormComponent inside DynamicForm.
5. Validate submitted values in the application and on the server.

JSON Schema dialects and model provider subsets vary. A provider's structured-output mode may need a simplified schema; the local validator remains authoritative. Never treat model output as trusted executable TypeScript.

### Use in your application

Install forminojs as described in the [quick start](GETTING_STARTED.md). Copy parse-definition.ts and JsonFormExample.tsx from the example, replace their local ../../src imports with the package root and ../../src/core with the /core entry. Install Ajv in the host:

```bash
npm install ajv@8.17.1
```

The schema is included in the package:

```tsx
import schema from 'forminojs/schemas/form-definition.schema.json';
```

This JSON import example assumes a bundler / TypeScript configuration with resolveJsonModule. Adapt JSON loading to the host module system. The example adapter is **not exported by the library**; copy it as application code and adjust its schema import to the package path.

Then use the adapter's validated result:

```tsx
const config = parseFormDefinition(modelOutput, ['countries']);
// Pass the same approved source registry to DynamicForm.
// In a child Fields component:
const { formConfig } = useDynamicConfig({ template: config.template, fields: config.fields });
// <FormComponent formConfig={formConfig} />
```

Approval of a source name does not register it. Register countries on the DataSourceManager passed to DynamicForm. Without any source names, the adapter rejects every dataSource reference. It does not automatically call an LLM or register business APIs.

Changing the whole JSON document resets the example's form data intentionally. A production editor may choose a stable document ID and explicitly migrate values between revisions.

## Prompt starter

```text
Generate a Formino configuration for the following user requirements:
<insert field labels, types, layout and validation requirements here>

Use the provided form-definition.schema.json and service-request.json.
Return one JSON object only, with schemaVersion: 1, template and fields.
Use only the built-in field types and componentProps allowed by the schema.
Every normal field must have a unique name and a matching fields entry.
Span and Title are unnamed. A row is 24 columns.
Do not generate JavaScript, callback strings, HTML, component imports or API URLs.
Use static options unless a host-approved data-source name was supplied.
If a requirement is outside the contract, report it to the host instead of inventing a property.
```

Handle an unsupported-requirement response separately from a successful JSON result. For code generation, provide the TypeScript API and let the coding assistant write reviewed host code for advanced features.

## Stable retrieval entry points

- [llms.txt](../llms.txt): compact documentation map.
- [JSON Schema](../schemas/form-definition.schema.json): machine-readable contract.
- [Public API](API.md): typed API reference.
- [Discoverability notes](DISCOVERY.md): repository metadata, indexing and remaining publication steps.

These documents help retrieval and integration; they do not guarantee that any search engine or AI assistant will index or recommend the project.
