import { useState, useEffect, createContext, useContext, useCallback } from 'react';
import { X, CheckCircle, AlertCircle, Info } from 'lucide-react';

const ToastContext = createContext(null);

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((message, type = 'info', duration = 3000) => {
    const id = Date.now() + Math.random();
    setToasts(prev => [...prev, { id, message, type, duration }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, duration);
  }, []);

  const removeToast = useCallback((id) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ addToast, removeToast }}>
      {children}
      <div className="fixed top-4 right-4 z-[100] flex flex-col gap-2 pointer-events-none">
        {toasts.map(toast => (
          <ToastItem key={toast.id} toast={toast} onRemove={removeToast} />
        ))}
      </div>
    </ToastContext.Provider>
  );
}

function ToastItem({ toast, onRemove }) {
  const [show, setShow] = useState(false);

  useEffect(() => {
    requestAnimationFrame(() => setShow(true));
  }, []);

  const icons = {
    success: <CheckCircle size={18} className="text-emerald-400" />,
    error: <AlertCircle size={18} className="text-rose-400" />,
    info: <Info size={18} className="text-sky-400" />,
  };

  const borders = {
    success: 'border-emerald-500/30',
    error: 'border-rose-500/30',
    info: 'border-sky-500/30',
  };

  return (
    <div
      className={`pointer-events-auto flex items-center gap-2.5 px-4 py-3 rounded-xl border ${borders[toast.type]} bg-slate-800/95 backdrop-blur-sm shadow-lg transition-all duration-300 min-w-[280px] max-w-[400px] ${show ? 'translate-x-0 opacity-100' : 'translate-x-8 opacity-0'}`}
    >
      {icons[toast.type]}
      <span className="text-sm text-slate-200 flex-1">{toast.message}</span>
      <button onClick={() => onRemove(toast.id)} className="text-slate-500 hover:text-slate-300 transition">
        <X size={14} />
      </button>
    </div>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used within ToastProvider');
  return ctx;
}
