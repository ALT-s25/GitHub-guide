# Task 13 报告：顶部 17 子项内容页

## Status: ✅ 完成

## 实施内容

### 1. data.js：追加 NAV_PAGES 常量（17 项）
- 4 Product 子项：repo / actions / copilot / security
- 3 Solutions 子项：team / edu / game
- 4 Resources 子项：docs / blog / community / skills
- 3 Open Source 子项：explore / topics / trending
- 3 Enterprise 子项：platform / security / ai
- 每项含：dropdown / icon / title / subtitle / intro / concepts / scenarios

### 2. index.html：17 个 `<a>` 元素改造
- 移除 `class="learnable"` 和 `data-learnable="nav-..."`
- 新增 `data-nav-id="nav-..."`
- 5 个 dropdown 父项 + nav-pricing 保持原状（仍弹 learnable 卡）
- 验证：17 个 data-nav-id 全部就位，无残留

### 3. app.js 改造
- TAB_NAMES 加 `nav: '顶部导航'`
- `renderTabContent` 新增 `tab === 'nav'` 分支，调用 `renderNavPage`
- 新增 `bindNavPages()` 函数（含 `navBound` 防重复绑定）
- 新增 `renderNavPage(main, breadcrumb, navId)` 函数（标准模板：介绍 + 关键概念 + 适用场景 + 返回按钮）
- `renderBreadcrumb` 新增 `tab === 'nav'` 分支（显示 仓库 / 顶部导航 / Dropdown / 页面标题）
- breadcrumb click handler 新增 `dropdown:` 前缀处理（返回 root）
- `bindNavPages()` 在 DOMContentLoaded 时调用（关键修复：renderTabContent 因 early return 不会到达尾部）

### 4. 复用现有 mutate/navigate/escapeHtml/showToast/renderBreadcrumb
- 全部使用 `escapeHtml()` 做 XSS 防护
- 复用 `navigate()` 路由
- 复用 `#tabContent` 主区域和面包屑容器

## 测试结果

puppeteer 测试 (`/tmp/test-nav-pages.js`) 全部通过：
- `nav-product-repo`: breadcrumb = "← 返回仓库 / 顶部导航 / Product / 代码托管（Repository）", title = "代码托管（Repository）", hasConcepts=true, hasBackBtn=true
- `nav-res-skills`: breadcrumb = "← 返回仓库 / 顶部导航 / Resources / GitHub Skills（互动课）"
- 返回后: tab = "code"
- **all 17: 全部 true**（无报错，每个都有 h1 和 check-circle 图标）

## 关键发现

1. **renderTabContent 的 early return 陷阱**：原代码 `bindLearnables()` 在 `renderTabContent` 末尾的调用是死代码（所有分支都有 `return;`）。原项目通过在 DOMContentLoaded 直接调用 `bindLearnables()` 绕过。我对 `bindNavPages()` 采取同样方式。

2. **dropdown 父项仍弹卡**：5 个父项（nav-product / nav-solutions 等）保持 `class="learnable"` + `data-learnable="..."`，点击仍弹 learnable 卡，符合 brief 要求。

3. **17 项内容充实度**：每项都包含 intro（≥1 段）+ 2-4 个 concepts + 2-3 个 scenarios，无 placeholder。

## Concerns / 风险

- `bindNavPages()` 写在 DOMContentLoaded，但 nav 元素是固定在 header 不会变化的，所以单次绑定足够。后续如果动态插入新 nav 元素，需要重新调用。
- 父项（nav-product 等）点击仍弹卡，可能与子项跳内容页的行为不一致，但 brief 明确要求保持原样。
