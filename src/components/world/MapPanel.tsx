// @ts-nocheck
import { useState, useEffect, useCallback } from 'react';
import { Plus, Trash2, Edit3, Map, ArrowRight } from 'lucide-react';
import { CardHeader, CardTitle } from '../ui/Card';
import { Input, Textarea } from '../ui/Input';
import { Modal } from './Modal';
import * as api from '../../api/novel';
import { useI18n } from '../../contexts/I18nContext';

const REGION_TYPES = ['大陆', '国家', '城市', '宗门', '秘境', '山脉', '河流', '村庄'];
const CONN_TYPES = ['道路', '传送阵', '敌对边界', '河流', '山脉隘口'];

export function MapPanel({ workId }) {
  const { t } = useI18n();
  const [regions, setRegions] = useState([]);
  const [connections, setConnections] = useState([]);
  const [loading, setLoading] = useState(false);
  const [regionModal, setRegionModal] = useState(false);
  const [connModal, setConnModal] = useState(false);
  const [editingRegion, setEditingRegion] = useState(null);
  const [editingConn, setEditingConn] = useState(null);
  const [regionForm, setRegionForm] = useState({ name: '', regionType: '城市', parentId: '', description: '', tags: '' });
  const [connForm, setConnForm] = useState({ fromRegionId: '', toRegionId: '', connType: '道路', description: '', travelTime: '' });

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [rData, cData] = await Promise.all([api.getMapRegions(workId), api.getMapConnections(workId)]);
      setRegions(rData.items || []);
      setConnections(cData.items || []);
    } catch (e) { console.error(e); }
    setLoading(false);
  }, [workId]);

  useEffect(() => { load(); }, [load]);

  const openRegionCreate = () => { setEditingRegion(null); setRegionForm({ name: '', regionType: '城市', parentId: '', description: '', tags: '' }); setRegionModal(true); };
  const openRegionEdit = (item) => { setEditingRegion(item); setRegionForm({ name: item.name, regionType: item.regionType, parentId: item.parentId || '', description: item.description, tags: (item.tags || []).join(',') }); setRegionModal(true); };
  const openConnCreate = () => { setEditingConn(null); setConnForm({ fromRegionId: '', toRegionId: '', connType: '道路', description: '', travelTime: '' }); setConnModal(true); };

  const saveRegion = async () => {
    const body = { ...regionForm, parentId: regionForm.parentId ? parseInt(regionForm.parentId, 10) : null, tags: regionForm.tags.split(',').map(s => s.trim()).filter(Boolean) };
    if (editingRegion) await api.updateMapRegion(workId, editingRegion.id, body);
    else await api.createMapRegion(workId, body);
    setRegionModal(false); load();
  };
  const saveConn = async () => {
    if (editingConn) await api.updateMapConnection(workId, editingConn.id, connForm);
    else await api.createMapConnection(workId, connForm);
    setConnModal(false); load();
  };
  const deleteRegion = async (id) => { if (!confirm('确定删除此区域？子区域将变为独立区域。')) return; await api.deleteMapRegion(workId, id); load(); };
  const deleteConn = async (id) => { if (!confirm('确定删除此连接？')) return; await api.deleteMapConnection(workId, id); load(); };

  const regionMap = Object.fromEntries(regions.map(r => [r.id, r]));

  // 构建树状结构
  const rootRegions = regions.filter(r => !r.parentId);
  const getChildren = (parentId) => regions.filter(r => r.parentId === parentId);

  const renderRegionTree = (list, depth = 0) => (
    <div className="space-y-1">
      {list.map(r => (
        <div key={r.id}>
          <div className="flex items-start justify-between gap-2 py-1.5 px-2 rounded hover:bg-slate-800/30 transition group" style={{ paddingLeft: `${depth * 16 + 8}px` }}>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-700/50 text-slate-400">{r.regionType}</span>
                <span className="text-sm text-slate-200 font-medium">{r.name}</span>
              </div>
              {r.description && <p className="text-xs text-slate-500 mt-0.5">{r.description}</p>}
            </div>
            <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition shrink-0">
              <button onClick={() => openRegionEdit(r)} className="p-1 rounded hover:bg-slate-700 text-slate-400 hover:text-sky-400"><Edit3 size={12} /></button>
              <button onClick={() => deleteRegion(r.id)} className="p-1 rounded hover:bg-slate-700 text-slate-400 hover:text-red-400"><Trash2 size={12} /></button>
            </div>
          </div>
          {renderRegionTree(getChildren(r.id), depth + 1)}
        </div>
      ))}
    </div>
  );

  return (
    <div className="space-y-4">
      <CardHeader className="!mb-0">
        <CardTitle className="flex items-center gap-2"><Map size={16} />{t('t_bd2535')}</CardTitle>
        <div className="flex gap-2">
          <button onClick={openConnCreate} className="flex items-center gap-1 text-sm px-3 py-1.5 rounded-lg bg-slate-700 hover:bg-slate-600 text-slate-200 transition"><ArrowRight size={14} />{t('t_p0nb')}</button>
          <button onClick={openRegionCreate} className="flex items-center gap-1 text-sm px-3 py-1.5 rounded-lg bg-sky-600 hover:bg-sky-500 text-white transition"><Plus size={14} />{t('t_emzp')}</button>
        </div>
      </CardHeader>

      {loading && <div className="text-slate-400 text-sm py-4">{t('t_27k1ha')}</div>}

      {/* 区域树 */}
      <div className="bg-slate-900/40 border border-slate-700/40 rounded-lg p-3">
        <h4 className="text-xs font-medium text-sky-400 mb-2">{t('t_av67oi')}</h4>
        {regions.length > 0 ? renderRegionTree(rootRegions) : <div className="text-xs text-slate-500 py-2">{t('t_dcrzer')}</div>}
      </div>

      {/* 连接表 */}
      {connections.length > 0 && (
        <div className="bg-slate-900/40 border border-slate-700/40 rounded-lg p-3">
          <h4 className="text-xs font-medium text-sky-400 mb-2">{t('t_avgrho')}</h4>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead><tr className="border-b border-slate-700/40 text-xs text-slate-500">
                <th className="text-left py-2 px-2">From</th><th className="text-left py-2 px-2">{t('t_lnjk')}</th><th className="text-left py-2 px-2">To</th><th className="text-left py-2 px-2">{t('t_mchr')}</th><th className="text-right py-2 px-2">{t('t_hkxb')}</th>
              </tr></thead>
              <tbody>
                {connections.map(c => (
                  <tr key={c.id} className="border-b border-slate-800/40 hover:bg-slate-800/30">
                    <td className="py-2 px-2 text-slate-300">{regionMap[c.fromRegionId]?.name || c.fromRegionId}</td>
                    <td className="py-2 px-2 text-sky-400">{c.connType}</td>
                    <td className="py-2 px-2 text-slate-300">{regionMap[c.toRegionId]?.name || c.toRegionId}</td>
                    <td className="py-2 px-2 text-slate-400">{c.travelTime || '-'}</td>
                    <td className="py-2 px-2 text-right">
                      <button onClick={() => deleteConn(c.id)} className="p-1 rounded hover:bg-slate-700 text-slate-400 hover:text-red-400"><Trash2 size={12} /></button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {!loading && regions.length === 0 && (
        <div className="text-center text-slate-500 text-sm py-8 bg-slate-900/20 rounded-lg border border-dashed border-slate-700">{t('t_emzp')}</div>
      )}

      <Modal open={regionModal} onClose={() => setRegionModal(false)} title={editingRegion ? '编辑区域' : '新增区域'} onConfirm={saveRegion} confirmDisabled={!regionForm.name}>
        <Input value={regionForm.name} onChange={e => setRegionForm({ ...regionForm, name: e.target.value })} placeholder={t("t_av6pm0")} />
        <div className="grid grid-cols-2 gap-3">
          <select value={regionForm.regionType} onChange={e => setRegionForm({ ...regionForm, regionType: e.target.value })} className="w-full px-3 py-2 rounded-lg border border-slate-600 bg-slate-900/60 text-slate-50 text-sm">{REGION_TYPES.map(t => <option key={t} value={t}>{t}</option>)}</select>
          <select value={regionForm.parentId} onChange={e => setRegionForm({ ...regionForm, parentId: e.target.value })} className="w-full px-3 py-2 rounded-lg border border-slate-600 bg-slate-900/60 text-slate-50 text-sm">
            <option value="">{t('t_hhj3xa')}</option>
            {regions.filter(r => r.id !== editingRegion?.id).map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
          </select>
        </div>
        <Textarea value={regionForm.description} onChange={e => setRegionForm({ ...regionForm, description: e.target.value })} placeholder={t("t_n5h05k")} />
        <Input value={regionForm.tags} onChange={e => setRegionForm({ ...regionForm, tags: e.target.value })} placeholder={t("t_idef")} />
      </Modal>

      <Modal open={connModal} onClose={() => setConnModal(false)} title={t("t_13c153u")} onConfirm={saveConn} confirmDisabled={!connForm.fromRegionId || !connForm.toRegionId}>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs text-slate-400 mb-1 block">From</label>
            <select value={connForm.fromRegionId} onChange={e => setConnForm({ ...connForm, fromRegionId: parseInt(e.target.value) || '' })} className="w-full px-3 py-2 rounded-lg border border-slate-600 bg-slate-900/60 text-slate-50 text-sm">
              <option value="">{t('t_ikwi5h')}</option>
              {regions.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
            </select>
          </div>
          <div>
            <label className="text-xs text-slate-400 mb-1 block">To</label>
            <select value={connForm.toRegionId} onChange={e => setConnForm({ ...connForm, toRegionId: parseInt(e.target.value) || '' })} className="w-full px-3 py-2 rounded-lg border border-slate-600 bg-slate-900/60 text-slate-50 text-sm">
              <option value="">{t('t_ikwi5h')}</option>
              {regions.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
            </select>
          </div>
        </div>
        <select value={connForm.connType} onChange={e => setConnForm({ ...connForm, connType: e.target.value })} className="w-full px-3 py-2 rounded-lg border border-slate-600 bg-slate-900/60 text-slate-50 text-sm">{CONN_TYPES.map(t => <option key={t} value={t}>{t}</option>)}</select>
        <Input value={connForm.travelTime} onChange={e => setConnForm({ ...connForm, travelTime: e.target.value })} placeholder={t("__3")} />
        <Textarea value={connForm.description} onChange={e => setConnForm({ ...connForm, description: e.target.value })} placeholder={t("t_iv9606")} />
      </Modal>
    </div>
  );
}
