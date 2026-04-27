import { t, getStoredLang, zh } from '../i18n';
import type { Work, Settings } from '../types';

const $t = (key: string, vars?: Record<string, unknown>) => t(key, getStoredLang(), vars);

const API_BASE = '';

export async function getWorks(): Promise<{ works: Work[] }> {
  const res = await fetch(`${API_BASE}/api/novel/works`);
  if (!res.ok) {
    const errText = await res.text();
    throw new Error($t('api_error_server', { status: res.status, message: errText || $t('api_error_unknown') }));
  }
  return res.json();
}

export async function getWork(workId: string): Promise<Work> {
  const res = await fetch(`${API_BASE}/api/novel/works/${encodeURIComponent(workId)}`);
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export async function startNovel(
  body: Record<string, unknown>,
  onChunk: (chunk: string) => void,
  signal?: AbortSignal,
  onEvent?: (event: Record<string, unknown>) => void,
): Promise<void> {
  return postStream(`${API_BASE}/api/novel/start`, body, onChunk, signal, onEvent);
}

export async function continueNovel(
  body: Record<string, unknown>,
  onChunk: (chunk: string) => void,
  signal?: AbortSignal,
  onEvent?: (event: Record<string, unknown>) => void,
): Promise<void> {
  return postStream(`${API_BASE}/api/novel/continue`, body, onChunk, signal, onEvent);
}

export async function tryCreateOutline(
  body: Record<string, unknown>,
  onChunk: (chunk: string) => void,
  signal?: AbortSignal,
  onEvent?: (event: Record<string, unknown>) => void,
): Promise<void> {
  return postStream(`${API_BASE}/api/novel/try/outline`, body, onChunk, signal, onEvent);
}

export async function tryCreateDetailedOutline(
  body: Record<string, unknown>,
  onChunk: (chunk: string) => void,
  signal?: AbortSignal,
  onEvent?: (event: Record<string, unknown>) => void,
): Promise<void> {
  return postStream(`${API_BASE}/api/novel/try/detailed-outline`, body, onChunk, signal, onEvent);
}

export async function tryCreateChapters(
  body: Record<string, unknown>,
  onChunk: (chunk: string) => void,
  signal?: AbortSignal,
  onEvent?: (event: Record<string, unknown>) => void,
): Promise<void> {
  return postStream(`${API_BASE}/api/novel/try/chapters`, body, onChunk, signal, onEvent);
}

export async function tryContinue(
  body: Record<string, unknown>,
  onChunk: (chunk: string) => void,
  signal?: AbortSignal,
  onEvent?: (event: Record<string, unknown>) => void,
): Promise<void> {
  return postStream(`${API_BASE}/api/novel/try/continue`, body, onChunk, signal, onEvent);
}

export async function importNovel(body: Record<string, unknown>): Promise<unknown> {
  const res = await fetch(`${API_BASE}/api/novel/import`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export async function importOutline(body: Record<string, unknown>): Promise<unknown> {
  const res = await fetch(`${API_BASE}/api/novel/import-outline`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export async function checkDeviation(body: Record<string, unknown>): Promise<unknown> {
  const res = await fetch(`${API_BASE}/api/novel/deviation-check`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export async function correctDeviation(
  body: Record<string, unknown>,
  onChunk: (chunk: string) => void,
  signal?: AbortSignal,
): Promise<void> {
  return postStream(`${API_BASE}/api/novel/deviation-correct`, body, onChunk, signal);
}

export async function correctStyle(
  body: Record<string, unknown>,
  onChunk: (chunk: string) => void,
  signal?: AbortSignal,
): Promise<void> {
  return postStream(`${API_BASE}/api/novel/style-correct`, body, onChunk, signal);
}

export async function checkRepetition(body: Record<string, unknown>): Promise<unknown> {
  const res = await fetch(`${API_BASE}/api/novel/repetition-check`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export async function repairRepetition(
  body: Record<string, unknown>,
  onChunk: (chunk: string) => void,
  signal?: AbortSignal,
): Promise<void> {
  return postStream(`${API_BASE}/api/novel/repetition-repair`, body, onChunk, signal);
}

export async function listPrompts(): Promise<unknown> {
  const res = await fetch(`${API_BASE}/api/novel/prompts`);
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export async function getSettings(): Promise<Settings> {
  const res = await fetch(`${API_BASE}/api/novel/settings`);
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export async function saveSettings(body: Record<string, unknown>): Promise<unknown> {
  const res = await fetch(`${API_BASE}/api/novel/settings`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export async function getAuthorStyles(): Promise<unknown> {
  const res = await fetch(`${API_BASE}/api/novel/author-styles`);
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export async function saveAuthorStyles(body: Record<string, unknown>): Promise<unknown> {
  const res = await fetch(`${API_BASE}/api/novel/author-styles`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export async function getPlatformStyles(): Promise<unknown> {
  const res = await fetch(`${API_BASE}/api/novel/platform-styles`);
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export async function savePlatformStyles(body: Record<string, unknown>): Promise<unknown> {
  const res = await fetch(`${API_BASE}/api/novel/platform-styles`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export async function getReviewDimensions(): Promise<unknown> {
  const res = await fetch(`${API_BASE}/api/novel/review-dimensions`);
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export async function saveReviewDimensions(body: Record<string, unknown>): Promise<unknown> {
  const res = await fetch(`${API_BASE}/api/novel/review-dimensions`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export async function getReviewPreset(): Promise<unknown> {
  const res = await fetch(`${API_BASE}/api/novel/review-preset`);
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export async function setReviewPreset(preset: string): Promise<unknown> {
  const res = await fetch(`${API_BASE}/api/novel/review-preset`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ preset }),
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export async function getModelLibrary(): Promise<unknown> {
  const res = await fetch(`${API_BASE}/api/novel/model-library`);
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export async function saveModelLibrary(body: Record<string, unknown>): Promise<unknown> {
  const res = await fetch(`${API_BASE}/api/novel/model-library`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export async function getModelConfig(): Promise<unknown> {
  const res = await fetch(`${API_BASE}/api/novel/model-config`);
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export async function saveModelConfig(body: Record<string, unknown>): Promise<unknown> {
  const res = await fetch(`${API_BASE}/api/novel/model-config`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export async function switchProvider(provider: string, options: Record<string, unknown> = {}): Promise<unknown> {
  const res = await fetch(`${API_BASE}/api/novel/switch-provider`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ provider, ...options }),
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export async function testProvider(provider: string): Promise<unknown> {
  const res = await fetch(`${API_BASE}/api/novel/test-provider`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ provider }),
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export async function testModels(provider: string): Promise<unknown> {
  const res = await fetch(`${API_BASE}/api/novel/test-models`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ provider }),
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export async function evolvePrompt(body: Record<string, unknown>): Promise<unknown> {
  const res = await fetch(`${API_BASE}/api/novel/evolve`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export async function getChapterConfig(): Promise<unknown> {
  const res = await fetch(`${API_BASE}/api/novel/chapter-config`);
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export async function saveChapterConfig(body: Record<string, unknown>): Promise<unknown> {
  const res = await fetch(`${API_BASE}/api/novel/chapter-config`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export async function getWritingMode(): Promise<unknown> {
  const res = await fetch(`${API_BASE}/api/novel/writing-mode`);
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export async function saveWritingMode(mode: string): Promise<unknown> {
  const res = await fetch(`${API_BASE}/api/novel/writing-mode`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ mode }),
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export async function chat(
  body: Record<string, unknown>,
  onChunk: (chunk: string) => void,
  signal?: AbortSignal,
): Promise<void> {
  return postStream(`${API_BASE}/api/novel/chat`, body, onChunk, signal);
}

// ===================== 世界观上下文 API =====================

function workUrl(workId: string, path: string): string {
  return `${API_BASE}/api/novel/works/${encodeURIComponent(workId)}${path}`;
}

async function getJson(url: string): Promise<unknown> {
  const res = await fetch(url);
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

async function postJson(url: string, body: Record<string, unknown>): Promise<unknown> {
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

async function putJson(url: string, body: Record<string, unknown>): Promise<unknown> {
  const res = await fetch(url, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

async function delJson(url: string): Promise<unknown> {
  const res = await fetch(url, { method: 'DELETE' });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

// 世界观
export async function getWorldLore(workId: string): Promise<unknown> { return getJson(workUrl(workId, '/world-lore')); }
export async function createWorldLore(workId: string, body: Record<string, unknown>): Promise<unknown> { return postJson(workUrl(workId, '/world-lore'), body); }
export async function updateWorldLore(workId: string, id: string | number, body: Record<string, unknown>): Promise<unknown> { return putJson(workUrl(workId, `/world-lore/${id}`), body); }
export async function deleteWorldLore(workId: string, id: string | number): Promise<unknown> { return delJson(workUrl(workId, `/world-lore/${id}`)); }

// 人物
export async function getCharacters(workId: string): Promise<unknown> { return getJson(workUrl(workId, '/characters')); }
export async function createCharacter(workId: string, body: Record<string, unknown>): Promise<unknown> { return postJson(workUrl(workId, '/characters'), body); }
export async function updateCharacter(workId: string, id: string | number, body: Record<string, unknown>): Promise<unknown> { return putJson(workUrl(workId, `/characters/${id}`), body); }
export async function deleteCharacter(workId: string, id: string | number): Promise<unknown> { return delJson(workUrl(workId, `/characters/${id}`)); }

// 人物关系
export async function getCharacterRelations(workId: string): Promise<unknown> { return getJson(workUrl(workId, '/character-relations')); }
export async function createCharacterRelation(workId: string, body: Record<string, unknown>): Promise<unknown> { return postJson(workUrl(workId, '/character-relations'), body); }
export async function updateCharacterRelation(workId: string, id: string | number, body: Record<string, unknown>): Promise<unknown> { return putJson(workUrl(workId, `/character-relations/${id}`), body); }
export async function deleteCharacterRelation(workId: string, id: string | number): Promise<unknown> { return delJson(workUrl(workId, `/character-relations/${id}`)); }

// 剧情线
export async function getPlotLines(workId: string): Promise<unknown> { return getJson(workUrl(workId, '/plot-lines')); }
export async function createPlotLine(workId: string, body: Record<string, unknown>): Promise<unknown> { return postJson(workUrl(workId, '/plot-lines'), body); }
export async function updatePlotLine(workId: string, id: string | number, body: Record<string, unknown>): Promise<unknown> { return putJson(workUrl(workId, `/plot-lines/${id}`), body); }
export async function deletePlotLine(workId: string, id: string | number): Promise<unknown> { return delJson(workUrl(workId, `/plot-lines/${id}`)); }

// 剧情节点
export async function getPlotNodes(workId: string, lineId: string | number): Promise<unknown> { return getJson(workUrl(workId, `/plot-lines/${lineId}/nodes`)); }
export async function createPlotNode(workId: string, lineId: string | number, body: Record<string, unknown>): Promise<unknown> { return postJson(workUrl(workId, `/plot-lines/${lineId}/nodes`), body); }
export async function updatePlotNode(workId: string, lineId: string | number, id: string | number, body: Record<string, unknown>): Promise<unknown> { return putJson(workUrl(workId, `/plot-lines/${lineId}/nodes/${id}`), body); }
export async function deletePlotNode(workId: string, lineId: string | number, id: string | number): Promise<unknown> { return delJson(workUrl(workId, `/plot-lines/${lineId}/nodes/${id}`)); }

// 地图区域
export async function getMapRegions(workId: string): Promise<unknown> { return getJson(workUrl(workId, '/map-regions')); }
export async function createMapRegion(workId: string, body: Record<string, unknown>): Promise<unknown> { return postJson(workUrl(workId, '/map-regions'), body); }
export async function updateMapRegion(workId: string, id: string | number, body: Record<string, unknown>): Promise<unknown> { return putJson(workUrl(workId, `/map-regions/${id}`), body); }
export async function deleteMapRegion(workId: string, id: string | number): Promise<unknown> { return delJson(workUrl(workId, `/map-regions/${id}`)); }

// 区域连接
export async function getMapConnections(workId: string): Promise<unknown> { return getJson(workUrl(workId, '/map-connections')); }
export async function createMapConnection(workId: string, body: Record<string, unknown>): Promise<unknown> { return postJson(workUrl(workId, '/map-connections'), body); }
export async function updateMapConnection(workId: string, id: string | number, body: Record<string, unknown>): Promise<unknown> { return putJson(workUrl(workId, `/map-connections/${id}`), body); }
export async function deleteMapConnection(workId: string, id: string | number): Promise<unknown> { return delJson(workUrl(workId, `/map-connections/${id}`)); }

// 上下文
export async function getWorldContext(workId: string, chapterNumber?: number): Promise<unknown> {
  const url = workUrl(workId, '/context') + (chapterNumber ? `?chapterNumber=${chapterNumber}` : '');
  return getJson(url);
}

// 作品关联套路
export async function getWorkTemplates(workId: string): Promise<unknown> { return getJson(workUrl(workId, '/templates')); }
export async function applyTemplate(workId: string, templateId: string | number): Promise<unknown> { return postJson(workUrl(workId, `/apply-template/${templateId}`), {}); }

// 手动触发世界观提取
export async function extractWorld(workId: string, model?: string): Promise<unknown> {
  const res = await fetch(`${API_BASE}/api/novel/works/${encodeURIComponent(workId)}/extract-world`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ model }),
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}
export async function removeTemplate(workId: string, templateId: string | number): Promise<unknown> { return delJson(workUrl(workId, `/remove-template/${templateId}`)); }

// 全局套路库
export async function getStoryTemplates(scope = 'global'): Promise<unknown> {
  const res = await fetch(`${API_BASE}/api/novel/story-templates?scope=${scope}`);
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}
export async function createStoryTemplate(body: Record<string, unknown>): Promise<unknown> { return postJson(`${API_BASE}/api/novel/story-templates`, body); }
export async function updateStoryTemplate(id: string | number, body: Record<string, unknown>): Promise<unknown> { return putJson(`${API_BASE}/api/novel/story-templates/${id}`, body); }
export async function deleteStoryTemplate(id: string | number): Promise<unknown> { return delJson(`${API_BASE}/api/novel/story-templates/${id}`); }

async function postStream(
  url: string,
  body: Record<string, unknown>,
  onChunk: (chunk: string) => void,
  signal?: AbortSignal,
  onEvent?: (event: Record<string, unknown>) => void,
): Promise<void> {
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
    signal,
  });
  if (!res.ok) throw new Error(await res.text());
  const reader = res.body!.getReader();
  const decoder = new TextDecoder();
  let buffer = '';
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split('\n');
    buffer = lines.pop()!;
    for (const line of lines) {
      if (!line.trim()) continue;
      let text = line;
      if (text.startsWith('data:')) text = text.slice(5).trim();
      if (!text) continue;
      if (text === '[DONE]') continue;
      try {
        const ev = JSON.parse(text);
        if (ev.type === 'chunk' && typeof ev.chunk === 'string') onChunk(ev.chunk);
        if (ev.type === 'stepStart' && onEvent) onEvent({ type: 'stepStart', step: ev.step, name: ev.name, model: ev.model });
        if (ev.type === 'stepEnd') {
          if (onEvent) onEvent({ type: 'stepEnd', step: ev.step });
          onChunk(`\n\n--- ${ev.step} ${$t('label_complete')} ---\n\n`);
        }
        if (ev.type === 'done') {
          if (onEvent) onEvent({ type: 'done', meta: ev.meta });
          onChunk(`\n\n✅ ${$t('status_all_complete')}\n`);
        }
        if (ev.type === 'paused') {
          if (onEvent) onEvent({ type: 'paused', step: ev.step, message: ev.message });
          onChunk(`

⏸️ ${$t('status_paused')}: ${ev.step}
`);
          break;
        }

        if (ev.type === 'error') {
          const raw = ev.message || $t('api_error_stream');
          const isConfig = raw.includes(zh.label_model_config) || raw.includes(zh.status_not_configured) || raw.includes('Provider') || raw.includes('baseURL') || raw.includes('apiKey');
          const isNetwork = raw.includes(zh.label_network_error) || raw.includes('ECONNREFUSED') || raw.includes('ENOTFOUND') || raw.includes('ETIMEDOUT');
          let prefix = $t('prefix_server_error');
          if (isConfig) prefix = $t('prefix_model_config_error');
          if (isNetwork) prefix = $t('prefix_network_error');
          const full = `${prefix} ${raw}${ev.context ? ` (${ev.context})` : ''}`;
          if (onEvent) onEvent({ type: 'error', message: full, rawMessage: raw, context: ev.context });
          throw new Error(full);
        }
      } catch (e: unknown) {
        if (e instanceof Error && (e.message === zh.api_error_streaming || e.message.includes(zh.label_streaming))) throw e;
        // ignore malformed JSON lines
      }
    }
  }
}

// ===================== 对话式创作 API =====================
export async function chatAgent(
  workId: string,
  messages: Record<string, unknown>[],
  onChunk: (chunk: string) => void,
  signal?: AbortSignal,
): Promise<void> {
  return postStream(
    `${API_BASE}/api/chat-agent/works/${encodeURIComponent(workId)}`,
    { messages },
    onChunk,
    signal
  );
}

// ===================== 拆书 API =====================
export async function deconstructBook(text: string, options: Record<string, unknown> = {}): Promise<unknown> {
  const res = await fetch(`${API_BASE}/api/book-deconstruct`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ text, ...options }),
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export async function getDeconstructHistory(): Promise<unknown> {
  return getJson(`${API_BASE}/api/book-deconstruct`);
}

// ===================== 声纹 & 角色记忆 API =====================
export async function getVoiceFingerprints(workId: string): Promise<unknown> {
  return getJson(workUrl(workId, '/voice-fingerprints'));
}

export async function getCharacterMemories(workId: string): Promise<unknown> {
  return getJson(workUrl(workId, '/character-memories'));
}

export async function refreshCharacterMemories(workId: string): Promise<unknown> {
  return postJson(workUrl(workId, '/character-memories/refresh'), {});
}

export async function getSkillInjection(workId: string): Promise<unknown> {
  return getJson(workUrl(workId, '/skill-injection'));
}

// ===================== Agent 模型配置 API =====================
export async function getAgentModels(): Promise<unknown> {
  return getJson(`${API_BASE}/api/novel/settings/agent-models`);
}

export async function saveAgentModels(agentModels: Record<string, unknown>): Promise<unknown> {
  const res = await fetch(`${API_BASE}/api/novel/settings/agent-models`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(agentModels),
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export async function getAgentModel(role: string): Promise<unknown> {
  return getJson(`${API_BASE}/api/novel/settings/agent-models/${encodeURIComponent(role)}`);
}

export async function saveAgentModel(role: string, config: Record<string, unknown>): Promise<unknown> {
  const res = await fetch(`${API_BASE}/api/novel/settings/agent-models/${encodeURIComponent(role)}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(config),
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export async function deleteAgentModel(role: string): Promise<unknown> {
  const res = await fetch(`${API_BASE}/api/novel/settings/agent-models/${encodeURIComponent(role)}`, {
    method: 'DELETE',
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export async function deleteWork(workId: string): Promise<unknown> {
  const res = await fetch(`${API_BASE}/api/novel/works/${encodeURIComponent(workId)}`, {
    method: 'DELETE',
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

// ===================== Engine Pipeline 配置 API =====================
export async function getEnginePipeline(): Promise<unknown> {
  return getJson(`${API_BASE}/api/novel/engine/pipeline`);
}

export async function saveEnginePipeline(pipeline: Record<string, unknown>): Promise<unknown> {
  const res = await fetch(`${API_BASE}/api/novel/engine/pipeline`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(pipeline),
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

// ===================== Trace 调试 API =====================
export async function getTraces(workId: string, opts: Record<string, unknown> = {}): Promise<unknown> {
  const { agentType, from, to, limit = 50, offset = 0 } = opts;
  const params = new URLSearchParams();
  if (agentType) params.set('agentType', String(agentType));
  if (from) params.set('from', String(from));
  if (to) params.set('to', String(to));
  params.set('limit', String(limit));
  params.set('offset', String(offset));
  return getJson(`${API_BASE}/api/traces/${encodeURIComponent(workId)}?${params}`);
}

export async function getTraceStats(workId: string): Promise<unknown> {
  return getJson(`${API_BASE}/api/traces/${encodeURIComponent(workId)}/stats`);
}

export async function getTraceTimeline(workId: string, chapterNumber?: number): Promise<unknown> {
  const params = chapterNumber ? `?chapterNumber=${chapterNumber}` : '';
  return getJson(`${API_BASE}/api/traces/${encodeURIComponent(workId)}/timeline${params}`);
}

export async function getAgentTraces(workId: string, agentType: string, limit = 100): Promise<unknown> {
  return getJson(`${API_BASE}/api/traces/${encodeURIComponent(workId)}/agent/${encodeURIComponent(agentType)}?limit=${limit}`);
}

// ===================== Pause / Resume API =====================
export async function pauseWork(workId: string): Promise<unknown> {
  const res = await fetch(`${API_BASE}/api/novel/works/${encodeURIComponent(workId)}/pause`, { method: 'POST' });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export async function resumeWork(workId: string): Promise<unknown> {
  const res = await fetch(`${API_BASE}/api/novel/works/${encodeURIComponent(workId)}/resume`, { method: 'POST' });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export async function getWorkStatus(workId: string): Promise<unknown> {
  const res = await fetch(`${API_BASE}/api/novel/works/${encodeURIComponent(workId)}/status`);
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}
