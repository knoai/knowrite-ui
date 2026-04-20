const API_BASE = '';

export async function getWorks() {
  const res = await fetch(`${API_BASE}/api/novel/works`);
  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`服务器错误 (${res.status}): ${errText || '未知错误'}`);
  }
  return res.json();
}

export async function getWork(workId) {
  const res = await fetch(`${API_BASE}/api/novel/works/${encodeURIComponent(workId)}`);
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export async function startNovel(body, onChunk, signal, onEvent) {
  return postStream(`${API_BASE}/api/novel/start`, body, onChunk, signal, onEvent);
}

export async function continueNovel(body, onChunk, signal, onEvent) {
  return postStream(`${API_BASE}/api/novel/continue`, body, onChunk, signal, onEvent);
}

export async function tryCreateOutline(body, onChunk, signal, onEvent) {
  return postStream(`${API_BASE}/api/novel/try/outline`, body, onChunk, signal, onEvent);
}

export async function tryCreateDetailedOutline(body, onChunk, signal, onEvent) {
  return postStream(`${API_BASE}/api/novel/try/detailed-outline`, body, onChunk, signal, onEvent);
}

export async function tryCreateChapters(body, onChunk, signal, onEvent) {
  return postStream(`${API_BASE}/api/novel/try/chapters`, body, onChunk, signal, onEvent);
}

export async function tryContinue(body, onChunk, signal, onEvent) {
  return postStream(`${API_BASE}/api/novel/try/continue`, body, onChunk, signal, onEvent);
}

export async function importNovel(body) {
  const res = await fetch(`${API_BASE}/api/novel/import`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export async function importOutline(body) {
  const res = await fetch(`${API_BASE}/api/novel/import-outline`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export async function checkDeviation(body) {
  const res = await fetch(`${API_BASE}/api/novel/deviation-check`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export async function correctDeviation(body, onChunk, signal) {
  return postStream(`${API_BASE}/api/novel/deviation-correct`, body, onChunk, signal);
}

export async function correctStyle(body, onChunk, signal) {
  return postStream(`${API_BASE}/api/novel/style-correct`, body, onChunk, signal);
}

export async function checkRepetition(body) {
  const res = await fetch(`${API_BASE}/api/novel/repetition-check`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export async function repairRepetition(body, onChunk, signal) {
  return postStream(`${API_BASE}/api/novel/repetition-repair`, body, onChunk, signal);
}

export async function listPrompts() {
  const res = await fetch(`${API_BASE}/api/novel/prompts`);
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export async function getSettings() {
  const res = await fetch(`${API_BASE}/api/novel/settings`);
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export async function saveSettings(body) {
  const res = await fetch(`${API_BASE}/api/novel/settings`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export async function getAuthorStyles() {
  const res = await fetch(`${API_BASE}/api/novel/author-styles`);
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export async function saveAuthorStyles(body) {
  const res = await fetch(`${API_BASE}/api/novel/author-styles`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export async function getPlatformStyles() {
  const res = await fetch(`${API_BASE}/api/novel/platform-styles`);
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export async function savePlatformStyles(body) {
  const res = await fetch(`${API_BASE}/api/novel/platform-styles`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export async function getReviewDimensions() {
  const res = await fetch(`${API_BASE}/api/novel/review-dimensions`);
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export async function saveReviewDimensions(body) {
  const res = await fetch(`${API_BASE}/api/novel/review-dimensions`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export async function getReviewPreset() {
  const res = await fetch(`${API_BASE}/api/novel/review-preset`);
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export async function setReviewPreset(preset) {
  const res = await fetch(`${API_BASE}/api/novel/review-preset`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ preset }),
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export async function getModelLibrary() {
  const res = await fetch(`${API_BASE}/api/novel/model-library`);
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export async function saveModelLibrary(body) {
  const res = await fetch(`${API_BASE}/api/novel/model-library`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export async function getModelConfig() {
  const res = await fetch(`${API_BASE}/api/novel/model-config`);
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export async function saveModelConfig(body) {
  const res = await fetch(`${API_BASE}/api/novel/model-config`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export async function switchProvider(provider, options = {}) {
  const res = await fetch(`${API_BASE}/api/novel/switch-provider`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ provider, ...options }),
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export async function testProvider(provider) {
  const res = await fetch(`${API_BASE}/api/novel/test-provider`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ provider }),
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export async function testModels(provider) {
  const res = await fetch(`${API_BASE}/api/novel/test-models`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ provider }),
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export async function evolvePrompt(body) {
  const res = await fetch(`${API_BASE}/api/novel/evolve`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export async function getChapterConfig() {
  const res = await fetch(`${API_BASE}/api/novel/chapter-config`);
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export async function saveChapterConfig(body) {
  const res = await fetch(`${API_BASE}/api/novel/chapter-config`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export async function getWritingMode() {
  const res = await fetch(`${API_BASE}/api/novel/writing-mode`);
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export async function saveWritingMode(mode) {
  const res = await fetch(`${API_BASE}/api/novel/writing-mode`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ mode }),
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export async function chat(body, onChunk, signal) {
  return postStream(`${API_BASE}/api/novel/chat`, body, onChunk, signal);
}

// ===================== 世界观上下文 API =====================

function workUrl(workId, path) {
  return `${API_BASE}/api/novel/works/${encodeURIComponent(workId)}${path}`;
}

async function getJson(url) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

async function postJson(url, body) {
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

async function putJson(url, body) {
  const res = await fetch(url, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

async function delJson(url) {
  const res = await fetch(url, { method: 'DELETE' });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

// 世界观
export async function getWorldLore(workId) { return getJson(workUrl(workId, '/world-lore')); }
export async function createWorldLore(workId, body) { return postJson(workUrl(workId, '/world-lore'), body); }
export async function updateWorldLore(workId, id, body) { return putJson(workUrl(workId, `/world-lore/${id}`), body); }
export async function deleteWorldLore(workId, id) { return delJson(workUrl(workId, `/world-lore/${id}`)); }

// 人物
export async function getCharacters(workId) { return getJson(workUrl(workId, '/characters')); }
export async function createCharacter(workId, body) { return postJson(workUrl(workId, '/characters'), body); }
export async function updateCharacter(workId, id, body) { return putJson(workUrl(workId, `/characters/${id}`), body); }
export async function deleteCharacter(workId, id) { return delJson(workUrl(workId, `/characters/${id}`)); }

// 人物关系
export async function getCharacterRelations(workId) { return getJson(workUrl(workId, '/character-relations')); }
export async function createCharacterRelation(workId, body) { return postJson(workUrl(workId, '/character-relations'), body); }
export async function updateCharacterRelation(workId, id, body) { return putJson(workUrl(workId, `/character-relations/${id}`), body); }
export async function deleteCharacterRelation(workId, id) { return delJson(workUrl(workId, `/character-relations/${id}`)); }

// 剧情线
export async function getPlotLines(workId) { return getJson(workUrl(workId, '/plot-lines')); }
export async function createPlotLine(workId, body) { return postJson(workUrl(workId, '/plot-lines'), body); }
export async function updatePlotLine(workId, id, body) { return putJson(workUrl(workId, `/plot-lines/${id}`), body); }
export async function deletePlotLine(workId, id) { return delJson(workUrl(workId, `/plot-lines/${id}`)); }

// 剧情节点
export async function getPlotNodes(workId, lineId) { return getJson(workUrl(workId, `/plot-lines/${lineId}/nodes`)); }
export async function createPlotNode(workId, lineId, body) { return postJson(workUrl(workId, `/plot-lines/${lineId}/nodes`), body); }
export async function updatePlotNode(workId, lineId, id, body) { return putJson(workUrl(workId, `/plot-lines/${lineId}/nodes/${id}`), body); }
export async function deletePlotNode(workId, lineId, id) { return delJson(workUrl(workId, `/plot-lines/${lineId}/nodes/${id}`)); }

// 地图区域
export async function getMapRegions(workId) { return getJson(workUrl(workId, '/map-regions')); }
export async function createMapRegion(workId, body) { return postJson(workUrl(workId, '/map-regions'), body); }
export async function updateMapRegion(workId, id, body) { return putJson(workUrl(workId, `/map-regions/${id}`), body); }
export async function deleteMapRegion(workId, id) { return delJson(workUrl(workId, `/map-regions/${id}`)); }

// 区域连接
export async function getMapConnections(workId) { return getJson(workUrl(workId, '/map-connections')); }
export async function createMapConnection(workId, body) { return postJson(workUrl(workId, '/map-connections'), body); }
export async function updateMapConnection(workId, id, body) { return putJson(workUrl(workId, `/map-connections/${id}`), body); }
export async function deleteMapConnection(workId, id) { return delJson(workUrl(workId, `/map-connections/${id}`)); }

// 上下文
export async function getWorldContext(workId, chapterNumber) {
  const url = workUrl(workId, '/context') + (chapterNumber ? `?chapterNumber=${chapterNumber}` : '');
  return getJson(url);
}

// 作品关联套路
export async function getWorkTemplates(workId) { return getJson(workUrl(workId, '/templates')); }
export async function applyTemplate(workId, templateId) { return postJson(workUrl(workId, `/apply-template/${templateId}`), {}); }

// 手动触发世界观提取
export async function extractWorld(workId, model) {
  const res = await fetch(`${API_BASE}/api/novel/works/${encodeURIComponent(workId)}/extract-world`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ model }),
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}
export async function removeTemplate(workId, templateId) { return delJson(workUrl(workId, `/remove-template/${templateId}`)); }

// 全局套路库
export async function getStoryTemplates(scope = 'global') {
  const res = await fetch(`${API_BASE}/api/novel/story-templates?scope=${scope}`);
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}
export async function createStoryTemplate(body) { return postJson(`${API_BASE}/api/novel/story-templates`, body); }
export async function updateStoryTemplate(id, body) { return putJson(`${API_BASE}/api/novel/story-templates/${id}`, body); }
export async function deleteStoryTemplate(id) { return delJson(`${API_BASE}/api/novel/story-templates/${id}`); }

async function postStream(url, body, onChunk, signal, onEvent) {
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
    signal,
  });
  if (!res.ok) throw new Error(await res.text());
  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  let buffer = '';
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split('\n');
    buffer = lines.pop();
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
          onChunk(`\n\n--- ${ev.step} 完成 ---\n\n`);
        }
        if (ev.type === 'done') {
          if (onEvent) onEvent({ type: 'done', meta: ev.meta });
          onChunk('\n\n✅ 全部完成\n');
        }
        if (ev.type === 'error') {
          const raw = ev.message || '流式响应异常';
          const isConfig = raw.includes('模型配置') || raw.includes('未配置') || raw.includes('Provider') || raw.includes('baseURL') || raw.includes('apiKey');
          const isNetwork = raw.includes('网络错误') || raw.includes('ECONNREFUSED') || raw.includes('ENOTFOUND') || raw.includes('ETIMEDOUT');
          let prefix = '【服务端错误】';
          if (isConfig) prefix = '【模型配置错误】';
          if (isNetwork) prefix = '【网络错误】';
          const full = `${prefix} ${raw}${ev.context ? ` (${ev.context})` : ''}`;
          if (onEvent) onEvent({ type: 'error', message: full, rawMessage: raw, context: ev.context });
          throw new Error(full);
        }
      } catch (e) {
        if (e.message === '流式错误' || e.message.includes('流式')) throw e;
        // ignore malformed JSON lines
      }
    }
  }
}

// ===================== 对话式创作 API =====================
export async function chatAgent(workId, messages, onChunk, signal) {
  return postStream(
    `${API_BASE}/api/chat-agent/works/${encodeURIComponent(workId)}`,
    { messages },
    onChunk,
    signal
  );
}

// ===================== 拆书 API =====================
export async function deconstructBook(text, options = {}) {
  const res = await fetch(`${API_BASE}/api/book-deconstruct`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ text, ...options }),
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export async function getDeconstructHistory() {
  return getJson(`${API_BASE}/api/book-deconstruct`);
}

// ===================== 声纹 & 角色记忆 API =====================
export async function getVoiceFingerprints(workId) {
  return getJson(workUrl(workId, '/voice-fingerprints'));
}

export async function getCharacterMemories(workId) {
  return getJson(workUrl(workId, '/character-memories'));
}

export async function refreshCharacterMemories(workId) {
  return postJson(workUrl(workId, '/character-memories/refresh'), {});
}

export async function getSkillInjection(workId) {
  return getJson(workUrl(workId, '/skill-injection'));
}

// ===================== Agent 模型配置 API =====================
export async function getAgentModels() {
  return getJson(`${API_BASE}/api/novel/settings/agent-models`);
}

export async function saveAgentModels(agentModels) {
  const res = await fetch(`${API_BASE}/api/novel/settings/agent-models`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(agentModels),
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export async function getAgentModel(role) {
  return getJson(`${API_BASE}/api/novel/settings/agent-models/${encodeURIComponent(role)}`);
}

export async function saveAgentModel(role, config) {
  const res = await fetch(`${API_BASE}/api/novel/settings/agent-models/${encodeURIComponent(role)}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(config),
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export async function deleteAgentModel(role) {
  const res = await fetch(`${API_BASE}/api/novel/settings/agent-models/${encodeURIComponent(role)}`, {
    method: 'DELETE',
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

// ===================== Engine Pipeline 配置 API =====================
export async function getEnginePipeline() {
  return getJson(`${API_BASE}/api/novel/engine/pipeline`);
}

export async function saveEnginePipeline(pipeline) {
  const res = await fetch(`${API_BASE}/api/novel/engine/pipeline`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(pipeline),
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

// ===================== Trace 调试 API =====================
export async function getTraces(workId, opts = {}) {
  const { agentType, from, to, limit = 50, offset = 0 } = opts;
  const params = new URLSearchParams();
  if (agentType) params.set('agentType', agentType);
  if (from) params.set('from', from);
  if (to) params.set('to', to);
  params.set('limit', String(limit));
  params.set('offset', String(offset));
  return getJson(`${API_BASE}/api/traces/${encodeURIComponent(workId)}?${params}`);
}

export async function getTraceStats(workId) {
  return getJson(`${API_BASE}/api/traces/${encodeURIComponent(workId)}/stats`);
}

export async function getTraceTimeline(workId, chapterNumber) {
  const params = chapterNumber ? `?chapterNumber=${chapterNumber}` : '';
  return getJson(`${API_BASE}/api/traces/${encodeURIComponent(workId)}/timeline${params}`);
}

export async function getAgentTraces(workId, agentType, limit = 100) {
  return getJson(`${API_BASE}/api/traces/${encodeURIComponent(workId)}/agent/${encodeURIComponent(agentType)}?limit=${limit}`);
}
