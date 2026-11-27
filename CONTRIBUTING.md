# Contributing

欢迎通过 Issue 或 Pull Request 改进 Formino。外部贡献者使用 **Fork → 短期分支 → PR 到 upstream/main → 维护者审核 → Squash 合并**。无须获得上游仓库的写权限。

External contributors: fork this repository, create a short-lived branch from upstream/main, and open a PR targeting eugeneaiao-ui/formino:main. The maintainer reviews and squash-merges changes. Fork workflow runs require maintainer approval. See the commands below and the [contribution workflow](docs/CONTRIBUTION_WORKFLOW.md).

## 第一次贡献：从 Fork 开始

1. 在 [Formino 仓库](https://github.com/eugeneaiao-ui/formino)点击 Fork，创建到自己的 GitHub 账号。
2. 下面以修改 README 为例；先将 YOUR_GITHUB_USERNAME 替换成自己的用户名。origin 指向自己的 Fork，upstream 指向官方仓库。

```bash
git clone https://github.com/YOUR_GITHUB_USERNAME/formino.git
cd formino
git remote add upstream https://github.com/eugeneaiao-ui/formino.git
git fetch upstream
git switch -c docs/clarify-config upstream/main
npm ci
```

使用 Node.js 22.12+ 和 npm，运行 npm run dev 查看本地示例。改动完成后按下方范围运行检查，再提交实际修改的文件：

```bash
git status --short
git add -- README.md
git commit -m "docs: clarify configuration example"
git push -u origin docs/clarify-config
```

3. 在 GitHub 打开 Pull Request：**base repository = eugeneaiao-ui/formino，base = main；head repository = 你的 Fork，compare = docs/clarify-config**。填写问题、改动、验证和兼容性。
4. 根据审核继续向同一分支提交；这些提交会自动更新当前 PR，无须反复新建 PR。

不要提交 token、真实业务数据、生成目录或无关的全库格式改动。新增功能和架构调整建议先通过 Issue / Discussion 对齐方向；普通修复和文档改进可以直接发 PR。

## 同步上游和维护者协作

PR 落后于 main 时，可在自己的功能分支合并最新上游；最终 Squash 只向 main 写入一个提交：

```bash
git fetch upstream
git switch docs/clarify-config
git merge upstream/main
git push
```

有上游写权限的维护者也应从最新 main 建立短期分支并通过 PR 提交。仓库不使用常驻 develop 分支。分支、权限、审核、单人维护例外和发版关系见[贡献与分支流程](docs/CONTRIBUTION_WORKFLOW.md)。

## 目录

| 位置                                          | 内容                                        |
| --------------------------------------------- | ------------------------------------------- |
| src/core                                      | 不依赖 React 的配置、布局、依赖和数据源引擎 |
| src/react                                     | Context、配置和异步加载 hooks               |
| src/antd                                      | Ant Design 渲染、控件注册和显示模式         |
| examples/basic                                | 交互演示                                    |
| examples/quick-start / examples/configuration | 文档配套的可编译示例                        |
| docs                                          | 接入、配置、场景、API 和维护流程            |
| tests                                         | 核心和 React 回归测试                       |
| scripts                                       | 构建、文档、隔离安装和网站验证              |

## 修改约定

- 保持配置与渲染的分工；业务服务、自定义控件和函数型能力通过宿主适配器接入。
- 公共 API、配置 Schema 或行为变化同步更新相应文档、示例和 CHANGELOG，并说明迁移影响。
- core 不引入 React、AntD 或应用服务；保持声明的 React / AntD 兼容范围。
- 配置使用不可变更新；异步任务接收 AbortSignal，并避免写入过期结果。
- 新测试验证真实行为与边界，不为纯文案或格式修改添加重复测试。
- 建议使用 feat:、fix:、docs:、refactor:、test:、chore: 等提交 / PR 标题；贡献者不必自行压缩所有提交，维护者会 Squash。

## 按改动范围验证

| 改动范围                                         | 需要记录的检查                                                       |
| ------------------------------------------------ | -------------------------------------------------------------------- |
| 核心、React 或控件行为                           | npm run check；为行为变化补充相应回归验证                            |
| 导出、公开类型、依赖 / peer 范围、构建或日期适配 | 上述检查加 npm run test:package，验证真实安装消费者                  |
| 文档、README、站点                               | npm run check:docs、npm run build:site、npm run check:site           |
| 网站脚本、布局、导航与示例接入                   | 上述站点检查加 npm run lint、npm run test:site（需要 Google Chrome） |

修改后使用 npm run format 格式化。npm run check 包含类型、lint、格式、文档、回归测试和库 / 示例构建。npm run test:package 会访问 npm registry，在临时项目安装 tarball 并检查兼容性。

PR 中写明实际执行的命令与结果；未运行、失败或受环境限制的检查要如实说明。GitHub 上的 Library checks 还会运行安装包与站点检查。当前 Actions 有账号 billing 限制，维护者需要记录本地验证；没有启动的 CI 不能写作通过。

## 审核、合并与权限

- 外部 Fork 的工作流需要维护者批准后才能执行；批准运行 CI 不等于批准代码或授予写权限。
- CODEOWNERS 将改动交给 @eugeneaiao-ui 审核。main 默认要求 1 个批准、代码所有者审核和讨论解决。
- 维护者使用 Squash and merge。上游短期分支合并后自动删除；贡献者自行维护 Fork 和本地分支。
- 管理员仅可通过 PR 使用单人维护例外；自己的 PR 无法由自己批准时，应先完成适用检查并在 PR 记录结果。
- Dependabot 也走人工审核流程，不自动合并。

提交贡献表示你同意将贡献按本仓库 [MIT 许可证](LICENSE)提供。使用 AI 辅助贡献时，同样需要验证配置、实现、重现步骤和测试结果。

## 反馈与发布

使用问题到 [Discussions](https://github.com/eugeneaiao-ui/formino/discussions)，可复现缺陷和功能建议到 [Issues](https://github.com/eugeneaiao-ui/formino/issues/new/choose)，安全问题按 [SECURITY](SECURITY.md)私密反馈。请提供依赖版本和最小配置，避免使用真实业务数据。

PR 合并不会自动发布 npm。正式发版由维护者从已审核的 main 提交创建新标签、验证候选包，并发布 npm / GitHub Release。步骤见[版本与发布维护](docs/RELEASING.md)。文档站可运行 npm run deploy:site 手动维护，自动流程仅在 main 更新时发布。
