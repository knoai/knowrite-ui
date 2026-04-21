import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Activity, Clock, Cpu, FileText, TrendingUp, Search, RefreshCw } from 'lucide-react';
import { Card, CardTitle } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { useI18n } from '../contexts/I18nContext';
import * as api from '../api/novel';

function formatDuration(ms) {
  if (ms < 1000) return `${ms}ms`;
  return `${(ms / 1000).toFixed(1)}s`;
}

function formatDate(iso) {
  const d = new Date(iso);
  return d.toLocaleString('zh-CN', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit', second: '2-digit' });
}

export function TraceDashboardPage() {
  const { t } = useI18n();
  const [searchParams, setSearchParams] = useSearchParams();
  const [workId, setWorkId] = useState(searchParams.get('workId') || '');
  const [works, setWorks] = useState([]);
  const [stats, setStats] = useState(null);
  const [timeline, setTimeline] = useState([]);
  const [traces, setTraces] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('stats');
  const [selectedAgent, setSelectedAgent] = useState('');

  const AGENT_LABELS = {
    writer: t('agent_writer'),
    editor: t('agent_editor'),
    humanizer: t('agent_humanizer'),
    proofreader: t('agent_proofreader'),
    polish: t('agent_polish'),
    reader: t('agent_reader'),
    summarizer: t('agent_summarizer'),
    planner: t('agent_planner'),
    context: t('agent_context'),
    deviation: t('agent_deviation'),
    outline: t('agent_outline'),
    unknown: t('agent_unknown'),
  };

  useEffect(() => {
    api.getWorks().then((data) => {
      setWorks(data.works || []);
    }).catch(() => {});
  }, []);

  useEffect(() => {
    const w = searchParams.get('workId');
    if (w) {
      setWorkId(w);
      loadData(w);
    }
  }, [searchParams]);

  const loadData = async (wid) => {
    if (!wid) return;
    setLoading(true);
    setError('');
    try {
      const [statsRes, timelineRes, tracesRes] = await Promise.all([
        api.getTraceStats(wid),
        api.getTraceTimeline(wid),
        api.getTraces(wid, { limit: 100 }),
      ]);
      setStats(statsRes.stats || {});
      setTimeline(timelineRes.timeline || []);
      setTraces(tracesRes);
    } catch (e) {
      setError(e.message || t('load_failed'));
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    if (!workId) return;
    setSearchParams({ workId });
    loadData(workId);
  };

  const totalCalls = stats ? Object.values(stats).reduce((sum, s) => sum + (s.count || 0), 0) : 0;
  const totalDuration = stats ? Object.values(stats).reduce((sum, s) => sum + (s.totalDurationMs || 0), 0) : 0;
  const totalChars = stats ? Object.values(stats).reduce((sum, s) => sum + (s.totalChars || 0), 0) : 0;

  return (
    <div className="max-w-5xl mx-auto space-y-5">
      <div className="flex items-center gap-3">
        <Activity size={22} className="text-sky-400" />
        <h1 className="text-xl font-bold text-slate-100">{t('trace_dashboard_title')}</h1>
      </div>

      <Card>
        <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-end">
          <div className="flex-1 w-full">
            <label className="block text-xs text-slate-500 mb-1">{t('label_work')}</label>
            <select
              value={workId}
              onChange={(e) => setWorkId(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 text-slate-200 text-sm rounded-lg px-3 py-2"
            >
              <option value="">{t('option_select_work')}</option>
              {works.map((w) => (
                <option key={w.workId} value={w.workId}>{w.title || w.topic || w.workId}</option>
              ))}
            </select>
          </div>
          <div className="flex-1 w-full">
            <label className="block text-xs text-slate-500 mb-1">{t('label_or_enter_workid')}</label>
            <Input
              value={workId}
              onChange={(e) => setWorkId(e.target.value)}
              placeholder={t('placeholder_workid')}
            />
          </div>
          <Button onClick={handleSearch} disabled={loading || !workId}>
            <Search size={15} className="mr-1.5" />
            {loading ? t('status_loading') : t('btn_query')}
          </Button>
          <Button variant="secondary" onClick={() => workId && loadData(workId)} disabled={loading || !workId}>
            <RefreshCw size={15} className="mr-1.5" />
            {t('btn_refresh')}
          </Button>
        </div>
      </Card>

      {error && (
        <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-sm text-red-400">
          {error}
        </div>
      )}

      {workId && !loading && stats && (
        <>
          {/* 概览卡片 */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Card className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-sky-500/10 flex items-center justify-center">
                <Cpu size={18} className="text-sky-400" />
              </div>
              <div>
                <div className="text-2xl font-bold text-slate-100">{totalCalls}</div>
                <div className="text-xs text-slate-500">{t('label_total_calls')}</div>
              </div>
            </Card>
            <Card className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                <Clock size={18} className="text-emerald-400" />
              </div>
              <div>
                <div className="text-2xl font-bold text-slate-100">{formatDuration(totalDuration)}</div>
                <div className="text-xs text-slate-500">{t('label_total_duration')}</div>
              </div>
            </Card>
            <Card className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-amber-500/10 flex items-center justify-center">
                <FileText size={18} className="text-amber-400" />
              </div>
              <div>
                <div className="text-2xl font-bold text-slate-100">{totalChars.toLocaleString()}</div>
                <div className="text-xs text-slate-500">{t('label_total_chars')}</div>
              </div>
            </Card>
          </div>

          {/* Tab 切换 */}
          <div className="flex gap-1 bg-slate-900/60 p-1 rounded-lg border border-slate-700/40 w-fit">
            {[
              { key: 'stats', label: t('tab_agent_stats') },
              { key: 'timeline', label: t('tab_timeline') },
              { key: 'traces', label: t('tab_traces') },
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`px-3 py-1.5 text-xs rounded-md transition-colors ${
                  activeTab === tab.key ? 'bg-sky-500/15 text-sky-400 font-medium' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Agent 统计 */}
          {activeTab === 'stats' && (
            <Card>
              <CardTitle className="mb-3">{t('card_agent_stats_title')}</CardTitle>
              <div className="overflow-x-auto">
                <table className="min-w-full text-sm border border-slate-700/40 rounded-lg">
                  <thead className="bg-slate-900/60 text-slate-300">
                    <tr>
                      <th className="text-left px-3 py-2 font-medium">{t('col_agent')}</th>
                      <th className="text-right px-3 py-2 font-medium">{t('col_call_count')}</th>
                      <th className="text-right px-3 py-2 font-medium">{t('col_total_chars')}</th>
                      <th className="text-right px-3 py-2 font-medium">{t('col_total_duration')}</th>
                      <th className="text-right px-3 py-2 font-medium">{t('col_avg_duration')}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-700/40">
                    {Object.entries(stats).sort((a, b) => (b[1].count || 0) - (a[1].count || 0)).map(([agent, s]) => (
                      <tr key={agent} className="bg-slate-900/20 hover:bg-slate-800/30">
                        <td className="px-3 py-2 text-slate-200 text-xs">{AGENT_LABELS[agent] || agent}</td>
                        <td className="px-3 py-2 text-right text-slate-300 text-xs">{s.count}</td>
                        <td className="px-3 py-2 text-right text-slate-300 text-xs">{(s.totalChars || 0).toLocaleString()}</td>
                        <td className="px-3 py-2 text-right text-slate-300 text-xs">{formatDuration(s.totalDurationMs || 0)}</td>
                        <td className="px-3 py-2 text-right text-slate-300 text-xs">{formatDuration(s.avgDurationMs || 0)}</td>
                      </tr>
                    ))}
                    {Object.keys(stats).length === 0 && (
                      <tr>
                        <td colSpan={5} className="px-3 py-6 text-xs text-slate-500 text-center">{t('no_trace_data')}</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </Card>
          )}

          {/* 调用时间线 */}
          {activeTab === 'timeline' && (
            <Card>
              <CardTitle className="mb-3">{t('card_timeline_title')}</CardTitle>
              <div className="space-y-2 max-h-[600px] overflow-auto pr-1">
                {timeline.map((item, idx) => (
                  <div key={idx} className="flex items-start gap-3 p-3 bg-slate-900/40 border border-slate-700/30 rounded-lg">
                    <div className="w-7 h-7 rounded-full bg-sky-500/10 flex items-center justify-center shrink-0 text-xs font-mono text-sky-400">
                      {item.step}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-xs font-medium text-slate-200">{AGENT_LABELS[item.agentType] || item.agentType}</span>
                        <span className="text-[10px] text-slate-500">{item.model}</span>
                        <span className="text-[10px] px-1.5 py-0.5 bg-slate-800 rounded text-slate-400">{item.provider}</span>
                      </div>
                      <div className="flex items-center gap-3 mt-1 text-[10px] text-slate-500">
                        <span className="flex items-center gap-1"><Clock size={10} /> {formatDuration(item.durationMs)}</span>
                        <span className="flex items-center gap-1"><FileText size={10} /> {(item.chars || 0).toLocaleString()} {t('unit_chars')}</span>
                        <span>{formatDate(item.timestamp)}</span>
                      </div>
                      {item.promptTemplate && item.promptTemplate !== 'unknown' && (
                        <div className="mt-1 text-[10px] text-slate-600">{t('label_template')}: {item.promptTemplate}</div>
                      )}
                    </div>
                  </div>
                ))}
                {timeline.length === 0 && (
                  <div className="text-xs text-slate-500 text-center py-6">{t('no_timeline_data')}</div>
                )}
              </div>
            </Card>
          )}

          {/* 详细记录 */}
          {activeTab === 'traces' && (
            <Card>
              <div className="flex items-center justify-between mb-3">
                <CardTitle>{t('card_traces_title')}</CardTitle>
                <select
                  value={selectedAgent}
                  onChange={(e) => setSelectedAgent(e.target.value)}
                  className="bg-slate-900 border border-slate-700 text-slate-200 text-xs rounded px-2 py-1"
                >
                  <option value="">{t('option_all_agents')}</option>
                  {Object.keys(stats).map((a) => (
                    <option key={a} value={a}>{AGENT_LABELS[a] || a}</option>
                  ))}
                </select>
              </div>
              <div className="space-y-2 max-h-[600px] overflow-auto pr-1">
                {(traces?.data || [])
                  .filter((trace) => !selectedAgent || trace.agentType === selectedAgent)
                  .map((trace, idx) => (
                    <div key={idx} className="p-3 bg-slate-900/40 border border-slate-700/30 rounded-lg space-y-2">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-xs font-medium text-slate-200">{AGENT_LABELS[trace.agentType] || trace.agentType}</span>
                        <span className="text-[10px] text-slate-500">{trace.model}</span>
                        <span className="text-[10px] px-1.5 py-0.5 bg-slate-800 rounded text-slate-400">{trace.provider}</span>
                        <span className="text-[10px] text-slate-500 ml-auto">{formatDate(trace.timestamp)}</span>
                      </div>
                      <div className="text-[10px] text-slate-500 flex gap-3">
                        <span>⏱ {formatDuration(trace.durationMs)}</span>
                        <span>📝 {(trace.chars || 0).toLocaleString()} {t('unit_chars')}</span>
                        <span>🌡 {trace.temperature}</span>
                      </div>
                      {trace.inputPreview && (
                        <div className="text-[10px] text-slate-600 bg-slate-900/60 p-2 rounded border border-slate-700/20">
                          <div className="text-slate-500 mb-0.5">Input Preview:</div>
                          <div className="truncate">{trace.inputPreview}</div>
                        </div>
                      )}
                      {trace.outputPreview && (
                        <div className="text-[10px] text-slate-600 bg-slate-900/60 p-2 rounded border border-slate-700/20">
                          <div className="text-slate-500 mb-0.5">Output Preview:</div>
                          <div className="truncate">{trace.outputPreview}</div>
                        </div>
                      )}
                    </div>
                  ))}
                {(traces?.data || []).filter((trace) => !selectedAgent || trace.agentType === selectedAgent).length === 0 && (
                  <div className="text-xs text-slate-500 text-center py-6">{t('no_trace_detail')}</div>
                )}
              </div>
            </Card>
          )}
        </>
      )}
    </div>
  );
}
