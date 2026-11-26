import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Alert, Button, Card, Form, Select, Space, Switch, Tag } from 'antd';
import { DynamicForm, FormComponent, useDynamicConfig } from '../../src';
import { createFixture } from '../performance/fixtures';
import type { Fixture } from '../performance/fixtures';

function LongFields({ fixture, progressive }: { fixture: Fixture; progressive: boolean }) {
  const { formConfig } = useDynamicConfig({ template: fixture.template, fields: fixture.fields });
  return <FormComponent formConfig={formConfig} progressive={progressive} rowsPerBatch={3} />;
}
function LongDocument({ count, progressive }: { count: number; progressive: boolean }) {
  const [form] = Form.useForm();
  const fixture = useMemo(() => createFixture(count), [count]);
  const container = useRef<HTMLDivElement>(null);
  const [mounted, setMounted] = useState(0);
  const [result, setResult] = useState<string>();
  useEffect(() => {
    const element = container.current;
    if (!element) return;
    const update = () => setMounted(element.querySelectorAll('.ant-form-item-control').length);
    const observer = new MutationObserver(update);
    observer.observe(element, { childList: true, subtree: true });
    update();
    return () => observer.disconnect();
  }, []);
  return (
    <>
      <Space wrap style={{ marginBottom: 16 }}>
        <Tag color="blue">
          {mounted} / {count} fields mounted
        </Tag>
        <Tag>{Math.ceil(count / 3)} rows · 3 columns</Tag>
        <Button
          disabled={mounted !== count}
          onClick={() => {
            void form
              .validateFields()
              .then(() => setResult('All ' + count + ' fields passed validation.'))
              .catch(() => setResult('Please complete the required fields.'));
          }}
        >
          Validate entire form
        </Button>
      </Space>
      {result && <Alert message={result} type="info" showIcon style={{ marginBottom: 16 }} />}
      <div className="long-form-scroll" ref={container}>
        <DynamicForm form={form} name="long-form" initialValues={fixture.initialValues} size="small">
          <LongFields fixture={fixture} progressive={progressive} />
        </DynamicForm>
      </div>
    </>
  );
}
export function LongFormExample() {
  const [count, setCount] = useState(300);
  const [progressive, setProgressive] = useState(false);
  return (
    <Card className="form-card" title="Long forms — one schema, hundreds of fields">
      <p>
        Choose a size and compare complete mounting with progressive batches. Every field uses a real Ant Design control
        and required validation.
      </p>
      <Space wrap className="toolbar">
        <span>Fields</span>
        <Select
          aria-label="Field count"
          value={count}
          onChange={setCount}
          options={[100, 300, 1000].map((value) => ({ value, label: String(value) }))}
        />
        <Switch checked={progressive} onChange={setProgressive} aria-label="Progressive mounting" />
        <span>Progressive · 9 fields per batch</span>
      </Space>
      <Alert
        type="info"
        showIcon
        message="Progressive mounting is optional. It keeps all fields once finished; it is not virtualization."
        description="Full-form validation stays disabled until all controls are mounted."
        style={{ marginBottom: 20 }}
      />
      <LongDocument key={count + ':' + progressive} count={count} progressive={progressive} />
    </Card>
  );
}
