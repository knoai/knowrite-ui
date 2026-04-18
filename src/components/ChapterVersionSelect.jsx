import { Select } from './ui/Select';

const versionOptions = [
  { key: 'default', label: '默认正文' },
  { key: 'repetitionRepaired', label: '重复修复版' },
  { key: 'outlineCorrected', label: '纲章矫正版' },
  { key: 'styleCorrected', label: '风格矫正版' },
];

export function ChapterVersionSelect({ versions, value, onChange }) {
  const available = versionOptions.filter((v) => v.key === 'default' || versions[v.key]);
  if (available.length <= 1) return null;
  return (
    <div className="mt-3">
      <label className="block text-xs text-slate-400 mb-1">查看版本</label>
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
