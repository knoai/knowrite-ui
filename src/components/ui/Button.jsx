export function Button({ children, variant = 'default', size = 'md', className = '', disabled, ...props }) {
  const base = 'inline-flex items-center justify-center gap-1.5 rounded-lg border font-medium transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0 active:translate-y-[1px]';
  const styles = {
    default: 'bg-slate-700/70 border-slate-600 text-slate-50 hover:bg-slate-600 hover:border-slate-500 shadow-sm',
    primary: 'bg-sky-500 border-sky-400 text-slate-950 hover:bg-sky-400 hover:border-sky-300 shadow-[0_2px_0_#0369a1] hover:shadow-[0_1px_0_#0369a1] active:shadow-none',
    accent: 'bg-indigo-500 border-indigo-400 text-slate-950 hover:bg-indigo-400 hover:border-indigo-300 shadow-[0_2px_0_#4338ca] hover:shadow-[0_1px_0_#4338ca] active:shadow-none',
    ghost: 'bg-transparent border-transparent text-slate-300 hover:bg-slate-800/60 hover:text-slate-100',
    danger: 'bg-red-500/10 border-red-500/30 text-red-400 hover:bg-red-500/20 hover:border-red-500/50',
  };
  const sizes = {
    sm: 'px-2.5 py-1.5 text-xs',
    md: 'px-4 py-2 text-sm',
    lg: 'px-5 py-2.5 text-base',
  };
  return (
    <button className={`${base} ${sizes[size]} ${styles[variant]} ${className}`} disabled={disabled} {...props}>
      {children}
    </button>
  );
}
