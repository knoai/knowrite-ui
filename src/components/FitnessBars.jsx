export function FitnessBars({ records, chapters }) {
  if (!chapters.length || !Object.keys(records).length) return null;
  return (
    <div className="mt-4">
      <h4 className="text-sm font-semibold mb-2">章节 Fitness</h4>
      <div className="space-y-2 text-sm">
        {chapters.map((ch) => {
          const f = records[ch.number];
          if (!f) return null;
          const pct = Math.round(f.score * 100);
          const color = pct >= 75 ? 'bg-green-500' : pct >= 50 ? 'bg-amber-500' : 'bg-red-500';
          return (
            <div key={ch.number} className="flex items-center gap-3 py-1.5 px-2 bg-slate-900 rounded-md">
              <span className="w-14 shrink-0">第{ch.number}章</span>
              <div className="flex-1 h-2 bg-slate-800 rounded-full overflow-hidden">
                <div className={`h-full ${color}`} style={{ width: `${pct}%` }} />
              </div>
              <span className="w-10 text-right font-semibold">{pct}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
