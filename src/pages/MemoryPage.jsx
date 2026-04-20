import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Card, CardHeader, CardTitle } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import * as api from '../api/novel';

export function MemoryPage() {
  const { workId } = useParams();
  const [loading, setLoading] = useState(true);
  const [voiceFps, setVoiceFps] = useState([]);
  const [memories, setMemories] = useState([]);
  const [skill, setSkill] = useState(null);
  const [error, setError] = useState('');
  const [refreshing, setRefreshing] = useState(false);

  const loadData = async () => {
    setLoading(true);
    setError('');
    try {
      const [vf, cm, sk] = await Promise.all([
        api.getVoiceFingerprints(workId).catch(() => ({ fingerprints: [] })),
        api.getCharacterMemories(workId).catch(() => ({ memories: [] })),
        api.getSkillInjection(workId).catch(() => null),
      ]);
      setVoiceFps(vf.fingerprints || []);
      setMemories(cm.memories || []);
      setSkill(sk);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (workId) loadData();
  }, [workId]);

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await api.refreshCharacterMemories(workId);
      await loadData();
    } catch (e) {
      setError(e.message);
    } finally {
      setRefreshing(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center gap-2 text-slate-400 text-sm py-8">
        <span className="inline-block w-4 h-4 border-2 border-slate-600 border-t-sky-400 rounded-full animate-spin" />
        加载记忆数据...
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold text-slate-100">记忆系统</h2>
        <Button variant="ghost" size="sm" onClick={handleRefresh} disabled={refreshing}>
          {refreshing ? '刷新中...' : '刷新记忆'}
        </Button>
      </div>

      {error && (
        <div className="text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2">
          {error}
        </div>
      )}

      {/* 声纹指纹 */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">角色声纹指纹</CardTitle>
          <p className="text-xs text-slate-500 mt-1">从已写章节中自动提取的各角色语言风格统计。</p>
        </CardHeader>
        <div className="px-4 pb-4">
          {voiceFps.length === 0 ? (
            <div className="text-sm text-slate-500 py-4">暂无声纹数据。继续创作章节后，系统会自动提取。</div>
          ) : (
            <div className="space-y-3">
              {voiceFps.map((fp) => (
                <div key={fp.characterName} className="bg-slate-800/50 rounded-lg p-4 border border-slate-700/40">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-semibold text-sky-400">{fp.characterName}</span>
                    <span className="text-xs text-slate-500">基于 {fp.chapterCount || '?'} 章</span>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                    {fp.avgSentenceLength && (
                      <div className="bg-slate-900 rounded px-2 py-1">
                        <span className="text-slate-500">平均句长</span>
                        <span className="text-slate-200 ml-1">{fp.avgSentenceLength.toFixed(1)}</span>
                      </div>
                    )}
                    {fp.dialogueRatio !== undefined && (
                      <div className="bg-slate-900 rounded px-2 py-1">
                        <span className="text-slate-500">对话占比</span>
                        <span className="text-slate-200 ml-1">{(fp.dialogueRatio * 100).toFixed(1)}%</span>
                      </div>
                    )}
                    {fp.vocabularyRichness && (
                      <div className="bg-slate-900 rounded px-2 py-1">
                        <span className="text-slate-500">词汇丰富度</span>
                        <span className="text-slate-200 ml-1">{fp.vocabularyRichness.toFixed(3)}</span>
                      </div>
                    )}
                    {fp.emotionIntensity && (
                      <div className="bg-slate-900 rounded px-2 py-1">
                        <span className="text-slate-500">情感强度</span>
                        <span className="text-slate-200 ml-1">{fp.emotionIntensity.toFixed(2)}</span>
                      </div>
                    )}
                  </div>
                  {fp.topPhrases && fp.topPhrases.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-1">
                      {fp.topPhrases.map((ph, i) => (
                        <span key={i} className="text-[10px] px-1.5 py-0.5 rounded-full bg-sky-500/10 text-sky-300 border border-sky-500/20">
                          {ph}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </Card>

      {/* 角色记忆 */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">角色 episodic 记忆</CardTitle>
          <p className="text-xs text-slate-500 mt-1">角色在各章节中的关键事件、成长弧线和情感变化。</p>
        </CardHeader>
        <div className="px-4 pb-4">
          {memories.length === 0 ? (
            <div className="text-sm text-slate-500 py-4">暂无角色记忆。系统会在章节总结后自动提取。</div>
          ) : (
            <div className="space-y-3">
              {memories.map((m, idx) => (
                <div key={idx} className="bg-slate-800/50 rounded-lg p-4 border border-slate-700/40">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-semibold text-emerald-400">{m.charName}</span>
                    <span className="text-xs text-slate-500">第 {m.chapterRange} 章</span>
                  </div>
                  <div className="text-xs text-slate-400 mb-1">类型: {m.episodeType}</div>
                  <div className="text-sm text-slate-300 whitespace-pre-wrap">{m.content}</div>
                  {m.tags && m.tags.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-1">
                      {m.tags.map((t, i) => (
                        <span key={i} className="text-[10px] px-1.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-300 border border-emerald-500/20">
                          {t}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </Card>

      {/* 技能注入 */}
      {skill && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">技能注入</CardTitle>
            <p className="text-xs text-slate-500 mt-1">基于高评分章节自动提取的写作技巧，已注入到后续章节的创作提示中。</p>
          </CardHeader>
          <div className="px-4 pb-4">
            <div className="bg-slate-800/50 rounded-lg p-4 border border-slate-700/40">
              <div className="text-sm text-slate-300 whitespace-pre-wrap">{skill.injection || skill.content || JSON.stringify(skill, null, 2)}</div>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}
