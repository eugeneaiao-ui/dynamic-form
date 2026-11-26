# 常用场景

[返回首页](../README.md) · [配置手册](CONFIGURATION.md)

本文片段使用公共包入口；完整、参与类型检查的源码在 [recipes.tsx](../examples/configuration/recipes.tsx)。后续片段是局部配置，需要放回已建立的 DynamicForm / Fields 组件中。

## 1. 数量 × 单价自动计算

```tsx
import { DependentTypeEnum } from '@eugenedfsfsvg/dynamic-form';
import type { FormConfigFields } from '@eugenedfsfsvg/dynamic-form';

const fields: Record<string, FormConfigFields> = {
  quantity: { label: 'Quantity', componentProps: { min: 0 } },
  price: { label: 'Unit price', componentProps: { min: 0, precision: 2 } },
  total: {
    label: 'Total',
    componentProps: { disabled: true },
    dependenciesConfig: {
      type: DependentTypeEnum.COMPUTE,
      dependsOn: ['quantity', 'price'],
      calculate: ([quantity, price]) => Number(quantity ?? 0) * Number(price ?? 0),
    },
  },
};
```

模板中的这三个字段使用 FormFieldType.NumberInput。结果为 0 时也会写入；如果不希望缺值时计算，calculate 可先判断并返回 undefined。

## 2. 国家和城市级联

创建并注入 DataSourceManager，国家使用内联选项，城市配置 API 数据源：

```tsx
import { DataSourceManager, DataSourceType } from '@eugenedfsfsvg/dynamic-form';

interface Values {
  country?: string;
  city?: string;
}
const sources = new DataSourceManager<Values>();
sources.register('countries', {
  type: DataSourceType.INLINE,
  options: [
    { label: 'Singapore', value: 'SG' },
    { label: 'Philippines', value: 'PH' },
  ],
});
sources.register('cities', {
  type: DataSourceType.API,
  url: '/api/cities',
  dependsOn: ['country'],
  params: (values) => ({ country: values.country }),
});
```

这里假设 /api/cities 返回 `[{ label: 'Central', value: 'central' }]`。其他响应格式需要 select；可参考完整源码里的响应校验与映射。

字段配置：

```tsx
const fields: Record<string, FormConfigFields<Values>> = {
  country: { label: 'Country', dataSource: 'countries' },
  city: {
    label: 'City',
    dataSource: 'cities',
    dependenciesConfig: {
      type: DependentTypeEnum.ATTRIBUTE,
      dependsOn: ['country'],
      calculate: ([country]: unknown[]) => ({ disabled: !country }),
    },
  },
};
```

sources 使用 useMemo 创建或放在客户端应用的稳定配置位置。通过 `<DynamicForm dataSources={sources}>` 注入。切换 country 会重新请求城市选项，旧请求结果会被丢弃。

**选项刷新不会自动清空已选城市。** 可在 DynamicForm 的 onValuesChange 中处理用户切换，避免首次挂载时覆盖编辑页回填值：

```tsx
const [form] = Form.useForm<Values>();

<DynamicForm<Values>
  form={form}
  dataSources={sources}
  onValuesChange={(changed) => {
    if (Object.prototype.hasOwnProperty.call(changed, 'country')) {
      form.setFieldValue('city', undefined);
    }
  }}
>
  <Fields />
</DynamicForm>;
```

Form 从 antd 导入。此行为仅处理用户输入；代码调用 setFieldsValue 切换国家时，由调用方同时处理 city。如果 API 不接受空 country，用自定义 resolver 在参数为空时返回 []。

## 3. 接口详情回填与提交

```tsx
import { useEffect } from 'react';
import { Form } from 'antd';

const [form] = Form.useForm<Values>();

useEffect(() => {
  const controller = new AbortController();
  void fetch('/api/profile', { signal: controller.signal })
    .then((response) => {
      if (!response.ok) throw new Error('Failed to load profile.');
      return response.json() as Promise<Values>;
    })
    .then((values) => {
      if (!controller.signal.aborted) form.setFieldsValue(values);
    })
    .catch((error: unknown) => {
      if (!controller.signal.aborted) console.error(error);
    });
  return () => controller.abort();
}, [form]);

// <DynamicForm form={form} onFinish={saveProfile}><Fields /></DynamicForm>
```

将 Hook 放在页面组件内，按实际接口校验 Values 结构。保存函数 saveProfile 由宿主实现；只在 onFinish 保存，避免跳过 required 等校验。外部工具栏提交可调用 form.submit()。

## 4. 自定义 Checkbox 与 checked 绑定

```tsx
import React, { useMemo } from 'react';
import { Checkbox } from 'antd';
import { ComponentRegistry, FormFieldType } from '@eugenedfsfsvg/dynamic-form';

function ConsentEditor(props: React.ComponentProps<typeof Checkbox>) {
  return <Checkbox {...props}>I agree</Checkbox>;
}

const registry = useMemo(() => {
  const instance = new ComponentRegistry();
  instance.register('Consent', ConsentEditor);
  return instance;
}, []);

// 字段（加入 template / fields）：
const field = {
  name: 'consent',
  type: FormFieldType.Custom,
  componentName: 'Consent',
  valuePropName: 'checked',
};
```

useMemo 在组件中执行，并将 registry 传给 DynamicForm。控件必须响应 disabled 和 Form.Item 注入的 onChange；非标准事件可用 getValueFromEvent 转换。

如果要强制勾选，单纯 required 不足以表达“必须为 true”，应使用 validator 判断 checked === true。完整源码包含这一规则，并分别注册编辑、预览和快照控件。

业务控件也可以注册为 `{ edit, preview, snapshot }`。预览 / 快照未提供时会复用 edit 并传 disabled=true。注册表不包含业务上传、富文本或金额控件的实现，需要宿主提供。

## 5. 切换编辑、预览与快照

父组件持有 mode，通过 displayMode 传给 DynamicForm：

```tsx
const [mode, setMode] = useState(FormMode.edit);
// <DynamicForm displayMode={mode}><Fields mode={mode} /></DynamicForm>
// 按钮：onClick={() => setMode(FormMode.preview)}
```

Fields 在快照模式注入前后数据：

```tsx
const middlewares = useMemo(
  () => (mode === FormMode.snapshot ? [createSnapshotMiddleware<Values, FormConfigFields<Values>>(before, after)] : []),
  [mode, before, after],
);
const { formConfig } = useDynamicConfig<Values>({ template, fields, middlewares });
```

before / after 使用与 form 相同的字段路径，并保持不可变更新。快照配置本身不替代表单当前值；传 initialValues / setFieldsValue 回填 after，便于预览与编辑模式使用。

字段可自行覆盖显示：

```tsx
const amountField: FormConfigFields = {
  previewRender: (value) => <strong>{Number(value ?? 0).toFixed(2)}</strong>,
  snapshotRender: ({ before, after }) => (
    <span>
      {String(before ?? '')} → {String(after ?? '')}
    </span>
  ),
};
```

自定义 snapshot 控件应读取 snapshotValues.before / after；普通内置控件默认显示差异。

## 6. 动态增删字段与空白占位

```tsx
const currentTemplate = useMemo<FormTemplate<Values>>(
  () => (showNotes ? [...baseTemplate, { name: 'notes', type: FormFieldType.TextArea }] : baseTemplate),
  [showNotes],
);
```

Values 需要声明 notes 字段。AntD 默认保留卸载字段值；希望卸载后删除其值时，在该字段设置 preserve: false，或显式清理表单数据。

想保留原本的位置，可以将对应模板项替换成 `{ type: FormFieldType.Span, span: 8 }`。Span 不需要假字段名，也不会出现在提交数据中。

## 7. 只使用 core

```ts
import { FormConfigBuilder, FormFieldType } from '@eugenedfsfsvg/dynamic-form/core';

const config = new FormConfigBuilder([{ type: FormFieldType.Input, name: 'name', span: 12 }], {
  name: { label: 'Name' },
}).build();

console.log(config);
// [{ type: 'Input', name: 'name', span: 12, label: 'Name' }]
```

core 只生成和处理配置，不渲染 DOM。使用你自己的渲染器时，从 core 导入 FieldConfig / FormTemplate 类型；UI 入口的 FormConfigFields 包含 Ant Design Form.Item 类型。
