import React from 'react';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import definition from '../examples/ai/service-request.json';
import { parseFormDefinition } from '../examples/ai/parse-definition';
import { JsonFormExample } from '../examples/ai/JsonFormExample';

describe('low-code / AI configuration contract', () => {
  it('accepts the sample, preserves false and zero, and returns an isolated config', () => {
    const input = structuredClone(definition);
    input.fields.description.componentProps.rows = 1;
    const output = parseFormDefinition(input);
    expect(output).toEqual(input);
    expect(output).not.toBe(input);
    expect(
      parseFormDefinition({
        schemaVersion: 1,
        template: [{ type: 'NumberInput', name: 'count' }],
        fields: { count: { componentProps: { min: 0, disabled: false } } },
      }).fields?.count?.componentProps,
    ).toEqual({ min: 0, disabled: false });
  });
  it.each([
    { schemaVersion: 2, template: [] },
    { schemaVersion: 1, template: [{ type: 'Input' }] },
    { schemaVersion: 1, template: [{ type: 'Input', name: '__proto__' }] },
    { schemaVersion: 1, template: [{ type: 'Input', name: ['profile', 'constructor'] }] },
    { schemaVersion: 1, template: [{ type: 'Input', name: 'name', span: 25 }] },
    { schemaVersion: 1, template: [{ type: 'Custom', name: 'name' }] },
    {
      schemaVersion: 1,
      template: [{ type: 'Input', name: 'name' }],
      fields: { name: { componentProps: { onChange: 'eval(code)' } } },
    },
    {
      schemaVersion: 1,
      template: [{ type: 'Input', name: 'name' }],
      fields: { name: { dependenciesConfig: { calculate: 'code' } } },
    },
    {
      schemaVersion: 1,
      template: [{ type: 'Input', name: 'name' }],
      fields: { name: { dataSource: { type: 'api', url: '/unapproved' } } },
    },
  ])('rejects invalid or executable configuration %#', (input) => {
    expect(() => parseFormDefinition(input)).toThrow();
  });
  it('rejects unused definitions, duplicates, overlapping paths and unapproved source names', () => {
    expect(() =>
      parseFormDefinition({ schemaVersion: 1, template: [{ type: 'Input', name: 'name' }], fields: { extra: {} } }),
    ).toThrow('missing from template');
    expect(() =>
      parseFormDefinition({
        schemaVersion: 1,
        template: [
          { type: 'Input', name: 'name' },
          { type: 'Input', name: 'name' },
        ],
      }),
    ).toThrow('Duplicate');
    expect(() =>
      parseFormDefinition({
        schemaVersion: 1,
        template: [
          { type: 'Input', name: 'user' },
          { type: 'Input', name: ['user', 'email'] },
        ],
      }),
    ).toThrow('Overlapping');
    const input = {
      schemaVersion: 1,
      template: [{ type: 'Select', name: 'country' }],
      fields: { country: { dataSource: 'countries' } },
    };
    expect(() => parseFormDefinition(input)).toThrow('approved');
    expect(parseFormDefinition(input, ['countries'])).toEqual(input);
  });
  it('renders and submits generated fields, and rejects invalid edits', async () => {
    render(<JsonFormExample />);
    fireEvent.change(screen.getByRole('textbox', { name: 'Name' }), { target: { value: 'Alex' } });
    fireEvent.mouseDown(screen.getByRole('combobox', { name: 'Country' }));
    fireEvent.click(await screen.findByText('Singapore'));
    fireEvent.click(screen.getByText('Submit generated form'));
    await waitFor(() => expect(screen.getByLabelText('Submitted JSON').textContent).toContain('"name": "Alex"'));
    fireEvent.change(screen.getByLabelText('Form configuration JSON'), { target: { value: '{"schemaVersion":2}' } });
    expect(screen.getByText('Invalid configuration')).toBeTruthy();
    expect(screen.queryByText('Submit generated form')).toBeNull();
  });
});
