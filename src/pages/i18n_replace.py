import re

def read_file(path):
    with open(path, 'r', encoding='utf-8') as f:
        return f.read()

def write_file(path, content):
    with open(path, 'w', encoding='utf-8') as f:
        f.write(content)

# ========== CreatePage.jsx ==========
print("Processing CreatePage.jsx...")
create = read_file('/Users/igoryu/Documents/h5-agent/knoweb/knowrite-ui/src/pages/CreatePage.jsx')

# Add import
create = create.replace(
    "import { useToast } from '../components/ui/Toast';",
    "import { useToast } from '../components/ui/Toast';\nimport { useI18n } from '../contexts/I18nContext';"
)

# Replace top-level constants with comment, inject them inside component
create = create.replace(
    """const STEPS = ['写下想法', '选择风格', '开始创作'];

const INSPIRATION_TAGS = [
  '退婚逆袭', '系统觉醒', '重生复仇', '穿越古代', '末日求生',
  '修仙问道', '商战逆袭', '悬疑探案', '甜宠恋爱', '机甲战争',
];

const STRATEGY_CARDS = [
  { key: 'pipeline', label: '快速模式', icon: Zap, desc: '1-2分钟', sub: '适合试水和短篇', color: 'amber' },
  { key: 'knowrite', label: '精品模式', icon: Target, desc: '5-15分钟', sub: '质量更高，多轮精修', color: 'sky' },
];

const WRITING_MODE_CARDS = [
  { key: 'industrial', label: '工业风', icon: Factory, desc: '严格量产', sub: '8条规则、3轮编辑、重度去AI', color: 'slate' },
  { key: 'free', label: '自由风', icon: Palette, desc: '创意探索', sub: '2条底线、1轮轻量、轻度去AI', color: 'violet' },
];

export function CreatePage() {""",
    """export function CreatePage() {
  const { t } = useI18n();
  const STEPS = [t('step_idea'), t('step_style'), t('step_create')];
  const INSPIRATION_TAGS = [
    t('tag_breakup'), t('tag_system'), t('tag_revenge'), t('tag_time_travel'), t('tag_apocalypse'),
    t('tag_cultivation'), t('tag_business'), t('tag_mystery'), t('tag_romance'), t('tag_mecha'),
  ];
  const STRATEGY_CARDS = [
    { key: 'pipeline', label: t('label_fast_mode'), icon: Zap, desc: t('desc_1_2_min'), sub: t('sub_short_try'), color: 'amber' },
    { key: 'knowrite', label: t('label_premium_mode'), icon: Target, desc: t('desc_5_15_min'), sub: t('sub_high_quality'), color: 'sky' },
  ];
  const WRITING_MODE_CARDS = [
    { key: 'industrial', label: t('label_industrial'), icon: Factory, desc: t('desc_strict_mass'), sub: t('sub_8_rules'), color: 'slate' },
    { key: 'free', label: t('label_free'), icon: Palette, desc: t('desc_creative'), sub: t('sub_2_rules'), color: 'violet' },
  ];"""
)

# State defaults
create = create.replace("const [platformStyle, setPlatformStyle] = useState('番茄');", "const [platformStyle, setPlatformStyle] = useState('');")
create = create.replace("const [authorStyle, setAuthorStyle] = useState('热血磅礴');", "const [authorStyle, setAuthorStyle] = useState('');")

# JS strings
create = create.replace("addToast('请先输入小说主题', 'error');", "addToast(t('err_enter_topic'), 'error');")
create = create.replace("addToast('创作完成！', 'success');", "addToast(t('msg_creation_done'), 'success');")
create = create.replace(
    "if (isConfigError) display = '【模型配置错误】请前往「设置 → 模型配置」检查 Provider、Base URL、API Key 和模型名称是否正确。';",
    "if (isConfigError) display = t('err_model_config');"
)
create = create.replace(
    "if (isNetworkError) display = '【网络错误】无法连接到模型服务，请检查 Base URL 是否正确、服务是否运行。';",
    "if (isNetworkError) display = t('err_network');"
)
create = create.replace("addToast('请填写标题和正文', 'error');", "addToast(t('err_enter_title_content'), 'error');")
create = create.replace("addToast('导入成功！', 'success');", "addToast(t('msg_import_success'), 'success');")
create = create.replace("addToast('导入失败: ' + e.message, 'error');", "addToast(t('err_import') + e.message, 'error');")

# JSX text nodes and attributes
create = create.replace('<Sparkles size={14} /> 创作新作品', '<Sparkles size={14} /> {t(\'tab_create_new\')}')
create = create.replace('<FileText size={14} /> 导入已有作品', '<FileText size={14} /> {t(\'tab_import_existing\')}')
create = create.replace('<h2 className="text-lg font-bold text-slate-100">开始新创作</h2>', '<h2 className="text-lg font-bold text-slate-100">{t(\'title_new_creation\')}</h2>')
create = create.replace('<p className="text-xs text-slate-500">3步完成，AI 帮你把想法变成小说</p>', '<p className="text-xs text-slate-500">{t(\'subtitle_three_steps\')}</p>')
create = create.replace('<label className="block text-sm font-medium text-slate-200 mb-2">今天想写什么故事？</label>', '<label className="block text-sm font-medium text-slate-200 mb-2">{t(\'label_story_topic\')}</label>')
create = create.replace('placeholder="例如：一个失忆杀手在古代江湖寻找身世，却发现自己是被皇室追杀的皇子..."', 'placeholder={t(\'ph_story_example\')}')
create = create.replace('<label className="block text-xs text-slate-500 mb-2">没有灵感？试试这些：</label>', '<label className="block text-xs text-slate-500 mb-2">{t(\'label_no_inspiration\')}</label>')
create = create.replace("onClick={() => setTopic(tag + '：')}", "onClick={() => setTopic(tag + t('colon'))}")
create = create.replace('下一步 <ArrowRight size={16} />', '{t(\'btn_next\')} <ArrowRight size={16} />')
create = create.replace('<label className="block text-sm font-medium text-slate-200 mb-2">发布平台</label>', '<label className="block text-sm font-medium text-slate-200 mb-2">{t(\'label_publish_platform\')}</label>')
create = create.replace('<label className="block text-sm font-medium text-slate-200 mb-2">作者风格</label>', '<label className="block text-sm font-medium text-slate-200 mb-2">{t(\'label_author_style\')}</label>')
create = create.replace('<label className="block text-sm font-medium text-slate-200 mb-2">生成模式</label>', '<label className="block text-sm font-medium text-slate-200 mb-2">{t(\'label_gen_mode\')}</label>')
create = create.replace('<label className="block text-sm font-medium text-slate-200 mb-2">写作风格</label>', '<label className="block text-sm font-medium text-slate-200 mb-2">{t(\'label_writing_style\')}</label>')
create = create.replace('<label className="block text-sm font-medium text-slate-200 mb-2">套路模版（可选）</label>', '<label className="block text-sm font-medium text-slate-200 mb-2">{t(\'label_template_optional\')}</label>')
create = create.replace('<div className="font-medium text-sm">无套路</div>', '<div className="font-medium text-sm">{t(\'label_no_template\')}</div>')
create = create.replace('<div className="text-[10px] text-slate-500 mt-0.5">自由创作</div>', '<div className="text-[10px] text-slate-500 mt-0.5">{t(\'label_free_creation\')}</div>')
create = create.replace('<h3 className="text-sm font-medium text-slate-300 mb-3">配置确认</h3>', '<h3 className="text-sm font-medium text-slate-300 mb-3">{t(\'title_config_confirm\')}</h3>')
create = create.replace('<span className="text-slate-500 w-16 shrink-0">主题</span>', '<span className="text-slate-500 w-16 shrink-0">{t(\'label_topic\')}</span>')
create = create.replace('<span className="text-slate-500 w-16 shrink-0">平台</span>', '<span className="text-slate-500 w-16 shrink-0">{t(\'label_platform\')}</span>')
create = create.replace('<span className="text-slate-500 w-16 shrink-0">风格</span>', '<span className="text-slate-500 w-16 shrink-0">{t(\'label_style\')}</span>')
create = create.replace('<span className="text-slate-500 w-16 shrink-0">模式</span>', '<span className="text-slate-500 w-16 shrink-0">{t(\'label_mode\')}</span>')
create = create.replace("{strategy === 'pipeline' ? '快速模式' : '精品模式'}", "{strategy === 'pipeline' ? t('label_fast_mode') : t('label_premium_mode')}")
create = create.replace('<span className="text-slate-500 w-16 shrink-0">写作</span>', '<span className="text-slate-500 w-16 shrink-0">{t(\'label_writing\')}</span>')
create = create.replace("{writingMode === 'free' ? '自由风' : '工业风'}", "{writingMode === 'free' ? t('label_free') : t('label_industrial')}")
create = create.replace('<span className="text-slate-500 w-16 shrink-0">套路</span>', '<span className="text-slate-500 w-16 shrink-0">{t(\'label_template\')}</span>')
create = create.replace("{storyTemplates.find(t => String(t.id) === selectedTemplate)?.name || '已选'}", "{storyTemplates.find(tmpl => String(tmpl.id) === selectedTemplate)?.name || t('label_selected')}")
create = create.replace('高级设置（模型配置）', '{t(\'btn_advanced_settings\')}')
create = create.replace('<div className="text-xs text-slate-500 mb-1">大纲模型</div>', '<div className="text-xs text-slate-500 mb-1">{t(\'label_outline_model\')}</div>')
create = create.replace('placeholder="输入模型名"', 'placeholder={t(\'ph_model_name\')}')
create = create.replace('<div className="text-xs text-slate-500 mb-1">正文模型</div>', '<div className="text-xs text-slate-500 mb-1">{t(\'label_chapter_model\')}</div>')
create = create.replace('<div className="text-xs text-slate-500 mb-1">润色模型</div>', '<div className="text-xs text-slate-500 mb-1">{t(\'label_polish_model\')}</div>')
create = create.replace('<ArrowLeft size={16} /> 上一步', '<ArrowLeft size={16} /> {t(\'btn_prev\')}')
create = create.replace("{starting ? '创作中...' : '开始创作'}", "{starting ? t('status_creating') : t('btn_start_creation')}")
create = create.replace("{status.includes('错误') ? 'bg-red-500/10 border-red-500/20 text-red-300' : 'text-slate-400'}", "{status.toLowerCase().includes('error') ? 'bg-red-500/10 border-red-500/20 text-red-300' : 'text-slate-400'}")
create = create.replace("{status.includes('模型配置') && (", "{status.toLowerCase().includes('model config') && (")
create = create.replace('<Link to="/settings" className="ml-2 text-sky-400 hover:text-sky-300 underline text-xs">前往设置 →</Link>', '<Link to="/settings" className="ml-2 text-sky-400 hover:text-sky-300 underline text-xs">{t(\'link_go_settings\')}</Link>')
create = create.replace('<div className="text-xs text-slate-500 font-medium">创作流程</div>', '<div className="text-xs text-slate-500 font-medium">{t(\'label_creation_process\')}</div>')
create = create.replace('<div className="text-xs text-slate-500 mb-2">AI 正在创作中...</div>', '<div className="text-xs text-slate-500 mb-2">{t(\'status_ai_creating\')}</div>')
create = create.replace('<h2 className="text-lg font-bold text-slate-100">导入已有作品</h2>', '<h2 className="text-lg font-bold text-slate-100">{t(\'title_import_existing\')}</h2>')
create = create.replace('<p className="text-xs text-slate-500">粘贴小说正文，系统自动按章节切分</p>', '<p className="text-xs text-slate-500">{t(\'subtitle_paste_content\')}</p>')
create = create.replace('<label className="block text-sm text-slate-300 mb-1.5">小说标题</label>', '<label className="block text-sm text-slate-300 mb-1.5">{t(\'label_novel_title\')}</label>')
create = create.replace('placeholder="例如：斗破苍穹"', 'placeholder={t(\'ph_title_example\')}')
create = create.replace('<label className="block text-sm text-slate-300 mb-1.5">平台风格</label>', '<label className="block text-sm text-slate-300 mb-1.5">{t(\'label_platform_style\')}</label>')
create = create.replace('<label className="block text-sm text-slate-300 mb-1.5">作者风格</label>', '<label className="block text-sm text-slate-300 mb-1.5">{t(\'label_author_style2\')}</label>')
create = create.replace('<label className="block text-sm text-slate-300 mb-1.5">完整正文</label>', '<label className="block text-sm text-slate-300 mb-1.5">{t(\'label_full_content\')}</label>')
create = create.replace('placeholder="粘贴小说完整正文，系统会自动按章节切分..."', 'placeholder={t(\'ph_paste_content\')}')
create = create.replace("{importing ? '导入中...' : '导入小说'}", "{importing ? t('status_importing') : t('btn_import_novel')}")

write_file('/Users/igoryu/Documents/h5-agent/knoweb/knowrite-ui/src/pages/CreatePage.jsx', create)
print("CreatePage.jsx done.")

# ========== WorksPage.jsx ==========
print("Processing WorksPage.jsx...")
works = read_file('/Users/igoryu/Documents/h5-agent/knoweb/knowrite-ui/src/pages/WorksPage.jsx')

# Add import
works = works.replace(
    "import { useWork } from '../contexts/WorkContext';",
    "import { useWork } from '../contexts/WorkContext';\nimport { useI18n } from '../contexts/I18nContext';"
)

# Replace TAB_GROUPS and add hook inside component
works = works.replace(
    """const TAB_GROUPS = [
  {
    label: '核心创作',
    color: 'sky',
    tabs: [
      { key: 'overview', label: '概览', icon: FileText },
    ],
  },
  {
    label: '创作辅助',
    color: 'violet',
    tabs: [
      { key: 'world', label: '世界观', icon: BookOpen },
      { key: 'characters', label: '人物', icon: Users },
      { key: 'plot', label: '剧情线', icon: GitBranch },
      { key: 'map', label: '地图', icon: Map },
      { key: 'templates', label: '套路', icon: Sparkles },
    ],
  },
  {
    label: '数据分析',
    color: 'emerald',
    tabs: [
      { key: 'fitness', label: 'Fitness', icon: BarChart3 },
      { key: 'reviews', label: '评审记录', icon: ClipboardCheck },
    ],
  },
];

export function WorksPage() {""",
    """export function WorksPage() {
  const { t } = useI18n();
  const TAB_GROUPS = [
    {
      label: t('tab_group_core'),
      color: 'sky',
      tabs: [
        { key: 'overview', label: t('tab_overview'), icon: FileText },
      ],
    },
    {
      label: t('tab_group_assist'),
      color: 'violet',
      tabs: [
        { key: 'world', label: t('tab_world'), icon: BookOpen },
        { key: 'characters', label: t('tab_characters'), icon: Users },
        { key: 'plot', label: t('tab_plot'), icon: GitBranch },
        { key: 'map', label: t('tab_map'), icon: Map },
        { key: 'templates', label: t('tab_templates'), icon: Sparkles },
      ],
    },
    {
      label: t('tab_group_data'),
      color: 'emerald',
      tabs: [
        { key: 'fitness', label: 'Fitness', icon: BarChart3 },
        { key: 'reviews', label: t('tab_reviews'), icon: ClipboardCheck },
      ],
    },
  ];"""
)

# JS strings
works = works.replace(
    "if (!window.confirm(`确定要删除作品「${id}」吗？此操作不可撤销。`)) return;",
    "if (!window.confirm(t('confirm_delete_work', { id }))) return;"
)
# Hmm, the instructions say t('key') not t('key', {...}). But some strings need interpolation.
# Let me use simple concatenation for interpolations to stick to simple t() calls.
works = works.replace(
    "if (!window.confirm(`确定要删除作品「${id}」吗？此操作不可撤销。`)) return;",
    "if (!window.confirm(t('confirm_delete_prefix') + id + t('confirm_delete_suffix'))) return;"
)
works = works.replace("setStatus('作品已删除');", "setStatus(t('msg_work_deleted'));")
works = works.replace("setStatus('删除失败: ' + e.message);", "setStatus(t('err_delete') + e.message);")
works = works.replace("setStatus('Plan 预演失败: ' + e.message);", "setStatus(t('err_plan_failed') + e.message);")
works = works.replace("setStatus('正在续写下一章...');", "setStatus(t('status_continuing'));")
works = works.replace("setStatus('续写完成');", "setStatus(t('msg_continue_done'));")
works = works.replace("if (e.name !== 'AbortError') setStatus('错误: ' + e.message);", "if (e.name !== 'AbortError') setStatus(t('err_generic') + e.message);")

# title fallback
works = works.replace("const title = info?.topic ? info.topic.split('\\n')[0].trim() : '未命名作品';", "const title = info?.topic ? info.topic.split('\\n')[0].trim() : t('title_unnamed');")

# JSX replacements
works = works.replace('<CardTitle className="!text-slate-100">我的作品</CardTitle>', '<CardTitle className="!text-slate-100">{t(\'title_my_works\')}</CardTitle>')
works = works.replace('<p className="text-xs text-slate-500 mt-0.5">点击作品查看详情、续写或管理</p>', '<p className="text-xs text-slate-500 mt-0.5">{t(\'subtitle_click_work\')}</p>')
works = works.replace('<Button size="sm" variant="ghost" onClick={refreshWorks}>刷新</Button>', '<Button size="sm" variant="ghost" onClick={refreshWorks}>{t(\'btn_refresh\')}</Button>')
works = works.replace('加载中...', '{t(\'status_loading\')}')
works = works.replace('<ArrowLeft size={12} /> 返回列表', '<ArrowLeft size={12} /> {t(\'btn_back_list\')}')
works = works.replace('<span>作品详情</span>', '<span>{t(\'label_work_detail\')}</span>')
works = works.replace("{info?.style || '默认风格'}", "{info?.style || t('label_default_style')}")
works = works.replace("{info?.chapters?.length || 0} 章", "{info?.chapters?.length || 0}{t('unit_chapters')}")
works = works.replace("{Math.round(totalChars / 1000)}K 字", "{Math.round(totalChars / 1000)}K{t('unit_chars')}")
works = works.replace("{info?.writingMode === 'free' && <Badge variant=\"purple\">自由风</Badge>}", "{info?.writingMode === 'free' && <Badge variant=\"purple\">{t('label_free')}</Badge>}")
works = works.replace(
    "<option key={v.number} value={v.number}>第{v.number}卷{v.title ? ` · ${v.title}` : ''}</option>",
    "<option key={v.number} value={v.number}>{t('label_vol_prefix')}{v.number}{t('label_vol_suffix')}{v.title ? ' · ' + v.title : ''}</option>"
)
works = works.replace("{continuing ? '续写中...' : '续写下一章'}", "{continuing ? t('status_continuing_ch') : t('btn_continue_next')}")
works = works.replace('本章预演', '{t(\'btn_chapter_preview\')}')
works = works.replace('记忆', '{t(\'btn_memory\')}')
works = works.replace('导出', '{t(\'btn_export\')}')
works = works.replace('<div className="text-xs text-slate-500 font-medium mb-1.5">创作流程</div>', '<div className="text-xs text-slate-500 font-medium mb-1.5">{t(\'label_creation_process\')}</div>')
works = works.replace('<div className="text-xs text-slate-500 mb-1">总章节</div>', '<div className="text-xs text-slate-500 mb-1">{t(\'label_total_chapters\')}</div>')
works = works.replace('<div className="text-xs text-slate-500 mb-1">总字数</div>', '<div className="text-xs text-slate-500 mb-1">{t(\'label_total_chars\')}</div>')
works = works.replace('<div className="text-xs text-slate-500 mb-1">风格</div>', '<div className="text-xs text-slate-500 mb-1">{t(\'label_style\')}</div>')
works = works.replace('<div className="text-xs text-slate-500 mb-1">写作模式</div>', '<div className="text-xs text-slate-500 mb-1">{t(\'label_writing_mode\')}</div>')
works = works.replace("{info?.writingMode === 'free' ? '自由风' : '工业风'}", "{info?.writingMode === 'free' ? t('label_free') : t('label_industrial')}")
works = works.replace('<span className="text-sm font-medium text-slate-200">简介大纲</span>', '<span className="text-sm font-medium text-slate-200">{t(\'label_outline_brief\')}</span>')
works = works.replace("<MarkdownRenderer text={info?.outlineTheme || '暂无简介大纲'} />", "<MarkdownRenderer text={info?.outlineTheme || t('msg_no_outline_brief')} />")
works = works.replace('<span className="text-sm font-medium text-slate-200">详细纲章</span>', '<span className="text-sm font-medium text-slate-200">{t(\'label_outline_detailed\')}</span>')
works = works.replace("{outlineChapters.length} 章", "{outlineChapters.length}{t('unit_chapters')}")
works = works.replace('<div className="text-sm text-slate-500 py-2">暂无详细纲章</div>', '<div className="text-sm text-slate-500 py-2">{t(\'msg_no_outline_detailed\')}</div>')
works = works.replace('<span className="text-xs text-slate-400 shrink-0">第{idx + 1}章</span>', '<span className="text-xs text-slate-400 shrink-0">{t(\'label_ch_prefix\')}{idx + 1}{t(\'label_ch_suffix\')}</span>')
works = works.replace('<span className="text-sm font-medium text-slate-200">章节内容</span>', '<span className="text-sm font-medium text-slate-200">{t(\'label_chapter_content\')}</span>')
works = works.replace("{info.chapters.length} 章", "{info.chapters.length}{t('unit_chapters')}")
works = works.replace('<div className="text-sm text-slate-500 py-2">暂无章节</div>', '<div className="text-sm text-slate-500 py-2">{t(\'msg_no_chapters\')}</div>')
works = works.replace(
    "第{vol.number}卷{vol.title ? ` · ${vol.title}` : ''}",
    "{t('label_vol_prefix')}{vol.number}{t('label_vol_suffix')}{vol.title ? ' · ' + vol.title : ''}"
)
works = works.replace('<span className="text-xs text-slate-400 shrink-0">第{ch.number}章</span>', '<span className="text-xs text-slate-400 shrink-0">{t(\'label_ch_prefix\')}{ch.number}{t(\'label_ch_suffix\')}</span>')
works = works.replace("{ch.title || '未命名章节'}", "{ch.title || t('title_unnamed_ch')}")
works = works.replace("{ch.chars || 0} 字", "{ch.chars || 0}{t('unit_chars')}")
works = works.replace('<div className="text-xs text-slate-500 mb-2">正文预览</div>', '<div className="text-xs text-slate-500 mb-2">{t(\'label_content_preview\')}</div>')
works = works.replace(
    "'... (内容过长已截断，请导出查看完整内容) ...'",
    "t('msg_truncated')"
)
works = works.replace('<h3 className="text-base font-bold text-slate-100">章节节拍规划</h3>', '<h3 className="text-base font-bold text-slate-100">{t(\'title_chapter_plan\')}</h3>')
works = works.replace('正在生成本章节拍规划...', '{t(\'status_generating_plan\')}')
works = works.replace('<div className="text-[10px] text-amber-400/70 mb-0.5">整体基调</div>', '<div className="text-[10px] text-amber-400/70 mb-0.5">{t(\'label_overall_tone\')}</div>')
works = works.replace('<div className="text-[10px] text-sky-400/70 mb-0.5">预计总字数</div>', '<div className="text-[10px] text-sky-400/70 mb-0.5">{t(\'label_estimated_words\')}</div>')
works = works.replace("toLocaleString()} 字", "toLocaleString()}{t('unit_chars')}")
works = works.replace(
    "{beat.type === 'hook' ? '钩子' : beat.type === 'rising' ? '升级' : beat.type === 'climax' ? '高潮' : beat.type === 'falling' ? '回落' : '悬念'}",
    "{beat.type === 'hook' ? t('beat_hook') : beat.type === 'rising' ? t('beat_rising') : beat.type === 'climax' ? t('beat_climax') : beat.type === 'falling' ? t('beat_falling') : t('beat_suspense')}"
)
works = works.replace("{beat.estimatedWords || '?'} 字", "{beat.estimatedWords || '?'}{t('unit_chars')}")
works = works.replace('<div className="text-[10px] text-amber-400/70 mb-1">风险提示</div>', '<div className="text-[10px] text-amber-400/70 mb-1">{t(\'label_risk_warnings\')}</div>')
works = works.replace('<div className="text-sm text-slate-500 text-center py-8">未获取到节拍规划（Plan 模式可能已关闭）</div>', '<div className="text-sm text-slate-500 text-center py-8">{t(\'msg_no_plan\')}</div>')
works = works.replace('取消', '{t(\'btn_cancel\')}')
works = works.replace('重新规划', '{t(\'btn_replan\')}')
works = works.replace('确认并续写', '{t(\'btn_confirm_continue\')}')

write_file('/Users/igoryu/Documents/h5-agent/knoweb/knowrite-ui/src/pages/WorksPage.jsx', works)
print("WorksPage.jsx done.")

# ========== SettingsPage.jsx ==========
print("Processing SettingsPage.jsx...")
settings = read_file('/Users/igoryu/Documents/h5-agent/knoweb/knowrite-ui/src/pages/SettingsPage.jsx')

# Add import
settings = settings.replace(
    "import * as api from '../api/novel';",
    "import * as api from '../api/novel';\nimport { useI18n } from '../contexts/I18nContext';"
)

# Add hook inside component
settings = settings.replace(
    "export function SettingsPage() {",
    "export function SettingsPage() {\n  const { t } = useI18n();"
)

# JS strings
settings = settings.replace("setStatus('加载失败: ' + e.message);", "setStatus(t('err_load') + e.message);")
settings = settings.replace("setStatus('流水线配置保存成功');", "setStatus(t('msg_pipeline_saved'));")
settings = settings.replace("setStatus('流水线配置保存失败: ' + e.message);", "setStatus(t('err_pipeline_save') + e.message);")
settings = settings.replace("setStatus('保存成功');", "setStatus(t('msg_save_success'));")
settings = settings.replace("setStatus('保存失败: ' + e.message);", "setStatus(t('err_save') + e.message);")
settings = settings.replace("setStatus('模型库保存成功');", "setStatus(t('msg_model_lib_saved'));")
settings = settings.replace("setStatus('模型库保存失败: ' + e.message);", "setStatus(t('err_model_lib_save') + e.message);")
settings = settings.replace("alias: '新Provider', apiKey: '', baseURL: '', models: [] }", "alias: t('label_new_provider'), apiKey: '', baseURL: '', models: [] }")
settings = settings.replace("setStatus('已应用最佳实践温度');", "setStatus(t('msg_temp_applied'));")
settings = settings.replace("setStatus('已从角色默认值同步到 Agent 模型');", "setStatus(t('msg_synced_agent'));")
settings = settings.replace("setStatus('已清空 Agent 模型配置');", "setStatus(t('msg_cleared_agent'));")
settings = settings.replace("alias: `作家${list.length + 1}`", "alias: t('label_writer') + (list.length + 1)")
settings = settings.replace("setStatus(`正在切换到 ${provider}...`);", "setStatus(t('status_switching_to') + provider + '...');")
settings = settings.replace("setStatus(`已切换到 ${provider}（${switchSelectedRoles.length} 个角色）`);", "setStatus(t('status_switched_to') + provider + ' (' + switchSelectedRoles.length + t('unit_roles') + ')');")
settings = settings.replace("setStatus('切换失败: ' + err.message);", "setStatus(t('err_switch') + err.message);")
settings = settings.replace('加载配置中...', '{t(\'status_loading_config\')}')
settings = settings.replace('配置加载失败', '{t(\'err_config_load\')}')

# Tabs array
settings = settings.replace(
    """  const tabs = [
    { key: 'skill', label: '写作技能 (Skill)' },
    { key: 'review', label: '评审维度' },
    { key: 'author', label: '作者风格' },
    { key: 'platform', label: '平台风格' },
    { key: 'chapter', label: '章节配置' },
    { key: 'writing', label: '写作风格' },
    { key: 'models', label: '模型配置' },
    { key: 'pipeline', label: '流水线' },
  ];""",
    """  const tabs = [
    { key: 'skill', label: t('tab_skill') },
    { key: 'review', label: t('tab_review') },
    { key: 'author', label: t('tab_author') },
    { key: 'platform', label: t('tab_platform') },
    { key: 'chapter', label: t('tab_chapter') },
    { key: 'writing', label: t('tab_writing') },
    { key: 'models', label: t('tab_models') },
    { key: 'pipeline', label: t('tab_pipeline') },
  ];"""
)

# Preset options
settings = settings.replace(
    """  const presetOptions = [
    { value: '8', label: '精简版 · 8维度' },
    { value: '15', label: '标准版 · 15维度' },
    { value: '33', label: '完整版 · 33维度' },
  ];""",
    """  const presetOptions = [
    { value: '8', label: t('preset_8') },
    { value: '15', label: t('preset_15') },
    { value: '33', label: t('preset_33') },
  ];"""
)

settings = settings.replace("setStatus('切换预设中...');", "setStatus(t('status_switching_preset'));")
settings = settings.replace("setStatus(`已切换为 ${presetOptions.find((o) => o.value === preset)?.label}`);", "setStatus(t('status_switched_to') + presetOptions.find((o) => o.value === preset)?.label);")
settings = settings.replace("setStatus('切换失败: ' + err.message);", "setStatus(t('err_switch_preset') + err.message);")

# ROLE_LABELS
settings = settings.replace(
    """  const ROLE_LABELS = {
    writer: '作者（初稿）',
    editor: '编辑（改稿）',
    humanizer: '去AI化',
    proofreader: '校编',
    polish: '润色',
    reader: '读者反馈',
    summarizer: '摘要生成',
    outline: '大纲生成',
    planner: '策划评审',
    reviewer: '通用评审',
    product: '产品评审',
    tech: '技术架构评审',
    reviser: '评审后修改',
    synthesis: '综合评审',
    repetitionRepair: '重复修复',
    deviationCheck: '偏离检测',
    styleCorrect: '风格修正',
    promptEvolve: 'Prompt进化',
    fitnessEvaluate: 'Fitness评估',
  };""",
    """  const ROLE_LABELS = {
    writer: t('role_writer'),
    editor: t('role_editor'),
    humanizer: t('role_humanizer'),
    proofreader: t('role_proofreader'),
    polish: t('role_polish'),
    reader: t('role_reader'),
    summarizer: t('role_summarizer'),
    outline: t('role_outline'),
    planner: t('role_planner'),
    reviewer: t('role_reviewer'),
    product: t('role_product'),
    tech: t('role_tech'),
    reviser: t('role_reviser'),
    synthesis: t('role_synthesis'),
    repetitionRepair: t('role_repetition_repair'),
    deviationCheck: t('role_deviation_check'),
    styleCorrect: t('role_style_correct'),
    promptEvolve: t('role_prompt_evolve'),
    fitnessEvaluate: t('role_fitness_evaluate'),
  };"""
)

# JSX replacements
settings = settings.replace('<CardTitle className="mb-0">创作设置</CardTitle>', '<CardTitle className="mb-0">{t(\'title_creation_settings\')}</CardTitle>')
settings = settings.replace('保存设置', '{t(\'btn_save_settings\')}')
settings = settings.replace('<label className="text-sm text-slate-300">当前评审预设</label>', '<label className="text-sm text-slate-300">{t(\'label_current_preset\')}</label>')
settings = settings.replace(
    '<div className="text-xs text-slate-500">\n              Skill 规则与评审维度联动，切换预设会自动替换为对应版本的写作规范。\n            </div>',
    '<div className="text-xs text-slate-500">{t(\'desc_skill_preset\')}</div>'
)
settings = settings.replace('<label className="block text-sm text-slate-300 mb-2">核心写作规则 (core-rules)</label>', '<label className="block text-sm text-slate-300 mb-2">{t(\'label_core_rules\')}</label>')
settings = settings.replace('<p className="text-xs text-slate-500 mb-2">该内容会被注入到所有作者模型的 Prompt 中，作为硬性创作规范。</p>', '<p className="text-xs text-slate-500 mb-2">{t(\'desc_core_rules\')}</p>')
settings = settings.replace(
    '<div className="text-xs text-slate-500">\n              切换预设会替换为对应版本的评审维度。你可以在此基础上继续编辑，保存后会覆盖该预设的自定义内容。\n            </div>',
    '<div className="text-xs text-slate-500">{t(\'desc_preset_switch\')}</div>'
)
settings = settings.replace('<label className="block text-sm text-slate-300">编辑评审维度</label>', '<label className="block text-sm text-slate-300">{t(\'label_edit_dimensions\')}</label>')
settings = settings.replace("<Button size=\"sm\" onClick={() => addItem('reviewDimensions', { name: '新维度', description: '描述' })}>添加维度</Button>", "<Button size=\"sm\" onClick={() => addItem('reviewDimensions', { name: t('label_new_dimension'), description: t('label_description') })}>{t('btn_add_dimension')}</Button>")
settings = settings.replace('placeholder="维度名称"', 'placeholder={t(\'ph_dimension_name\')}')
settings = settings.replace('placeholder="评审描述"', 'placeholder={t(\'ph_review_desc\')}')
settings = settings.replace('删除', '{t(\'btn_delete\')}')
settings = settings.replace('<label className="block text-sm text-slate-300">作者风格预设</label>', '<label className="block text-sm text-slate-300">{t(\'label_author_style_preset\')}</label>')
settings = settings.replace("<Button size=\"sm\" onClick={() => addItem('authorStyles', { name: '新风格', description: '' })}>添加风格</Button>", "<Button size=\"sm\" onClick={() => addItem('authorStyles', { name: t('label_new_style'), description: '' })}>{t('btn_add_style')}</Button>")
settings = settings.replace('placeholder="风格名称"', 'placeholder={t(\'ph_style_name\')}')
settings = settings.replace('placeholder="风格展开描述，会注入到 Prompt 中"', 'placeholder={t(\'ph_style_desc\')}')
settings = settings.replace('<label className="block text-sm text-slate-300">平台风格预设</label>', '<label className="block text-sm text-slate-300">{t(\'label_platform_style_preset\')}</label>')
settings = settings.replace("<Button size=\"sm\" onClick={() => addItem('platformStyles', { name: '新平台', description: '' })}>添加平台</Button>", "<Button size=\"sm\" onClick={() => addItem('platformStyles', { name: t('label_new_platform'), description: '' })}>{t('btn_add_platform')}</Button>")
settings = settings.replace('placeholder="平台名称"', 'placeholder={t(\'ph_platform_name\')}')
settings = settings.replace('placeholder="平台风格展开描述"', 'placeholder={t(\'ph_platform_desc\')}')
settings = settings.replace('<CardTitle className="mb-3">写作风格模式</CardTitle>', '<CardTitle className="mb-3">{t(\'title_writing_mode\')}</CardTitle>')
settings = settings.replace('<p className="text-xs text-slate-500 mb-4">选择系统默认的写作模式。创建作品时可单独覆盖。</p>', '<p className="text-xs text-slate-500 mb-4">{t(\'desc_writing_mode\')}</p>')
settings = settings.replace('<div className="font-medium text-slate-200 mb-1">工业风 · 严格量产</div>', '<div className="font-medium text-slate-200 mb-1">{t(\'label_industrial_strict\')}</div>')
settings = settings.replace('<p>• 8条核心规则严格执行</p>', '<p>• {t(\'industrial_rule_1\')}</p>')
settings = settings.replace('<p>• 大纲必须严格遵循</p>', '<p>• {t(\'industrial_rule_2\')}</p>')
settings = settings.replace('<p>• 编辑最多3轮严格评审</p>', '<p>• {t(\'industrial_rule_3\')}</p>')
settings = settings.replace('<p>• 重度去AI化 + 全量ReAct评审</p>', '<p>• {t(\'industrial_rule_4\')}</p>')
settings = settings.replace('<p>• 适合：商业化量产、IP开发</p>', '<p>• {t(\'industrial_rule_5\')}</p>')
settings = settings.replace('<div className="font-medium text-slate-200 mb-1">自由风 · 创意探索</div>', '<div className="font-medium text-slate-200 mb-1">{t(\'label_free_creative\')}</div>')
settings = settings.replace('<p>• 只保留2条底线（吸引力+人物一致性）</p>', '<p>• {t(\'free_rule_1\')}</p>')
settings = settings.replace('<p>• 大纲为参考，允许偏离和即兴</p>', '<p>• {t(\'free_rule_2\')}</p>')
settings = settings.replace('<p>• 编辑1轮轻量检查</p>', '<p>• {t(\'free_rule_3\')}</p>')
settings = settings.replace('<p>• 轻度去AI化，跳过proofreader</p>', '<p>• {t(\'free_rule_4\')}</p>')
settings = settings.replace('<p>• 适合：灵感驱动、探索性写作</p>', '<p>• {t(\'free_rule_5\')}</p>')
settings = settings.replace('<h3 className="text-sm font-medium text-slate-200">模型库</h3>', '<h3 className="text-sm font-medium text-slate-200">{t(\'title_model_library\')}</h3>')
settings = settings.replace('保存模型库', '{t(\'btn_save_model_lib\')}')
settings = settings.replace('添加模型库', '{t(\'btn_add_model_lib\')}')
settings = settings.replace(
    '<div className="text-xs text-slate-500">\n                模型库是全局 Provider 模板，添加 Provider 时可从中选择自动填充。修改后请点「保存模型库」。\n              </div>',
    '<div className="text-xs text-slate-500">{t(\'desc_model_library\')}</div>'
)
settings = settings.replace('placeholder="Key (唯一标识)"', 'placeholder={t(\'ph_lib_key\')}')
settings = settings.replace('placeholder="显示名称"', 'placeholder={t(\'ph_display_name\')}')
settings = settings.replace('placeholder="Base URL"', 'placeholder={t(\'ph_base_url\')}')
settings = settings.replace('placeholder="模型列表，每行一个，格式：id|名称（如 qwen-plus|Qwen-Plus）"', 'placeholder={t(\'ph_models_list\')}')
settings = settings.replace("{editingLibIndex >= 0 ? '更新' : '添加'}", "{editingLibIndex >= 0 ? t('btn_update') : t('btn_add')}")
settings = settings.replace('取消', '{t(\'btn_cancel\')}')
settings = settings.replace('<th className="text-left px-3 py-2 font-medium">名称</th>', '<th className="text-left px-3 py-2 font-medium">{t(\'th_name\')}</th>')
settings = settings.replace('<th className="text-left px-3 py-2 font-medium">Key</th>', '<th className="text-left px-3 py-2 font-medium">Key</th>')
settings = settings.replace('<th className="text-left px-3 py-2 font-medium">URL</th>', '<th className="text-left px-3 py-2 font-medium">URL</th>')
settings = settings.replace('<th className="text-left px-3 py-2 font-medium">模型数</th>', '<th className="text-left px-3 py-2 font-medium">{t(\'th_model_count\')}</th>')
settings = settings.replace('<th className="text-left px-3 py-2 font-medium w-24">操作</th>', '<th className="text-left px-3 py-2 font-medium w-24">{t(\'th_actions\')}</th>')
settings = settings.replace('编辑', '{t(\'btn_edit\')}')
settings = settings.replace(
    '<td colSpan={5} className="px-3 py-4 text-xs text-slate-500 text-center">模型库为空，点击「添加模型库」开始配置。</td>',
    '<td colSpan={5} className="px-3 py-4 text-xs text-slate-500 text-center">{t(\'msg_empty_model_lib\')}</td>'
)
settings = settings.replace('<h3 className="text-sm font-medium text-slate-200">Provider 配置</h3>', '<h3 className="text-sm font-medium text-slate-200">{t(\'title_provider_config\')}</h3>')
settings = settings.replace('添加 Provider', '{t(\'btn_add_provider\')}')
settings = settings.replace('placeholder="显示名称"', 'placeholder={t(\'ph_display_name\')}')
settings = settings.replace('<option value="">从模型库选择…</option>', '<option value="">{t(\'opt_select_from_lib\')}</option>')
settings = settings.replace('<option value="__custom__">自定义</option>', '<option value="__custom__">{t(\'opt_custom\')}</option>')
settings = settings.replace('placeholder="API Key（本地模型可留空）"', 'placeholder={t(\'ph_api_key\')}')
settings = settings.replace("{testStatus[pk]?.type === 'loading' ? '测试中...' : '测试'}", "{testStatus[pk]?.type === 'loading' ? t('status_testing') : t('btn_test')}")
settings = settings.replace('<div className="text-xs text-green-400">✅ 测试成功：{testStatus[pk].msg}</div>', '<div className="text-xs text-green-400">{t(\'msg_test_success\')}{testStatus[pk].msg}</div>')
settings = settings.replace('<div className="text-xs text-red-400">❌ 测试失败：{testStatus[pk].msg}</div>', '<div className="text-xs text-red-400">{t(\'msg_test_fail\')}{testStatus[pk].msg}</div>')
settings = settings.replace('<span className="text-xs text-slate-400">默认模型</span>', '<span className="text-xs text-slate-400">{t(\'label_default_model\')}</span>')
settings = settings.replace('<option value="">使用第一个可用模型</option>', '<option value="">{t(\'opt_use_first_model\')}</option>')
settings = settings.replace('<div className="text-xs text-slate-400">可用模型 ({(p.models || []).length})</div>', '<div className="text-xs text-slate-400">{t(\'label_available_models\')} ({(p.models || []).length})</div>')
settings = settings.replace('placeholder="输入模型 ID（如 qwen3:4b）"', 'placeholder={t(\'ph_model_id\')}')
settings = settings.replace(
    '<div className="text-xs text-slate-500 text-center py-4">暂无 Provider，点击「添加 Provider」开始配置。可从上方模型库快速选择。</div>',
    '<div className="text-xs text-slate-500 text-center py-4">{t(\'msg_no_provider\')}</div>'
)
settings = settings.replace('<h3 className="text-sm font-medium text-slate-200">默认 Provider</h3>', '<h3 className="text-sm font-medium text-slate-200">{t(\'title_default_provider\')}</h3>')
settings = settings.replace('<option value="">-- 未设置 --</option>', '<option value="">{t(\'opt_not_set\')}</option>')
settings = settings.replace('<span className="text-xs text-slate-500">角色未指定 Provider 时将使用默认 Provider</span>', '<span className="text-xs text-slate-500">{t(\'desc_default_provider\')}</span>')
settings = settings.replace('<h3 className="text-sm font-medium text-slate-200">角色默认模型与温度</h3>', '<h3 className="text-sm font-medium text-slate-200">{t(\'title_role_defaults\')}</h3>')
settings = settings.replace('应用最佳实践温度', '{t(\'btn_apply_best_temp\')}')
settings = settings.replace('<div className="text-xs text-slate-400">批量设置（勾选下方角色后应用）</div>', '<div className="text-xs text-slate-400">{t(\'label_batch_settings\')}</div>')
settings = settings.replace('<option value="">Provider</option>', '<option value="">Provider</option>')
settings = settings.replace('<option value="">Model</option>', '<option value="">Model</option>')
settings = settings.replace('应用到 {selectedRoles.length} 个角色', '{t(\'btn_apply_to\')}{selectedRoles.length}{t(\'unit_roles\')}')
settings = settings.replace('<th className="text-left px-3 py-2 font-medium">角色</th>', '<th className="text-left px-3 py-2 font-medium">{t(\'th_role\')}</th>')
settings = settings.replace('<th className="text-left px-3 py-2 font-medium">Provider</th>', '<th className="text-left px-3 py-2 font-medium">Provider</th>')
settings = settings.replace('<th className="text-left px-3 py-2 font-medium">模型</th>', '<th className="text-left px-3 py-2 font-medium">{t(\'th_model\')}</th>')
settings = settings.replace('<th className="text-left px-3 py-2 font-medium">温度</th>', '<th className="text-left px-3 py-2 font-medium">{t(\'th_temperature\')}</th>')
settings = settings.replace('<option value="">跟随默认</option>', '<option value="">{t(\'opt_follow_default\')}</option>')
settings = settings.replace('<option value="">跟随 Provider 默认</option>', '<option value="">{t(\'opt_follow_provider\')}</option>')
settings = settings.replace(
    '<div className="text-xs text-slate-500">\n                最佳实践：创作类角色（作者、编辑、润色）建议温度 0.8~0.9；审核/评审/结构类角色建议温度 0~0.3，以降低幻觉并提高稳定性。Provider 留空则跟随「默认 Provider」，模型留空则跟随该 Provider 的默认模型（未设置则使用第一个可用模型）。\n              </div>',
    '<div className="text-xs text-slate-500">{t(\'desc_best_practice\')}</div>'
)
settings = settings.replace('<h3 className="text-sm font-medium text-slate-200">Agent 模型分配</h3>', '<h3 className="text-sm font-medium text-slate-200">{t(\'title_agent_models\')}</h3>')
settings = settings.replace(
    '<div className="text-xs text-slate-500 mt-0.5">\n                    为每个写作 Agent 独立指定 Provider + Model + Temperature，覆盖「角色默认模型」的通用配置。留空则回退到角色默认模型。\n                  </div>',
    '<div className="text-xs text-slate-500 mt-0.5">{t(\'desc_agent_models\')}</div>'
)
settings = settings.replace('从角色默认同步', '{t(\'btn_sync_from_roles\')}')
settings = settings.replace('清空', '{t(\'btn_clear\')}')
settings = settings.replace('<th className="text-left px-3 py-2 font-medium">Agent</th>', '<th className="text-left px-3 py-2 font-medium">Agent</th>')
settings = settings.replace('<option value="">跟随角色默认</option>', '<option value="">{t(\'opt_follow_role_default\')}</option>')
settings = settings.replace(
    '<div className="text-xs text-slate-500">\n                提示：Agent 模型分配优先级高于「角色默认模型」。例如可设置 Writer 使用轻量模型降低成本，Editor 使用强模型提高审阅质量。\n              </div>',
    '<div className="text-xs text-slate-500">{t(\'desc_agent_hint\')}</div>'
)
settings = settings.replace('<h3 className="text-sm font-medium text-slate-200">高级选项：作家轮换模型</h3>', '<h3 className="text-sm font-medium text-slate-200">{t(\'title_writer_rotation\')}</h3>')
settings = settings.replace("{showAdvanced ? '收起 ▲' : '展开 ▼'}", "{showAdvanced ? t('btn_collapse') : t('btn_expand')}")
settings = settings.replace("{getModelCfg().writerRotation?.enabled ? '已启用' : '未启用'}", "{getModelCfg().writerRotation?.enabled ? t('status_enabled') : t('status_disabled')}")
settings = settings.replace(
    '<div className="text-xs text-slate-500">\n                    启用后，第 1 章使用列表第 1 个模型，第 2 章使用第 2 个模型，依此类推循环切换。\n                  </div>',
    '<div className="text-xs text-slate-500">{t(\'desc_writer_rotation\')}</div>'
)
settings = settings.replace('placeholder="别名"', 'placeholder={t(\'ph_alias\')}')
settings = settings.replace('<option value="">选择模型</option>', '<option value="">{t(\'opt_select_model\')}</option>')
settings = settings.replace(
    '<div className="text-xs text-slate-500 italic">暂无轮换模型，点击「添加模型」开始配置。</div>',
    '<div className="text-xs text-slate-500 italic">{t(\'msg_no_rotation_models\')}</div>'
)
settings = settings.replace('添加模型', '{t(\'btn_add_model\')}')
settings = settings.replace('<CardTitle className="mb-3">章节字数配置</CardTitle>', '<CardTitle className="mb-3">{t(\'title_chapter_config\')}</CardTitle>')
settings = settings.replace('<p className="text-xs text-slate-500 mb-4">这些配置会同时影响 Prompt 模板中的字数要求和 Fitness 评估的目标字数。</p>', '<p className="text-xs text-slate-500 mb-4">{t(\'desc_chapter_config\')}</p>')
settings = settings.replace('<label className="text-sm text-slate-300 block mb-1">目标字数</label>', '<label className="text-sm text-slate-300 block mb-1">{t(\'label_target_words\')}</label>')
settings = settings.replace('<p className="text-xs text-slate-500 mb-2">Prompt 中要求 AI 写作的目标字数</p>', '<p className="text-xs text-slate-500 mb-2">{t(\'desc_target_words\')}</p>')
settings = settings.replace('<label className="text-sm text-slate-300 block mb-1">允许最小字数</label>', '<label className="text-sm text-slate-300 block mb-1">{t(\'label_min_words\')}</label>')
settings = settings.replace('<p className="text-xs text-slate-500 mb-2">Prompt 中允许的字数下限</p>', '<p className="text-xs text-slate-500 mb-2">{t(\'desc_min_words\')}</p>')
settings = settings.replace('<label className="text-sm text-slate-300 block mb-1">允许最大字数</label>', '<label className="text-sm text-slate-300 block mb-1">{t(\'label_max_words\')}</label>')
settings = settings.replace('<p className="text-xs text-slate-500 mb-2">Prompt 中允许的字数上限</p>', '<p className="text-xs text-slate-500 mb-2">{t(\'desc_max_words\')}</p>')
settings = settings.replace('<label className="text-sm text-slate-300 block mb-1">绝对最小字数</label>', '<label className="text-sm text-slate-300 block mb-1">{t(\'label_absolute_min\')}</label>')
settings = settings.replace('<p className="text-xs text-slate-500 mb-2">Prompt 中禁止低于的字数（硬下限）</p>', '<p className="text-xs text-slate-500 mb-2">{t(\'desc_absolute_min\')}</p>')
settings = settings.replace('<label className="text-sm text-slate-300 block mb-1">绝对最大字数</label>', '<label className="text-sm text-slate-300 block mb-1">{t(\'label_absolute_max\')}</label>')
settings = settings.replace('<p className="text-xs text-slate-500 mb-2">Prompt 中禁止高于的字数（硬上限）</p>', '<p className="text-xs text-slate-500 mb-2">{t(\'desc_absolute_max\')}</p>')
settings = settings.replace('<CardTitle className="mb-1">写作流水线配置</CardTitle>', '<CardTitle className="mb-1">{t(\'title_pipeline_config\')}</CardTitle>')
settings = settings.replace('<p className="text-xs text-slate-500">控制续写时各 Agent 阶段的启用/禁用状态，以及 Plan 预演模式。</p>', '<p className="text-xs text-slate-500">{t(\'desc_pipeline_config\')}</p>')
settings = settings.replace('保存流水线配置', '{t(\'btn_save_pipeline\')}')
settings = settings.replace('<div className="text-sm font-medium text-slate-200">Plan 预演模式</div>', '<div className="text-sm font-medium text-slate-200">{t(\'label_plan_mode\')}</div>')
settings = settings.replace('<div className="text-xs text-slate-500">续写前先生成章节节拍规划，作者确认后再执行 Writer</div>', '<div className="text-xs text-slate-500">{t(\'desc_plan_mode\')}</div>')
settings = settings.replace('<div className="text-sm font-medium text-slate-200 mb-2">Agent 阶段开关</div>', '<div className="text-sm font-medium text-slate-200 mb-2">{t(\'label_agent_stages\')}</div>')

# Stage array
settings = settings.replace(
    """                {[
                  { key: 'writer', label: '作者（Writer）', desc: '生成初稿' },
                  { key: 'editor', label: '编辑（Editor）', desc: '改稿审阅' },
                  { key: 'humanizer', label: '去AI化（Humanizer）', desc: '降低 AI 痕迹' },
                  { key: 'proofreader', label: '校编（Proofreader）', desc: '校对语法和逻辑' },
                  { key: 'reader', label: '读者反馈（Reader）', desc: '模拟读者评审' },
                  { key: 'summarizer', label: '摘要（Summarizer）', desc: '生成章节摘要' },
                  { key: 'polish', label: '润色（Polish）', desc: '最终润色' },
                ].map((stage) => {""",
    """                {[
                  { key: 'writer', label: t('stage_writer'), desc: t('stage_writer_desc') },
                  { key: 'editor', label: t('stage_editor'), desc: t('stage_editor_desc') },
                  { key: 'humanizer', label: t('stage_humanizer'), desc: t('stage_humanizer_desc') },
                  { key: 'proofreader', label: t('stage_proofreader'), desc: t('stage_proofreader_desc') },
                  { key: 'reader', label: t('stage_reader'), desc: t('stage_reader_desc') },
                  { key: 'summarizer', label: t('stage_summarizer'), desc: t('stage_summarizer_desc') },
                  { key: 'polish', label: t('stage_polish'), desc: t('stage_polish_desc') },
                ].map((stage) => {"""
)
settings = settings.replace(
    '<div className="text-xs text-slate-500 mt-2">\n                提示：禁用某些阶段可以加速写作流程、降低 Token 消耗。Writer、Summarizer 不建议禁用（会影响后续章节上下文构建）。\n              </div>',
    '<div className="text-xs text-slate-500 mt-2">{t(\'desc_stage_hint\')}</div>'
)

write_file('/Users/igoryu/Documents/h5-agent/knoweb/knowrite-ui/src/pages/SettingsPage.jsx', settings)
print("SettingsPage.jsx done.")
print("All files processed successfully!")
