import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Play, Download, BookOpen, Users, GitBranch, Map, Sparkles, BarChart3, ClipboardCheck, FileText, Plus, ChevronDown, ChevronRight, AlignLeft, ListTree } from 'lucide-react';
import { Card, CardTitle, CardHeader } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Select } from '../components/ui/Select';
import { StreamOutput } from '../components/StreamOutput';
import { WorkCard } from '../components/WorkCard';
import { FitnessBars } from '../components/FitnessBars';
import { ReviewList } from '../components/ReviewList';
import { EmptyState, WorkEmptyState } from '../components/ui/EmptyState';
import { Tooltip } from '../components/ui/Tooltip';
import { useWork } from '../contexts/WorkContext';
import * as api from '../api/novel';
import { WorldLorePanel } from '../components/world/WorldLorePanel';
import MarkdownRenderer from '../components/MarkdownRenderer';
import { CharacterPanel } from '../components/world/CharacterPanel';
import { PlotLinePanel } from '../components/world/PlotLinePanel';
import { MapPanel } from '../components/world/MapPanel';
import { TemplatePanel } from '../components/world/TemplatePanel';

const TAB_GROUPS = [
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

export function WorksPage() {
  const { workId } = useParams();
  const navigate = useNavigate();
  const {
    works, currentWorkId, currentWorkData, loadingWorks, loadingWork,
    refreshWorks, selectWork, refreshCurrentWork,
  } = useWork();
  const [detailTab, setDetailTab] = useState('overview');
  const [targetVolume, setTargetVolume] = useState(1);
  const [continuing, setContinuing] = useState(false);
  const [streamText, setStreamText] = useState('');
  const [status, setStatus] = useState('');
  const [steps, setSteps] = useState([]);
  const [openSections, setOpenSections] = useState({ theme: true, outline: false, tree: true });
  const [expandedChapters, setExpandedChapters] = useState(new Set());
  const [expandedOutlineChapters, setExpandedOutlineChapters] = useState(new Set());

  useEffect(() => { refreshWorks(); }, [refreshWorks]);
  useEffect(() => { if (workId && workId !== currentWorkId) selectWork(workId); }, [workId, currentWorkId, selectWork]);
  useEffect(() => { if (currentWorkData?.currentVolume) setTargetVolume(currentWorkData.currentVolume); }, [currentWorkData]);

  const handleSelect = (id) => navigate(`/works/${id}`);
  const handleBack = () => navigate('/works');

  const handleContinue = async () => {
    if (!currentWorkId) return;
    setStreamText('');
    setStatus('正在续写下一章...');
    setContinuing(true);
    setSteps([]);
    const controller = new AbortController();
    try {
      const tv = currentWorkData?.volumes?.length ? targetVolume : undefined;
      await api.continueNovel({ workId: currentWorkId, targetVolume: tv }, (chunk) => setStreamText((t) => t + chunk), controller.signal, (ev) => {
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
      setStatus('续写完成');
      await refreshCurrentWork();
    } catch (e) {
      if (e.name !== 'AbortError') setStatus('错误: ' + e.message);
    } finally {
      setContinuing(false);
    }
  };

  const handleExport = async () => {
    if (!currentWorkId) return;
    const blob = new Blob([currentWorkData?.fullText || ''], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${currentWorkId}_full.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const toggleSection = (key) => setOpenSections(prev => ({ ...prev, [key]: !prev[key] }));

  const toggleChapter = (num) => {
    setExpandedChapters(prev => {
      const next = new Set(prev);
      if (next.has(num)) next.delete(num); else next.add(num);
      return next;
    });
  };

  const toggleOutlineChapter = (idx) => {
    setExpandedOutlineChapters(prev => {
      const next = new Set(prev);
      if (next.has(idx)) next.delete(idx); else next.add(idx);
      return next;
    });
  };

  // 从详细大纲文本解析章节结构
  const parseOutlineTree = (text) => {
    if (!text) return [];
    const lines = text.split('\n');
    const chapters = [];
    let current = null;
    for (const line of lines) {
      const match = line.match(/^###\s*\*{0,2}\s*第[一二三四五六七八九十百零\d]+章[：:]\s*(.*?)\s*\*{0,2}\s*$/);
      if (match) {
        if (current) chapters.push(current);
        current = { title: match[1].trim(), content: [] };
      } else if (current && line.trim()) {
        current.content.push(line);
      }
    }
    if (current) chapters.push(current);
    return chapters;
  };

  // 作品列表页
  if (!workId) {
    return (
      <div className="space-y-4">
        <Card gradient className="!p-0">
          <CardHeader className="!mx-0 !mt-0 !mb-0 px-5 pt-5 pb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-violet-500/10 border border-violet-500/20 flex items-center justify-center">
                <BookOpen size={20} className="text-violet-400" />
              </div>
              <div>
                <CardTitle className="!text-slate-100">我的作品</CardTitle>
                <p className="text-xs text-slate-500 mt-0.5">点击作品查看详情、续写或管理</p>
              </div>
            </div>
            <Button size="sm" variant="ghost" onClick={refreshWorks}>刷新</Button>
          </CardHeader>
          <div className="px-5 pb-5">
            {loadingWorks && (
              <div className="flex items-center gap-2 text-slate-400 text-sm py-8 justify-center">
                <span className="inline-block w-4 h-4 border-2 border-slate-600 border-t-sky-400 rounded-full animate-spin" />
                加载中...
              </div>
            )}
            {!loadingWorks && works.length > 0 && (
              <div className="grid grid-cols-1 gap-3">
                {works.map((w) => (
                  <WorkCard key={w.workId} work={w} onClick={() => handleSelect(w.workId)} />
                ))}
              </div>
            )}
            {!loadingWorks && !works.length && (
              <WorkEmptyState onCreate={() => navigate('/create')} />
            )}
          </div>
        </Card>
      </div>
    );
  }

  const info = currentWorkData;
  const hasVolumes = info?.volumes && info.volumes.length > 0;
  const title = info?.topic ? info.topic.split('\n')[0].trim() : '未命名作品';
  const totalChars = info?.chapters?.reduce((sum, ch) => sum + (ch.chars || 0), 0) || 0;
  const outlineChapters = parseOutlineTree(info?.outlineDetailed || '');

  return (
    <div className="space-y-4">
      <Card gradient className="!p-0">
        {/* 头部信息 */}
        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 p-5">
          <div className="min-w-0">
            <div className="flex items-center gap-2 text-xs text-slate-500 mb-1.5">
              <button onClick={handleBack} className="flex items-center gap-1 hover:text-sky-400 transition">
                <ArrowLeft size={12} /> 返回列表
              </button>
              <span>/</span>
              <span>作品详情</span>
            </div>
            <h2 className="text-xl font-bold text-slate-50 truncate mb-2">{title}</h2>
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="default">{info?.style || '默认风格'}</Badge>
              <Badge variant="info">{info?.chapters?.length || 0} 章</Badge>
              <Badge variant="success">{Math.round(totalChars / 1000)}K 字</Badge>
              {info?.writingMode === 'free' && <Badge variant="purple">自由风</Badge>}
              {hasVolumes && (
                <Select value={targetVolume} onChange={(e) => setTargetVolume(parseInt(e.target.value, 10))} className="w-auto text-xs py-1 px-2 h-7">
                  {info.volumes.map((v) => (
                    <option key={v.number} value={v.number}>第{v.number}卷{v.title ? ` · ${v.title}` : ''}</option>
                  ))}
                </Select>
              )}
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="primary" size="sm" onClick={handleContinue} disabled={continuing}>
              <Play size={14} />
              {continuing ? '续写中...' : '续写下一章'}
            </Button>
            <Button variant="accent" size="sm" onClick={handleExport}>
              <Download size={14} />
              导出
            </Button>
          </div>
        </div>

        {status && <div className="text-sm text-slate-400 px-5 pb-2">{status}</div>}

        {/* 步骤进度 */}
        {steps.length > 0 && (
          <div className="px-5 pb-3">
            <div className="text-xs text-slate-500 font-medium mb-1.5">创作流程</div>
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

        {streamText && <div className="px-5 pb-3"><StreamOutput text={streamText} /></div>}

        {/* Tab 导航 — 分组 */}
        <div className="mt-2">
          <div className="flex flex-wrap gap-1 border-b border-slate-700/60 pb-0 px-5">
            {TAB_GROUPS.map((group) => (
              <div key={group.label} className="flex items-center">
                <span className={`text-[10px] font-semibold text-${group.color}-500/70 uppercase tracking-wider mr-1.5 hidden lg:block`}>{group.label}</span>
                {group.tabs.map((t) => {
                  const isActive = detailTab === t.key;
                  const Icon = t.icon;
                  return (
                    <button
                      key={t.key}
                      onClick={() => setDetailTab(t.key)}
                      className={`flex items-center gap-1.5 text-sm px-3.5 py-2.5 rounded-t-lg transition relative ${
                        isActive
                          ? `text-${group.color}-400 font-medium`
                          : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
                      }`}
                    >
                      <Icon size={13} />
                      {t.label}
                      {isActive && (
                        <span className={`absolute bottom-0 left-2 right-2 h-[2px] bg-${group.color}-400 rounded-t`} />
                      )}
                    </button>
                  );
                })}
                <div className="w-px h-5 bg-slate-800 mx-1 last:hidden" />
              </div>
            ))}
          </div>

          <div className="p-5 min-h-[200px]">
            {detailTab === 'overview' && (
              <div className="space-y-4">
                {/* 统计卡片 */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  <div className="bg-slate-900/40 border border-slate-700/30 rounded-xl p-4">
                    <div className="text-xs text-slate-500 mb-1">总章节</div>
                    <div className="text-2xl font-bold text-sky-400">{info?.chapters?.length || 0}</div>
                  </div>
                  <div className="bg-slate-900/40 border border-slate-700/30 rounded-xl p-4">
                    <div className="text-xs text-slate-500 mb-1">总字数</div>
                    <div className="text-2xl font-bold text-emerald-400">{Math.round(totalChars / 1000)}K</div>
                  </div>
                  <div className="bg-slate-900/40 border border-slate-700/30 rounded-xl p-4">
                    <div className="text-xs text-slate-500 mb-1">风格</div>
                    <div className="text-lg font-bold text-slate-200 truncate">{info?.style || '默认'}</div>
                  </div>
                  <div className="bg-slate-900/40 border border-slate-700/30 rounded-xl p-4">
                    <div className="text-xs text-slate-500 mb-1">写作模式</div>
                    <div className="text-lg font-bold text-slate-200">{info?.writingMode === 'free' ? '自由风' : '工业风'}</div>
                  </div>
                </div>
                {/* 简介大纲 */}
                <div className="bg-slate-900/30 border border-slate-800/50 rounded-xl overflow-hidden">
                  <button onClick={() => toggleSection('theme')} className="w-full flex items-center justify-between px-4 py-3 hover:bg-slate-800/30 transition">
                    <div className="flex items-center gap-2">
                      <AlignLeft size={14} className="text-sky-400" />
                      <span className="text-sm font-medium text-slate-200">简介大纲</span>
                    </div>
                    {openSections.theme ? <ChevronDown size={14} className="text-slate-500" /> : <ChevronRight size={14} className="text-slate-500" />}
                  </button>
                  {openSections.theme && (
                    <div className="px-4 pb-4">
                      <div className="text-sm text-slate-300 leading-relaxed max-h-[400px] overflow-y-auto">
                        <MarkdownRenderer text={info?.outlineTheme || '暂无简介大纲'} />
                      </div>
                    </div>
                  )}
                </div>

                {/* 详细纲章 */}
                <div className="bg-slate-900/30 border border-slate-800/50 rounded-xl overflow-hidden">
                  <button onClick={() => toggleSection('outline')} className="w-full flex items-center justify-between px-4 py-3 hover:bg-slate-800/30 transition">
                    <div className="flex items-center gap-2">
                      <ListTree size={14} className="text-violet-400" />
                      <span className="text-sm font-medium text-slate-200">详细纲章</span>
                      {outlineChapters.length > 0 && (
                        <span className="text-[10px] text-slate-500 bg-slate-800/60 px-1.5 py-0.5 rounded">{outlineChapters.length} 章</span>
                      )}
                    </div>
                    {openSections.outline ? <ChevronDown size={14} className="text-slate-500" /> : <ChevronRight size={14} className="text-slate-500" />}
                  </button>
                  {openSections.outline && (
                    <div className="px-4 pb-4 space-y-1">
                      {outlineChapters.length === 0 ? (
                        <div className="text-sm text-slate-500 py-2">暂无详细纲章</div>
                      ) : (
                        outlineChapters.map((ch, idx) => {
                          const isOpen = expandedOutlineChapters.has(idx);
                          return (
                            <div key={idx} className="border border-slate-800/40 rounded-lg overflow-hidden">
                              <button onClick={() => toggleOutlineChapter(idx)} className="w-full flex items-center gap-2 px-3 py-2 hover:bg-slate-800/30 transition text-left">
                                {isOpen ? <ChevronDown size={12} className="text-slate-500 shrink-0" /> : <ChevronRight size={12} className="text-slate-500 shrink-0" />}
                                <span className="text-xs text-slate-400 shrink-0">第{idx + 1}章</span>
                                <span className="text-sm text-slate-200 truncate">{ch.title}</span>
                              </button>
                              {isOpen && (
                                <div className="px-3 pb-3 pl-8">
                                  <div className="text-xs text-slate-400 leading-relaxed"><MarkdownRenderer text={ch.content.join('\n')} /></div>
                                </div>
                              )}
                            </div>
                          );
                        })
                      )}
                    </div>
                  )}
                </div>

                {/* 章节内容树 */}
                <div className="bg-slate-900/30 border border-slate-800/50 rounded-xl overflow-hidden">
                  <button onClick={() => toggleSection('tree')} className="w-full flex items-center justify-between px-4 py-3 hover:bg-slate-800/30 transition">
                    <div className="flex items-center gap-2">
                      <GitBranch size={14} className="text-emerald-400" />
                      <span className="text-sm font-medium text-slate-200">章节内容</span>
                      {info?.chapters?.length > 0 && (
                        <span className="text-[10px] text-slate-500 bg-slate-800/60 px-1.5 py-0.5 rounded">{info.chapters.length} 章</span>
                      )}
                    </div>
                    {openSections.tree ? <ChevronDown size={14} className="text-slate-500" /> : <ChevronRight size={14} className="text-slate-500" />}
                  </button>
                  {openSections.tree && (
                    <div className="px-4 pb-4 space-y-1">
                      {(!info?.chapters || info.chapters.length === 0) ? (
                        <div className="text-sm text-slate-500 py-2">暂无章节</div>
                      ) : hasVolumes ? (
                        // 多卷结构：按卷分组
                        info.volumes.map((vol) => (
                          <div key={vol.number} className="border border-slate-800/40 rounded-lg overflow-hidden">
                            <div className="px-3 py-2 bg-slate-800/30 text-sm font-medium text-slate-200">
                              第{vol.number}卷{vol.title ? ` · ${vol.title}` : ''}
                            </div>
                            <div className="px-2 pb-2 space-y-0.5">
                              {(info.chapters || []).filter(ch => ch.volume === vol.number || (!ch.volume && vol.number === 1)).map((ch) => {
                                const isOpen = expandedChapters.has(ch.number);
                                const text = info.chapterTexts?.[ch.number] || '';
                                return (
                                  <div key={ch.number}>
                                    <button onClick={() => toggleChapter(ch.number)} className="w-full flex items-center gap-2 px-2 py-1.5 hover:bg-slate-800/30 transition rounded text-left">
                                      {isOpen ? <ChevronDown size={12} className="text-slate-500 shrink-0" /> : <ChevronRight size={12} className="text-slate-500 shrink-0" />}
                                      <span className="text-xs text-slate-400 shrink-0">第{ch.number}章</span>
                                      <span className="text-sm text-slate-200 truncate">{ch.title || '未命名章节'}</span>
                                      <span className="text-[10px] text-slate-600 ml-auto shrink-0">{ch.chars || 0} 字</span>
                                    </button>
                                    {isOpen && text && (
                                      <div className="px-2 pb-2 pl-7">
                                        <div className="text-xs text-slate-400 leading-relaxed max-h-[300px] overflow-y-auto bg-slate-950/30 rounded p-2 border border-slate-800/30">
                                          <MarkdownRenderer text={text} />
                                        </div>
                                      </div>
                                    )}
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        ))
                      ) : (
                        // 单卷平铺
                        info.chapters.map((ch) => {
                          const isOpen = expandedChapters.has(ch.number);
                          const text = info.chapterTexts?.[ch.number] || '';
                          return (
                            <div key={ch.number} className="border border-slate-800/40 rounded-lg overflow-hidden">
                              <button onClick={() => toggleChapter(ch.number)} className="w-full flex items-center gap-2 px-3 py-2 hover:bg-slate-800/30 transition text-left">
                                {isOpen ? <ChevronDown size={12} className="text-slate-500 shrink-0" /> : <ChevronRight size={12} className="text-slate-500 shrink-0" />}
                                <span className="text-xs text-slate-400 shrink-0">第{ch.number}章</span>
                                <span className="text-sm text-slate-200 truncate">{ch.title || '未命名章节'}</span>
                                <span className="text-[10px] text-slate-600 ml-auto shrink-0">{ch.chars || 0} 字</span>
                              </button>
                              {isOpen && text && (
                                <div className="px-3 pb-3 pl-8">
                                  <div className="text-xs text-slate-400 leading-relaxed max-h-[300px] overflow-y-auto bg-slate-950/30 rounded p-2 border border-slate-800/30">
                                    <MarkdownRenderer text={text} />
                                  </div>
                                </div>
                              )}
                            </div>
                          );
                        })
                      )}
                    </div>
                  )}
                </div>

                {/* 内容预览 */}
                <div className="bg-slate-900/30 border border-slate-800/50 rounded-xl p-4">
                  <div className="text-xs text-slate-500 mb-2">正文预览</div>
                  <div className="text-sm text-slate-300 leading-relaxed max-h-[400px] overflow-y-auto">
                    <MarkdownRenderer text={(info?.fullText || '').substring(0, 3000) + ((info?.fullText?.length || 0) > 3000 ? '\n\n... (内容过长已截断，请导出查看完整内容) ...' : '')} />
                  </div>
                </div>
              </div>
            )}
            {detailTab === 'fitness' && (
              <FitnessBars records={info?.fitnessRecords || {}} chapters={info?.chapters || []} />
            )}
            {detailTab === 'reviews' && (
              <ReviewList records={info?.reviewRecords || {}} />
            )}
            {detailTab === 'world' && <WorldLorePanel workId={workId} />}
            {detailTab === 'characters' && <CharacterPanel workId={workId} />}
            {detailTab === 'plot' && <PlotLinePanel workId={workId} />}
            {detailTab === 'map' && <MapPanel workId={workId} />}
            {detailTab === 'templates' && <TemplatePanel workId={workId} />}
          </div>
        </div>
      </Card>
    </div>
  );
}
