// ============ UI 元素知识库 ============
// 每个 key 对应 HTML 中 data-learnable 的值
// 字段：category(分类) / title / what(是什么) / how(怎么用) / tip(提示) / warn(注意事项)
const learnables = {
  'logo': {
    category: '入门', title: 'GitHub Logo（顶部小猫图标）',
    what: '点击猫头图标会回到你的 GitHub 首页（Dashboard）。这是 GitHub 全站的入口。',
    how: '在任何 GitHub 页面点击它，都相当于"返回首页"。登录后默认跳转到自己的 Dashboard，未登录跳转到营销页。',
    tip: '记住这个标志：遇到问题想"重新开始"时，先点它回到首页。'
  },
  'nav-product': {
    category: '入门', title: 'Product 菜单',
    what: 'GitHub 提供的核心产品分类入口。',
    how: '悬停打开下拉菜单查看具体产品（Actions / Packages / Codespaces / Copilot 等）。初学者无需深入。',
  },
  'nav-solutions': {
    category: '入门', title: 'Solutions 菜单',
    what: '按行业/角色分类的解决方案（企业、开源、教育等）。',
    how: '一般用不到，初学者可忽略。',
    tip: '以后想找"如何用 GitHub 部署博客"这类问题，可以来这里看看。'
  },
  'nav-resources': {
    category: '入门', title: 'Resources 菜单',
    what: 'GitHub 学习资源入口：文档、博客、论坛、学习路径。',
    how: '新手推荐关注 GitHub Docs（官方文档），是英文但最权威。',
    tip: '官方学习路径：https://skills.github.com （免费互动课程）。'
  },
  'nav-open-source': {
    category: '入门', title: 'Open Source 菜单',
    what: '开源相关资源入口：Explore、Topics、Trending。',
    how: '想找开源项目、追热点、看社区动态都来这里。',
    tip: '点 Explore → Trending 可以看当前热门仓库。'
  },
  'nav-enterprise': {
    category: '入门', title: 'Enterprise 菜单',
    what: 'GitHub 企业版的介绍。普通用户用不到。',
  },
  'nav-product-repo': {
    category: '基础', title: '代码托管（Repository）',
    what: 'GitHub 最核心的功能：基于 Git 的代码仓库托管。',
    how: '每个项目对应一个仓库（Repository），里面存放代码、文档、Issue 跟踪等。这是 GitHub 的根。',
    tip: '点 + 号即可创建新仓库，初学者推荐勾选 "Add a README file"。'
  },
  'nav-product-actions': {
    category: '基础', title: 'Actions（自动化）',
    what: 'GitHub 的 CI/CD 平台，可以自动跑测试、构建、部署。',
    how: '在仓库的 <code>.github/workflows/</code> 目录放 YAML 文件，定义何时触发（如 push / PR）和做什么。',
    tip: '新手可以先忽略，等熟悉 Git 基础后再学。一个超简单的 hello-world 教程：https://docs.github.com/actions'
  },
  'nav-product-copilot': {
    category: '基础', title: 'Copilot（AI 编程助手）',
    what: 'GitHub 推出的 AI 代码补全工具，基于 OpenAI Codex/GPT。',
    how: '在编辑器（VS Code 等）装 Copilot 插件，写代码时按 Tab 接受 AI 建议。',
    tip: '学生可免费用（需学生认证），普通用户 10 美元/月。'
  },
  'nav-product-security': {
    category: '安全', title: '安全扫描',
    what: 'Dependabot + Code Scanning + Secret Scanning 等自动检测工具。',
    how: '在仓库 Settings → Security 启用。Dependabot 会自动检测依赖漏洞并提 PR 更新。',
    warn: '如果意外提交了 token（密码），应立即撤销：Settings → Developer settings → Personal access tokens → Revoke。'
  },
  'nav-sol-team': {
    category: '进阶', title: '团队协作（Team）',
    what: 'Organization（组织）下的成员管理，可分组、设权限。',
    how: '免费账户可以建 Organization 然后邀请成员，每个成员不同角色（Owner / Member）。',
    tip: '5 人以下协作可以不开 Organization，直接仓库里加协作者更简单。'
  },
  'nav-sol-edu': {
    category: '入门', title: '教育方案',
    what: 'GitHub Education：学生免费 Pro、教师免费 Team。',
    how: '用 .edu 邮箱或学信网截图去 https://education.github.com 申请。',
    tip: '通过后会得到 Student Developer Pack：免费域名、$100 数字海洋额度、Copilot 免费等一堆福利。'
  },
  'nav-sol-game': {
    category: '入门', title: '游戏开发',
    what: 'GitHub 在游戏行业的方案（Unity / Unreal 集成）。',
    how: '用 Git LFS 管理大文件（贴图、3D 模型），其他用法和普通项目一样。',
  },
  'nav-res-docs': {
    category: '入门', title: 'GitHub 官方文档',
    what: '最权威的 GitHub 使用手册。地址：<code>https://docs.github.com</code>',
    how: '按主题分类：入门 / 仓库 / 协作 / 管理 / 开发。遇到任何 GitHub 问题先查这里。',
    tip: '英文为主，但有中文翻译（部分页面），URL 把 <code>en</code> 改成 <code>zh</code> 试试。'
  },
  'nav-res-blog': {
    category: '入门', title: 'GitHub 博客',
    what: '产品更新、技术文章、用户故事。',
    how: '地址：<code>https://github.blog</code>',
  },
  'nav-res-community': {
    category: '入门', title: 'GitHub Community',
    what: '官方论坛：<code>https://github.community</code>',
    how: '在这里问问题，GitHub 员工会回。新手友好。',
  },
  'nav-res-skills': {
    category: '入门', title: 'GitHub Skills（互动课）',
    what: '官方免费互动课程，像玩游戏一样学 GitHub。',
    how: '地址：<code>https://skills.github.com</code>，每节课会在你账号下创建一个练习仓库。',
    tip: '强烈推荐！边做边学，比看文档快 10 倍。'
  },
  'nav-os-explore': {
    category: '基础', title: 'Explore（探索）',
    what: 'GitHub 的"发现"页面：推荐仓库、热门话题、值得关注的人。',
    how: '地址：<code>https://github.com/explore</code>。按主题分组（前端、后端、AI、DevOps 等）。',
    tip: '不知道该看什么时来这里，会刷新你对开源世界的认知。'
  },
  'nav-os-topics': {
    category: '基础', title: 'Topics（话题）',
    what: '话题分类：所有仓库都打上 topic 标签（如 "react" "machine-learning"）。',
    how: '访问 <code>https://github.com/topics/react</code> 即可看所有 react 仓库。',
    tip: '用 topic 搜索比自己一个个找高效得多。'
  },
  'nav-os-trending': {
    category: '基础', title: 'Trending（趋势）',
    what: '今日 / 本周 / 本月热门仓库排行。',
    how: '地址：<code>https://github.com/trending</code>。可按语言筛选（如 trending/python）。',
    tip: '每天 5 分钟逛逛，能学到很多业界新动向。'
  },
  'nav-ent-platform': {
    category: '进阶', title: '企业平台',
    what: 'GitHub Enterprise：私有部署、SLA 保障、SSO 单点登录。',
    how: '大型公司才用得到，个人开发者用免费版或 Team 版就够。',
  },
  'nav-ent-security': {
    category: '安全', title: '企业级安全',
    what: 'IP 白名单、审计日志、强制 2FA、合规报告等。',
    how: 'Enterprise Cloud 内置。GitHub Advanced Security 是付费插件，能做 code scanning。',
  },
  'nav-ent-ai': {
    category: '进阶', title: 'Enterprise AI',
    what: '企业专属的 Copilot 版本，数据隔离、定制模型。',
    how: '和普通 Copilot 用法一样，但公司付钱、数据不出内网。',
  },
  'nav-pricing': {
    category: '入门', title: 'Pricing 定价',
    what: '查看 GitHub 各档套餐价格。',
    how: '个人免费账户能创建无限公开仓库 + 无限私有仓库（私有仓库协作者最多 3 人）。',
    tip: '学生可申请 GitHub Student Developer Pack，免费获得 Pro 权限（需 .edu 邮箱或学生证明）。'
  },
  'search': {
    category: '基础', title: '搜索框（按 / 聚焦）',
    what: 'GitHub 的全局搜索引擎，可以搜索仓库、用户、代码、Issues 等。',
    how: '点击搜索框输入关键词，或在任意页面按 / 键直接聚焦搜索框。支持高级搜索语法：<code>repo:用户名/仓库名</code> 限定仓库，<code>language:python</code> 限定语言，<code>stars:&gt;1000</code> 限定 star 数。',
    tip: '搜索时按 Tab 可在"仓库 / 用户 / 代码"等分类间切换。'
  },
  'notif': {
    category: '基础', title: '通知铃 🔔',
    what: '你的消息中心。当有人：@提到你、评论你的 issue/PR、给你推送、关注你的活动时，会在这里收到通知。',
    how: '点击查看未读通知。点击右上的 ✓ 可标记全部已读。',
    tip: '通知可以分类过滤：只看我参与的、只看我 @ 的、按仓库过滤。建议刚开始不要全关——会漏掉重要回复。'
  },
  'create': {
    category: '基础', title: '+ 新建按钮',
    what: '创建新内容的入口。点击下拉：New repository（新仓库）、Import repository（导入外部仓库）、New gist（代码片段）、New organization（新组织）、New project（项目看板）。',
    how: '新手最常用 "New repository" 创建第一个仓库。',
    tip: '右上角的绿点表示有未读消息或通知。'
  },
  'avatar-menu': {
    category: '基础', title: '头像菜单',
    what: '点击你的头像打开个人菜单。',
    how: '可进入：Your profile（个人主页）、Your repositories（你的所有仓库）、Your stars（你 star 过的仓库）、Settings（账号设置）、Sign out（退出登录）等。',
    tip: '建议点 Your profile 看看你的"个人名片"长什么样。'
  },
  'owner-avatar': {
    category: '基础', title: '仓库所有者头像',
    what: '显示仓库所属用户/组织头像。个人仓库就是仓库所有者的头像。',
    how: '点击可进入所有者主页，看 ta 的其他仓库和活动。',
  },
  'owner-name': {
    category: '基础', title: '用户名（仓库路径第一段）',
    what: '仓库路径的第一段是用户名（或组织名）。"ALT-s25/my-first-repo" 表示这是用户 ALT-s25 的仓库。',
    how: '点用户名进入 ta 的主页，能看 ta 的所有公开仓库、贡献、关注者。',
    tip: 'Fork 一个别人的仓库后，路径会变成"你的用户名/原仓库名"，原仓库通过 "forked from 路径" 标注。'
  },
  'repo-name': {
    category: '基础', title: '仓库名（repo name）',
    what: '仓库路径第二段。一个仓库的全名 = 用户名/仓库名。',
    how: '点仓库名也会跳到当前页（一般没事干）。改名需要进 Settings。',
    tip: '好仓库名：小写、连字符分隔、描述性。例如 <code>my-blog</code>、<code>react-tutorial</code>。'
  },
  'visibility-badge': {
    category: '基础', title: '可见性徽章（Public / Private）',
    what: '显示仓库是公开还是私有。',
    how: '公开仓库：全网可看、搜索引擎可索引、可被 fork。私有仓库：只有你和你邀请的协作者可见。',
    tip: '放简历/作业的代码建议 Private。开源练手项目用 Public（顺便积累 GitHub 贡献图）。'
  },
  'repo-description': {
    category: '基础', title: '仓库描述',
    what: '一句话说明这个仓库是干什么的。',
    how: '在 Settings 改，保存后会自动显示。',
    tip: '好的描述示例："基于 Vue3 的博客系统 · 前后端分离 · 含管理后台"。'
  },
  'pin': {
    category: '基础', title: 'Pin 钉住',
    what: '把仓库钉在你的个人主页顶部，最多 6 个。',
    how: '点击 Pin 后，仓库会显示在 https://github.com/你的用户名 的"Pinned"区域。',
    tip: '建议把最得意的 4-6 个项目钉住，这是别人看你主页时的第一眼印象。'
  },
  'watch': {
    category: '基础', title: 'Watch 关注',
    what: '订阅仓库的动态通知。',
    how: '下拉可选：Not watching（不通知）、Participating（只通知我参与的）、All activity（所有活动都通知）。',
    tip: '新手的默认建议：选 Participating（只通知 @你的、PR 合并、issue 回复），不会被刷屏。'
  },
  'star': {
    category: '基础', title: 'Star 收藏 ⭐',
    what: '给仓库点赞/收藏。类似书签+点赞的结合。',
    how: '点一下 +1，再点取消。被 star 多的仓库通常意味着有价值。',
    tip: '你的 star 列表在 https://github.com/你的用户名?tab=stars ，是很好的"我的资源库"。'
  },
  'star-count': {
    category: '基础', title: 'Star 数量',
    what: '这个仓库收到的 star 总数。',
    how: '点击数字可进入"Stargazers"列表看谁 star 了它。',
  },
  'fork': {
    category: '基础', title: 'Fork 复刻 🍴',
    what: '把别人的仓库完整复制一份到你的账号下。',
    how: '点击后你的账号下会出现一个同名仓库（路径变成 "你的名字/原仓库名"），可以自由修改。',
    tip: '想给别人项目贡献代码？标准流程是：先 fork → 自己仓库改 → 发 Pull Request。'
  },
  'fork-count': {
    category: '基础', title: 'Fork 数量',
    what: '这个仓库被 fork 多少次。',
    how: '点击可看所有 fork 列表（谁 fork 了）。',
  },
  'watch-count': {
    category: '基础', title: 'Watch 数量',
    what: '正在 watch 这个仓库的人数。',
  },
  'tab-code': {
    category: '基础', title: 'Code 标签页',
    what: '仓库的默认页。展示文件列表、分支信息、README 渲染。',
    how: '看到的所有代码都在这里。可以切换分支（main/dev 等）、下载 ZIP、clone URL。',
    tip: 'README.md 会自动渲染在文件列表下方。'
  },
  'tab-issues': {
    category: '基础', title: 'Issues 标签页',
    what: 'Bug 报告、功能建议、问题讨论的列表。',
    how: '任何人都能在公开仓库提 Issue。维护者用 Issue 跟踪待办。',
    tip: '提 Issue 之前先搜一下，避免重复。提完后可以自己关、@别人帮忙看。'
  },
  'tab-pulls': {
    category: '进阶', title: 'Pull requests 标签页',
    what: 'PR 列表。"拉取请求"，即请求把你的代码合并到主分支。',
    how: '详见专门的 PR 教程。简单说：提 PR = 让别人审阅你的改动并合并。',
    tip: 'PR 不一定要"拉取"别人的代码，也可以提给自己仓库的不同分支。'
  },
  'tab-actions': {
    category: '进阶', title: 'Actions 标签页',
    what: 'GitHub 的 CI/CD（自动化构建/测试/部署）平台。',
    how: '用 YAML 写工作流（.github/workflows/*.yml），push 代码时自动跑。可以做：自动跑测试、自动部署网站、自动发版等。',
    tip: '新手暂时不用关心，等你写过项目想自动化时再来。'
  },
  'tab-projects': {
    category: '进阶', title: 'Projects 标签页',
    what: '看板（Kanban），用来组织任务。类似 Trello/Jira。',
    how: '可以创建多个 board，每张卡代表一个任务/Issue/PR。',
    tip: '个人小项目用不到，团队协作很有用。'
  },
  'tab-security': {
    category: '进阶', title: 'Security 标签页',
    what: '安全相关：依赖警告、Code scanning、Secret scanning。',
    how: 'GitHub 会自动扫描你代码里泄露的密钥、依赖的漏洞。点进来看警告详情。',
    tip: '⚠️ 不小心把 API key 提交了？点 Security → Secret scanning → 立即轮换密钥。'
  },
  'tab-insights': {
    category: '进阶', title: 'Insights 标签页',
    what: '仓库的统计和分析：贡献者活跃度、commit 频率、流量、依赖图。',
    how: '看自己/团队谁贡献了多少、什么时候最活跃。',
  },
  'tab-settings': {
    category: '基础', title: 'Settings 标签页',
    what: '仓库的所有配置。',
    how: '改名、改可见性、加协作者、删仓库、改默认分支、设 Pages、配置 Webhook 等都在这里。',
    warn: '删除仓库不可逆！会连同所有 Issue、PR、Release 一起消失。'
  },
  'about-header': {
    category: '基础', title: 'About 区块',
    what: '仓库的简介区，固定在右侧。',
    how: '含描述、主题（Topics）、官网链接、Wiki、README 状态等信息。',
  },
  'about-desc': {
    category: '基础', title: 'About 描述',
    what: '仓库的一句话简介。',
    how: '在 Settings → General → Description 修改。',
  },
  'readme-link': {
    category: '基础', title: 'Readme 链接',
    what: '说明这个仓库有 README.md 文件。',
    how: '点开跳到 README 渲染页。README = 项目的说明书。',
    tip: '好 README 包含：项目介绍、效果截图、快速开始、API 文档、贡献指南。'
  },
  'license-link': {
    category: '基础', title: 'License 协议链接',
    what: '说明这个仓库使用什么开源协议（MIT / Apache 2.0 / GPL 等）。',
    how: '点开看协议全文。',
    tip: '不确定选什么 → 选 MIT（最宽松）。GitHub 创建仓库时可以直接选。'
  },
  'stars-link': {
    category: '基础', title: 'Stars 链接',
    what: '列出所有 star 这个仓库的人。',
  },
  'watchers-link': {
    category: '基础', title: 'Watchers 链接',
    what: '列出所有 watch 这个仓库的人。',
  },
  'forks-link': {
    category: '基础', title: 'Forks 链接',
    what: '列出所有 fork 这个仓库的衍生项目。',
    tip: '看别人 fork 后的改动可以学到新用法。'
  },
  'languages-header': {
    category: '基础', title: 'Languages 语言占比',
    what: '自动统计仓库代码的语言分布。',
    how: '基于文件扩展名 + Linguist 库。',
  },
  'language-bar': {
    category: '基础', title: '语言条',
    what: '可视化语言占比的进度条。',
  },
  'task-list-btn': {
    category: '工具', title: '学习清单',
    what: '按章节组织的"必学清单"，勾选表示"我已掌握"。',
    how: '点击打开右侧抽屉。每个任务可勾选，进度自动保存到本地。',
    tip: '建议从第一章"基础必会"开始，按顺序完成。'
  },
  'cheatsheet-btn': {
    category: '工具', title: 'Git 命令速查',
    what: '常用 Git 命令的速查表。',
    how: '点击打开侧边面板，分类展示。点 "复制" 按钮可复制命令。',
  },
  'resources-btn': {
    category: '工具', title: '推荐资源',
    what: 'GitHub 上值得 star 学习的项目、文章、课程。',
    how: '点击打开侧边面板。',
  },
  'faq-btn': {
    category: '工具', title: '常见问题 FAQ',
    what: '新手最容易踩的坑。',
    how: '点开看答案，遇到问题先来这里查。',
  },
  'theme-toggle': {
    category: '工具', title: '切换主题',
    what: '在亮色和暗色主题间切换。',
    how: '点击立即切换，自动保存。',
  },
  'reset-progress': {
    category: '工具', title: '重置进度',
    what: '清空所有"已学会"标记。',
    how: '点击后弹窗确认。',
    warn: '不可恢复。'
  }
};

// ============ 任务清单 ============
const taskChapters = [
  {
    name: '入门',
    icon: 'fa-flag',
    color: 'blue',
    desc: '刚开始接触 GitHub 必知',
    tasks: [
      { id: 't1', title: '注册 GitHub 账号', desc: '访问 github.com/signup 注册，验证邮箱' },
      { id: 't2', title: '完善个人资料', desc: '设置头像、Bio、所在地、社交链接' },
      { id: 't3', title: '认识 GitHub 页面布局', desc: '熟悉顶栏、个人主页、仓库主页结构' },
      { id: 't4', title: '试着 Star 一个仓库', desc: '到 https://github.com/trending 找个感兴趣的项目点 Star' },
    ]
  },
  {
    name: '基础必会',
    icon: 'fa-wrench',
    color: 'green',
    desc: '日常 90% 时间在做的事',
    tasks: [
      { id: 't5', title: '本地安装 Git', desc: '官网 git-scm.com 下载安装，命令行验证 git --version' },
      { id: 't6', title: '配置 Git 用户信息', desc: 'git config --global user.name "你的名字"，user.email "GitHub 邮箱"' },
      { id: 't7', title: '生成 SSH key 并配置到 GitHub', desc: 'ssh-keygen 生成公钥，粘贴到 Settings → SSH and GPG keys' },
      { id: 't8', title: '测试 SSH 连接', desc: 'ssh -T git@github.com 看到 "Hi 用户名" 成功' },
      { id: 't9', title: '在 GitHub 上创建第一个仓库', desc: '+ → New repository，建议勾选 README' },
      { id: 't10', title: '克隆仓库到本地', desc: 'git clone git@github.com:用户名/仓库名.git' },
      { id: 't11', title: '修改文件并 add', desc: 'git add . 暂存所有改动' },
      { id: 't12', title: '写 commit message 并 commit', desc: 'git commit -m "描述改了什么"' },
      { id: 't13', title: '推送到 GitHub', desc: 'git push 看到 GitHub 上文件更新' },
      { id: 't14', title: '看 commit history', desc: '在 GitHub 仓库点 Commits 看自己的提交记录' },
    ]
  },
  {
    name: '进阶操作',
    icon: 'fa-rocket',
    color: 'purple',
    desc: '玩得转 GitHub 的关键',
    tasks: [
      { id: 't15', title: '理解分支的概念', desc: 'main 是主分支，feature/xxx 是开发分支，互不干扰' },
      { id: 't16', title: '创建并切换分支', desc: 'git checkout -b feature/new-page' },
      { id: 't17', title: '把分支推到远程', desc: 'git push -u origin feature/new-page' },
      { id: 't18', title: '在 GitHub 上发 Pull Request', desc: 'Compare & pull request → 写标题描述 → Create' },
      { id: 't19', title: '处理 review 意见', desc: '根据评论改代码 → push 上去，PR 自动更新' },
      { id: 't20', title: '合并 PR', desc: 'Squash merge / Merge commit / Rebase merge 三选一' },
      { id: 't21', title: '解决合并冲突', desc: 'git pull 拉取 → 手动改冲突文件 → add + commit' },
      { id: 't22', title: '提一个 Issue', desc: '在别人仓库提个有意义的 bug 报告或功能建议' },
      { id: 't23', title: '使用 Markdown 写 README', desc: '在 README.md 里写标题/列表/代码块/图片' },
      { id: 't24', title: '用 GitHub Pages 部署个人主页', desc: 'Settings → Pages → 选分支，几分钟后获得静态网站' },
    ]
  },
  {
    name: '彩蛋技巧',
    icon: 'fa-magic',
    color: 'yellow',
    desc: '让 GitHub 用起来更爽',
    tasks: [
      { id: 't25', title: '用 / 快捷键聚焦搜索', desc: '在任意页面按 / 键直接到搜索框' },
      { id: 't26', title: '用 t 键搜索文件', desc: '在仓库页按 t 找文件，文件名模糊匹配' },
      { id: 't27', title: 'URL 行号分享代码', desc: '点代码左侧的行号，URL 自动带 #L23，复制即可分享' },
      { id: 't28', title: 'commit 信息中关闭 Issue', desc: 'commit 写 "fixes #12"，PR 合并后自动关闭对应 Issue' },
      { id: 't29', title: '用表情符号写 commit', desc: '✨ 新功能 🐛 修 bug 📝 文档 ⚡ 性能 等等' },
      { id: 't30', title: '用 . 键打开网页版 VS Code', desc: '在仓库页按 . 直接进 VS Code 在线版编辑代码' },
    ]
  }
];

// ============ Git 命令速查 ============
const commands = [
  { cmd: 'git init', desc: '把当前目录初始化为 Git 仓库（生成 .git 目录）', chapter: '起步' },
  { cmd: 'git clone <url>', desc: '克隆远程仓库到本地', chapter: '起步' },
  { cmd: 'git status', desc: '查看当前工作区状态（哪些文件被修改、暂存）', chapter: '起步' },
  { cmd: 'git add <file>', desc: '把文件加入暂存区（. 表示全部）', chapter: '起步' },
  { cmd: 'git commit -m "msg"', desc: '把暂存区的内容提交到本地仓库', chapter: '起步' },
  { cmd: 'git push', desc: '把本地提交推送到远程', chapter: '起步' },
  { cmd: 'git pull', desc: '从远程拉取并合并到本地', chapter: '起步' },
  { cmd: 'git log --oneline', desc: '一行一条查看 commit 历史', chapter: '起步' },
  { cmd: 'git diff', desc: '查看未暂存的改动', chapter: '起步' },
  { cmd: 'git branch', desc: '查看所有本地分支', chapter: '分支' },
  { cmd: 'git branch <name>', desc: '创建新分支', chapter: '分支' },
  { cmd: 'git checkout <name>', desc: '切换到指定分支', chapter: '分支' },
  { cmd: 'git checkout -b <name>', desc: '创建并切换到新分支', chapter: '分支' },
  { cmd: 'git merge <branch>', desc: '把指定分支合并到当前分支', chapter: '分支' },
  { cmd: 'git branch -d <name>', desc: '删除已合并的分支', chapter: '分支' },
  { cmd: 'git remote -v', desc: '查看远程仓库地址', chapter: '远程' },
  { cmd: 'git remote add origin <url>', desc: '添加远程仓库（origin 是默认名）', chapter: '远程' },
  { cmd: 'git fetch', desc: '从远程拉取但不合并', chapter: '远程' },
  { cmd: 'git stash', desc: '把未提交的改动暂存起来（切分支用）', chapter: '远程' },
  { cmd: 'git stash pop', desc: '恢复 stash 的内容', chapter: '远程' },
  { cmd: 'git reset --hard HEAD~1', desc: '撤销最近一次 commit（⚠️ 会丢改动）', chapter: '回滚' },
  { cmd: 'git revert <commit>', desc: '创建一个新 commit 来撤销某次改动（更安全）', chapter: '回滚' },
];

// ============ 推荐资源 ============
const resources = [
  { name: 'GitHub Skills', url: 'https://skills.github.com/', desc: '官方互动课程，从入门到 Actions 全免费', tags: ['课程', '官方'] },
  { name: 'GitHub Docs', url: 'https://docs.github.com/', desc: '官方文档，覆盖所有功能。最权威但全英文', tags: ['文档', '官方'] },
  { name: 'Oh My Zsh + git 插件', url: 'https://github.com/ohmyzsh/ohmyzsh', desc: '装了这个，命令行 git 会有大量快捷别名', tags: ['效率'] },
  { name: 'gitignore 模板集', url: 'https://github.com/github/gitignore', desc: '各种语言的 .gitignore 模板，新建项目时参考', tags: ['模板'] },
  { name: 'freeCodeCamp', url: 'https://github.com/freeCodeCamp/freeCodeCamp', desc: '开源编程学习社区，贡献友好，新手友好区', tags: ['学习', '社区'] },
  { name: 'first-contributions', url: 'https://github.com/firstcontributions/first-contributions', desc: '5 分钟教你提第一个 PR 的指南仓库', tags: ['入门', '必看'] },
  { name: 'build-your-own-x', url: 'https://github.com/codecrafters-io/build-your-own-x', desc: '从零实现各种轮子（数据库、Git、Docker 等）', tags: ['进阶', '练手'] },
  { name: 'public-apis', url: 'https://github.com/public-apis/public-apis', desc: '收集了大量免费 API，可用来做练手项目', tags: ['练手'] },
  { name: 'awesome 系列', url: 'https://github.com/sindresorhus/awesome', desc: 'awesome-* 仓库是各领域资源精选合集', tags: ['资源'] },
  { name: 'HelloGitHub', url: 'https://github.com/521xueweihan/HelloGitHub', desc: '中文社区，介绍有趣、入门级的开源项目', tags: ['中文', '入门'] },
  { name: 'GitHub 官方 YouTube', url: 'https://www.youtube.com/@GitHub', desc: '官方视频教程，英文但讲得清晰', tags: ['视频', '英文'] },
  { name: 'Markdown 教程', url: 'https://markdown.com.cn/', desc: '中文 Markdown 入门，README 写作必备', tags: ['中文', '工具'] },
];

// ============ FAQ 常见问题 ============
const faqs = [
  {
    q: 'git push 时报 "Permission denied (publickey)"',
    a: 'SSH key 没配好或没加到 GitHub。检查：① ~/.ssh/id_ed25519.pub 是否存在；② 公钥是否加到 GitHub → Settings → SSH keys；③ 远端 URL 是 git@... 而非 https://...。国内网络 22 端口被墙时，需在 ~/.ssh/config 配置 Port 443 走 ssh.github.com。'
  },
  {
    q: '忘了 GitHub 密码怎么办',
    a: '登录页点 "Forgot password?" → 输入邮箱 → 收到重置链接。注意用注册时的邮箱。'
  },
  {
    q: '把代码 push 上去了，commit 里却包含了我的 API key，怎么办？',
    a: '⚠️ 立即去相应平台（如 OpenAI、阿里云）轮换（revoke）那个 key！然后删 commit（BFG / git filter-repo 工具，或 force push）。历史 commit 里改完别人已经能爬到了——key 一定要先废掉。详见菜单"安全"标签页。'
  },
  {
    q: '如何删除一个仓库？',
    a: '进仓库 → Settings → 最下方 Danger Zone → Delete this repository → 输入仓库名确认。不可恢复。'
  },
  {
    q: 'git pull 报 "refusing to merge unrelated histories"',
    a: '本地仓库和远程有不同历史。git pull --allow-unrelated-histories 强制合并，或者重新 git clone。'
  },
  {
    q: '"Already up to date" 但本地文件还是旧版本',
    a: '可能你 fetch 了但没 checkout。git checkout main → git pull origin main。'
  },
  {
    q: '想撤销最近一次 commit 但保留改动',
    a: 'git reset --soft HEAD~1（保留文件到暂存区）。要丢掉改动用 git reset --hard HEAD~1。'
  },
  {
    q: 'fork 后的仓库怎么和原仓库同步？',
    a: '在 fork 的仓库点 "Sync fork" → Update branch。一键搞定。'
  },
  {
    q: '如何把已有文件夹变成 Git 仓库并推送到 GitHub？',
    a: 'cd 到文件夹 → git init → git add . → git commit -m "init" → 在 GitHub 新建空仓库 → git remote add origin URL → git push -u origin main。'
  },
  {
    q: 'README、.gitignore、LICENSE 应该放仓库根目录吗？',
    a: '是的。这三个是 GitHub 约定俗成的特殊文件，放根目录会被自动识别。'
  },
  {
    q: '为什么我的 commit 头像和 GitHub 头像不一致？',
    a: 'git config 里的 email 没设或不对。GitHub 靠 email 关联头像。改 git config user.email 为 GitHub 注册邮箱。'
  },
  {
    q: 'PR 合并后那个分支还要留着吗？',
    a: '不需要。可以在 PR 页面点 "Delete branch" 一键删。定期清理无用分支。'
  },
];

// ============ Projects 演示数据 ============
const PROJECTS = [
  {
    id: 'v1-roadmap',
    name: 'v1.0 路线图',
    desc: '第一版公开发布的功能规划',
    cardCount: 8,
    openIssues: 3,
    openPRs: 5,
    columns: {
      todo: [
        { id: 1, title: '设计 logo', issueId: 2, assignee: 'ALT-s25' },
        { id: 2, title: '写 README', issueId: null, assignee: 'ALT-s25' },
        { id: 3, title: '加 LICENSE', issueId: null, assignee: null },
      ],
      inProgress: [
        { id: 4, title: '修复 README 错别字', issueId: 3, assignee: 'ALT-s25' },
        { id: 5, title: 'Add Skills 链接', issueId: 1, assignee: 'ALT-s25' },
      ],
      done: [
        { id: 6, title: '初始化仓库', issueId: null, assignee: 'ALT-s25' },
        { id: 7, title: '配置 Pages', issueId: null, assignee: 'ALT-s25' },
      ],
    },
  },
  {
    id: 'bugs-backlog',
    name: 'Bug Backlog',
    desc: '待处理的 bug 与改进项',
    cardCount: 5,
    openIssues: 2,
    openPRs: 0,
    columns: {
      todo: [
        { id: 8, title: '页面在移动端错位', issueId: 4, assignee: null },
      ],
      inProgress: [],
      done: [
        { id: 9, title: '按钮颜色对比度不够', issueId: 5, assignee: 'ALT-s25' },
        { id: 10, title: '搜索结果不准确', issueId: 6, assignee: 'ALT-s25' },
      ],
    },
  },
];

// ============ Actions 演示数据 ============
const WORKFLOWS = [
  {
    id: 'ci',
    name: 'CI',
    path: '.github/workflows/ci.yml',
    yaml: `name: CI
on:
  push:
    branches: [main]
  pull_request:
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - run: npm ci
      - run: npm test`,
    runs: [
      {
        id: 1, status: 'success', commitMsg: 'Add Skills link to README',
        commitAuthor: 'ALT-s25', duration: '1m 23s', startedAt: '2026-10-08T14:05:00Z',
        jobs: [
          { name: 'test', status: 'success', steps: [
            { name: 'Run actions/checkout@v4', status: 'success' },
            { name: 'Run npm ci', status: 'success' },
            { name: 'Run npm test', status: 'success' },
            { name: 'Post Run actions/checkout@v4', status: 'success' },
          ]},
        ],
      },
      {
        id: 2, status: 'success', commitMsg: 'typo fix',
        commitAuthor: 'ALT-s25', duration: '58s', startedAt: '2026-10-08T13:58:00Z',
        jobs: [
          { name: 'test', status: 'success', steps: [
            { name: 'Run actions/checkout@v4', status: 'success' },
            { name: 'Run npm ci', status: 'success' },
            { name: 'Run npm test', status: 'success' },
          ]},
        ],
      },
    ],
  },
  {
    id: 'deploy',
    name: 'Deploy',
    path: '.github/workflows/deploy.yml',
    yaml: `name: Deploy
on:
  push:
    branches: [main]
jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - run: npm run build
      - run: npm run deploy`,
    runs: [
      {
        id: 3, status: 'failed', commitMsg: 'Update code-block styling',
        commitAuthor: 'ALT-s25', duration: '32s', startedAt: '2026-10-06T11:05:00Z',
        jobs: [
          { name: 'deploy', status: 'failed', steps: [
            { name: 'Run actions/checkout@v4', status: 'success' },
            { name: 'Run npm run build', status: 'success' },
            { name: 'Run npm run deploy', status: 'failed' },
          ]},
        ],
      },
      {
        id: 4, status: 'success', commitMsg: 'Initial deploy',
        commitAuthor: 'ALT-s25', duration: '45s', startedAt: '2026-10-05T09:00:00Z',
        jobs: [
          { name: 'deploy', status: 'success', steps: [
            { name: 'Run actions/checkout@v4', status: 'success' },
            { name: 'Run npm run build', status: 'success' },
            { name: 'Run npm run deploy', status: 'success' },
          ]},
        ],
      },
    ],
  },
];

// ============ Security 演示数据 ============
const SECURITY = [
  {
    id: 'policy',
    name: 'Security policy',
    icon: 'fa-shield',
    enabled: true,
    desc: '如何负责任地报告安全漏洞',
    content: `# Security Policy

## Supported Versions

| Version | Supported          |
| ------- | ------------------ |
| 1.0.x   | :white_check_mark: |

## Reporting a Vulnerability

如果您发现安全漏洞，请发送邮件到 **security@example.com**，不要在公开 issue 中报告。

我们会在 48 小时内回复。`,
  },
  {
    id: 'dependabot',
    name: 'Dependabot alerts',
    icon: 'fa-bell',
    enabled: true,
    desc: '自动检测依赖漏洞并提 PR',
    alerts: [
      {
        id: 1, severity: 'critical', package: 'lodash',
        vulnerableVersion: '< 4.17.21', fixVersion: '4.17.21',
        summary: 'Prototype pollution in lodash',
        cve: 'CVE-2021-23337',
        resolved: false,
        fixUrl: 'https://github.com/lodash/lodash/pull/5085',
      },
      {
        id: 2, severity: 'high', package: 'axios',
        vulnerableVersion: '< 0.21.2', fixVersion: '0.21.2',
        summary: 'SSRF in axios',
        cve: 'CVE-2021-3749',
        resolved: false,
        fixUrl: 'https://github.com/axios/axios/pull/3414',
      },
      {
        id: 3, severity: 'medium', package: 'minimatch',
        vulnerableVersion: '< 3.0.5', fixVersion: '3.0.5',
        summary: 'ReDoS in minimatch',
        cve: 'CVE-2022-3517',
        resolved: true,
        fixUrl: 'https://github.com/isaacs/minimatch/pull/54',
      },
    ],
  },
  {
    id: 'code-scanning',
    name: 'Code scanning',
    icon: 'fa-search',
    enabled: true,
    desc: '用 CodeQL 扫描代码找漏洞',
    alerts: [
      {
        id: 4, severity: 'high', file: 'app.js',
        line: 1024, rule: 'js/sql-injection',
        summary: 'Potential SQL injection from user input',
        resolved: false,
        fixUrl: 'https://codeql.github.com/',
      },
      {
        id: 5, severity: 'low', file: 'utils.js',
        line: 42, rule: 'js/weak-crypto',
        summary: 'Use of weak cryptographic algorithm (MD5)',
        resolved: false,
        fixUrl: 'https://docs.github.com/code-security',
      },
    ],
  },
];
