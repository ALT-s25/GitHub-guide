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
- ✅ 首次访问 3 步新手引导（带高亮 + 旁白）
- ✅ 导师熊猫：左下角固定头像 + 旁白气泡
- ✅ 任务系统：7 个线性任务驱动学习（侧栏）
- ✅ "试试看"脉冲动画指引关键按钮

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

> 🎉 核心功能已全部上线，README 列出的"后续计划"全部完成。

### 下一轮候选
- [ ] 任务重置 / 回放
- [ ] 真实 GitHub 仓库链接对照
- [ ] 国际化

## License

MIT
