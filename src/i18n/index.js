import { en } from './en.js';
import { zh } from './zh.js';

const translations = { en, zh };

const STORAGE_KEY = 'knowrite-lang';

export function getStoredLang() {
  if (typeof localStorage !== 'undefined') {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored && translations[stored]) return stored;
  }
  const browserLang = typeof navigator !== 'undefined'
    ? (navigator.language || navigator.userLanguage || 'en').slice(0, 2)
    : 'en';
  return translations[browserLang] ? browserLang : 'en';
}

export function storeLang(lang) {
  if (typeof localStorage !== 'undefined') {
    localStorage.setItem(STORAGE_KEY, lang);
  }
}

export function t(key, lang = 'en', vars = {}) {
  const dict = translations[lang] || translations.en;
  let text = dict[key];
  if (text === undefined) {
    // fallback: try zh if en missing, or return key
    text = translations.zh[key];
    if (text === undefined) return key;
  }
  if (vars && typeof text === 'string') {
    return text.replace(/\{\{(\w+)\}\}/g, (_, k) => vars[k] ?? `{{${k}}}`);
  }
  return text;
}

export { en, zh, translations };
