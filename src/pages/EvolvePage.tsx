// @ts-nocheck
import { useState, useEffect } from 'react';
import { Card, CardTitle } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Select } from '../components/ui/Select';
import * as api from '../api/novel';
import { useI18n } from '../contexts/I18nContext';

export function EvolvePage() {
  const { t } = useI18n();
  const [templates, setTemplates] = useState([]);
  const [selected, setSelected] = useState('writer');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [status, setStatus] = useState('');

  useEffect(() => {
    api.listPrompts().then((data) => {
      const list = (data.prompts || []).map((p) => p.name || p);
      setTemplates(list);
      if (list.length) setSelected(list[0]);
    }).catch(() => {
      setTemplates(['writer', 'editor', 'chapter', 'humanizer', 'polish', 'multivolume-outline', 'volume-outline']);
    });
  }, []);

  const handleRun = async () => {
    setLoading(true);
    setStatus(t('status_evolution_running'));
    setResult(null);
    try {
      const data = await api.evolvePrompt({ templateName: selected });
      setResult(data);
      setStatus(t('status_evolution_complete'));
    } catch (e) {
      setStatus(t('label_error') + ': ' + e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardTitle>{t('page_evolve_title')}</CardTitle>
        <p className="text-slate-400 text-sm mt-1">{t('page_evolve_desc')}</p>
        <div className="mt-4 flex flex-col sm:flex-row sm:items-end gap-3">
          <div className="sm:w-64">
            <label className="block text-sm text-slate-300 mb-1.5">{t('label_select_template')}</label>
            <Select value={selected} onChange={(e) => setSelected(e.target.value)}>
              {templates.map((tmpl) => (
                <option key={tmpl} value={tmpl}>{tmpl}</option>
              ))}
            </Select>
          </div>
          <Button variant="primary" onClick={handleRun} disabled={loading}>{t('btn_start_evolution')}</Button>
        </div>
        {status && <div className="text-sm text-slate-400 mt-3">{status}</div>}
        {result && (
          <div className="mt-4 output-panel">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
              <p><span className="text-slate-500">{t('label_baseline_fitness')}</span> <span className="font-medium">{result.baselineFitness ?? 'N/A'}</span></p>
              <p><span className="text-slate-500">{t('label_best_predicted_fitness')}</span> <span className="font-medium">{result.bestPredicted ?? 'N/A'}</span></p>
              <p><span className="text-slate-500">{t('label_improvement')}</span> <span className="font-medium">{result.improvement ?? 0}</span></p>
              <p><span className="text-slate-500">{t('label_recommended_apply')}</span> <span className="font-medium">{result.success ? t('label_yes') : t('label_no')}</span></p>
            </div>
            <p className="mt-3 text-slate-500">{t('label_report')} <span className="text-slate-300">{result.reportPath || ''}</span></p>
            <p className="mt-3"><span className="text-slate-500">{t('label_diagnosis')}</span> <span className="text-slate-300">{result.diagnosis?.diagnosis || ''}</span></p>
            <p className="mt-2 text-slate-500">{t('label_improvement_directions')}</p>
            <ul className="list-disc list-inside text-slate-300 mt-1">
              {(result.diagnosis?.directions || []).map((d, i) => (
                <li key={i}>{d}</li>
              ))}
            </ul>
          </div>
        )}
      </Card>
    </div>
  );
}
