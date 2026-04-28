// @ts-nocheck
export function Card({ children, className = '', hover = false, gradient = false }) {
  return (
    <div className={`rounded-xl backdrop-blur-sm transition-all duration-200 p-4 ${
      gradient
        ? 'bg-slate-800/80 border border-slate-700/50 shadow-[0_4px_16px_rgba(0,0,0,0.2)]'
        : 'bg-slate-800/60 border border-slate-700/60 shadow-[0_2px_8px_rgba(0,0,0,0.15)]'
    } ${hover ? 'hover:shadow-[0_8px_24px_rgba(0,0,0,0.25)] hover:-translate-y-0.5 hover:border-slate-600/70' : ''} ${className}`}>
      {children}
    </div>
  );
}

export function CardTitle({ children, className = '' }) {
  return <h3 className={`text-base font-semibold text-sky-400 tracking-wide ${className}`}>{children}</h3>;
}

export function CardHeader({ children, className = '' }) {
  return <div className={`flex items-center justify-between gap-3 px-4 py-3 -mx-4 -mt-4 mb-3 border-b border-slate-700/40 ${className}`}>{children}</div>;
}
