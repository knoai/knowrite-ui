import { useState, useEffect, useCallback } from 'react';
import { Plus, Trash2, Edit3, Users, Link2 } from 'lucide-react';
import { Card, CardHeader, CardTitle } from '../ui/Card';
import { Input, Textarea } from '../ui/Input';
import { Modal } from './Modal';
import * as api from '../../api/novel';

const ROLE_TYPES = ['主角', '反派', '配角', '龙套'];
const STATUS_TYPES = ['存活', '死亡', '失踪', '囚禁', '飞升'];
const RELATION_TYPES = ['师徒', '敌对', '恋人', '君臣', '血亲', '同盟', '主仆', '竞争', '其他'];

export function CharacterPanel({ workId }) {
  const [characters, setCharacters] = useState([]);
  const [relations, setRelations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [charModal, setCharModal] = useState(false);
  const [relModal, setRelModal] = useState(false);
  const [editingChar, setEditingChar] = useState(null);
  const [editingRel, setEditingRel] = useState(null);
  const [charForm, setCharForm] = useState({ name: '', alias: '', roleType: '配角', status: '存活', appearance: '', personality: '', goals: '', background: '', notes: '' });
  const [relForm, setRelForm] = useState({ fromCharId: '', toCharId: '', relationType: '其他', description: '', strength: 5, bidirectional: false });

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [cData, rData] = await Promise.all([api.getCharacters(workId), api.getCharacterRelations(workId)]);
      setCharacters(cData.items || []);
      setRelations(rData.items || []);
    } catch (e) { console.error(e); }
    setLoading(false);
  }, [workId]);

  useEffect(() => { load(); }, [load]);

  const openCharCreate = () => { setEditingChar(null); setCharForm({ name: '', alias: '', roleType: '配角', status: '存活', appearance: '', personality: '', goals: '', background: '', notes: '' }); setCharModal(true); };
  const openCharEdit = (item) => { setEditingChar(item); setCharForm({ ...item, notes: item.notes || '' }); setCharModal(true); };
  const openRelCreate = () => { setEditingRel(null); setRelForm({ fromCharId: '', toCharId: '', relationType: '其他', description: '', strength: 5, bidirectional: false }); setRelModal(true); };

  const saveChar = async () => {
    if (editingChar) await api.updateCharacter(workId, editingChar.id, charForm);
    else await api.createCharacter(workId, charForm);
    setCharModal(false); load();
  };
  const saveRel = async () => {
    if (editingRel) await api.updateCharacterRelation(workId, editingRel.id, relForm);
    else await api.createCharacterRelation(workId, relForm);
    setRelModal(false); load();
  };
  const deleteChar = async (id) => { if (!confirm('删除人物将同时删除其关联关系，确定？')) return; await api.deleteCharacter(workId, id); load(); };
  const deleteRel = async (id) => { if (!confirm('确定删除此关系？')) return; await api.deleteCharacterRelation(workId, id); load(); };

  const charMap = Object.fromEntries(characters.map(c => [c.id, c]));

  return (
    <div className="space-y-4">
      <CardHeader className="!mb-0">
        <CardTitle className="flex items-center gap-2"><Users size={16} /> 人物设定</CardTitle>
        <div className="flex gap-2">
          <button onClick={openRelCreate} className="flex items-center gap-1 text-sm px-3 py-1.5 rounded-lg bg-slate-700 hover:bg-slate-600 text-slate-200 transition">
            <Link2 size={14} /> 关系
          </button>
          <button onClick={openCharCreate} className="flex items-center gap-1 text-sm px-3 py-1.5 rounded-lg bg-sky-600 hover:bg-sky-500 text-white transition">
            <Plus size={14} /> 人物
          </button>
        </div>
      </CardHeader>

      {loading && <div className="text-slate-400 text-sm py-4">加载中...</div>}

      {/* 人物卡片 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {characters.map(c => (
          <div key={c.id} className="bg-slate-900/40 border border-slate-700/40 rounded-lg p-3 hover:border-slate-600/60 transition group">
            <div className="flex items-start justify-between gap-2">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-medium text-slate-200 text-sm">{c.name}</span>
                  {c.alias && <span className="text-xs text-slate-500">({c.alias})</span>}
                </div>
                <div className="flex gap-1 mt-1">
                  <span className={`text-[10px] px-1.5 py-0.5 rounded ${c.roleType === '主角' ? 'bg-yellow-500/20 text-yellow-400' : c.roleType === '反派' ? 'bg-red-500/20 text-red-400' : 'bg-slate-700/50 text-slate-400'}`}>{c.roleType}</span>
                  {c.status !== '存活' && <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-700/50 text-slate-400">{c.status}</span>}
                </div>
              </div>
              <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition">
                <button onClick={() => openCharEdit(c)} className="p-1 rounded hover:bg-slate-700 text-slate-400 hover:text-sky-400"><Edit3 size={12} /></button>
                <button onClick={() => deleteChar(c.id)} className="p-1 rounded hover:bg-slate-700 text-slate-400 hover:text-red-400"><Trash2 size={12} /></button>
              </div>
            </div>
            {c.appearance && <p className="text-xs text-slate-500 mt-1.5">外貌：{c.appearance}</p>}
            {c.personality && <p className="text-xs text-slate-500 mt-0.5">性格：{c.personality}</p>}
            {c.goals && <p className="text-xs text-slate-500 mt-0.5">目标：{c.goals}</p>}
          </div>
        ))}
      </div>

      {/* 关系表 */}
      {relations.length > 0 && (
        <div className="mt-4">
          <h4 className="text-sm font-medium text-sky-400 mb-2">人物关系</h4>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-700/40 text-xs text-slate-500">
                  <th className="text-left py-2 px-2">From</th>
                  <th className="text-left py-2 px-2">关系</th>
                  <th className="text-left py-2 px-2">To</th>
                  <th className="text-left py-2 px-2">强度</th>
                  <th className="text-right py-2 px-2">操作</th>
                </tr>
              </thead>
              <tbody>
                {relations.map(r => (
                  <tr key={r.id} className="border-b border-slate-800/40 hover:bg-slate-800/30">
                    <td className="py-2 px-2 text-slate-300">{charMap[r.fromCharId]?.name || r.fromCharId}</td>
                    <td className="py-2 px-2 text-sky-400">{r.relationType}{r.bidirectional ? ' ↔' : ' →'}</td>
                    <td className="py-2 px-2 text-slate-300">{charMap[r.toCharId]?.name || r.toCharId}</td>
                    <td className="py-2 px-2 text-slate-400">{r.strength}/10</td>
                    <td className="py-2 px-2 text-right">
                      <button onClick={() => deleteRel(r.id)} className="p-1 rounded hover:bg-slate-700 text-slate-400 hover:text-red-400"><Trash2 size={12} /></button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {!loading && characters.length === 0 && (
        <div className="text-center text-slate-500 text-sm py-8 bg-slate-900/20 rounded-lg border border-dashed border-slate-700">暂无人物，点击上方按钮添加</div>
      )}

      <Modal open={charModal} onClose={() => setCharModal(false)} title={editingChar ? '编辑人物' : '新增人物'} onConfirm={saveChar} confirmDisabled={!charForm.name}>
        <div className="grid grid-cols-2 gap-3">
          <Input value={charForm.name} onChange={e => setCharForm({ ...charForm, name: e.target.value })} placeholder="姓名" />
          <Input value={charForm.alias} onChange={e => setCharForm({ ...charForm, alias: e.target.value })} placeholder="别名" />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <select value={charForm.roleType} onChange={e => setCharForm({ ...charForm, roleType: e.target.value })} className="w-full px-3 py-2 rounded-lg border border-slate-600 bg-slate-900/60 text-slate-50 text-sm">
            {ROLE_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
          </select>
          <select value={charForm.status} onChange={e => setCharForm({ ...charForm, status: e.target.value })} className="w-full px-3 py-2 rounded-lg border border-slate-600 bg-slate-900/60 text-slate-50 text-sm">
            {STATUS_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
          </select>
        </div>
        <Input value={charForm.appearance} onChange={e => setCharForm({ ...charForm, appearance: e.target.value })} placeholder="外貌特征" />
        <Input value={charForm.personality} onChange={e => setCharForm({ ...charForm, personality: e.target.value })} placeholder="性格特点" />
        <Input value={charForm.goals} onChange={e => setCharForm({ ...charForm, goals: e.target.value })} placeholder="目标/动机" />
        <Textarea value={charForm.background} onChange={e => setCharForm({ ...charForm, background: e.target.value })} placeholder="背景故事..." />
        <Textarea value={charForm.notes} onChange={e => setCharForm({ ...charForm, notes: e.target.value })} placeholder="备注..." />
      </Modal>

      <Modal open={relModal} onClose={() => setRelModal(false)} title="新增人物关系" onConfirm={saveRel} confirmDisabled={!relForm.fromCharId || !relForm.toCharId}>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs text-slate-400 mb-1 block">From</label>
            <select value={relForm.fromCharId} onChange={e => setRelForm({ ...relForm, fromCharId: parseInt(e.target.value) || '' })} className="w-full px-3 py-2 rounded-lg border border-slate-600 bg-slate-900/60 text-slate-50 text-sm">
              <option value="">选择人物</option>
              {characters.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
          <div>
            <label className="text-xs text-slate-400 mb-1 block">To</label>
            <select value={relForm.toCharId} onChange={e => setRelForm({ ...relForm, toCharId: parseInt(e.target.value) || '' })} className="w-full px-3 py-2 rounded-lg border border-slate-600 bg-slate-900/60 text-slate-50 text-sm">
              <option value="">选择人物</option>
              {characters.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <select value={relForm.relationType} onChange={e => setRelForm({ ...relForm, relationType: e.target.value })} className="w-full px-3 py-2 rounded-lg border border-slate-600 bg-slate-900/60 text-slate-50 text-sm">
            {RELATION_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
          </select>
          <div className="flex items-center gap-2">
            <label className="text-xs text-slate-400">强度</label>
            <input type="range" min={1} max={10} value={relForm.strength} onChange={e => setRelForm({ ...relForm, strength: parseInt(e.target.value) })} className="flex-1 accent-sky-500" />
            <span className="text-xs text-slate-400 w-6">{relForm.strength}</span>
          </div>
        </div>
        <Input value={relForm.description} onChange={e => setRelForm({ ...relForm, description: e.target.value })} placeholder="关系描述（可选）" />
        <label className="flex items-center gap-2 text-sm text-slate-300 cursor-pointer">
          <input type="checkbox" checked={relForm.bidirectional} onChange={e => setRelForm({ ...relForm, bidirectional: e.target.checked })} className="accent-sky-500" />
          双向关系
        </label>
      </Modal>
    </div>
  );
}
