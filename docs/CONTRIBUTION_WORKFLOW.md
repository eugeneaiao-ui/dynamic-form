# 贡献与分支流程

[贡献指南](../CONTRIBUTING.md) · [仓库规则](https://github.com/eugeneaiao-ui/formino/rules) · [版本与发布](RELEASING.md)

## 采用 main 与短期分支

Formino 目前只有一条集成主线 main，使用轻量的 GitHub Flow。每个改动从最新 main 建短期分支，通过 PR 审核后 Squash 合并。正式版本由不可覆盖的标签标识，main 可以包含尚未发布的维护改动。当前不创建 develop 或闲置的 release 分支。

```text
外部贡献者：自己的 Fork / 短期分支
维护者：上游仓库 / 短期分支
                    ↓
            PR → upstream/main
                    ↓
      检查、代码所有者审核、解决讨论
                    ↓
            Squash and merge
                    ↓
                  main
             ↙             ↘
     文档构建 → gh-pages    维护者准备新版本
                                 ↓
                 formino-vX.Y.Z → npm / Release
```

| 分支 / 标签                                        | 用途                               | 更新方式                                      |
| -------------------------------------------------- | ---------------------------------- | --------------------------------------------- |
| main                                               | 集成已审核改动，保持可验证和可发布 | 通过 PR，仅 Squash；禁止直推、强推和删除      |
| feat/_、fix/_、docs/_、refactor/_、test/_、chore/_ | 单一任务的短期分支                 | 贡献者在自己的 Fork 或有权限的上游分支提交    |
| codex/\*                                           | 本项目自动化协作产生的短期分支     | 与人工分支相同，通过 PR 审核                  |
| gh-pages                                           | 文档站生成产物                     | 发布脚本 / 工作流正常快进更新；禁止强推和删除 |
| formino-v\*                                        | 新包的正式版本源码定位             | 创建新标签；禁止更新和删除                    |
| v\*                                                | 保留的旧版本标签                   | 保留历史；禁止更新和删除                      |

分支前缀是协作约定，不是强制命名正则。单个 PR 应围绕一个问题。以后确有同时维护多个版本线的需求，再增加 release/X.Y 分支，并同步补齐该分支的保护、CI 和回合并流程。

## 谁可以做什么

| 角色                    | 提交改动                               | 审核 / 合并                                         | 发布                                         |
| ----------------------- | -------------------------------------- | --------------------------------------------------- | -------------------------------------------- |
| 外部贡献者              | Fork 后向上游 main 发 PR，维护自己分支 | 可讨论、提供反馈；没有上游合并权限                  | 不获得 npm、标签或站点发布权限               |
| 有写权限的协作者        | 可在上游创建短期分支，仍通过 PR        | 按权限及 CODEOWNERS 规则审核；遵守分支规则          | 不因 PR 获得 npm 权限                        |
| 仓库管理员 / 当前维护者 | 与其他人一样先发 PR                    | 审核并 Squash；特定情况下可使用仅限 PR 的管理员例外 | 负责正式标签、npm、Release 和配置同步        |
| GitHub Actions          | 执行获准的工作流                       | 默认只读，不能批准 PR                               | 只有 main 上独立的文档任务获得必要的发布权限 |

当前代码所有者为 @eugeneaiao-ui，规则覆盖所有路径，包括 CODEOWNERS 和工作流文件。添加协作者或模块所有者需要单独授权，不会因为打开了 PR 自动获得权限。

## 外部贡献者的提交步骤

1. 在 GitHub Fork 官方仓库，并在自己的克隆中设置 origin 为 Fork、upstream 为官方仓库。
2. 从 upstream/main 建立一个短期分支，修改后按改动范围验证。完整命令见[贡献指南](../CONTRIBUTING.md#第一次贡献从-fork-开始)。
3. Push 到自己的 origin 分支，创建 base = eugeneaiao-ui/formino:main、head = 自己的 Fork:分支 的 PR。
4. 填写问题、改动、验证和兼容性；大型设计可以先开 Draft PR 或 Discussion。
5. 收到审核意见后继续提交到同一分支。主线前进时先 fetch upstream，再在该功能分支合并 upstream/main。
6. 维护者确认后 Squash 合并。合并后需要同步自己的 Fork / main，再开始下一项独立任务。

外部贡献者无须先被邀请为 collaborator，也不需要上传 npm token、账号密码或 CI 密钥。

## 维护者怎样审核与合并

1. 核对任务、base/head、改动范围和是否影响配置驱动的公开契约。
2. 对 Fork PR，先检查代码及工作流变化，再批准工作流运行。
3. 阅读检查结果与最小重现，关注接口、Schema、类型、依赖、异步行为和文档是否对应。
4. CODEOWNERS 要求代码所有者批准；新提交会使旧批准失效。所有审核讨论应处理并标记解决。
5. 检查兼容性说明和 CHANGELOG；使用清楚的 PR 标题，因为它会作为 Squash 提交标题。
6. 使用 Squash and merge。每个 PR 进入 main 后保留一个提交，PR 页面保留完整讨论和原始提交。
7. 上游短期分支自动清理；不要清理未合并的其他任务分支。随后按需求维护站点或准备发版。

main 的线性历史要求约束合并后的主线，不要求投稿分支没有中间提交或同步合并。仓库禁用 Merge commit、Rebase merge 和自动合并，避免维护者选错合并方式。

## 单人维护的例外

GitHub 不允许作者批准自己的 PR。当前只有一位管理员，如果对所有人要求独立批准且完全没有例外，维护者会被自己的规则锁住。

因此，main 默认要求 1 个批准、代码所有者审核、过期批准失效和讨论解决；管理员的 bypass 仅限 Pull requests。管理员仍需开 PR，不能借此直接推 main。自己的 PR 或明确说明的紧急维护可以在完成适用验证并留下记录后使用该例外。外部投稿仍应按常规代码审核处理。

不使用第二个虚假账号自审，不把 bypass 设置为 Always。增加独立维护者后，可重新收紧例外范围。规则语义见 [GitHub：创建规则集](https://docs.github.com/en/repositories/configuring-branches-and-merges-in-your-repository/managing-rulesets/creating-rulesets-for-a-repository)。

## CI 与 Fork 执行策略

Library CI 在发往 main 的 PR、main 更新和手动触发时运行，固定检查名称为 Library checks。短期分支单独 Push 不再重复触发同一套检查，PR 更新会触发检查。

检查包含 npm run check、npm run test:package、npm run build:site、npm run check:site。相同 PR 的新运行会取消旧运行，单次任务有 20 分钟上限。

Fork PR 使用 pull_request 事件。默认 GITHUB_TOKEN 只读，CI checkout 不保留 Git 凭据，工作流不能批准 PR。所有外部贡献者的 Fork 工作流都需要维护者批准。文档发布只由 main 的独立流程触发，PR 不负责发布 npm 或网站。

不要为了让 Fork CI 运行，改成在 pull_request_target 的高权限上下文里检出并执行未经审核的投稿代码。批准运行、代码批准和合并是三个独立动作。参见 [GitHub：批准 Fork 工作流](https://docs.github.com/en/actions/how-tos/manage-workflow-runs/approve-runs-from-forks)。

### 当前的临时限制与后续启用门禁

普通 Actions 当前因为账号 billing 限制无法启动，所以本次不把一个无法执行的检查设置为必须成功。维护者需要在 PR 记录本地验证；CI 未启动不等于通过。

账号恢复后：

1. 在 main 运行一次新的 Library CI，并确认 Library checks 完整成功。
2. 验证一次 PR（含 Fork 审批流程）的同名检查成功。
3. 在 Settings → Rules → Rulesets → Formino main 中添加 Required status checks，选择 Library checks；按需要启用分支必须最新。
4. 同时更新 .github/rulesets/main.json 和 .github/repository-settings.json 中的 ci_gate，保持说明与线上设置一致。

不要先改检查名称却忘记更新门禁，也不要把尚未执行的任务当成绿色检查。

## 仓库配置如何维护

本次仓库合并策略、Actions 权限以及三个 active ruleset 已通过 GitHub 官方 API 设置。可在[仓库规则页](https://github.com/eugeneaiao-ui/formino/rules)查看实际规则。

- .github/rulesets/main.json：main 的 PR、审核、线性历史、强推和删除规则。
- .github/rulesets/release-tags.json：正式版本标签不可更新 / 删除。
- .github/rulesets/gh-pages.json：站点发布历史不可强推 / 删除。
- .github/repository-settings.json：合并、自动清理、Fork 执行权限及 CI 门禁当前状态。

这些 JSON 是可审查的设置快照，提交文件不会自动改变 GitHub 设置。后续调整需要管理员同步线上设置，并在 PR 中记录。标签若确实指错，优先创建正确的新版本；不要覆盖已经公开的版本定位。
