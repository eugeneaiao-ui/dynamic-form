# Dynamic Form

[English](README.en.md) · [快速开始](docs/GETTING_STARTED.md) · [配置手册](docs/CONFIGURATION.md) · [常用场景](docs/RECIPES.md) · [API](docs/API.md)

用 TypeScript 配置表单结构、校验、选项和字段联动。独立 core 引擎负责生成配置，React / Ant Design 适配器负责渲染编辑、预览与快照。

- **结构与规则分离**：template 定义字段顺序和布局，fields 定义标签、校验和控件属性。
- **适配现有项目**：支持自定义组件、业务请求客户端、状态数据和日期适配器。
- **可独立使用**：core 无 React / Ant Design 依赖；库提供 ESM、CommonJS 及类型声明。
- **动态更新**：配置变更立即生效，异步联动会丢弃过期结果。

## 先看哪个文档？

| 我想做什么                             | 文档                                |
| -------------------------------------- | ----------------------------------- |
| 从零安装并显示第一个表单               | [快速开始](docs/GETTING_STARTED.md) |
| 查字段、表单、数据源和联动怎么配置     | [配置手册](docs/CONFIGURATION.md)   |
| 做级联选项、自动计算、自定义组件、快照 | [常用场景](docs/RECIPES.md)         |
| 查完整接口和默认值                     | [API](docs/API.md)                  |
| 将现有动态表单迁移进来                 | [迁移指南](docs/MIGRATION.md)       |
| 排查不刷新、校验、样式和日期问题       | [常见问题](docs/FAQ.md)             |
| 本地开发、提 PR、构建和准备发布        | [贡献指南](CONTRIBUTING.md)         |

## 运行示例

开发环境使用 Node.js 22.12+；Node.js 20.19+ 也满足当前构建工具的要求。

```bash
git clone https://github.com/eugeneaiao-ui/dynamic-form.git
cd dynamic-form
npm ci
npm run dev
```

迁移 PR 合并前，请先检出 `codex/extract-dynamic-form-library` 分支，再安装依赖。

运行后打开终端显示的地址，可以切换 edit / preview / snapshot、切换国家加载城市、添加字段并提交校验。[最小表单源码](examples/quick-start/ProfileForm.tsx)和[进阶配置源码](examples/configuration/recipes.tsx)参与严格类型检查。

## 安装到自己的项目

当前版本尚未发布到 npm，请先从源码打包：

```bash
# 在本仓库
npm run build
npm pack

# 在使用方项目，路径替换为实际生成的安装包位置
npm install /absolute/path/eugeneaiao-ui-dynamic-form-0.1.0.tgz
```

使用 UI 入口时，需要宿主已安装 React、ReactDOM 和 Ant Design。新项目可使用已验证的 React 18 + AntD 5 组合：

```bash
npm install react@18.3.1 react-dom@18.3.1 antd@5.27.6
```

已有项目沿用自己的兼容版本即可。只使用 `core` 不需要 UI 依赖。AntD 4 日期控件需要注入 moment 适配器，见[迁移指南](docs/MIGRATION.md#ant-design-4-日期适配)。

## 最小用法

```tsx
import React from 'react';
import { DynamicForm, FormComponent, FormFieldType, useDynamicConfig } from '@eugeneaiao-ui/dynamic-form';
import '@eugeneaiao-ui/dynamic-form/style.css';

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

将 `Example` 挂载到你的 React 页面即可。Hook 在 `DynamicForm` 内的子组件中执行；表单校验成功才调用 onFinish。[完整教程](docs/GETTING_STARTED.md)继续说明 TypeScript 类型、样式、默认值和提交。

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

欢迎通过 [Issues](https://github.com/eugeneaiao-ui/dynamic-form/issues) 反馈问题，通过 PR 贡献代码。请先阅读[贡献指南](CONTRIBUTING.md)。版本变化记录在 [CHANGELOG](CHANGELOG.md)。

## License

[MIT](LICENSE)。许可证标准文本见 [SPDX](https://spdx.org/licenses/MIT.html)。
