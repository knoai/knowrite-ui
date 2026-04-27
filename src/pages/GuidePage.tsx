// @ts-nocheck
import { useEffect } from 'react';
import { useI18n } from '../contexts/I18nContext';
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
  const { t } = useI18n();
  const items = [
    { href: '#overview', label: t('toc_overview') },
    { href: '#quickstart', label: t('toc_quickstart') },
    { href: '#modes', label: t('toc_modes') },
    { href: '#settings', label: t('toc_settings'), children: [
      { href: '#settings-skill', label: t('toc_settings_skill') },
      { href: '#settings-chapter', label: t('toc_settings_chapter') },
      { href: '#settings-models', label: t('toc_settings_models') },
    ]},
    { href: '#world', label: t('toc_world') },
    { href: '#templates', label: t('toc_templates') },
    { href: '#tools', label: t('toc_tools') },
    { href: '#verify', label: t('toc_verify') },
    { href: '#quality', label: t('toc_quality') },
  ];

  return (
    <div className="bg-slate-800/60 border border-slate-700/60 rounded-xl p-5 mb-4">
      <h3 className="text-sm font-semibold text-sky-400 mb-3 flex items-center gap-2">
        <BookOpen size={16} /> {t('toc_title')}
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
        <h1 className="text-2xl font-bold text-slate-50 mb-1">{t('guide_title')}</h1>
        <p className="text-sm text-slate-500">{t('guide_subtitle')}</p>
      </div>

      <Toc />

      <Section id="overview" title={t('section_overview_title')} icon={Rocket}>
        <p className="text-sm text-slate-300 mb-3">
          {t('guide_overview_p1_prefix')}<strong className="text-slate-100">{t('guide_overview_highlight')}</strong>{t('guide_overview_p1_suffix')}
        </p>
        <ul className="text-sm text-slate-300 space-y-1.5 list-disc pl-5">
          <li><strong className="text-slate-200">{t('role_planner')}</strong>{t('role_planner_desc')}</li>
          <li><strong className="text-slate-200">{t('role_writer')}</strong>{t('role_writer_desc')}</li>
          <li><strong className="text-slate-200">{t('role_editor')}</strong>{t('role_editor_desc')}</li>
          <li><strong className="text-slate-200">{t('role_humanizer')}</strong>{t('role_humanizer_desc')}</li>
          <li><strong className="text-slate-200">{t('role_proofreader')}</strong>{t('role_proofreader_desc')}</li>
          <li><strong className="text-slate-200">{t('role_reader')}</strong>{t('role_reader_desc')}</li>
          <li><strong className="text-slate-200">{t('role_summarizer')}</strong>{t('role_summarizer_desc')}</li>
        </ul>
        <Hint>
          {t('hint_overview_prefix')}<strong className="text-slate-200">{t('hint_overview_highlight')}</strong>{t('hint_overview_suffix')}
        </Hint>
      </Section>

      <Section id="quickstart" title={t('section_quickstart_title')} icon={Zap}>
        <H3>{t('step1_title')}</H3>
        <p className="text-sm text-slate-300">
          {t('step1_desc')}
        </p>

        <H3>{t('step2_title')}</H3>
        <ul className="text-sm text-slate-300 space-y-1.5 list-disc pl-5">
          <li><strong className="text-slate-200">{t('step2_platform')}</strong>{t('step2_platform_desc')}</li>
          <li><strong className="text-slate-200">{t('step2_author_style')}</strong>{t('step2_author_style_desc')}</li>
          <li><strong className="text-slate-200">{t('step2_mode')}</strong>{t('step2_mode_desc')}</li>
          <li><strong className="text-slate-200">{t('step2_writing_style')}</strong>{t('step2_writing_style_desc')}</li>
        </ul>

        <H3>{t('step3_title')}</H3>
        <p className="text-sm text-slate-300">
          {t('step3_desc')}
        </p>
        <Hint>
          {t('hint_quickstart')}
        </Hint>
      </Section>

      <Section id="modes" title={t('section_modes_title')} icon={Target}>
        <div className="overflow-x-auto">
          <table className="w-full text-sm border border-slate-700/40 rounded-lg overflow-hidden">
            <thead className="bg-slate-900/60 text-slate-400">
              <tr>
                <th className="text-left px-3 py-2 font-medium">{t('table_header_dimension')}</th>
                <th className="text-left px-3 py-2 font-medium">{t('table_header_industrial')}</th>
                <th className="text-left px-3 py-2 font-medium">{t('table_header_free')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700/30 text-slate-300">
              <tr className="bg-slate-900/20"><td className="px-3 py-2">{t('dimension_creation_rules')}</td><td className="px-3 py-2">{t('industrial_creation_rules')}</td><td className="px-3 py-2">{t('free_creation_rules')}</td></tr>
              <tr className="bg-slate-900/10"><td className="px-3 py-2">{t('dimension_outline_constraints')}</td><td className="px-3 py-2">{t('industrial_outline_constraints')}</td><td className="px-3 py-2">{t('free_outline_constraints')}</td></tr>
              <tr className="bg-slate-900/20"><td className="px-3 py-2">{t('dimension_word_count')}</td><td className="px-3 py-2">{t('industrial_word_count')}</td><td className="px-3 py-2">{t('free_word_count')}</td></tr>
              <tr className="bg-slate-900/10"><td className="px-3 py-2">{t('dimension_editing_rounds')}</td><td className="px-3 py-2">{t('industrial_editing_rounds')}</td><td className="px-3 py-2">{t('free_editing_rounds')}</td></tr>
              <tr className="bg-slate-900/20"><td className="px-3 py-2">{t('dimension_proofreading')}</td><td className="px-3 py-2">{t('industrial_proofreading')}</td><td className="px-3 py-2">{t('free_proofreading')}</td></tr>
              <tr className="bg-slate-900/10"><td className="px-3 py-2">{t('dimension_deai')}</td><td className="px-3 py-2">{t('industrial_deai')}</td><td className="px-3 py-2">{t('free_deai')}</td></tr>
              <tr className="bg-slate-900/20"><td className="px-3 py-2">{t('dimension_fitness_weight')}</td><td className="px-3 py-2">0.15</td><td className="px-3 py-2">0.05</td></tr>
              <tr className="bg-slate-900/10"><td className="px-3 py-2">{t('dimension_suitable_scenarios')}</td><td className="px-3 py-2">{t('industrial_suitable_scenarios')}</td><td className="px-3 py-2">{t('free_suitable_scenarios')}</td></tr>
            </tbody>
          </table>
        </div>
        <Hint>
          {t('hint_modes')}
        </Hint>
      </Section>
      <Section id="settings" title={t('section_settings_title')} icon={Settings}>
        <p className="text-sm text-slate-300 mb-3">{t('settings_intro')}</p>

        <div id="settings-skill">
          <H3>{t('settings_skill_title')}</H3>
          <p className="text-sm text-slate-300 mb-2">
            <strong className="text-slate-200">{t('settings_skill_p1')}</strong>{t('settings_skill_p1_suffix')}
          </p>
          <div className="flex flex-wrap gap-1.5 mb-2">
            <Tag variant="primary">{t('tag_skill_compact')}</Tag>
            <Tag variant="primary">{t('tag_skill_standard')}</Tag>
            <Tag variant="primary">{t('tag_skill_full')}</Tag>
          </div>
          <p className="text-sm text-slate-300 mb-2">
            <strong className="text-slate-200">{t('settings_skill_p2')}</strong>{t('settings_skill_p2_suffix')}
          </p>
          <Hint>
            {t('hint_skill')}
          </Hint>
        </div>

        <div id="settings-chapter">
          <H3>{t('settings_chapter_title')}</H3>
          <p className="text-sm text-slate-300 mb-2">{t('settings_chapter_p1')}</p>
          <ul className="text-sm text-slate-300 space-y-1 list-disc pl-5">
            <li><code className="bg-slate-700/40 px-1 py-0.5 rounded text-xs">targetWords</code>{t('settings_chapter_target')}</li>
            <li><code className="bg-slate-700/40 px-1 py-0.5 rounded text-xs">minWords / maxWords</code>{t('settings_chapter_range')}</li>
            <li><code className="bg-slate-700/40 px-1 py-0.5 rounded text-xs">absoluteMin / absoluteMax</code>{t('settings_chapter_bounds')}</li>
          </ul>
          <p className="text-sm text-slate-300 mt-2">{t('settings_chapter_p2')}</p>
        </div>

        <div id="settings-models">
          <H3>{t('settings_models_title')}</H3>
          <p className="text-sm text-slate-300 mb-2">{t('settings_models_p1')}</p>

          <div className="text-sm text-slate-300 mb-2">
            <strong className="text-slate-200">{t('settings_models_provider_title')}</strong>{t('settings_models_provider_desc')}
          </div>
          <div className="overflow-x-auto mb-3">
            <table className="w-full text-sm border border-slate-700/40 rounded-lg overflow-hidden">
              <thead className="bg-slate-900/60 text-slate-400">
                <tr><th className="text-left px-3 py-1.5">{t('table_header_provider')}</th><th className="text-left px-3 py-1.5">{t('table_header_type')}</th><th className="text-left px-3 py-1.5">{t('table_header_description')}</th></tr>
              </thead>
              <tbody className="divide-y divide-slate-700/30 text-slate-300">
                <tr className="bg-slate-900/20"><td className="px-3 py-1.5">{t('settings_models_provider_any_name')}</td><td className="px-3 py-1.5">{t('settings_models_provider_type')}</td><td className="px-3 py-1.5">{t('settings_models_provider_desc_text')}</td></tr>
              </tbody>
            </table>
          </div>

          <p className="text-sm text-slate-300 mb-2">
            <strong className="text-slate-200">{t('settings_models_rotation_title')}</strong>{t('settings_models_rotation_desc')}
          </p>
          <ul className="text-sm text-slate-300 space-y-1 list-disc pl-5 mb-3">
            <li>{t('settings_models_rotation_li1')}</li>
            <li>{t('settings_models_rotation_li2')}</li>
            <li>{t('settings_models_rotation_li3')} <code className="bg-slate-700/40 px-1 py-0.5 rounded text-xs">(N-1) % {t('settings_models_rotation_formula')}</code></li>
          </ul>
          <p className="text-sm text-slate-300 mb-2">{t('settings_models_rotation_note')}<strong className="text-slate-200">{t('settings_models_rotation_role')}</strong>{t('settings_models_rotation_note2')}</p>

          <p className="text-sm text-slate-300 mb-2">
            <strong className="text-slate-200">{t('settings_models_defaults_title')}</strong>{t('settings_models_defaults_desc')}
          </p>
          <div className="overflow-x-auto mb-3">
            <table className="w-full text-sm border border-slate-700/40 rounded-lg overflow-hidden">
              <thead className="bg-slate-900/60 text-slate-400">
                <tr><th className="text-left px-3 py-1.5">{t('table_header_role')}</th><th className="text-left px-3 py-1.5">{t('table_header_purpose')}</th><th className="text-left px-3 py-1.5">{t('table_header_temp')}</th></tr>
              </thead>
              <tbody className="divide-y divide-slate-700/30 text-slate-300">
                <tr className="bg-slate-900/20"><td className="px-3 py-1.5">{t('role_author_draft')}</td><td className="px-3 py-1.5">{t('role_author_draft_purpose')}</td><td className="px-3 py-1.5">0.8~0.9</td></tr>
                <tr className="bg-slate-900/10"><td className="px-3 py-1.5">{t('role_editor_revise')}</td><td className="px-3 py-1.5">{t('role_editor_revise_purpose')}</td><td className="px-3 py-1.5">0.8~0.9</td></tr>
                <tr className="bg-slate-900/20"><td className="px-3 py-1.5">{t('role_deai')}</td><td className="px-3 py-1.5">{t('role_deai_purpose')}</td><td className="px-3 py-1.5">0.8~0.9</td></tr>
                <tr className="bg-slate-900/10"><td className="px-3 py-1.5">{t('role_proofreader')}</td><td className="px-3 py-1.5">{t('role_proofreader_purpose')}</td><td className="px-3 py-1.5">0.2</td></tr>
                <tr className="bg-slate-900/20"><td className="px-3 py-1.5">{t('role_polish')}</td><td className="px-3 py-1.5">{t('role_polish_purpose')}</td><td className="px-3 py-1.5">0.8</td></tr>
                <tr className="bg-slate-900/10"><td className="px-3 py-1.5">{t('role_reader_feedback')}</td><td className="px-3 py-1.5">{t('role_reader_feedback_purpose')}</td><td className="px-3 py-1.5">0</td></tr>
                <tr className="bg-slate-900/20"><td className="px-3 py-1.5">{t('role_summary')}</td><td className="px-3 py-1.5">{t('role_summary_purpose')}</td><td className="px-3 py-1.5">0</td></tr>
                <tr className="bg-slate-900/10"><td className="px-3 py-1.5">{t('role_outline_gen')}</td><td className="px-3 py-1.5">{t('role_outline_gen_purpose')}</td><td className="px-3 py-1.5">0.2</td></tr>
                <tr className="bg-slate-900/20"><td className="px-3 py-1.5">{t('role_deviation')}</td><td className="px-3 py-1.5">{t('role_deviation_purpose')}</td><td className="px-3 py-1.5">0</td></tr>
                <tr className="bg-slate-900/10"><td className="px-3 py-1.5">{t('role_style_correct')}</td><td className="px-3 py-1.5">{t('role_style_correct_purpose')}</td><td className="px-3 py-1.5">0.3</td></tr>
                <tr className="bg-slate-900/20"><td className="px-3 py-1.5">{t('role_repetition')}</td><td className="px-3 py-1.5">{t('role_repetition_purpose')}</td><td className="px-3 py-1.5">0.2</td></tr>
                <tr className="bg-slate-900/10"><td className="px-3 py-1.5">{t('role_fitness')}</td><td className="px-3 py-1.5">{t('role_fitness_purpose')}</td><td className="px-3 py-1.5">0</td></tr>
              </tbody>
            </table>
          </div>
          <Hint>
            <strong className="text-slate-200">{t('hint_models_highlight')}</strong>{t('hint_models_suffix')}
          </Hint>
        </div>
      </Section>
      <Section id="world" title={t('section_world_title')} icon={Layers}>
        <p className="text-sm text-slate-300 mb-3">
          {t('world_p1')}
        </p>
        <ul className="text-sm text-slate-300 space-y-1.5 list-disc pl-5">
          <li><strong className="text-slate-200">{t('world_worldview')}</strong>{t('world_worldview_desc')}</li>
          <li><strong className="text-slate-200">{t('world_characters')}</strong>{t('world_characters_desc')}</li>
          <li><strong className="text-slate-200">{t('world_plot')}</strong>{t('world_plot_desc')}</li>
          <li><strong className="text-slate-200">{t('world_map')}</strong>{t('world_map_desc')}</li>
        </ul>
        <Hint>
          {t('hint_world_prefix')}<strong className="text-slate-200">{t('hint_world_highlight')}</strong>{t('hint_world_suffix')}
        </Hint>
      </Section>

      <Section id="templates" title={t('section_templates_title')} icon={Sparkles}>
        <p className="text-sm text-slate-300 mb-2">{t('templates_p1')}</p>
        <ul className="text-sm text-slate-300 space-y-1 list-disc pl-5">
          <li><strong className="text-slate-200">{t('templates_beat')}</strong>{t('templates_beat_desc')}</li>
          <li><strong className="text-slate-200">{t('templates_references')}</strong>{t('templates_references_desc')}</li>
          <li><strong className="text-slate-200">{t('templates_tags')}</strong>{t('templates_tags_desc')}</li>
        </ul>
        <p className="text-sm text-slate-300 mt-2">
          {t('templates_p2')}
        </p>
      </Section>

      <Section id="tools" title={t('section_tools_title')} icon={Wrench}>
        <H3>{t('tools_agent_chat_title')}</H3>
        <p className="text-sm text-slate-300 mb-2">{t('tools_agent_chat_p1')}</p>
        <ul className="text-sm text-slate-300 space-y-1 list-disc pl-5 mb-3">
          <li>{t('tools_agent_chat_li1')}</li>
          <li>{t('tools_agent_chat_li2')}</li>
          <li>{t('tools_agent_chat_li3')}</li>
          <li>{t('tools_agent_chat_li4')}</li>
        </ul>
        <p className="text-sm text-slate-300">{t('tools_agent_chat_p2_prefix')}<strong className="text-slate-200">{t('tools_agent_chat_highlight')}</strong>{t('tools_agent_chat_p2_suffix')}</p>

        <H3>{t('tools_prompt_evolve_title')}</H3>
        <p className="text-sm text-slate-300">
          {t('tools_prompt_evolve_desc')}
        </p>
      </Section>

      <Section id="verify" title={t('section_verify_title')} icon={Target}>
        <H3>{t('verify_skill_title')}</H3>
        <ol className="text-sm text-slate-300 space-y-1 list-decimal pl-5">
          <li>{t('verify_skill_li1')} <code className="bg-slate-700/40 px-1 py-0.5 rounded text-xs">{t('verify_skill_code')}</code></li>
          <li>{t('verify_skill_li2_prefix')} <code className="bg-slate-700/40 px-1 py-0.5 rounded text-xs">works/&lt;workId&gt;/chapter_X_prompt.txt</code>{t('verify_skill_li2_suffix')}</li>
        </ol>

        <H3>{t('verify_review_title')}</H3>
        <ol className="text-sm text-slate-300 space-y-1 list-decimal pl-5">
          <li>{t('verify_review_li1')}</li>
          <li>{t('verify_review_li2_prefix')} <code className="bg-slate-700/40 px-1 py-0.5 rounded text-xs">chapter_X_edit_prompt.txt</code>{t('verify_review_li2_suffix')}</li>
        </ol>

        <H3>{t('verify_rotation_title')}</H3>
        <ol className="text-sm text-slate-300 space-y-1 list-decimal pl-5">
          <li>{t('verify_rotation_li1')}</li>
          <li>{t('verify_rotation_li2')}</li>
          <li>{t('verify_rotation_li3')} <code className="bg-slate-700/40 px-1 py-0.5 rounded text-xs">SELECT number, models FROM chapters WHERE workId = '...'</code></li>
        </ol>

        <H3>{t('verify_inject_title')}</H3>
        <ol className="text-sm text-slate-300 space-y-1 list-decimal pl-5">
          <li>{t('verify_inject_li1')}</li>
          <li>{t('verify_inject_li2_prefix')} <code className="bg-slate-700/40 px-1 py-0.5 rounded text-xs">chapter_X_prompt.txt</code>{t('verify_inject_li2_suffix')}</li>
          <li>{t('verify_inject_li3')}</li>
        </ol>
      </Section>

      <Section id="quality" title={t('section_quality_title')} icon={BookOpen}>
        <p className="text-sm text-slate-300 mb-3">{t('quality_intro')}</p>

        <div className="space-y-3 text-sm text-slate-300">
          <div>
            <strong className="text-slate-200">{t('quality_editor')}</strong>{t('quality_editor_desc')}
          </div>
          <div>
            <strong className="text-slate-200">{t('quality_author')}</strong>{t('quality_author_desc')}
          </div>
          <div>
            <strong className="text-slate-200">{t('quality_reader')}</strong>{t('quality_reader_desc')}
          </div>
          <div>
            <strong className="text-slate-200">{t('quality_platform')}</strong>{t('quality_platform_desc')}
          </div>
          <div>
            <strong className="text-slate-200">{t('quality_publisher')}</strong>{t('quality_publisher_desc')}
          </div>
          <div>
            <strong className="text-slate-200">{t('quality_screenwriter')}</strong>{t('quality_screenwriter_desc')}
          </div>
        </div>

        <div className="border-l-4 border-sky-500 pl-4 my-4 text-slate-400 italic text-sm">
          {t('quality_formula')}
        </div>
      </Section>
    </div>
  );
}
