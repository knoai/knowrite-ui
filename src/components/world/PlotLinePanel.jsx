import { useState, useEffect, useCallback } from 'react';
import { Plus, Trash2, Edit3, GitBranch, ChevronDown, ChevronRight } from 'lucide-react';
import { CardHeader, CardTitle } from '../ui/Card';
import { Input, Textarea } from '../ui/Input';
import { Modal } from './Modal';
import * as api from '../../api/novel';
import { useI18n } from '../../contexts/I18nContext';

const LINE_TYPES = ['主线', '支线', '暗线', '感情线'];
const NODE_TYPES = ['起点', '发展', '高潮', '转折', '结局', '伏笔', '回收'];
const STATUSES = ['进行中', '已完结', '待展开'];
const NODE_STATUSES = ['待展开', '已发生', '已回收'];

export function PlotLinePanel({ workId }) {
  const { t } = useI18n();
  const [lines, setLines] = useState([]);
  const [loading, setLoading] = useState(false);
  const [expanded, setExpanded] = useState(new Set());
  const [lineModal, setLineModal] = useState(false);
  const [nodeModal, setNodeModal] = useState(false);
  const [editingLine, setEditingLine] = useState(null);
  const [activeLineId, setActiveLineId] = useState(null);
  const [editingNode, setEditingNode] = useState(null);
  const [lineForm, setLineForm] = useState({ name: '', type: '主线', status: '进行中', color: '#3b82f6' });
  const [nodeForm, setNodeForm] = useState({ title: '', description: '', nodeType: '发展', chapterNumber: '', position: 0, status: '待展开' });

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await api.getPlotLines(workId);
      setLines(data.items || []);
    } catch (e) { console.error(e); }
    setLoading(false);
  }, [workId]);

  useEffect(() => { load(); }, [load]);

  const toggleExpand = (id) => {
    const next = new Set(expanded);
    if (next.has(id)) next.delete(id); else next.add(id);
    setExpanded(next);
  };

  const openLineCreate = () => { setEditingLine(null); setLineForm({ name: '', type: '主线', status: '进行中', color: '#3b82f6' }); setLineModal(true); };
  const openLineEdit = (item) => { setEditingLine(item); setLineForm({ name: item.name, type: item.type, status: item.status, color: item.color }); setLineModal(true); };
  const openNodeCreate = (lineId) => { setActiveLineId(lineId); setEditingNode(null); setNodeForm({ title: '', description: '', nodeType: '发展', chapterNumber: '', position: 0, status: '待展开' }); setNodeModal(true); };
  const openNodeEdit = (lineId, node) => { setActiveLineId(lineId); setEditingNode(node); setNodeForm({ title: node.title, description: node.description, nodeType: node.nodeType, chapterNumber: node.chapterNumber || '', position: node.position, status: node.status }); setNodeModal(true); };

  const saveLine = async () => {
    if (editingLine) await api.updatePlotLine(workId, editingLine.id, lineForm);
    else await api.createPlotLine(workId, lineForm);
    setLineModal(false); load();
  };
  const saveNode = async () => {
    const body = { ...nodeForm, chapterNumber: nodeForm.chapterNumber ? parseInt(nodeForm.chapterNumber, 10) : null, position: parseInt(nodeForm.position, 10) };
    if (editingNode) await api.updatePlotNode(workId, activeLineId, editingNode.id, body);
    else await api.createPlotNode(workId, activeLineId, body);
    setNodeModal(false); load();
  };
  const deleteLine = async (id) => { if (!confirm('删除剧情线将同时删除其所有节点，确定？')) return; await api.deletePlotLine(workId, id); load(); };
  const deleteNode = async (lineId, nodeId) => { if (!confirm('确定删除此节点？')) return; await api.deletePlotNode(workId, lineId, nodeId); load(); };

  return (
    <div className="space-y-4">
      <CardHeader className="!mb-0">
        <CardTitle className="flex items-center gap-2"><GitBranch size={16} />{t('t_k8aaks')}</CardTitle>
        <button onClick={openLineCreate} className="flex items-center gap-1 text-sm px-3 py-1.5 rounded-lg bg-sky-600 hover:bg-sky-500 text-white transition"><Plus size={14} />{t('t_cjnsx')}</button>
      </CardHeader>

      {loading && <div className="text-slate-400 text-sm py-4">{t('t_27k1ha')}</div>}

      <div className="space-y-2">
        {lines.map(line => (
          <div key={line.id} className="bg-slate-900/40 border border-slate-700/40 rounded-lg overflow-hidden">
            <div className="flex items-center gap-2 px-3 py-2.5 hover:bg-slate-800/40 transition cursor-pointer" onClick={() => toggleExpand(line.id)}>
              {expanded.has(line.id) ? <ChevronDown size={14} className="text-slate-500" /> : <ChevronRight size={14} className="text-slate-500" />}
              <span className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: line.color }} />
              <span className="font-medium text-slate-200 text-sm">{line.name}</span>
              <span className={`text-[10px] px-1.5 py-0.5 rounded ml-1 ${line.type === '主线' ? 'bg-yellow-500/20 text-yellow-400' : 'bg-slate-700/50 text-slate-400'}`}>{line.type}</span>
              {line.status !== '进行中' && <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-700/50 text-slate-400">{line.status}</span>}
              <span className="text-xs text-slate-500 ml-auto">{line.nodes?.length || 0} 节点</span>
              <button onClick={(e) => { e.stopPropagation(); openLineEdit(line); }} className="p-1 rounded hover:bg-slate-700 text-slate-400 hover:text-sky-400"><Edit3 size={12} /></button>
              <button onClick={(e) => { e.stopPropagation(); deleteLine(line.id); }} className="p-1 rounded hover:bg-slate-700 text-slate-400 hover:text-red-400"><Trash2 size={12} /></button>
            </div>
            {expanded.has(line.id) && (
              <div className="px-3 pb-3 pl-9">
                {line.nodes?.length > 0 ? (
                  <div className="space-y-1.5">
                    {line.nodes.map((node, idx) => (
                      <div key={node.id} className="flex items-start gap-2 text-sm border-l-2 border-slate-700 pl-3 py-1 hover:bg-slate-800/30 transition group">
                        <span className="text-xs text-slate-500 w-5 shrink-0">{idx + 1}</span>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-1.5">
                            <span className="text-[10px] px-1 py-0.5 rounded bg-slate-700/50 text-slate-400">{node.nodeType}</span>
                            <span className="text-slate-300">{t('t_bst99r')}</span>
                            {node.chapterNumber && <span className="text-xs text-sky-400">第{node.chapterNumber}章</span>}
                            {node.status !== '待展开' && <span className="text-[10px] text-slate-500">[{node.status}]</span>}
                          </div>
                          {node.description && <p className="text-xs text-slate-500 mt-0.5">{node.description}</p>}
                        </div>
                        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition shrink-0">
                          <button onClick={() => openNodeEdit(line.id, node)} className="p-1 rounded hover:bg-slate-700 text-slate-400 hover:text-sky-400"><Edit3 size={10} /></button>
                          <button onClick={() => deleteNode(line.id, node.id)} className="p-1 rounded hover:bg-slate-700 text-slate-400 hover:text-red-400"><Trash2 size={10} /></button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : <div className="text-xs text-slate-500 py-2">{t('t_dd05ud')}</div>}
                <button onClick={() => openNodeCreate(line.id)} className="mt-2 flex items-center gap-1 text-xs px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 transition"><Plus size={10} />{t('t_e845ks')}</button>
              </div>
            )}
          </div>
        ))}
      </div>

      {!loading && lines.length === 0 && (
        <div className="text-center text-slate-500 text-sm py-8 bg-slate-900/20 rounded-lg border border-dashed border-slate-700">{t('t_cjnsx')}</div>
      )}

      <Modal open={lineModal} onClose={() => setLineModal(false)} title={editingLine ? '编辑剧情线' : '新增剧情线'} onConfirm={saveLine} confirmDisabled={!lineForm.name}>
        <Input value={lineForm.name} onChange={e => setLineForm({ ...lineForm, name: e.target.value })} placeholder={t("t_k8aw70")} />
        <div className="grid grid-cols-3 gap-3">
          <select value={lineForm.type} onChange={e => setLineForm({ ...lineForm, type: e.target.value })} className="w-full px-3 py-2 rounded-lg border border-slate-600 bg-slate-900/60 text-slate-50 text-sm">{LINE_TYPES.map(t => <option key={t} value={t}>{t}</option>)}</select>
          <select value={lineForm.status} onChange={e => setLineForm({ ...lineForm, status: e.target.value })} className="w-full px-3 py-2 rounded-lg border border-slate-600 bg-slate-900/60 text-slate-50 text-sm">{STATUSES.map(t => <option key={t} value={t}>{t}</option>)}</select>
          <input type="color" value={lineForm.color} onChange={e => setLineForm({ ...lineForm, color: e.target.value })} className="w-full h-10 rounded-lg border border-slate-600 bg-slate-900/60 cursor-pointer" />
        </div>
      </Modal>

      <Modal open={nodeModal} onClose={() => setNodeModal(false)} title={editingNode ? '编辑节点' : '新增节点'} onConfirm={saveNode} confirmDisabled={!nodeForm.title}>
        <Input value={nodeForm.title} onChange={e => setNodeForm({ ...nodeForm, title: e.target.value })} placeholder={t("t_gxm0q0")} />
        <div className="grid grid-cols-3 gap-3">
          <select value={nodeForm.nodeType} onChange={e => setNodeForm({ ...nodeForm, nodeType: e.target.value })} className="w-full px-3 py-2 rounded-lg border border-slate-600 bg-slate-900/60 text-slate-50 text-sm">{NODE_TYPES.map(t => <option key={t} value={t}>{t}</option>)}</select>
          <select value={nodeForm.status} onChange={e => setNodeForm({ ...nodeForm, status: e.target.value })} className="w-full px-3 py-2 rounded-lg border border-slate-600 bg-slate-900/60 text-slate-50 text-sm">{NODE_STATUSES.map(t => <option key={t} value={t}>{t}</option>)}</select>
          <Input type="number" value={nodeForm.chapterNumber} onChange={e => setNodeForm({ ...nodeForm, chapterNumber: e.target.value })} placeholder={t("t_imkr9")} />
        </div>
        <Input type="number" value={nodeForm.position} onChange={e => setNodeForm({ ...nodeForm, position: e.target.value })} placeholder={t("t_cycs72")} />
        <Textarea value={nodeForm.description} onChange={e => setNodeForm({ ...nodeForm, description: e.target.value })} placeholder={t("t_27ixvey")} />
      </Modal>
    </div>
  );
}
