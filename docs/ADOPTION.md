# 选择与接入 Formino

[快速开始](GETTING_STARTED.md) · [配置手册](CONFIGURATION.md) · [图文示例](EXAMPLES.md)

## 适合什么场景

| 场景                  | 接入方式                                                 | 先看什么                                            |
| --------------------- | -------------------------------------------------------- | --------------------------------------------------- |
| React / AntD 业务表单 | 配置 template、fields，使用 DynamicForm 和 FormComponent | [快速开始](GETTING_STARTED.md)                      |
| 数百字段的长表单      | 比较完整挂载与分批挂载，等待挂载完成后整表校验           | [图文示例](EXAMPLES.md)、[实测数据](PERFORMANCE.md) |
| 复杂字段联动          | 配置异步数据源、多级计算、动态属性与条件校验             | [常用场景](RECIPES.md)                              |
| 低代码应用的表单渲染  | 存储受支持的 JSON 配置，校验后交给适配器渲染             | [AI / 低代码接入](AI_INTEGRATION.md)                |
| AI 编程助手生成表单   | 提供 llms.txt、配置 Schema 和类型化示例作为上下文        | [AI / 低代码接入](AI_INTEGRATION.md)                |
| 只需要配置和依赖引擎  | 从 forminojs/core 导入，无需 React / AntD                | [API](API.md)                                       |

## 安装与版本入口

```bash
npm install forminojs
```

UI 入口依赖宿主的 React、ReactDOM 和 Ant Design；兼容范围见[快速开始](GETTING_STARTED.md)和[迁移指南](MIGRATION.md)。仓库名称是 Formino / formino，npm 包名是 forminojs。

[npm](https://www.npmjs.com/package/forminojs)提供已发布版本；[GitHub Releases](https://github.com/eugeneaiao-ui/formino/releases/latest)提供版本说明、匹配源码、安装包和校验文件。main 上的文档可包含尚未发版的维护改动，复现问题时应注明 npm 版本。

## 接入顺序

1. 运行最小表单，确认样式、默认值与提交校验。
2. 把业务请求封装成数据源适配器，再接入字段依赖。
3. 为复杂联动验证清空值、零值、异步取消和条件切换。
4. 使用实际控件和设备测量长表单；不要把示例机器的性能当成项目保证。
5. 在服务端验证提交内容与权限。

## 当前边界

- 提供表单引擎、React / AntD 适配器与示例，不包含完整拖拽编辑器或 LLM 后端。
- JSON 配置 Schema 描述本项目支持的配置子集，不是任意 JSON Schema 的通用表单生成器。
- 分批挂载最终会保留全部字段，不是虚拟列表。
- 客户端校验、隐藏和禁用不能替代服务端校验与授权。

## 遇到问题

配置和接入问题到 [Discussions](https://github.com/eugeneaiao-ui/formino/discussions)；可以稳定复现的缺陷到 [Issues](https://github.com/eugeneaiao-ui/formino/issues/new/choose)。提供最小配置和依赖版本，避免附上真实业务数据。更多说明见 [SUPPORT](../SUPPORT.md)。
