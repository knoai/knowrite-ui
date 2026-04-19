import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { BookOpen, Plus, Zap, Target, Rocket, ArrowRight, ArrowLeft, Factory, Palette, Sparkles, Layers, FileText, ChevronDown, ChevronUp } from 'lucide-react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input, Textarea } from '../components/ui/Input';
import { Stepper } from '../components/ui/Stepper';
import { EmptyState } from '../components/ui/EmptyState';
import { useWork } from '../contexts/WorkContext';
import { useToast } from '../components/ui/Toast';
import * as api from '../api/novel';

const STEPS = ['写下想法', '选择风格', '开始创作'];

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

export function CreatePage() {
  const navigate = useNavigate();
  const { refreshWorks } = useWork();
  const { addToast } = useToast();
  const [step, setStep] = useState(0);

  // Step 1
  const [topic, setTopic] = useState('');

  // Step 2
  const [platformStyle, setPlatformStyle] = useState('番茄');
  const [authorStyle, setAuthorStyle] = useState('热血磅礴');
  const [strategy, setStrategy] = useState('pipeline');
  const [writingMode, setWritingMode] = useState('industrial');
  const [platformStyles, setPlatformStyles] = useState([]);
  const [authorStyles, setAuthorStyles] = useState([]);

  // Step 3
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [modelOutline, setModelOutline] = useState('');
  const [modelChapter, setModelChapter] = useState('');
  const [modelPolish, setModelPolish] = useState('');

  // Import
  const [tab, setTab] = useState('create');
  const [importTitle, setImportTitle] = useState('');
  const [importContent, setImportContent] = useState('');
  const [importing, setImporting] = useState(false);

  // Start
  const [starting, setStarting] = useState(false);
  const [streamText, setStreamText] = useState('');
  const [status, setStatus] = useState('');
  const [steps, setSteps] = useState([]);

  useEffect(() => {
    refreshWorks();
    api.getPlatformStyles().then(d => setPlatformStyles(d.platformStyles || [])).catch(() => {});
    api.getAuthorStyles().then(d => setAuthorStyles(d.authorStyles || [])).catch(() => {});
    api.getWritingMode().then(d => setWritingMode(d.writingMode || 'industrial')).catch(() => {});
  }, [refreshWorks]);

  const handleStart = async () => {
    if (!topic.trim()) { addToast('请先输入小说主题', 'error'); return; }
    setStreamText(''); setStatus(''); setStarting(true); setSteps([]);
    const controller = new AbortController();
    try {
      await api.startNovel({
        topic: topic.trim(), platformStyle, authorStyle, strategy, writingMode,
        customModels: { outline: modelOutline || undefined, chapter: modelChapter || undefined, polish: modelPolish || undefined }
      }, (chunk) => setStreamText(t => t + chunk), controller.signal, (ev) => {
        if (ev.type === 'stepStart') {
          setSteps(prev => {
            const exists = prev.find(s => s.step === ev.step);
            if (exists) return prev.map(s => s.step === ev.step ? { ...s, name: ev.name, model: ev.model, status: 'running' } : s);
            return [...prev, { step: ev.step, name: ev.name, model: ev.model, status: 'running' }];
          });
        }
        if (ev.type === 'stepEnd') {
          setSteps(prev => prev.map(s => s.step === ev.step ? { ...s, status: 'done' } : s));
        }
      });
      addToast('创作完成！', 'success');
      await refreshWorks();
    } catch (e) {
      if (e.name !== 'AbortError') {
        addToast('创作失败: ' + e.message, 'error');
        setStatus('错误: ' + e.message);
      }
    } finally {
      setStarting(false);
    }
  };

  const handleImport = async () => {
    if (!importTitle.trim() || !importContent.trim()) { addToast('请填写标题和正文', 'error'); return; }
    setImporting(true);
    try {
      await api.importNovel({ title: importTitle.trim(), content: importContent.trim(), platformStyle, authorStyle });
      addToast('导入成功！', 'success');
      await refreshWorks();
      setImportTitle(''); setImportContent('');
    } catch (e) {
      addToast('导入失败: ' + e.message, 'error');
    } finally {
      setImporting(false);
    }
  };

  const platformDesc = platformStyles.find(s => s.name === platformStyle)?.description || '';
  const authorDesc = authorStyles.find(s => s.name === authorStyle)?.description || '';

  return (
    <div className="space-y-5">
      {/* Tab Switch */}
      <div className="flex gap-1 p-1 bg-slate-900/60 border border-slate-800/60 rounded-xl w-fit">
        <button
          onClick={() => setTab('create')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition ${tab === 'create' ? 'bg-sky-500 text-white shadow-lg shadow-sky-900/20' : 'text-slate-400 hover:text-slate-200'}`}
        >
          <Sparkles size={14} /> 创作新作品
        </button>
        <button
          onClick={() => setTab('import')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition ${tab === 'import' ? 'bg-sky-500 text-white shadow-lg shadow-sky-900/20' : 'text-slate-400 hover:text-slate-200'}`}
        >
          <FileText size={14} /> 导入已有作品
        </button>
      </div>

      {tab === 'create' ? (
        <Card className="!p-0 overflow-hidden">
          {/* Header */}
          <div className="px-6 pt-6 pb-4 border-b border-slate-800/60">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-sky-500/10 border border-sky-500/20 flex items-center justify-center">
                  <Sparkles size={20} className="text-sky-400" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-slate-100">开始新创作</h2>
                  <p className="text-xs text-slate-500">3步完成，AI 帮你把想法变成小说</p>
                </div>
              </div>
              <Stepper steps={STEPS} currentStep={step} />
            </div>
          </div>

          {/* Step 1: Topic */}
          {step === 0 && (
            <div className="p-6 space-y-5">
              <div>
                <label className="block text-sm font-medium text-slate-200 mb-2">今天想写什么故事？</label>
                <Textarea
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  placeholder="例如：一个失忆杀手在古代江湖寻找身世，却发现自己是被皇室追杀的皇子..."
                  className="!min-h-[140px] !text-base"
                />
              </div>
              <div>
                <label className="block text-xs text-slate-500 mb-2">没有灵感？试试这些：</label>
                <div className="flex flex-wrap gap-2">
                  {INSPIRATION_TAGS.map(tag => (
                    <button
                      key={tag}
                      onClick={() => setTopic(tag + '：')}
                      className="px-3 py-1.5 rounded-lg bg-slate-800/60 border border-slate-700/40 text-xs text-slate-400 hover:text-sky-400 hover:border-sky-500/30 hover:bg-sky-500/5 transition"
                    >
                      {tag}
                    </button>
                  ))}
                </div>
              </div>
              <div className="flex justify-end pt-2">
                <Button variant="primary" size="lg" onClick={() => topic.trim() && setStep(1)} disabled={!topic.trim()}>
                  下一步 <ArrowRight size={16} />
                </Button>
              </div>
            </div>
          )}

          {/* Step 2: Style Selection */}
          {step === 1 && (
            <div className="p-6 space-y-6 max-h-[65vh] overflow-y-auto">
              {/* Platform Style */}
              <div>
                <label className="block text-sm font-medium text-slate-200 mb-2">发布平台</label>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-2">
                  {platformStyles.map(s => (
                    <button
                      key={s.name}
                      onClick={() => setPlatformStyle(s.name)}
                      className={`p-3 rounded-xl border text-left transition-all ${
                        platformStyle === s.name
                          ? 'bg-sky-500/10 border-sky-500/40 text-sky-300'
                          : 'bg-slate-800/30 border-slate-700/40 text-slate-400 hover:border-slate-600 hover:text-slate-300'
                      }`}
                    >
                      <div className="font-medium text-sm">{s.name}</div>
                      <div className="text-[10px] text-slate-500 mt-0.5 line-clamp-2">{s.description?.slice(0, 30)}...</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Author Style */}
              <div>
                <label className="block text-sm font-medium text-slate-200 mb-2">作者风格</label>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
                  {authorStyles.map(s => (
                    <button
                      key={s.name}
                      onClick={() => setAuthorStyle(s.name)}
                      className={`p-3 rounded-xl border text-left transition-all ${
                        authorStyle === s.name
                          ? 'bg-violet-500/10 border-violet-500/40 text-violet-300'
                          : 'bg-slate-800/30 border-slate-700/40 text-slate-400 hover:border-slate-600 hover:text-slate-300'
                      }`}
                    >
                      <div className="font-medium text-sm">{s.name}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Strategy */}
              <div>
                <label className="block text-sm font-medium text-slate-200 mb-2">生成模式</label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {STRATEGY_CARDS.map(card => {
                    const Icon = card.icon;
                    const isActive = strategy === card.key;
                    return (
                      <button
                        key={card.key}
                        onClick={() => setStrategy(card.key)}
                        className={`flex items-center gap-4 p-4 rounded-xl border text-left transition-all ${
                          isActive
                            ? 'bg-sky-500/10 border-sky-500/40'
                            : 'bg-slate-800/30 border-slate-700/40 hover:border-slate-600'
                        }`}
                      >
                        <div className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ${isActive ? 'bg-sky-500/20' : 'bg-slate-700/40'}`}>
                          <Icon size={22} className={isActive ? 'text-sky-400' : 'text-slate-500'} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className={`font-medium text-sm ${isActive ? 'text-sky-300' : 'text-slate-300'}`}>{card.label}</div>
                          <div className="text-xs text-slate-500">{card.sub}</div>
                        </div>
                        <div className={`text-xs font-semibold px-2 py-1 rounded-md ${isActive ? 'bg-sky-500/20 text-sky-400' : 'bg-slate-700/40 text-slate-500'}`}>
                          {card.desc}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Writing Mode */}
              <div>
                <label className="block text-sm font-medium text-slate-200 mb-2">写作风格</label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {WRITING_MODE_CARDS.map(card => {
                    const Icon = card.icon;
                    const isActive = writingMode === card.key;
                    return (
                      <button
                        key={card.key}
                        onClick={() => setWritingMode(card.key)}
                        className={`flex items-center gap-4 p-4 rounded-xl border text-left transition-all ${
                          isActive
                            ? card.key === 'free' ? 'bg-violet-500/10 border-violet-500/40' : 'bg-slate-700/50 border-slate-500/40'
                            : 'bg-slate-800/30 border-slate-700/40 hover:border-slate-600'
                        }`}
                      >
                        <div className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ${isActive ? (card.key === 'free' ? 'bg-violet-500/20' : 'bg-slate-600/40') : 'bg-slate-700/40'}`}>
                          <Icon size={22} className={isActive ? (card.key === 'free' ? 'text-violet-400' : 'text-slate-300') : 'text-slate-500'} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className={`font-medium text-sm ${isActive ? (card.key === 'free' ? 'text-violet-300' : 'text-slate-200') : 'text-slate-300'}`}>{card.label}</div>
                          <div className="text-xs text-slate-500">{card.sub}</div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="flex justify-between pt-2">
                <Button variant="default" onClick={() => setStep(0)}>
                  <ArrowLeft size={16} /> 上一步
                </Button>
                <Button variant="primary" size="lg" onClick={() => setStep(2)}>
                  下一步 <ArrowRight size={16} />
                </Button>
              </div>
            </div>
          )}

          {/* Step 3: Confirm & Launch */}
          {step === 2 && (
            <div className="p-6 space-y-5">
              <div className="bg-slate-900/40 border border-slate-700/40 rounded-xl p-5 space-y-3">
                <h3 className="text-sm font-medium text-slate-300 mb-3">配置确认</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                  <div className="flex items-center gap-2">
                    <span className="text-slate-500 w-16 shrink-0">主题</span>
                    <span className="text-slate-200 truncate">{topic}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-slate-500 w-16 shrink-0">平台</span>
                    <span className="text-sky-400">{platformStyle}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-slate-500 w-16 shrink-0">风格</span>
                    <span className="text-violet-400">{authorStyle}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-slate-500 w-16 shrink-0">模式</span>
                    <span className={strategy === 'pipeline' ? 'text-amber-400' : 'text-sky-400'}>
                      {strategy === 'pipeline' ? '快速模式' : '精品模式'}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-slate-500 w-16 shrink-0">写作</span>
                    <span className={writingMode === 'free' ? 'text-violet-400' : 'text-slate-300'}>
                      {writingMode === 'free' ? '自由风' : '工业风'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Advanced Settings Toggle */}
              <div>
                <button
                  onClick={() => setShowAdvanced(!showAdvanced)}
                  className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-300 transition"
                >
                  {showAdvanced ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                  高级设置（模型配置）
                </button>
                {showAdvanced && (
                  <div className="mt-3 grid grid-cols-1 md:grid-cols-3 gap-3">
                    <div>
                      <div className="text-xs text-slate-500 mb-1">大纲模型</div>
                      <Input value={modelOutline} onChange={(e) => setModelOutline(e.target.value)} placeholder="输入模型名" />
                    </div>
                    <div>
                      <div className="text-xs text-slate-500 mb-1">正文模型</div>
                      <Input value={modelChapter} onChange={(e) => setModelChapter(e.target.value)} placeholder="输入模型名" />
                    </div>
                    <div>
                      <div className="text-xs text-slate-500 mb-1">润色模型</div>
                      <Input value={modelPolish} onChange={(e) => setModelPolish(e.target.value)} placeholder="输入模型名" />
                    </div>
                  </div>
                )}
              </div>

              <div className="flex justify-between pt-2">
                <Button variant="default" onClick={() => setStep(1)}>
                  <ArrowLeft size={16} /> 上一步
                </Button>
                <Button variant="primary" size="lg" onClick={handleStart} disabled={starting} className="!bg-sky-500 hover:!bg-sky-400 !text-white">
                  <Rocket size={18} />
                  {starting ? '创作中...' : '开始创作'}
                </Button>
              </div>

              {status && <div className="text-sm text-slate-400">{status}</div>}

              {/* 步骤进度 */}
              {steps.length > 0 && (
                <div className="mt-3 space-y-1.5">
                  <div className="text-xs text-slate-500 font-medium">创作流程</div>
                  <div className="flex flex-wrap gap-2">
                    {steps.map((s) => (
                      <div key={s.step} className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs border ${
                        s.status === 'running'
                          ? 'bg-sky-500/10 border-sky-500/30 text-sky-300'
                          : 'bg-slate-800/40 border-slate-700/40 text-slate-400'
                      }`}>
                        {s.status === 'done' ? (
                          <span className="w-4 h-4 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center text-[10px]">✓</span>
                        ) : (
                          <span className="inline-block w-3 h-3 border-2 border-sky-400 border-t-transparent rounded-full animate-spin" />
                        )}
                        <span>{s.name}</span>
                        {s.model && <span className="text-slate-500">[{s.model}]</span>}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {streamText && (
                <div className="mt-3 p-4 rounded-xl bg-slate-900/60 border border-slate-800/60 max-h-[300px] overflow-y-auto">
                  <div className="text-xs text-slate-500 mb-2">AI 正在创作中...</div>
                  <pre className="text-xs text-slate-300 whitespace-pre-wrap">{streamText}</pre>
                </div>
              )}
            </div>
          )}
        </Card>
      ) : (
        /* Import Tab */
        <Card>
          <div className="flex items-center gap-3 mb-5">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center">
              <FileText size={20} className="text-amber-400" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-100">导入已有作品</h2>
              <p className="text-xs text-slate-500">粘贴小说正文，系统自动按章节切分</p>
            </div>
          </div>
          <div className="space-y-4">
            <div>
              <label className="block text-sm text-slate-300 mb-1.5">小说标题</label>
              <Input value={importTitle} onChange={(e) => setImportTitle(e.target.value)} placeholder="例如：斗破苍穹" />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-sm text-slate-300 mb-1.5">平台风格</label>
                <select value={platformStyle} onChange={(e) => setPlatformStyle(e.target.value)} className="w-full px-3 py-2 rounded-lg border border-slate-600 bg-slate-900/60 text-slate-50 text-sm">
                  {platformStyles.map(s => <option key={s.name} value={s.name}>{s.name}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm text-slate-300 mb-1.5">作者风格</label>
                <select value={authorStyle} onChange={(e) => setAuthorStyle(e.target.value)} className="w-full px-3 py-2 rounded-lg border border-slate-600 bg-slate-900/60 text-slate-50 text-sm">
                  {authorStyles.map(s => <option key={s.name} value={s.name}>{s.name}</option>)}
                </select>
              </div>
            </div>
            <div>
              <label className="block text-sm text-slate-300 mb-1.5">完整正文</label>
              <Textarea value={importContent} onChange={(e) => setImportContent(e.target.value)} placeholder="粘贴小说完整正文，系统会自动按章节切分..." />
            </div>
            <Button variant="accent" onClick={handleImport} disabled={importing}>
              <FileText size={14} /> {importing ? '导入中...' : '导入小说'}
            </Button>
          </div>
        </Card>
      )}
    </div>
  );
}
