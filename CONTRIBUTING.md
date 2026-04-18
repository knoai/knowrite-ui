# 贡献指南

感谢你对 knowrite 小说创作工作台前端的关注！

## 如何贡献

### 1. 发现问题或提出建议
- 提交 Issue，描述清楚问题和期望行为
- 如果是 Bug，请提供复现步骤和环境信息

### 2. 提交代码
- Fork 仓库
- 创建分支：`git checkout -b feat/xxx` 或 `fix/xxx`
- 提交遵循 [Conventional Commits](https://www.conventionalcommits.org/) 规范
- 确保代码通过 `npm run build` 无报错
- 提交 Pull Request

## 代码规范

- 函数式组件 + Hooks，不使用 Class 组件
- Tailwind CSS utility classes，不写自定义 CSS
- 组件和 Hook 使用 JSDoc 注释
- 复杂逻辑提取为自定义 Hook

## 开发环境

```bash
npm install
npm run dev
# 前端运行在 http://localhost:5173
# 需要后端运行在 http://localhost:8000
```

## 提交规范

```
feat: 新功能
fix: 修复 bug
docs: 文档更新
style: 代码格式（不影响功能）
refactor: 重构
perf: 性能优化
test: 测试相关
chore: 构建/工具相关
```

## 许可证

MIT License — 贡献的代码将按 MIT 协议发布。
