import { useState, useEffect, useCallback } from 'react';
import { Plus, Trash2, Edit3, BookOpen } from 'lucide-react';
import { Card, CardHeader, CardTitle } from '../ui/Card';
import { Input, Textarea } from '../ui/Input';
import { Modal } from './Modal';
import * as api from '../../api/novel';
import { useI18n } from '../../contexts/I18nContext';

const CATEGORIES = ['力量体系', '种族/物种', '势力/宗门', '历史事件', '规则/法则', '道具/宝物', '地理区域', '其他'];

export function WorldLorePanel({ workId }) {
  const { t } = useI18n();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ category: '其他', title: '', content: '', tags: '', importance: 3 });

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await api.getWorldLore(workId);
      setItems(data.items || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [workId]);

  useEffect(() => { load(); }, [load]);

  const openCreate = () => { setEditing(null); setForm({ category: '其他', title: '', content: '', tags: '', importance: 3 }); setModalOpen(true); };
  const openEdit = (item) => { setEditing(item); setForm({ category: item.category, title: item.title, content: item.content, tags: (item.tags || []).join(','), importance: item.importance }); setModalOpen(true); };

  const handleSave = async () => {
    const body = { ...form, tags: form.tags.split(',').map(s => s.trim()).filter(Boolean) };
    if (editing) {
      await api.updateWorldLore(workId, editing.id, body);
    } else {
      await api.createWorldLore(workId, body);
    }
    setModalOpen(false);
    load();
  };

  const handleDelete = async (id) => {
    if (!confirm('确定删除此条目？')) return;
    await api.deleteWorldLore(workId, id);
    load();
  };

  const byCategory = {};
  for (const item of items) {
    const cat = item.category || '其他';
    if (!byCategory[cat]) byCategory[cat] = [];
    byCategory[cat].push(item);
  }

  return (
    <div className="space-y-4">
      <CardHeader className="!mb-0">
        <CardTitle className="flex items-center gap-2"><BookOpen size={16} />{t('t_1w131v5')}</CardTitle>
        <button onClick={openCreate} className="flex items-center gap-1 text-sm px-3 py-1.5 rounded-lg bg-sky-600 hover:bg-sky-500 text-white transition">
          <Plus size={14} /> 新增
        </button>
      </CardHeader>

      {loading && <div className="text-slate-400 text-sm py-4">{t('t_27k1ha')}</div>}

      {Object.entries(byCategory).map(([cat, catItems]) => (
        <div key={cat} className="mb-4">
          <h4 className="text-sm font-medium text-sky-400 mb-2">{cat}</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {catItems.map(item => (
              <div key={item.id} className="bg-slate-900/40 border border-slate-700/40 rounded-lg p-3 hover:border-slate-600/60 transition group">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-slate-200 text-sm">{item.title}</span>
                      {item.importance >= 4 && <span className="text-[10px] px-1.5 py-0.5 rounded bg-red-500/20 text-red-400">{t('t_pjys')}</span>}
                    </div>
                    <p className="text-xs text-slate-400 mt-1 line-clamp-3">{item.content}</p>
                    {item.tags?.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-1.5">
                        {item.tags.map((t, i) => <span key={i} className="text-[10px] px-1.5 py-0.5 rounded bg-slate-700/50 text-slate-400">{t}</span>)}
                      </div>
                    )}
                  </div>
                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition">
                    <button onClick={() => openEdit(item)} className="p-1 rounded hover:bg-slate-700 text-slate-400 hover:text-sky-400"><Edit3 size={12} /></button>
                    <button onClick={() => handleDelete(item.id)} className="p-1 rounded hover:bg-slate-700 text-slate-400 hover:text-red-400"><Trash2 size={12} /></button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}

      {!loading && items.length === 0 && (
        <div className="text-center text-slate-500 text-sm py-8 bg-slate-900/20 rounded-lg border border-dashed border-slate-700">
          暂无世界观条目，点击上方按钮添加
        </div>
      )}

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editing ? '编辑世界观条目' : '新增世界观条目'} onConfirm={handleSave} confirmDisabled={!form.title}>
        <div>
          <label className="text-xs text-slate-400 mb-1 block">{t('t_emut')}</label>
          <select value={form.category} onChange={e => setForm({ ...form, category: e.target.value })} className="w-full px-3 py-2 rounded-lg border border-slate-600 bg-slate-900/60 text-slate-50 text-sm">
            {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
        <div>
          <label className="text-xs text-slate-400 mb-1 block">{t('t_ij5d')}</label>
          <Input value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} placeholder="如：灵气修炼体系" />
        </div>
        <div>
          <label className="text-xs text-slate-400 mb-1 block">{t('t_edas')}</label>
          <Textarea value={form.content} onChange={e => setForm({ ...form, content: e.target.value })} placeholder={t("t_rcl68j")} />
        </div>
        <div className="flex gap-3">
          <div className="flex-1">
            <label className="text-xs text-slate-400 mb-1 block">{t('t_idef')}</label>
            <Input value={form.tags} onChange={e => setForm({ ...form, tags: e.target.value })} placeholder={t("__")} />
          </div>
          <div className="w-24">
            <label className="text-xs text-slate-400 mb-1 block">{t('t_pjys')}</label>
            <input type="range" min={1} max={5} value={form.importance} onChange={e => setForm({ ...form, importance: parseInt(e.target.value) })} className="w-full accent-sky-500" />
          </div>
        </div>
      </Modal>
    </div>
  );
}
