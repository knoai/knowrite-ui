// @ts-nocheck
export function Select({ children, className = '', ...props }) {
  return (
    <select
      className={`px-3 py-2 rounded-lg border border-slate-600 bg-slate-900/60 text-slate-50 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500/50 focus:border-sky-500 transition ${className}`}
      {...props}
    >
      {children}
    </select>
  );
}
