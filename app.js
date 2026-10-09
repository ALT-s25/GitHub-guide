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
    main.innerHTML = breadcrumb + `
      <div class="border border-gh-200 dark:border-[#30363d] rounded-md bg-white dark:bg-[#0d1117] p-8 text-center text-gh-500 text-sm">
        <i class="fa fa-play-circle text-4xl mb-2 block text-gh-300"></i>
        还没有 workflow。<br>
        <span class="text-xs">在 .github/workflows/ 目录添加 YAML 即可开始自动化。</span>
      </div>
    `;
  } else if (tab === 'projects') {
    main.innerHTML = breadcrumb + `
      <div class="border border-gh-200 dark:border-[#30363d] rounded-md bg-white dark:bg-[#0d1117] p-8 text-center text-gh-500 text-sm">
        <i class="fa fa-table text-4xl mb-2 block text-gh-300"></i>
        还没有 Project。<br>
        <span class="text-xs">用看板管理 issue 和 PR 进度。</span>
      </div>
    `;
  } else if (tab === 'security') {
    main.innerHTML = breadcrumb + `
      <div class="space-y-3">
        <div class="learnable border border-gh-200 dark:border-[#30363d] rounded-md bg-white dark:bg-[#0d1117] p-4" data-learnable="security-policy">
          <h3 class="text-sm font-semibold mb-1"><i class="fa fa-shield text-gh-500"></i> Security policy</h3>
          <p class="text-xs text-gh-500">如何负责任地报告安全漏洞</p>
        </div>
        <div class="learnable border border-[#ddf4ff] dark:border-[#1f6feb33] bg-[#ddf4ff] dark:bg-[#0d2944] rounded-md p-4" data-learnable="security-advisories">
          <h3 class="text-sm font-semibold mb-1 text-[#0969da] dark:text-[#58a6ff]">📢 Security advisories</h3>
          <p class="text-xs text-gh-700 dark:text-[#c9d1d9]">私下讨论并修复安全问题</p>
        </div>
        <div class="learnable border border-gh-200 dark:border-[#30363d] rounded-md bg-white dark:bg-[#0d1117] p-4" data-learnable="dependabot">
          <h3 class="text-sm font-semibold mb-1">🤖 Dependabot</h3>
          <p class="text-xs text-gh-500">自动检测依赖漏洞并提 PR 更新</p>
        </div>
      </div>
    `;
  } else if (tab === 'insights') {
    main.innerHTML = breadcrumb + `
      <div class="border border-gh-200 dark:border-[#30363d] rounded-md bg-white dark:bg-[#0d1117] p-6">
        <h2 class="text-lg font-semibold mb-3">📊 仓库概览</h2>
        <div class="grid grid-cols-2 md:grid-cols-4 gap-3">
          <div class="border border-gh-200 dark:border-[#30363d] rounded p-3 text-center">
            <div class="text-2xl font-bold text-[#1f883d]">7</div>
            <div class="text-xs text-gh-500 mt-1">Commits</div>
          </div>
          <div class="border border-gh-200 dark:border-[#30363d] rounded p-3 text-center">
            <div class="text-2xl font-bold text-[#0969da]">2</div>
            <div class="text-xs text-gh-500 mt-1">Branches</div>
          </div>
          <div class="border border-gh-200 dark:border-[#30363d] rounded p-3 text-center">
            <div class="text-2xl font-bold text-[#bf8700]">1</div>
            <div class="text-xs text-gh-500 mt-1">Pull Requests</div>
          </div>
          <div class="border border-gh-200 dark:border-[#30363d] rounded p-3 text-center">
            <div class="text-2xl font-bold text-[#8250df]">12</div>
            <div class="text-xs text-gh-500 mt-1">Days active</div>
          </div>
        </div>
      </div>
    `;
  } else if (tab === 'settings') {
    main.innerHTML = breadcrumb + `
      <div class="border border-gh-200 dark:border-[#30363d] rounded-md bg-white dark:bg-[#0d1117] divide-y divide-gh-200 dark:divide-[#30363d]">
        ${[
          { icon: 'fa-cog', name: 'General', desc: '改名、可见性、删除仓库等' },
          { icon: 'fa-bell', name: 'Notifications', desc: '订阅规则、通知邮箱' },
          { icon: 'fa-lock', name: 'Access', desc: '协作者、团队、部署密钥' },
          { icon: 'fa-code-fork', name: 'Collaborators', desc: '邀请协作者（私有仓库）' },
          { icon: 'fa-code-branch', name: 'Branches', desc: '默认分支、分支保护规则' },
          { icon: 'fa-tag', name: 'Tags', desc: '管理 release 标签' },
          { icon: 'fa-globe', name: 'Pages', desc: '部署静态网站' },
          { icon: 'fa-key', name: 'Secrets and variables', desc: 'CI/CD 用的密钥' },
          { icon: 'fa-plug', name: 'Integrations', desc: '第三方应用授权' },
          { icon: 'fa-ban', name: 'Danger Zone', desc: '转移、归档、删除' },
        ].map(item => `
          <button class="learnable w-full flex items-center gap-3 p-4 hover:bg-gh-50 dark:hover:bg-[#161b22] text-left" data-learnable="settings-${item.name.toLowerCase().split(' ')[0]}">
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
  }

  // 重新绑定可学习元素
  bindLearnables();
}

// ============ Tab 切换 ============
function bindTabs() {
  $$('.tab-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const tab = btn.dataset.tab;
      $$('.tab-btn').forEach(b => b.classList.remove('tab-active'));
      btn.classList.add('tab-active');
      renderTabContent(tab);
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
  $('#themeToggle').addEventListener('click', toggleTheme);

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
    }
  });
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
    const lookup = tab === 'issues' ? data.issues : tab === 'pulls' ? data.pulls : data.files;
    const title = lookup[params.id]?.title || data.files[params.id]?.path || `#${params.id}`;
    segs.push(`<span class="text-gh-700 dark:text-gh-300">#${params.id} ${escapeHtml(title)}</span>`);
  }
  if (level >= 2 && params.path && tab === 'code') {
    segs.push(`<span class="text-gh-700 dark:text-gh-300">${escapeHtml(params.path)}</span>`);
  }
  if (level >= 3) {
    if (params.cid) segs.push(`<span class="text-gh-700 dark:text-gh-300">评论 #${params.cid}</span>`);
    if (params.sha) segs.push(`<span class="text-gh-700 dark:text-gh-300 font-mono text-xs">${params.sha.slice(0, 7)}</span>`);
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

// ============ 启动 ============
document.addEventListener('DOMContentLoaded', () => {
  initTheme();
  loadState();
  bindTabs();
  bindLearnables();
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
