# API

[配置手册](CONFIGURATION.md) · [常用场景](RECIPES.md) · [返回首页](../README.md)

## 配置生成

`FormConfigBuilder<Values, Field>` 是纯 TypeScript 引擎，接受 template 与 fields。template 决定顺序、类型和栅格；fields 按字段 key 合并，字段定义优先于模板默认属性。中间件最终修改 context.fieldProps。

```ts
import { FormConfigBuilder, FormFieldType } from 'formino/core';

const config = new FormConfigBuilder([{ type: FormFieldType.Input, name: 'name', span: 12 }], {
  name: { label: 'Name' },
})
  .addMiddleware((context, next) => {
    context.fieldProps.componentProps = { placeholder: 'Enter a name' };
    next();
  })
  .build();
```

每次 build 克隆普通配置对象及数组，保留函数、React 元素和非普通控件值。中间件只应修改 fieldProps，不能修改外部对象或非普通值。setTemplate / setFields / setMiddlewares 替换配置，addMiddleware / addMiddlewareGroup / addMiddlewares 追加。

`useDynamicConfig<Values>({ template, fields, middlewares, dataSource })` 返回 formConfig、builderRef、form。Hooks 生成配置时读取 Provider 的 mode、permission、disabled、dataContext；无 Provider 时可生成纯配置，但 form 为 undefined。直接修改 builderRef 不会触发 React 渲染，React 页面应通过 hook 参数更新配置。

## 表单与上下文

`DynamicForm<Values>` 包装 Ant Design Form 与 DynamicFormProvider，支持 Form 的 initialValues、onFinish、onFinishFailed、layout、size 等属性。继承外层 Provider 的实例与配置，可显式覆盖。

`DynamicFormProvider<Values>` / `FormProvider` 管理：

| 属性                                                        | 默认值 / 含义                     |
| ----------------------------------------------------------- | --------------------------------- |
| form                                                        | 自动创建 FormInstance             |
| displayMode / defaultDisplayMode                            | 受控模式 / 初始 edit              |
| permission / defaultPermission                              | 受控权限 / 初始 true              |
| disabled / defaultDisabled                                  | 受控禁用 / 初始 false             |
| onDisplayModeChange / onPermissionChange / onDisabledChange | setter 通知使用方                 |
| registry                                                    | 默认组件注册表                    |
| dataSources                                                 | 默认数据源管理器                  |
| dataContext                                                 | 注入 store、enums、dependencyData |
| dateAdapter                                                 | dayjs 解析与格式化                |
| onError                                                     | 异步数据源 / 依赖错误回调         |

`useDynamicFormContext<Values>()` 返回以上状态、form 和 setDisplayMode / setPermission / setDisabled。受控模式下 setter 调用回调，由父组件更新受控属性。

`withDynamicForm<Props>(options)(Component)` 适用于页面级封装；options 是初始 mode、permission、disabled 和 registry。需要运行时受控配置时使用 Provider。

## 字段和布局

`FormConfigFields<Values>` 包含 core 字段配置与 Ant Design Form.Item 属性。通过 formItemProps 可传递额外 Form.Item 配置，name 由字段统一管理。componentProps 传给控件；value / onChange 等绑定属性由 Form.Item 注入。可用 valuePropName、getValueFromEvent 等标准机制适配非标准组件。

`FormComponent({ formConfig, title?, rowsPerBatch = 3, progressive = false, loading = false })` 根据 24 栅格渲染字段，FormDetailFields 为别名。每个字段 span 默认 24；溢出一行自动换行。Span 占位、Title 标题无需 name。普通字段必须有 name。

`parseFormLayout(fields, columns = 24)` 返回行数组；`splitIntoBatches(fields, title?, rowsPerBatch = 3)` 返回分批布局。非法 span 或批次大小会报错。

`name` 顶层字段受 Values 泛型约束；数组路径支持嵌套数据。使用 fieldKey(name) 生成嵌套 fields 字典 key。getValue / setValue 安全读取、不可变写入，拒绝 `__proto__`、`constructor`、`prototype` 等路径。

## 依赖计算

```ts
const dependency = {
  type: DependentTypeEnum.COMPUTE,
  dependsOn: ['quantity', 'price'],
  calculate: ([quantity, price]: unknown[]) => Number(quantity) * Number(price),
  applyTo: 'total',
  triggerValidate: true,
};
```

dependenciesConfig 可以是单个对象或数组：

| type                    | calculate                                                           |
| ----------------------- | ------------------------------------------------------------------- |
| ATTRIBUTE               | (依赖值数组, 当前 componentProps) => 属性补丁                       |
| COMPUTE / FETCH / STORE | (依赖值数组, dependencyData 或 store, signal) => 新字段值或 Promise |

applyTo 默认当前字段，triggerValidate 可以为 true 或需要校验的字段路径数组。undefined 不写入，false / 0 / null / 空字符串正常写入。异步计算完成后才应用结果，取消后不写入。纯 core 使用 resolveDependencies；React 渲染适配器内部负责订阅和执行联动。

## 数据源

DataSourceManager 的 register(name, descriptor) 返回 disposer；get 获取描述，resolve 加载选项。替换同名注册项时，旧 disposer 不会删除新项。subscribe / version 支持配置变更通知。构造参数按 DataSourceType 提供自定义 resolver。

- INLINE：options。
- API：url、GET / POST、params（对象或 values 函数）、headers、select(response)、dependsOn。
- STORE：module、可选 storeKey，读取 dataContext.store。
- CEPT：enumName，读取 dataContext.enums。

选项是 { label, value, disabled?, children? }。resolver 必须返回选项数组，否则明确报错；默认 API 对非成功 HTTP 状态报错。useDataSource(source, values?) 返回 options、loading、error，并执行取消与旧结果隔离。命名源更新会重新加载。

静态 registerDataSource / getDataSource / getDataSources 操作默认实例，便于渐进迁移。推荐实例注入；请求缓存、认证、重试和响应包装映射由宿主的 resolver 管理。

## 自定义控件、预览和快照

`ComponentRegistry.register(name, Component | { edit, preview?, snapshot? })` 返回 disposer；registerAll 批量注册。通过 componentName 选控件，也可用 FormFieldType 枚举值覆盖内置控件。registerCustomComponents 操作默认注册表。

预览和快照模式分别优先使用字段 previewRender(value) / snapshotRender({ before, after })，其次使用注册控件，最后使用内置显示。Select 会将值映射为 label，支持多选和 labelInValue。自定义控件找不到时抛出明确错误。

`createSnapshotMiddleware(before, after)` 生成快照中间件；snapshotMiddleware(context, next, before, after) 兼容直接调用。false、0、null 保留不丢失。默认快照以删除线和新增标记区分变更。

## 文本限制

TextArea 的 componentProps.maxLength 使用 UTF-16 长度，并避免截断 emoji 的代理对。showCount 显示相同计数；输入法组合阶段不截断，组合完成后应用长度限制。纯函数 sliceBySubmitLength 可在非 React 场景复用。
