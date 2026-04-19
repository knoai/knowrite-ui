import { useEffect } from 'react';
import { BookOpen, Library, Wrench, Sparkles, Layers, MessageCircle, Settings, HelpCircle, ChevronRight, Bot, Target, Zap, Rocket, Factory, Palette } from 'lucide-react';

function Section({ id, title, icon: Icon, children }) {
  return (
    <section id={id} className="scroll-mt-6">
      <div className="bg-slate-800/60 border border-slate-700/60 rounded-xl p-5 mb-4">
        <h2 className="text-lg font-semibold text-slate-100 flex items-center gap-2 mb-3">
          {Icon && <Icon size={20} className="text-sky-400" />}
          {title}
        </h2>
        {children}
      </div>
    </section>
  );
}

function H3({ children }) {
  return <h3 className="text-sm font-semibold text-sky-400 mt-4 mb-2">{children}</h3>;
}

function Hint({ children }) {
  return (
    <div className="bg-sky-500/5 border border-sky-500/15 rounded-lg px-4 py-3 my-3 text-sm text-slate-300">
      {children}
    </div>
  );
}

function Tag({ children, variant = 'default' }) {
  const map = {
    default: 'bg-slate-700/50 text-slate-300',
    primary: 'bg-sky-500/10 text-sky-300',
    success: 'bg-emerald-500/10 text-emerald-300',
    warning: 'bg-amber-500/10 text-amber-300',
    danger: 'bg-red-500/10 text-red-300',
  };
  return (
    <span className={`inline-block text-xs px-2 py-0.5 rounded-full mr-1.5 mb-1 ${map[variant] || map.default}`}>
      {children}
    </span>
  );
}

function Toc() {
  const items = [
    { href: '#overview', label: '系统概览' },
    { href: '#quickstart', label: '快速开始：3步写小说' },
    { href: '#modes', label: '工业风 vs 自由风' },
    { href: '#settings', label: '系统设置详解', children: [
      { href: '#settings-skill', label: '写作技能 & 评审维度' },
      { href: '#settings-chapter', label: '章节字数配置' },
      { href: '#settings-models', label: '模型配置（含轮换）' },
    ]},
    { href: '#world', label: '创作辅助' },
    { href: '#templates', label: '套路模板库' },
    { href: '#tools', label: '工具页面' },
    { href: '#verify', label: '如何验证功能是否生效' },
    { href: '#quality', label: '附录：好小说的标准' },
  ];

  return (
    <div className="bg-slate-800/60 border border-slate-700/60 rounded-xl p-5 mb-4">
      <h3 className="text-sm font-semibold text-sky-400 mb-3 flex items-center gap-2">
        <BookOpen size={16} /> 目录
      </h3>
      <ul className="space-y-1 text-sm">
        {items.map((item) => (
          <li key={item.href}>
            <a href={item.href} className="text-slate-400 hover:text-sky-400 transition flex items-center gap-1">
              <ChevronRight size={12} /> {item.label}
            </a>
            {item.children && (
              <ul className="ml-5 mt-1 space-y-1">
                {item.children.map((c) => (
                  <li key={c.href}>
                    <a href={c.href} className="text-slate-500 hover:text-sky-400 transition">{c.label}</a>
                  </li>
                ))}
              </ul>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}

export function GuidePage() {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="max-w-3xl mx-auto pb-10">
      <div className="text-center mb-6">
        <h1 className="text-2xl font-bold text-slate-50 mb-1">knowrite 小说创作工作台</h1>
        <p className="text-sm text-slate-500">使用指南 · 从入门到精通</p>
      </div>

      <Toc />

      <Section id="overview" title="系统概览" icon={Rocket}>
        <p className="text-sm text-slate-300 mb-3">
          这是一个基于多 Agent 协作的 AI 小说创作系统。核心思路是<strong className="text-slate-100">让每个 Agent 只干一件事</strong>，把创作流程拆解为专业分工：
        </p>
        <ul className="text-sm text-slate-300 space-y-1.5 list-disc pl-5">
          <li><strong className="text-slate-200">策划（Planner）</strong>：根据主题生成大纲</li>
          <li><strong className="text-slate-200">作者（Writer）</strong>：按大纲撰写章节初稿</li>
          <li><strong className="text-slate-200">编辑（Editor）</strong>：按评审维度审查并给出修改意见</li>
          <li><strong className="text-slate-200">去AI化（Humanizer）</strong>：消除 AI 腔调，增加人味</li>
          <li><strong className="text-slate-200">校编（Proofreader）</strong>：修正语病、错别字、标点</li>
          <li><strong className="text-slate-200">读者（Reader）</strong>：从读者视角给出可读性评分和反馈</li>
          <li><strong className="text-slate-200">摘要（Summarizer）</strong>：生成章节摘要，为后续章节提供上下文</li>
        </ul>
        <Hint>
          💡 你可以在「设置 → 模型配置」中为每个角色独立配置模型和温度，甚至让多个作者模型<strong className="text-slate-200">轮换写作</strong>，实现风格交替。
        </Hint>
      </Section>

      <Section id="quickstart" title="快速开始：3步写小说" icon={Zap}>
        <H3>Step 1：写下你的想法</H3>
        <p className="text-sm text-slate-300">
          在「开始创作」页面输入小说主题。没有灵感？点击下方的灵感标签（退婚逆袭、系统觉醒、重生复仇等）快速填充。
        </p>

        <H3>Step 2：选择风格</H3>
        <ul className="text-sm text-slate-300 space-y-1.5 list-disc pl-5">
          <li><strong className="text-slate-200">发布平台</strong>：番茄、起点、晋江、七猫、飞卢等 10 个平台</li>
          <li><strong className="text-slate-200">作者风格</strong>：热血磅礴、少年逆袭、体系严谨、深情宿命等 80 种风格</li>
          <li><strong className="text-slate-200">生成模式</strong>：快速模式（1-2分钟）或精品模式（5-15分钟，多轮精修）</li>
          <li><strong className="text-slate-200">写作风格</strong>：工业风（严格量产）或自由风（创意探索）</li>
        </ul>

        <H3>Step 3：开始创作</H3>
        <p className="text-sm text-slate-300">
          点击「开始创作」，系统自动完成：大纲生成 → 卷规划 → 章节写作 → 多轮审修 → 读者反馈 → 摘要生成。页面上会实时显示每一步的进度和使用的模型。
        </p>
        <Hint>
          💡 创作完成后，进入「我的作品」可查看详情、续写下一章、管理创作辅助数据，或导出完整小说文本。
        </Hint>
      </Section>

      <Section id="modes" title="工业风 vs 自由风" icon={Target}>
        <div className="overflow-x-auto">
          <table className="w-full text-sm border border-slate-700/40 rounded-lg overflow-hidden">
            <thead className="bg-slate-900/60 text-slate-400">
              <tr>
                <th className="text-left px-3 py-2 font-medium">维度</th>
                <th className="text-left px-3 py-2 font-medium">工业风（默认）</th>
                <th className="text-left px-3 py-2 font-medium">自由风</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700/30 text-slate-300">
              <tr className="bg-slate-900/20"><td className="px-3 py-2">创作规则</td><td className="px-3 py-2">8条严格规则</td><td className="px-3 py-2">2条底线</td></tr>
              <tr className="bg-slate-900/10"><td className="px-3 py-2">大纲约束</td><td className="px-3 py-2">严格依据，禁止偏离</td><td className="px-3 py-2">参考即可，允许偏离</td></tr>
              <tr className="bg-slate-900/20"><td className="px-3 py-2">字数控制</td><td className="px-3 py-2">严格（目标 ± 区间）</td><td className="px-3 py-2">建议性（约 X 字）</td></tr>
              <tr className="bg-slate-900/10"><td className="px-3 py-2">编辑轮数</td><td className="px-3 py-2">最多 3 轮</td><td className="px-3 py-2">仅 1 轮轻量检查</td></tr>
              <tr className="bg-slate-900/20"><td className="px-3 py-2">校编/润色</td><td className="px-3 py-2">完整校编 + 润色</td><td className="px-3 py-2">跳过校编，轻度润色</td></tr>
              <tr className="bg-slate-900/10"><td className="px-3 py-2">去AI化</td><td className="px-3 py-2">重度</td><td className="px-3 py-2">轻度</td></tr>
              <tr className="bg-slate-900/20"><td className="px-3 py-2">Fitness 字数权重</td><td className="px-3 py-2">0.15</td><td className="px-3 py-2">0.05</td></tr>
              <tr className="bg-slate-900/10"><td className="px-3 py-2">适合场景</td><td className="px-3 py-2">量产网文、稳定质量</td><td className="px-3 py-2">灵感驱动、探索写作</td></tr>
            </tbody>
          </table>
        </div>
        <Hint>
          💡 在「设置 → 写作风格」可设系统默认模式。创建作品时也可单独覆盖。
        </Hint>
      </Section>

      <Section id="settings" title="系统设置详解" icon={Settings}>
        <p className="text-sm text-slate-300 mb-3">设置页共 7 个 Tab，每个都影响创作行为的某个方面。</p>

        <div id="settings-skill">
          <H3>写作技能 & 评审维度</H3>
          <p className="text-sm text-slate-300 mb-2">
            <strong className="text-slate-200">写作技能</strong>会注入到作家 Prompt 中，作为创作规范。系统预设三套：
          </p>
          <div className="flex flex-wrap gap-1.5 mb-2">
            <Tag variant="primary">8 维精简版</Tag>
            <Tag variant="primary">15 维标准版</Tag>
            <Tag variant="primary">33 维完整版</Tag>
          </div>
          <p className="text-sm text-slate-300 mb-2">
            <strong className="text-slate-200">评审维度</strong>用于编辑审稿。编辑会逐一检查每个维度是否达标，给出「通过/不通过」结论。维度越多，审稿越严格。
          </p>
          <Hint>
            💡 可直接编辑 skill 文本和维度列表。切换预设时，系统会自动保存当前编辑内容到对应槽位，三套数据互不干扰。
          </Hint>
        </div>

        <div id="settings-chapter">
          <H3>章节字数配置</H3>
          <p className="text-sm text-slate-300 mb-2">控制每章的目标字数和容忍区间：</p>
          <ul className="text-sm text-slate-300 space-y-1 list-disc pl-5">
            <li><code className="bg-slate-700/40 px-1 py-0.5 rounded text-xs">targetWords</code>：目标字数（默认 2000）</li>
            <li><code className="bg-slate-700/40 px-1 py-0.5 rounded text-xs">minWords / maxWords</code>：常规容忍区间（1800-2200）</li>
            <li><code className="bg-slate-700/40 px-1 py-0.5 rounded text-xs">absoluteMin / absoluteMax</code>：绝对硬边界（1600-2500）</li>
          </ul>
          <p className="text-sm text-slate-300 mt-2">同时影响：Prompt 字数变量、Fitness 字数得分、导入切分策略。</p>
        </div>

        <div id="settings-models">
          <H3>模型配置</H3>
          <p className="text-sm text-slate-300 mb-2">决定每个 Agent 用什么模型、什么温度生成内容。</p>

          <div className="text-sm text-slate-300 mb-2">
            <strong className="text-slate-200">Provider 配置</strong> — 系统支持 5 种 Provider：
          </div>
          <div className="overflow-x-auto mb-3">
            <table className="w-full text-sm border border-slate-700/40 rounded-lg overflow-hidden">
              <thead className="bg-slate-900/60 text-slate-400">
                <tr><th className="text-left px-3 py-1.5">Provider</th><th className="text-left px-3 py-1.5">类型</th><th className="text-left px-3 py-1.5">说明</th></tr>
              </thead>
              <tbody className="divide-y divide-slate-700/30 text-slate-300">
                <tr className="bg-slate-900/20"><td className="px-3 py-1.5">任意名称</td><td className="px-3 py-1.5">OpenAI 兼容 API</td><td className="px-3 py-1.5">所有模型均通过 OpenAI 兼容协议调用，配置 baseURL 和 API Key 即可</td></tr>
              </tbody>
            </table>
          </div>

          <p className="text-sm text-slate-300 mb-2">
            <strong className="text-slate-200">作者轮换模型 ⭐</strong> — 启用后按章节号循环切换 writer 模型：
          </p>
          <ul className="text-sm text-slate-300 space-y-1 list-disc pl-5 mb-3">
            <li>第 1 章 → 列表第 1 个模型</li>
            <li>第 2 章 → 列表第 2 个模型</li>
            <li>第 N 章 → <code className="bg-slate-700/40 px-1 py-0.5 rounded text-xs">(N-1) % 模型数量</code></li>
          </ul>
          <p className="text-sm text-slate-300 mb-2">轮换只影响 <strong className="text-slate-200">writer（作者）</strong>角色。需在「设置-模型配置」中手动添加轮换模型。</p>

          <p className="text-sm text-slate-300 mb-2">
            <strong className="text-slate-200">角色默认模型与温度</strong> — 19 个角色可独立配置：
          </p>
          <div className="overflow-x-auto mb-3">
            <table className="w-full text-sm border border-slate-700/40 rounded-lg overflow-hidden">
              <thead className="bg-slate-900/60 text-slate-400">
                <tr><th className="text-left px-3 py-1.5">角色</th><th className="text-left px-3 py-1.5">用途</th><th className="text-left px-3 py-1.5">建议温度</th></tr>
              </thead>
              <tbody className="divide-y divide-slate-700/30 text-slate-300">
                <tr className="bg-slate-900/20"><td className="px-3 py-1.5">作者（初稿）</td><td className="px-3 py-1.5">writer 写初稿</td><td className="px-3 py-1.5">0.8~0.9</td></tr>
                <tr className="bg-slate-900/10"><td className="px-3 py-1.5">编辑（改稿）</td><td className="px-3 py-1.5">editor 审阅修改</td><td className="px-3 py-1.5">0.8~0.9</td></tr>
                <tr className="bg-slate-900/20"><td className="px-3 py-1.5">去AI化</td><td className="px-3 py-1.5">humanizer 风格化</td><td className="px-3 py-1.5">0.8~0.9</td></tr>
                <tr className="bg-slate-900/10"><td className="px-3 py-1.5">校编</td><td className="px-3 py-1.5">proofreader 校对</td><td className="px-3 py-1.5">0.2</td></tr>
                <tr className="bg-slate-900/20"><td className="px-3 py-1.5">润色</td><td className="px-3 py-1.5">polish 润色</td><td className="px-3 py-1.5">0.8</td></tr>
                <tr className="bg-slate-900/10"><td className="px-3 py-1.5">读者反馈</td><td className="px-3 py-1.5">reader 评分</td><td className="px-3 py-1.5">0</td></tr>
                <tr className="bg-slate-900/20"><td className="px-3 py-1.5">摘要生成</td><td className="px-3 py-1.5">summarizer 摘要</td><td className="px-3 py-1.5">0</td></tr>
                <tr className="bg-slate-900/10"><td className="px-3 py-1.5">大纲生成</td><td className="px-3 py-1.5">outline 大纲</td><td className="px-3 py-1.5">0.2</td></tr>
                <tr className="bg-slate-900/20"><td className="px-3 py-1.5">偏离检测</td><td className="px-3 py-1.5">deviationCheck</td><td className="px-3 py-1.5">0</td></tr>
                <tr className="bg-slate-900/10"><td className="px-3 py-1.5">风格修正</td><td className="px-3 py-1.5">styleCorrect</td><td className="px-3 py-1.5">0.3</td></tr>
                <tr className="bg-slate-900/20"><td className="px-3 py-1.5">重复修复</td><td className="px-3 py-1.5">repetitionRepair</td><td className="px-3 py-1.5">0.2</td></tr>
                <tr className="bg-slate-900/10"><td className="px-3 py-1.5">Fitness评估</td><td className="px-3 py-1.5">fitnessEvaluate</td><td className="px-3 py-1.5">0</td></tr>
              </tbody>
            </table>
          </div>
          <Hint>
            💡 <strong className="text-slate-200">温度最佳实践</strong>：创作类角色（作者、编辑、润色）建议 0.8~0.9，更有创意；审核/评审/结构类建议 0~0.3，降低幻觉、提高稳定性。点击「应用最佳实践温度」一键套用。
          </Hint>
        </div>
      </Section>

      <Section id="world" title="创作辅助：世界观、人物、剧情线、地图" icon={Layers}>
        <p className="text-sm text-slate-300 mb-3">
          在「我的作品」中选择作品，进入详情页，切换到「创作辅助」Tab：
        </p>
        <ul className="text-sm text-slate-300 space-y-1.5 list-disc pl-5">
          <li><strong className="text-slate-200">世界观记忆库</strong>：记录力量体系、势力分布、历史背景、特殊规则。支持分类、标签、重要性标记。</li>
          <li><strong className="text-slate-200">人物设定</strong>：创建角色卡片（姓名、外貌、性格、目标、背景）。支持人物关系图谱。</li>
          <li><strong className="text-slate-200">剧情线图谱</strong>：为每条剧情线创建时间轴节点，标注每章关键事件。支持颜色标记。</li>
          <li><strong className="text-slate-200">地图图谱</strong>：构建世界地图（区域划分、层级关系、连接路线、旅行时间）。</li>
        </ul>
        <Hint>
          💡 创作辅助数据<strong className="text-slate-200">自动注入</strong>到所有 outline 和 writing Prompt 中。数据越多，AI 对作品世界的理解越深入。
        </Hint>
      </Section>

      <Section id="templates" title="套路模板库" icon={Sparkles}>
        <p className="text-sm text-slate-300 mb-2">系统内置 5 种经典网文套路：退婚流、系统流、种田流、凡人流、签到流。每种包含：</p>
        <ul className="text-sm text-slate-300 space-y-1 list-disc pl-5">
          <li><strong className="text-slate-200">节拍结构</strong>：从开局到完结的阶段性目标，每阶段预计章节数</li>
          <li><strong className="text-slate-200">代表作</strong>：参考作品，帮助理解套路特征</li>
          <li><strong className="text-slate-200">标签</strong>：方便检索和分类</li>
        </ul>
        <p className="text-sm text-slate-300 mt-2">
          可在「套路模板库」页面创建自定义模板，或在作品详情页将模板关联到具体作品。关联后内容自动注入写作 Prompt。
        </p>
      </Section>

      <Section id="tools" title="工具页面" icon={Wrench}>
        <H3>Agent 聊天</H3>
        <p className="text-sm text-slate-300 mb-2">轻量化 AI 对话页面，支持：</p>
        <ul className="text-sm text-slate-300 space-y-1 list-disc pl-5 mb-3">
          <li>选择任意 Provider 和模型</li>
          <li>加载任意 Prompt 模板作为系统提示</li>
          <li>多轮对话，SSE 流式输出</li>
          <li>温度调节（0~2）</li>
        </ul>
        <p className="text-sm text-slate-300">适合快速测试 Prompt、调试模型输出。对话内容<strong className="text-slate-200">不保存</strong>，刷新即丢失。</p>

        <H3>Prompt 自动进化</H3>
        <p className="text-sm text-slate-300">
          基于历史 Fitness 数据，自动诊断 Prompt 缺陷并生成改进变体。系统会分析低分章节的共同问题，生成多个改进版本，用历史数据预测 Fitness 提升幅度，并推荐是否应用。
        </p>
      </Section>

      <Section id="verify" title="如何验证功能是否生效" icon={Target}>
        <H3>验证写作技能</H3>
        <ol className="text-sm text-slate-300 space-y-1 list-decimal pl-5">
          <li>进入「设置 → 技能」，在 skill 开头加一句明显的话，如 <code className="bg-slate-700/40 px-1 py-0.5 rounded text-xs">【测试标记】这是自定义技能</code></li>
          <li>保存 → 写一章 → 查看 <code className="bg-slate-700/40 px-1 py-0.5 rounded text-xs">works/&lt;workId&gt;/chapter_X_prompt.txt</code>，搜索「测试标记」</li>
        </ol>

        <H3>验证评审维度</H3>
        <ol className="text-sm text-slate-300 space-y-1 list-decimal pl-5">
          <li>切换评审预设（8/15/33 维）→ 写一章</li>
          <li>查看 <code className="bg-slate-700/40 px-1 py-0.5 rounded text-xs">chapter_X_edit_prompt.txt</code>，确认维度数量与预设一致</li>
        </ol>

        <H3>验证模型轮换</H3>
        <ol className="text-sm text-slate-300 space-y-1 list-decimal pl-5">
          <li>「设置 → 模型配置」→ 启用轮换 → 配置至少 2 个不同模型 → 保存</li>
          <li>连续写两章 → 观察前端步骤进度条中的模型名是否不同</li>
          <li>或查数据库：<code className="bg-slate-700/40 px-1 py-0.5 rounded text-xs">SELECT number, models FROM chapters WHERE workId = '...'</code></li>
        </ol>

        <H3>验证创作辅助注入</H3>
        <ol className="text-sm text-slate-300 space-y-1 list-decimal pl-5">
          <li>在「我的作品 → 创作辅助」中添加世界观设定和人物</li>
          <li>续写下一章 → 查看 <code className="bg-slate-700/40 px-1 py-0.5 rounded text-xs">chapter_X_prompt.txt</code></li>
          <li>确认 Prompt 末尾包含「世界观上下文」区块</li>
        </ol>
      </Section>

      <Section id="quality" title="附录：什么样的小说才是好小说？" icon={BookOpen}>
        <p className="text-sm text-slate-300 mb-3">六维视角的解读，供创作时参考：</p>

        <div className="space-y-3 text-sm text-slate-300">
          <div>
            <strong className="text-slate-200">📐 编辑视角</strong>：结构、节奏与市场。黄金三章、人物行动驱动情节、节奏如心电图、伏笔闭环、符合平台调性。
          </div>
          <div>
            <strong className="text-slate-200">✍️ 作者视角</strong>：表达、共情与生命力。真诚比技巧重要、独特的声音、让角色自己活下去、细节即真实、写你想读的书。
          </div>
          <div>
            <strong className="text-slate-200">📖 读者视角</strong>：沉浸、爽感与陪伴。沉浸感第一、主角值得被喜欢、情绪价值到位、期待感是追更动力、成为精神陪伴。
          </div>
          <div>
            <strong className="text-slate-200">📊 平台算法视角</strong>：数据、留存与分发。完读率第一、追更率决定天花板、标签匹配、互动数据放大、适配滑动习惯。
          </div>
          <div>
            <strong className="text-slate-200">📚 出版人视角</strong>：IP 价值与全版权运营。世界观可延展、角色符号化、情感母题普适、视觉化场景丰富、长生命周期。
          </div>
          <div>
            <strong className="text-slate-200">🎬 编剧视角</strong>：冲突、视觉与改编友好度。每章强冲突、场景集中、高光可截图、情绪曲线清晰、金句与名场面。
          </div>
        </div>

        <div className="border-l-4 border-sky-500 pl-4 my-4 text-slate-400 italic text-sm">
          好小说 = 扎实的情节 × 真诚的情感 × 难忘的陪伴感 × 算法友好 × 改编潜力 × 长尾价值
        </div>
      </Section>
    </div>
  );
}
