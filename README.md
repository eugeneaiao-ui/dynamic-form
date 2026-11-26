# Dynamic Form

独立的 TypeScript 动态表单库：纯配置引擎 + React / Ant Design 渲染适配器。支持模板与字段配置合并、中间件、字段联动、异步选项、编辑 / 预览 / 快照，以及自定义控件。

业务接口、状态管理、上传组件和权限服务通过适配器注入，不包含具体业务模块。

## 本地运行

开发环境：Node.js 20.19+ 或 22.12+。

```bash
npm ci
npm run dev
npm run check
npm run test:package
```

演示包含异步级联选项、属性联动、运行时增删字段、三种表单模式与提交校验。

## 构建与安装

```bash
npm run build
npm pack
# 在使用方项目中安装生成的 .tgz
npm install /absolute/path/eugeneaiao-ui-dynamic-form-0.1.0.tgz
```

包名预设为 `@eugeneaiao-ui/dynamic-form`，尚未发布到 npm。支持 ESM / CommonJS，两个格式均提供类型声明。

| 入口                                    | 用途                                 | 依赖                        |
| --------------------------------------- | ------------------------------------ | --------------------------- |
| `@eugeneaiao-ui/dynamic-form/core`      | 配置生成、布局、依赖计算、数据源管理 | 无 React / Ant Design 依赖  |
| `@eugeneaiao-ui/dynamic-form`           | React hooks 和 Ant Design 组件       | React、ReactDOM、Ant Design |
| `@eugeneaiao-ui/dynamic-form/antd`      | 同上，显式适配器入口                 | 同上                        |
| `@eugeneaiao-ui/dynamic-form/style.css` | 库自身的布局与快照样式               | 显式导入                    |

UI 适配器支持 React 16.14 / 18 / 19、Ant Design 4.24 / 5；具体配对验证见下方。UI peer dependencies 标记为 optional，以便只使用 core 的项目无需安装 UI 框架；使用 UI 入口时需自行安装三个 peer。Ant Design 4 的日期控件需要注入 moment 适配器，见[迁移指南](docs/MIGRATION.md)。

## 基础示例

```tsx
import { DynamicForm, FormComponent, FormFieldType, useDynamicConfig } from '@eugeneaiao-ui/dynamic-form';
import type { FormConfigFields, FormTemplate } from '@eugeneaiao-ui/dynamic-form';
import '@eugeneaiao-ui/dynamic-form/style.css';

interface Values {
  name: string;
  amount: number;
}

const template: FormTemplate<Values> = [
  { type: FormFieldType.Input, name: 'name', span: 12 },
  { type: FormFieldType.NumberInput, name: 'amount', span: 12 },
];
const fields: Record<string, FormConfigFields<Values>> = {
  name: { label: 'Name', rules: [{ required: true }] },
  amount: { label: 'Amount', componentProps: { min: 0 } },
};

function Fields() {
  const { formConfig } = useDynamicConfig<Values>({ template, fields });
  return <FormComponent formConfig={formConfig} />;
}

export function Example() {
  return (
    <DynamicForm<Values> onFinish={(values) => console.log(values)}>
      <Fields />
      <button type="submit">Submit</button>
    </DynamicForm>
  );
}
```

Hooks 需在 Provider 之下执行。外部页面需要提前获取配置或 form 时，可使用 `DynamicFormProvider` 包裹页面，再在页面内渲染 `DynamicForm`。也保留 `withDynamicForm` 用法。

`FormFieldType` 包括 Input、NumberInput、Select、RichTextSelect、TextArea、Date、Custom、Span、Title。Span 只占栅格位置，不生成表单字段。RichTextSelect 默认使用标准 Select，可注册专用控件覆盖。

## 联动与数据源

```tsx
import { DataSourceManager, DataSourceType, DependentTypeEnum } from '@eugeneaiao-ui/dynamic-form';

const sources = new DataSourceManager();
sources.register('countries', {
  type: DataSourceType.INLINE,
  options: [{ label: 'Singapore', value: 'SG' }],
});

const address = {
  label: 'Address',
  dependenciesConfig: {
    type: DependentTypeEnum.ATTRIBUTE,
    dependsOn: ['country'],
    calculate: ([country]: unknown[]) => ({ disabled: !country }),
  },
};
```

将 `dataSources={sources}` 传给 Provider / DynamicForm；字段通过 `dataSource: 'countries'` 使用注册项。支持 INLINE、API、STORE、CEPT 数据源。API 默认为 fetch，业务请求客户端通过构造参数覆盖；STORE / CEPT 分别读取注入的 `dataContext.store` / `dataContext.enums`。

`dependsOn` 的顺序与 calculate 参数顺序一致；空字符串、false、0 和 null 都会触发联动。异步选项和依赖计算会取消旧请求、丢弃旧结果。API 参数引用其他字段时，必须显式声明 `dependsOn`。

## 模式和自定义组件

`displayMode={FormMode.edit | preview | snapshot}` 控制模式。快照通过 `createSnapshotMiddleware(before, after)` 注入前后值。预览优先使用 `previewRender`，快照优先使用 `snapshotRender`。

`ComponentRegistry` 可为控件分别注册 edit / preview / snapshot 实现，使用 `registry` 注入。上传、富文本、金额等业务控件由宿主注册。单个组件注册会在三种模式复用；只读模式会传入 disabled，控件应遵守它。

详细用法见[API 说明](docs/API.md)和[迁移指南](docs/MIGRATION.md)。

## 引擎改进

- core 独立于 React、Ant Design、状态管理和请求 SDK。
- 配置生成不修改输入对象；模板、字段、中间件更新立即生效。
- 权限 false、数值 0、空字符串与 null 保留原意。
- 数据源和自定义组件可按表单实例隔离，注册项支持释放。
- 异步任务支持 AbortSignal，避免旧响应覆盖新值和卸载后更新。
- 同步中间件防止重复 next；异步业务逻辑移到数据源或依赖计算。
- 严格类型声明、嵌套字段路径、安全路径检查、完整的双模块输出。
- 默认完整渲染，避免分批挂载时遗漏尚未挂载字段的校验；长表单可显式开启 progressive。

## 验证

`npm run check` 执行严格类型检查、ESLint、核心与 React 回归测试、库构建和演示构建。

`npm run test:package` 将实际 tarball 安装到隔离项目，验证：

- core-only 安装无 React / Ant Design；
- React 16.14 + Ant Design 4.24、React 18.3 + Ant Design 5.27、React 19.1 + Ant Design 5.27；
- ESM / CommonJS 导入、服务端渲染、两种模块格式的使用方类型检查、CSS 入口。

CI 执行相同检查并上传构建产物，不自动发布 npm。

## 许可

仓库尚未选定开源许可证，当前包标记为 UNLICENSED。
