import React, { useMemo, useState } from 'react';
import { Alert, Button, Card, Input } from 'antd';
import { DynamicForm, FormComponent, useDynamicConfig } from '../../src';
import definition from './service-request.json';
import { parseFormDefinition } from './parse-definition';
import type { JsonFormDefinition } from './parse-definition';

function JsonFields({ config }: { config: JsonFormDefinition }) {
  const { formConfig } = useDynamicConfig({ template: config.template, fields: config.fields });
  return <FormComponent formConfig={formConfig} />;
}
export function JsonFormExample() {
  const [source, setSource] = useState(JSON.stringify(definition, null, 2));
  const [submitted, setSubmitted] = useState<string>();
  const parsed = useMemo(() => {
    try {
      const input: unknown = JSON.parse(source);
      return { config: parseFormDefinition(input), error: undefined };
    } catch (reason: unknown) {
      return { config: undefined, error: reason instanceof Error ? reason.message : String(reason) };
    }
  }, [source]);
  return (
    <Card className="form-card" title="Low-code / AI-generated JSON">
      <p>Paste JSON that follows the configuration schema. Invalid definitions are rejected before rendering.</p>
      <label htmlFor="json-definition">Form configuration JSON</label>
      <Input.TextArea
        id="json-definition"
        rows={12}
        value={source}
        onChange={(event) => {
          setSource(event.target.value);
          setSubmitted(undefined);
        }}
        spellCheck={false}
      />
      {parsed.error && <Alert type="error" showIcon message="Invalid configuration" description={parsed.error} />}
      {parsed.config && (
        <DynamicForm
          key={source}
          name="ai-example"
          onFinish={(values) => setSubmitted(JSON.stringify(values, null, 2))}
        >
          <JsonFields config={parsed.config} />
          <Button type="primary" htmlType="submit">
            Submit generated form
          </Button>
        </DynamicForm>
      )}
      {submitted && <pre aria-label="Submitted JSON">{submitted}</pre>}
    </Card>
  );
}
