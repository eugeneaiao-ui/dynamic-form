# Contributing

欢迎通过 Issue 或 Pull Request 改进 Formino。

## 开发环境

使用 Node.js 22.12+ 和 npm。克隆仓库后安装依赖。

```bash
git clone https://github.com/eugeneaiao-ui/formino.git
cd formino
npm ci
npm run dev
```

## 目录

| 位置                                          | 内容                                        |
| --------------------------------------------- | ------------------------------------------- |
| src/core                                      | 不依赖 React 的配置、布局、依赖和数据源引擎 |
| src/react                                     | Context、配置和异步加载 hooks               |
| src/antd                                      | Ant Design 渲染、控件注册和显示模式         |
| examples/basic                                | 交互演示                                    |
| examples/quick-start / examples/configuration | 文档配套的可编译示例                        |
| docs                                          | 接入、配置、场景、API 和迁移文档            |
| tests                                         | 核心和 React 回归测试                       |
| scripts                                       | 样式复制、文档检查和隔离安装验证            |

## 修改约定

- 公共 API 改动同步更新文档与 CHANGELOG。
- core 不引入 React、AntD 或应用服务；业务能力通过适配器注入。
- 保持现有 React / AntD 兼容范围；不要引入只在新版 React 可用的 hooks。
- 配置使用不可变更新；异步任务接收 AbortSignal 并避免写入过期结果。
- 新测试应验证真实行为与边界，不为格式调整或纯文档修改添加重复测试。

提交前运行：

```bash
npm run format
npm run check
npm run check:docs
```

包导出、peer 范围、构建配置、日期适配或运行时兼容相关改动，还应执行 `npm run test:package`。该命令访问 npm registry，将 tarball 安装到临时消费项目，完成后清理临时目录。

PR 应描述问题、变更后的行为、验证命令及涉及的兼容性。提交贡献表示你同意将贡献按本仓库 [MIT 许可证](LICENSE)提供。

## 反馈问题

请提供版本、React / AntD / TypeScript 组合、最小 template / fields、重现步骤及期望结果。避免包含访问令牌或真实业务数据。可从 [ProfileForm](examples/quick-start/ProfileForm.tsx) 精简重现。

## 维护者发布准备

npm 包名为 forminojs。这些步骤由维护者手动执行，不会由 CI 自动发布。

1. 更新版本和 CHANGELOG，确认 npm 包名可用且当前账号有发布权限。
2. 执行 npm ci、npm run check、npm run test:package。
3. 执行 npm pack --dry-run，检查 dist、类型声明、文档、LICENSE。
4. 执行 npm pack，在使用方实际安装生成的 tarball。
5. 确认后手动执行 npm publish --access public，并创建对应版本的 Git tag / release。Formino 首次发布使用 formino-v0.1.0，旧 scoped 包的 v0.1.0 标签保留。

本仓库已有 publishConfig.access=public，明确使用公开访问级别，不会自动触发发布。发布记录应注明验证结果。远程 CI 因账号级限制无法启动时，应记录限制和本地验证结果，不能将未启动视作通过。
