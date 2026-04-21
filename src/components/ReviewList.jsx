import { useI18n } from '../contexts/I18nContext';
import { Badge } from './ui/Badge';

const titleKeyMap = {
  multivolume: 'title_multivolume_review',
  volume_1: 'title_volume_1_review',
  volume_2: 'title_volume_2_review',
  volume_3: 'title_volume_3_review',
  volume_4: 'title_volume_4_review',
  volume_5: 'title_volume_5_review',
};

export function ReviewList({ records }) {
  const { t } = useI18n();
  const types = Object.keys(records || {});
  if (!types.length) return null;
  return (
    <div className="mt-4">
      <h4 className="text-sm font-semibold mb-2">ReAct {t('title_review_records')}</h4>
      <div className="space-y-3">
        {types.map((type) => {
          const rounds = records[type];
          return (
            <div key={type}>
              <div className="font-semibold text-sm mb-1">{t(titleKeyMap[type]) || type}</div>
              <div className="space-y-2">
                {rounds.map((r, idx) => {
                  const verdict = r.synthesis?.parsed?.verdict || (r.passed ? t('status_pass') : t('status_fail'));
                  const isPass = verdict === t('status_pass');
                  const agents = (r.reviews || []).map((rv) => rv.agentName || rv.agent).join(t('punct_list_separator'));
                  const suggestions = (r.synthesis?.parsed?.mergedSuggestions || r.synthesis?.parsed?.suggestions || []).slice(0, 3);
                  return (
                    <div key={idx} className="p-3 bg-slate-900 border border-slate-700 rounded-lg">
                      <div className="flex items-center gap-2 mb-1">
                        <span className={`text-xs px-2 py-0.5 rounded ${isPass ? 'bg-green-500/15 text-green-500' : 'bg-red-500/15 text-red-500'}`}>
                          {t('label_round')} {r.round} · {verdict}
                        </span>
                        <span className="text-xs text-slate-400">{t('label_reviewer')}: {agents || '—'}</span>
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
