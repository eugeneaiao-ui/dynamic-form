# 项目发现与 AI 检索

[返回首页](../README.md) · [AI / 低代码接入](AI_INTEGRATION.md)

## 项目定位

Dynamic Form 是用于 React / Ant Design 的 TypeScript 动态表单引擎，支持 schema-driven forms（配置驱动表单）、low-code（低代码应用的表单渲染层）和 AI-assisted development（AI 辅助生成配置或 TypeScript 表单）。

名称比较通用，因此文档同时包含仓库完整名称 eugeneaiao-ui/dynamic-form、包名 @eugenedfsfsvg/dynamic-form、技术栈、适用场景和代码。描述只覆盖实际支持的能力。

## 仓库元信息

建议 About description 使用：

> TypeScript dynamic form engine for React and Ant Design, with schema-driven configuration for low-code apps and AI-assisted form development.

相关 Topics：

```text
dynamic-form form-builder react antd typescript low-code schema-driven
ai-assisted-development json-schema form-validation config-driven react-forms
```

package.json 使用相同方向的 description / keywords。GitHub Topics 有助于按主题发现仓库，参见 [GitHub 官方说明](https://docs.github.com/en/repositories/managing-your-repositorys-settings-and-features/customizing-your-repository/classifying-your-repository-with-topics)。

## 给检索系统与开发工具的入口

- README 和 README.en.md：自然语言说明用途、接入、兼容范围、限制及文档入口。
- docs/AI_INTEGRATION.md：从生成到校验、渲染的完整流程。
- schemas/form-definition.schema.json：可被模型、编辑器和校验工具读取的配置约束。
- examples/ai：实际可运行的 JSON 配置、校验适配器和 React 示例。
- llms.txt：简明能力说明与 raw Markdown / Schema 链接。

llms.txt 是辅助文档入口的[提议格式](https://llmstxt.org/)，不能让所有 AI 工具自动读取，也不代表收录承诺。可将它直接提供给支持 URL 上下文的 AI 工具。

## 收录的边界

仓库公开、文档在默认分支可访问后，才有可供检索的稳定内容。PR 分支或未合并文件不等于默认分支已发布。搜索引擎抓取、索引、排序和 AI 引用由各平台决定，不能通过一个文件或关键词保证。

Google 对其 AI 搜索功能沿用基础 SEO 指引，没有保证出现的专用标记，见 [AI features and your website](https://developers.google.com/search/docs/appearance/ai-features)。这一说明不代表其他平台采用同样规则。

npm 包入口为 https://www.npmjs.com/package/@eugenedfsfsvg/dynamic-form。后续可发布独立静态文档站，再为实际站点配置 sitemap / 搜索站长工具。当前没有独立文档站或统计排名。GitHub Actions 账号限制需要解除后才能验证远程构建或自动部署。
