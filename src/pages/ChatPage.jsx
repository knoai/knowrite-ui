import { useEffect, useRef, useState } from 'react';
import { Card, CardHeader, CardTitle } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Textarea } from '../components/ui/Input';
import { useI18n } from '../contexts/I18nContext';
import * as api from '../api/novel';

export function ChatPage() {
  const { t } = useI18n();
  const [providers, setProviders] = useState({});
  const [prompts, setPrompts] = useState([]);
  const [loading, setLoading] = useState(true);

  const [provider, setProvider] = useState('');
  const [model, setModel] = useState('');
  const [temperature, setTemperature] = useState(0.7);
  const [promptTemplate, setPromptTemplate] = useState('');
  const [systemPrompt, setSystemPrompt] = useState('');
  const [showSystem, setShowSystem] = useState(false);

  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [streaming, setStreaming] = useState(false);
  const [streamText, setStreamText] = useState('');
  const abortRef = useRef(null);
  const bottomRef = useRef(null);

  useEffect(() => {
    Promise.all([api.getModelConfig(), api.listPrompts()])
      .then(([cfg, p]) => {
        setProviders(cfg.providers || {});
        setPrompts(p.prompts || []);
        const firstEnabled = Object.entries(cfg.providers || {}).find(([, v]) => v.enabled)?.[0] || '';
        setProvider(firstEnabled);
        const defaultModel = firstEnabled ? (cfg.providers?.[firstEnabled]?.models || [])[0] || '' : '';
        setModel(defaultModel);
      })
      .catch((e) => console.error('加载配置失败', e))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (bottomRef.current) {
      bottomRef.current.scrollIntoView({ behavior: 'smooth', block: 'end' });
    }
  }, [messages, streamText]);

  const streamRef = useRef(streamText);
  useEffect(() => {
    streamRef.current = streamText;
  }, [streamText]);

  const doSend = async () => {
    if (!input.trim() || streaming) return;
    const userContent = input.trim();
    setInput('');

    const nextMessages = [...messages, { role: 'user', content: userContent }];
    setMessages(nextMessages);
    setStreaming(true);
    setStreamText('');
    streamRef.current = '';

    const ctrl = new AbortController();
    abortRef.current = ctrl;
    try {
      await api.chat(
        {
          provider,
          model,
          temperature,
          promptTemplate: promptTemplate || undefined,
          systemPrompt: systemPrompt || undefined,
          messages: nextMessages,
        },
        (chunk) => {
          setStreamText((prev) => {
            const next = prev + chunk;
            streamRef.current = next;
            return next;
          });
        },
        ctrl.signal
      );
      setMessages((prev) => [...prev, { role: 'assistant', content: streamRef.current || t('no_response') }]);
    } catch (e) {
      if (e.name !== 'AbortError') {
        setMessages((prev) => [...prev, { role: 'assistant', content: `❌ ${t('label_error')}: ${e.message}` }]);
      }
    } finally {
      setStreaming(false);
      setStreamText('');
      streamRef.current = '';
      abortRef.current = null;
    }
  };

  const handleStop = () => {
    if (abortRef.current) {
      abortRef.current.abort();
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      doSend();
    }
  };

  const providerKeys = Object.keys(providers);

  if (loading) {
    return (
      <div className="flex items-center gap-2 text-slate-400 text-sm py-8">
        <span className="inline-block w-4 h-4 border-2 border-slate-600 border-t-sky-400 rounded-full animate-spin" />
        {t('loading_config')}
      </div>
    );
  }

  return (
    <div className="flex flex-col h-[calc(100vh-6rem)] min-h-[400px]">
      <Card className="flex flex-col h-full !p-0">
        <CardHeader className="!mx-0 !mt-0">
          <CardTitle className="text-base">{t('agent_chat_title')}</CardTitle>
        </CardHeader>

        {/* 工具栏 */}
        <div className="px-4 pb-3 border-b border-slate-700/40">
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2">
              <label className="text-xs text-slate-400">Provider</label>
              <select
                value={provider}
                onChange={(e) => {
                  const p = e.target.value;
                  setProvider(p);
                  const defaultModel = (providers[p]?.models || [])[0] || '';
                  setModel(defaultModel);
                }}
                className="bg-slate-900 border border-slate-700 text-slate-200 text-sm rounded px-2 py-1"
              >
                {providerKeys.map((pk) => (
                  <option key={pk} value={pk}>{providers[pk].alias || pk}</option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-2">
              <label className="text-xs text-slate-400">{t('label_model')}</label>
              <Input
                value={model}
                onChange={(e) => setModel(e.target.value)}
                placeholder={t('placeholder_model')}
                className="w-32 text-sm py-1"
              />
            </div>

            <div className="flex items-center gap-2">
              <label className="text-xs text-slate-400">{t('label_temperature')}</label>
              <input
                type="range"
                min={0}
                max={2}
                step={0.05}
                value={temperature}
                onChange={(e) => setTemperature(parseFloat(e.target.value))}
                className="w-20 accent-sky-500"
              />
              <span className="text-xs text-slate-400 w-8">{temperature.toFixed(2)}</span>
            </div>

            <div className="flex items-center gap-2">
              <label className="text-xs text-slate-400">Prompt</label>
              <select
                value={promptTemplate}
                onChange={(e) => {
                  setPromptTemplate(e.target.value);
                  setShowSystem(!!e.target.value || !!systemPrompt);
                }}
                className="bg-slate-900 border border-slate-700 text-slate-200 text-sm rounded px-2 py-1"
              >
                <option value="">{t('option_no_template')}</option>
                {prompts.map((p) => (
                  <option key={p} value={p}>{p}</option>
                ))}
              </select>
            </div>

            <Button variant="ghost" size="sm" onClick={() => setShowSystem((s) => !s)}>
              {showSystem ? t('btn_hide_system_prompt') : t('btn_edit_system_prompt')}
            </Button>
          </div>

          {showSystem && (
            <div className="mt-3">
              <Textarea
                value={systemPrompt}
                onChange={(e) => setSystemPrompt(e.target.value)}
                placeholder={t('placeholder_system_prompt')}
                rows={3}
                className="text-sm"
              />
            </div>
          )}
        </div>

        {/* 聊天记录 */}
        <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3">
          {messages.length === 0 && (
            <div className="text-center text-slate-500 text-sm py-10">
              {t('chat_welcome_hint')}
            </div>
          )}

          {messages.map((msg, idx) => (
            <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div
                className={`max-w-[85%] sm:max-w-[75%] px-4 py-2.5 rounded-xl text-sm whitespace-pre-wrap ${
                  msg.role === 'user'
                    ? 'bg-sky-500/20 text-slate-100'
                    : 'bg-slate-800 text-slate-200'
                }`}
              >
                {msg.content}
              </div>
            </div>
          ))}

          {streaming && (
            <div className="flex justify-start">
              <div className="max-w-[85%] sm:max-w-[75%] px-4 py-2.5 rounded-xl text-sm whitespace-pre-wrap bg-slate-800 text-slate-200">
                {streamText}
                <span className="inline-block w-1.5 h-4 bg-sky-400 ml-1 align-middle animate-pulse" />
              </div>
            </div>
          )}

          <div ref={bottomRef} />
        </div>

        {/* 输入区 */}
        <div className="px-4 py-3 border-t border-slate-700/40">
          <div className="flex items-end gap-2">
            <Textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={t('placeholder_chat_input')}
              rows={2}
              disabled={streaming}
              className="flex-1 text-sm"
            />
            <div className="flex flex-col gap-2">
              {streaming ? (
                <Button variant="danger" size="sm" onClick={handleStop}>{t('btn_stop')}</Button>
              ) : (
                <Button variant="primary" size="sm" onClick={doSend} disabled={!input.trim()}>
                  {t('btn_send')}
                </Button>
              )}
              <Button variant="ghost" size="sm" onClick={() => setMessages([])} disabled={streaming || messages.length === 0}>
                {t('btn_clear')}
              </Button>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}
