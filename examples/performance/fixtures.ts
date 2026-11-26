import { DependentTypeEnum, FormFieldType } from '../../src';
import type { FormConfigFields, FormTemplate, FormValues } from '../../src';

export type FixtureKind = 'input' | 'linked';
export function createFixture(count: number, kind: FixtureKind = 'input') {
  if (!Number.isInteger(count) || count < 1 || count > 2000) throw new Error('Field count must be 1–2000.');
  const template: Array<FormTemplate[number]> = [];
  const fields: Record<string, FormConfigFields> = {};
  const initialValues: FormValues = {};
  for (let index = 0; index < count; index++) {
    const name = 'field_' + index;
    const linked = kind === 'linked' && index > 0;
    template.push({ name, type: kind === 'linked' ? FormFieldType.NumberInput : FormFieldType.Input, span: 8 });
    fields[name] = {
      label: linked
        ? 'Quantity × ' + index
        : kind === 'linked'
          ? 'Quantity'
          : 'Field ' + String(index + 1).padStart(4, '0'),
      rules: [{ required: true, message: 'Required' }],
      componentProps: linked ? { disabled: true } : { placeholder: 'Enter a value' },
      ...(linked
        ? {
            dependenciesConfig: {
              type: DependentTypeEnum.COMPUTE,
              dependsOn: ['field_0'],
              calculate: ([value]: unknown[]) => Number(value ?? 0) * index,
            },
          }
        : {}),
    };
    initialValues[name] = kind === 'linked' ? (index === 0 ? 1 : index) : 'Value ' + (index + 1);
  }
  return { template, fields, initialValues, count, kind };
}
export type Fixture = ReturnType<typeof createFixture>;
