import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Play, Download, BookOpen, Users, GitBranch, Map, Sparkles, BarChart3, ClipboardCheck, FileText, Plus } from 'lucide-react';
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
                {/* 内容预览 */}
                <div className="bg-slate-900/30 border border-slate-800/50 rounded-xl p-4">
                  <div className="text-xs text-slate-500 mb-2">正文预览</div>
                  <div className="text-sm text-slate-300 whitespace-pre-wrap leading-relaxed max-h-[400px] overflow-y-auto">
                    {(info?.fullText || '').substring(0, 3000)}
                    {(info?.fullText?.length || 0) > 3000 ? '\n\n... (内容过长已截断，请导出查看完整内容) ...' : ''}
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
