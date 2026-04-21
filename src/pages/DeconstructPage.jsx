import { useEffect, useState } from 'react';
import { Card, CardHeader, CardTitle } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Textarea } from '../components/ui/Input';
import { useWork } from '../contexts/WorkContext';
import { useI18n } from '../contexts/I18nContext';
import * as api from '../api/novel';

export function DeconstructPage() {
  const { refreshWorks } = useWork();
  const { t } = useI18n();
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
          <CardTitle className="text-base">{t('page_deconstruct_title')}</CardTitle>
          <p className="text-xs text-slate-500 mt-1">
            {t('page_deconstruct_desc')}
          </p>
        </CardHeader>

        <div className="space-y-3 px-4 pb-4">
          <div className="flex items-center gap-3">
            <label className="cursor-pointer">
              <input type="file" accept=".txt,.md" className="hidden" onChange={handleFileUpload} />
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 border border-slate-700 text-sm text-slate-300 hover:bg-slate-700 transition-colors">
                {t('btn_upload_file')}
              </span>
            </label>
            <span className="text-xs text-slate-500">{t('hint_file_format')}</span>
          </div>

          <Textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder={t('placeholder_paste_novel')}
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
                  {t('status_analyzing')}
                </span>
              ) : t('btn_start_deconstruct')}
            </Button>
            <Button variant="ghost" onClick={() => { setText(''); setResult(null); setError(''); }} disabled={loading}>
              {t('btn_clear')}
            </Button>
          </div>
        </div>
      </Card>

      {/* 分析结果 */}
      {result && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">{t('title_analysis_result')}</CardTitle>
          </CardHeader>
          <div className="px-4 pb-4 space-y-3">
            {renderSection(t('label_plot_structure'), result.plotStructure)}
            {renderSection(t('label_character_archetype'), result.characters)}
            {renderSection(t('label_style_fingerprint'), result.styleFingerprint)}
            {renderSection(t('label_world_rules'), result.worldRules)}
            {renderSection(t('label_pacing_pattern'), result.pacingPatterns)}
            {result.artifacts && (
              <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-lg p-4">
                <h3 className="text-sm font-semibold text-emerald-400 mb-2">{t('title_reusable_resources')}</h3>
                <div className="space-y-2 text-sm text-slate-300">
                  {result.artifacts.template && (
                    <div>{t('msg_template_generated')}<span className="text-emerald-300">{result.artifacts.template.name}</span></div>
                  )}
                  {result.artifacts.style && (
                    <div>{t('msg_voice_extracted')}<span className="text-emerald-300">{result.artifacts.style.name}</span></div>
                  )}
                  {result.artifacts.prompts && (
                    <div>{t('msg_prompt_created')}<span className="text-emerald-300">{t('label_n_items', { count: result.artifacts.prompts.length })}</span></div>
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
            <CardTitle className="text-base">{t('title_history')}</CardTitle>
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
                    <div className="text-sm text-slate-200">{h.title || t('label_unnamed_analysis')}</div>
                    <div className="text-xs text-slate-500">{new Date(h.createdAt).toLocaleString()}</div>
                  </div>
                  <div className="text-xs text-slate-500">
                    {h.result?.artifacts ? t('status_resources_generated') : t('status_pure_analysis')}
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
