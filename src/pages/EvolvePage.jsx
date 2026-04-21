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
    setStatus('进化实验中，请稍候...');
    setResult(null);
    try {
      const data = await api.evolvePrompt({ templateName: selected });
      setResult(data);
      setStatus('进化实验完成');
    } catch (e) {
      setStatus('错误: ' + e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardTitle>{t('prompt_')}</CardTitle>
        <p className="text-slate-400 text-sm mt-1">{t('_fitness___prompt_')}</p>
        <div className="mt-4 flex flex-col sm:flex-row sm:items-end gap-3">
          <div className="sm:w-64">
            <label className="block text-sm text-slate-300 mb-1.5">{t('t_il0hha')}</label>
            <Select value={selected} onChange={(e) => setSelected(e.target.value)}>
              {templates.map((t) => (
                <option key={t} value={t}>{t}</option>
              ))}
            </Select>
          </div>
          <Button variant="primary" onClick={handleRun} disabled={loading}>{t('t_mazkd0')}</Button>
        </div>
        {status && <div className="text-sm text-slate-400 mt-3">{status}</div>}
        {result && (
          <div className="mt-4 output-panel">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
              <p><span className="text-slate-500">基线 Fitness:</span> <span className="font-medium">{result.baselineFitness ?? 'N/A'}</span></p>
              <p><span className="text-slate-500">最佳预测 Fitness:</span> <span className="font-medium">{result.bestPredicted ?? 'N/A'}</span></p>
              <p><span className="text-slate-500">{t('t_f0h43')}</span> <span className="font-medium">{result.improvement ?? 0}</span></p>
              <p><span className="text-slate-500">{t('t_jkhvya')}</span> <span className="font-medium">{t('t_gme')}</span></p>
            </div>
            <p className="mt-3 text-slate-500">{t('t_euhlh')}<span className="text-slate-300">{result.reportPath || ''}</span></p>
            <p className="mt-3"><span className="text-slate-500">{t('t_kyeev')}</span> <span className="text-slate-300">{result.diagnosis?.diagnosis || ''}</span></p>
            <p className="mt-2 text-slate-500">{t('t_bu61j4')}</p>
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
