// @ts-nocheck
import { useRef, useEffect, useState } from 'react';
import { Copy, Check } from 'lucide-react';
import { Button } from './ui/Button';
import { useI18n } from '../contexts/I18nContext';

export function StreamOutput({ text, className = '' }) {
  const { t } = useI18n();
  const bottomRef = useRef(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (bottomRef.current) {
      bottomRef.current.scrollIntoView({ behavior: 'smooth', block: 'end' });
    }
  }, [text]);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {}
  };

  return (
    <div className={`relative ${className}`}>
      <div className="output-panel">
        {text}
        <div ref={bottomRef} />
      </div>
      {text && (
        <div className="absolute top-2.5 right-2.5">
          <Button variant="ghost" size="sm" onClick={handleCopy} className="px-2 py-1 text-xs bg-slate-900/60">
            {copied ? <Check size={13} /> : <Copy size={13} />}
            {copied ? t('status_copied') : t('btn_copy')}
          </Button>
        </div>
      )}
    </div>
  );
}
