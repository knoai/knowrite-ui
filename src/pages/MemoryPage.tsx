// @ts-nocheck
import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Card, CardHeader, CardTitle } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import * as api from '../api/novel';
import { useI18n } from '../contexts/I18nContext';

export function MemoryPage() {
  const { workId } = useParams();
  const { t } = useI18n();
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
        {t('status_loading_memory')}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold text-slate-100">{t('page_memory_title')}</h2>
        <Button variant="ghost" size="sm" onClick={handleRefresh} disabled={refreshing}>
          {refreshing ? t('status_refreshing') : t('btn_refresh_memory')}
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
          <CardTitle className="text-base">{t('title_voice_fingerprints')}</CardTitle>
          <p className="text-xs text-slate-500 mt-1">{t('desc_voice_fingerprints')}</p>
        </CardHeader>
        <div className="px-4 pb-4">
          {voiceFps.length === 0 ? (
            <div className="text-sm text-slate-500 py-4">{t('empty_voice_fingerprints')}</div>
          ) : (
            <div className="space-y-3">
              {voiceFps.map((fp) => (
                <div key={fp.characterName} className="bg-slate-800/50 rounded-lg p-4 border border-slate-700/40">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-semibold text-sky-400">{fp.characterName}</span>
                    <span className="text-xs text-slate-500">{t('label_based_on_chapters', { count: fp.chapterCount || '?' })}</span>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                    {fp.avgSentenceLength && (
                      <div className="bg-slate-900 rounded px-2 py-1">
                        <span className="text-slate-500">{t('label_avg_sentence_length')}</span>
                        <span className="text-slate-200 ml-1">{fp.avgSentenceLength.toFixed(1)}</span>
                      </div>
                    )}
                    {fp.dialogueRatio !== undefined && (
                      <div className="bg-slate-900 rounded px-2 py-1">
                        <span className="text-slate-500">{t('label_dialogue_ratio')}</span>
                        <span className="text-slate-200 ml-1">{(fp.dialogueRatio * 100).toFixed(1)}%</span>
                      </div>
                    )}
                    {fp.vocabularyRichness && (
                      <div className="bg-slate-900 rounded px-2 py-1">
                        <span className="text-slate-500">{t('label_vocab_richness')}</span>
                        <span className="text-slate-200 ml-1">{fp.vocabularyRichness.toFixed(3)}</span>
                      </div>
                    )}
                    {fp.emotionIntensity && (
                      <div className="bg-slate-900 rounded px-2 py-1">
                        <span className="text-slate-500">{t('label_emotion_intensity')}</span>
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
          <CardTitle className="text-base">{t('title_character_memories')}</CardTitle>
          <p className="text-xs text-slate-500 mt-1">{t('desc_character_memories')}</p>
        </CardHeader>
        <div className="px-4 pb-4">
          {memories.length === 0 ? (
            <div className="text-sm text-slate-500 py-4">{t('empty_character_memories')}</div>
          ) : (
            <div className="space-y-3">
              {memories.map((m, idx) => (
                <div key={idx} className="bg-slate-800/50 rounded-lg p-4 border border-slate-700/40">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-semibold text-emerald-400">{m.charName}</span>
                    <span className="text-xs text-slate-500">{t('label_chapter_range', { range: m.chapterRange })}</span>
                  </div>
                  <div className="text-xs text-slate-400 mb-1">{t('label_type')}: {m.episodeType}</div>
                  <div className="text-sm text-slate-300 whitespace-pre-wrap">{m.content}</div>
                  {m.tags && m.tags.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-1">
                      {m.tags.map((tag, i) => (
                        <span key={i} className="text-[10px] px-1.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-300 border border-emerald-500/20">
                          {tag}
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
            <CardTitle className="text-base">{t('title_skill_injection')}</CardTitle>
            <p className="text-xs text-slate-500 mt-1">{t('desc_skill_injection')}</p>
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
