export function Input({ className = '', ...props }) {
  return (
    <input
      className={`w-full px-3.5 py-2.5 rounded-lg border border-slate-600 bg-slate-900/60 text-slate-50 text-sm placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-sky-500/40 focus:border-sky-500 transition ${className}`}
      {...props}
    />
  );
}

export function Textarea({ className = '', ...props }) {
  return (
    <textarea
      className={`w-full px-3.5 py-2.5 rounded-lg border border-slate-600 bg-slate-900/60 text-slate-50 text-sm placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-sky-500/40 focus:border-sky-500 transition min-h-[120px] resize-y ${className}`}
      {...props}
    />
  );
}
