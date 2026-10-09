# GitHub 新手探索站 · 多层详情页扩展实施计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 把当前 8 个 Tab 的"单层占位"扩展为 4 个核心 Tab × 3 层可导航详情结构（12 个新页面），全交互 + localStorage 状态持久化，可发布到 GitHub。

**Architecture:** 独立 render 函数 + navigate 路由 + 状态层（state 工厂 + mutate）。保持现有 3 文件结构（app.js / data.js / index.html），不引入框架、不引入路由库。

**Tech Stack:** 原生 HTML + Tailwind CDN + Font Awesome 4.7.0 + Vanilla JS + localStorage。测试用 puppeteer（在 `/tmp` 跑脚本，不入项目）。

## Global Constraints

- **CLAUDE.md 全局规则**：始终简体中文回答 / Tailwind CDN `https://cdn.tailwindcss.com` / Font Awesome 4.7.0 / 不主动启停服务
- **代码风格**：保持现有 app.js 风格（render 函数、模版字符串、`$('#id')` 选择器、`bindLearnables()` 重绑）
- **Git 提交**：中文 commit message，**不加** `🤖 Generated with Claude Code` 标记
- **可发布到 GitHub**：项目根干净（无截图入仓）、README 完整
- **不使用框架**：纯原生 JS
- **不修改 index.html**：面包屑由 render 函数生成在 tabContent 顶部
- **localStorage key**：使用 `gh-guide-v1-data`（与现有 `gh-guide-v1` / `gh-guide-v1-theme` / `gh-guide-v1-visited` 并存，不冲突）

---

## File Structure

**修改**：
- `app.js`：+12 个 render 函数 + navigate + renderBreadcrumb + state 层 + 默认数据
- `data.js`：+默认 issue/PR/commit/文件数据（追加到现有文件末尾）

**不修改**：
- `index.html`（结构不变）

**新增**：
- `README.md`：项目说明（任务清单 / 功能 / 如何本地运行 / 部署到 GitHub Pages）
- `.gitignore`：忽略测试时生成的本地文件

**清理**：
- 删除项目内所有 `screenshot-*.png`（之前 puppeteer 调试产物，不入仓）

---

## Task 1: 项目初始化 + 清理 + 第一次提交

**Files:**
- Create: `C:\Users\26918\github-guide\.gitignore`
- Create: `C:\Users\26918\github-guide\README.md`
- Delete: 所有 `C:\Users\26918\github-guide\screenshot-*.png`

**目的**：把项目初始化为 git 仓库，建立干净的可发布基础。

- [ ] **Step 1: 删除旧截图文件**

```bash
cd "C:/Users/26918/github-guide"
rm -f screenshot-*.png
```

- [ ] **Step 2: 创建 .gitignore**

写入 `C:\Users\26918\github-guide\.gitignore`：

```
# 测试产物
screenshot-*.png

# 系统
.DS_Store
Thumbs.db

# 编辑器
.vscode/
.idea/
*.swp
```

- [ ] **Step 3: git init + 首次提交**

```bash
cd "C:/Users/26918/github-guide"
git init
git add .
git commit -m "初始化：GitHub 新手探索站基础版本"
```

**验证**：
```bash
git log --oneline | head -3
ls -la | head -15
```
预期：1 个 commit，目录里无 screenshot-*.png。

---

## Task 2: 状态层（state 工厂 + 持久化）

**Files:**
- Modify: `C:\Users\26918\github-guide\app.js`（在文件末尾 `// ============ 启动 ============` 之前追加新代码段）

**目的**：建立 state 持久化机制（localStorage + mutate 帮助函数）。

- [ ] **Step 1: 在 app.js 顶部查 state 全局变量定义位置**

```bash
grep -n "^const state\|^let state\|^var state\|let state =" C:/Users/26918/github-guide/app.js | head -5
```
找到现有 state 定义位置。在下方插入新代码段。

- [ ] **Step 2: 在 app.js 末尾 DOMContentLoaded 监听前插入状态层代码**

把以下代码作为新段落插入（紧接 `// ============ 启动 ============` 之前）：

```javascript
// ============ 状态层（详情页用）============
const DATA_KEY = STORAGE_KEY + '-data';  // 'gh-guide-v1-data'

function defaultData() {
  return {
    repo: {
      name: 'my-first-repo',
      description: '我的第一个仓库 · 用来学习 GitHub 基础操作',
      visibility: 'public',
      defaultBranch: 'main',
      branchProtection: false,
      collaborators: ['ALT-s25'],
    },
    issues: {
      '1': {
        id: 1, title: 'Welcome to your first issue!',
        body: '这是你的第一条 issue，试试回复或关闭它。',
        state: 'open', author: 'ALT-s25', labels: ['good first issue', 'documentation'],
        createdAt: '2026-10-08T10:00:00Z',
        comments: [
          { id: 1, author: 'ALT-s25', body: '欢迎来到 GitHub！', createdAt: '2026-10-08T10:05:00Z' },
        ],
      },
      '2': {
        id: 2, title: 'Discuss: README 应该包含哪些内容？',
        body: '大家觉得一个好的 README 应该写什么？',
        state: 'open', author: 'ALT-s25', labels: ['question'],
        createdAt: '2026-10-08T12:00:00Z',
        comments: [],
      },
      '3': {
        id: 3, title: '修复 README 中的错别字',
        body: '"基于" 写成了 "机于"。',
        state: 'closed', author: 'ALT-s25', labels: ['bug'],
        createdAt: '2026-10-07T09:00:00Z',
        comments: [],
      },
    },
    pulls: {
      '1': {
        id: 1, title: 'Add Skills link to README',
        state: 'open', author: 'ALT-s25',
        base: 'main', head: 'feature/skills-link',
        body: '在 README 加上 GitHub Skills 互动课的链接。',
        createdAt: '2026-10-08T14:00:00Z',
        reviews: [],
        commits: [
          { sha: 'a1b2c3d', title: 'add skills link', author: 'ALT-s25', createdAt: '2026-10-08T13:55:00Z' },
          { sha: 'e4f5g6h', title: 'typo fix', author: 'ALT-s25', createdAt: '2026-10-08T13:58:00Z' },
        ],
      },
      '2': {
        id: 2, title: 'Update code-block styling',
        state: 'merged', author: 'ALT-s25',
        base: 'main', head: 'feature/code-style',
        body: '改进代码块样式。',
        createdAt: '2026-10-06T11:00:00Z',
        reviews: [{ reviewer: 'alice', status: 'approved', createdAt: '2026-10-06T12:00:00Z' }],
        commits: [
          { sha: 'i7j8k9l', title: 'style: code block', author: 'ALT-s25', createdAt: '2026-10-06T10:55:00Z' },
        ],
      },
    },
    files: {
      'README.md': { path: 'README.md', size: '1.2 KB', lines: 45, lastModified: '2 days ago', content: '# my-first-repo 👋\n\n这是我的第一个 GitHub 仓库，用来记录学习过程。\n\n## 快速开始\n\n```bash\ngit clone git@github.com:ALT-s25/my-first-repo.git\ncd my-first-repo\necho "Hello GitHub!" >> README.md\ngit add . && git commit -m "first commit"\ngit push\n```\n\n## 学习进度\n\n- ✅ 注册 GitHub 账号\n- ⏳ 配置 SSH\n- ⬜ 第一次 commit\n' },
      'index.html': { path: 'index.html', size: '320 B', lines: 18, lastModified: '3 days ago', content: '<!DOCTYPE html>\n<html lang="zh-CN">\n<head>\n  <meta charset="UTF-8">\n  <title>My First Repo</title>\n</head>\n<body>\n  <h1>Hello GitHub!</h1>\n  <p>这是我的第一个静态页面。</p>\n</body>\n</html>' },
      '.gitignore': { path: '.gitignore', size: '64 B', lines: 4, lastModified: '5 days ago', content: 'node_modules/\n.DS_Store\n*.log\n.env' },
      'package.json': { path: 'package.json', size: '210 B', lines: 12, lastModified: '4 days ago', content: '{\n  "name": "my-first-repo",\n  "version": "1.0.0",\n  "description": "学习 GitHub 用",\n  "main": "index.js",\n  "scripts": {\n    "start": "node index.js"\n  }\n}' },
    },
  };
}

function loadData() {
  try {
    const raw = localStorage.getItem(DATA_KEY);
    if (!raw) return defaultData();
    return Object.assign(defaultData(), JSON.parse(raw));
  } catch {
    return defaultData();
  }
}

function saveData() {
  try {
    localStorage.setItem(DATA_KEY, JSON.stringify(data));
  } catch (e) {
    console.warn('保存失败', e);
  }
}

let data = loadData();

// 通用 mutator：mutate('issues.1.state', 'closed') 或 mutate('repo.name', 'foo')
function mutate(path, value) {
  const keys = path.split('.');
  let obj = data;
  for (let i = 0; i < keys.length - 1; i++) {
    if (!obj[keys[i]]) obj[keys[i]] = {};
    obj = obj[keys[i]];
  }
  obj[keys[keys.length - 1]] = value;
  saveData();
}
```

- [ ] **Step 3: 在 puppeteer 中验证 state 加载和 mutate**

写测试脚本 `C:\tmp\test-state.js`：

```javascript
const puppeteer = require('puppeteer');
(async () => {
  const browser = await puppeteer.launch({ headless: 'new', args: ['--no-sandbox', '--disable-setuid-sandbox'] });
  const page = await browser.newPage();
  await page.goto('http://localhost:8766/', { waitUntil: 'networkidle0' });
  await page.evaluate(() => localStorage.removeItem('gh-guide-v1-data'));
  await page.reload({ waitUntil: 'networkidle0' });
  await new Promise(r => setTimeout(r, 800));

  const r = await page.evaluate(() => ({
    hasIssues: typeof issues !== 'undefined' ? Object.keys(issues).length : 'unavail',
    dataKey: 'gh-guide-v1-data',
    defaultLoaded: !!localStorage.getItem('gh-guide-v1-data'),
  }));
  console.log(JSON.stringify(r));
  await browser.close();
})();
```

```bash
cd /tmp && NODE_PATH=/tmp/node_modules node C:/tmp/test-state.js
```
预期输出：`{"hasIssues":"unavail","dataKey":"gh-guide-v1-data","defaultLoaded":false}`（data 模块在 window 不可见但 state 函数存在；defaultLoaded 是 false 因为还没人调用 mutate）

- [ ] **Step 4: commit**

```bash
cd "C:/Users/26918/github-guide"
git add app.js
git commit -m "数据层：state 工厂 + localStorage 持久化"
```

---

## Task 3: 路由层（navigate + breadcrumb）

**Files:**
- Modify: `C:\Users\26918\github-guide\app.js`（在 Task 2 新增代码后追加）

**目的**：建立页面路由机制（navigate 函数 + breadcrumb 渲染 + view 状态跟踪）。

- [ ] **Step 1: 在 app.js 追加路由层代码**

```javascript
// ============ 路由层 ============
const view = { tab: 'code', level: 1, params: {} };

const TAB_NAMES = { code: 'Code', issues: 'Issues', pulls: 'Pull requests', actions: 'Actions', projects: 'Projects', security: 'Security', insights: 'Insights', settings: 'Settings' };

function renderBreadcrumb() {
  const bc = $('#breadcrumb');
  if (!bc) return;
  const { tab, level, params } = view;
  const segs = ['<a href="#" data-nav="root" class="hover:underline">仓库</a>'];
  if (level >= 1) segs.push(`<a href="#" data-nav="tab:${tab}" class="hover:underline">${TAB_NAMES[tab]}</a>`);
  if (level >= 2 && params.id) {
    const title = (data.issues[params.id] || data.pulls[params.id] || data.files[params.id])?.title || data.files[params.id]?.path || `#${params.id}`;
    segs.push(`<span class="text-gh-700 dark:text-gh-300">#${params.id} ${escapeHtml(title)}</span>`);
  }
  if (level >= 3) {
    if (params.cid) segs.push(`<span class="text-gh-700 dark:text-gh-300">评论 #${params.cid}</span>`);
    if (params.sha) segs.push(`<span class="text-gh-700 dark:text-gh-300 font-mono text-xs">${params.sha.slice(0, 7)}</span>`);
  }
  const back = level > 1 ? `<button id="bcBack" class="mr-2 px-2 py-0.5 rounded hover:bg-gh-100 dark:hover:bg-[#21262d] text-gh-600 dark:text-gh-400 text-xs">← 返回</button>` : '';
  bc.innerHTML = `${back}${segs.join(' <span class="text-gh-400 mx-1">/</span> ')}`;
  const backBtn = $('#bcBack');
  if (backBtn) backBtn.addEventListener('click', goBack);
}

function escapeHtml(s) {
  if (!s) return '';
  return String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}

function showToast(msg, type = 'info') {
  const t = document.createElement('div');
  t.className = `fixed bottom-6 right-6 px-4 py-2 rounded-md shadow-lg text-sm z-50 ${type === 'success' ? 'bg-[#1f883d] text-white' : 'bg-gh-700 text-white'}`;
  t.textContent = msg;
  document.body.appendChild(t);
  setTimeout(() => t.remove(), 2200);
}

function navigate(tab, level, params = {}) {
  view.tab = tab;
  view.level = level;
  view.params = params;
  // 更新 active tab
  $$('.tab-btn').forEach(b => b.classList.toggle('tab-active', b.dataset.tab === tab));
  renderTabContent(tab);
  renderBreadcrumb();
  window.scrollTo(0, 0);
}

function goBack() {
  if (view.level > 1) navigate(view.tab, view.level - 1, view.params);
}
```

- [ ] **Step 2: 在 `renderTabContent` 函数开头插入面包屑容器**

修改 `renderTabContent` 函数的第一行（位置在 `const main = $('#tabContent');` 之后）：

```javascript
function renderTabContent(tab) {
  const main = $('#tabContent');
  // 面包屑容器（仅 L2/L3 显示）
  const breadcrumb = view.level >= 2
    ? '<div id="breadcrumb" class="text-xs text-gh-500 mb-3 px-1"></div>'
    : '';
  if (tab === 'code') {
    main.innerHTML = breadcrumb + `
      <div class="border ... // 原有代码
```

> 注：完整改造在 Task 4-7 完成。这里先确保 breadcrumb 容器在每个 L2/L3 tab 顶部存在。

- [ ] **Step 3: 验证路由函数**

写 `C:\tmp\test-router.js`：

```javascript
const puppeteer = require('puppeteer');
(async () => {
  const browser = await puppeteer.launch({ headless: 'new', args: ['--no-sandbox', '--disable-setuid-sandbox'] });
  const page = await browser.newPage();
  page.on('pageerror', e => console.log('  err:', e.message));
  await page.goto('http://localhost:8766/', { waitUntil: 'networkidle0' });
  await new Promise(r => setTimeout(r, 1000));

  // 验证 navigate 函数在 window 上
  const r = await page.evaluate(() => ({
    hasNavigate: typeof navigate === 'function',
    viewInit: typeof view === 'object' ? JSON.stringify(view) : 'no',
    breadcrumbContainer: !!document.getElementById('breadcrumb'),
  }));
  console.log(JSON.stringify(r));
  await browser.close();
})();
```

```bash
cd /tmp && NODE_PATH=/tmp/node_modules node C:/tmp/test-router.js
```
预期：`{"hasNavigate":true,"viewInit":"{\"tab\":\"code\",\"level\":1,\"params\":{}}","breadcrumbContainer":false}`（L1 时无 breadcrumb）

- [ ] **Step 4: commit**

```bash
cd "C:/Users/26918/github-guide"
git add app.js
git commit -m "路由层：navigate + 面包屑 + view 状态"
```

---

## Task 4: Code Tab 三层（文件树 + 文件详情 + 提交历史）

**Files:**
- Modify: `C:\Users\26918\github-guide\app.js`（替换 `tab === 'code'` 分支，新增 3 个 render 函数）

**目的**：Code tab 支持点文件进入详情、点 History 看提交历史。

- [ ] **Step 1: 替换 `tab === 'code'` 分支**

把 `renderTabContent` 里 `if (tab === 'code')` 整段替换为：

```javascript
  if (tab === 'code') {
    renderCodeList(main, breadcrumb);
    return;
  }
```

- [ ] **Step 2: 在 app.js 末尾（DOMContentLoaded 前）追加 3 个 Code render 函数**

```javascript
// ============ Code Tab ============
function renderCodeList(main, breadcrumb) {
  const fileEntries = Object.values(data.files).map(f => {
    const active = f.path === 'README.md' ? 'bg-[#ddf4ff] dark:bg-[#0d2944] text-[#0969da] dark:text-[#58a6ff] font-semibold' : 'hover:bg-gh-100 dark:hover:bg-[#161b22]';
    return `<a href="#" class="nav-to-file ${active} block px-3 py-1.5 text-sm rounded" data-path="${f.path}">📄 ${f.path}</a>`;
  }).join('');
  main.innerHTML = breadcrumb + `
    <div class="grid grid-cols-1 md:grid-cols-[200px_1fr] gap-4">
      <aside class="border border-gh-200 dark:border-[#30363d] rounded-md bg-white dark:bg-[#0d1117] p-2 self-start">
        <div class="text-xs font-semibold text-gh-500 px-3 py-2 uppercase">文件</div>
        ${fileEntries}
      </aside>
      <div class="border border-gh-200 dark:border-[#30363d] rounded-md bg-white dark:bg-[#0d1117]">
        <div class="flex items-center justify-between p-3 border-b border-gh-200 dark:border-[#30363d]">
          <span class="learnable flex items-center gap-2 text-sm" data-learnable="branch-selector">
            <i class="fa fa-code-branch text-gh-500"></i>
            <span class="font-semibold">${escapeHtml(data.repo.defaultBranch)}</span>
            <i class="fa fa-caret-down text-xs text-gh-500"></i>
          </span>
          <div class="flex items-center gap-2">
            <button id="codeHistory" class="learnable btn btn-secondary text-xs" data-learnable="code-history"><i class="fa fa-history"></i> History</button>
            <button class="learnable btn btn-secondary text-xs" data-learnable="add-file"><i class="fa fa-plus"></i> Add file</button>
          </div>
        </div>
        <article class="p-6 markdown-body">
          <h1 class="text-3xl font-semibold border-b border-gh-200 dark:border-[#30363d] pb-2 mb-4">my-first-repo 👋</h1>
          <p class="text-gh-600 dark:text-[#8b949e] mb-4">这是我的第一个 GitHub 仓库，用来记录学习过程。</p>
          <h2 class="text-2xl font-semibold border-b border-gh-200 dark:border-[#30363d] pb-1 mb-3 mt-6">快速开始</h2>
          <pre class="code-block"><span class="prompt">$</span> <span class="cmd">git clone</span> git@github.com:ALT-s25/my-first-repo.git
<span class="prompt">$</span> <span class="cmd">cd</span> my-first-repo
<span class="prompt">$</span> <span class="cmd">echo</span> "Hello GitHub!" &gt;&gt; README.md
<span class="prompt">$</span> <span class="cmd">git add</span> . &amp;&amp; <span class="cmd">git commit</span> -m "first commit"
<span class="prompt">$</span> <span class="cmd">git push</span></pre>
        </article>
      </div>
    </div>
  `;
  $$('.nav-to-file').forEach(a => a.addEventListener('click', e => {
    e.preventDefault();
    navigate('code', 2, { path: a.dataset.path });
  }));
  const histBtn = $('#codeHistory');
  if (histBtn) histBtn.addEventListener('click', () => {
    navigate('code', 3, { path: 'README.md' });
  });
}

function renderCodeFile(main, breadcrumb, path) {
  const file = data.files[path];
  if (!file) { main.innerHTML = '<p>文件不存在</p>'; return; }
  view.params = { path };
  main.innerHTML = breadcrumb + `
    <div class="border border-gh-200 dark:border-[#30363d] rounded-md bg-white dark:bg-[#0d1117]">
      <div class="flex items-center justify-between p-3 border-b border-gh-200 dark:border-[#30363d]">
        <div class="text-sm">
          <i class="fa fa-file-text-o text-gh-500"></i>
          <span class="font-semibold ml-1">${escapeHtml(file.path)}</span>
          <span class="text-xs text-gh-500 ml-2">${file.size} · ${file.lines} 行 · ${file.lastModified}</span>
        </div>
        <div class="flex items-center gap-2">
          <button id="copyFile" class="btn btn-secondary text-xs"><i class="fa fa-copy"></i> Copy</button>
          <button id="rawFile" class="btn btn-secondary text-xs">Raw</button>
          <button id="fileHistory" class="btn btn-secondary text-xs"><i class="fa fa-history"></i> History</button>
        </div>
      </div>
      <pre class="p-4 text-xs overflow-x-auto font-mono leading-relaxed">${escapeHtml(file.content)}</pre>
    </div>
  `;
  $('#copyFile')?.addEventListener('click', () => { navigator.clipboard.writeText(file.content).then(() => showToast('已复制到剪贴板', 'success')); });
  $('#rawFile')?.addEventListener('click', () => showToast('Raw 视图（演示模式）', 'info'));
  $('#fileHistory')?.addEventListener('click', () => navigate('code', 3, { path }));
}

function renderCodeHistory(main, breadcrumb, path) {
  const commits = data.pulls['1'].commits.concat(data.pulls['2'].commits);
  main.innerHTML = breadcrumb + `
    <div class="border border-gh-200 dark:border-[#30363d] rounded-md bg-white dark:bg-[#0d1117]">
      <div class="p-4 border-b border-gh-200 dark:border-[#30363d]">
        <h2 class="text-lg font-semibold"><i class="fa fa-history text-gh-500"></i> 提交历史：${escapeHtml(path)}</h2>
      </div>
      <ul class="divide-y divide-gh-200 dark:divide-[#30363d]">
        ${commits.map(c => `
          <li class="p-4 hover:bg-gh-50 dark:hover:bg-[#161b22]">
            <a href="#" class="nav-to-commit block" data-sha="${c.sha}" data-prid="1">
              <div class="text-sm font-semibold text-[#0969da] hover:underline">${escapeHtml(c.title)}</div>
              <div class="text-xs text-gh-500 mt-1">
                <span class="font-mono">${c.sha.slice(0, 7)}</span>
                · ${escapeHtml(c.author)}
                · ${c.createdAt.slice(0, 10)}
              </div>
            </a>
          </li>
        `).join('')}
      </ul>
    </div>
  `;
  $$('.nav-to-commit').forEach(a => a.addEventListener('click', e => {
    e.preventDefault();
    navigate('pulls', 3, { id: a.dataset.prid, sha: a.dataset.sha });
  }));
}
```

- [ ] **Step 3: 验证 Code 三层**

写 `C:\tmp\test-code.js`：

```javascript
const puppeteer = require('puppeteer');
(async () => {
  const browser = await puppeteer.launch({ headless: 'new', args: ['--no-sandbox', '--disable-setuid-sandbox'] });
  const page = await browser.newPage();
  page.on('pageerror', e => console.log('  err:', e.message));
  await page.goto('http://localhost:8766/', { waitUntil: 'networkidle0' });
  await new Promise(r => setTimeout(r, 1000));

  // 1. Code L1 显示文件树
  const l1 = await page.evaluate(() => ({
    fileCount: document.querySelectorAll('.nav-to-file').length,
    hasHistoryBtn: !!document.getElementById('codeHistory'),
  }));
  console.log('L1:', JSON.stringify(l1));

  // 2. 点 README → L2
  await page.evaluate(() => document.querySelector('.nav-to-file[data-path="README.md"]').click());
  await new Promise(r => setTimeout(r, 500));
  const l2 = await page.evaluate(() => ({
    breadcrumb: document.getElementById('breadcrumb')?.textContent.slice(0, 60),
    filePath: document.querySelector('.font-semibold.ml-1')?.textContent,
    hasContent: document.querySelector('pre.font-mono')?.textContent.length > 50,
  }));
  console.log('L2:', JSON.stringify(l2));

  // 3. 点 History → L3
  await page.evaluate(() => document.getElementById('fileHistory').click());
  await new Promise(r => setTimeout(r, 500));
  const l3 = await page.evaluate(() => ({
    breadcrumb: document.getElementById('breadcrumb')?.textContent.slice(0, 80),
    commitCount: document.querySelectorAll('.nav-to-commit').length,
  }));
  console.log('L3:', JSON.stringify(l3));

  await browser.close();
})();
```

```bash
cd /tmp && NODE_PATH=/tmp/node_modules node C:/tmp/test-code.js
```
预期：
- L1: `{"fileCount":4,"hasHistoryBtn":true}`
- L2: `{"breadcrumb":"← 返回 仓库 / Code / README.md","filePath":"README.md","hasContent":true}`
- L3: `{"breadcrumb":"← 返回 仓库 / Code / README.md","commitCount":3}`

- [ ] **Step 4: 截图 + commit**

```bash
cd "C:/Users/26918/github-guide"
git add app.js
git commit -m "Code Tab：文件树 + 文件详情 + 提交历史"
```

---

## Task 5: Issues Tab 三层（列表 + 详情 + 评论 thread）

**Files:**
- Modify: `C:\Users\26918\github-guide\app.js`（替换 `tab === 'issues'` 分支，新增 3 个 render 函数）

**目的**：Issues tab 支持查看详情、新增评论、关闭/重开。

- [ ] **Step 1: 替换 `tab === 'issues'` 分支**

把 `if (tab === 'issues')` 整段替换为：

```javascript
  if (tab === 'issues') {
    renderIssuesList(main, breadcrumb);
    return;
  }
```

- [ ] **Step 2: 在 app.js 末尾追加 Issues render 函数**

```javascript
// ============ Issues Tab ============
function renderIssuesList(main, breadcrumb) {
  const issueArr = Object.values(data.issues);
  main.innerHTML = breadcrumb + `
    <div class="border border-gh-200 dark:border-[#30363d] rounded-md bg-white dark:bg-[#0d1117]">
      <div class="flex items-center justify-between p-3 border-b border-gh-200 dark:border-[#30363d]">
        <div class="flex items-center gap-3">
          <input type="text" placeholder="is:open is:issue" class="learnable text-sm px-3 py-1.5 rounded-md bg-gh-50 dark:bg-[#0d1117] border border-gh-200 dark:border-[#30363d] w-64 focus:border-[#0969da] focus:outline-none" data-learnable="issue-search">
          <button class="learnable btn btn-secondary text-xs" data-learnable="issue-labels">Labels <i class="fa fa-caret-down text-xs"></i></button>
        </div>
        <button id="newIssueBtn" class="learnable btn btn-primary text-xs" data-learnable="new-issue"><i class="fa fa-plus"></i> New issue</button>
      </div>
      <ul class="divide-y divide-gh-200 dark:divide-[#30363d]">
        ${issueArr.map(i => `
          <li>
            <a href="#" class="nav-to-issue flex items-center gap-3 p-3 hover:bg-gh-50 dark:hover:bg-[#161b22]" data-id="${i.id}">
              <i class="fa ${i.state === 'open' ? 'fa-exclamation-circle text-[#1a7f37]' : 'fa-check-circle text-[#8250df]'}"></i>
              <div class="flex-1 min-w-0">
                <div class="text-sm font-semibold text-[#0969da]">${escapeHtml(i.title)}</div>
                <div class="text-xs text-gh-500 mt-0.5">#${i.id} opened ${i.createdAt.slice(0, 10)} by ${escapeHtml(i.author)}</div>
              </div>
              <div class="flex items-center gap-1.5">
                ${i.labels.map(l => `<span class="label label-${l.includes('bug') ? 'red' : l.includes('good') ? 'green' : 'purple'}">${escapeHtml(l)}</span>`).join('')}
              </div>
            </a>
          </li>
        `).join('')}
      </ul>
    </div>
  `;
  $$('.nav-to-issue').forEach(a => a.addEventListener('click', e => {
    e.preventDefault();
    navigate('issues', 2, { id: a.dataset.id });
  }));
  $('#newIssueBtn')?.addEventListener('click', () => showNewIssueModal());
}

function showNewIssueModal() {
  const m = $('#newIssueModal');
  if (m) { m.classList.remove('hidden'); return; }
  const modal = document.createElement('div');
  modal.id = 'newIssueModal';
  modal.className = 'fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4';
  modal.innerHTML = `
    <div class="bg-white dark:bg-[#161b22] rounded-lg shadow-2xl max-w-xl w-full border border-gh-200 dark:border-[#30363d]">
      <div class="flex items-center justify-between p-4 border-b border-gh-200 dark:border-[#30363d]">
        <h2 class="font-semibold">新建 issue</h2>
        <button id="cancelNewIssue" class="w-8 h-8 flex items-center justify-center rounded-md hover:bg-gh-100 dark:hover:bg-[#21262d]">×</button>
      </div>
      <div class="p-4 space-y-3">
        <input id="newIssueTitle" type="text" placeholder="标题" class="w-full px-3 py-2 border border-gh-200 dark:border-[#30363d] rounded-md bg-white dark:bg-[#0d1117] text-sm">
        <textarea id="newIssueBody" rows="5" placeholder="描述（支持 Markdown）" class="w-full px-3 py-2 border border-gh-200 dark:border-[#30363d] rounded-md bg-white dark:bg-[#0d1117] text-sm"></textarea>
      </div>
      <div class="flex justify-end gap-2 p-4 border-t border-gh-200 dark:border-[#30363d]">
        <button id="cancelNewIssue2" class="btn btn-secondary">取消</button>
        <button id="submitNewIssue" class="btn btn-primary">提交</button>
      </div>
    </div>
  `;
  document.body.appendChild(modal);
  const close = () => modal.remove();
  $('#cancelNewIssue').onclick = close;
  $('#cancelNewIssue2').onclick = close;
  $('#submitNewIssue').onclick = () => {
    const title = $('#newIssueTitle').value.trim();
    const body = $('#newIssueBody').value.trim();
    if (!title) return showToast('标题不能为空', 'info');
    const id = String(Date.now());
    data.issues[id] = { id: parseInt(id), title, body, state: 'open', author: 'ALT-s25', labels: [], createdAt: new Date().toISOString(), comments: [] };
    saveData();
    close();
    showToast('Issue 已创建', 'success');
    navigate('issues', 1, {});
  };
}

function renderIssueDetail(main, breadcrumb, id) {
  const issue = data.issues[id];
  if (!issue) { main.innerHTML = '<p>Issue 不存在</p>'; return; }
  view.params = { id };
  main.innerHTML = breadcrumb + `
    <div class="space-y-4">
      <div class="border border-gh-200 dark:border-[#30363d] rounded-md bg-white dark:bg-[#0d1117]">
        <div class="p-4 border-b border-gh-200 dark:border-[#30363d]">
          <h1 class="text-2xl font-semibold">${escapeHtml(issue.title)} <span class="text-base font-normal text-gh-500">#${issue.id}</span></h1>
          <div class="text-xs text-gh-500 mt-2">
            <button id="toggleIssueState" class="px-2 py-0.5 rounded-full text-xs font-semibold ${issue.state === 'open' ? 'bg-[#1a7f37] text-white' : 'bg-[#8250df] text-white'}">${issue.state === 'open' ? 'Open' : 'Closed'}</button>
            <span class="ml-2">${escapeHtml(issue.author)} 开启于 ${issue.createdAt.slice(0, 10)}</span>
          </div>
        </div>
        <div class="p-4">
          <p class="text-sm whitespace-pre-wrap">${escapeHtml(issue.body)}</p>
        </div>
      </div>

      <div class="border border-gh-200 dark:border-[#30363d] rounded-md bg-white dark:bg-[#0d1117] p-4">
        <h3 class="text-sm font-semibold mb-2">💬 评论 (${issue.comments.length})</h3>
        <ul class="space-y-3 mb-4">
          ${issue.comments.map(c => `
            <li class="border border-gh-200 dark:border-[#30363d] rounded p-3 nav-to-comment cursor-pointer hover:bg-gh-50 dark:hover:bg-[#161b22]" data-cid="${c.id}">
              <div class="text-xs text-gh-500 mb-1"><strong>${escapeHtml(c.author)}</strong> · ${c.createdAt.slice(0, 10)}</div>
              <div class="text-sm">${escapeHtml(c.body)}</div>
            </li>
          `).join('')}
        </ul>
        <div class="border-t border-gh-200 dark:border-[#30363d] pt-3">
          <textarea id="newCommentBody" rows="2" placeholder="写下你的评论..." class="w-full px-3 py-2 border border-gh-200 dark:border-[#30363d] rounded-md bg-white dark:bg-[#0d1117] text-sm"></textarea>
          <div class="flex justify-end mt-2">
            <button id="submitComment" class="btn btn-primary text-xs">评论</button>
          </div>
        </div>
      </div>
    </div>
  `;
  $('#toggleIssueState')?.addEventListener('click', () => {
    mutate(`issues.${id}.state`, issue.state === 'open' ? 'closed' : 'open');
    showToast(`Issue 已${issue.state === 'open' ? '关闭' : '重开'}`, 'success');
    navigate('issues', 2, { id });
  });
  $('#submitComment')?.addEventListener('click', () => {
    const body = $('#newCommentBody').value.trim();
    if (!body) return showToast('评论不能为空', 'info');
    const cid = Date.now();
    issue.comments.push({ id: cid, author: 'ALT-s25', body, createdAt: new Date().toISOString() });
    saveData();
    showToast('评论已发布', 'success');
    navigate('issues', 2, { id });
  });
  $$('.nav-to-comment').forEach(li => li.addEventListener('click', () => {
    navigate('issues', 3, { id, cid: li.dataset.cid });
  }));
}

function renderIssueComment(main, breadcrumb, id, cid) {
  const issue = data.issues[id];
  const c = issue?.comments.find(x => String(x.id) === String(cid));
  if (!c) { main.innerHTML = '<p>评论不存在</p>'; return; }
  view.params = { id, cid };
  main.innerHTML = breadcrumb + `
    <div class="border border-gh-200 dark:border-[#30363d] rounded-md bg-white dark:bg-[#0d1117] p-5">
      <div class="flex items-center gap-2 mb-3">
        <div class="w-8 h-8 rounded-full bg-[#0969da] text-white flex items-center justify-center text-sm font-semibold">${escapeHtml(c.author[0].toUpperCase())}</div>
        <div>
          <div class="text-sm font-semibold">${escapeHtml(c.author)}</div>
          <div class="text-xs text-gh-500">${c.createdAt.slice(0, 19).replace('T', ' ')}</div>
        </div>
      </div>
      <p class="text-sm whitespace-pre-wrap">${escapeHtml(c.body)}</p>
    </div>
  `;
}
```

- [ ] **Step 3: 验证 Issues 三层**

写 `C:\tmp\test-issues.js`：

```javascript
const puppeteer = require('puppeteer');
(async () => {
  const browser = await puppeteer.launch({ headless: 'new', args: ['--no-sandbox', '--disable-setuid-sandbox'] });
  const page = await browser.newPage();
  page.on('pageerror', e => console.log('  err:', e.message));
  await page.goto('http://localhost:8766/', { waitUntil: 'networkidle0' });
  await page.evaluate(() => { localStorage.removeItem('gh-guide-v1-data'); location.reload(); });
  await new Promise(r => setTimeout(r, 1500));

  // 切到 issues
  await page.evaluate(() => document.querySelector('[data-tab="issues"]').click());
  await new Promise(r => setTimeout(r, 500));

  // L1
  const l1 = await page.evaluate(() => ({
    issueCount: document.querySelectorAll('.nav-to-issue').length,
    newBtn: !!document.getElementById('newIssueBtn'),
  }));
  console.log('L1:', JSON.stringify(l1));

  // 点 #1 → L2
  await page.evaluate(() => document.querySelector('.nav-to-issue[data-id="1"]').click());
  await new Promise(r => setTimeout(r, 500));
  const l2 = await page.evaluate(() => ({
    breadcrumb: document.getElementById('breadcrumb')?.textContent.slice(0, 60),
    title: document.querySelector('h1')?.textContent.slice(0, 30),
    commentCount: document.querySelectorAll('.nav-to-comment').length,
  }));
  console.log('L2:', JSON.stringify(l2));

  // 新建评论
  await page.evaluate(() => {
    document.getElementById('newCommentBody').value = '测试评论';
    document.getElementById('submitComment').click();
  });
  await new Promise(r => setTimeout(r, 500));
  const after = await page.evaluate(() => ({
    commentCount: document.querySelectorAll('.nav-to-comment').length,
  }));
  console.log('after comment:', JSON.stringify(after));

  // 刷新验证持久化
  await page.reload({ waitUntil: 'networkidle0' });
  await new Promise(r => setTimeout(r, 1500));
  await page.evaluate(() => document.querySelector('[data-tab="issues"]').click());
  await new Promise(r => setTimeout(r, 500));
  await page.evaluate(() => document.querySelector('.nav-to-issue[data-id="1"]').click());
  await new Promise(r => setTimeout(r, 500));
  const persist = await page.evaluate(() => document.querySelectorAll('.nav-to-comment').length);
  console.log('persisted comment count:', persist);

  await browser.close();
})();
```

```bash
cd /tmp && NODE_PATH=/tmp/node_modules node C:/tmp/test-issues.js
```
预期：
- L1: `{"issueCount":3,"newBtn":true}`
- L2: `{"breadcrumb":"← 返回 仓库 / Issues / #1","title":"Welcome to your first issue!","commentCount":1}`
- after: `{"commentCount":2}`
- persisted: `2`

- [ ] **Step 4: commit**

```bash
cd "C:/Users/26918/github-guide"
git add app.js
git commit -m "Issues Tab：列表 + 详情 + 评论 thread + 新建评论"
```

---

## Task 6: Pull requests Tab 三层（列表 + diff + commit 详情）

**Files:**
- Modify: `C:\Users\26918\github-guide\app.js`（替换 `tab === 'pulls'` 分支，新增 3 个 render 函数）

**目的**：PR tab 支持查看 diff、Approve/Merge 操作。

- [ ] **Step 1: 替换 `tab === 'pulls'` 分支**

```javascript
  if (tab === 'pulls') {
    renderPrList(main, breadcrumb);
    return;
  }
```

- [ ] **Step 2: 追加 PRs render 函数**

```javascript
// ============ Pull Requests Tab ============
function renderPrList(main, breadcrumb) {
  const prArr = Object.values(data.pulls);
  main.innerHTML = breadcrumb + `
    <div class="border border-gh-200 dark:border-[#30363d] rounded-md bg-white dark:bg-[#0d1117]">
      <div class="flex items-center justify-between p-3 border-b border-gh-200 dark:border-[#30363d]">
        <input type="text" placeholder="is:open is:pr" class="learnable text-sm px-3 py-1.5 rounded-md bg-gh-50 dark:bg-[#0d1117] border border-gh-200 dark:border-[#30363d] w-64 focus:border-[#0969da] focus:outline-none">
        <button id="newPrBtn" class="learnable btn btn-primary text-xs" data-learnable="new-pr"><i class="fa fa-plus"></i> New pull request</button>
      </div>
      <ul class="divide-y divide-gh-200 dark:divide-[#30363d]">
        ${prArr.map(pr => `
          <li>
            <a href="#" class="nav-to-pr flex items-center gap-3 p-3 hover:bg-gh-50 dark:hover:bg-[#161b22]" data-id="${pr.id}">
              <i class="fa ${pr.state === 'open' ? 'fa-git-pull-request text-[#1a7f37]' : pr.state === 'merged' ? 'fa-check-circle text-[#8250df]' : 'fa-times-circle text-[#cf222e]'}"></i>
              <div class="flex-1 min-w-0">
                <div class="text-sm font-semibold text-[#0969da]">${escapeHtml(pr.title)}</div>
                <div class="text-xs text-gh-500 mt-0.5">#${pr.id} ${pr.head} → ${pr.base} · ${escapeHtml(pr.author)} · ${pr.createdAt.slice(0, 10)}</div>
              </div>
              <span class="label ${pr.state === 'open' ? 'label-green' : pr.state === 'merged' ? 'label-purple' : 'label-red'}">${pr.state}</span>
            </a>
          </li>
        `).join('')}
      </ul>
    </div>
  `;
  $$('.nav-to-pr').forEach(a => a.addEventListener('click', e => {
    e.preventDefault();
    navigate('pulls', 2, { id: a.dataset.id });
  }));
  $('#newPrBtn')?.addEventListener('click', () => showToast('新建 PR 需要先 push 分支（演示模式）', 'info'));
}

function renderPrDetail(main, breadcrumb, id) {
  const pr = data.pulls[id];
  if (!pr) { main.innerHTML = '<p>PR 不存在</p>'; return; }
  view.params = { id };
  const reviewSummary = pr.reviews.length === 0
    ? '<span class="text-xs text-gh-500">还没有 review</span>'
    : pr.reviews.map(r => `<span class="label ${r.status === 'approved' ? 'label-green' : 'label-yellow'}">${escapeHtml(r.reviewer)}: ${r.status}</span>`).join(' ');
  main.innerHTML = breadcrumb + `
    <div class="space-y-4">
      <div class="border border-gh-200 dark:border-[#30363d] rounded-md bg-white dark:bg-[#0d1117]">
        <div class="p-4 border-b border-gh-200 dark:border-[#30363d]">
          <h1 class="text-2xl font-semibold">${escapeHtml(pr.title)} <span class="text-base font-normal text-gh-500">#${pr.id}</span></h1>
          <div class="text-xs text-gh-500 mt-2">
            <span class="label ${pr.state === 'open' ? 'label-green' : pr.state === 'merged' ? 'label-purple' : 'label-red'}">${pr.state}</span>
            <span class="ml-2"><strong>${escapeHtml(pr.author)}</strong> 想合并 <code>${escapeHtml(pr.head)}</code> → <code>${escapeHtml(pr.base)}</code></span>
          </div>
          <div class="flex items-center gap-2 mt-3">
            ${pr.state === 'open' ? `
              <button id="approvePr" class="btn btn-primary text-xs"><i class="fa fa-check"></i> Approve</button>
              <button id="mergePr" class="btn btn-primary text-xs" style="background:#8250df"><i class="fa fa-code-fork"></i> Merge</button>
            ` : '<span class="text-xs text-gh-500">已合并</span>'}
          </div>
          <div class="mt-3">${reviewSummary}</div>
        </div>
        <div class="p-4">
          <p class="text-sm whitespace-pre-wrap">${escapeHtml(pr.body)}</p>
        </div>
      </div>

      <div class="border border-gh-200 dark:border-[#30363d] rounded-md bg-white dark:bg-[#0d1117]">
        <div class="p-3 border-b border-gh-200 dark:border-[#30363d]">
          <h3 class="text-sm font-semibold"><i class="fa fa-code-fork text-gh-500"></i> Commits (${pr.commits.length})</h3>
        </div>
        <ul class="divide-y divide-gh-200 dark:divide-[#30363d]">
          ${pr.commits.map(c => `
            <li>
              <a href="#" class="nav-to-pr-commit flex items-center gap-3 p-3 hover:bg-gh-50 dark:hover:bg-[#161b22]" data-sha="${c.sha}">
                <i class="fa fa-commit text-gh-400"></i>
                <div class="flex-1 min-w-0">
                  <div class="text-sm font-semibold">${escapeHtml(c.title)}</div>
                  <div class="text-xs text-gh-500 mt-0.5"><span class="font-mono">${c.sha.slice(0, 7)}</span> · ${escapeHtml(c.author)} · ${c.createdAt.slice(0, 10)}</div>
                </div>
              </a>
            </li>
          `).join('')}
        </ul>
      </div>

      <div class="border border-gh-200 dark:border-[#30363d] rounded-md bg-white dark:bg-[#0d1117]">
        <div class="p-3 border-b border-gh-200 dark:border-[#30363d]">
          <h3 class="text-sm font-semibold"><i class="fa fa-file-code-o text-gh-500"></i> Files changed (演示 diff)</h3>
        </div>
        <div class="p-3 font-mono text-xs">
          <div class="bg-[#e6ffed] dark:bg-[#033a16] px-3 py-1 border-l-4 border-[#1a7f37]"><span class="text-[#1a7f37] font-semibold">+</span> - [GitHub Skills](https://skills.github.com) 互动课程链接</div>
          <div class="bg-[#ffebe9] dark:bg-[#67060c] px-3 py-1 border-l-4 border-[#cf222e] mt-1"><span class="text-[#cf222e] font-semibold">-</span> - GitHub 官方文档</div>
        </div>
      </div>
    </div>
  `;
  $('#approvePr')?.addEventListener('click', () => {
    pr.reviews.push({ reviewer: 'ALT-s25', status: 'approved', createdAt: new Date().toISOString() });
    saveData();
    showToast('已 Approve', 'success');
    navigate('pulls', 2, { id });
  });
  $('#mergePr')?.addEventListener('click', () => {
    mutate(`pulls.${id}.state`, 'merged');
    showToast('PR 已合并', 'success');
    navigate('pulls', 2, { id });
  });
  $$('.nav-to-pr-commit').forEach(a => a.addEventListener('click', e => {
    e.preventDefault();
    navigate('pulls', 3, { id, sha: a.dataset.sha });
  }));
}

function renderCommitDetail(main, breadcrumb, id, sha) {
  const pr = data.pulls[id];
  const c = pr?.commits.find(x => x.sha === sha);
  if (!c) { main.innerHTML = '<p>Commit 不存在</p>'; return; }
  view.params = { id, sha };
  main.innerHTML = breadcrumb + `
    <div class="border border-gh-200 dark:border-[#30363d] rounded-md bg-white dark:bg-[#0d1117]">
      <div class="p-4 border-b border-gh-200 dark:border-[#30363d]">
        <h2 class="text-lg font-semibold"><i class="fa fa-commit text-gh-500"></i> ${escapeHtml(c.title)}</h2>
        <div class="text-xs text-gh-500 mt-2">
          <span class="font-mono">${c.sha}</span> · ${escapeHtml(c.author)} · ${c.createdAt.slice(0, 10)}
        </div>
      </div>
      <div class="p-4 space-y-3">
        <h3 class="text-sm font-semibold">改动的文件</h3>
        <ul class="text-sm space-y-1">
          <li><i class="fa fa-file-text-o text-gh-500"></i> README.md</li>
          <li><i class="fa fa-file-text-o text-gh-500"></i> docs/index.md</li>
        </ul>
        <h3 class="text-sm font-semibold">Diff (演示)</h3>
        <pre class="font-mono text-xs bg-gh-50 dark:bg-[#0d1117] p-3 rounded overflow-x-auto"><span class="text-[#1a7f37]">@@ -1,3 +1,4 @@</span>
<span class="text-[#1a7f37]">+## Resources</span>
<span class="text-[#1a7f37]">+</span>
<span class="text-[#1a7f37]">+- [GitHub Skills](https://skills.github.com)</span>
 <span class="text-gh-500"> # my-first-repo</span></pre>
      </div>
    </div>
  `;
}
```

- [ ] **Step 3: 验证 PRs 三层**

写 `C:\tmp\test-prs.js`：

```javascript
const puppeteer = require('puppeteer');
(async () => {
  const browser = await puppeteer.launch({ headless: 'new', args: ['--no-sandbox', '--disable-setuid-sandbox'] });
  const page = await browser.newPage();
  page.on('pageerror', e => console.log('  err:', e.message));
  await page.goto('http://localhost:8766/', { waitUntil: 'networkidle0' });
  await page.evaluate(() => localStorage.removeItem('gh-guide-v1-data'));
  await page.reload({ waitUntil: 'networkidle0' });
  await new Promise(r => setTimeout(r, 1500));

  await page.evaluate(() => document.querySelector('[data-tab="pulls"]').click());
  await new Promise(r => setTimeout(r, 500));

  const l1 = await page.evaluate(() => document.querySelectorAll('.nav-to-pr').length);
  console.log('L1 pr count:', l1);

  await page.evaluate(() => document.querySelector('.nav-to-pr[data-id="1"]').click());
  await new Promise(r => setTimeout(r, 500));
  const l2 = await page.evaluate(() => ({
    breadcrumb: document.getElementById('breadcrumb')?.textContent.slice(0, 60),
    approveBtn: !!document.getElementById('approvePr'),
    commitCount: document.querySelectorAll('.nav-to-pr-commit').length,
  }));
  console.log('L2:', JSON.stringify(l2));

  // 点 Approve
  await page.evaluate(() => document.getElementById('approvePr').click());
  await new Promise(r => setTimeout(r, 500));
  const approved = await page.evaluate(() => document.querySelector('.label-green')?.textContent);
  console.log('approved:', approved);

  // 点 commit 进 L3
  await page.evaluate(() => document.querySelector('.nav-to-pr-commit').click());
  await new Promise(r => setTimeout(r, 500));
  const l3 = await page.evaluate(() => ({
    breadcrumb: document.getElementById('breadcrumb')?.textContent.slice(0, 80),
  }));
  console.log('L3:', JSON.stringify(l3));

  await browser.close();
})();
```

```bash
cd /tmp && NODE_PATH=/tmp/node_modules node C:/tmp/test-prs.js
```
预期：
- L1 pr count: 2
- L2: `{"breadcrumb":"← 返回 仓库 / Pull requests / #1","approveBtn":true,"commitCount":2}`
- approved: `ALT-s25: approved`
- L3: breadcrumb 含 `a1b2c3d`

- [ ] **Step 4: commit**

```bash
cd "C:/Users/26918/github-guide"
git add app.js
git commit -m "PRs Tab：列表 + diff + commit 详情 + Approve/Merge"
```

---

## Task 7: Settings Tab 两层（列表 + 设置项表单）

**Files:**
- Modify: `C:\Users\26918\github-guide\app.js`（替换 `tab === 'settings'` 分支，新增 renderSettingDetail 函数）

**目的**：Settings tab 支持点击进入设置项详情、修改并保存。

- [ ] **Step 1: 替换 `tab === 'settings'` 分支**

```javascript
  else if (tab === 'settings') {
    renderSettingsList(main, breadcrumb);
    return;
  }
```

> 注意把原来的 `else if` 改为独立 `else if`，并加 return。

- [ ] **Step 2: 追加 Settings render 函数**

```javascript
// ============ Settings Tab ============
const SETTINGS_ITEMS = [
  { id: 'general', icon: 'fa-cog', name: 'General', desc: '改名、可见性、删除仓库等' },
  { id: 'notifications', icon: 'fa-bell', name: 'Notifications', desc: '订阅规则、通知邮箱' },
  { id: 'access', icon: 'fa-lock', name: 'Access', desc: '协作者、团队、部署密钥' },
  { id: 'collaborators', icon: 'fa-code-fork', name: 'Collaborators', desc: '邀请协作者（私有仓库）' },
  { id: 'branches', icon: 'fa-code-branch', name: 'Branches', desc: '默认分支、分支保护规则' },
  { id: 'tags', icon: 'fa-tag', name: 'Tags', desc: '管理 release 标签' },
  { id: 'pages', icon: 'fa-globe', name: 'Pages', desc: '部署静态网站' },
  { id: 'secrets', icon: 'fa-key', name: 'Secrets and variables', desc: 'CI/CD 用的密钥' },
  { id: 'integrations', icon: 'fa-plug', name: 'Integrations', desc: '第三方应用授权' },
  { id: 'danger', icon: 'fa-ban', name: 'Danger Zone', desc: '转移、归档、删除' },
];

function renderSettingsList(main, breadcrumb) {
  main.innerHTML = breadcrumb + `
    <div class="border border-gh-200 dark:border-[#30363d] rounded-md bg-white dark:bg-[#0d1117] divide-y divide-gh-200 dark:divide-[#30363d]">
      ${SETTINGS_ITEMS.map(item => `
        <button class="nav-to-setting w-full flex items-center gap-3 p-4 hover:bg-gh-50 dark:hover:bg-[#161b22] text-left" data-setting="${item.id}">
          <i class="fa ${item.icon} text-gh-500 w-5"></i>
          <div class="flex-1 min-w-0">
            <div class="text-sm font-semibold">${item.name}</div>
            <div class="text-xs text-gh-500">${item.desc}</div>
          </div>
          <i class="fa fa-chevron-right text-gh-400 text-xs"></i>
        </button>
      `).join('')}
    </div>
  `;
  $$('.nav-to-setting').forEach(b => b.addEventListener('click', () => {
    navigate('settings', 2, { setting: b.dataset.setting });
  }));
}

function renderSettingDetail(main, breadcrumb, settingId) {
  view.params = { setting: settingId };
  const item = SETTINGS_ITEMS.find(s => s.id === settingId);
  if (!item) { main.innerHTML = '<p>设置项不存在</p>'; return; }
  let body = '';
  if (settingId === 'general') {
    body = `
      <div class="space-y-4">
        <div>
          <label class="block text-sm font-semibold mb-1">仓库名</label>
          <input id="repoName" type="text" value="${escapeHtml(data.repo.name)}" class="w-full px-3 py-2 border border-gh-200 dark:border-[#30363d] rounded-md bg-white dark:bg-[#0d1117] text-sm">
        </div>
        <div>
          <label class="block text-sm font-semibold mb-1">描述</label>
          <textarea id="repoDesc" rows="2" class="w-full px-3 py-2 border border-gh-200 dark:border-[#30363d] rounded-md bg-white dark:bg-[#0d1117] text-sm">${escapeHtml(data.repo.description)}</textarea>
        </div>
        <div>
          <label class="block text-sm font-semibold mb-1">可见性</label>
          <div class="space-y-1 text-sm">
            <label class="flex items-center gap-2"><input type="radio" name="visibility" value="public" ${data.repo.visibility === 'public' ? 'checked' : ''}> 公开</label>
            <label class="flex items-center gap-2"><input type="radio" name="visibility" value="private" ${data.repo.visibility === 'private' ? 'checked' : ''}> 私有</label>
          </div>
        </div>
      </div>
    `;
  } else if (settingId === 'access' || settingId === 'collaborators') {
    body = `
      <div class="space-y-3">
        <div>
          <h3 class="text-sm font-semibold mb-2">当前协作者 (${data.repo.collaborators.length})</h3>
          <ul class="space-y-1 text-sm">
            ${data.repo.collaborators.map(u => `<li class="px-3 py-1.5 border border-gh-200 dark:border-[#30363d] rounded">${escapeHtml(u)}</li>`).join('')}
          </ul>
        </div>
        <div class="border-t border-gh-200 dark:border-[#30363d] pt-3">
          <label class="block text-sm font-semibold mb-1">添加协作者</label>
          <div class="flex gap-2">
            <input id="newCollab" type="text" placeholder="GitHub 用户名" class="flex-1 px-3 py-2 border border-gh-200 dark:border-[#30363d] rounded-md bg-white dark:bg-[#0d1117] text-sm">
            <button id="addCollab" class="btn btn-primary text-xs">添加</button>
          </div>
        </div>
      </div>
    `;
  } else if (settingId === 'branches') {
    body = `
      <div class="space-y-4">
        <div>
          <label class="block text-sm font-semibold mb-1">默认分支</label>
          <select id="defaultBranch" class="w-full px-3 py-2 border border-gh-200 dark:border-[#30363d] rounded-md bg-white dark:bg-[#0d1117] text-sm">
            <option ${data.repo.defaultBranch === 'main' ? 'selected' : ''}>main</option>
            <option ${data.repo.defaultBranch === 'master' ? 'selected' : ''}>master</option>
          </select>
        </div>
        <div>
          <label class="flex items-center gap-2 text-sm">
            <input id="branchProtection" type="checkbox" ${data.repo.branchProtection ? 'checked' : ''}>
            启用分支保护规则（要求 PR review）
          </label>
        </div>
      </div>
    `;
  } else {
    body = `<p class="text-sm text-gh-500">${escapeHtml(item.desc)} — 此项表单为演示占位。</p>`;
  }
  main.innerHTML = breadcrumb + `
    <div class="border border-gh-200 dark:border-[#30363d] rounded-md bg-white dark:bg-[#0d1117]">
      <div class="p-4 border-b border-gh-200 dark:border-[#30363d]">
        <h2 class="text-lg font-semibold"><i class="fa ${item.icon} text-gh-500"></i> ${item.name}</h2>
        <p class="text-xs text-gh-500 mt-1">${escapeHtml(item.desc)}</p>
      </div>
      <div class="p-4">${body}</div>
      <div class="p-4 border-t border-gh-200 dark:border-[#30363d] flex justify-end">
        <button id="saveSetting" class="btn btn-primary text-xs">Save changes</button>
      </div>
    </div>
  `;
  $('#saveSetting')?.addEventListener('click', () => {
    if (settingId === 'general') {
      const name = $('#repoName').value.trim();
      const desc = $('#repoDesc').value.trim();
      const vis = document.querySelector('input[name="visibility"]:checked')?.value;
      if (name) mutate('repo.name', name);
      if (desc !== undefined) mutate('repo.description', desc);
      if (vis) mutate('repo.visibility', vis);
      showToast('已保存', 'success');
      navigate('settings', 2, { setting: 'general' });
    } else if (settingId === 'access' || settingId === 'collaborators') {
      const u = $('#newCollab')?.value.trim();
      if (u && !data.repo.collaborators.includes(u)) {
        mutate('repo.collaborators', [...data.repo.collaborators, u]);
        showToast(`已添加 ${u}`, 'success');
        navigate('settings', 2, { setting: settingId });
      } else if (u) {
        showToast('该用户已是协作者', 'info');
      } else {
        showToast('请输入用户名', 'info');
      }
    } else if (settingId === 'branches') {
      mutate('repo.defaultBranch', $('#defaultBranch').value);
      mutate('repo.branchProtection', $('#branchProtection').checked);
      showToast('已保存', 'success');
      navigate('settings', 2, { setting: 'branches' });
    } else {
      showToast(`${item.name} 配置已保存（演示）`, 'success');
    }
  });
}
```

- [ ] **Step 3: 验证 Settings 两层 + 持久化**

写 `C:\tmp\test-settings.js`：

```javascript
const puppeteer = require('puppeteer');
(async () => {
  const browser = await puppeteer.launch({ headless: 'new', args: ['--no-sandbox', '--disable-setuid-sandbox'] });
  const page = await browser.newPage();
  page.on('pageerror', e => console.log('  err:', e.message));
  await page.goto('http://localhost:8766/', { waitUntil: 'networkidle0' });
  await page.evaluate(() => localStorage.removeItem('gh-guide-v1-data'));
  await page.reload({ waitUntil: 'networkidle0' });
  await new Promise(r => setTimeout(r, 1500));

  await page.evaluate(() => document.querySelector('[data-tab="settings"]').click());
  await new Promise(r => setTimeout(r, 500));

  const l1 = await page.evaluate(() => ({
    settingCount: document.querySelectorAll('.nav-to-setting').length,
  }));
  console.log('L1:', JSON.stringify(l1));

  // General → L2 + 修改
  await page.evaluate(() => document.querySelector('.nav-to-setting[data-setting="general"]').click());
  await new Promise(r => setTimeout(r, 500));
  const l2 = await page.evaluate(() => ({
    breadcrumb: document.getElementById('breadcrumb')?.textContent.slice(0, 50),
    hasNameInput: !!document.getElementById('repoName'),
  }));
  console.log('L2 general:', JSON.stringify(l2));

  await page.evaluate(() => {
    document.getElementById('repoName').value = 'new-test-repo';
    document.getElementById('saveSetting').click();
  });
  await new Promise(r => setTimeout(r, 600));
  const updated = await page.evaluate(() => document.getElementById('repoName')?.value);
  console.log('updated name:', updated);

  // 刷新验证持久化
  await page.reload({ waitUntil: 'networkidle0' });
  await new Promise(r => setTimeout(r, 1500));
  await page.evaluate(() => document.querySelector('[data-tab="settings"]').click());
  await new Promise(r => setTimeout(r, 500));
  await page.evaluate(() => document.querySelector('.nav-to-setting[data-setting="general"]').click());
  await new Promise(r => setTimeout(r, 500));
  const persisted = await page.evaluate(() => document.getElementById('repoName')?.value);
  console.log('persisted name:', persisted);

  await browser.close();
})();
```

```bash
cd /tmp && NODE_PATH=/tmp/node_modules node C:/tmp/test-settings.js
```
预期：
- L1: `{"settingCount":10}`
- L2 general: `{"breadcrumb":"← 返回 仓库 / Settings / General","hasNameInput":true}`
- updated name: `new-test-repo`
- persisted name: `new-test-repo`

- [ ] **Step 4: commit**

```bash
cd "C:/Users/26918/github-guide"
git add app.js
git commit -m "Settings Tab：列表 + 详情表单 + 状态持久化"
```

---

## Task 8: README + 集成测试 + 最终截图

**Files:**
- Modify: `C:\Users\26918\github-guide\README.md`（充实内容）
- 新增 puppeteer 截图（不入仓，只做验证）

**目的**：补充 README + 全功能集成验证。

- [ ] **Step 1: 写完整 README**

替换 `C:\Users\26918\github-guide\README.md`：

````markdown
# GitHub 新手探索站 🚀

> 一个仿真的 GitHub 页面，专为新手设计。点哪儿都有解释。

## 这是什么？

一个**纯前端**的交互式 GitHub 教学站。打开 `index.html` 就像真的在看自己的 GitHub 仓库：顶部导航、搜索框、头像、Code / Issues / Pull requests 等 8 个 Tab 全有。

**重点**：页面上任何带蓝点 `ⓘ` 标记的元素都可点击，弹出知识卡片解释它的作用。

## 功能

- ✅ 8 个 Tab 完整仿真（Code / Issues / Pull requests / Actions / Projects / Security / Insights / Settings）
- ✅ 4 个核心 Tab 支持**多层导航**：列表 → 详情 → 子详情（带面包屑 + 返回）
- ✅ **全交互**：Issues 新建评论 / 关闭、PR Approve/Merge、Settings 改名 / 加协作者，状态持久化
- ✅ 60+ 个学习元素（顶部导航子菜单 + 页面按钮 + 字段），每个都有"是什么 / 怎么用 / 新手提示"
- ✅ 任务清单 + 命令速查 + 推荐资源 + FAQ（左侧栏）
- ✅ 亮色 / 暗色主题切换（持久化）
- ✅ 首次访问欢迎卡

## 本地运行

直接双击打开 `index.html` 即可使用（无需后端）。

或用 Python 启个本地 server：

```bash
python -m http.server 8766
# 然后访问 http://localhost:8766/
```

## 部署到 GitHub Pages

1. 推到 GitHub 仓库
2. Settings → Pages → Source: `main` 分支 / 根目录
3. 访问 `https://你的用户名.github.io/仓库名/`

## 技术栈

- HTML5 + Tailwind CSS（CDN）
- Font Awesome 4.7.0
- Vanilla JavaScript（无框架）
- localStorage 持久化

## 文件结构

```
github-guide/
├── index.html      # 页面骨架
├── app.js          # 渲染逻辑 + 状态管理
├── data.js         # 学习元素数据
└── README.md       # 本文件
```

## 适合谁？

- 刚接触 GitHub、不知道每个按钮干嘛
- 想理解 Issues / Pull requests / Actions 这些术语是什么
- 准备开一个开源项目但怕点错

## 后续计划

- [ ] 扩展 Actions / Projects / Security / Insights 4 个 Tab 到多层
- [ ] 顶部导航 17 个子菜单项独立成可进入的页面
- [ ] 添加搜索功能
- [ ] 移动端适配

## License

MIT
````

- [ ] **Step 2: 集成测试**

写 `C:\tmp\test-integration.js`：

```javascript
const puppeteer = require('puppeteer');
(async () => {
  const browser = await puppeteer.launch({ headless: 'new', args: ['--no-sandbox', '--disable-setuid-sandbox'] });
  const page = await browser.newPage();
  await page.setViewport({ width: 1400, height: 900 });
  page.on('pageerror', e => console.log('  err:', e.message));
  await page.goto('http://localhost:8766/', { waitUntil: 'networkidle0' });
  await page.evaluate(() => localStorage.clear());
  await page.reload({ waitUntil: 'networkidle0' });
  await new Promise(r => setTimeout(r, 1500));

  // 截图首页
  await page.screenshot({ path: 'C:/Users/26918/_tmp_screenshot_home.png' });

  // Code L1 → L2
  await page.evaluate(() => document.querySelector('.nav-to-file[data-path="README.md"]').click());
  await new Promise(r => setTimeout(r, 500));
  await page.screenshot({ path: 'C:/Users/26918/_tmp_screenshot_code_file.png' });

  // Issues L2
  await page.evaluate(() => document.querySelector('[data-tab="issues"]').click());
  await new Promise(r => setTimeout(r, 300));
  await page.evaluate(() => document.querySelector('.nav-to-issue[data-id="1"]').click());
  await new Promise(r => setTimeout(r, 500));
  await page.screenshot({ path: 'C:/Users/26918/_tmp_screenshot_issue.png' });

  // PR L2
  await page.evaluate(() => document.querySelector('[data-tab="pulls"]').click());
  await new Promise(r => setTimeout(r, 300));
  await page.evaluate(() => document.querySelector('.nav-to-pr[data-id="1"]').click());
  await new Promise(r => setTimeout(r, 500));
  await page.screenshot({ path: 'C:/Users/26918/_tmp_screenshot_pr.png' });

  // Settings L2
  await page.evaluate(() => document.querySelector('[data-tab="settings"]').click());
  await new Promise(r => setTimeout(r, 300));
  await page.evaluate(() => document.querySelector('.nav-to-setting[data-setting="general"]').click());
  await new Promise(r => setTimeout(r, 500));
  await page.screenshot({ path: 'C:/Users/26918/_tmp_screenshot_settings.png' });

  // 暗色
  await page.evaluate(() => document.documentElement.classList.add('dark'));
  await new Promise(r => setTimeout(r, 300));
  await page.evaluate(() => document.querySelector('[data-tab="code"]').click());
  await new Promise(r => setTimeout(r, 500));
  await page.screenshot({ path: 'C:/Users/26918/_tmp_screenshot_dark.png' });

  console.log('截图完成');
  await browser.close();
})();
```

```bash
cd /tmp && NODE_PATH=/tmp/node_modules node C:/tmp/test-integration.js
```

然后人工用 Read 工具看 5 张截图，确认布局 / 颜色 / 交互正常。

- [ ] **Step 3: 删除临时截图**

```bash
rm -f C:/Users/26918/_tmp_screenshot_*.png
```

- [ ] **Step 4: commit README**

```bash
cd "C:/Users/26918/github-guide"
git add README.md
git commit -m "文档：完善 README"
```

- [ ] **Step 5: 验证最终状态**

```bash
git log --oneline
ls -la
```

预期：8+ 个 commit、目录里有 index.html / app.js / data.js / README.md / .gitignore / docs/，无 screenshot-*.png 残留。

---

## Self-Review

**1. Spec coverage**：
- ✅ 第二节范围（4 Tab × 3 层）→ Task 4-7
- ✅ 第三节 4 个 Tab 详细设计 → Task 4 (Code), 5 (Issues), 6 (PRs), 7 (Settings)
- ✅ 第四节导航（面包屑 + 返回）→ Task 3
- ✅ 第五节状态持久化（localStorage）→ Task 2
- ✅ 第六节架构（独立 render 函数）→ 所有 Task
- ✅ 第八节文件改动（仅改 app.js + data.js）→ 所有 Task
- ✅ 第九节测试计划 → 每个 Task 都有 puppeteer 验证
- ✅ 第十节 YAGNI（不做顶部下拉、其他 4 Tab）→ 第二节明确推迟到下一轮

**2. Placeholder scan**：无 TBD/TODO/类似后填字样。

**3. Type consistency**：
- `data.issues[id]` / `data.pulls[id]` / `data.files[path]` / `data.repo` 一致
- `view.params = { id?, path?, sha?, cid?, setting? }` 一致
- `navigate(tab, level, params)` 在所有 render 中调用方式一致

**4. 文件改动**：spec 第八节说仅改 app.js / data.js — 所有 Task 都符合，无意外修改。

---

## 完成标准

- 8 个 commit（每个 Task 1 个）
- 4 个核心 Tab × 3 层可导航，状态持久化生效
- 顶部导航 17 个子项 + 4 个 Tab (Actions/Projects/Security/Insights) 保持现状
- README 完整
- 项目可发布到 GitHub（无调试文件残留）

---

**执行选项**：

1. **Subagent-Driven（推荐）** - 我每个 task 派一个独立子代理执行，task 之间 review
2. **Inline Execution** - 当前 session 内批量执行，中途 checkpoint review

请告诉我用哪种方式？
