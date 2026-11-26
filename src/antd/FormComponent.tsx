import React, { useEffect, useMemo, useState } from 'react';
import { Col, Row, Skeleton } from 'antd';
import { fieldKey, parseFormLayout, splitIntoBatches } from '../core';
import type { FormValues } from '../core';
import type { FormConfigFields } from './types';
import { RenderFormItem } from './Field';
export interface FormComponentProps<Values extends object = FormValues> {
  formConfig: readonly FormConfigFields<Values>[];
  title?: string;
  rowsPerBatch?: number;
  progressive?: boolean;
  loading?: boolean;
}
export function RenderFormSegment({ segment }: { segment: readonly FormConfigFields[] }): React.ReactElement {
  const rows = useMemo(() => parseFormLayout(segment), [segment]);
  return (
    <>
      {rows.map((row, rowIndex) => (
        <Row key={rowIndex} gutter={16}>
          {row.map((field, index) => (
            <Col key={field.name === undefined ? 'layout-' + index : fieldKey(field.name)} span={field.span ?? 24}>
              <RenderFormItem field={field} />
            </Col>
          ))}
        </Row>
      ))}
    </>
  );
}
export function FormComponent<Values extends object = FormValues>({
  formConfig,
  title,
  rowsPerBatch = 3,
  progressive = false,
  loading = false,
}: FormComponentProps<Values>): React.ReactElement {
  const batches = useMemo(() => splitIntoBatches(formConfig, title, rowsPerBatch), [formConfig, title, rowsPerBatch]);
  const [mounted, setMounted] = useState(1);
  useEffect(() => {
    setMounted(1);
  }, [batches]);
  useEffect(() => {
    if (!progressive || mounted >= batches.length) return;
    if (typeof requestAnimationFrame === 'function') {
      const id = requestAnimationFrame(() => setMounted((count) => count + 1));
      return () => cancelAnimationFrame(id);
    }
    const id = setTimeout(() => setMounted((count) => count + 1), 16);
    return () => clearTimeout(id);
  }, [batches.length, mounted, progressive]);
  if (loading) return <Skeleton active paragraph={{ rows: 4 }} />;
  const visible = progressive ? batches.slice(0, mounted) : batches;
  return (
    <>
      {visible.map((batch, index) => (
        <section className="df-section" key={index}>
          {batch.title && <h2 className="df-section-title">{batch.title}</h2>}
          <RenderFormSegment segment={batch.segment as readonly FormConfigFields[]} />
        </section>
      ))}
    </>
  );
}
export const FormDetailFields = FormComponent;
