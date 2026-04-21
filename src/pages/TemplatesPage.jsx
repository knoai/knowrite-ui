import { useState, useEffect, useCallback } from 'react';
import { Plus, Trash2, Edit3, Sparkles, ChevronDown, ChevronRight } from 'lucide-react';
import { Card, CardHeader, CardTitle } from '../components/ui/Card';
import { Input, Textarea } from '../components/ui/Input';
import { Modal } from '../components/world/Modal';
import * as api from '../api/novel';
import { useI18n } from '../contexts/I18nContext';

const CATEGORIES = ['退婚流', '系统流', '种田流', '夺宝流', '重生流', '签到流', '凡人流', '无敌流', '后宫流', '其他'];

export function TemplatesPage() {
  const { t } = useI18n();
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [expanded, setExpanded] = useState(new Set());
  const [form, setForm] = useState({ name: '', category: '其他', description: '', exampleWorks: '', tags: '', beatStructure: [] });
  const [beatEditor, setBeatEditor] = useState({ open: false, index: -1, beat: { beat: '', chapters: '', goal: '' } });

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await api.getStoryTemplates('global');
      setTemplates(data.items || []);
    } catch (e) { console.error(e); }
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const openCreate = () => {
    setEditing(null);
    setForm({ name: '', category: '其他', description: '', exampleWorks: '', tags: '', beatStructure: [] });
    setModalOpen(true);
  };
  const openEdit = (item) => {
    setEditing(item);
    setForm({ ...item, tags: (item.tags || []).join(','), beatStructure: item.beatStructure || [] });
    setModalOpen(true);
  };

  const save = async () => {
    const body = { ...form, scope: 'global', tags: form.tags.split(',').map(s => s.trim()).filter(Boolean) };
    if (editing) await api.updateStoryTemplate(editing.id, body);
    else await api.createStoryTemplate(body);
    setModalOpen(false); load();
  };

  const remove = async (id) => { if (!confirm('确定删除此套路模版？')) return; await api.deleteStoryTemplate(id); load(); };

  const toggleExpand = (id) => {
    const next = new Set(expanded);
    if (next.has(id)) next.delete(id); else next.add(id);
    setExpanded(next);
  };

  const openBeatEdit = (index = -1) => {
    if (index >= 0) {
      setBeatEditor({ open: true, index, beat: { ...form.beatStructure[index] } });
    } else {
      setBeatEditor({ open: true, index: -1, beat: { beat: '', chapters: '', goal: '' } });
    }
  };

  const saveBeat = () => {
    const bs = [...form.beatStructure];
    const b = { ...beatEditor.beat, chapters: beatEditor.beat.chapters ? parseInt(beatEditor.beat.chapters, 10) : null };
    if (beatEditor.index >= 0) bs[beatEditor.index] = b;
    else bs.push(b);
    setForm({ ...form, beatStructure: bs });
    setBeatEditor({ open: false, index: -1, beat: { beat: '', chapters: '', goal: '' } });
  };

  const removeBeat = (index) => {
    const bs = form.beatStructure.filter((_, i) => i !== index);
    setForm({ ...form, beatStructure: bs });
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Sparkles size={18} />{t('t_cielys')}</CardTitle>
          <button onClick={openCreate} className="flex items-center gap-1 text-sm px-3 py-1.5 rounded-lg bg-sky-600 hover:bg-sky-500 text-white transition"><Plus size={14} />{t('t_d780xh')}</button>
        </CardHeader>

        {loading && <div className="text-slate-400 text-sm py-4">{t('t_27k1ha')}</div>}

        <div className="space-y-2">
          {templates.map(t => (
            <div key={t.id} className="bg-slate-900/40 border border-slate-700/40 rounded-lg overflow-hidden">
              <div className="flex items-center gap-2 px-4 py-3 hover:bg-slate-800/40 transition cursor-pointer" onClick={() => toggleExpand(t.id)}>
                {expanded.has(t.id) ? <ChevronDown size={14} className="text-slate-500" /> : <ChevronRight size={14} className="text-slate-500" />}
                <span className="font-medium text-slate-200 text-sm">{t.name}</span>
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-sky-500/20 text-sky-400">{t.category}</span>
                {t.exampleWorks && <span className="text-xs text-slate-500">{t('t_c7lsn')}</span>}
                <div className="ml-auto flex gap-1 opacity-0 group-hover:opacity-100 transition">
                  <button onClick={(e) => { e.stopPropagation(); openEdit(t); }} className="p-1 rounded hover:bg-slate-700 text-slate-400 hover:text-sky-400"><Edit3 size={12} /></button>
                  <button onClick={(e) => { e.stopPropagation(); remove(t.id); }} className="p-1 rounded hover:bg-slate-700 text-slate-400 hover:text-red-400"><Trash2 size={12} /></button>
                </div>
              </div>
              {expanded.has(t.id) && (
                <div className="px-4 pb-4 pl-10">
                  {t.description && <p className="text-sm text-slate-400 mb-2">{t.description}</p>}
                  {t.beatStructure?.length > 0 && (
                    <div className="space-y-1.5">
                      <h5 className="text-xs font-medium text-slate-500">{t('t_gvo7vg')}</h5>
                      {t.beatStructure.map((beat, i) => (
                        <div key={i} className="flex items-center gap-2 text-sm border-l-2 border-slate-700 pl-3 py-1">
                          <span className="text-xs text-slate-500 w-5">{i + 1}</span>
                          <span className="text-slate-300 font-medium">{beat.beat || beat.name}</span>
                          {beat.chapters && <span className="text-xs text-slate-500">约{beat.chapters}章</span>}
                          {beat.goal && <span className="text-xs text-slate-500">— {beat.goal}</span>}
                        </div>
                      ))}
                    </div>
                  )}
                  {t.tags?.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-2">
                      {t.tags.map((tag, i) => <span key={i} className="text-[10px] px-1.5 py-0.5 rounded bg-slate-700/50 text-slate-400">{tag}</span>)}
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>

        {!loading && templates.length === 0 && (
          <div className="text-center text-slate-500 text-sm py-8 bg-slate-900/20 rounded-lg border border-dashed border-slate-700">{t('t_buysan')}</div>
        )}
      </Card>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editing ? '编辑套路模版' : '新增套路模版'} onConfirm={save} confirmDisabled={!form.name}>
        <Input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder={t("t_dv1n2i")} />
        <div className="grid grid-cols-2 gap-3">
          <select value={form.category} onChange={e => setForm({ ...form, category: e.target.value })} className="w-full px-3 py-2 rounded-lg border border-slate-600 bg-slate-900/60 text-slate-50 text-sm">{CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}</select>
          <Input value={form.exampleWorks} onChange={e => setForm({ ...form, exampleWorks: e.target.value })} placeholder={t("t_c7lsn")} />
        </div>
        <Textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} placeholder={t("t_1wsa0d1")} />
        <Input value={form.tags} onChange={e => setForm({ ...form, tags: e.target.value })} placeholder={t("t_idef")} />

        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-xs text-slate-400">{t('t_gvo7vg')}</label>
            <button onClick={() => openBeatEdit()} className="text-xs px-2 py-0.5 rounded bg-sky-600/80 hover:bg-sky-500 text-white transition">{t('t_j5s5')}</button>
          </div>
          <div className="space-y-1">
            {form.beatStructure.map((beat, i) => (
              <div key={i} className="flex items-center gap-2 text-sm bg-slate-900/40 border border-slate-700/30 rounded px-2 py-1.5">
                <span className="text-xs text-slate-500 w-5">{i + 1}</span>
                <span className="text-slate-300 flex-1 min-w-0">{beat.beat || beat.name}</span>
                {beat.chapters && <span className="text-xs text-slate-500">{beat.chapters}章</span>}
                <button onClick={() => openBeatEdit(i)} className="p-1 rounded hover:bg-slate-700 text-slate-400 hover:text-sky-400"><Edit3 size={10} /></button>
                <button onClick={() => removeBeat(i)} className="p-1 rounded hover:bg-slate-700 text-slate-400 hover:text-red-400"><Trash2 size={10} /></button>
              </div>
            ))}
          </div>
        </div>
      </Modal>

      <Modal open={beatEditor.open} onClose={() => setBeatEditor({ ...beatEditor, open: false })} title={beatEditor.index >= 0 ? '编辑节拍' : '新增节拍'} onConfirm={saveBeat} confirmDisabled={!beatEditor.beat.beat}>
        <Input value={beatEditor.beat.beat} onChange={e => setBeatEditor({ ...beatEditor, beat: { ...beatEditor.beat, beat: e.target.value } })} placeholder={t("t_eyrn")} />
        <Input type="number" value={beatEditor.beat.chapters} onChange={e => setBeatEditor({ ...beatEditor, beat: { ...beatEditor.beat, chapters: e.target.value } })} placeholder={t("t_oteo4v")} />
        <Textarea value={beatEditor.beat.goal} onChange={e => setBeatEditor({ ...beatEditor, beat: { ...beatEditor.beat, goal: e.target.value } })} placeholder="该节拍的目标/作用..." />
      </Modal>
    </div>
  );
}
