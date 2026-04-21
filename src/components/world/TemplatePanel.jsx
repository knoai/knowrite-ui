import { useState, useEffect, useCallback } from 'react';
import { Plus, Trash2, Sparkles, ExternalLink } from 'lucide-react';
import { CardHeader, CardTitle } from '../ui/Card';
import * as api from '../../api/novel';
import { useNavigate } from 'react-router-dom';
import { useI18n } from '../../contexts/I18nContext';

export function TemplatePanel({ workId }) {
  const { t } = useI18n();
  const [applied, setApplied] = useState([]);
  const [globalTemplates, setGlobalTemplates] = useState([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [aData, gData] = await Promise.all([
        api.getWorkTemplates(workId),
        api.getStoryTemplates('global'),
      ]);
      setApplied(aData.items || []);
      setGlobalTemplates(gData.items || []);
    } catch (e) { console.error(e); }
    setLoading(false);
  }, [workId]);

  useEffect(() => { load(); }, [load]);

  const handleApply = async (templateId) => {
    await api.applyTemplate(workId, templateId);
    load();
  };

  const handleRemove = async (templateId) => {
    if (!confirm('确定移除此套路？')) return;
    await api.removeTemplate(workId, templateId);
    load();
  };

  const appliedIds = new Set(applied.map(t => t.id));
  const available = globalTemplates.filter(t => !appliedIds.has(t.id));

  return (
    <div className="space-y-4">
      <CardHeader className="!mb-0">
        <CardTitle className="flex items-center gap-2"><Sparkles size={16} />{t('t_buysan')}</CardTitle>
        <button onClick={() => navigate('/templates')} className="flex items-center gap-1 text-sm px-3 py-1.5 rounded-lg bg-slate-700 hover:bg-slate-600 text-slate-200 transition">
          <ExternalLink size={14} /> 管理库
        </button>
      </CardHeader>

      {loading && <div className="text-slate-400 text-sm py-4">{t('t_27k1ha')}</div>}

      {/* 已应用套路 */}
      <div>
        <h4 className="text-xs font-medium text-sky-400 mb-2">{t('t_1afyohu')}</h4>
        {applied.length > 0 ? (
          <div className="space-y-2">
            {applied.map(t => (
              <div key={t.id} className="bg-slate-900/40 border border-slate-700/40 rounded-lg p-3">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-slate-200 text-sm">{t.name}</span>
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-sky-500/20 text-sky-400">{t.category}</span>
                    </div>
                    {t.description && <p className="text-xs text-slate-500 mt-1">{t.description}</p>}
                    {t.beatStructure?.length > 0 && (
                      <div className="mt-2 space-y-1">
                        {t.beatStructure.map((beat, i) => (
                          <div key={i} className="flex items-center gap-2 text-xs">
                            <span className="text-slate-500 w-4">{i + 1}</span>
                            <span className="text-slate-300">{beat.beat || beat.name}</span>
                            {beat.chapters && <span className="text-slate-500">约{beat.chapters}章</span>}
                            {beat.goal && <span className="text-slate-500">— {beat.goal}</span>}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                  <button onClick={() => handleRemove(t.id)} className="p-1 rounded hover:bg-slate-700 text-slate-400 hover:text-red-400 shrink-0"><Trash2 size={14} /></button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-sm text-slate-500 py-3 bg-slate-900/20 rounded-lg border border-dashed border-slate-700 text-center">{t('t_1ilbkly')}</div>
        )}
      </div>

      {/* 可选套路 */}
      {available.length > 0 && (
        <div>
          <h4 className="text-xs font-medium text-sky-400 mb-2">{t('t_yriaig')}</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {available.map(t => (
              <div key={t.id} className="bg-slate-900/20 border border-slate-700/30 rounded-lg p-3 hover:border-sky-500/30 transition group">
                <div className="flex items-center justify-between gap-2">
                  <div>
                    <span className="text-sm text-slate-300 font-medium">{t.name}</span>
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-700/50 text-slate-400 ml-2">{t.category}</span>
                  </div>
                  <button onClick={() => handleApply(t.id)} className="flex items-center gap-1 text-xs px-2 py-1 rounded bg-sky-600/80 hover:bg-sky-500 text-white opacity-0 group-hover:opacity-100 transition">
                    <Plus size={10} /> 应用
                  </button>
                </div>
                {t.description && <p className="text-xs text-slate-500 mt-1 line-clamp-2">{t.description}</p>}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
