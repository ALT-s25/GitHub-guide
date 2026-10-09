# GitHub 新手探索站 · 多层详情页扩展设计

**日期**：2026-10-09
**状态**：草案，待用户 review
**关联项目**：`C:\Users\26918\github-guide\`

---

## 一、目标

把当前 8 个 Tab 的"单层占位"扩展为"3 层可导航详情结构"，让用户点击 Tab 内的项能"进入"对应详情页（文件详情、Issue 详情、PR diff、设置表单等），并支持全交互（按钮可用、状态持久化）。

## 二、范围

### 本次实现（第 1 轮）

**4 个核心 Tab × 3 层 = 12 个新页面 + 复用现有列表页**

| Tab | L1 列表 | L2 详情 | L3 子详情 |
|---|---|---|---|
| Code | README + 文件树 | 文件详情 | 提交历史 |
| Issues | Issue 列表 | Issue 详情 | 评论 thread |
| Pull requests | PR 列表 | PR diff 详情 | 单 commit 详情 |
| Settings | 设置项列表 | 设置项表单 | — |

**4 个 Tab 留 1 层占位**（Actions / Projects / Security / Insights 保持现有 L1 列表状态），下一轮再扩。

### 下一轮（不本次实现）

- Actions / Projects / Security / Insights 4 个 Tab 扩展到 3 层
- 顶部 5 个下拉菜单的 17 个子项（Product 4 / Solutions 3 / Resources 4 / Open Source 3 / Enterprise 3）独立成可进入的页面

## 三、页面结构详细设计

### 3.1 Code Tab

**L1 列表（默认 Code tab 内容）**：

现状：只有 README 详情 + branch 选择器。改造成：README 详情 + 左侧文件树。

- 顶部：branch 选择器 + Add file / Code 按钮（保留现状）
- 左侧：新增文件树
  - 📁 src/
  - 📄 README.md（高亮当前文件）
  - 📄 index.html
  - 📄 .gitignore
  - 📄 package.json
- 主区：README 渲染（保留现状）
- 顶部右上：新增 "History" 链接 → L3

**L2 文件详情（点文件）**：
- 面包屑：`仓库 / README.md`
- 文件元信息栏：大小、行数、最后修改时间
- 代码块（带行号）
- 顶部按钮：Raw / Blame / Copy（点 Raw 弹 toast 提示"复制成功"、点 Copy 弹 toast）
- "← 返回" → 文件树
- "History" 链接 → L3

**L3 提交历史**：
- 面包屑：`仓库 / README.md / History`
- 5-7 条 commit 列表（每条：sha + 标题 + 作者 + 时间）
- 点 commit → L3 单 commit 详情（同 PR 的 L3）

### 3.2 Issues Tab

**L1 列表（替换当前占位）**：

现状：1 条示例 issue 卡片 + New issue 按钮。改造成：2-3 条 + 真实可用的 New issue 表单。

- 顶部：搜索框 + Labels/Milestones 过滤 + "New issue" 按钮（点开表单 modal）
- 2-3 条 issue 行：
  - #1 Welcome to your first issue!（open，标签 good first issue + documentation）
  - #2 Discuss: 项目结构建议（open）
  - #3 修复 README 错别字（closed，绿色标签）
- 右上：open / closed 切换 tab

**L2 Issue 详情**：
- 面包屑：`仓库 / Issues / #1`
- 标题 + 状态标签 + 作者 + 时间
- 描述（markdown 渲染）
- "Close issue" / "Reopen issue" 按钮（实际切换 state）
- "New comment" 表单（输入 → 提交 → 评论列表增加一条）
- 评论列表
- 点评论 → L3

**L3 评论 thread**：
- 单条评论 + 作者 + 时间 + 完整内容
- 回复列表
- "Reply" 表单

### 3.3 Pull requests Tab

**L1 列表（替换当前占位）**：

现状："还没有任何 PR" 空状态。改造成：2 条示例 PR + New PR 按钮（点弹 toast 引导）。

- 顶部：搜索框 + Reviewers/Labels + "New pull request" 按钮
- 2 条 PR：
  - #1 Add GitHub Skills link to README（open）
  - #2 Update code-block styling（merged）

**L2 PR 详情**：
- 面包屑：`仓库 / Pull requests / #1`
- 标题 + 状态（Open / Merged / Closed）+ 作者 + 时间
- Tab：Conversation / Commits / Files changed
- 默认显示 Conversation：描述 + diff 预览 + 评论
- "Approve" / "Request changes" / "Merge pull request" 按钮（实际操作）
- 点 Files changed → 显示 diff 视图（红绿行）
- 点 commit → L3

**L3 commit 详情**：
- 单 commit 信息 + diff
- "← 返回 PR"

### 3.4 Settings Tab

**L1 列表（保留现状，10 个设置项已存在）**：
- 10 个设置项（保留现状）
- 点任一项 → L2

**L2 设置项详情**：
- 面包屑：`仓库 / Settings / {设置名}`
- 对应表单：
  - **General**：仓库名 input + 描述 textarea + 可见性 radio + "Save" 按钮
  - **Notifications**：订阅 radio + 邮箱 input + "Save"
  - **Access**：协作者列表 + "Add collaborator" 表单（输入用户名 → 加进去）
  - **Collaborators**：同上
  - **Branches**：默认分支下拉 + 保护规则 checkbox + "Save"
  - **Tags / Pages / Secrets / Integrations / Danger Zone**：占位表单 + "Save"（弹 toast）
- 表单变化实时反映到 state

**L3**：Settings 不需要 L3（10 个设置项已经各自独立）

## 四、导航机制

### 4.1 面包屑

在 `tabContent` 顶部加一行：
```
[← 返回]  仓库 / [Issues] / #1 Welcome issue
```
- 每段都是 `<a>`，点击 → 返回那一层
- "← 返回" 按钮 → 上一层
- 移动到 L2/L3 时，顶部 active tab 状态保留

### 4.2 路由状态

```js
state.view = {
  tab: 'code' | 'issues' | 'pulls' | 'settings' | ...,
  level: 1 | 2 | 3,
  params: { id?, path?, sha? }  // 取决于 tab
}
```

`navigate(tab, level, params)` 函数：
1. 更新面包屑
2. 调对应 render 函数（如 `renderIssueDetail(id)`）
3. 绑新页面事件（表单提交、状态切换）
4. 重绑 `bindLearnables()` 让新页面的 learnable 元素可点
5. 滚动到顶部

## 五、状态持久化

**localStorage key**：`gh-guide-v1-data`

```js
state.repo = {
  name: 'my-first-repo',
  description: '...',
  visibility: 'public',
  defaultBranch: 'main',
  branchProtection: false,
  collaborators: ['ALT-s25', 'alice', 'bob'],
}
state.issues = {
  '1': { id, title, body, state: 'open'|'closed', author, labels, comments: [{id, author, body, createdAt}], createdAt },
  ...
}
state.pulls = {
  '1': { id, title, state: 'open'|'merged'|'closed', author, base, head, body, diff, reviews: [{reviewer, status: 'approved'|'changes_requested'|'commented'}], commits: [{sha, title, author, createdAt}], createdAt },
  ...
}
```

**关键操作**：
- Close issue → 改 `state.issues[id].state = 'closed'` + save
- New comment → push 进 `comments` 数组 + save
- PR Approve → push 进 `reviews` + save
- Settings 改值 → 更新 `state.repo` 字段 + save
- 重置按钮（在 resetModal 现有逻辑里加 data 字段）→ 恢复默认

**数据初始化**：首次访问时用默认数据（写死 2-3 条 issue / PR / 5 个 commit / 10 个设置项默认值）

## 六、技术方案

**架构**：独立 render 函数（与现有 `renderTabContent` 风格一致）

```js
// === Code ===
renderCodeList()         // README + 文件树
renderCodeFile(path)     // 文件详情
renderCodeHistory(path)  // 提交历史

// === Issues ===
renderIssuesList()
renderIssueDetail(id)
renderIssueComment(id, cid)

// === Pull requests ===
renderPrList()
renderPrDetail(id)
renderCommitDetail(id, sha)

// === Settings ===
renderSettingsList()
renderSettingDetail(name)

// 路由
navigate(tab, level, params)
renderBreadcrumb()
```

**不引入**：框架、路由库、状态库（保持纯原生 JS）

## 七、UI 一致性

- 全部用现有 GitHub 风格组件（`btn-primary` / `btn-secondary` / `label-*`）
- 复用 `learnModal`（解释器、命令、彩蛋对新页面依然有效）
- 顶部导航"学习提示" 卡保留
- 主题切换不变
- 新页面的表单 / 状态切换统一用 toast 反馈（保留现有 `showToast`）

## 八、文件改动清单

**修改**：
- `app.js`：+12 个 render 函数 + `navigate` + `renderBreadcrumb` + state 初始化 + save/load
- `data.js`：+默认 issue/PR/commit 数据（issue 2-3 条、PR 2 条、commit 5-7 条）
- `index.html`：无结构变化（面包屑由 render 函数生成在 tabContent 顶部）

**新增**：
- `app.js` 里新增 `pages` 命名空间组织新函数

**不修改**：
- 顶部导航（5 个下拉菜单）
- 侧栏 4 个面板
- learnable 数据（除非某个新元素需要解释）

## 九、测试计划

- puppeteer 脚本验证：
  - 点 Code → README 详情可显示
  - 点文件树 → L2 详情 + 面包屑正确
  - 点 History → L3 commit 列表
  - Issues 列表 → L2 → 新增评论 → 重刷新评论仍在
  - Settings General → 改仓库名 → 重刷新名称保持
  - 主题切换 / 命令速查 / 推荐资源 不被影响
- 浏览器手工测试 + 截图

## 十、不做什么（YAGNI）

- ❌ 顶部 17 个下拉子项的独立页面（下一轮）
- ❌ 其他 4 个 Tab 的多层扩展（下一轮）
- ❌ 路由 hash 化（URL 不变，刷新回到 L1）
- ❌ 多语言切换
- ❌ 真实 GitHub API 对接
- ❌ 协作实时同步
- ❌ 文件上传 / 编辑器（仅渲染只读 + 表单模拟）

## 十一、风险与回退

- **风险**：state 结构复杂、容易出 bug
  - 缓解：所有写操作经过一个 `mutate(path, value)` 函数，集中 save
- **风险**：渲染函数多，文件变长
  - 缓解：app.js 当前 580 行，加 12 个函数 + state 后预计 1200 行内。仍可接受
- **回退**：localStorage 数据 schema 不兼容时，旧 key 会被忽略、自动用默认数据初始化

---

**需要用户确认**：
1. 范围（本次只做 4 个核心 Tab × 3 层）是否正确
2. 顶部下拉子项延后到下一轮是否可以
3. L1 / L2 / L3 的内容设计是否符合预期
4. 状态持久化（localStorage）的方案 OK 吗
