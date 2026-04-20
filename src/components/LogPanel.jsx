import { useEffect, useRef, useState, useCallback } from 'react';

const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:8000';
const MAX_LOGS = 500;

function formatTime(iso) {
  const d = new Date(iso);
  return d.toTimeString().slice(0, 8);
}

export function LogPanel() {
  const [expanded, setExpanded] = useState(false);
  const [logs, setLogs] = useState([]);
  const [unread, setUnread] = useState(0);
  const [autoScroll, setAutoScroll] = useState(true);
  const listRef = useRef(null);
  const esRef = useRef(null);

  const addLog = useCallback((entry) => {
    setLogs((prev) => {
      const next = [...prev, entry];
      if (next.length > MAX_LOGS) next.shift();
      return next;
    });
    if (!expanded) {
      setUnread((u) => u + 1);
    }
  }, [expanded]);

  useEffect(() => {
    let errorCount = 0;
    let errorTimer = null;
    let es = null;

    const connect = () => {
      es = new EventSource(`${API_BASE}/api/logs/stream`);
      esRef.current = es;

      es.onmessage = (e) => {
        try {
          const data = JSON.parse(e.data);
          if (data.type === 'history' && Array.isArray(data.logs)) {
            setLogs(data.logs.slice(-MAX_LOGS));
          } else if (data.type === 'log') {
            addLog(data);
          }
        } catch {
          // ignore malformed
        }
      };

      es.onerror = () => {
        errorCount += 1;
        if (!errorTimer) {
          errorTimer = setTimeout(() => {
            errorCount = 0;
            errorTimer = null;
          }, 10000);
        }
        // 10 秒内连续错误超过 3 次，停止自动重连
        if (errorCount > 3) {
          console.warn('[LogPanel] SSE 连接异常，停止自动重连');
          es.close();
        }
      };
    };

    connect();

    return () => {
      if (errorTimer) clearTimeout(errorTimer);
      if (es) es.close();
    };
  }, [addLog]);

  useEffect(() => {
    if (expanded) {
      setUnread(0);
    }
  }, [expanded]);

  useEffect(() => {
    if (autoScroll && listRef.current) {
      listRef.current.scrollTop = listRef.current.scrollHeight;
    }
  }, [logs, autoScroll, expanded]);

  const levelColor = (level) => {
    switch (level) {
      case 'error': return 'text-red-400';
      case 'warn': return 'text-amber-400';
      case 'success': return 'text-green-400';
      default: return 'text-slate-400';
    }
  };

  const levelDot = (level) => {
    switch (level) {
      case 'error': return 'bg-red-500';
      case 'warn': return 'bg-amber-500';
      case 'success': return 'bg-green-500';
      default: return 'bg-slate-500';
    }
  };

  if (!expanded) {
    return (
      <button
        onClick={() => setExpanded(true)}
        className="fixed bottom-4 right-4 z-50 w-12 h-12 rounded-full bg-slate-800 border border-slate-700 text-slate-200 shadow-lg hover:bg-slate-700 transition-colors flex items-center justify-center"
        title="系统日志"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
          <polyline points="14 2 14 8 20 8"></polyline>
          <line x1="16" y1="13" x2="8" y2="13"></line>
          <line x1="16" y1="17" x2="8" y2="17"></line>
          <polyline points="10 9 9 9 8 9"></polyline>
        </svg>
        {unread > 0 && (
          <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center">
            {unread > 99 ? '99+' : unread}
          </span>
        )}
      </button>
    );
  }

  return (
    <div className="fixed bottom-4 right-4 z-50 w-[480px] max-w-[calc(100vw-2rem)] bg-slate-900 border border-slate-700 rounded-lg shadow-2xl flex flex-col transition-all"
      style={{ maxHeight: 'calc(100vh - 2rem)' }}
    >
      {/* 标题栏 */}
      <div className="flex items-center justify-between px-3 py-2 border-b border-slate-700/40">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
          <span className="text-sm font-medium text-slate-200">系统日志</span>
          <span className="text-xs text-slate-500">({logs.length})</span>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={() => setLogs([])}
            className="text-xs text-slate-500 hover:text-slate-300 px-2 py-1 rounded hover:bg-slate-800 transition"
            title="清空"
          >
            清空
          </button>
          <button
            onClick={() => setExpanded(false)}
            className="text-xs text-slate-500 hover:text-slate-300 px-2 py-1 rounded hover:bg-slate-800 transition"
            title="最小化"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="4 14 10 14 10 20"></polyline>
              <polyline points="20 10 14 10 14 4"></polyline>
              <line x1="14" y1="10" x2="21" y2="3"></line>
              <line x1="3" y1="21" x2="10" y2="14"></line>
            </svg>
          </button>
        </div>
      </div>

      {/* 日志列表 */}
      <div
        ref={listRef}
        className="flex-1 overflow-y-auto p-2 space-y-1 font-mono text-xs"
        style={{ maxHeight: 360 }}
        onScroll={() => {
          const el = listRef.current;
          if (!el) return;
          const nearBottom = el.scrollHeight - el.scrollTop - el.clientHeight < 20;
          setAutoScroll(nearBottom);
        }}
      >
        {logs.length === 0 && (
          <div className="text-slate-600 text-center py-8">暂无日志</div>
        )}
        {logs.map((log, idx) => (
          <div key={idx} className="flex items-start gap-2 py-0.5 hover:bg-slate-800/50 rounded px-1">
            <span className={`w-1.5 h-1.5 rounded-full mt-1 flex-shrink-0 ${levelDot(log.level)}`}></span>
            <span className="text-slate-600 flex-shrink-0">{formatTime(log.time)}</span>
            <span className={`break-all ${levelColor(log.level)}`}>{log.message}</span>
          </div>
        ))}
      </div>

      {/* 状态栏 */}
      <div className="flex items-center justify-between px-3 py-1.5 border-t border-slate-700/40 text-[10px] text-slate-500">
        <span>{autoScroll ? '自动滚动中' : '已暂停自动滚动'}</span>
        <span className={esRef.current?.readyState === EventSource.OPEN ? 'text-green-500' : 'text-red-500'}>
          {esRef.current?.readyState === EventSource.OPEN ? '已连接' : '连接中...'}
        </span>
      </div>
    </div>
  );
}
