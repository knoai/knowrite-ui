import { useEffect, useState } from 'react';
import { Card, CardTitle, CardHeader } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Textarea } from '../components/ui/Input';
import * as api from '../api/novel';

export function SettingsPage() {
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState('');
  const [activeTab, setActiveTab] = useState('skill');

  useEffect(() => {
    api.getSettings()
      .then((data) => setSettings(data))
      .catch((e) => setStatus('加载失败: ' + e.message))
      .finally(() => setLoading(false));
  }, []);

  const handleSave = async () => {
    if (!settings) return;
    setSaving(true);
    setStatus('');
    try {
      await api.saveSettings(settings);
      setStatus('保存成功');
    } catch (e) {
      setStatus('保存失败: ' + e.message);
    } finally {
      setSaving(false);
    }
  };

  const updateList = (key, index, field, value) => {
    const next = [...(settings[key] || [])];
    next[index] = { ...next[index], [field]: value };
    setSettings({ ...settings, [key]: next });
  };

  const addItem = (key, defaultItem) => {
    setSettings({ ...settings, [key]: [...(settings[key] || []), defaultItem] });
  };

  const removeItem = (key, index) => {
    const next = [...(settings[key] || [])];
    next.splice(index, 1);
    setSettings({ ...settings, [key]: next });
  };

  // ---- model config helpers ----
  const getModelCfg = () => settings?.modelConfig || {};
  const setModelCfg = (updater) => {
    setSettings((prev) => {
      const mc = typeof updater === 'function' ? updater(prev.modelConfig || {}) : updater;
      return { ...prev, modelConfig: mc };
    });
  };
  const updateProvider = (name, field, value) => {
    setModelCfg((mc) => {
      const providers = { ...mc.providers };
      providers[name] = { ...providers[name], [field]: value };
      return { ...mc, providers };
    });
  };
  const addProvider = () => {
    const key = `provider${Object.keys(getModelCfg().providers || {}).length + 1}`;
    setModelCfg((mc) => {
      const providers = { ...mc.providers, [key]: { enabled: true, alias: '新Provider', apiKey: '', baseURL: '', models: [] } };
      return { ...mc, providers };
    });
  };
  const removeProvider = (name) => {
    setModelCfg((mc) => {
      const providers = { ...mc.providers };
      delete providers[name];
      return { ...mc, providers };
    });
  };
  const updateRole = (role, field, value) => {
    setModelCfg((mc) => {
      const roles = { ...mc.roleDefaults };
      roles[role] = { ...roles[role], [field]: value };
      return { ...mc, roleDefaults: roles };
    });
  };
  const addRole = (roleKey) => {
    const defaultProvider = getModelCfg().defaultProvider || '';
    setModelCfg((mc) => {
      const roles = { ...mc.roleDefaults };
      if (!roles[roleKey]) {
        roles[roleKey] = { provider: defaultProvider, model: '', temperature: 0.7 };
      }
      return { ...mc, roleDefaults: roles };
    });
  };
  const removeRole = (roleKey) => {
    setModelCfg((mc) => {
      const roles = { ...mc.roleDefaults };
      delete roles[roleKey];
      return { ...mc, roleDefaults: roles };
    });
  };
  const batchReplaceRoleProvider = (oldProvider, newProvider) => {
    setModelCfg((mc) => {
      const roles = { ...mc.roleDefaults };
      Object.entries(roles).forEach(([role, cfg]) => {
        if (cfg.provider === oldProvider || oldProvider === '*') {
          roles[role] = { ...cfg, provider: newProvider };
        }
      });
      return { ...mc, roleDefaults: roles };
    });
  };
  const batchReplaceRoleModel = (oldModel, newModel) => {
    setModelCfg((mc) => {
      const roles = { ...mc.roleDefaults };
      Object.entries(roles).forEach(([role, cfg]) => {
        if (cfg.model === oldModel || oldModel === '*') {
          roles[role] = { ...cfg, model: newModel };
        }
      });
      return { ...mc, roleDefaults: roles };
    });
  };
  const applyBestPracticeTemperatures = () => {
    setModelCfg((mc) => {
      const roles = { ...mc.roleDefaults };
      const high = ['writer', 'editor', 'humanizer', 'polish'];
      const low = ['proofreader', 'reader', 'summarizer', 'reviewer', 'planner', 'outline', 'product', 'tech', 'reviser', 'synthesis', 'repetitionRepair', 'deviationCheck', 'styleCorrect', 'promptEvolve', 'fitnessEvaluate'];
      high.forEach((r) => { if (roles[r]) roles[r] = { ...roles[r], temperature: 0.85 }; });
      low.forEach((r) => { if (roles[r]) roles[r] = { ...roles[r], temperature: 0 }; });
      return { ...mc, roleDefaults: roles };
    });
    setStatus('已应用最佳实践温度');
  };

  const updateWriterRotation = (field, value) => {
    setModelCfg((mc) => {
      const wr = { ...mc.writerRotation, [field]: value };
      return { ...mc, writerRotation: wr };
    });
  };
  const updateRotationItem = (index, field, value) => {
    setModelCfg((mc) => {
      const list = [...(mc.writerRotation?.models || [])];
      list[index] = { ...list[index], [field]: value };
      return { ...mc, writerRotation: { ...mc.writerRotation, models: list } };
    });
  };
  const addRotationItem = () => {
    setModelCfg((mc) => {
      const list = [...(mc.writerRotation?.models || [])];
      list.push({ provider: '', model: '', temperature: 0.85, alias: `作家${list.length + 1}` });
      return { ...mc, writerRotation: { ...mc.writerRotation, models: list } };
    });
  };

  const [testStatus, setTestStatus] = useState({});
  const [modelsTestStatus, setModelsTestStatus] = useState({});
  const [switchPanel, setSwitchPanel] = useState(null);
  const [switchMode, setSwitchMode] = useState('smart');
  const [switchUniformModel, setSwitchUniformModel] = useState('');
  const [switchCustomMap, setSwitchCustomMap] = useState({});
  const [switchSelectedRoles, setSwitchSelectedRoles] = useState([]);
  const [showAddRole, setShowAddRole] = useState(false);
  const [newRoleKey, setNewRoleKey] = useState('');
  const [showBatchReplace, setShowBatchReplace] = useState(false);
  const [batchReplaceType, setBatchReplaceType] = useState('provider');
  const [batchReplaceOld, setBatchReplaceOld] = useState('');
  const [batchReplaceNew, setBatchReplaceNew] = useState('');

  const handleSwitchProvider = async (provider) => {
    setStatus(`正在切换到 ${provider}...`);
    try {
      const options = {};
      options.roles = switchSelectedRoles;
      if (switchMode === 'uniform') {
        options.mode = 'uniform';
        options.uniformModel = switchUniformModel;
      } else if (switchMode === 'custom') {
        options.mode = 'custom';
        options.customMap = switchCustomMap;
      }
      await api.switchProvider(provider, options);
      const cfg = await api.getModelConfig();
      setSettings((prev) => ({ ...prev, modelConfig: cfg }));
      setStatus(`已切换到 ${provider}（${switchSelectedRoles.length} 个角色）`);
      setSwitchPanel(null);
    } catch (err) {
      setStatus('切换失败: ' + err.message);
    }
  };

  const handleTestProvider = async (provider) => {
    setTestStatus((prev) => ({ ...prev, [provider]: { type: 'loading' } }));
    try {
      const result = await api.testProvider(provider);
      if (result.valid) {
        setTestStatus((prev) => ({ ...prev, [provider]: { type: 'success', msg: result.response } }));
      } else {
        setTestStatus((prev) => ({ ...prev, [provider]: { type: 'error', msg: result.error } }));
      }
    } catch (err) {
      setTestStatus((prev) => ({ ...prev, [provider]: { type: 'error', msg: err.message } }));
    }
  };

  const handleTestModels = async (provider) => {
    setModelsTestStatus((prev) => ({ ...prev, [provider]: { type: 'loading' } }));
    try {
      const result = await api.testModels(provider);
      setModelsTestStatus((prev) => ({ ...prev, [provider]: { type: 'done', results: result.results } }));
    } catch (err) {
      setModelsTestStatus((prev) => ({ ...prev, [provider]: { type: 'error', msg: err.message } }));
    }
  };
  const removeRotationItem = (index) => {
    setModelCfg((mc) => {
      const list = [...(mc.writerRotation?.models || [])];
      list.splice(index, 1);
      return { ...mc, writerRotation: { ...mc.writerRotation, models: list } };
    });
  };

  if (loading) {
    return (
      <div className="flex items-center gap-2 text-slate-400 text-sm py-8">
        <span className="inline-block w-4 h-4 border-2 border-slate-600 border-t-sky-400 rounded-full animate-spin" />
        加载配置中...
      </div>
    );
  }

  if (!settings) {
    return <div className="text-slate-400 text-sm">配置加载失败</div>;
  }

  const tabs = [
    { key: 'skill', label: '写作技能 (Skill)' },
    { key: 'review', label: '评审维度' },
    { key: 'author', label: '作者风格' },
    { key: 'platform', label: '平台风格' },
    { key: 'chapter', label: '章节配置' },
    { key: 'writing', label: '写作风格' },
    { key: 'models', label: '模型配置' },
  ];

  const presetOptions = [
    { value: '8', label: '精简版 · 8维度' },
    { value: '15', label: '标准版 · 15维度' },
    { value: '33', label: '完整版 · 33维度' },
  ];

  const handlePresetChange = async (e) => {
    const preset = e.target.value;
    setStatus('切换预设中...');
    try {
      const result = await api.setReviewPreset(preset);
      setSettings((prev) => ({
        ...prev,
        reviewPreset: result.reviewPreset,
        reviewDimensions: result.reviewDimensions,
        skill: result.skill,
      }));
      setStatus(`已切换为 ${presetOptions.find((o) => o.value === preset)?.label}`);
    } catch (err) {
      setStatus('切换失败: ' + err.message);
    }
  };

  const providerKeys = Object.keys(getModelCfg().providers || {});
  const roleEntries = Object.entries(getModelCfg().roleDefaults || {});
  const ROLE_LABELS = {
    writer: '作者（初稿）',
    editor: '编辑（改稿）',
    humanizer: '去AI化',
    proofreader: '校编',
    polish: '润色',
    reader: '读者反馈',
    summarizer: '摘要生成',
    outline: '大纲生成',
    planner: '策划评审',
    reviewer: '通用评审',
    product: '产品评审',
    tech: '技术架构评审',
    reviser: '评审后修改',
    synthesis: '综合评审',
    repetitionRepair: '重复修复',
    deviationCheck: '偏离检测',
    styleCorrect: '风格修正',
    promptEvolve: 'Prompt进化',
    fitnessEvaluate: 'Fitness评估',
  };

  const ALL_ROLES = Object.keys(ROLE_LABELS);

  function getModelSuggestions(provider) {
    return getModelCfg().providers?.[provider]?.models || [];
  }

  const openSwitchPanel = (provider) => {
    const models = getModelCfg().providers?.[provider]?.models || [];
    setSwitchPanel(provider);
    setSwitchMode('smart');
    setSwitchUniformModel(models[0] || '');
    setSwitchCustomMap({});
    setSwitchSelectedRoles([...ALL_ROLES]);
  };

  const applySmartFill = (provider) => {
    const models = getModelCfg().providers?.[provider]?.models || [];
    const firstModel = models[0] || '';
    if (firstModel) {
      setSwitchMode('custom');
      const map = {};
      ALL_ROLES.forEach((role) => { map[role] = firstModel; });
      setSwitchCustomMap(map);
    }
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="mb-0">创作设置</CardTitle>
          <Button variant="primary" size="sm" onClick={handleSave} disabled={saving}>保存设置</Button>
        </CardHeader>
        {status && <div className={`text-sm mb-3 ${status.includes('失败') ? 'text-red-400' : 'text-green-400'}`}>{status}</div>}

        <div className="flex gap-1 border-b border-slate-700/60 pb-0 mb-4 overflow-x-auto">
          {tabs.map((t) => (
            <button
              key={t.key}
              onClick={() => setActiveTab(t.key)}
              className={`text-sm px-4 py-2 rounded-t-lg transition relative whitespace-nowrap ${
                activeTab === t.key ? 'text-sky-400 font-medium' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
              }`}
            >
              {t.label}
              {activeTab === t.key && <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-sky-400 rounded-t" />}
            </button>
          ))}
        </div>

        {activeTab === 'skill' && (
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <label className="text-sm text-slate-300">当前评审预设</label>
              <select
                value={settings.reviewPreset || '33'}
                onChange={handlePresetChange}
                className="bg-slate-900 border border-slate-700 text-slate-200 text-sm rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-sky-500"
              >
                {presetOptions.map((o) => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </select>
            </div>
            <div className="text-xs text-slate-500">
              Skill 规则与评审维度联动，切换预设会自动替换为对应版本的写作规范。
            </div>
            <label className="block text-sm text-slate-300 mb-2">核心写作规则 (core-rules)</label>
            <p className="text-xs text-slate-500 mb-2">该内容会被注入到所有作者模型的 Prompt 中，作为硬性创作规范。</p>
            <Textarea value={settings.skill || ''} onChange={(e) => setSettings({ ...settings, skill: e.target.value })} rows={12} />
          </div>
        )}

        {activeTab === 'review' && (
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <label className="text-sm text-slate-300">当前评审预设</label>
              <select
                value={settings.reviewPreset || '33'}
                onChange={handlePresetChange}
                className="bg-slate-900 border border-slate-700 text-slate-200 text-sm rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-sky-500"
              >
                {presetOptions.map((o) => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </select>
            </div>
            <div className="text-xs text-slate-500">
              切换预设会替换为对应版本的评审维度。你可以在此基础上继续编辑，保存后会覆盖该预设的自定义内容。
            </div>
            <div className="flex items-center justify-between pt-2">
              <label className="block text-sm text-slate-300">编辑评审维度</label>
              <Button size="sm" onClick={() => addItem('reviewDimensions', { name: '新维度', description: '描述' })}>添加维度</Button>
            </div>
            <div className="space-y-2">
              {settings.reviewDimensions?.map((dim, i) => (
                <div key={i} className="grid grid-cols-1 sm:grid-cols-3 gap-2 items-start p-3 bg-slate-900/40 border border-slate-700/40 rounded-lg">
                  <div className="sm:col-span-1">
                    <Input value={dim.name} onChange={(e) => updateList('reviewDimensions', i, 'name', e.target.value)} placeholder="维度名称" />
                  </div>
                  <div className="sm:col-span-2 flex gap-2">
                    <Input value={dim.description} onChange={(e) => updateList('reviewDimensions', i, 'description', e.target.value)} placeholder="评审描述" />
                    <Button variant="danger" size="sm" onClick={() => removeItem('reviewDimensions', i)}>删除</Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'author' && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="block text-sm text-slate-300">作者风格预设</label>
              <Button size="sm" onClick={() => addItem('authorStyles', { name: '新风格', description: '' })}>添加风格</Button>
            </div>
            <div className="space-y-2">
              {settings.authorStyles?.map((s, i) => (
                <div key={i} className="grid grid-cols-1 sm:grid-cols-3 gap-2 items-start p-3 bg-slate-900/40 border border-slate-700/40 rounded-lg">
                  <div className="sm:col-span-1">
                    <Input value={s.name} onChange={(e) => updateList('authorStyles', i, 'name', e.target.value)} placeholder="风格名称" />
                  </div>
                  <div className="sm:col-span-2 flex gap-2">
                    <Input value={s.description} onChange={(e) => updateList('authorStyles', i, 'description', e.target.value)} placeholder="风格展开描述，会注入到 Prompt 中" />
                    <Button variant="danger" size="sm" onClick={() => removeItem('authorStyles', i)}>删除</Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'platform' && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="block text-sm text-slate-300">平台风格预设</label>
              <Button size="sm" onClick={() => addItem('platformStyles', { name: '新平台', description: '' })}>添加平台</Button>
            </div>
            <div className="space-y-2">
              {settings.platformStyles?.map((s, i) => (
                <div key={i} className="grid grid-cols-1 sm:grid-cols-3 gap-2 items-start p-3 bg-slate-900/40 border border-slate-700/40 rounded-lg">
                  <div className="sm:col-span-1">
                    <Input value={s.name} onChange={(e) => updateList('platformStyles', i, 'name', e.target.value)} placeholder="平台名称" />
                  </div>
                  <div className="sm:col-span-2 flex gap-2">
                    <Input value={s.description} onChange={(e) => updateList('platformStyles', i, 'description', e.target.value)} placeholder="平台风格展开描述" />
                    <Button variant="danger" size="sm" onClick={() => removeItem('platformStyles', i)}>删除</Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'writing' && (
          <div className="space-y-5">
            <div>
              <CardTitle className="mb-3">写作风格模式</CardTitle>
              <p className="text-xs text-slate-500 mb-4">选择系统默认的写作模式。创建作品时可单独覆盖。</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <label className={`cursor-pointer rounded-lg border p-4 transition ${settings.writingMode === 'industrial' ? 'border-sky-500 bg-sky-500/10' : 'border-slate-700/40 hover:border-slate-600'}`}>
                  <input
                    type="radio"
                    name="writingMode"
                    value="industrial"
                    checked={settings.writingMode === 'industrial'}
                    onChange={() => setSettings({ ...settings, writingMode: 'industrial' })}
                    className="sr-only"
                  />
                  <div className="font-medium text-slate-200 mb-1">工业风 · 严格量产</div>
                  <div className="text-xs text-slate-400 space-y-1">
                    <p>• 8条核心规则严格执行</p>
                    <p>• 大纲必须严格遵循</p>
                    <p>• 编辑最多3轮严格评审</p>
                    <p>• 重度去AI化 + 全量ReAct评审</p>
                    <p>• 适合：商业化量产、IP开发</p>
                  </div>
                </label>
                <label className={`cursor-pointer rounded-lg border p-4 transition ${settings.writingMode === 'free' ? 'border-sky-500 bg-sky-500/10' : 'border-slate-700/40 hover:border-slate-600'}`}>
                  <input
                    type="radio"
                    name="writingMode"
                    value="free"
                    checked={settings.writingMode === 'free'}
                    onChange={() => setSettings({ ...settings, writingMode: 'free' })}
                    className="sr-only"
                  />
                  <div className="font-medium text-slate-200 mb-1">自由风 · 创意探索</div>
                  <div className="text-xs text-slate-400 space-y-1">
                    <p>• 只保留2条底线（吸引力+人物一致性）</p>
                    <p>• 大纲为参考，允许偏离和即兴</p>
                    <p>• 编辑1轮轻量检查</p>
                    <p>• 轻度去AI化，跳过proofreader</p>
                    <p>• 适合：灵感驱动、探索性写作</p>
                  </div>
                </label>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'models' && (
          <div className="space-y-5">
            <div className="p-4 bg-slate-900/40 border border-slate-700/40 rounded-lg space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-medium text-slate-200">快速切换模型</h3>
                <span className="text-xs text-slate-500">
                  当前默认: <span className="text-sky-400">{getModelCfg().defaultProvider || '未设置'}</span>
                </span>
              </div>
              <div className="text-xs text-slate-500">
                点击 Provider 展开配置面板，可选择模式、模型和目标角色，一键批量切换。
              </div>
              {providerKeys.length === 0 ? (
                <div className="text-xs text-amber-400 bg-amber-500/10 border border-amber-500/20 rounded-lg p-3">
                  尚未配置任何 Provider，请先在下方「Provider 配置」中添加模型提供商。
                </div>
              ) : (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {providerKeys.map((pk) => {
                  const pCfg = getModelCfg().providers?.[pk];
                  return (
                  <div key={pk} className="space-y-2">
                    <button
                      onClick={() => openSwitchPanel(pk)}
                      className={`w-full p-3 rounded-lg border bg-gradient-to-br from-slate-700/20 to-slate-800/20 border-slate-700/40 hover:border-sky-500/60 transition-colors text-left ${switchPanel === pk ? 'ring-2 ring-sky-500' : ''}`}
                    >
                      <div className="text-sm font-semibold text-slate-200">{pCfg?.alias || pk}</div>
                      <div className="text-xs text-slate-400">{pCfg?.models?.length || 0} 个模型</div>
                    </button>
                    {switchPanel === pk && (
                      <div className="p-3 bg-slate-900/60 border border-slate-700/40 rounded-lg space-y-3">
                        {/* 模式选择 */}
                        <div className="space-y-1">
                          <div className="text-xs text-slate-400">分配模式</div>
                          <div className="flex gap-2 flex-wrap">
                            {[
                              { key: 'smart', label: '智能分配' },
                              { key: 'uniform', label: '统一模型' },
                              { key: 'custom', label: '自定义' },
                            ].map((m) => (
                              <label key={m.key} className={`cursor-pointer text-xs px-2 py-1 rounded border transition ${switchMode === m.key ? 'bg-sky-500/20 border-sky-500 text-sky-300' : 'border-slate-700 text-slate-400 hover:border-slate-500'}`}>
                                <input
                                  type="radio"
                                  name={`switch-mode-${pk}`}
                                  value={m.key}
                                  checked={switchMode === m.key}
                                  onChange={() => setSwitchMode(m.key)}
                                  className="sr-only"
                                />
                                {m.label}
                              </label>
                            ))}
                          </div>
                        </div>

                        {/* 统一模型选择 */}
                        {switchMode === 'uniform' && (
                          <div className="space-y-1">
                            <div className="text-xs text-slate-400">统一使用模型</div>
                            <Input
                              list={`model-suggestions-${pk}`}
                              value={switchUniformModel}
                              onChange={(e) => setSwitchUniformModel(e.target.value)}
                              placeholder="输入或选择模型"
                              className="text-xs"
                            />
                            <datalist id={`model-suggestions-${pk}`}>
                              {getModelSuggestions(pk).map((m) => (
                                <option key={m} value={m} />
                              ))}
                            </datalist>
                          </div>
                        )}

                        {/* 自定义模型 */}
                        {switchMode === 'custom' && (
                          <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                            <div className="flex items-center justify-between">
                              <div className="text-xs text-slate-400">角色模型映射</div>
                              <button
                                className="text-xs text-sky-400 hover:text-sky-300"
                                onClick={() => applySmartFill(pk)}
                              >
                                智能填充
                              </button>
                            </div>
                            {ALL_ROLES.map((role) => (
                              <div key={role} className="flex items-center gap-2">
                                <span className="text-xs text-slate-300 w-20 truncate">{ROLE_LABELS[role]}</span>
                                <Input
                                  list={`model-suggestions-${pk}`}
                                  value={switchCustomMap[role] || ''}
                                  onChange={(e) => setSwitchCustomMap((prev) => ({ ...prev, [role]: e.target.value }))}
                                  placeholder="输入或选择模型"
                                  className="flex-1 text-xs py-1"
                                />
                              </div>
                            ))}
                            <datalist id={`model-suggestions-${pk}`}>
                              {getModelSuggestions(pk).map((m) => (
                                <option key={m} value={m} />
                              ))}
                            </datalist>
                          </div>
                        )}

                        {/* 角色选择 */}
                        <div className="space-y-1">
                          <div className="flex items-center justify-between">
                            <div className="text-xs text-slate-400">目标角色 ({switchSelectedRoles.length}/{ALL_ROLES.length})</div>
                            <div className="flex gap-2">
                              <button className="text-xs text-sky-400 hover:text-sky-300" onClick={() => setSwitchSelectedRoles([...ALL_ROLES])}>全选</button>
                              <button className="text-xs text-slate-500 hover:text-slate-300" onClick={() => setSwitchSelectedRoles([])}>清空</button>
                            </div>
                          </div>
                          <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto">
                            {ALL_ROLES.map((role) => (
                              <label key={role} className={`cursor-pointer text-xs px-2 py-0.5 rounded border transition ${switchSelectedRoles.includes(role) ? 'bg-sky-500/20 border-sky-500 text-sky-300' : 'border-slate-700 text-slate-500 hover:border-slate-500'}`}>
                                <input
                                  type="checkbox"
                                  checked={switchSelectedRoles.includes(role)}
                                  onChange={(e) => {
                                    if (e.target.checked) {
                                      setSwitchSelectedRoles((prev) => [...prev, role]);
                                    } else {
                                      setSwitchSelectedRoles((prev) => prev.filter((r) => r !== role));
                                    }
                                  }}
                                  className="sr-only"
                                />
                                {ROLE_LABELS[role]}
                              </label>
                            ))}
                          </div>
                        </div>

                        {/* 应用按钮 */}
                        <div className="flex gap-2">
                          <Button size="sm" variant="primary" onClick={() => handleSwitchProvider(pk)}>
                            应用切换
                          </Button>
                          <Button size="sm" variant="secondary" onClick={() => setSwitchPanel(null)}>
                            取消
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                )})}
              </div>
            )}
            </div>

            <div>
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-medium text-slate-200">Provider 配置</h3>
                <Button size="sm" onClick={addProvider}>添加 Provider</Button>
              </div>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {providerKeys.map((pk) => {
                  const p = getModelCfg().providers[pk];
                  return (
                    <div key={pk} className="p-4 bg-slate-900/40 border border-slate-700/40 rounded-lg space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            checked={!!p.enabled}
                            onChange={(e) => updateProvider(pk, 'enabled', e.target.checked)}
                            className="w-4 h-4 accent-sky-500"
                          />
                          <Input
                            value={p.alias || ''}
                            onChange={(e) => updateProvider(pk, 'alias', e.target.value)}
                            placeholder="显示名称"
                            className="w-28 text-sm py-0.5"
                          />
                          <span className="text-xs text-slate-500">({pk})</span>
                        </div>
                        <Button variant="danger" size="sm" onClick={() => removeProvider(pk)}>删除</Button>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        <Input value={p.baseURL || ''} onChange={(e) => updateProvider(pk, 'baseURL', e.target.value)} placeholder="Base URL" />
                        <div className="flex gap-2">
                          <Input type="password" value={p.apiKey || ''} onChange={(e) => updateProvider(pk, 'apiKey', e.target.value)} placeholder="API Key" />
                          <Button size="sm" onClick={() => handleTestProvider(pk)} disabled={testStatus[pk]?.type === 'loading'}>
                            {testStatus[pk]?.type === 'loading' ? '测试中...' : '测试'}
                          </Button>
                          <Button size="sm" variant="secondary" onClick={() => handleTestModels(pk)} disabled={modelsTestStatus[pk]?.type === 'loading'}>
                            {modelsTestStatus[pk]?.type === 'loading' ? '批量测试中...' : '测所有模型'}
                          </Button>
                        </div>
                      </div>
                      {testStatus[pk]?.type === 'success' && (
                        <div className="text-xs text-green-400">✅ 测试成功：{testStatus[pk].msg}</div>
                      )}
                      {testStatus[pk]?.type === 'error' && (
                        <div className="text-xs text-red-400">❌ 测试失败：{testStatus[pk].msg}</div>
                      )}
                      {modelsTestStatus[pk]?.type === 'done' && (
                        <div className="space-y-1">
                          <div className="text-xs text-slate-400">模型可用性检测结果：</div>
                          <div className="grid grid-cols-1 gap-1">
                            {modelsTestStatus[pk].results.map((r) => (
                              <div key={r.model} className={`text-xs flex items-center gap-2 ${r.valid ? 'text-green-400' : 'text-red-400'}`}>
                                <span>{r.valid ? '✅' : '❌'}</span>
                                <span className="font-mono">{r.model}</span>
                                {r.valid ? (
                                  <span className="text-slate-500">{r.durationMs}ms · {r.response}</span>
                                ) : (
                                  <span className="text-slate-500">{r.error}</span>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                      {modelsTestStatus[pk]?.type === 'error' && (
                        <div className="text-xs text-red-400">❌ 批量测试失败：{modelsTestStatus[pk].msg}</div>
                      )}

                      {/* 模型列表管理 */}
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <div className="text-xs text-slate-400">可用模型</div>
                          <div className="text-xs text-slate-500">
                            {(p.models || []).length} 个
                          </div>
                        </div>
                        <div className="space-y-1">
                          {(p.models || []).map((model, idx) => {
                            const testResult = modelsTestStatus[pk]?.type === 'done'
                              ? modelsTestStatus[pk].results.find((r) => r.model === model)
                              : null;
                            return (
                              <div key={`${model}-${idx}`} className="flex items-center gap-2 bg-slate-900/60 rounded px-2 py-1.5">
                                <span className="text-xs text-slate-200 font-mono flex-1 truncate">{model}</span>
                                {testResult && (
                                  <span className={`text-xs ${testResult.valid ? 'text-green-400' : 'text-red-400'}`} title={testResult.valid ? '可用' : testResult.error}>
                                    {testResult.valid ? '✅' : '❌'}
                                  </span>
                                )}
                                <button
                                  className="text-xs text-slate-500 hover:text-red-400 px-1"
                                  onClick={() => {
                                    const next = [...(p.models || [])];
                                    next.splice(idx, 1);
                                    updateProvider(pk, 'models', next);
                                  }}
                                  title="删除"
                                >
                                  ×
                                </button>
                              </div>
                            );
                          })}
                        </div>
                        <div className="flex gap-2">
                          <Input
                            id={`add-model-${pk}`}
                            placeholder="输入模型名称"
                            className="text-xs flex-1"
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') {
                                e.preventDefault();
                                const input = document.getElementById(`add-model-${pk}`);
                                const val = input?.value?.trim();
                                if (val && !(p.models || []).includes(val)) {
                                  updateProvider(pk, 'models', [...(p.models || []), val]);
                                  input.value = '';
                                }
                              }
                            }}
                          />
                          <Button
                            size="sm"
                            onClick={() => {
                              const input = document.getElementById(`add-model-${pk}`);
                              const val = input?.value?.trim();
                              if (val && !(p.models || []).includes(val)) {
                                updateProvider(pk, 'models', [...(p.models || []), val]);
                                input.value = '';
                              }
                            }}
                          >
                            添加
                          </Button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
              <div className="text-xs text-slate-500 mt-2">
                提示：百炼、Kimi、MiniMax、Doubao 等均通过 OpenAI 兼容接口接入，请将 Provider 类型选择为 openai 并填写对应的 BaseURL 与 API Key。
              </div>
            </div>

            <div className="p-4 bg-slate-900/40 border border-slate-700/40 rounded-lg space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-medium text-slate-200">作者轮换模型</h3>
                  <input
                    type="checkbox"
                    checked={!!getModelCfg().writerRotation?.enabled}
                    onChange={(e) => updateWriterRotation('enabled', e.target.checked)}
                    className="w-4 h-4 accent-sky-500"
                  />
                  <span className="text-xs text-slate-400">{getModelCfg().writerRotation?.enabled ? '已启用' : '未启用'}</span>
                </div>
                <Button size="sm" onClick={addRotationItem}>添加模型</Button>
              </div>
              <div className="text-xs text-slate-500">
                启用后，第 1 章使用列表第 1 个模型，第 2 章使用第 2 个模型，依此类推循环切换。同一章内的初稿与改稿将使用同一模型，保证风格一致。
              </div>
              <div className="space-y-2">
                {(getModelCfg().writerRotation?.models || []).map((item, idx) => (
                  <div key={idx} className="grid grid-cols-1 sm:grid-cols-5 gap-2 items-center p-2 bg-slate-900/60 rounded border border-slate-700/40">
                    <div className="sm:col-span-1">
                      <Input value={item.alias || ''} onChange={(e) => updateRotationItem(idx, 'alias', e.target.value)} placeholder="别名" />
                    </div>
                    <div className="sm:col-span-1">
                      <select
                        value={item.provider || ''}
                        onChange={(e) => updateRotationItem(idx, 'provider', e.target.value)}
                        className="w-full bg-slate-900 border border-slate-700 text-slate-200 text-sm rounded px-2 py-1.5"
                      >
                        {providerKeys.map((pk) => (
                          <option key={pk} value={pk}>{getModelCfg().providers[pk].alias || pk}</option>
                        ))}
                      </select>
                    </div>
                    <div className="sm:col-span-1">
                      <Input value={item.model || ''} onChange={(e) => updateRotationItem(idx, 'model', e.target.value)} placeholder="模型名称" />
                    </div>
                    <div className="sm:col-span-1 flex items-center gap-2">
                      <input
                        type="range"
                        min={0}
                        max={2}
                        step={0.05}
                        value={typeof item.temperature === 'number' ? item.temperature : 0.85}
                        onChange={(e) => updateRotationItem(idx, 'temperature', parseFloat(e.target.value))}
                        className="w-24 accent-sky-500"
                      />
                      <span className="text-xs text-slate-400 w-10">{(typeof item.temperature === 'number' ? item.temperature : 0.85).toFixed(2)}</span>
                    </div>
                    <div className="sm:col-span-1 text-right">
                      <Button variant="danger" size="sm" onClick={() => removeRotationItem(idx)}>删除</Button>
                    </div>
                  </div>
                ))}
                {!(getModelCfg().writerRotation?.models || []).length && (
                  <div className="text-xs text-slate-500 italic">暂无轮换模型，点击“添加模型”开始配置。</div>
                )}
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-medium text-slate-200">角色默认模型与温度</h3>
                <div className="flex gap-2 flex-wrap">
                  <Button size="sm" onClick={() => { setShowAddRole(!showAddRole); setShowBatchReplace(false); }}>
                    {showAddRole ? '取消' : '添加角色'}
                  </Button>
                  <Button size="sm" variant="secondary" onClick={() => { setShowBatchReplace(!showBatchReplace); setShowAddRole(false); }}>
                    {showBatchReplace ? '取消' : '批量替换'}
                  </Button>
                  <Button size="sm" variant="secondary" onClick={applyBestPracticeTemperatures}>应用最佳实践温度</Button>
                </div>
              </div>

              {/* 添加角色面板 */}
              {showAddRole && (
                <div className="p-3 bg-slate-900/40 border border-slate-700/40 rounded-lg mb-3 space-y-2">
                  <div className="text-xs text-slate-400">选择要添加的角色</div>
                  <div className="flex gap-2">
                    <select
                      value={newRoleKey}
                      onChange={(e) => setNewRoleKey(e.target.value)}
                      className="flex-1 bg-slate-900 border border-slate-700 text-slate-200 text-sm rounded px-2 py-1"
                    >
                      <option value="">-- 选择角色 --</option>
                      {ALL_ROLES.filter((r) => !getModelCfg().roleDefaults?.[r]).map((r) => (
                        <option key={r} value={r}>{ROLE_LABELS[r]}</option>
                      ))}
                    </select>
                    <Button
                      size="sm"
                      disabled={!newRoleKey}
                      onClick={() => {
                        if (newRoleKey) {
                          addRole(newRoleKey);
                          setNewRoleKey('');
                          setShowAddRole(false);
                        }
                      }}
                    >
                      添加
                    </Button>
                  </div>
                  {ALL_ROLES.filter((r) => !getModelCfg().roleDefaults?.[r]).length === 0 && (
                    <div className="text-xs text-slate-500">所有角色均已配置。</div>
                  )}
                </div>
              )}

              {/* 批量替换面板 */}
              {showBatchReplace && (
                <div className="p-3 bg-slate-900/40 border border-slate-700/40 rounded-lg mb-3 space-y-2">
                  <div className="text-xs text-slate-400">批量替换角色配置</div>
                  <div className="flex gap-2 flex-wrap items-center">
                    <select
                      value={batchReplaceType}
                      onChange={(e) => { setBatchReplaceType(e.target.value); setBatchReplaceOld(''); setBatchReplaceNew(''); }}
                      className="bg-slate-900 border border-slate-700 text-slate-200 text-sm rounded px-2 py-1"
                    >
                      <option value="provider">替换 Provider</option>
                      <option value="model">替换模型</option>
                    </select>
                    <Input
                      value={batchReplaceOld}
                      onChange={(e) => setBatchReplaceOld(e.target.value)}
                      placeholder={batchReplaceType === 'provider' ? '原 Provider（* 表示全部）' : '原模型名（* 表示全部）'}
                      className="w-40 text-xs"
                    />
                    <span className="text-xs text-slate-500">→</span>
                    <Input
                      value={batchReplaceNew}
                      onChange={(e) => setBatchReplaceNew(e.target.value)}
                      placeholder={batchReplaceType === 'provider' ? '新 Provider' : '新模型名'}
                      className="w-40 text-xs"
                    />
                    <Button
                      size="sm"
                      disabled={!batchReplaceOld || !batchReplaceNew}
                      onClick={() => {
                        if (batchReplaceType === 'provider') {
                          batchReplaceRoleProvider(batchReplaceOld, batchReplaceNew);
                        } else {
                          batchReplaceRoleModel(batchReplaceOld, batchReplaceNew);
                        }
                        setBatchReplaceOld('');
                        setBatchReplaceNew('');
                        setShowBatchReplace(false);
                      }}
                    >
                      确认替换
                    </Button>
                  </div>
                </div>
              )}

              <div className="overflow-x-auto">
                <table className="min-w-full text-sm border border-slate-700/40 rounded-lg">
                  <thead className="bg-slate-900/60 text-slate-300">
                    <tr>
                      <th className="text-left px-3 py-2 font-medium">角色</th>
                      <th className="text-left px-3 py-2 font-medium">Provider</th>
                      <th className="text-left px-3 py-2 font-medium">模型</th>
                      <th className="text-left px-3 py-2 font-medium">温度</th>
                      <th className="text-left px-3 py-2 font-medium w-16">操作</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-700/40">
                    {roleEntries.map(([role, cfg]) => (
                      <tr key={role} className="bg-slate-900/20">
                        <td className="px-3 py-2 text-slate-200 whitespace-nowrap">{ROLE_LABELS[role] || role}</td>
                        <td className="px-3 py-2">
                          <select
                            value={cfg.provider || ''}
                            onChange={(e) => updateRole(role, 'provider', e.target.value)}
                            className="bg-slate-900 border border-slate-700 text-slate-200 text-sm rounded px-2 py-1"
                          >
                            {providerKeys.map((pk) => (
                              <option key={pk} value={pk}>{getModelCfg().providers[pk].alias || pk}</option>
                            ))}
                          </select>
                        </td>
                        <td className="px-3 py-2">
                          <Input value={cfg.model || ''} onChange={(e) => updateRole(role, 'model', e.target.value)} placeholder="模型名称" className="w-40" />
                        </td>
                        <td className="px-3 py-2">
                          <div className="flex items-center gap-3">
                            <input
                              type="range"
                              min={0}
                              max={2}
                              step={0.05}
                              value={typeof cfg.temperature === 'number' ? cfg.temperature : 0.7}
                              onChange={(e) => updateRole(role, 'temperature', parseFloat(e.target.value))}
                              className="w-24 accent-sky-500"
                            />
                            <span className="text-xs text-slate-400 w-10">{(typeof cfg.temperature === 'number' ? cfg.temperature : 0.7).toFixed(2)}</span>
                          </div>
                        </td>
                        <td className="px-3 py-2">
                          <button
                            className="text-xs text-slate-500 hover:text-red-400 px-1"
                            onClick={() => removeRole(role)}
                            title="删除"
                          >
                            ×
                          </button>
                        </td>
                      </tr>
                    ))}
                    {roleEntries.length === 0 && (
                      <tr>
                        <td colSpan={5} className="px-3 py-4 text-xs text-slate-500 text-center">暂无角色配置，点击「添加角色」开始配置。</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
              <div className="text-xs text-slate-500 mt-2">
                最佳实践：创作类角色（作者、编辑、润色）建议温度 0.8~0.9；审核/评审/结构类角色建议温度 0~0.3，以降低幻觉并提高稳定性。
              </div>
            </div>
          </div>
        )}

        {activeTab === 'chapter' && (
          <div className="space-y-5">
            <div>
              <CardTitle className="mb-3">章节字数配置</CardTitle>
              <p className="text-xs text-slate-500 mb-4">这些配置会同时影响 Prompt 模板中的字数要求和 Fitness 评估的目标字数。</p>
              {(() => {
                const cfg = settings.chapterConfig || {};
                const defaults = { targetWords: 2000, minWords: 1800, maxWords: 2200, absoluteMin: 1600, absoluteMax: 2500 };
                const updateChapterCfg = (field, value) => {
                  const num = parseInt(value, 10);
                  setSettings({
                    ...settings,
                    chapterConfig: { ...cfg, [field]: isNaN(num) ? defaults[field] : num },
                  });
                };
                return (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-slate-900/40 border border-slate-700/40 rounded-lg p-4">
                      <label className="text-sm text-slate-300 block mb-1">目标字数</label>
                      <p className="text-xs text-slate-500 mb-2">Prompt 中要求 AI 写作的目标字数</p>
                      <Input type="number" value={cfg.targetWords ?? defaults.targetWords} onChange={(e) => updateChapterCfg('targetWords', e.target.value)} />
                    </div>
                    <div className="bg-slate-900/40 border border-slate-700/40 rounded-lg p-4">
                      <label className="text-sm text-slate-300 block mb-1">允许最小字数</label>
                      <p className="text-xs text-slate-500 mb-2">Prompt 中允许的字数下限</p>
                      <Input type="number" value={cfg.minWords ?? defaults.minWords} onChange={(e) => updateChapterCfg('minWords', e.target.value)} />
                    </div>
                    <div className="bg-slate-900/40 border border-slate-700/40 rounded-lg p-4">
                      <label className="text-sm text-slate-300 block mb-1">允许最大字数</label>
                      <p className="text-xs text-slate-500 mb-2">Prompt 中允许的字数上限</p>
                      <Input type="number" value={cfg.maxWords ?? defaults.maxWords} onChange={(e) => updateChapterCfg('maxWords', e.target.value)} />
                    </div>
                    <div className="bg-slate-900/40 border border-slate-700/40 rounded-lg p-4">
                      <label className="text-sm text-slate-300 block mb-1">绝对最小字数</label>
                      <p className="text-xs text-slate-500 mb-2">Prompt 中禁止低于的字数（硬下限）</p>
                      <Input type="number" value={cfg.absoluteMin ?? defaults.absoluteMin} onChange={(e) => updateChapterCfg('absoluteMin', e.target.value)} />
                    </div>
                    <div className="bg-slate-900/40 border border-slate-700/40 rounded-lg p-4">
                      <label className="text-sm text-slate-300 block mb-1">绝对最大字数</label>
                      <p className="text-xs text-slate-500 mb-2">Prompt 中禁止高于的字数（硬上限）</p>
                      <Input type="number" value={cfg.absoluteMax ?? defaults.absoluteMax} onChange={(e) => updateChapterCfg('absoluteMax', e.target.value)} />
                    </div>
                  </div>
                );
              })()}
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}
