export interface Work {
  workId: string;
  topic: string;
  style?: string;
  platformStyle?: string;
  authorStyle?: string;
  strategy?: 'knowrite' | 'pipeline';
  outlineTheme?: string;
  outlineDetailed?: string;
  outlineMultivolume?: string;
  currentVolume?: number;
  reviews?: Record<string, unknown>;
  fitness?: Record<string, unknown>;
  writingMode?: string | null;
  language?: string;
  status?: string;
  pausedAtStep?: string;
  createdAt?: string;
  updatedAt?: string;
  volumes?: Volume[];
  chapters?: Chapter[];
}

export interface Volume {
  id?: number;
  workId: string;
  number: number;
  title?: string;
  outlineFile?: string;
  chapterRange?: number[];
  status?: string;
}

export interface Chapter {
  id?: number;
  workId: string;
  number: number;
  rawFile?: string;
  editedFile?: string;
  humanizedFile?: string;
  finalFile?: string;
  polishFile?: string;
  feedbackFile?: string;
  summaryFile?: string;
  chars?: number;
  models?: Record<string, string>;
}

export type SSEEventType = 'chunk' | 'stepStart' | 'stepEnd' | 'done' | 'paused' | 'error';

export interface StreamEvent {
  type: SSEEventType;
  data?: string;
  step?: string;
  agentType?: string;
  message?: string;
}

export interface ModelConfig {
  providers: Record<string, ProviderInfo>;
  roleDefaults: Record<string, string>;
  agentModels?: Record<string, string>;
  writerRotation?: string[];
}

export interface ProviderInfo {
  name: string;
  baseURL: string;
  apiKey: string;
  models: string[];
  defaultModel?: string;
}

export interface Settings {
  modelConfig?: ModelConfig;
  reviewDimensions?: string[];
  engine?: EngineConfig;
}

export interface EngineConfig {
  pipeline?: { stages?: PipelineStage[] };
  truncation?: { workIdTopicLength?: number };
}

export interface PipelineStage {
  name: string;
  enabled: boolean;
  autoSkip?: boolean;
}

export type ToastType = 'success' | 'error' | 'info' | 'warning';

export interface ToastItem {
  id: string;
  message: string;
  type: ToastType;
  duration?: number;
}
