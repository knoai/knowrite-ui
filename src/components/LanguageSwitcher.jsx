import { Globe } from 'lucide-react';
import { useI18n } from '../contexts/I18nContext';

export function LanguageSwitcher() {
  const { lang, setLang } = useI18n();

  return (
    <div className="relative group">
      <button
        className="flex items-center gap-1.5 px-2 py-1.5 rounded-lg text-xs text-slate-400 hover:text-slate-200 hover:bg-slate-800/60 transition"
        title="Language"
      >
        <Globe size={14} />
        <span>{lang === 'zh' ? '中文' : 'EN'}</span>
      </button>
      <div className="absolute right-0 bottom-full mb-1 hidden group-hover:block bg-slate-900 border border-slate-700 rounded-lg shadow-lg overflow-hidden min-w-[80px] z-50">
        <button
          onClick={() => setLang('en')}
          className={`w-full text-left px-3 py-2 text-xs transition ${lang === 'en' ? 'text-sky-400 bg-sky-500/10' : 'text-slate-300 hover:bg-slate-800'}`}
        >
          English
        </button>
        <button
          onClick={() => setLang('zh')}
          className={`w-full text-left px-3 py-2 text-xs transition ${lang === 'zh' ? 'text-sky-400 bg-sky-500/10' : 'text-slate-300 hover:bg-slate-800'}`}
        >
          简体中文
        </button>
      </div>
    </div>
  );
}
