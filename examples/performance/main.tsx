import React, { useLayoutEffect } from 'react';
import { createRoot } from 'react-dom/client';
import type { Root } from 'react-dom/client';
import { ConfigProvider, Form } from 'antd';
import type { FormInstance } from 'antd';
import { DynamicForm, FormComponent, useDynamicConfig } from '../../src';
import { createFixture } from './fixtures';
import type { Fixture, FixtureKind } from './fixtures';
import '../../src/antd/styles.css';

interface MountMetrics {
  firstCommitMs: number;
  allCommittedMs: number;
  settledMs: number;
  mountedFields: number;
  registeredFields: number;
  domNodes: number;
  longTaskCount: number;
  longestTaskMs: number;
  totalLongTaskMs: number;
}
declare global {
  interface Window {
    benchmarkReady: boolean;
    runFormBenchmark: (options: { count: number; progressive: boolean; kind: FixtureKind }) => Promise<MountMetrics>;
    startEditMeasurement: (value: string) => void;
    finishEditMeasurement: () => Promise<number>;
    validateBenchmark: () => Promise<number>;
  }
}
const container = document.getElementById('benchmark-root');
if (!container) throw new Error('Missing benchmark root.');
container.style.cssText = 'max-width:1000px;margin:24px auto;font-family:system-ui';
let root: Root | undefined;
let activeForm: FormInstance | undefined;
let activeFixture: Fixture;
let editResult: Promise<number> | undefined;
const nextFrame = () => new Promise<void>((resolve) => requestAnimationFrame(() => resolve()));
async function settle() {
  await nextFrame();
  await nextFrame();
}
function Fields({ fixture, progressive }: { fixture: Fixture; progressive: boolean }) {
  const { formConfig } = useDynamicConfig({ template: fixture.template, fields: fixture.fields });
  return <FormComponent formConfig={formConfig} progressive={progressive} rowsPerBatch={3} />;
}
function BenchmarkForm({ fixture, progressive }: { fixture: Fixture; progressive: boolean }) {
  const [form] = Form.useForm();
  useLayoutEffect(() => {
    activeForm = form;
    return () => {
      activeForm = undefined;
    };
  }, [form]);
  return (
    <ConfigProvider>
      <DynamicForm form={form} name="benchmark" initialValues={fixture.initialValues}>
        <Fields fixture={fixture} progressive={progressive} />
      </DynamicForm>
    </ConfigProvider>
  );
}
window.runFormBenchmark = async ({ count, progressive, kind }) => {
  root?.unmount();
  await settle();
  activeFixture = createFixture(count, kind); // Fixture generation is outside the mount timer.
  const longTasks: number[] = [];
  const longObserver = PerformanceObserver.supportedEntryTypes.includes('longtask')
    ? new PerformanceObserver((list) => list.getEntries().forEach((entry) => longTasks.push(entry.duration)))
    : undefined;
  longObserver?.observe({ entryTypes: ['longtask'] });
  let firstCommit = 0,
    allCommitted = 0;
  const started = performance.now();
  await new Promise<void>((resolve, reject) => {
    const timeout = setTimeout(() => {
      observer.disconnect();
      reject(new Error('Mount timed out.'));
    }, 120000);
    const observer = new MutationObserver(() => {
      const mounted = container.querySelectorAll('.ant-form-item-control').length;
      if (mounted > 0 && firstCommit === 0) firstCommit = performance.now() - started;
      if (mounted === count) {
        allCommitted = performance.now() - started;
        observer.disconnect();
        clearTimeout(timeout);
        resolve();
      }
    });
    observer.observe(container, { subtree: true, childList: true });
    root = createRoot(container);
    root.render(<BenchmarkForm fixture={activeFixture} progressive={progressive} />);
  });
  await settle();
  const settledMs = performance.now() - started;
  longObserver?.disconnect();
  const registeredFields = activeForm?.getFieldsError().length ?? 0;
  if (registeredFields !== count) throw new Error('Incomplete field registration: ' + registeredFields);
  return {
    firstCommitMs: firstCommit,
    allCommittedMs: allCommitted,
    settledMs,
    mountedFields: container.querySelectorAll('.ant-form-item-control').length,
    registeredFields,
    domNodes: container.querySelectorAll('*').length,
    longTaskCount: longTasks.length,
    longestTaskMs: Math.max(0, ...longTasks),
    totalLongTaskMs: longTasks.reduce((sum, value) => sum + value, 0),
  };
};
window.startEditMeasurement = (value) => {
  const input = container.querySelector<HTMLInputElement>('#benchmark_field_0');
  if (!input || !activeForm) throw new Error('Form is not mounted.');
  editResult = new Promise<number>((resolve, reject) => {
    input.addEventListener(
      'input',
      () => {
        const start = performance.now();
        const deadline = start + 120000;
        const check = () => {
          const correct =
            activeFixture.kind === 'linked'
              ? Array.from({ length: activeFixture.count - 1 }, (_, i) => i + 1).every(
                  (i) => activeForm?.getFieldValue('field_' + i) === Number(value) * i,
                )
              : activeForm?.getFieldValue('field_0') === value;
          if (correct) {
            void settle().then(() => resolve(performance.now() - start));
          } else if (performance.now() > deadline) reject(new Error('Dependency update timed out.'));
          else requestAnimationFrame(check);
        };
        requestAnimationFrame(check);
      },
      { once: true, capture: true },
    );
  });
};
window.finishEditMeasurement = () => {
  if (!editResult) throw new Error('No edit measurement started.');
  return editResult;
};
window.validateBenchmark = async () => {
  const start = performance.now();
  await activeForm?.validateFields();
  return performance.now() - start;
};
window.benchmarkReady = true;
