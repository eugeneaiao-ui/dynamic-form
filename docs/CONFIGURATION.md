# 配置手册

[返回首页](../README.md) · [快速开始](GETTING_STARTED.md) · [常用场景](RECIPES.md) · [API](API.md)

图文操作见[示例教程](EXAMPLES.md)，长表单实测见[性能报告](PERFORMANCE.md)。

## 1. 一张表单的配置放在哪里？

```text
template      字段顺序、类型、每行占几列
fields        标签、校验、控件参数、数据源、联动
middlewares   批量调整最终配置
      ↓ useDynamicConfig
formConfig    最终字段数组
      ↓ FormComponent
DynamicForm   维护表单数据、模式并处理校验和提交
```

先把静态配置放在组件外；配置依赖 props / state 时用 useMemo。组件内不要原地修改已有配置对象，应生成新的 template / fields 引用。

### 模板与字段如何合并？

```tsx
import { FormFieldType } from 'forminojs';
import type { FormConfigFields, FormTemplate } from 'forminojs';

interface Values {
  name: string;
}
const template: FormTemplate<Values> = [{ name: 'name', type: FormFieldType.Input, span: 12, label: 'Default label' }];
const fields: Record<string, FormConfigFields<Values>> = {
  name: { label: 'Customer name', componentProps: { placeholder: 'Alex' } },
};
```

合并顺序：**template 单项 → fields 同名定义 → middlewares**。fields 不会新增 template 里不存在的字段；新增字段必须同时加入 template。

合并是浅层的：fields.componentProps 会整体覆盖 template.componentProps。需要保留属性时显式展开旧值。中间件也应使用 `{ ...context.fieldProps.componentProps, ...patch }` 合并。

## 2. 字段属性

| 配置                   | 默认 / 约束   | 作用                                             |
| ---------------------- | ------------- | ------------------------------------------------ |
| name                   | 普通控件必填  | 顶层字段用字符串，嵌套字段用数组路径             |
| type                   | 模板必填      | 使用 FormFieldType 枚举                          |
| span                   | 24；整数 1–24 | 每行总共 24，超过会自动换行                      |
| label                  | 可选          | Form.Item 标签，支持 ReactNode                   |
| rules                  | 可选          | Ant Design 校验规则数组                          |
| tooltip / extra / help | 可选          | 提示、说明、校验帮助                             |
| hidden                 | false         | 隐藏 Form.Item，仍遵循 AntD 的数据保留与校验规则 |
| componentProps         | 空对象        | 控件自身属性，如 placeholder、options、disabled  |
| formItemProps          | 可选          | 额外 Form.Item 配置；name 由引擎管理             |
| dataSource             | 可选          | 内联描述或已注册的数据源名称                     |
| dependenciesConfig     | 可选          | 单个或一组字段联动                               |
| componentName          | Custom 时使用 | 组件注册表中的名称                               |
| previewRender          | 可选          | 单字段预览显示函数                               |
| snapshotRender         | 可选          | 单字段快照显示函数                               |
| meta                   | 可选          | 使用方自己的配置元数据，不传给控件               |

### 字段类型

| 枚举           | 渲染           | 常用 componentProps                                     |
| -------------- | -------------- | ------------------------------------------------------- |
| Input          | Input          | placeholder、allowClear、maxLength                      |
| NumberInput    | InputNumber    | min、max、precision、step                               |
| Select         | Select         | options、mode、allowClear、showSearch、optionFilterProp |
| RichTextSelect | 默认 Select    | 可注册同名控件覆盖                                      |
| TextArea       | Input.TextArea | rows、autoSize、maxLength、showCount                    |
| Date           | DatePicker     | format，默认 YYYY-MM-DD                                 |
| Custom         | 已注册组件     | 与自定义组件约定的 props                                |
| Span           | 空白栅格       | 不注册表单字段，可以不填 name                           |
| Title          | 小标题         | 使用 label，可以不填 name                               |

Select 静态选项格式为 `{ label, value, disabled?, children? }`，value 为字符串或数字。多选使用 `mode: 'multiple'`；预览会将值转换成 label。

TextArea 配置 maxLength 后按 UTF-16 计数，避免截断 emoji 的代理对；输入法组合完成后再限制长度。

### 布局和嵌套名称

```tsx
import { fieldKey } from 'forminojs/core';

const emailPath = ['profile', 'email'];
// 模板项：{ name: emailPath, type: FormFieldType.Input, span: 16 }
// 留白项：{ type: FormFieldType.Span, span: 8 }
// 字段定义：
const fields = { [fieldKey(emailPath)]: { label: 'Email' } };
```

字符串 `'profile.email'` 是字面量字段名，不是嵌套路径。Span 用来明确保留空白位置；hidden 字段当前仍占外层 Col 的布局空间。若要同时移除控件和占位，应从 template 中过滤该项。表单条件字段的 required 规则也要同步调整，避免隐藏字段阻止提交。

## 3. 表单级配置

```tsx
<DynamicForm
  initialValues={{ country: 'SG' }}
  size="small"
  layout="vertical"
  displayMode={FormMode.edit}
  permission={true}
  disabled={false}
  onFinish={(values) => console.log(values)}
  onError={(error) => console.error(error)}
>
  <Fields />
</DynamicForm>
```

此片段接在已定义 Fields 的页面中。根组件支持 AntD Form 的 initialValues、form、onFinish、onFinishFailed 等属性。

| 属性                                                        | 说明                                         |
| ----------------------------------------------------------- | -------------------------------------------- |
| displayMode                                                 | 受控模式：FormMode.edit / preview / snapshot |
| defaultDisplayMode                                          | 非受控初始模式，默认 edit                    |
| permission / defaultPermission                              | 是否允许编辑，默认 true                      |
| disabled / defaultDisabled                                  | 是否禁用控件，默认 false                     |
| onDisplayModeChange / onPermissionChange / onDisabledChange | Context setter 的变更通知                    |
| registry                                                    | ComponentRegistry 实例                       |
| dataSources                                                 | DataSourceManager 实例                       |
| dataContext                                                 | store、enums、dependencyData                 |
| dateAdapter                                                 | 日期解析和格式化适配器                       |
| onError                                                     | 异步数据源及依赖计算的错误回调               |

最终禁用状态是表单 disabled、无 permission 或控件 disabled 任一成立。permission 管理 UI 编辑状态，接口权限仍由使用方服务端处理。

initialValues 用于初始化；详情接口异步回填使用 AntD form.setFieldsValue，不能通过重复修改 initialValues 刷新现有数据。模式是受控属性时，父组件也要更新对应状态。

FormComponent 接收 formConfig、title、loading、rowsPerBatch（默认 3）、progressive（默认 false）。progressive 开启时逐批挂载，所有字段挂载前不要做整表校验或提交。

## 4. 数据源

内联描述直接写在字段上，或先注册，再通过名称引用。两种方式都由 Provider / DynamicForm 的 dataSources 解析。

| 枚举                  | 必填属性 | 数据来自                          |
| --------------------- | -------- | --------------------------------- |
| DataSourceType.INLINE | options  | 本地选项数组                      |
| DataSourceType.API    | url      | 默认 fetch，支持覆盖请求 resolver |
| DataSourceType.STORE  | module   | dataContext.store[module]         |
| DataSourceType.CEPT   | enumName | dataContext.enums[enumName]       |

API 额外属性：

| 属性      | 默认 / 作用                                   |
| --------- | --------------------------------------------- |
| method    | GET；也支持 POST                              |
| params    | 对象或读取当前 values 的函数                  |
| dependsOn | params 依赖哪些表单字段；这些值改变会重新加载 |
| headers   | 当前请求的 headers                            |
| select    | 将 unknown 响应转换成 SelectOption[]          |

默认 GET 将 params 编码到 query，POST 使用 JSON body。默认响应应直接为选项数组；其他结构用 select 映射。只配置 params 函数不会自动订阅字段，必须同时配置 dependsOn。

```tsx
const sources = new DataSourceManager();
sources.register('departments', {
  type: DataSourceType.STORE,
  module: 'organization',
  storeKey: ['departments'],
});

const dataContext = {
  store: { organization: { departments: [{ label: 'Engineering', value: 'engineering' }] } },
  enums: { status: [{ label: 'Draft', value: 'draft' }] },
};
// <DynamicForm dataSources={sources} dataContext={dataContext}>...</DynamicForm>
// 字段：{ label: 'Department', dataSource: 'departments' }
```

同名注册项可更新，register 返回释放函数。源实例与 dataContext 应保持稳定；数据改变时生成新 dataContext。SSR 每个请求使用独立实例。请求取消需要自定义 resolver 透传 signal；即使 resolver 忽略取消，过期结果也不会应用。

内置 resolver 不做跨表单请求缓存或自动重试，按需要在使用方请求客户端中实现。业务请求适配见[迁移指南](MIGRATION.md#业务请求适配)。

## 5. 字段联动

```tsx
const fields: Record<string, FormConfigFields> = {
  total: {
    dependenciesConfig: {
      type: DependentTypeEnum.COMPUTE,
      dependsOn: ['quantity', 'price'],
      calculate: ([quantity, price]) => Number(quantity ?? 0) * Number(price ?? 0),
    },
  },
};
```

| 配置            | 说明                                                 |
| --------------- | ---------------------------------------------------- |
| type            | ATTRIBUTE / COMPUTE / FETCH / STORE                  |
| dependsOn       | 依赖路径数组；按声明顺序传给 calculate               |
| calculate       | ATTRIBUTE 返回属性补丁，其他类型返回字段值或 Promise |
| applyTo         | 写入目标字段，默认当前字段                           |
| triggerValidate | true 校验写入目标；也可给需要校验的字段路径数组      |

ATTRIBUTE 的第二个参数是当前 componentProps；COMPUTE / FETCH / STORE 的第二个参数是 dataContext.dependencyData，未提供时使用 dataContext.store，第三个参数是 AbortSignal。后三种类型使用相同执行机制，不会根据 FETCH / STORE 名称自动请求接口或读取仓库。

返回 undefined 表示不写入；返回 null 表示清空，0 / false / 空字符串都正常写入。函数初次挂载也会执行，编辑页不要无条件覆盖接口回填值。不要配置互相不断写入新值的循环依赖。

## 6. 中间件

```tsx
import type { FormMiddlewareContext, Middleware } from 'forminojs';

const compact: Middleware<FormMiddlewareContext> = (context, next) => {
  context.fieldProps.componentProps = { size: 'small', ...context.fieldProps.componentProps };
  next();
};
// useDynamicConfig({ template, fields, middlewares: [compact] })
```

中间件在渲染期间同步构建配置，应仅修改 fieldProps。不要发请求、调用 setState 或写表单值。异步工作放在数据源或依赖计算中。next 调用一次继续后续链，不调用则停止；重复调用会报错。

## 7. 扩展和显示模式

自定义组件注册、非 value 绑定、受控模式、快照和纯 core 用法见[常用场景](RECIPES.md)。AntD 4 的 moment 适配见[迁移指南](MIGRATION.md#ant-design-4-日期适配)。

兼容旧拼写 middlewaries、snapshootValues；新配置使用 middlewares、snapshotValues。
