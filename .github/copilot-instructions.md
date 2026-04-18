# GitHub Copilot 提示词指南

> 本文件帮助 Copilot / AI Agent 理解项目结构、编码规范和贡献方式。

## 项目定位

knowrite 小说创作工作台的前端界面层，基于 React 19 + Vite 6 + Tailwind CSS v4。

## 技术栈

- React 19 (Hooks, no class components)
- Vite 6 (SWC 编译)
- Tailwind CSS v4 (utility-first, no custom CSS files for components)
- react-router-dom v7 (data API)
- lucide-react (icons only)

## 编码规范

### 组件规范
- 所有组件使用函数式组件 + Hooks
- 组件文件放在 `src/components/` 或 `src/pages/`
- 命名：PascalCase（如 `FitnessBars.jsx`）
- Props 使用解构赋值，有默认值的写在最后
- 复杂逻辑提取为自定义 Hook，放在 `src/hooks/`

### API 调用规范
- 所有后端 API 调用封装在 `src/api/` 目录
- SSE 流式请求使用原生 `EventSource`
- 普通请求使用标准 `fetch`，不引入 axios
- API base URL 从 `import.meta.env.VITE_API_BASE` 读取

### 样式规范
- 全部使用 Tailwind CSS utility classes
- 禁止写 `.css` 文件（`index.css` 除外，仅用于全局基础样式）
- 颜色主题：使用 slate 色系（`bg-slate-950`, `text-slate-50`）
- 响应式：移动端优先，使用 `sm:`, `md:`, `lg:` 断点

### 状态管理
- 简单状态：useState / useReducer
- 跨组件状态：React Context（`src/contexts/`）
- 不引入 Redux / Zustand / Jotai

## 目录结构

```
src/
├── api/           # 后端 API 封装
├── components/    # 可复用组件
│   ├── ui/        # 基础 UI 组件（Button, Card, Input, Badge...）
│   ├── world/     # 世界观面板组件
│   └── *.jsx      # 业务组件
├── pages/         # 路由页面
├── contexts/      # React Context
├── hooks/         # 自定义 Hooks
├── main.jsx       # 入口
└── index.css      # 全局基础样式
```

## 添加新页面

1. 在 `src/pages/` 创建 `XxxPage.jsx`
2. 在 `src/App.jsx` 添加路由
3. 如需新 API，在 `src/api/` 添加封装函数
4. 如需共享 UI，优先复用 `src/components/ui/` 中的组件

## 测试

本项目暂无测试框架。如需添加，建议使用 Vitest（与 Vite 同生态）。
