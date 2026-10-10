// ============ 状态 ============
const STORAGE_KEY = 'gh-guide-v1';
let state = {
  done: {},           // { taskId: true }
  mastered: {},       // { 'learnableId': true }
  theme: 'light',
};

// ============ 加载/保存 ============
function loadState() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      state = { ...state, ...parsed, theme: state.theme };
    }
  } catch (e) { console.warn('加载状态失败', e); }
}

function saveState() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({
      done: state.done,
      mastered: state.mastered,
    }));
  } catch (e) { console.warn('保存状态失败', e); }
}

// ============ 主题 ============
function applyTheme(theme) {
  if (theme === 'dark') {
    document.documentElement.classList.add('dark');
  } else {
    document.documentElement.classList.remove('dark');
  }
  state.theme = theme;
  try { localStorage.setItem(STORAGE_KEY + '-theme', theme); } catch (e) {}
}

function toggleTheme() {
  applyTheme(state.theme === 'dark' ? 'light' : 'dark');
}

function initTheme() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY + '-theme');
    if (saved) applyTheme(saved);
    else if (window.matchMedia('(prefers-color-scheme: dark)').matches) applyTheme('dark');
  } catch (e) {}
}

// ============ 工具 ============
const $ = (sel) => document.querySelector(sel);
const $$ = (sel) => document.querySelectorAll(sel);

function showToast(msg, type = 'info') {
  const t = document.createElement('div');
  t.className = `fixed bottom-6 right-6 px-4 py-2 rounded-md shadow-lg text-sm z-50 ${type === 'success' ? 'bg-[#1f883d] text-white' : 'bg-gh-700 text-white'}`;
  t.textContent = msg;
  document.body.appendChild(t);
  setTimeout(() => t.remove(), 2200);
}

// ============ Tab 内容渲染 ============
function renderTabContent(tab) {
  const main = $('#tabContent');
  // 面包屑容器（仅 L2/L3 显示）
  const breadcrumb = view.level >= 2
    ? '<div id="breadcrumb" class="text-xs text-gh-500 mb-3 px-1"></div>'
    : '';
  if (tab === 'code') {
    if (view.level === 1 || !view.params.path) {
      renderCodeList(main, breadcrumb);
    } else if (view.level === 2) {
      renderCodeFile(main, breadcrumb, view.params.path);
    } else if (view.level >= 3) {
      renderCodeHistory(main, breadcrumb, view.params.path);
    }
    return;
  } else if (tab === 'issues') {
    if (view.level === 1) {
      renderIssuesList(main, breadcrumb);
    } else if (view.level === 2) {
      renderIssueDetail(main, breadcrumb, view.params.id);
    } else if (view.level >= 3) {
      renderIssueComment(main, breadcrumb, view.params.id, view.params.cid);
    }
    return;
  } else if (tab === 'pulls') {
    if (view.level === 1) {
      renderPrList(main, breadcrumb);
    } else if (view.level === 2) {
      renderPrDetail(main, breadcrumb, view.params.id);
    } else if (view.level >= 3) {
      renderCommitDetail(main, breadcrumb, view.params.id, view.params.sha);
    }
    return;
  } else if (tab === 'actions') {
    if (view.level === 1 || !view.params.wf) {
      renderActionsList(main, breadcrumb);
    } else if (view.level === 2) {
      renderActionRuns(main, breadcrumb, view.params.wf);
    } else if (view.level >= 3) {
      renderActionRunDetail(main, breadcrumb, view.params.wf, view.params.run);
    }
    return;
  } else if (tab === 'projects') {
    if (view.level === 1 || !view.params.project) {
      renderProjectsList(main, breadcrumb);
    } else if (view.level === 2) {
      renderProjectBoard(main, breadcrumb, view.params.project);
    } else if (view.level >= 3) {
      renderProjectCard(main, breadcrumb, view.params.project, view.params.card);
    }
    return;
  } else if (tab === 'security') {
    if (view.level === 1 || !view.params.feature) {
      renderSecurityList(main, breadcrumb);
    } else if (view.level === 2) {
      renderSecurityFeature(main, breadcrumb, view.params.feature);
    } else if (view.level >= 3) {
      renderSecurityAlert(main, breadcrumb, view.params.feature, view.params.vuln);
    }
    return;
  } else if (tab === 'insights') {
    if (view.level === 1) {
      renderInsightsOverview(main, breadcrumb);
    } else if (view.level === 2) {
      renderInsightsCategory(main, breadcrumb, view.params.category);
    } else if (view.level >= 3) {
      renderInsightsContributor(main, breadcrumb, view.params.contributor);
    }
    return;
  } else if (tab === 'settings') {
    if (view.level === 1 || !view.params.setting) {
      renderSettingsList(main, breadcrumb);
    } else if (view.level === 2) {
      renderSettingDetail(main, breadcrumb, view.params.setting);
    }
    return;
  } else if (tab === 'nav') {
    if (view.level >= 2 && view.params.navId) {
      renderNavPage(main, breadcrumb, view.params.navId);
    } else {
      main.innerHTML = '<p>无效导航</p>';
    }
    return;
  }

  // 重新绑定可学习元素
  bindLearnables();
  bindNavPages();
}

// ============ Tab 切换 ============
function bindTabs() {
  $$('.tab-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const tab = btn.dataset.tab;
      navigate(tab, 1, {});
    });
  });
  // 默认激活 code
  document.querySelector('[data-tab="code"]')?.classList.add('tab-active');
  renderTabContent('code');
}

// ============ 知识卡片弹窗 ============
function showLearnModal(id) {
  const data = learnables[id];
  if (!data) {
    console.warn('未找到 learnable:', id);
    return;
  }
  $('#learnCategory').textContent = data.category || '其他';
  $('#learnTitle').textContent = data.title;
  $('#learnWhat').innerHTML = data.what || '';
  $('#learnHow').innerHTML = data.how || '<span class="text-gh-500">暂无说明</span>';
  if (data.tip) {
    $('#learnTip').textContent = data.tip;
    $('#learnTipWrap').classList.remove('hidden');
  } else {
    $('#learnTipWrap').classList.add('hidden');
  }
  if (data.warn) {
    $('#learnWarn').textContent = data.warn;
    $('#learnWarnWrap').classList.remove('hidden');
  } else {
    $('#learnWarnWrap').classList.add('hidden');
  }
  const mastered = !!state.mastered[id];
  $('#learnMastered').checked = mastered;
  $('#learnModal').classList.remove('hidden');
  // 标记本次已学
  state.mastered[id] = true;
  saveState();
}

function closeLearnModal() {
  $('#learnModal').classList.add('hidden');
}

function bindLearnables() {
  $$('[data-learnable]').forEach(el => {
    // 避免重复绑定
    if (el.dataset.bound) return;
    el.dataset.bound = '1';
    el.addEventListener('click', (e) => {
      const id = el.dataset.learnable;
      if (!id) return;
      // 对 a 标签、submit 按钮等需要阻止默认行为
      if (el.tagName === 'A' || (el.tagName === 'BUTTON' && el.type === 'submit')) {
        e.preventDefault();
      }
      showLearnModal(id);
    });
  });
}

// ============ 顶部导航 17 子项跳转 ============
function bindNavPages() {
  $$('[data-nav-id]').forEach(a => {
    if (a.dataset.navBound) return;
    a.dataset.navBound = '1';
    a.addEventListener('click', e => {
      e.preventDefault();
      const navId = a.dataset.navId;
      if (!navId) return;
      navigate('nav', 2, { navId });
    });
  });
}

// ============ 顶部导航内容页 ============
function renderNavPage(main, breadcrumb, navId) {
  const page = NAV_PAGES[navId];
  if (!page) { main.innerHTML = '<p>页面不存在</p>'; return; }
  view.params = { navId };
  main.innerHTML = breadcrumb + `
    <div class="border border-gh-200 dark:border-[#30363d] rounded-md bg-white dark:bg-[#0d1117]">
      <div class="p-4 border-b border-gh-200 dark:border-[#30363d]">
        <h1 class="text-xl font-semibold"><i class="fa ${page.icon} text-gh-500"></i> ${escapeHtml(page.title)}</h1>
        <p class="text-sm text-gh-500 mt-1">${escapeHtml(page.subtitle)}</p>
      </div>
      <div class="p-4 space-y-4">
        <div>
          <h2 class="text-sm font-semibold mb-2 uppercase text-gh-500">介绍</h2>
          <p class="text-sm leading-relaxed">${escapeHtml(page.intro)}</p>
        </div>
        <div>
          <h2 class="text-sm font-semibold mb-2 uppercase text-gh-500">关键概念</h2>
          <ul class="space-y-2">
            ${page.concepts.map(c => `
              <li class="flex gap-2">
                <i class="fa fa-check-circle text-[#1a7f37] mt-0.5 flex-shrink-0"></i>
                <div>
                  <div class="text-sm font-semibold">${escapeHtml(c.name)}</div>
                  <div class="text-xs text-gh-500 mt-0.5">${escapeHtml(c.desc)}</div>
                </div>
              </li>
            `).join('')}
          </ul>
        </div>
        <div>
          <h2 class="text-sm font-semibold mb-2 uppercase text-gh-500">适用场景</h2>
          <ul class="space-y-1">
            ${page.scenarios.map(s => `
              <li class="text-sm flex items-center gap-2">
                <i class="fa fa-arrow-right text-gh-400 text-xs"></i>
                ${escapeHtml(s)}
              </li>
            `).join('')}
          </ul>
        </div>
      </div>
      <div class="p-4 border-t border-gh-200 dark:border-[#30363d] flex justify-end">
        <button id="navBack" class="btn btn-secondary text-xs"><i class="fa fa-arrow-left"></i> 返回</button>
      </div>
    </div>
  `;
  $('#navBack')?.addEventListener('click', () => {
    navigate('code', 1, {});
  });
}

// ============ 学习清单 ============
function renderTasks() {
  const list = $('#tasksList');
  const total = taskChapters.reduce((s, c) => s + c.tasks.length, 0);
  const done = taskChapters.reduce((s, c) => s + c.tasks.filter(t => state.done[t.id]).length, 0);
  $('#taskBadge').textContent = `${done}/${total}`;

  list.innerHTML = taskChapters.map((chapter, ci) => {
    const chDone = chapter.tasks.filter(t => state.done[t.id]).length;
    const colorClass = {
      blue: { border: 'border-blue-500', bg: 'bg-blue-50', text: 'text-blue-600', label: 'label-blue' },
      green: { border: 'border-green-500', bg: 'bg-green-50', text: 'text-green-600', label: 'label-green' },
      purple: { border: 'border-purple-500', bg: 'bg-purple-50', text: 'text-purple-600', label: 'label-purple' },
      yellow: { border: 'border-yellow-500', bg: 'bg-yellow-50', text: 'text-yellow-600', label: 'label-yellow' },
    }[chapter.color] || { border: 'border-gh-500', bg: 'bg-gh-50', text: 'text-gh-600', label: '' };

    return `
      <div class="border-l-4 ${colorClass.border} pl-3">
        <div class="flex items-center gap-2 mb-2">
          <i class="fa ${chapter.icon} ${colorClass.text}"></i>
          <h3 class="font-semibold text-sm">${chapter.name}</h3>
          <span class="text-xs text-gh-500 ml-auto">${chDone}/${chapter.tasks.length}</span>
        </div>
        <p class="text-xs text-gh-500 mb-2">${chapter.desc}</p>
        <ul class="space-y-1.5">
          ${chapter.tasks.map(task => `
            <li class="task-item ${state.done[task.id] ? 'done' : ''} flex items-start gap-2 p-2 rounded hover:bg-gh-50 dark:hover:bg-[#161b22]">
              <input type="checkbox" data-task-id="${task.id}" class="task-cb mt-0.5 rounded text-[#1f883d] focus:ring-[#1f883d]" ${state.done[task.id] ? 'checked' : ''}>
              <div class="flex-1 min-w-0">
                <div class="task-text text-sm font-medium">${task.title}</div>
                <div class="text-xs text-gh-500">${task.desc}</div>
              </div>
            </li>
          `).join('')}
        </ul>
      </div>
    `;
  }).join('');

  // 绑定勾选
  $$('.task-cb').forEach(cb => {
    cb.addEventListener('change', (e) => {
      const id = cb.dataset.taskId;
      if (cb.checked) {
        state.done[id] = true;
        cb.closest('.task-item').classList.add('done');
      } else {
        delete state.done[id];
        cb.closest('.task-item').classList.remove('done');
      }
      saveState();
      updateProgress();
      // 更新计数
      const done = taskChapters.reduce((s, c) => s + c.tasks.filter(t => state.done[t.id]).length, 0);
      $('#taskBadge').textContent = `${done}/${total}`;
      showToast(cb.checked ? '🎉 学会了！' : '取消标记', 'success');
    });
  });
}

// ============ 进度 ============
function updateProgress() {
  const total = taskChapters.reduce((s, c) => s + c.tasks.length, 0);
  const done = Object.keys(state.done).length;
  const percent = total ? Math.round(done / total * 100) : 0;
  $('#totalPercent').textContent = `${percent}%`;
  $('#totalProgress').style.width = `${percent}%`;
}

// ============ 抽屉/面板开关 ============
function openTasksDrawer() {
  const drawer = $('#tasksDrawer');
  if (!drawer) return;
  drawer.classList.remove('hidden');
}

function closeTasksDrawer() {
  const drawer = $('#tasksDrawer');
  if (!drawer) return;
  drawer.classList.add('hidden');
}

function openPanel(id) {
  const panel = document.getElementById(id);
  if (!panel) return;
  panel.classList.remove('hidden');
}

function closePanel(id) {
  const panel = document.getElementById(id);
  if (!panel) return;
  // 立即让 backdrop 透明
  const backdrop = panel.querySelector('[id$="Backdrop"]');
  if (backdrop) backdrop.style.opacity = '0';
  panel.classList.add('hidden');
  setTimeout(() => { if (backdrop) backdrop.style.opacity = '1'; }, 50);
}

// ============ 命令速查渲染 ============
function renderCheatsheet() {
  const grouped = {};
  commands.forEach(c => {
    if (!grouped[c.chapter]) grouped[c.chapter] = [];
    grouped[c.chapter].push(c);
  });
  $('#cheatList').innerHTML = Object.entries(grouped).map(([chapter, cmds]) => `
    <div>
      <h3 class="text-sm font-semibold text-gh-500 uppercase mb-2">${chapter}</h3>
      <div class="space-y-2 mb-4">
        ${cmds.map(c => `
          <div class="border border-gh-200 dark:border-[#30363d] rounded-md p-3 bg-white dark:bg-[#0d1117]">
            <div class="flex items-center justify-between gap-2 mb-1">
              <code class="text-sm font-mono text-[#0550ae] dark:text-[#79c0ff]">${escapeHtml(c.cmd)}</code>
              <button class="copy-btn text-xs text-gh-500 hover:text-[#0969da]" data-cmd="${escapeHtml(c.cmd)}">复制</button>
            </div>
            <p class="text-xs text-gh-600 dark:text-[#8b949e]">${escapeHtml(c.desc)}</p>
          </div>
        `).join('')}
      </div>
    </div>
  `).join('');

  $$('.copy-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const cmd = btn.dataset.cmd;
      navigator.clipboard.writeText(cmd).then(() => {
        btn.textContent = '已复制 ✓';
        setTimeout(() => btn.textContent = '复制', 1200);
      });
    });
  });
}

function escapeHtml(s) {
  if (!s) return '';
  return String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}

// ============ 推荐资源渲染 ============
function renderResources() {
  $('#resourcesList').innerHTML = resources.map(r => `
    <a href="${r.url}" target="_blank" rel="noopener" class="block border border-gh-200 dark:border-[#30363d] rounded-md p-4 hover:border-[#0969da] transition bg-white dark:bg-[#0d1117]">
      <div class="flex items-start justify-between gap-2 mb-1">
        <h3 class="text-sm font-semibold text-[#0969da]">${escapeHtml(r.name)}</h3>
        <i class="fa fa-external-link text-xs text-gh-400"></i>
      </div>
      <p class="text-xs text-gh-600 dark:text-[#8b949e] mb-2">${escapeHtml(r.desc)}</p>
      <div class="flex flex-wrap gap-1">
        ${r.tags.map(t => `<span class="label label-blue text-[10px]">${escapeHtml(t)}</span>`).join('')}
      </div>
    </a>
  `).join('');
}

// ============ FAQ 渲染 ============
function renderFaq() {
  $('#faqList').innerHTML = faqs.map((f, i) => `
    <details class="border border-gh-200 dark:border-[#30363d] rounded-md bg-white dark:bg-[#0d1117]">
      <summary class="p-3 text-sm font-semibold cursor-pointer hover:bg-gh-50 dark:hover:bg-[#161b22] flex items-center gap-2">
        <span class="text-[#0969da] font-mono text-xs">Q${i + 1}</span>
        <span class="flex-1">${escapeHtml(f.q)}</span>
        <i class="fa fa-chevron-down text-xs text-gh-400 transition group-open:rotate-180"></i>
      </summary>
      <div class="px-3 pb-3 text-sm text-gh-700 dark:text-[#c9d1d9] leading-relaxed border-t border-gh-200 dark:border-[#30363d] pt-2 mt-1">
        ${escapeHtml(f.a).replace(/\n/g, '<br>')}
      </div>
    </details>
  `).join('');
}

// ============ 全局事件 ============
function bindGlobal() {
  // 学习清单
  $('#openTasks').addEventListener('click', openTasksDrawer);
  $('#closeTasks').addEventListener('click', closeTasksDrawer);
  $('#tasksBackdrop').addEventListener('click', closeTasksDrawer);

  // 命令速查
  $('#openCheatsheet').addEventListener('click', () => openPanel('cheatPanel'));
  $('#closeCheat').addEventListener('click', () => closePanel('cheatPanel'));
  $('#cheatBackdrop').addEventListener('click', () => closePanel('cheatPanel'));

  // 推荐资源
  $('#openResources').addEventListener('click', () => openPanel('resourcesPanel'));
  $('#closeResources').addEventListener('click', () => closePanel('resourcesPanel'));
  $('#resourcesBackdrop').addEventListener('click', () => closePanel('resourcesPanel'));

  // FAQ
  $('#openFaq').addEventListener('click', () => openPanel('faqPanel'));
  $('#closeFaq').addEventListener('click', () => closePanel('faqPanel'));
  $('#faqBackdrop').addEventListener('click', () => closePanel('faqPanel'));

  // 主题
  $('#themeToggle').addEventListener('click', () => {
    toggleTheme();
    completeTask('t7');
  });

  // 重置
  $('#resetBtn').addEventListener('click', () => $('#resetModal').classList.remove('hidden'));
  $('#cancelReset').addEventListener('click', () => $('#resetModal').classList.add('hidden'));
  $('#confirmReset').addEventListener('click', () => {
    state.done = {};
    state.mastered = {};
    saveState();
    renderTasks();
    updateProgress();
    $('#resetModal').classList.add('hidden');
    showToast('已重置', 'success');
  });

  // 知识卡片关闭
  $('#closeModal').addEventListener('click', closeLearnModal);
  $('#closeModalBtn').addEventListener('click', closeLearnModal);
  $('#learnModal').addEventListener('click', (e) => {
    if (e.target.id === 'learnModal') closeLearnModal();
  });
  $('#learnMastered').addEventListener('change', (e) => {
    // 已经标记为学会了，反向就是 unmaster（但目前 UI 没什么用）
  });

  // ESC 关闭弹窗
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      if (!$('#learnModal').classList.contains('hidden')) closeLearnModal();
      if (!$('#tasksDrawer').classList.contains('hidden')) closeTasksDrawer();
      if (!$('#cheatPanel').classList.contains('hidden')) closePanel('cheatPanel');
      if (!$('#resourcesPanel').classList.contains('hidden')) closePanel('resourcesPanel');
      if (!$('#faqPanel').classList.contains('hidden')) closePanel('faqPanel');
      if (!$('#mobileMenu').classList.contains('hidden')) closeMobileMenu();
    }
  });

  // 移动端菜单
  $('#hamburgerBtn')?.addEventListener('click', openMobileMenu);
  $('#mobileMenuClose')?.addEventListener('click', closeMobileMenu);

  // 移动端 dropdown 展开/收起
  $$('.mobile-dropdown-toggle').forEach(btn => {
    btn.addEventListener('click', () => {
      const panel = btn.nextElementSibling;
      if (!panel) return;
      const isOpen = !panel.classList.contains('hidden');
      // 关闭所有其他 dropdown
      $$('.mobile-dropdown-panel').forEach(p => p.classList.add('hidden'));
      $$('.mobile-dropdown-toggle .fa-chevron-down').forEach(c => c.classList.remove('rotate-180'));
      if (!isOpen) {
        panel.classList.remove('hidden');
        const chevron = btn.querySelector('.fa-chevron-down');
        if (chevron) chevron.classList.add('rotate-180');
      }
    });
  });

  // 移动端子项点击：跳转后关闭 drawer
  $$('#mobileMenu [data-nav-id]').forEach(a => {
    a.addEventListener('click', e => {
      e.preventDefault();
      const navId = a.dataset.navId;
      if (!navId) return;
      navigate('nav', 2, { navId });
      closeMobileMenu();
    });
  });

  // Pricing 链接点击：弹出学习卡
  $('#mobileMenuPricing')?.addEventListener('click', e => {
    e.preventDefault();
    showLearnModal('nav-pricing');
    closeMobileMenu();
  });
}

// ============ 移动端菜单 ============
function openMobileMenu() {
  const menu = $('#mobileMenu');
  if (!menu) return;
  menu.classList.remove('hidden');
  document.body.style.overflow = 'hidden';
}

function closeMobileMenu() {
  const menu = $('#mobileMenu');
  if (!menu) return;
  menu.classList.add('hidden');
  document.body.style.overflow = '';
}

function openTasksDrawer() {
  const drawer = $('#tasksDrawer');
  if (!drawer) return;
  drawer.classList.remove('hidden');
}

function closeTasksDrawer() {
  const drawer = $('#tasksDrawer');
  if (!drawer) return;
  drawer.classList.add('hidden');
}

// ============ 状态层（详情页用）============
const DATA_KEY = STORAGE_KEY + '-data';  // 'gh-guide-v1-data'

function defaultData() {
  return {
    workflows: JSON.parse(JSON.stringify(WORKFLOWS)),
    projects: JSON.parse(JSON.stringify(PROJECTS)),
    security: JSON.parse(JSON.stringify(SECURITY)),
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
          { sha: 'a1b2c3d', prId: 1, title: 'add skills link', author: 'ALT-s25', createdAt: '2026-10-08T13:55:00Z' },
          { sha: 'e4f5g6h', prId: 1, title: 'typo fix', author: 'ALT-s25', createdAt: '2026-10-08T13:58:00Z' },
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
          { sha: 'i7j8k9l', prId: 2, title: 'style: code block', author: 'ALT-s25', createdAt: '2026-10-06T10:55:00Z' },
        ],
      },
    },
    files: {
      'README.md': { path: 'README.md', size: '1.2 KB', lines: 45, lastModified: '2 days ago', content: '# my-first-repo 👋\n\n这是我的第一个 GitHub 仓库，用来记录学习过程。\n\n## 快速开始\n\n```bash\ngit clone git@github.com:ALT-s25/my-first-repo.git\ncd my-first-repo\necho "Hello GitHub!" >> README.md\ngit add . && git commit -m "first commit"\ngit push\n```\n\n## 学习进度\n\n- ✅ 注册 GitHub 账号\n- ⏳ 配置 SSH\n- ⬜ 第一次 commit\n' },
      'index.html': { path: 'index.html', size: '320 B', lines: 18, lastModified: '3 days ago', content: '<!DOCTYPE html>\n<html lang="zh-CN">\n<head>\n  <meta charset="UTF-8">\n  <title>My First Repo</title>\n</head>\n<body>\n  <h1>Hello GitHub!</h1>\n  <p>这是我的第一个静态页面。</p>\n</body>\n</html>' },
      '.gitignore': { path: '.gitignore', size: '64 B', lines: 4, lastModified: '5 days ago', content: 'node_modules/\n.DS_Store\n*.log\n.env' },
      'package.json': { path: 'package.json', size: '210 B', lines: 12, lastModified: '4 days ago', content: '{\n  "name": "my-first-repo",\n  "version": "1.0.0",\n  "description": "学习 GitHub 用",\n  "main": "index.js",\n  "scripts": {\n    "start": "node index.js"\n  }\n}' },
    },
    taskProgress: { current: 0, completed: [] },
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
window._initialRepoName = data.repo.name;

// ============ 任务挑战系统 ============
function getTaskProgress() {
  return data.taskProgress || { current: 0, completed: [] };
}

function saveTaskProgress() {
  saveData();
}

function completeTask(taskId) {
  const tp = getTaskProgress();
  if (tp.completed.includes(taskId)) return;
  tp.completed.push(taskId);
  const idx = TASKS.findIndex(t => t.id === taskId);
  if (idx === tp.current) tp.current = idx + 1;
  data.taskProgress = tp;
  saveTaskProgress();
  showToast(`🎉 任务 ${idx + 1} 完成！`, 'success');
  renderTaskSidebar();
  checkAutoComplete();
}

function checkAutoComplete() {
  if (!getTaskProgress().completed.includes('t1') && localStorage.getItem('gh-guide-onboarded') === '1') {
    completeTask('t1');
  }
  if (!getTaskProgress().completed.includes('t2') && view.tab === 'code' && view.level >= 2 && view.params.path === 'README.md') {
    completeTask('t2');
  }
  if (!getTaskProgress().completed.includes('t5') && data.repo.name !== (window._initialRepoName || 'my-first-repo')) {
    completeTask('t5');
  }
}

function renderTaskSidebar() {
  const container = $('#taskSidebarList');
  if (!container) return;
  const tp = getTaskProgress();
  container.innerHTML = TASKS.map((t, i) => {
    const isDone = tp.completed.includes(t.id);
    const isCurrent = i === tp.current;
    const isLocked = i > tp.current;
    return `
      <div class="task-item p-2 rounded text-xs ${isCurrent ? 'bg-[#0969da] text-white mentor-pulse' : isDone ? 'opacity-50' : isLocked ? 'opacity-40' : ''}">
        <div class="flex items-start gap-2">
          <i class="fa ${isDone ? 'fa-check-circle text-green-400' : isLocked ? 'fa-lock text-gh-400' : t.icon} mt-0.5"></i>
          <div class="flex-1 min-w-0">
            <div class="font-semibold">${i + 1}. ${escapeHtml(t.title)}</div>
            <div class="${isCurrent ? 'text-white/80' : 'text-gh-500'} text-xs">${escapeHtml(t.desc)}</div>
            ${isCurrent ? `<div class="mt-1 ${isCurrent ? 'text-white/90' : ''}">💡 ${escapeHtml(t.hint)}</div>` : ''}
          </div>
        </div>
      </div>
    `;
  }).join('');
}

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

// ============ 路由层 ============
const view = { tab: 'code', level: 1, params: {} };

const TAB_NAMES = { code: 'Code', issues: 'Issues', pulls: 'Pull requests', actions: 'Actions', projects: 'Projects', security: 'Security', insights: 'Insights', settings: 'Settings', nav: '顶部导航' };

function renderBreadcrumb() {
  const bc = $('#breadcrumb');
  if (!bc) return;
  const { tab, level, params } = view;
  const segs = ['<a href="#" data-nav="root" class="hover:underline">仓库</a>'];
  if (level >= 1) segs.push(`<a href="#" data-nav="tab:${tab}" class="hover:underline">${TAB_NAMES[tab]}</a>`);
  if (level >= 2 && params.id) {
    const lookup = tab === 'issues' ? data.issues : tab === 'pulls' ? data.pulls : data.files;
    const title = lookup[params.id]?.title || data.files[params.id]?.path || `#${params.id}`;
    segs.push(`<span class="text-gh-700 dark:text-gh-300">#${params.id} ${escapeHtml(title)}</span>`);
  }
  if (level >= 2 && params.path && tab === 'code') {
    segs.push(`<span class="text-gh-700 dark:text-gh-300">${escapeHtml(params.path)}</span>`);
  }
  if (level >= 2 && params.setting && tab === 'settings') {
    const item = SETTINGS_ITEMS.find(s => s.id === params.setting);
    if (item) segs.push(`<span class="text-gh-700 dark:text-gh-300">${item.name}</span>`);
  }
  if (level >= 2 && params.project && tab === 'projects') {
    const proj = data.projects?.find(x => x.id === params.project);
    if (proj) segs.push(`<a href="#" data-nav="proj:${params.project}" class="hover:underline">${escapeHtml(proj.name)}</a>`);
  }
  if (level >= 3) {
    if (params.cid) segs.push(`<span class="text-gh-700 dark:text-gh-300">评论 #${params.cid}</span>`);
    if (params.sha) segs.push(`<span class="text-gh-700 dark:text-gh-300 font-mono text-xs">${params.sha.slice(0, 7)}</span>`);
  }
  if (tab === 'nav' && params.navId) {
    const page = NAV_PAGES[params.navId];
    if (page) {
      segs.push(`<a href="#" data-nav="dropdown:${page.dropdown}" class="hover:underline">${page.dropdown}</a>`);
      segs.push(`<span class="text-gh-700 dark:text-gh-300">${escapeHtml(page.title)}</span>`);
    }
  }
  const back = level > 1 ? `<button id="bcBack" class="mr-2 px-2 py-0.5 rounded hover:bg-gh-100 dark:hover:bg-[#21262d] text-gh-600 dark:text-gh-400 text-xs">← 返回</button>` : '';
  bc.innerHTML = `${back}${segs.join(' <span class="text-gh-400 mx-1">/</span> ')}`;
  const backBtn = $('#bcBack');
  if (backBtn) backBtn.addEventListener('click', goBack);
  bc.querySelectorAll('[data-nav]').forEach(a => {
    a.addEventListener('click', e => {
      e.preventDefault();
      const target = a.dataset.nav;
      if (target === 'root') navigate('code', 1, {});
      else if (target.startsWith('tab:')) navigate(target.slice(4), 1, {});
      else if (target.startsWith('proj:')) navigate('projects', 2, { project: target.slice(5) });
      else if (target.startsWith('dropdown:')) navigate('code', 1, {});
    });
  });
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
  checkAutoComplete();
}

function goBack() {
  if (view.level > 1) navigate(view.tab, view.level - 1, view.params);
}

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
            <a href="#" class="nav-to-commit block" data-sha="${c.sha}" data-prid="${c.prId}">
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
        <button id="cancelNewIssueCancel" class="btn btn-secondary">取消</button>
        <button id="submitNewIssue" class="btn btn-primary">提交</button>
      </div>
    </div>
  `;
  document.body.appendChild(modal);
  const close = () => modal.remove();
  $('#cancelNewIssue').onclick = close;
  $('#cancelNewIssueCancel').onclick = close;
  $('#submitNewIssue').onclick = () => {
    const title = $('#newIssueTitle').value.trim();
    const body = $('#newIssueBody').value.trim();
    if (!title) return showToast('标题不能为空', 'info');
    const id = String(Date.now());
    data.issues[id] = { id: parseInt(id, 10), title, body, state: 'open', author: 'ALT-s25', labels: [], createdAt: new Date().toISOString(), comments: [] };
    saveData();
    close();
    showToast('Issue 已创建', 'success');
    navigate('issues', 1, {});
  };
}

function renderIssueDetail(main, breadcrumb, id) {
  const issue = data.issues[id];
  if (!issue) { main.innerHTML = '<p>Issue 不存在</p>'; return; }
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
    completeTask('t3');
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
  const initial = (c.author && c.author[0] ? c.author[0].toUpperCase() : '?');
  main.innerHTML = breadcrumb + `
    <div class="border border-gh-200 dark:border-[#30363d] rounded-md bg-white dark:bg-[#0d1117] p-5">
      <div class="flex items-center gap-2 mb-3">
        <div class="w-8 h-8 rounded-full bg-[#0969da] text-white flex items-center justify-center text-sm font-semibold">${escapeHtml(initial)}</div>
        <div>
          <div class="text-sm font-semibold">${escapeHtml(c.author)}</div>
          <div class="text-xs text-gh-500">${c.createdAt.slice(0, 19).replace('T', ' ')}</div>
        </div>
      </div>
      <p class="text-sm whitespace-pre-wrap">${escapeHtml(c.body)}</p>
    </div>
  `;
}

// ============ 启动 ============
document.addEventListener('DOMContentLoaded', () => {
  initTheme();
  loadState();
  bindTabs();
  bindLearnables();
  bindNavPages();
  renderTasks();
  renderCheatsheet();
  renderResources();
  renderFaq();
  updateProgress();
  bindGlobal();

  // 监听系统主题
  window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
    if (!localStorage.getItem(STORAGE_KEY + '-theme')) {
      applyTheme(e.matches ? 'dark' : 'light');
    }
  });

  // 首次访问显示欢迎卡
  if (!localStorage.getItem(STORAGE_KEY + '-visited')) {
    const card = $('#welcomeCard');
    if (card) card.classList.remove('hidden');
    localStorage.setItem(STORAGE_KEY + '-visited', '1');
  }
  // 关闭欢迎卡
  const closeWelcome = $('#closeWelcome');
  if (closeWelcome) {
    closeWelcome.addEventListener('click', () => {
      const card = $('#welcomeCard');
      if (card) card.classList.add('hidden');
    });
  }
});

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
            <span class="inline-block px-2 py-0.5 rounded-full text-xs font-semibold text-white ${pr.state === 'open' ? 'bg-[#1a7f37]' : pr.state === 'merged' ? 'bg-[#8250df]' : 'bg-[#cf222e]'}">${pr.state}</span>
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
    completeTask('t4');
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
  $('#addCollab')?.addEventListener('click', () => {
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
  });
  $('#saveSetting')?.addEventListener('click', () => {
    if (settingId === 'general') {
      const name = $('#repoName').value.trim();
      const desc = $('#repoDesc').value.trim();
      const vis = document.querySelector('input[name="visibility"]:checked')?.value;
      if (name) mutate('repo.name', name);
      if (desc) mutate('repo.description', desc);
      if (vis) mutate('repo.visibility', vis);
      showToast('已保存', 'success');
      navigate('settings', 2, { setting: 'general' });
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

// ============ Actions Tab ============
function renderActionsList(main, breadcrumb) {
  main.innerHTML = breadcrumb + `
    <div class="border border-gh-200 dark:border-[#30363d] rounded-md bg-white dark:bg-[#0d1117] divide-y divide-gh-200 dark:divide-[#30363d]">
      ${data.workflows.map(wf => {
        const lastRun = wf.runs[0];
        const statusIcon = lastRun.status === 'success' ? 'fa-check-circle text-[#1a7f37]'
          : lastRun.status === 'failed' ? 'fa-times-circle text-[#cf222e]'
          : 'fa-circle-o-notch fa-spin text-[#0969da]';
        return `
        <button class="nav-to-wf w-full flex items-center gap-3 p-4 hover:bg-gh-50 dark:hover:bg-[#161b22] text-left" data-wf="${wf.id}">
          <i class="fa ${statusIcon} text-lg w-5"></i>
          <div class="flex-1 min-w-0">
            <div class="text-sm font-semibold">${escapeHtml(wf.name)}</div>
            <div class="text-xs text-gh-500 font-mono">${escapeHtml(wf.path)}</div>
            <div class="text-xs text-gh-500 mt-0.5">最近 run: ${escapeHtml(lastRun.commitMsg)} · ${lastRun.startedAt.slice(0, 10)}</div>
          </div>
          <span class="label ${lastRun.status === 'success' ? 'label-green' : 'label-red'}">${lastRun.status}</span>
          <i class="fa fa-chevron-right text-gh-400 text-xs"></i>
        </button>
      `;}).join('')}
    </div>
  `;
  $$('.nav-to-wf').forEach(b => b.addEventListener('click', () => {
    navigate('actions', 2, { wf: b.dataset.wf });
  }));
}

function renderActionRuns(main, breadcrumb, wfId) {
  const wf = data.workflows.find(w => w.id === wfId);
  if (!wf) { main.innerHTML = '<p>workflow 不存在</p>'; return; }
  view.params = { wf: wfId };
  main.innerHTML = breadcrumb + `
    <div class="space-y-4">
      <div class="border border-gh-200 dark:border-[#30363d] rounded-md bg-white dark:bg-[#0d1117]">
        <div class="p-4 border-b border-gh-200 dark:border-[#30363d]">
          <h2 class="text-lg font-semibold"><i class="fa fa-play-circle text-gh-500"></i> ${escapeHtml(wf.name)}</h2>
          <p class="text-xs text-gh-500 font-mono mt-1">${escapeHtml(wf.path)}</p>
        </div>
        <div class="p-4">
          <h3 class="text-sm font-semibold mb-2">workflow 文件（YAML 摘录）</h3>
          <pre class="font-mono text-xs bg-gh-50 dark:bg-[#0d1117] p-3 rounded overflow-x-auto">${escapeHtml(wf.yaml)}</pre>
        </div>
      </div>

      <div class="border border-gh-200 dark:border-[#30363d] rounded-md bg-white dark:bg-[#0d1117]">
        <div class="p-3 border-b border-gh-200 dark:border-[#30363d] flex items-center justify-between">
          <h3 class="text-sm font-semibold"><i class="fa fa-history text-gh-500"></i> Runs (${wf.runs.length})</h3>
          <button id="rerunWf" class="btn btn-secondary text-xs"><i class="fa fa-refresh"></i> Rerun all</button>
        </div>
        <ul class="divide-y divide-gh-200 dark:divide-[#30363d]">
          ${wf.runs.map(r => `
            <li>
              <a href="#" class="nav-to-run flex items-center gap-3 p-3 hover:bg-gh-50 dark:hover:bg-[#161b22]" data-run="${r.id}">
                <i class="fa ${r.status === 'success' ? 'fa-check-circle text-[#1a7f37]' : r.status === 'failed' ? 'fa-times-circle text-[#cf222e]' : 'fa-circle-o-notch fa-spin text-[#0969da]'} text-lg w-5"></i>
                <div class="flex-1 min-w-0">
                  <div class="text-sm font-semibold">${escapeHtml(r.commitMsg)}</div>
                  <div class="text-xs text-gh-500 mt-0.5">#${r.id} · ${escapeHtml(r.commitAuthor)} · ${r.duration} · ${r.startedAt.slice(0, 10)}</div>
                </div>
                <span class="label ${r.status === 'success' ? 'label-green' : 'label-red'}">${r.status}</span>
                <i class="fa fa-chevron-right text-gh-400 text-xs"></i>
              </a>
            </li>
          `).join('')}
        </ul>
      </div>
    </div>
  `;
  $$('.nav-to-run').forEach(a => a.addEventListener('click', e => {
    e.preventDefault();
    navigate('actions', 3, { wf: wfId, run: a.dataset.run });
  }));
  $('#rerunWf')?.addEventListener('click', () => {
    // 演示模式：把所有 run 标记为 success 并持久化
    wf.runs.forEach(r => { r.status = 'success'; });
    saveData();
    showToast(`已模拟重跑 ${wf.runs.length} 个 run（演示）`, 'success');
    navigate('actions', 2, { wf: wfId });
  });
}

function renderActionRunDetail(main, breadcrumb, wfId, runId) {
  const wf = data.workflows.find(w => w.id === wfId);
  const run = wf?.runs.find(r => String(r.id) === String(runId));
  if (!run) { main.innerHTML = '<p>run 不存在</p>'; return; }
  view.params = { wf: wfId, run: runId };
  const statusColor = run.status === 'success' ? 'text-[#1a7f37]'
    : run.status === 'failed' ? 'text-[#cf222e]' : 'text-[#0969da]';
  main.innerHTML = breadcrumb + `
    <div class="space-y-4">
      <div class="border border-gh-200 dark:border-[#30363d] rounded-md bg-white dark:bg-[#0d1117]">
        <div class="p-4 border-b border-gh-200 dark:border-[#30363d]">
          <div class="flex items-center gap-2">
            <i class="fa ${run.status === 'success' ? 'fa-check-circle' : 'fa-times-circle'} ${statusColor} text-xl"></i>
            <h2 class="text-lg font-semibold">${escapeHtml(wf.name)} · run #${run.id}</h2>
          </div>
          <div class="text-xs text-gh-500 mt-2">
            <span class="label ${run.status === 'success' ? 'label-green' : 'label-red'}">${run.status}</span>
            <span class="ml-2"><strong>${escapeHtml(run.commitMsg)}</strong></span>
            <span class="ml-2">· ${escapeHtml(run.commitAuthor)} · ${run.duration} · ${run.startedAt.slice(0, 19).replace('T', ' ')}</span>
          </div>
        </div>
      </div>

      <div class="border border-gh-200 dark:border-[#30363d] rounded-md bg-white dark:bg-[#0d1117]">
        <div class="p-3 border-b border-gh-200 dark:border-[#30363d]">
          <h3 class="text-sm font-semibold"><i class="fa fa-cogs text-gh-500"></i> Jobs (${run.jobs.length})</h3>
        </div>
        <ul class="divide-y divide-gh-200 dark:divide-[#30363d]">
          ${run.jobs.map(j => `
            <li>
              <button class="nav-to-job w-full flex items-center gap-3 p-3 hover:bg-gh-50 dark:hover:bg-[#161b22] text-left" data-job="${j.name}">
                <i class="fa ${j.status === 'success' ? 'fa-check-circle text-[#1a7f37]' : j.status === 'failed' ? 'fa-times-circle text-[#cf222e]' : 'fa-circle-o-notch fa-spin text-[#0969da]'} w-5"></i>
                <div class="flex-1 min-w-0">
                  <div class="text-sm font-semibold">${escapeHtml(j.name)}</div>
                  <div class="text-xs text-gh-500 mt-0.5">${j.steps.length} 步</div>
                </div>
                <span class="label ${j.status === 'success' ? 'label-green' : 'label-red'}">${j.status}</span>
                <i class="fa fa-chevron-right text-gh-400 text-xs"></i>
              </button>
              <div class="job-logs hidden px-3 pb-3" data-job-log="${j.name}">
                <pre class="font-mono text-xs bg-gh-50 dark:bg-[#0d1117] p-3 rounded overflow-x-auto">${j.steps.map(s => {
  const icon = s.status === 'success' ? '✓' : '✗';
  return `<span class="${s.status === 'success' ? 'text-[#1a7f37]' : 'text-[#cf222e]'}">${icon}</span> ${escapeHtml(s.name)}`;
}).join('\n')}</pre>
              </div>
            </li>
          `).join('')}
        </ul>
      </div>
    </div>
  `;
  $$('.nav-to-job').forEach(b => b.addEventListener('click', () => {
    const log = $(`[data-job-log="${b.dataset.job}"]`);
    log?.classList.toggle('hidden');
  }));
}

// ============ Projects Tab ============
function renderProjectsList(main, breadcrumb) {
  main.innerHTML = breadcrumb + `
    <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
      ${data.projects.map(p => `
        <button class="nav-to-project border border-gh-200 dark:border-[#30363d] rounded-md bg-white dark:bg-[#0d1117] p-4 text-left hover:border-[#0969da] dark:hover:border-[#58a6ff]" data-project="${p.id}">
          <h3 class="text-sm font-semibold mb-1"><i class="fa fa-table text-gh-500"></i> ${escapeHtml(p.name)}</h3>
          <p class="text-xs text-gh-500 mb-3">${escapeHtml(p.desc)}</p>
          <div class="flex items-center gap-3 text-xs text-gh-500">
            <span><i class="fa fa-clone"></i> ${p.cardCount} cards</span>
            <span><i class="fa fa-circle-o"></i> ${p.openIssues} issues</span>
            <span><i class="fa fa-code-fork"></i> ${p.openPRs} PRs</span>
          </div>
        </button>
      `).join('')}
    </div>
  `;
  $$('.nav-to-project').forEach(b => b.addEventListener('click', () => {
    navigate('projects', 2, { project: b.dataset.project });
  }));
}

function renderProjectBoard(main, breadcrumb, projectId) {
  const p = data.projects.find(x => x.id === projectId);
  if (!p) { main.innerHTML = '<p>project 不存在</p>'; return; }
  view.params = { project: projectId };
  const colDefs = [
    { key: 'todo', name: 'Todo', icon: 'fa-circle-o text-gh-400' },
    { key: 'inProgress', name: 'In Progress', icon: 'fa-circle-o-notch text-[#bf8700]' },
    { key: 'done', name: 'Done', icon: 'fa-check-circle text-[#1a7f37]' },
  ];
  main.innerHTML = breadcrumb + `
    <div class="space-y-4">
      <div class="border border-gh-200 dark:border-[#30363d] rounded-md bg-white dark:bg-[#0d1117] p-4">
        <h2 class="text-lg font-semibold"><i class="fa fa-table text-gh-500"></i> ${escapeHtml(p.name)}</h2>
        <p class="text-xs text-gh-500 mt-1">${escapeHtml(p.desc)}</p>
      </div>
      <div class="grid grid-cols-1 md:grid-cols-3 gap-3">
        ${colDefs.map(col => `
          <div class="border border-gh-200 dark:border-[#30363d] rounded-md bg-white dark:bg-[#0d1117]">
            <div class="p-3 border-b border-gh-200 dark:border-[#30363d] flex items-center gap-2">
              <i class="fa ${col.icon}"></i>
              <h3 class="text-sm font-semibold">${col.name}</h3>
              <span class="text-xs text-gh-500 ml-auto">${p.columns[col.key].length}</span>
            </div>
            <ul class="p-2 space-y-2 min-h-[100px]">
              ${p.columns[col.key].map(card => `
                <li class="border border-gh-200 dark:border-[#30363d] rounded p-2 hover:border-[#0969da] dark:hover:border-[#58a6ff]">
                  <a href="#" class="nav-to-card block" data-card="${card.id}">
                    <div class="text-sm font-semibold">${escapeHtml(card.title)}</div>
                    <div class="text-xs text-gh-500 mt-1">
                      ${card.issueId ? `<span class="label label-blue">#${card.issueId}</span> ` : ''}
                      ${card.assignee ? `<i class="fa fa-user text-gh-400"></i> ${escapeHtml(card.assignee)}` : '<i class="fa fa-user text-gh-300"></i> 未分配'}
                    </div>
                  </a>
                  <div class="flex gap-1 mt-2">
                    ${colDefs.filter(c => c.key !== col.key).map(c => `
                      <button class="move-card text-xs px-2 py-0.5 rounded border border-gh-200 dark:border-[#30363d] hover:bg-gh-100 dark:hover:bg-[#21262d]" data-card-id="${card.id}" data-from="${col.key}" data-to="${c.key}">→ ${c.name}</button>
                    `).join('')}
                  </div>
                </li>
              `).join('')}
            </ul>
          </div>
        `).join('')}
      </div>
    </div>
  `;
  $$('.nav-to-card').forEach(a => a.addEventListener('click', e => {
    e.preventDefault();
    navigate('projects', 3, { project: projectId, card: a.dataset.card });
  }));
  $$('.move-card').forEach(b => b.addEventListener('click', () => {
    const cardId = parseInt(b.dataset.cardId, 10);
    const from = b.dataset.from;
    const to = b.dataset.to;
    const idx = p.columns[from].findIndex(c => c.id === cardId);
    if (idx === -1) return;
    const [card] = p.columns[from].splice(idx, 1);
    p.columns[to].push(card);
    saveData();
    showToast(`已移至 ${to}`, 'success');
    navigate('projects', 2, { project: projectId });
  }));
}

function renderProjectCard(main, breadcrumb, projectId, cardId) {
  const p = data.projects.find(x => x.id === projectId);
  if (!p) { main.innerHTML = '<p>project 不存在</p>'; return; }
  const cardIdNum = parseInt(cardId, 10);
  let card = null, cardCol = null;
  for (const col of ['todo', 'inProgress', 'done']) {
    const found = p.columns[col].find(c => c.id === cardIdNum);
    if (found) { card = found; cardCol = col; break; }
  }
  if (!card) { main.innerHTML = '<p>卡片不存在</p>'; return; }
  view.params = { project: projectId, card: cardId };
  main.innerHTML = breadcrumb + `
    <div class="border border-gh-200 dark:border-[#30363d] rounded-md bg-white dark:bg-[#0d1117]">
      <div class="p-4 border-b border-gh-200 dark:border-[#30363d]">
        <h2 class="text-lg font-semibold"><i class="fa fa-sticky-note-o text-gh-500"></i> ${escapeHtml(card.title)}</h2>
        <div class="text-xs text-gh-500 mt-2 flex items-center gap-3">
          <span>所属看板：<strong>${escapeHtml(p.name)}</strong></span>
          <span>当前列：<strong>${cardCol === 'todo' ? 'Todo' : cardCol === 'inProgress' ? 'In Progress' : 'Done'}</strong></span>
        </div>
      </div>
      <div class="p-4 space-y-3">
        <div>
          <h3 class="text-sm font-semibold mb-1">描述</h3>
          <p class="text-sm">${escapeHtml(card.title)} 卡片。${card.issueId ? '关联到 issue #' + card.issueId + '。' : '独立卡片。'}</p>
        </div>
        <div>
          <h3 class="text-sm font-semibold mb-1">负责人</h3>
          <p class="text-sm">${card.assignee ? escapeHtml(card.assignee) : '<span class="text-gh-500">未分配</span>'}</p>
        </div>
        ${card.issueId ? `
        <div>
          <h3 class="text-sm font-semibold mb-1">关联 Issue</h3>
          <a href="#" id="gotoIssue" class="text-sm text-[#0969da] hover:underline" data-issue-id="${card.issueId}">#${card.issueId}</a>
        </div>
        ` : ''}
      </div>
    </div>
  `;
  $('#gotoIssue')?.addEventListener('click', e => {
    e.preventDefault();
    navigate('issues', 2, { id: e.currentTarget.dataset.issueId });
  });
}

// ============ Security Tab ============
function renderSecurityList(main, breadcrumb) {
  main.innerHTML = breadcrumb + `
    <div class="space-y-3">
      ${data.security.map(f => {
        const alertCount = f.alerts ? f.alerts.filter(a => !a.resolved).length : 0;
        const isPolicy = f.id === 'policy';
        return `
        <button class="nav-to-feature w-full flex items-center gap-3 p-4 border border-gh-200 dark:border-[#30363d] rounded-md bg-white dark:bg-[#0d1117] hover:border-[#0969da] dark:hover:border-[#58a6ff] text-left" data-feature="${f.id}">
          <i class="fa ${f.icon} text-xl w-5 ${isPolicy ? 'text-gh-500' : 'text-[#0969da] dark:text-[#58a6ff]'}"></i>
          <div class="flex-1 min-w-0">
            <div class="text-sm font-semibold">${escapeHtml(f.name)}</div>
            <div class="text-xs text-gh-500 mt-0.5">${escapeHtml(f.desc)}</div>
          </div>
          ${isPolicy
            ? `<span class="label ${f.enabled ? 'label-green' : 'label-yellow'}">${f.enabled ? '已启用' : '未启用'}</span>`
            : `<span class="label ${alertCount > 0 ? 'label-red' : 'label-green'}">${alertCount} 个 alert</span>`}
          <i class="fa fa-chevron-right text-gh-400 text-xs"></i>
        </button>
      `;}).join('')}
    </div>
  `;
  $$('.nav-to-feature').forEach(b => b.addEventListener('click', () => {
    navigate('security', 2, { feature: b.dataset.feature });
  }));
}

function renderSecurityFeature(main, breadcrumb, featureId) {
  const f = data.security.find(x => x.id === featureId);
  if (!f) { main.innerHTML = '<p>功能不存在</p>'; return; }
  view.params = { feature: featureId };
  let body = '';
  if (featureId === 'policy') {
    body = `
      <div class="prose prose-sm max-w-none dark:prose-invert">
        <pre class="font-mono text-xs bg-gh-50 dark:bg-[#0d1117] p-4 rounded overflow-x-auto">${escapeHtml(f.content)}</pre>
      </div>
    `;
  } else {
    // dependabot / code-scanning: alert 列表
    body = `
      <ul class="divide-y divide-gh-200 dark:divide-[#30363d]">
        ${f.alerts.map(a => {
          const sevClass = a.severity === 'critical' ? 'label-red'
            : a.severity === 'high' ? 'label-red'
            : a.severity === 'medium' ? 'label-yellow' : 'label-blue';
          return `
            <li>
              <a href="#" class="nav-to-vuln flex items-center gap-3 p-3 hover:bg-gh-50 dark:hover:bg-[#161b22] ${a.resolved ? 'opacity-50' : ''}" data-vuln="${a.id}">
                <span class="label ${sevClass}">${a.severity}</span>
                <div class="flex-1 min-w-0">
                  <div class="text-sm font-semibold">${escapeHtml(a.summary)}</div>
                  <div class="text-xs text-gh-500 mt-0.5 font-mono">
                    ${a.package ? `${escapeHtml(a.package)} ${escapeHtml(a.vulnerableVersion)} → ${escapeHtml(a.fixVersion)}` : `${escapeHtml(a.file)}:${a.line} · ${escapeHtml(a.rule)}`}
                  </div>
                </div>
                ${a.resolved ? '<span class="label label-green">已解决</span>' : '<i class="fa fa-chevron-right text-gh-400 text-xs"></i>'}
              </a>
            </li>
          `;
        }).join('')}
      </ul>
    `;
  }
  main.innerHTML = breadcrumb + `
    <div class="border border-gh-200 dark:border-[#30363d] rounded-md bg-white dark:bg-[#0d1117]">
      <div class="p-4 border-b border-gh-200 dark:border-[#30363d]">
        <h2 class="text-lg font-semibold"><i class="fa ${f.icon} text-gh-500"></i> ${escapeHtml(f.name)}</h2>
        <p class="text-xs text-gh-500 mt-1">${escapeHtml(f.desc)}</p>
      </div>
      <div>${body}</div>
    </div>
  `;
  if (featureId !== 'policy') {
    $$('.nav-to-vuln').forEach(a => a.addEventListener('click', e => {
      e.preventDefault();
      navigate('security', 3, { feature: featureId, vuln: a.dataset.vuln });
    }));
  }
}

function renderSecurityAlert(main, breadcrumb, featureId, vulnId) {
  const f = data.security.find(x => x.id === featureId);
  if (!f || !f.alerts) { main.innerHTML = '<p>功能不存在</p>'; return; }
  const alert = f.alerts.find(a => String(a.id) === String(vulnId));
  if (!alert) { main.innerHTML = '<p>alert 不存在</p>'; return; }
  view.params = { feature: featureId, vuln: vulnId };
  const sevClass = alert.severity === 'critical' || alert.severity === 'high' ? 'label-red'
    : alert.severity === 'medium' ? 'label-yellow' : 'label-blue';
  main.innerHTML = breadcrumb + `
    <div class="space-y-4">
      <div class="border border-gh-200 dark:border-[#30363d] rounded-md bg-white dark:bg-[#0d1117]">
        <div class="p-4 border-b border-gh-200 dark:border-[#30363d]">
          <div class="flex items-center gap-2 mb-2">
            <span class="label ${sevClass}">${alert.severity}</span>
            ${alert.cve ? `<span class="label label-blue font-mono">${escapeHtml(alert.cve)}</span>` : ''}
            ${alert.resolved ? '<span class="label label-green">已解决</span>' : ''}
          </div>
          <h2 class="text-lg font-semibold">${escapeHtml(alert.summary)}</h2>
        </div>
        <div class="p-4 space-y-3 text-sm">
          ${alert.package ? `
          <div>
            <h3 class="text-xs font-semibold text-gh-500 uppercase mb-1">受影响的包</h3>
            <p><code>${escapeHtml(alert.package)}</code> ${escapeHtml(alert.vulnerableVersion)}</p>
          </div>
          <div>
            <h3 class="text-xs font-semibold text-gh-500 uppercase mb-1">修复版本</h3>
            <p><code>${escapeHtml(alert.fixVersion)}</code></p>
          </div>
          ` : `
          <div>
            <h3 class="text-xs font-semibold text-gh-500 uppercase mb-1">位置</h3>
            <p><code>${escapeHtml(alert.file)}:${alert.line}</code></p>
          </div>
          <div>
            <h3 class="text-xs font-semibold text-gh-500 uppercase mb-1">规则</h3>
            <p><code>${escapeHtml(alert.rule)}</code></p>
          </div>
          `}
          <div>
            <h3 class="text-xs font-semibold text-gh-500 uppercase mb-1">引用</h3>
            <a href="${escapeHtml(alert.fixUrl)}" target="_blank" rel="noopener" class="text-[#0969da] hover:underline">${escapeHtml(alert.fixUrl)}</a>
          </div>
        </div>
        <div class="p-4 border-t border-gh-200 dark:border-[#30363d] flex justify-end">
          ${alert.resolved
            ? `<button id="reopenAlert" class="btn btn-secondary text-xs"><i class="fa fa-undo"></i> 重新打开</button>`
            : `<button id="resolveAlert" class="btn btn-primary text-xs"><i class="fa fa-check"></i> 标记为已解决</button>`}
        </div>
      </div>
    </div>
  `;
  $('#resolveAlert')?.addEventListener('click', () => {
    alert.resolved = true;
    saveData();
    showToast('已标记为已解决', 'success');
    navigate('security', 3, { feature: featureId, vuln: vulnId });
  });
  $('#reopenAlert')?.addEventListener('click', () => {
    alert.resolved = false;
    saveData();
    showToast('已重新打开', 'info');
    navigate('security', 3, { feature: featureId, vuln: vulnId });
  });
}

// ============ Insights Tab ============
function renderInsightsOverview(main, breadcrumb) {
  const s = INSIGHTS.summary;
  // 简易 bar chart：commits by day
  const commitsByDay = {
    '10/3': 1, '10/4': 1, '10/5': 1, '10/6': 1, '10/7': 0, '10/8': 2, '10/9': 0,
  };
  const maxBar = Math.max(...Object.values(commitsByDay), 1);
  main.innerHTML = breadcrumb + `
    <div class="space-y-4">
      <div class="border border-gh-200 dark:border-[#30363d] rounded-md bg-white dark:bg-[#0d1117] p-6">
        <h2 class="text-lg font-semibold mb-3"><i class="fa fa-bar-chart text-gh-500"></i> 仓库概览</h2>
        <div class="grid grid-cols-2 md:grid-cols-4 gap-3">
          <div class="border border-gh-200 dark:border-[#30363d] rounded p-3 text-center">
            <div class="text-2xl font-bold text-[#1f883d]">${s.commits}</div>
            <div class="text-xs text-gh-500 mt-1">Commits</div>
          </div>
          <div class="border border-gh-200 dark:border-[#30363d] rounded p-3 text-center">
            <div class="text-2xl font-bold text-[#0969da]">${s.contributors}</div>
            <div class="text-xs text-gh-500 mt-1">Contributors</div>
          </div>
          <div class="border border-gh-200 dark:border-[#30363d] rounded p-3 text-center">
            <div class="text-2xl font-bold text-[#bf8700]">${s.views}</div>
            <div class="text-xs text-gh-500 mt-1">Views (14d)</div>
          </div>
          <div class="border border-gh-200 dark:border-[#30363d] rounded p-3 text-center">
            <div class="text-2xl font-bold text-[#8250df]">${s.clones}</div>
            <div class="text-xs text-gh-500 mt-1">Clones (14d)</div>
          </div>
        </div>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div class="border border-gh-200 dark:border-[#30363d] rounded-md bg-white dark:bg-[#0d1117] p-4">
          <h3 class="text-sm font-semibold mb-3">Commits 趋势 (近 7 天)</h3>
          <div class="flex items-end gap-1 h-24">
            ${Object.entries(commitsByDay).map(([day, count]) => `
              <div class="flex-1 flex flex-col items-center">
                <div class="w-full bg-[#1a7f37] dark:bg-[#3fb950]" style="height: ${(count / maxBar) * 100}%; min-height: 2px"></div>
                <div class="text-[10px] text-gh-500 mt-1">${day}</div>
              </div>
            `).join('')}
          </div>
          <button class="nav-to-insights-category w-full mt-3 text-xs text-[#0969da] hover:underline" data-category="commits">查看 commit 历史 →</button>
        </div>

        <div class="border border-gh-200 dark:border-[#30363d] rounded-md bg-white dark:bg-[#0d1117] p-4">
          <h3 class="text-sm font-semibold mb-3">Code frequency</h3>
          <div class="text-sm space-y-1">
            <div class="flex items-center gap-2">
              <span class="text-[#1a7f37] w-16 text-xs">+${s.codeFrequencyAdditions}</span>
              <div class="flex-1 h-3 bg-gh-100 dark:bg-[#21262d] rounded">
                <div class="h-full bg-[#1a7f37] rounded" style="width: 100%"></div>
              </div>
            </div>
            <div class="flex items-center gap-2">
              <span class="text-[#cf222e] w-16 text-xs">-${s.codeFrequencyDeletions}</span>
              <div class="flex-1 h-3 bg-gh-100 dark:bg-[#21262d] rounded">
                <div class="h-full bg-[#cf222e] rounded" style="width: ${(s.codeFrequencyDeletions / s.codeFrequencyAdditions) * 100}%"></div>
              </div>
            </div>
          </div>
          <p class="text-xs text-gh-500 mt-3">加 / 删行数（演示）</p>
        </div>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
        <button class="nav-to-insights-category border border-gh-200 dark:border-[#30363d] rounded-md bg-white dark:bg-[#0d1117] p-4 text-left hover:border-[#0969da] dark:hover:border-[#58a6ff]" data-category="contributors">
          <h3 class="text-sm font-semibold mb-1"><i class="fa fa-users text-[#0969da]"></i> Contributors</h3>
          <p class="text-xs text-gh-500">${INSIGHTS.contributors.length} 位贡献者，共 ${INSIGHTS.contributors.reduce((s, c) => s + c.commits, 0)} 个 commit</p>
        </button>
        <button class="nav-to-insights-category border border-gh-200 dark:border-[#30363d] rounded-md bg-white dark:bg-[#0d1117] p-4 text-left hover:border-[#0969da] dark:hover:border-[#58a6ff]" data-category="traffic">
          <h3 class="text-sm font-semibold mb-1"><i class="fa fa-line-chart text-[#bf8700]"></i> Traffic</h3>
          <p class="text-xs text-gh-500">最近 7 天 views / clones</p>
        </button>
      </div>
    </div>
  `;
  $$('.nav-to-insights-category').forEach(b => b.addEventListener('click', () => {
    navigate('insights', 2, { category: b.dataset.category });
  }));
}

function renderInsightsCategory(main, breadcrumb, category) {
  let body = '';
  let title = '';
  if (category === 'contributors') {
    title = 'Contributors';
    body = `
      <ul class="divide-y divide-gh-200 dark:divide-[#30363d]">
        ${INSIGHTS.contributors.map(c => `
          <li>
            <a href="#" class="nav-to-contributor flex items-center gap-3 p-3 hover:bg-gh-50 dark:hover:bg-[#161b22]" data-name="${escapeHtml(c.name)}">
              <div class="w-10 h-10 rounded-full flex items-center justify-center text-white font-semibold" style="background: ${c.color}">${escapeHtml(c.avatar)}</div>
              <div class="flex-1 min-w-0">
                <div class="text-sm font-semibold">${escapeHtml(c.name)}</div>
                <div class="text-xs text-gh-500 mt-0.5">+${c.additions} / -${c.deletions} 行</div>
              </div>
              <div class="text-right">
                <div class="text-sm font-semibold">${c.commits}</div>
                <div class="text-xs text-gh-500">commits</div>
              </div>
              <i class="fa fa-chevron-right text-gh-400 text-xs"></i>
            </a>
          </li>
        `).join('')}
      </ul>
    `;
  } else if (category === 'traffic') {
    title = 'Traffic';
    const maxView = Math.max(...INSIGHTS.traffic.views.map(v => v.count));
    const maxClone = Math.max(...INSIGHTS.traffic.clones.map(c => c.count));
    body = `
      <div class="p-4 space-y-4">
        <div>
          <h3 class="text-sm font-semibold mb-2">Views (近 7 天)</h3>
          <div class="flex items-end gap-1 h-20">
            ${INSIGHTS.traffic.views.map(v => `
              <div class="flex-1 flex flex-col items-center">
                <div class="w-full bg-[#0969da]" style="height: ${(v.count / maxView) * 100}%; min-height: 2px" title="${v.count}"></div>
                <div class="text-[10px] text-gh-500 mt-1">${v.day.slice(1)}</div>
              </div>
            `).join('')}
          </div>
        </div>
        <div>
          <h3 class="text-sm font-semibold mb-2">Clones (近 7 天)</h3>
          <div class="flex items-end gap-1 h-20">
            ${INSIGHTS.traffic.clones.map(v => `
              <div class="flex-1 flex flex-col items-center">
                <div class="w-full bg-[#bf8700]" style="height: ${(v.count / maxClone) * 100}%; min-height: 2px" title="${v.count}"></div>
                <div class="text-[10px] text-gh-500 mt-1">${v.day.slice(1)}</div>
              </div>
            `).join('')}
          </div>
        </div>
      </div>
    `;
  } else if (category === 'commits') {
    title = 'Commit history (最近 10 个)';
    body = `
      <ul class="divide-y divide-gh-200 dark:divide-[#30363d]">
        ${INSIGHTS.commits.map(c => `
          <li class="flex items-center gap-3 p-3">
            <i class="fa fa-commit text-gh-400"></i>
            <div class="flex-1 min-w-0">
              <div class="text-sm font-semibold">${escapeHtml(c.title)}</div>
              <div class="text-xs text-gh-500 mt-0.5"><span class="font-mono">${c.sha.slice(0, 7)}</span> · ${escapeHtml(c.author)} · ${c.createdAt.slice(0, 10)}</div>
            </div>
          </li>
        `).join('')}
      </ul>
    `;
  } else {
    main.innerHTML = '<p>类别不存在</p>'; return;
  }
  view.params = { category };
  main.innerHTML = breadcrumb + `
    <div class="border border-gh-200 dark:border-[#30363d] rounded-md bg-white dark:bg-[#0d1117]">
      <div class="p-4 border-b border-gh-200 dark:border-[#30363d]">
        <h2 class="text-lg font-semibold"><i class="fa fa-bar-chart text-gh-500"></i> ${title}</h2>
      </div>
      <div>${body}</div>
    </div>
  `;
  if (category === 'contributors') {
    $$('.nav-to-contributor').forEach(a => a.addEventListener('click', e => {
      e.preventDefault();
      navigate('insights', 3, { contributor: a.dataset.name });
    }));
  }
}

function renderInsightsContributor(main, breadcrumb, name) {
  const c = INSIGHTS.contributors.find(x => x.name === name);
  if (!c) { main.innerHTML = '<p>贡献者不存在</p>'; return; }
  view.params = { contributor: name };
  // 简易趋势 bar
  const trend = [1, 0, 2, 1, 0, 3, 1];
  const maxTrend = Math.max(...trend);
  main.innerHTML = breadcrumb + `
    <div class="space-y-4">
      <div class="border border-gh-200 dark:border-[#30363d] rounded-md bg-white dark:bg-[#0d1117] p-4">
        <div class="flex items-center gap-3">
          <div class="w-16 h-16 rounded-full flex items-center justify-center text-white text-2xl font-semibold" style="background: ${c.color}">${escapeHtml(c.avatar)}</div>
          <div>
            <h2 class="text-lg font-semibold">${escapeHtml(c.name)}</h2>
            <p class="text-xs text-gh-500 mt-1">贡献者</p>
          </div>
        </div>
      </div>

      <div class="grid grid-cols-3 gap-3">
        <div class="border border-gh-200 dark:border-[#30363d] rounded p-3 text-center bg-white dark:bg-[#0d1117]">
          <div class="text-2xl font-bold">${c.commits}</div>
          <div class="text-xs text-gh-500 mt-1">Commits</div>
        </div>
        <div class="border border-gh-200 dark:border-[#30363d] rounded p-3 text-center bg-white dark:bg-[#0d1117]">
          <div class="text-2xl font-bold text-[#1a7f37]">+${c.additions}</div>
          <div class="text-xs text-gh-500 mt-1">Additions</div>
        </div>
        <div class="border border-gh-200 dark:border-[#30363d] rounded p-3 text-center bg-white dark:bg-[#0d1117]">
          <div class="text-2xl font-bold text-[#cf222e]">-${c.deletions}</div>
          <div class="text-xs text-gh-500 mt-1">Deletions</div>
        </div>
      </div>

      <div class="border border-gh-200 dark:border-[#30363d] rounded-md bg-white dark:bg-[#0d1117] p-4">
        <h3 class="text-sm font-semibold mb-3">Commits 趋势 (近 7 天)</h3>
        <div class="flex items-end gap-1 h-20">
          ${trend.map((count, i) => `
            <div class="flex-1 flex flex-col items-center">
              <div class="w-full rounded-t" style="background: ${c.color}; height: ${(count / maxTrend) * 100}%; min-height: 2px"></div>
              <div class="text-[10px] text-gh-500 mt-1">D${i + 1}</div>
            </div>
          `).join('')}
        </div>
      </div>

      <div class="border border-gh-200 dark:border-[#30363d] rounded-md bg-white dark:bg-[#0d1117] p-4">
        <h3 class="text-sm font-semibold mb-2">贡献过的仓库</h3>
        <p class="text-xs text-gh-500">（演示）<code>my-first-repo</code> · <code>learning-notes</code></p>
      </div>
    </div>
  `;
}

// ============ 搜索 ============
function runSearch(query) {
  if (!query) return { code: [], issues: [], pulls: [] };
  const q = query.toLowerCase();
  const code = Object.keys(data.files || {}).filter(p => p.toLowerCase().includes(q)).slice(0, 5);
  const issues = Object.values(data.issues || {}).filter(i => i.title.toLowerCase().includes(q)).slice(0, 5);
  const pulls = Object.values(data.pulls || {}).filter(p => p.title.toLowerCase().includes(q)).slice(0, 5);
  return { code, issues, pulls };
}

function renderSearchResults(query) {
  const dd = $('#searchDropdown');
  if (!dd) return;
  if (!query) {
    dd.innerHTML = '<div class="p-3 text-xs text-gh-500">输入关键字搜索 Issues、PRs、文件</div>';
    dd.classList.remove('hidden');
    return;
  }
  const r = runSearch(query);
  const total = r.code.length + r.issues.length + r.pulls.length;
  if (total === 0) {
    dd.innerHTML = `<div class="p-3 text-xs text-gh-500">未找到与 "${escapeHtml(query)}" 相关的内容</div>`;
    dd.classList.remove('hidden');
    return;
  }
  let html = '';
  if (r.code.length) {
    html += '<div class="px-3 py-1 text-xs font-semibold text-gh-500 bg-gh-50 dark:bg-[#0d1117]">📄 Code</div>';
    html += r.code.map(p => `<button class="search-result block w-full text-left px-3 py-2 hover:bg-gh-50 dark:hover:bg-[#21262d] text-sm" data-type="code" data-path="${escapeHtml(p)}"><i class="fa fa-file-text-o text-gh-500 w-5"></i> ${escapeHtml(p)}</button>`).join('');
  }
  if (r.issues.length) {
    html += '<div class="px-3 py-1 text-xs font-semibold text-gh-500 bg-gh-50 dark:bg-[#0d1117]">⚠️ Issues</div>';
    html += r.issues.map(i => `<button class="search-result block w-full text-left px-3 py-2 hover:bg-gh-50 dark:hover:bg-[#21262d] text-sm" data-type="issue" data-id="${i.id}"><i class="fa fa-exclamation-circle text-gh-500 w-5"></i> ${escapeHtml(i.title)}</button>`).join('');
  }
  if (r.pulls.length) {
    html += '<div class="px-3 py-1 text-xs font-semibold text-gh-500 bg-gh-50 dark:bg-[#0d1117]">⤴️ Pull requests</div>';
    html += r.pulls.map(p => `<button class="search-result block w-full text-left px-3 py-2 hover:bg-gh-50 dark:hover:bg-[#21262d] text-sm" data-type="pr" data-id="${p.id}"><i class="fa fa-git-pull-request text-gh-500 w-5"></i> ${escapeHtml(p.title)}</button>`).join('');
  }
  html += `<div class="px-3 py-1 text-xs text-gh-400 border-t border-gh-200 dark:border-[#30363d]">共 ${total} 条结果</div>`;
  dd.innerHTML = html;
  dd.classList.remove('hidden');
  $$('.search-result').forEach(b => b.addEventListener('click', () => {
    const t = b.dataset.type;
    if (t === 'code') navigate('code', 2, { path: b.dataset.path });
    else if (t === 'issue') navigate('issues', 2, { id: b.dataset.id });
    else if (t === 'pr') navigate('pulls', 2, { id: b.dataset.id });
    closeSearch();
  }));
}

function closeSearch() {
  $('#searchDropdown')?.classList.add('hidden');
  const inp = $('#searchInput');
  if (inp) inp.value = '';
}

// 绑定
$('#searchInput')?.addEventListener('focus', e => renderSearchResults(e.target.value));
$('#searchInput')?.addEventListener('input', e => {
  renderSearchResults(e.target.value);
  if (e.target.value && e.target.value.trim()) completeTask('t6');
});
$('#searchInput')?.addEventListener('keydown', e => { if (e.key === 'Escape') closeSearch(); });
document.addEventListener('click', e => {
  const dd = $('#searchDropdown');
  const inp = $('#searchInput');
  if (dd && !dd.classList.contains('hidden') && !dd.contains(e.target) && e.target !== inp) closeSearch();
});

// ============ Onboarding ============
let onboardingStep = 0;

function showOnboarding() {
  if (localStorage.getItem('gh-guide-onboarded') === '1') return;
  onboardingStep = 1;
  renderOnboardingStep();
  $('#onboardingOverlay')?.classList.remove('hidden');
}

function closeOnboarding() {
  $('#onboardingOverlay')?.classList.add('hidden');
  localStorage.setItem('gh-guide-onboarded', '1');
}

function nextOnboardingStep() {
  onboardingStep++;
  renderOnboardingStep();
}

function renderOnboardingStep() {
  const card = $('#onboardingCard');
  const highlight = $('#onboardingHighlight');
  const tooltip = $('#onboardingTooltip');
  if (!card || !highlight || !tooltip) return;

  if (onboardingStep === 1) {
    highlight.classList.add('hidden');
    tooltip.classList.add('hidden');
    card.classList.remove('hidden');
    card.innerHTML = `
      <div class="text-center">
        <div class="text-6xl mb-4">🎉</div>
        <h2 class="text-xl font-bold mb-2">欢迎来到 GitHub 新手探索站！</h2>
        <p class="text-sm text-gh-500 mb-6">接下来 3 步，我会带你认识这个界面。</p>
        <button id="obStart" class="btn btn-primary">开始</button>
      </div>
    `;
    $('#obStart').onclick = nextOnboardingStep;
  } else if (onboardingStep === 2) {
    card.classList.add('hidden');
    highlight.classList.remove('hidden');
    tooltip.classList.remove('hidden');
    const nav = document.querySelector('header');
    const r = nav?.getBoundingClientRect();
    if (r) {
      highlight.style.top = r.top + 'px';
      highlight.style.left = r.left + 'px';
      highlight.style.width = r.width + 'px';
      highlight.style.height = r.height + 'px';
    }
    $('#onboardingTooltipText').textContent = '这里是导航栏。5 个菜单 + 搜索框 + 头像，每个都可以点。';
    if (r) {
      tooltip.style.top = (r.bottom + 8) + 'px';
      tooltip.style.left = '50%';
      tooltip.style.transform = 'translateX(-50%)';
    }
    $('#onboardingNext').textContent = '下一步';
    $('#onboardingNext').onclick = nextOnboardingStep;
  } else if (onboardingStep === 3) {
    card.classList.add('hidden');
    highlight.classList.remove('hidden');
    tooltip.classList.remove('hidden');
    const tabBar = document.querySelectorAll('nav button')[0]?.parentElement;
    const r = tabBar?.getBoundingClientRect();
    if (r) {
      highlight.style.top = r.top + 'px';
      highlight.style.left = r.left + 'px';
      highlight.style.width = r.width + 'px';
      highlight.style.height = r.height + 'px';
    }
    $('#onboardingTooltipText').textContent = '8 个 Tab 是仓库的不同功能视图。最常用是 Code / Issues / Pull requests。';
    if (r) {
      tooltip.style.top = (r.bottom + 8) + 'px';
      tooltip.style.left = '50%';
      tooltip.style.transform = 'translateX(-50%)';
    }
    $('#onboardingNext').textContent = '开始学习';
    $('#onboardingNext').onclick = () => {
      closeOnboarding();
      showToast('🎉 引导完成！开始你的第一个任务', 'success');
    };
  }
}

// 触发：用 setTimeout 确保 DOM 准备好
setTimeout(() => showOnboarding(), 1000);

// 重看引导按钮
$('#replayOnboarding')?.addEventListener('click', () => {
  localStorage.removeItem('gh-guide-onboarded');
  showOnboarding();
});

// 任务挑战系统初始化
setTimeout(() => {
  renderTaskSidebar();
  checkAutoComplete();
}, 500);

