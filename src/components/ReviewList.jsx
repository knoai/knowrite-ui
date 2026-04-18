import { Badge } from './ui/Badge';

const titleMap = {
  multivolume: '多卷架构评审',
  volume_1: '第1卷评审',
  volume_2: '第2卷评审',
  volume_3: '第3卷评审',
  volume_4: '第4卷评审',
  volume_5: '第5卷评审',
};

export function ReviewList({ records }) {
  const types = Object.keys(records || {});
  if (!types.length) return null;
  return (
    <div className="mt-4">
      <h4 className="text-sm font-semibold mb-2">ReAct 评审记录</h4>
      <div className="space-y-3">
        {types.map((type) => {
          const rounds = records[type];
          return (
            <div key={type}>
              <div className="font-semibold text-sm mb-1">{titleMap[type] || type}</div>
              <div className="space-y-2">
                {rounds.map((r, idx) => {
                  const verdict = r.synthesis?.parsed?.verdict || (r.passed ? '通过' : '不通过');
                  const isPass = verdict === '通过';
                  const agents = (r.reviews || []).map((rv) => rv.agentName || rv.agent).join('、');
                  const suggestions = (r.synthesis?.parsed?.mergedSuggestions || r.synthesis?.parsed?.suggestions || []).slice(0, 3);
                  return (
                    <div key={idx} className="p-3 bg-slate-900 border border-slate-700 rounded-lg">
                      <div className="flex items-center gap-2 mb-1">
                        <span className={`text-xs px-2 py-0.5 rounded ${isPass ? 'bg-green-500/15 text-green-500' : 'bg-red-500/15 text-red-500'}`}>
                          第{r.round}轮 · {verdict}
                        </span>
                        <span className="text-xs text-slate-400">评审员：{agents || '—'}</span>
                      </div>
                      {suggestions.length > 0 && (
                        <ul className="list-disc list-inside text-xs text-slate-400 mt-1">
                          {suggestions.map((s, i) => (
                            <li key={i}>{s}</li>
                          ))}
                        </ul>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
