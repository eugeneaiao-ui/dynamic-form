# 从业务项目迁移

本库从现有动态表单实现抽离并整理。原业务项目暂不替换依赖；先以 tarball 在使用方验证，再逐步替换引擎导入。配置中的业务枚举、接口、权限判断和专用控件仍由使用方维护。

## 从旧 npm 包迁移到 Formino

旧包 @eugenedfsfsvg/dynamic-form@0.1.0 仍可使用；新包名为 formino。

1. 卸载 @eugenedfsfsvg/dynamic-form，安装 formino。
2. 将根入口和 /core、/antd、/style.css、/schemas/form-definition.schema.json 的包名前缀改为 formino。
3. 组件、Hook、类型、字段配置及数据源 API 保持不变，无需重写表单。

GitHub 仓库改名为 eugeneaiao-ui/formino，旧链接由 GitHub 重定向。新包源码标签为 formino-v0.1.0；旧包标签 v0.1.0 保留。

## 导入映射

| 原有能力                                  | 独立库                                               |
| ----------------------------------------- | ---------------------------------------------------- |
| useDynamicConfig                          | 根入口同名导出，另保留 useDynamicForm 别名           |
| FormComponent                             | 根入口同名导出，另保留 FormDetailFields 别名         |
| withDynamicForm / Provider                | withDynamicForm / DynamicFormProvider / FormProvider |
| FormMode / FormFieldType / DataSourceType | 根入口或 core 入口同名枚举                           |
| FormTemplate / FormConfigFields           | React 适配器类型，支持 Values 泛型                   |
| FormConfigBuilder / MiniMiddleware        | core 同名导出                                        |
| guideMiddleware / snapshotMiddleware      | core 同名导出，新增 createSnapshotMiddleware 工厂    |
| DataSourceManager                         | 实例优先，静态注册方法仍绑定默认实例                 |
| registerCustomComponents                  | 默认注册表快捷方法，推荐 ComponentRegistry 实例      |

兼容旧拼写 `middlewaries` 与 `snapshootValues`，新代码使用 `middlewares` 与 `snapshotValues`。仅保留引擎层 API，不包含业务项目组件或服务的替身。

## 替换步骤

1. 在使用方安装 npm 包 formino；验证未发布源码时，可 npm run build、npm pack 后安装 tarball。
2. 替换引擎 import，显式导入库的 style.css。现有 Ant Design 全局样式仍由宿主加载。
3. 将专用控件注册到 ComponentRegistry，将请求、枚举、状态数据注入 DataSourceManager / dataContext。
4. 对照下述差异调整配置，并验证新增、编辑、预览、快照、校验及异步联动。
5. 完成使用方验证后，再移除原引擎文件。当前迁移未删除或修改业务项目中的原实现。

## 业务请求适配

```tsx
import { DataSourceManager, DataSourceType } from 'formino';
import type { SelectOption } from 'formino';

interface Values {
  country: string;
}
const sources = new DataSourceManager<Values>({
  [DataSourceType.API]: async (source, context) => {
    if (source.type !== DataSourceType.API) return [];
    const params =
      typeof source.params === 'function' ? source.params(context.values ?? { country: '' }) : source.params;
    // 调用使用方已有的客户端；必须返回选项数组。
    const options: SelectOption[] = await loadOptions(source.url, params, context.signal);
    return options;
  },
});
```

`loadOptions` 由使用方实现。认证、接口包装结构和错误拦截属于宿主；本库不依赖业务 SDK。默认 fetch resolver 直接接收数组，或用 source.select 将响应转换为数组。旧的字段映射参数应改成 select / 自定义 resolver。

`dataContext` 的 store / enums / dependencyData 使用不可变更新；更新时传新对象。数据源和注册表建议在组件外创建，或通过 useMemo 创建。SSR 及多租户场景请为每个请求 / 表单创建独立实例，不向默认全局实例写入用户数据。

## 自定义控件

```tsx
const registry = new ComponentRegistry();
registry.register('FileUpload', {
  edit: FileUploadEditor,
  preview: FileUploadPreview,
  snapshot: FileUploadSnapshot,
});

// 字段
const field = {
  type: FormFieldType.Custom,
  name: 'attachments',
  componentName: 'FileUpload',
};
```

组件接收 value、onChange、name、displayMode、disabled 与 componentProps。快照额外接收 snapshotValues（以及兼容拼写 snapshootValues），字段 onLogRecord 会透传。库内未打包业务上传、金额或富文本控件；需要注册原控件及各模式实现。找不到自定义控件时会明确报错。

## Ant Design 4 日期适配

Ant Design 5 默认使用库内 dayjs 适配器。Ant Design 4 默认 DatePicker 使用 moment，需使用方注入：

```tsx
import moment from 'moment';
import type { DateAdapter } from 'formino';

const dateAdapter: DateAdapter = {
  parse: (value, format) => moment(value as moment.MomentInput, format),
  format: (value, format) => moment(value as moment.MomentInput).format(format),
};

<DynamicForm dateAdapter={dateAdapter}>{/* 配置字段 */}</DynamicForm>;
```

日期字段编辑时，将存储字符串转换成控件需要的日期对象，再按 componentProps.format（默认 YYYY-MM-DD）写回字符串。其他日期组件可注入自己的适配器。

## 行为差异

- 配置同步生成，移除固定延迟；请用 useMemo 保持模板、字段和中间件引用稳定。中间件必须纯粹，不能在配置生成时发请求或更新 React 状态。
- 中间件仍采用 next 链，未调用 next 会终止后续中间件。异步中间件会报错，异步工作放进 dataSource 或 dependenciesConfig.calculate。
- 权限和模式可受控，也可通过 Context setter 修改。false 不再被默认值覆盖。
- calculate 按 dependsOn 顺序接收值；依赖变为 false、0、空值时仍执行。返回 undefined 表示不写值；null 可显式清空。不再因空值跳过计算。
- 默认完整渲染表单。progressive 是长表单的可选优化，开启后在所有批次挂载前不要提交或校验整表。
- Span 为布局占位，不注册字段。hidden 字段遵循 Ant Design Form.Item 规则，仍保留数据与校验。
- 字符串字段名中的点按字面量处理；嵌套字段使用数组路径，如 ['profile', 'name']。嵌套字段定义以 fieldKey(path) 为 key，禁止原型污染路径。
- 旧配置中引擎以外的扩展属性应放入 meta 或使用方扩展字段类型，避免传给 DOM 或 Form.Item。
- 快照默认显示值差异。需要业务专用显示时用 snapshotRender，或注册 snapshot 控件。
