# Formino — 低代码与 AI 辅助开发的动态表单引擎

[![npm version](https://img.shields.io/npm/v/forminojs?color=315efb)](https://www.npmjs.com/package/forminojs) [![MIT license](https://img.shields.io/github/license/eugeneaiao-ui/formino)](https://github.com/eugeneaiao-ui/formino/blob/main/LICENSE) [![GitHub release](https://img.shields.io/github/v/release/eugeneaiao-ui/formino)](https://github.com/eugeneaiao-ui/formino/releases/latest)

[Release](https://github.com/eugeneaiao-ui/formino/releases/latest) · [Discussions](https://github.com/eugeneaiao-ui/formino/discussions) · [Support](https://github.com/eugeneaiao-ui/formino/blob/main/SUPPORT.md) · [Adoption guide](https://github.com/eugeneaiao-ui/formino/blob/main/docs/ADOPTION.md)

[English](https://github.com/eugeneaiao-ui/formino/blob/formino-v0.1.0/README.en.md) · [快速开始](https://github.com/eugeneaiao-ui/formino/blob/formino-v0.1.0/docs/GETTING_STARTED.md) · [配置手册](https://github.com/eugeneaiao-ui/formino/blob/formino-v0.1.0/docs/CONFIGURATION.md) · [常用场景](https://github.com/eugeneaiao-ui/formino/blob/formino-v0.1.0/docs/RECIPES.md) · [API](https://github.com/eugeneaiao-ui/formino/blob/formino-v0.1.0/docs/API.md)

面向 React / Ant Design 的 TypeScript 动态表单引擎，支持长表单、多级字段联动、低代码应用的表单渲染和 AI 辅助生成配置。用 TypeScript 或受约束的 JSON 配置表单结构、校验、选项和字段联动。独立 core 引擎负责生成配置，React / Ant Design 适配器负责渲染编辑、预览与快照。

- **结构与规则分离**：template 定义字段顺序和布局，fields 定义标签、校验和控件属性。
- **适配现有项目**：支持自定义组件、业务请求客户端、状态数据和日期适配器。
- **可独立使用**：core 无 React / Ant Design 依赖；库提供 ESM、CommonJS 及类型声明。
- **动态更新**：配置变更立即生效，异步联动会丢弃过期结果。

## 核心能力：长表单与复杂联动

- 长表单：演示支持 100 / 300 / 1000 字段、完整或分批挂载、整表校验；提供真实浏览器的性能数据和原始样本。
- 复杂联动：异步下拉级联、多阶段计算、动态禁用和条件校验，可以同时出现在一张表单里。
- 图文教程：查看[操作步骤与截图](https://github.com/eugeneaiao-ui/formino/blob/formino-v0.1.0/docs/EXAMPLES.md)、[性能测量报告](https://github.com/eugeneaiao-ui/formino/blob/formino-v0.1.0/docs/PERFORMANCE.md)及对应源码。

![300 字段长表单及完整挂载计数](https://raw.githubusercontent.com/eugeneaiao-ui/formino/formino-v0.1.0/docs/images/long.png)

## 低代码与 AI 开发

- 低代码平台：保存 JSON 配置，接入表单渲染、校验和提交。
- AI 生成表单：提供 [配置 Schema](https://github.com/eugeneaiao-ui/formino/blob/formino-v0.1.0/schemas/form-definition.schema.json)，先校验输出，再渲染。
- AI 编程助手：使用 [llms.txt](https://github.com/eugeneaiao-ui/formino/blob/formino-v0.1.0/llms.txt)、API 和示例作为上下文，生成 TypeScript 表单。

运行 npm run dev 可体验 JSON 编辑、校验和预览。详见 [AI / 低代码接入指南](https://github.com/eugeneaiao-ui/formino/blob/formino-v0.1.0/docs/AI_INTEGRATION.md)和[项目发现说明](https://github.com/eugeneaiao-ui/formino/blob/formino-v0.1.0/docs/DISCOVERY.md)。这是表单引擎及接入示例，不包含完整拖拽编辑器或 LLM 服务。

## 先看哪个文档？

| 我想做什么                             | 文档                                                                                             |
| -------------------------------------- | ------------------------------------------------------------------------------------------------ |
| 从零安装并显示第一个表单               | [快速开始](https://github.com/eugeneaiao-ui/formino/blob/formino-v0.1.0/docs/GETTING_STARTED.md) |
| 查字段、表单、数据源和联动怎么配置     | [配置手册](https://github.com/eugeneaiao-ui/formino/blob/formino-v0.1.0/docs/CONFIGURATION.md)   |
| 做级联选项、自动计算、自定义组件、快照 | [常用场景](https://github.com/eugeneaiao-ui/formino/blob/formino-v0.1.0/docs/RECIPES.md)         |
| 查完整接口和默认值                     | [API](https://github.com/eugeneaiao-ui/formino/blob/formino-v0.1.0/docs/API.md)                  |
| 将现有动态表单迁移进来                 | [迁移指南](https://github.com/eugeneaiao-ui/formino/blob/formino-v0.1.0/docs/MIGRATION.md)       |
| 排查不刷新、校验、样式和日期问题       | [常见问题](https://github.com/eugeneaiao-ui/formino/blob/formino-v0.1.0/docs/FAQ.md)             |
| 本地开发、提 PR、构建和准备发布        | [贡献指南](https://github.com/eugeneaiao-ui/formino/blob/formino-v0.1.0/CONTRIBUTING.md)         |

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

```bash
npm run check
npm run test:package
npm run check:docs
```

check 包括类型、ESLint、格式、回归测试及库和演示构建；test:package 将实际 tarball 安装到隔离项目，检查各组合的导入、SSR 和使用方类型；check:docs 检查本地文档链接和基础发布信息。

欢迎通过 [Issues](https://github.com/eugeneaiao-ui/formino/issues) 反馈问题，通过 PR 贡献代码。请先阅读[贡献指南](https://github.com/eugeneaiao-ui/formino/blob/formino-v0.1.0/CONTRIBUTING.md)。版本变化记录在 [CHANGELOG](https://github.com/eugeneaiao-ui/formino/blob/formino-v0.1.0/CHANGELOG.md)。

## License

[MIT](https://github.com/eugeneaiao-ui/formino/blob/formino-v0.1.0/LICENSE)。许可证标准文本见 [SPDX](https://spdx.org/licenses/MIT.html)。
