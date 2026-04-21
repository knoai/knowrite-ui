import { useState, useRef, useEffect } from 'react';
import { Globe } from 'lucide-react';
import { useI18n } from '../contexts/I18nContext';

export function LanguageSwitcher() {
  const { lang, setLang } = useI18n();
  const [open, setOpen] = useState(false);
  const containerRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(e) {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setOpen(false);
      }
    }
    if (open) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [open]);

  return (
    <div ref={containerRef} className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-1.5 px-2 py-1.5 rounded-lg text-xs text-slate-400 hover:text-slate-200 hover:bg-slate-800/60 transition"
        title="Language"
      >
        <Globe size={14} />
        <span>{lang === 'zh' ? '中文' : 'EN'}</span>
      </button>
      {open && (
        <div className="absolute right-0 bottom-full mb-1 bg-slate-900 border border-slate-700 rounded-lg shadow-lg overflow-hidden min-w-[80px] z-50">
          <button
            onClick={() => { setLang('en'); setOpen(false); }}
            className={`w-full text-left px-3 py-2 text-xs transition ${lang === 'en' ? 'text-sky-400 bg-sky-500/10' : 'text-slate-300 hover:bg-slate-800'}`}
          >
            English
          </button>
          <button
            onClick={() => { setLang('zh'); setOpen(false); }}
            className={`w-full text-left px-3 py-2 text-xs transition ${lang === 'zh' ? 'text-sky-400 bg-sky-500/10' : 'text-slate-300 hover:bg-slate-800'}`}
          >
            简体中文
          </button>
        </div>
      )}
    </div>
  );
}
