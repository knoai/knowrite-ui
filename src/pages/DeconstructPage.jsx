import { useEffect, useState } from 'react';
import { Card, CardHeader, CardTitle } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Textarea } from '../components/ui/Input';
import { useWork } from '../contexts/WorkContext';
import * as api from '../api/novel';

export function DeconstructPage() {
  const { refreshWorks } = useWork();
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [history, setHistory] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    api.getDeconstructHistory().then((d) => setHistory(d.history || [])).catch(() => {});
  }, []);

  const handleSubmit = async () => {
    if (!text.trim() || loading) return;
    setLoading(true);
    setError('');
    setResult(null);
    try {
      const data = await api.deconstructBook(text.trim());
      setResult(data);
      // refresh history
      api.getDeconstructHistory().then((d) => setHistory(d.history || [])).catch(() => {});
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => setText(ev.target.result);
    reader.readAsText(file);
  };

  const renderSection = (title, data) => {
    if (!data) return null;
    let content;
    if (typeof data === 'string') {
      content = <p className="text-sm text-slate-300 whitespace-pre-wrap">{data}</p>;
    } else if (Array.isArray(data)) {
      content = (
        <ul className="space-y-1.5">
          {data.map((item, i) => (
            <li key={i} className="text-sm text-slate-300">
              {typeof item === 'string' ? item : JSON.stringify(item, null, 2)}
            </li>
          ))}
        </ul>
      );
    } else {
      content = <pre className="text-xs text-slate-300 overflow-auto">{JSON.stringify(data, null, 2)}</pre>;
    }
    return (
      <div className="bg-slate-800/50 rounded-lg p-4 border border-slate-700/40">
        <h3 className="text-sm font-semibold text-sky-400 mb-2">{title}</h3>
        {content}
      </div>
    );
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="text-base">拆书分析</CardTitle>
          <p className="text-xs text-slate-500 mt-1">
            粘贴或上传一本小说，AI 将自动分析其情节结构、角色设定、文风指纹、世界观规则和节奏模式，生成可复用的创作模板。
          </p>
        </CardHeader>

        <div className="space-y-3 px-4 pb-4">
          <div className="flex items-center gap-3">
            <label className="cursor-pointer">
              <input type="file" accept=".txt,.md" className="hidden" onChange={handleFileUpload} />
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 border border-slate-700 text-sm text-slate-300 hover:bg-slate-700 transition-colors">
                📄 上传文件
              </span>
            </label>
            <span className="text-xs text-slate-500">支持 .txt / .md，建议 3-30 万字</span>
          </div>

          <Textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="在此粘贴小说正文..."
            rows={10}
            className="text-sm font-mono"
          />

          {error && (
            <div className="text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2">
              {error}
            </div>
          )}

          <div className="flex items-center gap-3">
            <Button
              variant="primary"
              onClick={handleSubmit}
              disabled={loading || !text.trim()}
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <span className="inline-block w-4 h-4 border-2 border-slate-600 border-t-sky-400 rounded-full animate-spin" />
                  分析中...
                </span>
              ) : '开始拆书'}
            </Button>
            <Button variant="ghost" onClick={() => { setText(''); setResult(null); setError(''); }} disabled={loading}>
              清空
            </Button>
          </div>
        </div>
      </Card>

      {/* 分析结果 */}
      {result && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">分析结果</CardTitle>
          </CardHeader>
          <div className="px-4 pb-4 space-y-3">
            {renderSection('情节结构', result.plotStructure)}
            {renderSection('角色原型', result.characters)}
            {renderSection('文风指纹', result.styleFingerprint)}
            {renderSection('世界观规则', result.worldRules)}
            {renderSection('节奏模式', result.pacingPatterns)}
            {result.artifacts && (
              <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-lg p-4">
                <h3 className="text-sm font-semibold text-emerald-400 mb-2">可复用资源</h3>
                <div className="space-y-2 text-sm text-slate-300">
                  {result.artifacts.template && (
                    <div>✅ 故事模板已生成: <span className="text-emerald-300">{result.artifacts.template.name}</span></div>
                  )}
                  {result.artifacts.style && (
                    <div>✅ 作者声纹已提取: <span className="text-emerald-300">{result.artifacts.style.name}</span></div>
                  )}
                  {result.artifacts.prompts && (
                    <div>✅ 提示词模板已创建: <span className="text-emerald-300">{result.artifacts.prompts.length} 个</span></div>
                  )}
                </div>
              </div>
            )}
          </div>
        </Card>
      )}

      {/* 历史记录 */}
      {history.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">历史记录</CardTitle>
          </CardHeader>
          <div className="px-4 pb-4">
            <div className="space-y-2">
              {history.map((h) => (
                <div
                  key={h.id}
                  className="flex items-center justify-between px-3 py-2 rounded-lg bg-slate-800/50 border border-slate-700/40 hover:border-slate-600/60 transition-colors cursor-pointer"
                  onClick={() => setResult(h.result)}
                >
                  <div>
                    <div className="text-sm text-slate-200">{h.title || '未命名分析'}</div>
                    <div className="text-xs text-slate-500">{new Date(h.createdAt).toLocaleString()}</div>
                  </div>
                  <div className="text-xs text-slate-500">
                    {h.result?.artifacts ? '已生成资源' : '纯分析'}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}
