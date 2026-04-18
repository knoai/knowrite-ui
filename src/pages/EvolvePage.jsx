import { useState, useEffect } from 'react';
import { Card, CardTitle } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Select } from '../components/ui/Select';
import * as api from '../api/novel';

export function EvolvePage() {
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
        <CardTitle>Prompt 自动进化</CardTitle>
        <p className="text-slate-400 text-sm mt-1">基于历史作品的 Fitness 数据，自动诊断 Prompt 缺陷并生成改进变体。</p>
        <div className="mt-4 flex flex-col sm:flex-row sm:items-end gap-3">
          <div className="sm:w-64">
            <label className="block text-sm text-slate-300 mb-1.5">选择模板</label>
            <Select value={selected} onChange={(e) => setSelected(e.target.value)}>
              {templates.map((t) => (
                <option key={t} value={t}>{t}</option>
              ))}
            </Select>
          </div>
          <Button variant="primary" onClick={handleRun} disabled={loading}>开始进化实验</Button>
        </div>
        {status && <div className="text-sm text-slate-400 mt-3">{status}</div>}
        {result && (
          <div className="mt-4 output-panel">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
              <p><span className="text-slate-500">基线 Fitness:</span> <span className="font-medium">{result.baselineFitness ?? 'N/A'}</span></p>
              <p><span className="text-slate-500">最佳预测 Fitness:</span> <span className="font-medium">{result.bestPredicted ?? 'N/A'}</span></p>
              <p><span className="text-slate-500">提升:</span> <span className="font-medium">{result.improvement ?? 0}</span></p>
              <p><span className="text-slate-500">推荐应用:</span> <span className="font-medium">{result.success ? '是 ✅' : '否'}</span></p>
            </div>
            <p className="mt-3 text-slate-500">报告: <span className="text-slate-300">{result.reportPath || ''}</span></p>
            <p className="mt-3"><span className="text-slate-500">诊断:</span> <span className="text-slate-300">{result.diagnosis?.diagnosis || ''}</span></p>
            <p className="mt-2 text-slate-500">改进方向:</p>
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
