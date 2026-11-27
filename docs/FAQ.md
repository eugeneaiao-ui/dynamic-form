# 常见问题

[返回首页](../README.md) · [配置手册](CONFIGURATION.md)

## npm install 找不到包？

使用 npm install forminojs，并检查 registry 是否为 [npm 官方 registry](https://registry.npmjs.org/)。从旧包 @eugenedfsfsvg/dynamic-form 迁移时，同步替换 import 和样式路径，详见[迁移指南](MIGRATION.md)。本地试用未发布改动时，可 npm run build、npm pack 后安装 .tgz。

## Hook 提示必须在 DynamicForm / Provider 内？

React Context 只对其子组件生效。不要在同一个组件里先调用 Hook 再返回 Provider 包裹它：

```tsx
function Fields() {
  const { formConfig } = useDynamicConfig({ template, fields });
  return <FormComponent formConfig={formConfig} />;
}
// 父组件返回 <DynamicForm><Fields /></DynamicForm>
```

useDynamicConfig 单独使用可以生成配置，但读取表单 Context 的其他 hooks 与渲染组件必须处于 Provider 内。外部页面需要表单实例时，可用 DynamicFormProvider 包裹页面。

## 改了 fields，为什么没有变化？

不要修改原对象中的属性。创建新 fields / template 引用，依赖 props 时用 useMemo；不要手动改 builderRef 来驱动 React 页面。

## initialValues 为什么不跟着接口变化？

initialValues 只初始化。异步详情用同一个 form 实例调用 setFieldsValue，参见[回填示例](RECIPES.md#3-接口详情回填与提交)。

## 改国家后城市不刷新，或者还选中旧城市？

在城市源上声明 dependsOn: ['country']，只写 params 函数不会建立订阅。选项更新不会自动清空当前值，使用 onValuesChange 处理用户切换，并在程序回填时显式维护一致性。

## 切换字段后已编辑的值被覆盖？

依赖 calculate 在初次挂载也会执行。对于只应由用户操作触发的清空逻辑，使用 onValuesChange；计算型字段则需要保证 calculate 返回值就是希望保存的值。

## 为什么隐藏字段还挡住提交？

hidden 遵循 Ant Design 的保留与校验语义。同步移除 required 规则，或从 template 中移除字段；如果需要卸载后移除数据，再设置 preserve: false。隐藏字段外层 Col 仍占空间，完全移除布局要过滤模板项。

## 样式没有加载？

导入 `forminojs/style.css`。AntD 自身样式按宿主配置：AntD 5 可按需导入 antd/dist/reset.css；AntD 4 导入 antd/dist/antd.css。只有本库样式不足以替代 AntD 样式。

## 日期控件报错，或值类型不对？

AntD 5 默认用 dayjs；AntD 4 默认用 moment，必须注入对应 dateAdapter。Date 字段存储值通常为格式化字符串，编辑时才转换成日期对象。[日期适配](MIGRATION.md#ant-design-4-日期适配)。

## 数据源一直重新请求？

保持 DataSourceManager、source 描述与 dataContext 引用稳定。使用 useMemo，不要在每次渲染时创建新实例或新内联 source。数据变化才替换 dataContext。

## 能把完整配置保存成后端 JSON 吗？

字段名、枚举值、布局和普通属性可以序列化。calculate、select、中间件和 ReactNode 是代码，不能直接 JSON 序列化；在宿主通过受控名称映射到已注册函数和控件，不要对远程配置使用 eval。远程配置的类型、字段及组件名称由宿主校验。

## 是否自带权限接口、上传接口或请求缓存？

这些由宿主通过 registry / dataSources / dataContext 注入。permission 控制控件编辑状态，不能代替后端鉴权；缓存和重试可放在自定义 resolver 中。

## SSR 要注意什么？

每个请求创建独立注册表和数据源实例，避免全局写入用户数据。不要在配置生成的中间件里读 window 或发请求。SSR 不执行 effects，异步选项需要客户端加载，或宿主提前准备好数据再注入。
