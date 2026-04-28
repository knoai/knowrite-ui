// @ts-nocheck
import { useEffect, useRef, useState, useCallback } from 'react';
import { Card, CardHeader, CardTitle } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Textarea } from '../components/ui/Input';
import { useWork } from '../contexts/WorkContext';
import { useI18n } from '../contexts/I18nContext';
import * as api from '../api/novel';

export function AgentChatPage() {
  const { t } = useI18n();
  const { works, currentWorkId, selectWork, refreshWorks } = useWork();
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [streaming, setStreaming] = useState(false);
  const [streamText, setStreamText] = useState('');
  const [actions, setActions] = useState([]);
  const abortRef = useRef(null);
  const bottomRef = useRef(null);
  const streamRef = useRef(streamText);

  useEffect(() => {
    refreshWorks();
  }, [refreshWorks]);

  useEffect(() => {
    if (bottomRef.current) {
      bottomRef.current.scrollIntoView({ behavior: 'smooth', block: 'end' });
    }
  }, [messages, streamText, actions]);

  useEffect(() => {
    streamRef.current = streamText;
  }, [streamText]);

  const parseActions = useCallback((text) => {
    const actionRegex = /<action\s+type="([^"]+)"(?:\s+target="([^"]*)")?>([\s\S]*?)<\/action>/g;
    const found = [];
    let m;
    while ((m = actionRegex.exec(text)) !== null) {
      found.push({ type: m[1], target: m[2] || null, content: m[3].trim() });
    }
    return found;
  }, []);

  const doSend = async () => {
    if (!input.trim() || streaming || !currentWorkId) return;
    const userContent = input.trim();
    setInput('');

    const nextMessages = [...messages, { role: 'user', content: userContent }];
    setMessages(nextMessages);
    setStreaming(true);
    setStreamText('');
    streamRef.current = '';
    setActions([]);

    const ctrl = new AbortController();
    abortRef.current = ctrl;
    try {
      await api.chatAgent(
        currentWorkId,
        nextMessages,
        (chunk) => {
          setStreamText((prev) => {
            const next = prev + chunk;
            streamRef.current = next;
            return next;
          });
        },
        ctrl.signal
      );
      const finalText = streamRef.current || t('no_response');
      const foundActions = parseActions(finalText);
      setActions(foundActions);
      setMessages((prev) => [...prev, { role: 'assistant', content: finalText }]);
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
    if (abortRef.current) abortRef.current.abort();
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      doSend();
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-6rem)] min-h-[400px]">
      <Card className="flex flex-col h-full !p-0">
        <CardHeader className="!mx-0 !mt-0">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base">{t('agent_chat_page_title')}</CardTitle>
            <div className="flex items-center gap-2">
              <label className="text-xs text-slate-400">{t('label_current_work')}</label>
              <select
                value={currentWorkId || ''}
                onChange={(e) => selectWork(e.target.value)}
                className="bg-slate-900 border border-slate-700 text-slate-200 text-sm rounded px-2 py-1 min-w-[10rem]"
              >
                <option value="">{t('option_select_work')}</option>
                {works.map((w) => (
                  <option key={w.id} value={w.id}>{w.title}</option>
                ))}
              </select>
            </div>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            {t('agent_chat_description')}
          </p>
        </CardHeader>

        {/* 聊天记录 */}
        <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3">
          {messages.length === 0 && (
            <div className="text-center text-slate-500 text-sm py-10">
              {currentWorkId
                ? t('chat_empty_hint_with_work')
                : t('chat_empty_hint_no_work')}
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

          {/* 执行的动作 */}
          {actions.length > 0 && (
            <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl px-4 py-3">
              <div className="text-xs font-semibold text-emerald-400 mb-2">{t('actions_executed_title')}</div>
              <div className="space-y-2">
                {actions.map((a, i) => (
                  <div key={i} className="text-xs text-slate-300">
                    <span className="inline-block px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 mr-2">{a.type}</span>
                    {a.target && <span className="text-slate-400 mr-2">target: {a.target}</span>}
                    <span className="text-slate-500">{a.content.slice(0, 60)}{a.content.length > 60 ? '...' : ''}</span>
                  </div>
                ))}
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
              placeholder={currentWorkId ? t('placeholder_enter_command') : t('placeholder_select_work_first')}
              rows={2}
              disabled={streaming || !currentWorkId}
              className="flex-1 text-sm"
            />
            <div className="flex flex-col gap-2">
              {streaming ? (
                <Button variant="danger" size="sm" onClick={handleStop}>{t('btn_stop')}</Button>
              ) : (
                <Button variant="primary" size="sm" onClick={doSend} disabled={!input.trim() || !currentWorkId}>
                  {t('btn_send')}
                </Button>
              )}
              <Button variant="ghost" size="sm" onClick={() => { setMessages([]); setActions([]); }} disabled={streaming || messages.length === 0}>
                {t('btn_clear')}
              </Button>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}
