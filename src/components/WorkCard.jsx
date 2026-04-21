import { Badge } from './ui/Badge';
import { BookOpen, ArrowRight, Trash2 } from 'lucide-react';
import { useI18n } from '../contexts/I18nContext';

export function WorkCard({ work, onClick, onDelete }) {
  const { t } = useI18n();
  let strategyLabel = 'Single';
  let variant = 'default';
  if (work.strategy === 'knowrite') { strategyLabel = t('strategy_multi_agent'); variant = 'info'; }
  else if (work.strategy === 'pipeline') { strategyLabel = 'Pipeline'; variant = 'primary'; }
  else if (work.strategy && (work.strategy.includes('multivolume') || work.strategy === 'mv')) {
    strategyLabel = t('strategy_multivolume') + (work.strategy.includes('knowrite') ? t('strategy_multivolume_suffix') : '');
    variant = 'info';
  }

  const timeStr = work.updatedAt
    ? new Date(work.updatedAt).toLocaleDateString('zh-CN', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
    : '';

  return (
    <div
      onClick={onClick}
      className="group flex items-start gap-4 p-4 rounded-xl bg-slate-800/40 border border-slate-700/40 hover:border-sky-500/40 hover:bg-slate-800/70 hover:-translate-y-0.5 hover:shadow-lg transition-all duration-200 cursor-pointer"
    >
      <div className="w-11 h-11 rounded-xl bg-slate-700/40 border border-slate-600/30 flex items-center justify-center shrink-0 group-hover:bg-sky-500/10 group-hover:border-sky-500/20 transition">
        <BookOpen size={20} className="text-slate-500 group-hover:text-sky-400 transition" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-[15px] font-semibold text-slate-100 truncate mb-1 group-hover:text-sky-400 transition">
          {work.title ? `《${work.title}》` : t('msg_untitled_work')}
        </div>
        <div className="text-slate-500 text-xs line-clamp-2 mb-2.5 leading-relaxed">
          {work.desc || work.rawTopic || t('msg_no_description')}
        </div>
        <div className="flex flex-wrap items-center gap-1.5">
          <Badge variant="default" size="sm">{work.style || t('label_default')}</Badge>
          <Badge variant={variant} size="sm">{strategyLabel}</Badge>
          <Badge variant="purple" size="sm">{work.chapterCount || 0} {t('label_chapter_unit')}</Badge>
          {timeStr && <span className="text-[10px] text-slate-600 ml-1">{timeStr}</span>}
        </div>
      </div>
      <div className="self-center text-slate-600 group-hover:text-sky-400 transition">
        <ArrowRight size={16} />
      </div>
      {onDelete && (
        <button
          onClick={(e) => { e.stopPropagation(); onDelete(work.workId); }}
          className="self-center p-1.5 rounded-lg text-slate-500 hover:text-red-400 hover:bg-red-500/10 transition opacity-0 group-hover:opacity-100"
          title={t('btn_delete_work')}
        >
          <Trash2 size={16} />
        </button>
      )}
    </div>
  );
}
