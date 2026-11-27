# 项目发现与 AI 检索

[返回首页](../README.md) · [AI / 低代码接入](AI_INTEGRATION.md)

## 项目定位

Formino 是配置驱动的 TypeScript 表单引擎，将表单定义与 React / Ant Design 渲染分离。定义可以来自本地配置或宿主管理的受支持 JSON，并作为 AI 生成表单的配置契约；长表单、复杂联动和多种显示模式是这一模型支持的特性。

项目品牌为 Formino，仓库为 eugeneaiao-ui/formino，npm 包名为 forminojs。文档同时保留 dynamic form、低代码、长表单、复杂联动与 AI 辅助开发等能力描述，便于检索并了解实际支持范围。

## 仓库元信息

建议 About description 使用：

> Formino: a TypeScript dynamic form engine for React and Ant Design, with long forms, complex dependencies, low-code and AI-assisted development.

相关 Topics：

```text
formino dynamic-form form-builder react antd typescript low-code schema-driven
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

[npm 包](https://www.npmjs.com/package/forminojs)和[公开文档站](https://eugeneaiao-ui.github.io/formino/)提供安装、静态 HTML 文档、全文检索与在线示例。仓库 About 指向文档站，README 和 Release 提供安装、文档和示例入口。

## 已提供的检索入口

- [sitemap.xml](https://eugeneaiao-ui.github.io/formino/sitemap.xml)：公开文档与示例地址。
- [robots.txt](https://eugeneaiao-ui.github.io/formino/robots.txt)：允许抓取并声明 sitemap。
- [llms.txt](https://eugeneaiao-ui.github.io/formino/llms.txt)：指向可直接读取的 Markdown、Schema 和示例配置。
- 每页包含 canonical、描述、Open Graph 与 SoftwareSourceCode 结构化数据，正文无需执行 JavaScript 才能读取。
- GitHub Topics 和 npm keywords 覆盖 React、动态表单、长表单、字段联动、低代码与 AI 辅助开发。

## 后续推广与收录

维护者可在 Google Search Console / Bing Webmaster Tools 完成站点所有权验证后提交 sitemap；验证码或验证文件应由实际账户生成。分享时优先提供接入文档、一个能运行的示例及有测量条件的性能报告。不要把发布到 npm、配置 sitemap 或提供 llms.txt 当作排名或 AI 引用保证。

本项目不提供搜索排名统计。常规 Actions 若仍受账号 billing 限制，应修复账号限制后再确认自动构建；现有文档可通过独立 gh-pages 发布流程维护。
