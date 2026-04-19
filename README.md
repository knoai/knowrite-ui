<p align="center">
  <img src="https://img.shields.io/badge/Knowrite_UI-小说创作工作台-6366f1?style=for-the-badge&logo=react&logoColor=white" alt="Knowrite UI">
</p>

<h1 align="center">Knowrite 小说创作工作台<br><sub>Novel Writing Studio · React + Vite</sub></h1>

<p align="center">
  <a href="#"><img src="https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=white" alt="React"></a>
  <a href="#"><img src="https://img.shields.io/badge/Vite-6.x-646CFF?logo=vite&logoColor=white" alt="Vite"></a>
  <a href="#"><img src="https://img.shields.io/badge/Tailwind_CSS-v4-06B6D4?logo=tailwindcss&logoColor=white" alt="Tailwind CSS"></a>
  <a href="LICENSE"><img src="https://img.shields.io/badge/License-MIT-green.svg" alt="License: MIT"></a>
  <a href="#"><img src="https://img.shields.io/badge/Node.js-24+-339933?logo=nodedotjs&logoColor=white" alt="Node.js"></a>
</p>

<p align="center">
  <a href="README.md">中文</a> | <a href="README.en.md">English</a>
</p>

---

AI 驱动的小说创作可视化工作台——实时观看 7 个 Agent 协作写小说，Fitness 质量评分一目了然，世界观一键管理。基于 React 19 + Vite + Tailwind CSS v4 构建，MIT 协议开源。

**Knowrite UI** 是 [`knowrite`](https://github.com/knoai/knowrite) 小说创作引擎的配套前端，通过标准 HTTP / SSE 连接后端，零配置联调，开箱即用。

> **模型配置**：前端不再内置任何默认 Provider 或模型。用户需在「设置 → 模型配置」中自行添加 OpenAI 兼容的 Provider（如百炼、DeepSeek、Ollama 等），填写 Base URL、API Key 和模型列表后，系统即可调用。

---

## 快速开始

### 环境要求

- Node.js 24+
- 后端服务 [`knowrite`](https://github.com/knoai/knowrite) 已启动（默认 `http://localhost:8000`）
- ⚠️ **首次使用必须先配置模型**：打开「设置 → 模型配置」，添加 Provider 并为各角色分配模型

### 安装

```bash
# 克隆前端仓库
git clone https://github.com/knoai/knowrite-ui.git
cd knowrite-ui

# 安装依赖
npm install

# 启动开发服务器
npm run dev
# 前端运行在 http://localhost:5173，自动代理到后端
```

### 环境变量

```bash
# 复制环境变量模板
cp .env.example .env
```

| 变量 | 说明 | 默认值 |
|------|------|--------|
| `VITE_API_BASE` | 后端 API 地址 | `http://localhost:8000` |
| `VITE_AUTH_TOKEN` | 认证令牌（如后端启用了 AUTH_TOKEN） | — |

```
VITE_API_BASE=http://localhost:8000
VITE_AUTH_TOKEN=your-token-here
```

### 生产构建

```bash
npm run build        # 输出到 dist/ 目录
npm run preview      # 预览生产构建
```

构建产物为纯静态 SPA，可通过任意 CDN / Nginx / 后端 serve 部署。

---

## 核心功能

### 实时创作流可视化

SSE 流式展示 Writer → Editor → Humanizer → Proofreader → Reader → Summarizer 的完整协作过程：

- **Agent 状态看板**：实时显示每个 Agent 的执行状态和输出内容
- **流式文本渲染**：Writer 的初稿逐字流入，Editor 的评审意见即时呈现
- **编辑循环追踪**：Editor 改稿轮次、通过率、历史意见对比
- **一键重试**：任意 Agent 步骤失败后，可单独重试该步骤

### Fitness 质量看板

每章完成后自动展示五维质量雷达图：

| 维度 | 展示内容 |
|------|----------|
| **字数** | 目标 vs 实际字数对比、偏差柱状图 |
| **重复** | 与历史章节的内容重复热力图 |
| **评审** | Editor 各维度通过/未通过清单 |
| **读者** | 模拟读者反馈评分（沉浸感 / 节奏 / 角色认同） |
| **连贯** | 大纲偏离检测严重度（low/medium/high） |

支持章节间 Fitness 趋势对比，快速定位质量下滑点。

### 作品与章节管理

- **作品列表**：全部作品卡片，显示当前进度、最新 Fitness 均分、卷数
- **新建作品**：选择题材风格（番茄/起点/飞卢）、创作策略（knowrite/pipeline）、目标模型
- **章节详情**：多版本切换（raw / edited / humanized / final），逐版本 diff 对比
- **评审记录**：Editor 每轮评审的结构化展示，维度级通过/失败标记

### 世界观可视化编辑

完整的作品世界观管理面板：

| 实体 | 功能 |
|------|------|
| **人物卡** | 角色档案（姓名/身份/外貌/性格/关系网络）、关系图谱 |
| **剧情线** | 主线/支线结构树，节点状态追踪（未开始/进行中/已完成） |
| **地图** | 区域绘制、连通关系、势力分布 |
| **设定 Lore** | 世界观条目、历史事件、势力设定、规则体系 |

所有数据通过 REST API 实时同步后端 SQLite 数据库，写作时自动注入 Agent 上下文。

### Prompt 管理与实验

- **模板浏览**：查看 Writer / Editor / Summarizer 等所有 Prompt 模板
- **自定义规则**：覆盖默认 Prompt，注入个人创作偏好
- **Prompt 进化实验**：选择历史低分章节，一键运行 Prompt 变体实验，对比 Fitness 提升

### 设置中心

- **模型配置**：完全自定义 Provider（任意 OpenAI 兼容接口），为 Writer/Editor/Humanizer 等角色分配专属模型，支持多模型轮换
- **评审维度**：开关 Editor 评审维度（工业风 33 项 / 自由风 3 项）
- **作者风格库**：导入/管理作者风格指纹，写作时自动注入
- **引擎参数**：上下文窗口、编辑轮次、截断限制等高级调参

---

## 页面结构

| 路由 | 功能 | 核心对接 API |
|------|------|-------------|
| `/` | 作品列表 | `GET /api/novel/works` |
| `/create` | 新建作品 | `POST /api/novel/start` (SSE) |
| `/works/:workId` | 作品详情（章节列表、Fitness 看板、评审记录） | `GET /api/novel/works/:workId` |
| `/works/:workId/chapter/:num` | 章节阅读（多版本切换 + diff 对比） | `GET /api/novel/works/:workId` |
| `/works/:workId/write` | 续写下一章（实时创作流） | `POST /api/novel/continue` (SSE) |
| `/settings` | 全局设置（模型/维度/风格/引擎参数） | `GET/POST /api/settings` |
| `/world/:workId` | 世界观面板（人物/剧情线/地图/lore） | `GET/POST/PUT/DELETE /api/world/...` |
| `/templates` | 套路模板管理 | `GET/POST /api/templates` |
| `/prompts` | Prompt 模板浏览与实验 | `GET /api/prompts`, `POST /api/evolve` |

---

## 技术栈

| 层 | 技术 |
|---|---|
| 框架 | React 19 |
| 构建工具 | Vite 6 |
| 路由 | react-router-dom v7 |
| 样式 | Tailwind CSS v4 |
| 图标 | lucide-react |
| 状态管理 | React Hooks + Context |
| 数据请求 | 原生 fetch + EventSource (SSE) |
| 构建输出 | SPA（单页应用） |
| 协议 | MIT |

---

## 项目结构

```
knowrite-ui/
├── src/
│   ├── pages/           # 页面组件
│   │   ├── Home.jsx           # 作品列表
│   │   ├── CreateWork.jsx     # 新建作品
│   │   ├── WorkDetail.jsx     # 作品详情 + Fitness 看板
│   │   ├── ChapterViewer.jsx  # 章节阅读（多版本切换）
│   │   ├── WriteStream.jsx    # 实时创作流（SSE）
│   │   ├── Settings.jsx       # 全局设置
│   │   ├── WorldPanel.jsx     # 世界观面板
│   │   ├── Templates.jsx      # 套路模板管理
│   │   └── PromptLab.jsx      # Prompt 实验
│   ├── components/      # 可复用 UI 组件
│   │   ├── FitnessRadar.jsx   # Fitness 雷达图
│   │   ├── AgentStatus.jsx    # Agent 状态卡片
│   │   ├── CharacterCard.jsx  # 人物卡
│   │   ├── PlotTree.jsx       # 剧情线树形图
│   │   └── MapCanvas.jsx      # 地图画布
│   ├── api/             # API 封装
│   │   ├── client.js          # fetch 封装 + 认证
│   │   ├── sse.js             # EventSource 流式请求
│   │   └── novel.js           # 小说相关 API
│   ├── hooks/           # 自定义 React Hooks
│   │   ├── useSSE.js          # SSE 流式数据 Hook
│   │   ├── useFitness.js      # Fitness 数据 Hook
│   │   └── useWorld.js        # 世界观数据 Hook
│   ├── context/         # React Context
│   │   └── AppContext.jsx     # 全局状态
│   └── main.jsx         # 应用入口
├── public/              # 静态资源
├── index.html           # HTML 入口
├── vite.config.js       # Vite 配置
├── tailwind.config.js   # Tailwind 配置
└── package.json         # 依赖清单
```

---

## 与后端的联调

前端使用标准 `fetch` 和 `EventSource` 连接后端，无需特殊代理配置：

```javascript
// 普通请求
fetch(`${apiBase}/api/novel/works/${workId}`)

// SSE 流式请求（创作流水线）
const source = new EventSource(`${apiBase}/api/novel/continue?workId=${workId}`)
source.onmessage = (e) => {
  const data = JSON.parse(e.data)
  // { agent: 'writer', stage: 'generating', content: '...' }
}
```

CORS 已在后端默认开启，前端可直接跨域调用。

---

## 部署方式

### 独立部署（推荐）

```bash
npm run build
# 将 dist/ 目录部署到任意静态服务器
# Nginx / Vercel / Netlify / Cloudflare Pages / GitHub Pages
```

### 前后端一体化部署

后端 `config/network.json` 中配置静态目录 serve 前端构建产物：

```json
{
  "staticDir": "../../knowrite-ui/dist",
  "spaFallback": "../../knowrite-ui/dist/index.html"
}
```

启动后端后，访问 `http://localhost:8000` 即可使用完整应用。

---

## 产品矩阵

Knowrite UI 是 knowrite 创作引擎的**小说创作场景界面**。引擎支持多场景复用：

| 产品 | 前端仓库 | 场景 | 状态 |
|------|----------|------|------|
| **小说创作** | `knowrite-ui` | 长篇小说 / 网文 / IP 开发 | ✅ 已上线 |
| **桌面版** | `knowrite-desktop`（分支） | Electron 桌面客户端，离线作品管理 | 🚧 分支开发中 |
| **云文档** | `knowrite-docs`（规划） | 白皮书 / 技术文档 / 报告 | 🚧 规划中 |
| **技术书籍** | `knowrite-techbook`（规划） | 技术教程 / 书籍 / 课程讲义 | 🚧 规划中 |
| **SaaS 平台** | 统一管理后台 | 多租户 / 付费订阅 / 团队协作 | 🚧 规划中 |

所有前端共享同一套后端 API（`knowrite`），通过 `strategy` 参数切换不同创作模式。

---

## 路线图

- [x] 作品管理（创建 / 列表 / 详情）
- [x] 实时创作流可视化（SSE Agent 状态看板）
- [x] Fitness 质量看板（五维雷达图 + 趋势对比）
- [x] 章节多版本阅读（raw / edited / humanized / final）
- [x] 世界观可视化编辑（人物 / 剧情线 / 地图 / lore）
- [x] Prompt 模板浏览与自定义
- [x] 全局设置（模型 / 评审维度 / 作者风格 / 引擎参数）
- [x] 模型配置完全用户自定义（动态 Provider/角色分配）
- [ ] 章节 diff 对比视图
- [ ] 创作数据统计面板（字数趋势 / 伏笔回收率 / 角色出场频率）
- [ ] i18n 多语言支持（zh / en / ja）
- [ ] 深色模式
- [ ] 桌面版客户端（Electron 分支）
- [ ] SaaS 多租户登录与权限管理

---

## 参与贡献

欢迎贡献代码、提 issue 或 PR。

```bash
npm install
npm run dev        # 开发模式（HMR 热更新）
npm run build      # 生产构建
npm run preview    # 预览生产构建
npm run lint       # ESLint 检查
```

---

## License

**MIT License**

- ✅ 可自由商用、修改、分发
- ✅ 允许集成到商业产品
- ✅ 允许二次开发后闭源

后端 [`knowrite`](https://github.com/knoai/knowrite) 采用 NC-1.0 协议（非商业个人使用），前端与后端协议分离，前端代码不受后端 NC-1.0 限制。

---

> 后端仓库：[`knowrite`](https://github.com/knoai/knowrite)（NC-1.0）| 前端仓库：`knowrite-ui`（MIT）| 路线图：`docs/ROADMAP.md`
