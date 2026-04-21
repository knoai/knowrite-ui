import { useEffect } from 'react';
import { BookOpen, Library, Wrench, Sparkles, Layers, MessageCircle, Settings, HelpCircle, ChevronRight, Bot, Target, Zap, Rocket, Factory, Palette } from 'lucide-react';
import { useI18n } from '../contexts/I18nContext';

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
  const { t } = useI18n();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="max-w-3xl mx-auto pb-10">
      <div className="text-center mb-6">
        <h1 className="text-2xl font-bold text-slate-50 mb-1">{t('knowrite_')}</h1>
        <p className="text-sm text-slate-500">使用指南 · 从入门到精通</p>
      </div>

      <Toc />

      <Section id="overview" title={t("t_gala6i")} icon={Rocket}>
        <p className="text-sm text-slate-300 mb-3">
          这是一个基于多 Agent 协作的 AI 小说创作系统。核心思路是<strong className="text-slate-100">{t('_agent_')}</strong>，把创作流程拆解为专业分工：
        </p>
        <ul className="text-sm text-slate-300 space-y-1.5 list-disc pl-5">
          <li><strong className="text-slate-200">{t('_planner')}</strong>{t('t_kylsm0')}</li>
          <li><strong className="text-slate-200">{t('_writer')}</strong>{t('t_2qaeppj')}</li>
          <li><strong className="text-slate-200">{t('_editor')}</strong>{t('t_1qxgozy')}</li>
          <li><strong className="text-slate-200">{t('ai_humanizer')}</strong>{t('_ai__')}</li>
          <li><strong className="text-slate-200">{t('_proofreader')}</strong>：修正语病、错别字、标点</li>
          <li><strong className="text-slate-200">{t('_reader')}</strong>{t('t_t60g39')}</li>
          <li><strong className="text-slate-200">{t('_summarizer')}</strong>{t('t_yallss')}</li>
        </ul>
        <Hint>
          💡 你可以在「设置 → 模型配置」中为每个角色独立配置模型和温度，甚至让多个作者模型<strong className="text-slate-200">{t('t_ii7p93')}</strong>，实现风格交替。
        </Hint>
      </Section>

      <Section id="quickstart" title={t("_3")} icon={Zap}>
        <H3>{t('step_1_')}</H3>
        <p className="text-sm text-slate-300">
          在「开始创作」页面输入小说主题。没有灵感？点击下方的灵感标签（退婚逆袭、系统觉醒、重生复仇等）快速填充。
        </p>

        <H3>{t('step_2_')}</H3>
        <ul className="text-sm text-slate-300 space-y-1.5 list-disc pl-5">
          <li><strong className="text-slate-200">{t('t_ayt2gf')}</strong>{t('_____10_')}</li>
          <li><strong className="text-slate-200">{t('t_ajtvdj')}</strong>{t('____80_')}</li>
          <li><strong className="text-slate-200">{t('t_f6oja7')}</strong>{t('_1_2__5_15_')}</li>
          <li><strong className="text-slate-200">{t('t_amv5u9')}</strong>{t('___')}</li>
        </ul>

        <H3>{t('step_3_')}</H3>
        <p className="text-sm text-slate-300">
          点击「开始创作」，系统自动完成：大纲生成 → 卷规划 → 章节写作 → 多轮审修 → 读者反馈 → 摘要生成。页面上会实时显示每一步的进度和使用的模型。
        </p>
        <Hint>
          💡 创作完成后，进入「我的作品」可查看详情、续写下一章、管理创作辅助数据，或导出完整小说文本。
        </Hint>
      </Section>

      <Section id="modes" title={t("_vs_")} icon={Target}>
        <div className="overflow-x-auto">
          <table className="w-full text-sm border border-slate-700/40 rounded-lg overflow-hidden">
            <thead className="bg-slate-900/60 text-slate-400">
              <tr>
                <th className="text-left px-3 py-2 font-medium">{t('t_m436')}</th>
                <th className="text-left px-3 py-2 font-medium">{t('t_e5861')}</th>
                <th className="text-left px-3 py-2 font-medium">{t('t_jlt0n')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700/30 text-slate-300">
              <tr className="bg-slate-900/20"><td className="px-3 py-2">{t('t_ap3ho6')}</td><td className="px-3 py-2">{t('8')}</td><td className="px-3 py-2">2条底线</td></tr>
              <tr className="bg-slate-900/10"><td className="px-3 py-2">{t('t_brz7s4')}</td><td className="px-3 py-2">严格依据，禁止偏离</td><td className="px-3 py-2">参考即可，允许偏离</td></tr>
              <tr className="bg-slate-900/20"><td className="px-3 py-2">{t('t_by2wbs')}</td><td className="px-3 py-2">严格（目标 ± 区间）</td><td className="px-3 py-2">{t('__x_')}</td></tr>
              <tr className="bg-slate-900/10"><td className="px-3 py-2">{t('t_gmrqd9')}</td><td className="px-3 py-2">{t('_3_')}</td><td className="px-3 py-2">{t('_1_')}</td></tr>
              <tr className="bg-slate-900/20"><td className="px-3 py-2">{t('t_ieqd')}</td><td className="px-3 py-2">{t('t_ieqd')}</td><td className="px-3 py-2">{t('t_oxaj')}</td></tr>
              <tr className="bg-slate-900/10"><td className="px-3 py-2">{t('ai')}</td><td className="px-3 py-2">{t('t_pbi1')}</td><td className="px-3 py-2">{t('t_oxaj')}</td></tr>
              <tr className="bg-slate-900/20"><td className="px-3 py-2">{t('fitness_')}</td><td className="px-3 py-2">0.15</td><td className="px-3 py-2">0.05</td></tr>
              <tr className="bg-slate-900/10"><td className="px-3 py-2">{t('t_iimc6z')}</td><td className="px-3 py-2">量产网文、稳定质量</td><td className="px-3 py-2">{t('t_ebc3')}</td></tr>
            </tbody>
          </table>
        </div>
        <Hint>
          💡 在「设置 → 写作风格」可设系统默认模式。创建作品时也可单独覆盖。
        </Hint>
      </Section>

      <Section id="settings" title={t("t_yt5d3j")} icon={Settings}>
        <p className="text-sm text-slate-300 mb-3">{t('_7__tab_')}</p>

        <div id="settings-skill">
          <H3>{t('t_amm274')}</H3>
          <p className="text-sm text-slate-300 mb-2">
            <strong className="text-slate-200">{t('t_amm274')}</strong>会注入到作家 Prompt 中，作为创作规范。系统预设三套：
          </p>
          <div className="flex flex-wrap gap-1.5 mb-2">
            <Tag variant="primary">{t('8_')}</Tag>
            <Tag variant="primary">{t('15_')}</Tag>
            <Tag variant="primary">{t('33_')}</Tag>
          </div>
          <p className="text-sm text-slate-300 mb-2">
            <strong className="text-slate-200">{t('t_i0noen')}</strong>用于编辑审稿。编辑会逐一检查每个维度是否达标，给出「通过/不通过」结论。维度越多，审稿越严格。
          </p>
          <Hint>
            💡 可直接编辑 skill 文本和维度列表。切换预设时，系统会自动保存当前编辑内容到对应槽位，三套数据互不干扰。
          </Hint>
        </div>

        <div id="settings-chapter">
          <H3>{t('t_24cv8c')}</H3>
          <p className="text-sm text-slate-300 mb-2">{t('t_8ioa2')}</p>
          <ul className="text-sm text-slate-300 space-y-1 list-disc pl-5">
            <li><code className="bg-slate-700/40 px-1 py-0.5 rounded text-xs">targetWords</code>{t('__2000')}</li>
            <li><code className="bg-slate-700/40 px-1 py-0.5 rounded text-xs">minWords / maxWords</code>{t('_1800_2200')}</li>
            <li><code className="bg-slate-700/40 px-1 py-0.5 rounded text-xs">absoluteMin / absoluteMax</code>{t('_1600_2500')}</li>
          </ul>
          <p className="text-sm text-slate-300 mt-2">{t('_prompt__fitness__')}</p>
        </div>

        <div id="settings-models">
          <H3>{t('t_drf3kb')}</H3>
          <p className="text-sm text-slate-300 mb-2">{t('_agent__')}</p>

          <div className="text-sm text-slate-300 mb-2">
            <strong className="text-slate-200">{t('provider_')}</strong> — 系统支持 5 种 Provider：
          </div>
          <div className="overflow-x-auto mb-3">
            <table className="w-full text-sm border border-slate-700/40 rounded-lg overflow-hidden">
              <thead className="bg-slate-900/60 text-slate-400">
                <tr><th className="text-left px-3 py-1.5">Provider</th><th className="text-left px-3 py-1.5">{t('t_lnjk')}</th><th className="text-left px-3 py-1.5">{t('t_od5m')}</th></tr>
              </thead>
              <tbody className="divide-y divide-slate-700/30 text-slate-300">
                <tr className="bg-slate-900/20"><td className="px-3 py-1.5">{t('t_ad92wn')}</td><td className="px-3 py-1.5">{t('openai__api')}</td><td className="px-3 py-1.5">{t('_openai___baseurl__api_key_')}</td></tr>
              </tbody>
            </table>
          </div>

          <p className="text-sm text-slate-300 mb-2">
            <strong className="text-slate-200">{t('t_ij62')}</strong> — 启用后按章节号循环切换 writer 模型：
          </p>
          <ul className="text-sm text-slate-300 space-y-1 list-disc pl-5 mb-3">
            <li>{t('_1____1_')}</li>
            <li>{t('_2____2_')}</li>
            <li>{t('_n__')}<code className="bg-slate-700/40 px-1 py-0.5 rounded text-xs">{t('n_1__')}</code></li>
          </ul>
          <p className="text-sm text-slate-300 mb-2">{t('t_5g5pyq')}<strong className="text-slate-200">{t('writer_')}</strong>{t('t_drf3kb')}</p>

          <p className="text-sm text-slate-300 mb-2">
            <strong className="text-slate-200">{t('t_282azm3')}</strong> — 19 个角色可独立配置：
          </p>
          <div className="overflow-x-auto mb-3">
            <table className="w-full text-sm border border-slate-700/40 rounded-lg overflow-hidden">
              <thead className="bg-slate-900/60 text-slate-400">
                <tr><th className="text-left px-3 py-1.5">{t('t_o5pc')}</th><th className="text-left px-3 py-1.5">{t('t_kpv0')}</th><th className="text-left px-3 py-1.5">{t('t_ck8vbl')}</th></tr>
              </thead>
              <tbody className="divide-y divide-slate-700/30 text-slate-300">
                <tr className="bg-slate-900/20"><td className="px-3 py-1.5">{t('t_e78p')}</td><td className="px-3 py-1.5">writer 写初稿</td><td className="px-3 py-1.5">0.8~0.9</td></tr>
                <tr className="bg-slate-900/10"><td className="px-3 py-1.5">{t('t_mekb')}</td><td className="px-3 py-1.5">{t('editor_')}</td><td className="px-3 py-1.5">0.8~0.9</td></tr>
                <tr className="bg-slate-900/20"><td className="px-3 py-1.5">{t('ai')}</td><td className="px-3 py-1.5">{t('humanizer_')}</td><td className="px-3 py-1.5">0.8~0.9</td></tr>
                <tr className="bg-slate-900/10"><td className="px-3 py-1.5">{t('t_ieqd')}</td><td className="px-3 py-1.5">{t('proofreader_')}</td><td className="px-3 py-1.5">0.2</td></tr>
                <tr className="bg-slate-900/20"><td className="px-3 py-1.5">{t('t_jd70')}</td><td className="px-3 py-1.5">{t('polish_')}</td><td className="px-3 py-1.5">0.8</td></tr>
                <tr className="bg-slate-900/10"><td className="px-3 py-1.5">{t('t_i6ro05')}</td><td className="px-3 py-1.5">{t('reader_')}</td><td className="px-3 py-1.5">0</td></tr>
                <tr className="bg-slate-900/20"><td className="px-3 py-1.5">{t('t_d8bxkq')}</td><td className="px-3 py-1.5">{t('summarizer_')}</td><td className="px-3 py-1.5">0</td></tr>
                <tr className="bg-slate-900/10"><td className="px-3 py-1.5">{t('t_brxke4')}</td><td className="px-3 py-1.5">{t('outline_')}</td><td className="px-3 py-1.5">0.2</td></tr>
                <tr className="bg-slate-900/20"><td className="px-3 py-1.5">{t('t_amzq3b')}</td><td className="px-3 py-1.5">deviationCheck</td><td className="px-3 py-1.5">0</td></tr>
                <tr className="bg-slate-900/10"><td className="px-3 py-1.5">{t('t_jphm1v')}</td><td className="px-3 py-1.5">styleCorrect</td><td className="px-3 py-1.5">0.3</td></tr>
                <tr className="bg-slate-900/20"><td className="px-3 py-1.5">{t('t_irgkov')}</td><td className="px-3 py-1.5">repetitionRepair</td><td className="px-3 py-1.5">0.2</td></tr>
                <tr className="bg-slate-900/10"><td className="px-3 py-1.5">{t('fitness')}</td><td className="px-3 py-1.5">fitnessEvaluate</td><td className="px-3 py-1.5">0</td></tr>
              </tbody>
            </table>
          </div>
          <Hint>
            💡 <strong className="text-slate-200">{t('t_185rztl')}</strong>：创作类角色（作者、编辑、润色）建议 0.8~0.9，更有创意；审核/评审/结构类建议 0~0.3，降低幻觉、提高稳定性。点击「应用最佳实践温度」一键套用。
          </Hint>
        </div>
      </Section>

      <Section id="world" title={t("____")} icon={Layers}>
        <p className="text-sm text-slate-300 mb-3">
          在「我的作品」中选择作品，进入详情页，切换到「创作辅助」Tab：
        </p>
        <ul className="text-sm text-slate-300 space-y-1.5 list-disc pl-5">
          <li><strong className="text-slate-200">{t('t_1w131v5')}</strong>{t('______')}</li>
          <li><strong className="text-slate-200">{t('t_aewdl7')}</strong>{t('t_aemn87')}</li>
          <li><strong className="text-slate-200">{t('t_k8aaks')}</strong>{t('t_cjnsx')}</li>
          <li><strong className="text-slate-200">{t('t_bd2535')}</strong>{t('t_ejfs')}</li>
        </ul>
        <Hint>
          💡 创作辅助数据<strong className="text-slate-200">{t('t_gqiv3v')}</strong>到所有 outline 和 writing Prompt 中。数据越多，AI 对作品世界的理解越深入。
        </Hint>
      </Section>

      <Section id="templates" title={t("t_cicrx9")} icon={Sparkles}>
        <p className="text-sm text-slate-300 mb-2">{t('_5_______')}</p>
        <ul className="text-sm text-slate-300 space-y-1 list-disc pl-5">
          <li><strong className="text-slate-200">{t('t_gvo7vg')}</strong>{t('t_oteo4v')}</li>
          <li><strong className="text-slate-200">{t('t_c7lsn')}</strong>{t('t_fz3s')}</li>
          <li><strong className="text-slate-200">{t('t_idef')}</strong>{t('t_1xqxnj3')}</li>
        </ul>
        <p className="text-sm text-slate-300 mt-2">
          可在「套路模板库」页面创建自定义模板，或在作品详情页将模板关联到具体作品。关联后内容自动注入写作 Prompt。
        </p>
      </Section>

      <Section id="tools" title={t("t_c70jen")} icon={Wrench}>
        <H3>Agent 聊天</H3>
        <p className="text-sm text-slate-300 mb-2">轻量化 AI 对话页面，支持：</p>
        <ul className="text-sm text-slate-300 space-y-1 list-disc pl-5 mb-3">
          <li>{t('_provider_')}</li>
          <li>{t('_prompt_')}</li>
          <li>{t('_sse_')}</li>
          <li>{t('_02')}</li>
        </ul>
        <p className="text-sm text-slate-300">{t('_prompt__')}<strong className="text-slate-200">{t('t_btn8o')}</strong>{t('t_299baaj')}</p>

        <H3>{t('prompt_')}</H3>
        <p className="text-sm text-slate-300">
          基于历史 Fitness 数据，自动诊断 Prompt 缺陷并生成改进变体。系统会分析低分章节的共同问题，生成多个改进版本，用历史数据预测 Fitness 提升幅度，并推荐是否应用。
        </p>
      </Section>

      <Section id="verify" title={t("t_pp1nqe")} icon={Target}>
        <H3>{t('t_147drdh')}</H3>
        <ol className="text-sm text-slate-300 space-y-1 list-decimal pl-5">
          <li>{t('____skill__')}<code className="bg-slate-700/40 px-1 py-0.5 rounded text-xs">{t('t_jh1ll')}</code></li>
          <li>{t('t_e32z')}<code className="bg-slate-700/40 px-1 py-0.5 rounded text-xs">works/&lt;workId&gt;/chapter_X_prompt.txt</code>{t('t_1p37ls0')}</li>
        </ol>

        <H3>{t('t_1blfdl0')}</H3>
        <ol className="text-sm text-slate-300 space-y-1 list-decimal pl-5">
          <li>{t('_8_15_33___')}</li>
          <li>{t('t_ibpi')}<code className="bg-slate-700/40 px-1 py-0.5 rounded text-xs">chapter_X_edit_prompt.txt</code>{t('t_j8bpxl')}</li>
        </ol>

        <H3>{t('t_17c6bqr')}</H3>
        <ol className="text-sm text-slate-300 space-y-1 list-decimal pl-5">
          <li>{t('______2___')}</li>
          <li>{t('t_ij62')}</li>
          <li>{t('t_k0nfxw')}<code className="bg-slate-700/40 px-1 py-0.5 rounded text-xs">SELECT number, models FROM chapters WHERE workId = '...'</code></li>
        </ol>

        <H3>{t('t_1rb2frr')}</H3>
        <ol className="text-sm text-slate-300 space-y-1 list-decimal pl-5">
          <li>{t('t_ap4h0l')}</li>
          <li>{t('t_9oi3xb')}<code className="bg-slate-700/40 px-1 py-0.5 rounded text-xs">chapter_X_prompt.txt</code></li>
          <li>{t('t_btbvq')}</li>
        </ol>
      </Section>

      <Section id="quality" title="附录：什么样的小说才是好小说？" icon={BookOpen}>
        <p className="text-sm text-slate-300 mb-3">六维视角的解读，供创作时参考：</p>

        <div className="space-y-3 text-sm text-slate-300">
          <div>
            <strong className="text-slate-200">{t('t_mekb')}</strong>：结构、节奏与市场。黄金三章、人物行动驱动情节、节奏如心电图、伏笔闭环、符合平台调性。
          </div>
          <div>
            <strong className="text-slate-200">{t('t_e78p')}</strong>：表达、共情与生命力。真诚比技巧重要、独特的声音、让角色自己活下去、细节即真实、写你想读的书。
          </div>
          <div>
            <strong className="text-slate-200">📖 读者视角</strong>：沉浸、爽感与陪伴。沉浸感第一、主角值得被喜欢、情绪价值到位、期待感是追更动力、成为精神陪伴。
          </div>
          <div>
            <strong className="text-slate-200">{t('t_gixp')}</strong>：数据、留存与分发。完读率第一、追更率决定天花板、标签匹配、互动数据放大、适配滑动习惯。
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
