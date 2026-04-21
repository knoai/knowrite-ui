import { Select } from './ui/Select';
import { useI18n } from '../contexts/I18nContext';

const versionKeys = [
  { key: 'default', labelKey: 'label_default_text' },
  { key: 'repetitionRepaired', labelKey: 'label_repetition_repaired' },
  { key: 'outlineCorrected', labelKey: 'label_outline_corrected' },
  { key: 'styleCorrected', labelKey: 'label_style_corrected' },
];

export function ChapterVersionSelect({ versions, value, onChange }) {
  const { t } = useI18n();
  const versionOptions = versionKeys.map((v) => ({ key: v.key, label: t(v.labelKey) }));
  const available = versionOptions.filter((v) => v.key === 'default' || versions[v.key]);
  if (available.length <= 1) return null;
  return (
    <div className="mt-3">
      <label className="block text-xs text-slate-400 mb-1">{t('label_view_version')}</label>
      <Select value={value} onChange={(e) => onChange(e.target.value)}>
        {available.map((v) => (
          <option key={v.key} value={v.key}>
            {v.label}
          </option>
        ))}
      </Select>
    </div>
  );
}
