import Ajv2020 from 'ajv/dist/2020.js';
import schema from '../../schemas/form-definition.schema.json';
import { cloneConfig, fieldKey, toPath } from '../../src/core';
import { FormFieldType } from '../../src';
import type { FormConfigFields, FormTemplate } from '../../src';

export interface JsonFormDefinition {
  $schema?: string;
  schemaVersion: 1;
  template: FormTemplate;
  fields?: Record<string, FormConfigFields>;
}
const validate = new Ajv2020({ allErrors: true, strict: true, ownProperties: true }).compile<JsonFormDefinition>(
  schema,
);

/** Example adapter: add ajv to the host application when copying this file. */
export function parseFormDefinition(input: unknown, allowedDataSources: readonly string[] = []): JsonFormDefinition {
  if (!validate(input)) {
    throw new Error(
      validate.errors?.map((error) => (error.instancePath || '/') + ' ' + error.message).join('; ') ||
        'Invalid form definition.',
    );
  }
  const keys = new Set<string>();
  const paths: (string | number)[][] = [];
  for (const item of input.template) {
    if (item.name === undefined) continue;
    const key = fieldKey(item.name);
    if (keys.has(key)) throw new Error('Duplicate field name: ' + key);
    keys.add(key);
    const path = toPath(item.name);
    if (
      paths.some((other) => {
        const length = Math.min(other.length, path.length);
        return Array.from({ length }, (_, index) => other[index] === path[index]).every(Boolean);
      })
    )
      throw new Error('Overlapping field paths: ' + key);
    paths.push(path);
    if (item.type === FormFieldType.Span || item.type === FormFieldType.Title) {
      throw new Error('JSON layout items must be unnamed.');
    }
  }
  for (const [key, field] of Object.entries(input.fields ?? {})) {
    if (!keys.has(key)) throw new Error('Field definition is missing from template: ' + key);
    if (field.dataSource !== undefined && !allowedDataSources.includes(String(field.dataSource))) {
      throw new Error('Data source must be approved by the host: ' + String(field.dataSource));
    }
  }
  return cloneConfig(input);
}
