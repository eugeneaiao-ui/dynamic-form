# Formino — 配置驱动的表单引擎

[![npm version](https://img.shields.io/npm/v/forminojs?color=315efb)](https://www.npmjs.com/package/forminojs) [![MIT license](https://img.shields.io/github/license/eugeneaiao-ui/formino)](https://github.com/eugeneaiao-ui/formino/blob/main/LICENSE) [![GitHub release](https://img.shields.io/github/v/release/eugeneaiao-ui/formino)](https://github.com/eugeneaiao-ui/formino/releases/latest)

[在线文档](https://eugeneaiao-ui.github.io/formino/) · [在线示例](https://eugeneaiao-ui.github.io/formino/playground/) · [Release](https://github.com/eugeneaiao-ui/formino/releases/latest) · [Discussions](https://github.com/eugeneaiao-ui/formino/discussions) · [Support](https://github.com/eugeneaiao-ui/formino/blob/main/SUPPORT.md) · [Adoption guide](https://github.com/eugeneaiao-ui/formino/blob/main/docs/ADOPTION.md)

[English](https://github.com/eugeneaiao-ui/formino/blob/main/README.en.md) · [快速开始](https://github.com/eugeneaiao-ui/formino/blob/formino-v0.1.0/docs/GETTING_STARTED.md) · [配置手册](https://github.com/eugeneaiao-ui/formino/blob/formino-v0.1.0/docs/CONFIGURATION.md) · [常用场景](https://github.com/eugeneaiao-ui/formino/blob/formino-v0.1.0/docs/RECIPES.md) · [API](https://github.com/eugeneaiao-ui/formino/blob/formino-v0.1.0/docs/API.md)

面向 React / Ant Design 的 TypeScript **配置驱动表单引擎**。用配置描述字段、布局、校验和数据源，由共享引擎负责配置合成、字段依赖和表单渲染。

## 为什么创建 Formino

我创造 Formino 的初衷，是让表单先成为一份可读、可管理、可传递的定义。新增或调整一张表单时，开发者可以围绕业务需要修改配置，复用已经建立的渲染和交互能力。

**配置驱动是 Formino 的设计出发点。长表单、复杂联动、预览和快照，是这一模型支撑的具体特性。**

## 配置与渲染分离

表单定义表达“有哪些字段、如何排列、遵守什么规则”；渲染层实现“如何显示控件、连接状态并处理交互”。两者通过明确的配置契约协作。

```text
业务需求 / 人工编辑 / AI 生成
              ↓
表单定义（本地 TypeScript / 后端下发的受支持 JSON）
              ↓
宿主校验与适配 → Formino 配置引擎
              ↓
React / Ant Design 渲染、校验与交互
```

| 分工                 | 负责什么                                                   |
| -------------------- | ---------------------------------------------------------- |
| 表单配置             | 字段、布局、规则、选项和受支持的数据源引用                 |
| Formino 引擎与适配层 | 合成配置、处理字段依赖，复用控件渲染、表单状态和显示模式   |
| 宿主应用             | 配置来源、存储与发布策略、业务接口、自定义控件和函数型逻辑 |

在配置模型中，`template` 定义字段顺序、类型和布局，`fields` 定义标签、校验和控件属性。通用能力集中在引擎，业务差异通过配置和宿主适配器接入。

### 配置可以放到后端

当表单定义可以序列化，后端就可以保存、按场景下发和管理不同版本的配置，前端复用同一套渲染实现。这为配置审核、版本管理和多个页面复用定义提供了基础。

在现有控件和规则已经支持的范围内，调整字段、布局或校验可以通过更新配置完成；新增控件或执行逻辑仍由应用代码实现。持久化时使用项目支持的 **JSON 配置子集**，函数、自定义组件和高级联动通过可信的 TypeScript 配置及宿主注册机制接入。

后端的存储、权限与发布服务由宿主实现。Formino 提供配置契约、引擎和接入示例，详见 [JSON 配置与后端接入](https://github.com/eugeneaiao-ui/formino/blob/main/docs/AI_INTEGRATION.md)。

### 给 AI 一个稳定的配置契约

配置驱动也让 AI 生成表单有了更明确的目标：提供配置契约、相关示例和业务需求，让模型生成或修改表单定义，复用引擎中已经实现的渲染与交互。这种分工的目标，是降低 AI 重复理解、推理和生成表单实现的成本。

- **减少重复上下文**：模型可以围绕相关字段、规则和已注册能力工作，减少反复理解页面实现细节的需要。
- **减少重复生成**：复用渲染器，减少为每张表单生成相似 JSX、状态连接和事件处理代码。
- **缩小修改范围**：字段和规则变化可以体现为配置差异，便于校验、审查和继续修改。

这里希望降低的是上下文规模、输出 token 和修改迭代的开销。实际收益取决于任务、模型和配置大小，项目目前没有发布 AI 成本对照基准。模型输出需要按契约校验，再交给宿主适配和渲染。

## 这一模型支持的特性

- **长表单**：演示支持 100 / 300 / 1000 字段、完整或分批挂载、整表校验；提供浏览器性能数据和原始样本。
- **复杂联动**：异步下拉级联、多阶段计算、动态禁用和条件校验。
- **多种显示模式**：复用字段定义，渲染编辑、预览和快照。
- **宿主扩展**：注入自定义组件、业务数据源、状态数据和日期适配器。
- **独立 core**：配置引擎无 React / Ant Design 依赖；库提供 ESM、CommonJS 及类型声明。
- **动态更新**：配置变更生效，异步联动会丢弃过期结果。

查看[图文示例](https://github.com/eugeneaiao-ui/formino/blob/formino-v0.1.0/docs/EXAMPLES.md)和[性能测量报告](https://github.com/eugeneaiao-ui/formino/blob/formino-v0.1.0/docs/PERFORMANCE.md)，了解具体操作、数据和适用边界。

![300 字段长表单及完整挂载计数](https://raw.githubusercontent.com/eugeneaiao-ui/formino/formino-v0.1.0/docs/images/long.png)

## 低代码与 AI 接入

- 低代码渲染层：存储受支持的 JSON 定义，接入校验、渲染和提交。
- AI 生成配置：提供 [Formino 配置 Schema](https://github.com/eugeneaiao-ui/formino/blob/formino-v0.1.0/schemas/form-definition.schema.json)，先校验输出，再渲染。
- AI 编程助手：使用 [llms.txt](https://github.com/eugeneaiao-ui/formino/blob/main/llms.txt)、API 和示例作为上下文，生成 TypeScript 配置或受支持的 JSON。

运行 `npm run dev` 可体验 JSON 编辑、校验和预览。详见 [AI / 低代码接入指南](https://github.com/eugeneaiao-ui/formino/blob/main/docs/AI_INTEGRATION.md)。项目提供表单引擎及接入示例；可视化编辑器、配置管理后台和 LLM 服务由宿主按需建设。

## 先看哪个文档？

| 我想做什么                             | 文档                                                                                             |
| -------------------------------------- | ------------------------------------------------------------------------------------------------ |
| 从零安装并显示第一个表单               | [快速开始](https://github.com/eugeneaiao-ui/formino/blob/formino-v0.1.0/docs/GETTING_STARTED.md) |
| 查字段、表单、数据源和联动怎么配置     | [配置手册](https://github.com/eugeneaiao-ui/formino/blob/formino-v0.1.0/docs/CONFIGURATION.md)   |
| 做级联选项、自动计算、自定义组件、快照 | [常用场景](https://github.com/eugeneaiao-ui/formino/blob/formino-v0.1.0/docs/RECIPES.md)         |
| 查完整接口和默认值                     | [API](https://github.com/eugeneaiao-ui/formino/blob/formino-v0.1.0/docs/API.md)                  |
| 将现有动态表单迁移进来                 | [迁移指南](https://github.com/eugeneaiao-ui/formino/blob/formino-v0.1.0/docs/MIGRATION.md)       |
| 排查不刷新、校验、样式和日期问题       | [常见问题](https://github.com/eugeneaiao-ui/formino/blob/formino-v0.1.0/docs/FAQ.md)             |
| 本地开发、提 PR、构建和准备发布        | [贡献指南](https://github.com/eugeneaiao-ui/formino/blob/main/CONTRIBUTING.md)                   |

## 运行示例

开发环境使用 Node.js 22.12+；Node.js 20.19+ 也满足当前构建工具的要求。

```bash
git clone https://github.com/eugeneaiao-ui/formino.git
cd formino
npm ci
npm run dev
```

运行后打开终端显示的地址，可以切换 edit / preview / snapshot、切换国家加载城市、添加字段并提交校验。[最小表单源码](https://github.com/eugeneaiao-ui/formino/blob/formino-v0.1.0/examples/quick-start/ProfileForm.tsx)和[进阶配置源码](https://github.com/eugeneaiao-ui/formino/blob/formino-v0.1.0/examples/configuration/recipes.tsx)参与严格类型检查。

## 安装到自己的项目

```bash
npm install forminojs
```

Formino 的 npm 包名为 forminojs，版本为 0.1.0。原 @eugenedfsfsvg/dynamic-form 包保留；迁移时替换安装包名与 import 路径，公开 API 不变。需要本地使用未发布改动时，可运行 npm run build 和 npm pack，再安装生成的 .tgz。

使用 UI 入口时，需要宿主已安装 React、ReactDOM 和 Ant Design。新项目可使用已验证的 React 18 + AntD 5 组合：

```bash
npm install react@18.3.1 react-dom@18.3.1 antd@5.27.6
```

已有项目沿用自己的兼容版本即可。只使用 `core` 不需要 UI 依赖。AntD 4 日期控件需要注入 moment 适配器，见[迁移指南](https://github.com/eugeneaiao-ui/formino/blob/formino-v0.1.0/docs/MIGRATION.md#ant-design-4-日期适配)。

## 最小用法

```tsx
import React from 'react';
import { DynamicForm, FormComponent, FormFieldType, useDynamicConfig } from 'forminojs';
import 'forminojs/style.css';

const template = [{ name: 'name', type: FormFieldType.Input }];
const fields = { name: { label: 'Name', rules: [{ required: true }] } };

function Fields() {
  const { formConfig } = useDynamicConfig({ template, fields });
  return <FormComponent formConfig={formConfig} />;
}

export function Example() {
  return (
    <DynamicForm onFinish={(values) => console.log(values)}>
      <Fields />
      <button type="submit">Submit</button>
    </DynamicForm>
  );
}
```

将 `Example` 挂载到你的 React 页面即可。Hook 在 `DynamicForm` 内的子组件中执行；表单校验成功才调用 onFinish。[完整教程](https://github.com/eugeneaiao-ui/formino/blob/formino-v0.1.0/docs/GETTING_STARTED.md)继续说明 TypeScript 类型、样式、默认值和提交。

## 支持范围

| 项目              | 当前验证                                               |
| ----------------- | ------------------------------------------------------ |
| React / AntD      | React 16.14 + AntD 4.24；React 18.3 / 19.1 + AntD 5.27 |
| 使用方 TypeScript | React 16 组合使用 TS 4.9.5；现代组合使用 TS 5.9.3      |
| 包入口            | 根入口、`/antd`、`/core`、`/style.css`                 |
| 输出              | ESM / CommonJS，各自带类型声明                         |
| 运行场景          | React 客户端、服务端渲染、纯 TypeScript 配置生成       |

peer dependencies 标记为 optional 是为了支持 core-only 安装；使用 UI 入口仍需安装 UI 依赖。日期、上传、富文本等扩展方式见配置和迁移文档。

## 验证与贡献

外部贡献请使用 **Fork → 短期分支 → PR 到 main → 审核 → Squash 合并**。完整命令见[贡献指南](https://github.com/eugeneaiao-ui/formino/blob/main/CONTRIBUTING.md)，分支保护与维护者例外见[贡献流程](https://github.com/eugeneaiao-ui/formino/blob/main/docs/CONTRIBUTION_WORKFLOW.md)。

```bash
npm run check
npm run test:package
npm run check:docs
```

check 包括类型、ESLint、格式、回归测试及库和演示构建；test:package 将实际 tarball 安装到隔离项目，检查各组合的导入、SSR 和使用方类型；check:docs 检查本地文档链接和基础发布信息。

欢迎通过 [Issues](https://github.com/eugeneaiao-ui/formino/issues) 反馈问题，通过 PR 贡献代码。请先阅读[贡献指南](https://github.com/eugeneaiao-ui/formino/blob/main/CONTRIBUTING.md)。版本变化记录在 [CHANGELOG](https://github.com/eugeneaiao-ui/formino/blob/formino-v0.1.0/CHANGELOG.md)。

## License

[MIT](https://github.com/eugeneaiao-ui/formino/blob/formino-v0.1.0/LICENSE)。许可证标准文本见 [SPDX](https://spdx.org/licenses/MIT.html)。
