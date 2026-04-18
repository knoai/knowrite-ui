import { FileQuestion, Plus, BookOpen } from 'lucide-react';

export function EmptyState({ icon: Icon = FileQuestion, title = '暂无内容', description = '这里还没有任何内容', actionText, actionIcon: ActionIcon = Plus, onAction, compact = false }) {
  return (
    <div className={`flex flex-col items-center justify-center text-center ${compact ? 'py-6' : 'py-12'} px-4`}>
      <div className={`${compact ? 'w-12 h-12' : 'w-16 h-16'} rounded-2xl bg-slate-800/60 border border-slate-700/40 flex items-center justify-center mb-3`}>
        <Icon size={compact ? 22 : 28} className="text-slate-500" />
      </div>
      <h4 className={`${compact ? 'text-sm' : 'text-base'} font-medium text-slate-300 mb-1`}>{title}</h4>
      <p className={`${compact ? 'text-xs' : 'text-sm'} text-slate-500 max-w-xs mb-3`}>{description}</p>
      {actionText && onAction && (
        <button
          onClick={onAction}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-sky-600/90 hover:bg-sky-500 text-white text-sm font-medium transition shadow-sm"
        >
          {ActionIcon && <ActionIcon size={14} />}
          {actionText}
        </button>
      )}
    </div>
  );
}

export function WorkEmptyState({ onCreate }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4">
      <div className="w-20 h-20 rounded-3xl bg-slate-800/60 border border-slate-700/40 flex items-center justify-center mb-4">
        <BookOpen size={36} className="text-slate-500" />
      </div>
      <h3 className="text-lg font-semibold text-slate-200 mb-2">还没有作品</h3>
      <p className="text-sm text-slate-500 max-w-sm mb-5">
        写下你的想法，AI 会帮你把它变成一部完整的小说。从第一步开始吧！
      </p>
      <button
        onClick={onCreate}
        className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-500 text-white text-sm font-medium transition shadow-lg shadow-sky-900/20"
      >
        <Plus size={16} />
        开始创作
      </button>
    </div>
  );
}
