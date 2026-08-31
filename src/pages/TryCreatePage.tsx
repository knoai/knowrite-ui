// @ts-nocheck
import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { FlaskConical, Play, ChevronDown, ChevronUp, RotateCcw, ArrowRight, Check, Loader2, FileText, BookOpen, Sparkles } from 'lucide-react';
import { Card, CardTitle } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input, Textarea } from '../components/ui/Input';
import { useToast } from '../components/ui/Toast';
import { useI18n } from '../contexts/I18nContext';
import { getStoredLang } from '../i18n';
import * as api from '../api/novel';

export function TryCreatePage() {
  const navigate = useNavigate();
  const { addToast } = useToast();
  const { t } = useI18n();

  const STAGE_DEFS = [
    { key: 'outline', label: t('stage_outline_label'), desc: t('stage_outline_desc'), icon: FileText },
    { key: 'detailed', label: t('stage_detailed_label'), desc: t('stage_detailed_desc'), icon: BookOpen },
    { key: 'chapters', label: t('stage_chapters_label'), desc: t('stage_chapters_desc'), icon: Sparkles },
    { key: 'continue', label: t('stage_continue_label'), desc: t('stage_continue_desc'), icon: ArrowRight },
  ];

  const STRATEGIES = [
    { key: 'pipeline', label: t('strategy_fast_label'), desc: t('strategy_fast_desc') },
    { key: 'knowrite', label: t('strategy_quality_label'), desc: t('strategy_quality_desc') },
  ];

  const [topic, setTopic] = useState('');
  const [platformStyle, setPlatformStyle] = useState('番茄');
  const [authorStyle, setAuthorStyle] = useState('热血磅礴');
  const [strategy, setStrategy] = useState('pipeline');
  const [writingMode, setWritingMode] = useState('industrial');
  const [language, setLanguage] = useState(() => getStoredLang());
  const [platformStyles, setPlatformStyles] = useState([]);
  const [authorStyles, setAuthorStyles] = useState([]);
  const [storyTemplates, setStoryTemplates] = useState([]);
  const [selectedTemplate, setSelectedTemplate] = useState('');
  const [workId, setWorkId] = useState(null);
  const [expandedStage, setExpandedStage] = useState(null);
  const abortRef = useRef(null);

  const [stageState, setStageState] = useState({
    outline: { loading: false, done: false, text: '', error: '' },
    detailed: { loading: false, done: false, text: '', error: '' },
    chapters: { loading: false, done: false, text: '', error: '' },
    continue: { loading: false, done: false, text: '', error: '' },
  });

  useEffect(() => {
    api.getPlatformStyles().then(d => setPlatformStyles(d.platformStyles || [])).catch(() => {});
    api.getAuthorStyles().then(d => setAuthorStyles(d.authorStyles || [])).catch(() => {});
    api.getWritingMode().then(d => setWritingMode(d.writingMode || 'industrial')).catch(() => {});
    api.getStoryTemplates().then(d => setStoryTemplates(d.items || [])).catch(() => {});
  }, []);

  const updateStage = (key, updater) => {
    setStageState(prev => ({ ...prev, [key]: { ...prev[key], ...updater } }));
  };

  const canRunStage = (idx) => {
    if (idx === 0) return true;
    const prevKey = STAGE_DEFS[idx - 1].key;
    return stageState[prevKey].done;
  };

  const runStage = async (idx) => {
    const def = STAGE_DEFS[idx];
    const key = def.key;
    if (abortRef.current) { abortRef.current.abort(); }
    const controller = new AbortController();
    abortRef.current = controller;

    updateStage(key, { loading: true, done: false, text: '', error: '' });

    const onChunk = (chunk) => updateStage(key, { text: (prev) => prev + chunk });
    const onEvent = (ev) => {
      if (ev.type === 'done') {
        if (key === 'outline' && ev.meta?.workId) {
          setWorkId(ev.meta.workId);
        }
        updateStage(key, { loading: false, done: true });
      }
      if (ev.type === 'error') {
        updateStage(key, { loading: false, error: ev.message || t('generation_failed'), errorContext: ev.context, rawMessage: ev.rawMessage });
      }
    };

    try {
      const customModels = {};
      if (key === 'outline' || key === 'detailed') {
        // 详细纲章使用 outline 角色模型
      }

      const baseBody = { customModels };

      if (key === 'outline') {
        await api.tryCreateOutline({
          topic: topic.trim(), platformStyle, authorStyle, strategy, writingMode, storyTemplate: selectedTemplate || undefined,
          language,
        }, (chunk) => {
          setStageState(prev => ({ ...prev, outline: { ...prev.outline, text: prev.outline.text + chunk } }));
        }, controller.signal, onEvent);
      } else if (key === 'detailed') {
        await api.tryCreateDetailedOutline({ workId, customModels }, (chunk) => {
          setStageState(prev => ({ ...prev, detailed: { ...prev.detailed, text: prev.detailed.text + chunk } }));
        }, controller.signal, onEvent);
      } else if (key === 'chapters') {
        await api.tryCreateChapters({ workId, customModels, count: 3 }, (chunk) => {
          setStageState(prev => ({ ...prev, chapters: { ...prev.chapters, text: prev.chapters.text + chunk } }));
        }, controller.signal, onEvent);
      } else if (key === 'continue') {
        await api.tryContinue({ workId, customModels }, (chunk) => {
          setStageState(prev => ({ ...prev, continue: { ...prev.continue, text: prev.continue.text + chunk } }));
        }, controller.signal, onEvent);
      }
    } catch (err) {
      if (err.name !== 'AbortError') {
        updateStage(key, { loading: false, error: err.message });
        addToast(err.message, 'error');
      }
    } finally {
      abortRef.current = null;
    }
  };

  const resetAll = () => {
    if (abortRef.current) { abortRef.current.abort(); }
    setWorkId(null);
    setExpandedStage(null);
    setStageState({
      outline: { loading: false, done: false, text: '', error: '' },
      detailed: { loading: false, done: false, text: '', error: '' },
      chapters: { loading: false, done: false, text: '', error: '' },
      continue: { loading: false, done: false, text: '', error: '' },
    });
  };

  const goToWork = () => {
    if (workId) navigate(`/works/${workId}`);
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-slate-100">{t('try_create_title')}</h2>
          <p className="text-xs text-slate-500">{t('try_create_subtitle')}</p>
        </div>
        <div className="flex gap-2">
          {workId && (
            <Button size="sm" variant="secondary" onClick={goToWork}>
              {t('btn_view_work')}
            </Button>
          )}
          <Button size="sm" variant="danger" onClick={resetAll}>
            <RotateCcw size={14} className="mr-1" />
            {t('btn_reset')}
          </Button>
        </div>
      </div>

      {/* 输入区 */}
      <Card>
        <div className="space-y-4">
          <div>
            <label className="block text-sm text-slate-300 mb-1">{t('label_topic')}</label>
            <Textarea
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder={t('placeholder_topic')}
              rows={3}
            />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-sm text-slate-300 mb-1">{t('label_platform_style')}</label>
              <select
                value={platformStyle}
                onChange={(e) => setPlatformStyle(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 text-slate-200 text-sm rounded-lg px-3 py-2"
              >
                {platformStyles.map((s, i) => (
                  <option key={s.name + '-' + i} value={s.name}>{s.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm text-slate-300 mb-1">{t('label_author_style')}</label>
              <select
                value={authorStyle}
                onChange={(e) => setAuthorStyle(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 text-slate-200 text-sm rounded-lg px-3 py-2"
              >
                {authorStyles.map((s, i) => (
                  <option key={s.name + '-' + i} value={s.name}>{s.name}</option>
                ))}
              </select>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-sm text-slate-300 mb-1">{t('label_creation_mode')}</label>
              <div className="flex gap-2">
                {STRATEGIES.map((s) => (
                  <button
                    key={s.key}
                    onClick={() => setStrategy(s.key)}
                    className={`flex-1 p-2 rounded-lg border text-left transition ${
                      strategy === s.key
                        ? 'border-sky-500 bg-sky-500/10 text-sky-300'
                        : 'border-slate-700/40 hover:border-slate-600 text-slate-400'
                    }`}
                  >
                    <div className="text-xs font-medium">{s.label}</div>
                    <div className="text-[10px] text-slate-500">{s.desc}</div>
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="block text-sm text-slate-300 mb-1">{t('label_writing_style')}</label>
              <div className="flex gap-2">
                {[
                  { key: 'industrial', label: t('writing_style_industrial') },
                  { key: 'free', label: t('writing_style_free') },
                ].map((m) => (
                  <button
                    key={m.key}
                    onClick={() => setWritingMode(m.key)}
                    className={`flex-1 p-2 rounded-lg border text-left transition ${
                      writingMode === m.key
                        ? 'border-sky-500 bg-sky-500/10 text-sky-300'
                        : 'border-slate-700/40 hover:border-slate-600 text-slate-400'
                    }`}
                  >
                    <div className="text-xs font-medium">{m.label}</div>
                  </button>
                ))}
              </div>
            </div>
            {storyTemplates.length > 0 && (
              <div>
                <label className="block text-sm text-slate-300 mb-1">{t('label_story_template')}</label>
                <select
                  value={selectedTemplate}
                  onChange={(e) => setSelectedTemplate(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 text-slate-200 text-sm rounded-lg px-3 py-2"
                >
                  <option value="">{t('option_no_template')}</option>
                  {storyTemplates.map((t) => (
                    <option key={t.id} value={t.id}>{t.name} ({t.category})</option>
                  ))}
                </select>
              </div>
            )}
          </div>
        </div>
      </Card>

      {/* 阶段卡片 */}
      <div className="space-y-3">
        {STAGE_DEFS.map((def, idx) => {
          const state = stageState[def.key];
          const isActive = expandedStage === def.key;
          const enabled = canRunStage(idx);
          return (
            <Card key={def.key} className={state.done ? 'border-green-500/30' : ''}>
              <div className="flex items-center gap-3">
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                  state.done ? 'bg-green-500/15 text-green-400' : state.loading ? 'bg-sky-500/15 text-sky-400' : 'bg-slate-800 text-slate-500'
                }`}>
                  {state.done ? <Check size={16} /> : state.loading ? <Loader2 size={16} className="animate-spin" /> : <def.icon size={16} />}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-slate-200">{def.label}</span>
                    {state.done && <span className="text-[10px] bg-green-500/15 text-green-400 px-1.5 py-0.5 rounded">{t('status_done')}</span>}
                    {state.loading && <span className="text-[10px] bg-sky-500/15 text-sky-400 px-1.5 py-0.5 rounded">{t('status_generating')}</span>}
                    {state.error && <span className="text-[10px] bg-red-500/15 text-red-400 px-1.5 py-0.5 rounded">{t('status_failed')}</span>}
                  </div>
                  <div className="text-xs text-slate-500">{def.desc}</div>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    disabled={!enabled || state.loading || !topic.trim()}
                    onClick={() => runStage(idx)}
                  >
                    {state.loading ? (
                      <><Loader2 size={14} className="animate-spin mr-1" />{t('btn_generate')}</>
                    ) : state.done ? (
                      <><RotateCcw size={14} className="mr-1" />{t('btn_regenerate')}</>
                    ) : (
                      <><Play size={14} className="mr-1" />{t('btn_generate')}</>
                    )}
                  </Button>
                  <button
                    onClick={() => setExpandedStage(isActive ? null : def.key)}
                    className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-500 transition"
                  >
                    {isActive ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                  </button>
                </div>
              </div>

              {isActive && (
                <div className="mt-3 pt-3 border-t border-slate-700/40">
                  {state.error && (
                    <div className="mb-3 p-3 rounded-lg bg-red-500/10 border border-red-500/20">
                      <div className="text-xs text-red-300 font-medium mb-1">{t('generation_failed')}</div>
                      <div className="text-xs text-red-400 leading-relaxed">{state.error}</div>
                      {state.error?.includes('模型配置') && (
                        <button
                          onClick={() => navigate('/settings')}
                          className="mt-2 text-xs text-sky-400 hover:text-sky-300 underline"
                        >
                          {t('goto_model_settings')}
                        </button>
                      )}
                    </div>
                  )}
                  {state.text ? (
                    <div className="bg-slate-950/50 rounded-lg p-3 max-h-96 overflow-y-auto">
                      <pre className="text-xs text-slate-300 whitespace-pre-wrap font-mono leading-relaxed">{state.text}</pre>
                    </div>
                  ) : (
                    <div className="text-xs text-slate-600 italic">{t('click_generate_hint')}</div>
                  )}
                  {state.done && def.key === 'chapters' && (
                    <div className="mt-3 flex gap-2">
                      <Button size="sm" variant="primary" onClick={() => setExpandedStage('continue')}>
                        {t('btn_next_continue')} <ArrowRight size={14} className="ml-1" />
                      </Button>
                    </div>
                  )}
                </div>
              )}
            </Card>
          );
        })}
      </div>

      {workId && (
        <div className="p-3 bg-slate-900/40 border border-slate-700/40 rounded-lg">
          <div className="flex items-center justify-between">
            <div className="text-xs text-slate-400">
              {t('label_work_id')}: <span className="font-mono text-sky-400">{workId}</span>
            </div>
            <Button size="sm" variant="secondary" onClick={goToWork}>
              {t('btn_go_to_work')}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
