import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Lightbulb, Play, CheckCircle, AlertTriangle, BookOpen, Clock, Loader2 } from 'lucide-react';
import { Card, CardTitle } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import * as api from '../api/novel';
import { useI18n } from '../contexts/I18nContext';

const BEAT_TYPE_COLORS = {
  hook: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
  rising: 'bg-sky-500/10 text-sky-400 border-sky-500/20',
  climax: 'bg-rose-500/10 text-rose-400 border-rose-500/20',
  falling: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
  suspense: 'bg-violet-500/10 text-violet-400 border-violet-500/20',
};

export function PlanPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const { t } = useI18n();
  const [workId, setWorkId] = useState(searchParams.get('workId') || '');
  const [works, setWorks] = useState([]);
  const [chapterNumber, setChapterNumber] = useState('');
  const [planning, setPlanning] = useState(false);
  const [plan, setPlan] = useState(null);
  const [streamText, setStreamText] = useState('');
  const [status, setStatus] = useState('');

  const BEAT_TYPE_LABELS = {
    hook: t('beat_hook'),
    rising: t('beat_rising'),
    climax: t('beat_climax'),
    falling: t('beat_falling'),
    suspense: t('beat_suspense'),
  };

  useEffect(() => {
    api.getWorks().then((data) => {
      setWorks(data.works || []);
    }).catch(() => {});
  }, []);

  useEffect(() => {
    const w = searchParams.get('workId');
    if (w) setWorkId(w);
  }, [searchParams]);

  const handlePlan = async () => {
    if (!workId) return;
    setPlanning(true);
    setPlan(null);
    setStreamText('');
    setStatus(t('status_generating_plan'));
    const controller = new AbortController();
    try {
      await fetchPlanSSE(controller);
    } catch (e) {
      if (e.name !== 'AbortError') setStatus(t('label_error') + ': ' + e.message);
    } finally {
      setPlanning(false);
    }
  };

  const fetchPlanSSE = async (controller) => {
    const res = await fetch('/api/novel/plan', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ workId, chapterNumber: chapterNumber ? parseInt(chapterNumber, 10) : undefined }),
      signal: controller.signal,
    });
    if (!res.ok) throw new Error(await res.text());
    const reader = res.body.getReader();
    const decoder = new TextDecoder();
    let buffer = '';
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');
      buffer = lines.pop() || '';
      for (const line of lines) {
        if (!line.trim().startsWith('data:')) continue;
        const dataStr = line.trim().slice(5).trim();
        if (!dataStr || dataStr === '[DONE]') continue;
        try {
          const ev = JSON.parse(dataStr);
          if (ev.type === 'chunk' && ev.chunk) {
            setStreamText((prev) => prev + ev.chunk);
          }
          if (ev.type === 'plan') {
            setPlan({
              beats: ev.beats || [],
              overallTone: ev.overallTone || '',
              riskFlags: ev.riskFlags || [],
            });
            setStatus(t('status_plan_complete'));
          }
          if (ev.type === 'stepStart') {
            setStatus(`${t('status_executing')}: ${ev.name}`);
          }
        } catch {
          // ignore malformed json
        }
      }
    }
  };

  const totalWords = plan?.beats?.reduce((sum, b) => sum + (b.estimatedWords || 0), 0) || 0;

  return (
    <div className="max-w-4xl mx-auto space-y-5">
      <div className="flex items-center gap-3">
        <Lightbulb size={22} className="text-amber-400" />
        <h1 className="text-xl font-bold text-slate-100">{t('page_plan_title')}</h1>
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
              <option value="">{t('placeholder_select_work')}</option>
              {works.map((w) => (
                <option key={w.workId} value={w.workId}>{w.title || w.topic || w.workId}</option>
              ))}
            </select>
          </div>
          <div className="w-32">
            <label className="block text-xs text-slate-500 mb-1">{t('label_chapter_number_optional')}</label>
            <input
              type="number"
              min={1}
              value={chapterNumber}
              onChange={(e) => setChapterNumber(e.target.value)}
              placeholder={t('placeholder_auto')}
              className="w-full bg-slate-900 border border-slate-700 text-slate-200 text-sm rounded-lg px-3 py-2"
            />
          </div>
          <Button onClick={handlePlan} disabled={planning || !workId}>
            {planning ? <Loader2 size={15} className="mr-1.5 animate-spin" /> : <Lightbulb size={15} className="mr-1.5" />}
            {planning ? t('status_planning') : t('btn_generate_plan')}
          </Button>
        </div>
        {status && <div className="mt-2 text-xs text-slate-500">{status}</div>}
      </Card>

      {streamText && !plan && (
        <Card>
          <div className="text-xs text-slate-400 whitespace-pre-wrap font-mono max-h-96 overflow-auto">{streamText}</div>
        </Card>
      )}

      {plan && (
        <>
          {/* 整体基调与风险 */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {plan.overallTone && (
              <Card className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-amber-500/10 flex items-center justify-center">
                  <BookOpen size={18} className="text-amber-400" />
                </div>
                <div>
                  <div className="text-xs text-slate-500">{t('label_overall_tone')}</div>
                  <div className="text-sm font-medium text-slate-200">{plan.overallTone}</div>
                </div>
              </Card>
            )}
            <Card className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-sky-500/10 flex items-center justify-center">
                <Clock size={18} className="text-sky-400" />
              </div>
              <div>
                <div className="text-xs text-slate-500">{t('label_estimated_total_words')}</div>
                <div className="text-sm font-medium text-slate-200">{t('label_n_words', { count: totalWords.toLocaleString() })}</div>
              </div>
            </Card>
          </div>

          {/* 节拍卡片 */}
          <div className="space-y-3">
            {plan.beats.map((beat, idx) => (
              <Card key={idx} className="relative overflow-hidden">
                <div className="flex items-start gap-3">
                  <div className={`shrink-0 px-2.5 py-1 rounded-md text-xs font-medium border ${BEAT_TYPE_COLORS[beat.type] || 'bg-slate-800 text-slate-400 border-slate-700'}`}>
                    {BEAT_TYPE_LABELS[beat.type] || beat.type}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm text-slate-200 leading-relaxed">{beat.description}</div>
                    <div className="flex items-center gap-3 mt-2 text-[10px] text-slate-500">
                      <span>{t('label_estimated_words', { count: beat.estimatedWords || '?' })}</span>
                      {beat.mustInclude?.length > 0 && (
                        <span className="flex gap-1 flex-wrap">
                          {beat.mustInclude.map((item, i) => (
                            <span key={i} className="px-1.5 py-0.5 bg-slate-800 rounded text-slate-400">{item}</span>
                          ))}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>

          {/* 风险提示 */}
          {plan.riskFlags?.length > 0 && (
            <Card className="border-amber-500/20">
              <div className="flex items-start gap-2">
                <AlertTriangle size={16} className="text-amber-400 shrink-0 mt-0.5" />
                <div>
                  <div className="text-sm font-medium text-amber-400 mb-1">{t('title_risk_warnings')}</div>
                  <ul className="space-y-1">
                    {plan.riskFlags.map((flag, i) => (
                      <li key={i} className="text-xs text-slate-400">• {flag}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </Card>
          )}

          {/* 确认操作 */}
          <div className="flex justify-end gap-3">
            <Button variant="secondary" onClick={() => { setPlan(null); setStreamText(''); }}>
              {t('btn_replan')}
            </Button>
            <Button onClick={() => { window.location.href = `/works/${workId}`; }}>
              <Play size={15} className="mr-1.5" />
              {t('btn_confirm_and_continue')}
            </Button>
          </div>
        </>
      )}
    </div>
  );
}
