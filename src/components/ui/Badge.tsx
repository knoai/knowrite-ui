// @ts-nocheck
export function Badge({ children, className = '', variant = 'default', size = 'sm' }) {
  const styles = {
    default: 'bg-slate-700/60 text-slate-300 border-slate-600/40',
    success: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
    warning: 'bg-amber-500/10 text-amber-400 border-amber-500/30',
    danger: 'bg-rose-500/10 text-rose-400 border-rose-500/30',
    info: 'bg-sky-500/10 text-sky-400 border-sky-500/30',
    primary: 'bg-sky-500/15 text-sky-300 border-sky-500/30',
    purple: 'bg-violet-500/10 text-violet-400 border-violet-500/30',
  };
  const sizes = {
    sm: 'px-2 py-0.5 text-[10px]',
    md: 'px-2.5 py-1 text-xs',
    lg: 'px-3 py-1 text-sm',
  };
  return (
    <span className={`inline-flex items-center rounded-md border font-medium ${styles[variant]} ${sizes[size]} ${className}`}>
      {children}
    </span>
  );
}
