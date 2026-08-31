// @ts-nocheck
import { useEffect, useState } from 'react';
import { Card, CardTitle, CardHeader } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Textarea } from '../components/ui/Input';
import * as api from '../api/novel';
import { useI18n } from '../contexts/I18nContext';

export function SettingsPage() {
  const { t } = useI18n();
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState('');
  const [activeTab, setActiveTab] = useState('skill');

  const [pipeline, setPipeline] = useState({ stages: {}, plan: { enabled: false } });

  useEffect(() => {
    api.getSettings()
      .then((data) => setSettings(data))
      .catch((e) => setStatus(t('status_load_failed') + e.message));
    api.getEnginePipeline()
      .then((data) => {
        if (data.pipeline) setPipeline(data.pipeline);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const handleSavePipeline = async () => {
    setStatus('');
    try {
      await api.saveEnginePipeline(pipeline);
      setStatus(t('msg_pipeline_saved'));
    } catch (e) {
      setStatus(t('err_pipeline_save') + e.message);
    }
  };

  const handleSave = async () => {
    if (!settings) return;
    setSaving(true);
    setStatus('');
    try {
      await api.saveSettings(settings);
      setStatus(t('msg_save_success'));
    } catch (e) {
      setStatus(t('err_save') + e.message);
    } finally {
      setSaving(false);
    }
  };

  const handleSaveModelLibrary = async () => {
    setStatus('');
    try {
      await api.saveModelLibrary(modelLibrary);
      setStatus(t('msg_model_lib_saved'));
    } catch (e) {
      setStatus(t('err_model_lib_save') + e.message);
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
      const providers = { ...mc.providers, [key]: { enabled: true, alias: t('label_new_provider'), apiKey: '', baseURL: '', models: [] } };
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
    setStatus(t('msg_temp_applied'));
  };

  // ---- agentModels helpers ----
  const AGENT_ROLES = ['writer', 'editor', 'humanizer', 'proofreader', 'reader', 'summarizer', 'polish'];
  const getAgentModels = () => getModelCfg().agentModels || {};
  const updateAgentModel = (role, field, value) => {
    setModelCfg((mc) => {
      const am = { ...mc.agentModels };
      am[role] = { ...(am[role] || {}), [field]: value };
      return { ...mc, agentModels: am };
    });
  };
  const syncAgentModelsFromRoles = () => {
    setModelCfg((mc) => {
      const am = {};
      AGENT_ROLES.forEach((role) => {
        const roleCfg = mc.roleDefaults?.[role];
        if (roleCfg) {
          am[role] = {
            provider: roleCfg.provider || '',
            model: roleCfg.model || '',
            temperature: typeof roleCfg.temperature === 'number' ? roleCfg.temperature : 0.7,
          };
        }
      });
      return { ...mc, agentModels: am };
    });
    setStatus(t('msg_synced_agent'));
  };
  const clearAgentModels = () => {
    setModelCfg((mc) => ({ ...mc, agentModels: {} }));
    setStatus(t('msg_cleared_agent'));
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
      list.push({ provider: '', model: '', temperature: 0.85, alias: t('label_writer') + (list.length + 1) });
      return { ...mc, writerRotation: { ...mc.writerRotation, models: list } };
    });
  };

  const [testStatus, setTestStatus] = useState({});
  const [modelLibrary, setModelLibrary] = useState([]);
  const [selectedRoles, setSelectedRoles] = useState([]);
  const [batchProvider, setBatchProvider] = useState('');
  const [batchModel, setBatchModel] = useState('');
  const [batchTemperature, setBatchTemperature] = useState(0.7);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [editingLibIndex, setEditingLibIndex] = useState(null);
  const [libForm, setLibForm] = useState({ key: '', name: '', url: '', modelsText: '' });

  useEffect(() => {
    api.getModelLibrary()
      .then((data) => setModelLibrary(Array.isArray(data) ? data : []))
      .catch(() => setModelLibrary([]));
  }, []);

  const handleSwitchProvider = async (provider) => {
    setStatus(t('status_switching_to') + provider + '...');
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
      setStatus(t('status_switched_to') + provider + ' (' + switchSelectedRoles.length + t('unit_roles') + ')');
      setSwitchPanel(null);
    } catch (err) {
      setStatus(t('err_switch') + err.message);
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
        {t('status_loading_config')}
      </div>
    );
  }

  if (!settings) {
    return <div className="text-slate-400 text-sm">{t('t_86svzm')}</div>;
  }

  const tabs = [
    { key: 'skill', label: t('tab_skill') },
    { key: 'review', label: t('tab_review') },
    { key: 'author', label: t('tab_author') },
    { key: 'platform', label: t('tab_platform') },
    { key: 'chapter', label: t('tab_chapter') },
    { key: 'writing', label: t('tab_writing') },
    { key: 'models', label: t('tab_models') },
    { key: 'pipeline', label: t('tab_pipeline') },
  ];

  const presetOptions = [
    { value: '8', label: t('preset_8') },
    { value: '15', label: t('preset_15') },
    { value: '33', label: t('preset_33') },
  ];

  const handlePresetChange = async (e) => {
    const preset = e.target.value;
    setStatus(t('status_switching_preset'));
    try {
      const result = await api.setReviewPreset(preset);
      setSettings((prev) => ({
        ...prev,
        reviewPreset: result.reviewPreset,
        reviewDimensions: result.reviewDimensions,
        skill: result.skill,
      }));
      setStatus(t('status_switched_to') + presetOptions.find((o) => o.value === preset)?.label);
    } catch (err) {
      setStatus(t('err_switch') + err.message);
    }
  };

  const providerKeys = Object.keys(getModelCfg().providers || {});
  const roleEntries = Object.entries(getModelCfg().roleDefaults || {});
  const ROLE_LABELS = {
    writer: t('role_writer'),
    editor: t('role_editor'),
    humanizer: t('role_humanizer'),
    proofreader: t('role_proofreader'),
    polish: t('role_polish'),
    reader: t('role_reader'),
    summarizer: t('role_summarizer'),
    outline: t('role_outline'),
    planner: t('role_planner'),
    reviewer: t('role_reviewer'),
    product: t('role_product'),
    tech: t('role_tech'),
    reviser: t('role_reviser'),
    synthesis: t('role_synthesis'),
    repetitionRepair: t('role_repetition_repair'),
    deviationCheck: t('role_deviation_check'),
    styleCorrect: t('role_style_correct'),
    promptEvolve: t('role_prompt_evolve'),
    fitnessEvaluate: t('role_fitness_evaluate'),
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
          <CardTitle className="mb-0">{t('t_ap42q9')}</CardTitle>
          <Button variant="primary" size="sm" onClick={handleSave} disabled={saving}>{t('t_agor7v')}</Button>
        </CardHeader>
        {status && <div className={`text-sm mb-3 ${status.includes(t('status_failed')) ? 'text-red-400' : 'text-green-400'}`}>{status}</div>}

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
              <label className="text-sm text-slate-300">{t('t_vu3lf5')}</label>
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
            <div className="text-xs text-slate-500">{t('desc_skill_preset')}</div>
            <label className="block text-sm text-slate-300 mb-2">{t('_core_rules')}</label>
            <p className="text-xs text-slate-500 mb-2">{t('t_edas')}</p>
            <Textarea value={settings.skill || ''} onChange={(e) => setSettings({ ...settings, skill: e.target.value })} rows={12} />
          </div>
        )}

        {activeTab === 'review' && (
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <label className="text-sm text-slate-300">{t('t_vu3lf5')}</label>
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
            <div className="text-xs text-slate-500">{t('desc_preset_switch')}</div>
            <div className="flex items-center justify-between pt-2">
              <label className="block text-sm text-slate-300">{t('t_1ehzpm')}</label>
              <Button size="sm" onClick={() => addItem('reviewDimensions', { name: '新维度', description: '描述' })}>{t('t_e83g8n')}</Button>
            </div>
            <div className="space-y-2">
              {settings.reviewDimensions?.map((dim, i) => (
                <div key={i} className="grid grid-cols-1 sm:grid-cols-3 gap-2 items-start p-3 bg-slate-900/40 border border-slate-700/40 rounded-lg">
                  <div className="sm:col-span-1">
                    <Input value={dim.name} onChange={(e) => updateList('reviewDimensions', i, 'name', e.target.value)} placeholder={t("t_geq3at")} />
                  </div>
                  <div className="sm:col-span-2 flex gap-2">
                    <Input value={dim.description} onChange={(e) => updateList('reviewDimensions', i, 'description', e.target.value)} placeholder={t("t_i0jbxa")} />
                    <Button variant="danger" size="sm" onClick={() => removeItem('reviewDimensions', i)}>{t('t_eslg')}</Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'author' && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="block text-sm text-slate-300">{t('t_1gz5h5d')}</label>
              <Button size="sm" onClick={() => addItem('authorStyles', { name: '新风格', description: '' })}>{t('t_e87wfn')}</Button>
            </div>
            <div className="space-y-2">
              {settings.authorStyles?.map((s, i) => (
                <div key={i} className="grid grid-cols-1 sm:grid-cols-3 gap-2 items-start p-3 bg-slate-900/40 border border-slate-700/40 rounded-lg">
                  <div className="sm:col-span-1">
                    <Input value={s.name} onChange={(e) => updateList('authorStyles', i, 'name', e.target.value)} placeholder={t("t_jpie5t")} />
                  </div>
                  <div className="sm:col-span-2 flex gap-2">
                    <Input value={s.description} onChange={(e) => updateList('authorStyles', i, 'description', e.target.value)} placeholder={t("__prompt_")} />
                    <Button variant="danger" size="sm" onClick={() => removeItem('authorStyles', i)}>{t('t_eslg')}</Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'platform' && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="block text-sm text-slate-300">{t('t_23xo0qt')}</label>
              <Button size="sm" onClick={() => addItem('platformStyles', { name: '新平台', description: '' })}>{t('t_e7xv36')}</Button>
            </div>
            <div className="space-y-2">
              {settings.platformStyles?.map((s, i) => (
                <div key={i} className="grid grid-cols-1 sm:grid-cols-3 gap-2 items-start p-3 bg-slate-900/40 border border-slate-700/40 rounded-lg">
                  <div className="sm:col-span-1">
                    <Input value={s.name} onChange={(e) => updateList('platformStyles', i, 'name', e.target.value)} placeholder={t("t_c9kg80")} />
                  </div>
                  <div className="sm:col-span-2 flex gap-2">
                    <Input value={s.description} onChange={(e) => updateList('platformStyles', i, 'description', e.target.value)} placeholder={t("t_2g9bobb")} />
                    <Button variant="danger" size="sm" onClick={() => removeItem('platformStyles', i)}>{t('t_eslg')}</Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'writing' && (
          <div className="space-y-5">
            <div>
              <CardTitle className="mb-3">{t('t_81ufa9')}</CardTitle>
              <p className="text-xs text-slate-500 mb-4">{t('t_amn67l')}</p>
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
                  <div className="font-medium text-slate-200 mb-1">{t('t_aasjhr')}</div>
                  <div className="text-xs text-slate-400 space-y-1">
                    <p>• {t('industrial_rule_1')}</p>
                    <p>{t('t_fuy3')}</p>
                    <p>{t('t_mekb')}</p>
                    <p>{t('_ai__react')}</p>
                    <p>{t('___ip')}</p>
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
                  <div className="font-medium text-slate-200 mb-1">{t('t_arikgk')}</div>
                  <div className="text-xs text-slate-400 space-y-1">
                    <p>{t('_2_')}</p>
                    <p>{t('t_fuy3')}</p>
                    <p>{t('_1')}</p>
                    <p>{t('_ai_proofreader')}</p>
                    <p>{t('t_ebc3')}</p>
                  </div>
                </label>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'models' && (
          <div className="space-y-5">
            {/* ===== 模型库管理 ===== */}
            <div className="p-4 bg-slate-900/40 border border-slate-700/40 rounded-lg space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-medium text-slate-200">{t('t_fz0w9')}</h3>
                <div className="flex gap-2">
                  <Button size="sm" variant="secondary" onClick={handleSaveModelLibrary}>{t('t_uxccdu')}</Button>
                  <Button size="sm" onClick={() => { setEditingLibIndex(-1); setLibForm({ key: '', name: '', url: '', modelsText: '' }); }}>{t('t_ep85r8')}</Button>
                </div>
              </div>
              <div className="text-xs text-slate-500">
                {t('hint_model_library')}
              </div>

              {editingLibIndex !== null && (
                <div className="p-3 bg-slate-900/60 border border-slate-700/40 rounded-lg space-y-2">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    <Input value={libForm.key} onChange={(e) => setLibForm({ ...libForm, key: e.target.value })} placeholder={t("key_")} />
                    <Input value={libForm.name} onChange={(e) => setLibForm({ ...libForm, name: e.target.value })} placeholder={t("t_deexj3")} />
                    <Input value={libForm.url} onChange={(e) => setLibForm({ ...libForm, url: e.target.value })} placeholder={t('ph_base_url')} />
                  </div>
                  <Textarea
                    value={libForm.modelsText}
                    onChange={(e) => setLibForm({ ...libForm, modelsText: e.target.value })}
                    placeholder={t("___id__qwen_plusqwen_plus")}
                    rows={3}
                  />
                  <div className="flex gap-2">
                    <Button size="sm" onClick={() => {
                      const models = libForm.modelsText.split('\n').map((l) => l.trim()).filter(Boolean);
                      const entry = { key: libForm.key, name: libForm.name, url: libForm.url, models };
                      const next = [...modelLibrary];
                      if (editingLibIndex >= 0) {
                        next[editingLibIndex] = entry;
                      } else {
                        next.push(entry);
                      }
                      setModelLibrary(next);
                      setEditingLibIndex(null);
                    }}>
                      {editingLibIndex >= 0 ? t('btn_update') : t('btn_add')}
                    </Button>
                    <Button size="sm" variant="secondary" onClick={() => setEditingLibIndex(null)}>{t('t_ev02')}</Button>
                  </div>
                </div>
              )}

              <div className="overflow-x-auto">
                <table className="min-w-full text-sm border border-slate-700/40 rounded-lg">
                  <thead className="bg-slate-900/60 text-slate-300">
                    <tr>
                      <th className="text-left px-3 py-2 font-medium">{t('t_eyrn')}</th>
                      <th className="text-left px-3 py-2 font-medium">Key</th>
                      <th className="text-left px-3 py-2 font-medium">URL</th>
                      <th className="text-left px-3 py-2 font-medium">{t('t_fz292')}</th>
                      <th className="text-left px-3 py-2 font-medium w-24">{t('t_hkxb')}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-700/40">
                    {modelLibrary.map((lib, idx) => (
                      <tr key={lib.key} className="bg-slate-900/20">
                        <td className="px-3 py-2 text-slate-200">{lib.name}</td>
                        <td className="px-3 py-2 text-xs text-slate-400 font-mono">{lib.key}</td>
                        <td className="px-3 py-2 text-xs text-slate-400 truncate max-w-xs">{lib.url}</td>
                        <td className="px-3 py-2 text-xs text-slate-400">{(lib.models || []).length}</td>
                        <td className="px-3 py-2">
                          <div className="flex gap-2">
                            <button className="text-xs text-sky-400 hover:text-sky-300" onClick={() => {
                              setEditingLibIndex(idx);
                              setLibForm({
                                key: lib.key,
                                name: lib.name,
                                url: lib.url || '',
                                modelsText: (lib.models || []).join('\n'),
                              });
                            }}>{t('t_mekb')}</button>
                            <button className="text-xs text-slate-500 hover:text-red-400" onClick={() => {
                              const next = [...modelLibrary];
                              next.splice(idx, 1);
                              setModelLibrary(next);
                            }}>{t('t_eslg')}</button>
                          </div>
                        </td>
                      </tr>
                    ))}
                    {modelLibrary.length === 0 && (
                      <tr>
                        <td colSpan={5} className="px-3 py-4 text-xs text-slate-500 text-center">{t('t_ep85r8')}</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* ===== Provider 配置 ===== */}
            <div className="p-4 bg-slate-900/40 border border-slate-700/40 rounded-lg space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-medium text-slate-200">{t('provider_')}</h3>
                <Button size="sm" onClick={addProvider}>{t('_provider')}</Button>
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
                            placeholder={t("t_deexj3")}
                            className="w-28 text-sm py-0.5"
                          />
                          <span className="text-xs text-slate-500">({pk})</span>
                        </div>
                        <Button variant="danger" size="sm" onClick={() => removeProvider(pk)}>{t('t_eslg')}</Button>
                      </div>
                      <div className="grid grid-cols-1 gap-2">
                        <div className="flex gap-2">
                          <select
                            className="flex-1 bg-slate-900 border border-slate-700 text-slate-200 text-sm rounded px-2 py-1.5"
                            value=""
                            onChange={(e) => {
                              const key = e.target.value;
                              if (!key || key === '__custom__') return;
                              const lib = modelLibrary.find((l) => l.key === key);
                              if (lib) {
                                updateProvider(pk, 'alias', lib.name);
                                updateProvider(pk, 'baseURL', lib.url);
                                updateProvider(pk, 'models', [...(lib.models || [])]);
                              }
                              e.target.value = '';
                            }}
                          >
                            <option value="">{t('t_daba7p')}</option>
                            {modelLibrary.map((lib) => (
                              <option key={lib.key} value={lib.key}>{lib.name}</option>
                            ))}
                            <option value="__custom__">{t('t_jh1ll')}</option>
                          </select>
                        </div>
                        <Input value={p.baseURL || ''} onChange={(e) => updateProvider(pk, 'baseURL', e.target.value)} placeholder={t('ph_base_url')} />
                        <div className="flex gap-2">
                          <Input type="password" value={p.apiKey || ''} onChange={(e) => updateProvider(pk, 'apiKey', e.target.value)} placeholder={t("api_key_")} className="flex-1" />
                          <Button size="sm" onClick={() => handleTestProvider(pk)} disabled={testStatus[pk]?.type === 'loading'}>
                            {testStatus[pk]?.type === 'loading' ? t('status_testing') : t('btn_test')}
                          </Button>
                        </div>
                      </div>
                      {testStatus[pk]?.type === 'success' && (
                        <div className="text-xs text-green-400">{t('t_jcve')}</div>
                      )}
                      {testStatus[pk]?.type === 'error' && (
                        <div className="text-xs text-red-400">{t('t_fy1g')}</div>
                      )}

                      {/* 默认模型 */}
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-slate-400">{t('t_km7tcm')}</span>
                        <select
                          className="bg-slate-900 border border-slate-700 text-slate-200 text-xs rounded px-2 py-1 flex-1"
                          value={p.defaultModel || ''}
                          onChange={(e) => updateProvider(pk, 'defaultModel', e.target.value)}
                        >
                          <option value="">{t('t_673j0w')}</option>
                          {(p.models || []).map((m) => (
                            <option key={m} value={m}>{m}</option>
                          ))}
                        </select>
                      </div>

                      {/* 可用模型 */}
                      <div className="space-y-2">
                        <div className="text-xs text-slate-400">{t('t_ij62')}</div>
                        <div className="flex flex-wrap gap-1">
                          {(p.models || []).map((m, idx) => (
                            <span key={idx} className="text-xs bg-slate-800 border border-slate-700 rounded px-2 py-0.5 text-slate-300 flex items-center gap-1">
                              {m}
                              <button
                                className="text-slate-500 hover:text-red-400"
                                onClick={() => {
                                  const next = [...(p.models || [])];
                                  next.splice(idx, 1);
                                  updateProvider(pk, 'models', next);
                                }}
                              >×</button>
                            </span>
                          ))}
                        </div>
                        <div className="flex gap-2">
                          <Input
                            id={`add-model-${pk}`}
                            placeholder={t("_id__qwen34b")}
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
                            {t('btn_add_short')}
                          </Button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
              {providerKeys.length === 0 && (
                <div className="text-xs text-slate-500 text-center py-4">{t('_provider__provider_')}</div>
              )}
            </div>

            {/* ===== 默认 Provider ===== */}
            <div className="p-4 bg-slate-900/40 border border-slate-700/40 rounded-lg space-y-3">
              <h3 className="text-sm font-medium text-slate-200">{t('t_rs98')}</h3>
              <div className="flex items-center gap-3">
                <select
                  className="bg-slate-900 border border-slate-700 text-slate-200 text-sm rounded px-2 py-1.5"
                  value={getModelCfg().defaultProvider || ''}
                  onChange={(e) => setModelCfg((mc) => ({ ...mc, defaultProvider: e.target.value }))}
                >
                  <option value="">{t('t_7e1st6')}</option>
                  {providerKeys.filter((pk) => getModelCfg().providers[pk]?.enabled).map((pk) => (
                    <option key={pk} value={pk}>{getModelCfg().providers[pk].alias || pk}</option>
                  ))}
                </select>
                <span className="text-xs text-slate-500">{t('_provider__provider')}</span>
              </div>
            </div>

            {/* ===== 角色默认模型与温度 ===== */}
            <div className="p-4 bg-slate-900/40 border border-slate-700/40 rounded-lg space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-medium text-slate-200">{t('t_282azm3')}</h3>
                <div className="flex gap-2 flex-wrap">
                  <Button size="sm" variant="secondary" onClick={applyBestPracticeTemperatures}>{t('t_30tw5x7')}</Button>
                </div>
              </div>

              {/* 批量操作栏 */}
              <div className="p-3 bg-slate-900/60 border border-slate-700/40 rounded-lg space-y-2">
                <div className="text-xs text-slate-400">{t('t_o5pc')}</div>
                <div className="flex flex-wrap gap-2 items-center">
                  <select
                    className="bg-slate-900 border border-slate-700 text-slate-200 text-sm rounded px-2 py-1"
                    value={batchProvider}
                    onChange={(e) => { setBatchProvider(e.target.value); setBatchModel(''); }}
                  >
                    <option value="">Provider</option>
                    {providerKeys.map((pk) => (
                      <option key={pk} value={pk}>{getModelCfg().providers[pk].alias || pk}</option>
                    ))}
                  </select>
                  <select
                    className="bg-slate-900 border border-slate-700 text-slate-200 text-sm rounded px-2 py-1"
                    value={batchModel}
                    onChange={(e) => setBatchModel(e.target.value)}
                  >
                    <option value="">Model</option>
                    {batchProvider && (getModelCfg().providers[batchProvider]?.models || []).map((m) => (
                      <option key={m} value={m}>{m}</option>
                    ))}
                  </select>
                  <div className="flex items-center gap-2">
                    <input
                      type="range"
                      min={0}
                      max={2}
                      step={0.05}
                      value={batchTemperature}
                      onChange={(e) => setBatchTemperature(parseFloat(e.target.value))}
                      className="w-20 accent-sky-500"
                    />
                    <span className="text-xs text-slate-400 w-10">{batchTemperature.toFixed(2)}</span>
                  </div>
                  <Button
                    size="sm"
                    disabled={selectedRoles.length === 0}
                    onClick={() => {
                      setModelCfg((mc) => {
                        const roles = { ...mc.roleDefaults };
                        selectedRoles.forEach((role) => {
                          roles[role] = {
                            ...roles[role],
                            ...(batchProvider ? { provider: batchProvider } : {}),
                            ...(batchModel ? { model: batchModel } : {}),
                            temperature: batchTemperature,
                          };
                        });
                        return { ...mc, roleDefaults: roles };
                      });
                      setSelectedRoles([]);
                    }}
                  >
                    {t('btn_apply_to')}{selectedRoles.length}{t('unit_roles')}
                  </Button>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="min-w-full text-sm border border-slate-700/40 rounded-lg">
                  <thead className="bg-slate-900/60 text-slate-300">
                    <tr>
                      <th className="text-left px-2 py-2 font-medium w-8">
                        <input
                          type="checkbox"
                          checked={selectedRoles.length === ALL_ROLES.length && ALL_ROLES.length > 0}
                          onChange={(e) => setSelectedRoles(e.target.checked ? [...ALL_ROLES] : [])}
                          className="w-4 h-4 accent-sky-500"
                        />
                      </th>
                      <th className="text-left px-3 py-2 font-medium">{t('t_o5pc')}</th>
                      <th className="text-left px-3 py-2 font-medium">Provider</th>
                      <th className="text-left px-3 py-2 font-medium">{t('t_ij62')}</th>
                      <th className="text-left px-3 py-2 font-medium">{t('t_j999')}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-700/40">
                    {ALL_ROLES.map((role) => {
                      const cfg = getModelCfg().roleDefaults?.[role] || { provider: '', model: '', temperature: 0.7 };
                      const currentProvider = cfg.provider || getModelCfg().defaultProvider || '';
                      const availableModels = currentProvider ? (getModelCfg().providers[currentProvider]?.models || []) : [];
                      return (
                        <tr key={role} className="bg-slate-900/20">
                          <td className="px-2 py-2">
                            <input
                              type="checkbox"
                              checked={selectedRoles.includes(role)}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  setSelectedRoles((prev) => [...prev, role]);
                                } else {
                                  setSelectedRoles((prev) => prev.filter((r) => r !== role));
                                }
                              }}
                              className="w-4 h-4 accent-sky-500"
                            />
                          </td>
                          <td className="px-3 py-2 text-slate-200 whitespace-nowrap text-xs">{ROLE_LABELS[role] || role}</td>
                          <td className="px-3 py-2">
                            <select
                              value={cfg.provider || ''}
                              onChange={(e) => updateRole(role, 'provider', e.target.value)}
                              className="bg-slate-900 border border-slate-700 text-slate-200 text-xs rounded px-2 py-1"
                            >
                              <option value="">{t('t_ij08yk')}</option>
                              {providerKeys.map((pk) => (
                                <option key={pk} value={pk}>{getModelCfg().providers[pk].alias || pk}</option>
                              ))}
                            </select>
                          </td>
                          <td className="px-3 py-2">
                            <select
                              value={cfg.model || ''}
                              onChange={(e) => updateRole(role, 'model', e.target.value)}
                              className="bg-slate-900 border border-slate-700 text-slate-200 text-xs rounded px-2 py-1 w-40"
                            >
                              <option value="">{t('t_rs98')}</option>
                              {availableModels.map((m) => (
                                <option key={m} value={m}>{m}</option>
                              ))}
                            </select>
                          </td>
                          <td className="px-3 py-2">
                            <div className="flex items-center gap-2">
                              <input
                                type="range"
                                min={0}
                                max={2}
                                step={0.05}
                                value={typeof cfg.temperature === 'number' ? cfg.temperature : 0.7}
                                onChange={(e) => updateRole(role, 'temperature', parseFloat(e.target.value))}
                                className="w-20 accent-sky-500"
                              />
                              <span className="text-xs text-slate-400 w-10">{(typeof cfg.temperature === 'number' ? cfg.temperature : 0.7).toFixed(2)}</span>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
              <div className="text-xs text-slate-500">
                {t('hint_temperature_best_practice')}
              </div>
            </div>

            {/* ===== Agent 模型分配 ===== */}
            <div className="p-4 bg-slate-900/40 border border-slate-700/40 rounded-lg space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-medium text-slate-200">{t('t_ij62')}</h3>
                  <div className="text-xs text-slate-500 mt-0.5">{t('desc_agent_models')}</div>
                </div>
                <div className="flex gap-2">
                  <Button size="sm" variant="secondary" onClick={syncAgentModelsFromRoles}>{t('t_18x5w6l')}</Button>
                  <Button size="sm" variant="secondary" onClick={clearAgentModels}>{t('t_jdw5')}</Button>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="min-w-full text-sm border border-slate-700/40 rounded-lg">
                  <thead className="bg-slate-900/60 text-slate-300">
                    <tr>
                      <th className="text-left px-3 py-2 font-medium">Agent</th>
                      <th className="text-left px-3 py-2 font-medium">Provider</th>
                      <th className="text-left px-3 py-2 font-medium">{t('t_ij62')}</th>
                      <th className="text-left px-3 py-2 font-medium">{t('t_j999')}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-700/40">
                    {AGENT_ROLES.map((role) => {
                      const cfg = getAgentModels()[role] || { provider: '', model: '', temperature: 0.7 };
                      const currentProvider = cfg.provider || getModelCfg().defaultProvider || '';
                      const availableModels = currentProvider ? (getModelCfg().providers[currentProvider]?.models || []) : [];
                      return (
                        <tr key={role} className="bg-slate-900/20">
                          <td className="px-3 py-2 text-slate-200 whitespace-nowrap text-xs">{ROLE_LABELS[role] || role}</td>
                          <td className="px-3 py-2">
                            <select
                              value={cfg.provider || ''}
                              onChange={(e) => updateAgentModel(role, 'provider', e.target.value)}
                              className="bg-slate-900 border border-slate-700 text-slate-200 text-xs rounded px-2 py-1"
                            >
                              <option value="">{t('t_q1nu10')}</option>
                              {providerKeys.map((pk) => (
                                <option key={pk} value={pk}>{getModelCfg().providers[pk].alias || pk}</option>
                              ))}
                            </select>
                          </td>
                          <td className="px-3 py-2">
                            <select
                              value={cfg.model || ''}
                              onChange={(e) => updateAgentModel(role, 'model', e.target.value)}
                              className="bg-slate-900 border border-slate-700 text-slate-200 text-xs rounded px-2 py-1 w-40"
                            >
                              <option value="">{t('t_rs98')}</option>
                              {availableModels.map((m) => (
                                <option key={m} value={m}>{m}</option>
                              ))}
                            </select>
                          </td>
                          <td className="px-3 py-2">
                            <div className="flex items-center gap-2">
                              <input
                                type="range"
                                min={0}
                                max={2}
                                step={0.05}
                                value={typeof cfg.temperature === 'number' ? cfg.temperature : 0.7}
                                onChange={(e) => updateAgentModel(role, 'temperature', parseFloat(e.target.value))}
                                className="w-20 accent-sky-500"
                              />
                              <span className="text-xs text-slate-400 w-10">{(typeof cfg.temperature === 'number' ? cfg.temperature : 0.7).toFixed(2)}</span>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
              <div className="text-xs text-slate-500">{t('desc_agent_hint')}</div>
            </div>

            {/* ===== 作家轮换（高级选项） ===== */}
            <div className="p-4 bg-slate-900/40 border border-slate-700/40 rounded-lg space-y-3">
              <div className="flex items-center justify-between cursor-pointer" onClick={() => setShowAdvanced(!showAdvanced)}>
                <h3 className="text-sm font-medium text-slate-200">{t('t_ij62')}</h3>
                <span className="text-xs text-slate-500">{showAdvanced ? t('btn_collapse') : t('btn_expand')}</span>
              </div>
              {showAdvanced && (
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={!!getModelCfg().writerRotation?.enabled}
                      onChange={(e) => updateWriterRotation('enabled', e.target.checked)}
                      className="w-4 h-4 accent-sky-500"
                    />
                    <span className="text-xs text-slate-400">{t('t_e6c0b')}</span>
                  </div>
                  <div className="text-xs text-slate-500">{t('desc_writer_rotation')}</div>
                  <div className="space-y-2">
                    {(getModelCfg().writerRotation?.models || []).map((item, idx) => (
                      <div key={idx} className="grid grid-cols-1 sm:grid-cols-5 gap-2 items-center p-2 bg-slate-900/60 rounded border border-slate-700/40">
                        <div className="sm:col-span-1">
                          <Input value={item.alias || ''} onChange={(e) => updateRotationItem(idx, 'alias', e.target.value)} placeholder={t("t_efr6")} />
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
                          <select
                            value={item.model || ''}
                            onChange={(e) => updateRotationItem(idx, 'model', e.target.value)}
                            className="w-full bg-slate-900 border border-slate-700 text-slate-200 text-sm rounded px-2 py-1.5"
                          >
                            <option value="">{t('t_il0ebu')}</option>
                            {item.provider && (getModelCfg().providers[item.provider]?.models || []).map((m) => (
                              <option key={m} value={m}>{m}</option>
                            ))}
                          </select>
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
                          <Button variant="danger" size="sm" onClick={() => removeRotationItem(idx)}>{t('t_eslg')}</Button>
                        </div>
                      </div>
                    ))}
                    {!(getModelCfg().writerRotation?.models || []).length && (
                      <div className="text-xs text-slate-500 italic">{t('t_e7zvbj')}</div>
                    )}
                  </div>
                  <Button size="sm" onClick={addRotationItem}>{t('t_e7zvbj')}</Button>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'chapter' && (
          <div className="space-y-5">
            <div>
              <CardTitle className="mb-3">{t('t_24cv8c')}</CardTitle>
              <p className="text-xs text-slate-500 mb-4">{t('_prompt__fitness_')}</p>
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
                      <label className="text-sm text-slate-300 block mb-1">{t('t_ffp576')}</label>
                      <p className="text-xs text-slate-500 mb-2">{t('prompt__ai_')}</p>
                      <Input type="number" value={cfg.targetWords ?? defaults.targetWords} onChange={(e) => updateChapterCfg('targetWords', e.target.value)} />
                    </div>
                    <div className="bg-slate-900/40 border border-slate-700/40 rounded-lg p-4">
                      <label className="text-sm text-slate-300 block mb-1">{t('t_11w3rdr')}</label>
                      <p className="text-xs text-slate-500 mb-2">{t('desc_min_words')}</p>
                      <Input type="number" value={cfg.minWords ?? defaults.minWords} onChange={(e) => updateChapterCfg('minWords', e.target.value)} />
                    </div>
                    <div className="bg-slate-900/40 border border-slate-700/40 rounded-lg p-4">
                      <label className="text-sm text-slate-300 block mb-1">{t('t_11vofp3')}</label>
                      <p className="text-xs text-slate-500 mb-2">{t('desc_max_words')}</p>
                      <Input type="number" value={cfg.maxWords ?? defaults.maxWords} onChange={(e) => updateChapterCfg('maxWords', e.target.value)} />
                    </div>
                    <div className="bg-slate-900/40 border border-slate-700/40 rounded-lg p-4">
                      <label className="text-sm text-slate-300 block mb-1">{t('t_iv2fp8')}</label>
                      <p className="text-xs text-slate-500 mb-2">{t('prompt__')}</p>
                      <Input type="number" value={cfg.absoluteMin ?? defaults.absoluteMin} onChange={(e) => updateChapterCfg('absoluteMin', e.target.value)} />
                    </div>
                    <div className="bg-slate-900/40 border border-slate-700/40 rounded-lg p-4">
                      <label className="text-sm text-slate-300 block mb-1">{t('t_ivhrdw')}</label>
                      <p className="text-xs text-slate-500 mb-2">{t('desc_absolute_max')}</p>
                      <Input type="number" value={cfg.absoluteMax ?? defaults.absoluteMax} onChange={(e) => updateChapterCfg('absoluteMax', e.target.value)} />
                    </div>
                  </div>
                );
              })()}
            </div>
          </div>
        )}

        {activeTab === 'pipeline' && (
          <div className="space-y-5">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="mb-1">{t('t_1s4ie5y')}</CardTitle>
                <p className="text-xs text-slate-500">{t('_agent____plan_')}</p>
              </div>
              <Button size="sm" onClick={handleSavePipeline}>{t('t_e6c19q')}</Button>
            </div>

            {/* Plan 模式开关 */}
            <div className="p-4 bg-slate-900/40 border border-slate-700/40 rounded-lg space-y-3">
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  checked={!!pipeline.plan?.enabled}
                  onChange={(e) => setPipeline((p) => ({ ...p, plan: { ...(p.plan || {}), enabled: e.target.checked } }))}
                  className="w-4 h-4 accent-sky-500"
                />
                <div>
                  <div className="text-sm font-medium text-slate-200">{t('plan_')}</div>
                  <div className="text-xs text-slate-500">{t('__writer')}</div>
                </div>
              </div>
            </div>

            {/* Stage 开关 */}
            <div className="p-4 bg-slate-900/40 border border-slate-700/40 rounded-lg space-y-3">
              <div className="text-sm font-medium text-slate-200 mb-2">{t('label_agent_stages')}</div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {[
                  { key: 'writer', label: t('stage_writer_label'), desc: t('stage_writer_desc') },
                  { key: 'editor', label: t('stage_editor_label'), desc: t('stage_editor_desc') },
                  { key: 'humanizer', label: t('stage_humanizer_label'), desc: t('stage_humanizer_desc') },
                  { key: 'proofreader', label: t('stage_proofreader_label'), desc: t('stage_proofreader_desc') },
                  { key: 'reader', label: t('stage_reader_label'), desc: t('stage_reader_desc') },
                  { key: 'summarizer', label: t('stage_summarizer_label'), desc: t('stage_summarizer_desc') },
                  { key: 'polish', label: t('stage_polish_label'), desc: t('stage_polish_desc') },
                ].map((stage) => {
                  const enabled = pipeline.stages?.[stage.key]?.enabled !== false;
                  return (
                    <div key={stage.key} className={`flex items-start gap-3 p-3 rounded-lg border ${enabled ? 'bg-slate-900/20 border-slate-700/30' : 'bg-slate-900/10 border-slate-700/20 opacity-60'}`}>
                      <input
                        type="checkbox"
                        checked={enabled}
                        onChange={(e) => {
                          const newStages = { ...(pipeline.stages || {}) };
                          newStages[stage.key] = { ...(newStages[stage.key] || {}), enabled: e.target.checked };
                          setPipeline({ ...pipeline, stages: newStages });
                        }}
                        className="w-4 h-4 accent-sky-500 mt-0.5"
                      />
                      <div>
                        <div className="text-xs font-medium text-slate-200">{stage.label}</div>
                        <div className="text-[10px] text-slate-500">{stage.desc}</div>
                      </div>
                    </div>
                  );
                })}
              </div>
              <div className="text-xs text-slate-500 mt-2">{t('desc_stage_hint')}</div>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}
