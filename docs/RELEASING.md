# 版本与发布维护

[Changelog](../CHANGELOG.md) · [贡献指南](../CONTRIBUTING.md) · [GitHub Releases](https://github.com/eugeneaiao-ui/formino/releases)

## 当前正式版本

品牌与 GitHub 仓库：Formino / eugeneaiao-ui/formino。npm 包：forminojs。首个版本为 0.1.0，对应源码标签 formino-v0.1.0。旧 scoped 包及其 v0.1.0 标签保留。

Release 附件中的 .tgz 与 npm 发布产物一致，SHA256SUMS.txt 用于校验下载。Windows 可使用 Get-FileHash -Algorithm SHA256；Linux / macOS 可使用 sha256sum 或 shasum -a 256。

## 代码合并与版本权限

普通贡献先通过短期分支向 main 发 PR，由维护者审核后 Squash 合并。PR 合并不自动发布 npm；正式发布由具备对应权限的维护者执行。main 可以包含尚未发版的维护改动，发布标签必须指向已经审核的明确提交。

formino-v* 与保留的 v* 标签禁止更新和删除。版本错误应发布新版本，不覆盖原有标签。分支与审核流程见[贡献流程](CONTRIBUTION_WORKFLOW.md)。

## 下次发版顺序

1. 合并待发布改动，确认工作区干净；更新 package.json、package-lock.json 的版本和 CHANGELOG。
2. 运行 npm ci、npm run check、npm run test:package、npm run build:site、npm run check:site。
3. 使用 npm pack --dry-run 检查文件清单。运行 npm pack，把候选 .tgz 安装到隔离项目，验证导出、类型、样式和运行效果。
4. 提交最终版本文件，为这一提交创建 formino-vX.Y.Z 标签。不要覆盖旧标签。
5. 使用当前账号的发布权限和 npm 网页 / 2FA 验证，将刚审查的 .tgz 发布到 npm。不要把 token、验证码或恢复码放进仓库。
6. 等待 npm 发布检查完成，再验证公开 registry 的版本、latest、哈希，以及不指定版本的 npm install forminojs。
7. 在 GitHub 创建对应标签的 Release，附安装说明、兼容范围、变更说明、同一 .tgz 与 SHA256SUMS.txt，并设置为最新版本。
8. 检查文档、在线示例、npm、Release 之间的链接。更新文档索引与网站，保留历史性能原始数据。

npm 发布后存在检查和可用性延迟，见 [npm 官方发布说明](https://github.blog/changelog/2026-07-28-npm-publish-time-malware-scanning-and-dual-use-metadata/)。CLI 返回成功后，应先查询版本和发布状态，避免仅因暂时查不到版本就重复发布。

## 文档站维护

```bash
npm run build:site
npm run check:site
```

site/config.json 定义公开站点地址；site-dist 包含静态文档、全文搜索索引、sitemap.xml、robots.txt、llms.txt、配置 Schema 和 playground。可部署到 GitHub Pages 或其他静态托管。

GitHub Pages 使用 gh-pages 分支根目录作为发布源。Pages 工作流构建并验证网站后更新该分支，并请求 Pages 重新构建；仅发布文档和示例，不发布 npm。手动维护时运行 npm run deploy:site，使用已有 Git 登录把同一构建结果更新到 gh-pages。

若 GitHub Actions 因账号 billing 限制无法启动，应先解决账号限制；不要把未运行的检查记为通过。版本 Release 和本地验证结果可以独立记录。
