import { createContext, useContext, useState, useCallback, useMemo, type ReactNode } from 'react';
import { getStoredLang, storeLang, t as translate } from '../i18n';

export interface I18nContextValue {
  lang: string;
  setLang: (lang: string) => void;
  t: (key: string, vars?: Record<string, unknown>) => string;
}

const I18nContext = createContext<I18nContextValue | null>(null);

export function I18nProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<string>(() => getStoredLang());

  const setLang = useCallback((next: string) => {
    setLangState(next);
    storeLang(next);
  }, []);

  const t = useCallback((key: string, vars?: Record<string, unknown>) => translate(key, lang, vars), [lang]);

  const value = useMemo<I18nContextValue>(() => ({ lang, setLang, t }), [lang, setLang, t]);

  return (
    <I18nContext.Provider value={value}>
      {children}
    </I18nContext.Provider>
  );
}

export function useI18n(): I18nContextValue {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error('useI18n must be used within I18nProvider');
  return ctx;
}
