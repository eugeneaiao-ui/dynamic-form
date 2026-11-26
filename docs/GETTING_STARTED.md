# 快速开始

[返回首页](../README.md) · [配置手册](CONFIGURATION.md) · [常用场景](RECIPES.md)

目标：在已有 React + TypeScript 项目中，用配置生成一张带必填校验的表单。以下默认 React 18 + AntD 5；兼容范围与 AntD 4 日期适配见[迁移指南](MIGRATION.md)。

## 第一步：获取安装包

本库当前未发布 npm。先在库仓库构建：

```bash
git clone https://github.com/eugeneaiao-ui/dynamic-form.git
cd dynamic-form
# 迁移 PR 合并前，先执行：git checkout codex/extract-dynamic-form-library
npm ci
npm run build
npm pack
```

当前版本会生成 eugeneaiao-ui-dynamic-form-0.1.0.tgz，使用终端输出的实际文件名。npm pack 也会通过 prepack 重新构建，避免打包过期产物。

回到使用方项目：

```bash
npm install /absolute/path/eugeneaiao-ui-dynamic-form-0.1.0.tgz
```

已有 React / AntD 的项目沿用兼容版本。新项目可安装已验证组合：

```bash
npm install react@18.3.1 react-dom@18.3.1 antd@5.27.6
npm install --save-dev typescript@5.9.3 @types/react@18 @types/react-dom@18
```

只用纯 TypeScript 引擎时，从 `@eugeneaiao-ui/dynamic-form/core` 导入，无需安装 UI peer。

## 第二步：导入样式

在使用方入口文件中导入：

```tsx
// AntD 5 的可选全局 reset；若宿主已有 reset，可沿用宿主设置。
import 'antd/dist/reset.css';
// 必须导入本库样式，供预览、快照等使用。
import '@eugeneaiao-ui/dynamic-form/style.css';
```

AntD 4 使用 `antd/dist/antd.css`，而不是上述 reset 路径。

## 第三步：建立配置与表单组件

新增 src/ProfileForm.tsx。完整示例见[仓库源码](../examples/quick-start/ProfileForm.tsx)，下面的示例与源码同步检查。仓库示例通过 ../../src 引用开发中的实现，使用方改用包名；下面的代码已完成这一替换。

<!-- example: examples/quick-start/ProfileForm.tsx -->

```tsx
import React from 'react';
import { Button } from 'antd';
import { DynamicForm, FormComponent, FormFieldType, useDynamicConfig } from '@eugeneaiao-ui/dynamic-form';
import type { FormConfigFields, FormTemplate } from '@eugeneaiao-ui/dynamic-form';

export interface ProfileValues {
  name: string;
  country: string;
  notes?: string;
}

const template: FormTemplate<ProfileValues> = [
  { name: 'name', type: FormFieldType.Input, span: 12 },
  { name: 'country', type: FormFieldType.Select, span: 12 },
  { name: 'notes', type: FormFieldType.TextArea },
];

const fields: Record<string, FormConfigFields<ProfileValues>> = {
  name: {
    label: 'Name',
    rules: [{ required: true, message: 'Please enter your name.' }],
    componentProps: { placeholder: 'Alex' },
  },
  country: {
    label: 'Country',
    rules: [{ required: true, message: 'Please select a country.' }],
    componentProps: {
      allowClear: true,
      options: [
        { label: 'Singapore', value: 'SG' },
        { label: 'Philippines', value: 'PH' },
      ],
    },
  },
  notes: {
    label: 'Notes',
    tooltip: 'Additional information, up to 200 UTF-16 code units.',
    componentProps: { rows: 3, maxLength: 200, showCount: true },
  },
};

function ProfileFields() {
  const { formConfig } = useDynamicConfig<ProfileValues>({ template, fields });
  return <FormComponent formConfig={formConfig} />;
}

export function ProfileForm({ onSubmit }: { onSubmit: (values: ProfileValues) => void }) {
  return (
    <DynamicForm<ProfileValues> initialValues={{ country: 'SG' }} onFinish={onSubmit}>
      <ProfileFields />
      <Button type="primary" htmlType="submit">
        Submit
      </Button>
    </DynamicForm>
  );
}
```

这里有三层：

1. template 控制字段顺序、类型和布局；span: 12 表示占一行的一半。
2. fields 用相同名称补充标签、校验、选项及控件参数。
3. 子组件调用 useDynamicConfig，FormComponent 渲染结果；DynamicForm 提供 Context 与提交能力。

不要在返回 DynamicForm 的同一层组件里提前调用依赖 Context 的 Hook，Context 必须由祖先提供。

## 第四步：挂载与提交

在现有页面挂载 ProfileForm：

```tsx
import React from 'react';
import { ProfileForm } from './ProfileForm';

export function App() {
  return <ProfileForm onSubmit={(values) => console.log('Validated values:', values)} />;
}
```

点击 Submit 时先执行校验：未填写 Name 会提示错误，不会调用 onSubmit；填写后会得到类似结果：

```json
{
  "name": "Alex",
  "country": "SG",
  "notes": "Example note"
}
```

将 console.log 替换为你自己的保存接口调用。表单不会自动请求保存接口。

## 第五步：验证常见修改

| 想修改什么         | 改哪里                                         |
| ------------------ | ---------------------------------------------- |
| 一行放三个字段     | template 的 span 改成 8                        |
| 调整字段顺序       | 调整 template 数组顺序                         |
| 添加必填项         | fields 对应字段的 rules                        |
| 修改输入框提示     | fields 对应字段的 componentProps.placeholder   |
| 下拉框改成接口选项 | 配置 dataSource，并注入 DataSourceManager      |
| 增加字段           | 扩展 Values、template 和 fields                |
| 查看但不编辑       | DynamicForm 的 displayMode={FormMode.preview}  |
| 回填接口结果       | 给 DynamicForm 传 form，用 form.setFieldsValue |
| 通过外部按钮提交   | 使用同一个 form 调用 form.submit()             |

可先在仓库 npm run dev 中体验完整 playground。上面最小示例是独立源码，不会默认替换 playground 页面。

## TypeScript 配置

库提供自己的声明，不需要额外安装 @types 包；React 的类型仍由使用方安装。现代 Vite / TS 5 项目可沿用现有配置，关键配置例如：

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "moduleResolution": "Bundler",
    "jsx": "react-jsx",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "noEmit": true
  }
}
```

TS 4.9 项目不支持 Bundler 解析策略，应沿用 Node 或 NodeNext 等受支持的 moduleResolution。顶层 name 会受 Values 键名约束；嵌套字段使用数组路径，见[配置手册](CONFIGURATION.md#布局和嵌套名称)。

## 下一步

- [配置手册](CONFIGURATION.md)：查属性、默认值和规则。
- [常用场景](RECIPES.md)：自动计算、级联、回填、扩展组件和快照。
- [常见问题](FAQ.md)：查不刷新、样式、日期和校验问题。
