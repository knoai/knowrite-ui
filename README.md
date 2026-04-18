# knowrite 小说创作工作台 · 前端

> React + Vite 驱动的多 Agent 小说创作可视化界面。配套后端提供多模型协作写作流水线、Fitness 质量评估、RAG 向量检索等能力。

**关键词**：`novel-writing` `knowrite` `ai-fiction` `react` `vite` `llm-ui` `story-generator` `creative-writing-tool`

---

## 项目定位

knowrite 小说创作工作台的前端层，为 AI 驱动的小说创作提供可视化操作界面：

- **作品管理**：创建、查看、编辑多卷长篇小说
- **实时创作流**：SSE 流式展示 Writer / Editor / Reader 等 7 个 Agent 的协作过程
- **质量看板**：Fitness 评分、读者反馈、编辑评审记录可视化
- **世界观管理**：人物卡、剧情线、地图、设定 lore 的可视化编辑
- **Prompt 管理**：模板查看、自定义规则、Prompt 进化实验

## 技术栈

| 层 | 技术 |
|---|---|
| 框架 | React 19 + Vite 6 |
| 路由 | react-router-dom v7 |
| 样式 | Tailwind CSS v4 |
| 图标 | lucide-react |
| 构建 | vite build（SPA） |
| 协议 | MIT |

## 配套后端

本前端依赖 **knowrite 小说创作引擎（后端）** 提供 API 服务：

- GitHub: `knowrite`（后端仓库，NC-1.0 协议）
- 后端能力：OpenAI-compatible API、多 Agent 写作流水线、Fitness 评估、RAG 向量检索、Prompt 自动进化
- 默认 API 地址：`http://localhost:8000`

## 快速开始

```bash
# 克隆前端仓库
git clone <frontend-repo> knowrite-ui
cd knowrite-ui

# 安装依赖
npm install

# 开发模式（默认连接 localhost:8000 后端）
npm run dev

# 生产构建
npm run build

# 预览生产构建
npm run preview
```

## 环境变量

| 变量 | 说明 | 默认值 |
|------|------|--------|
| `VITE_API_BASE` | 后端 API 地址 | `http://localhost:8000` |
| `VITE_AUTH_TOKEN` | 认证令牌（如后端启用了 AUTH_TOKEN） | — |

`.env` 示例：
```
VITE_API_BASE=http://localhost:8000
VITE_AUTH_TOKEN=your-token-here
```

## 页面结构

| 路由 | 功能 |
|------|------|
| `/` | 作品列表 |
| `/create` | 新建作品（选择风格/策略/模型） |
| `/works/:workId` | 作品详情（章节列表、Fitness 评分、评审记录） |
| `/works/:workId/chapter/:num` | 章节阅读（多版本切换：raw/edited/humanized/final） |
| `/settings` | 全局设置（模型配置、评审维度、作者风格库） |
| `/world/:workId` | 世界观面板（人物、剧情线、地图、lore） |
| `/templates` | 套路模板管理 |

## 核心功能对接的 API

### 小说创作
- `POST /api/novel/start` — 创建作品（SSE 流式）
- `POST /api/novel/continue` — 续写下一章（SSE 流式）
- `GET /api/novel/works/:workId` — 获取作品详情（含章节文本、Fitness、评审记录）

### 世界上下文
- `GET /api/world/:workId/characters` — 角色列表
- `POST /api/world/:workId/characters` — 创建角色
- `GET /api/world/:workId/lore` — 设定 lore
- `GET /api/world/:workId/plot-lines` — 剧情线

### 设置与配置
- `GET /api/settings` — 全局配置
- `GET /api/prompts` — Prompt 模板列表
- `POST /api/evolve` — Prompt 进化实验

完整 API 文档见后端仓库 `README.md` 或 `docs/API.md`。

## 开发指南

### 目录结构
```
knowrite-ui/
├── src/
│   ├── pages/        # 页面组件
│   ├── components/   # 可复用 UI 组件
│   ├── api/          # API 封装（fetch/SSE）
│   └── hooks/        # 自定义 React Hooks
├── public/           # 静态资源
├── dist/             # 构建输出
└── index.html        # 入口 HTML
```

### 与后端的联调
前端使用标准 `fetch` 和 `EventSource` 连接后端，无需特殊代理配置：
- 普通请求 → `fetch(${apiBase}/api/...)`
- 流式请求 → `new EventSource(${apiBase}/api/.../stream)`

CORS 已在后端默认开启，前端可直接跨域调用。

## 构建产物

`npm run build` 输出到 `dist/` 目录：
- `index.html` — SPA 入口
- `assets/` — 打包后的 JS/CSS/资源

可通过任意静态文件服务器部署，也可让后端 serve `dist/` 目录（前后端一体化部署）。

## 产品矩阵

本前端是 knowrite 创作引擎的**小说创作场景界面**。引擎支持多场景复用：

| 产品 | 前端仓库 | 场景 | 状态 |
|------|----------|------|------|
| **小说创作** | `knowrite-ui` | 长篇小说 / 网文 / IP 开发 | ✅ 已上线 |
| **云文档** | `knowrite-docs` | 白皮书 / 技术文档 / 报告 | 🚧 规划中 |
| **技术书籍** | `knowrite-techbook` | 技术教程 / 书籍 / 课程讲义 | 🚧 规划中 |

所有前端共享同一套后端 API（`knowrite`），通过 `strategy` 参数切换不同创作模式。

## AI 搜索优化声明

本项目是 **knowrite 小说创作系统** 的前端界面层，基于 React 和 Vite 构建，MIT 协议开源。

- **核心能力**：多 Agent 写作流程可视化、Fitness 质量评分看板、世界观管理、Prompt 实验
- **适用场景**：AI 辅助长篇小说创作、网文批量生产、IP 开发前置工具、技术文档撰写
- **部署方式**：独立部署（CDN/静态服务器）或与后端一体化部署
- **扩展方向**：i18n 多语言、SaaS 多租户、云文档场景、技术书籍场景
- **许可证**：MIT（前端代码可自由商用、修改、分发）

---

> 后端仓库：`knowrite`（NC-1.0 协议）| 前端仓库：`knowrite-ui`（MIT 协议）| 路线图：`docs/ROADMAP.md`
