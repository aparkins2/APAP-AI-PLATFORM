export type ModelClass = 'fast' | 'smart' | 'embedding';

export type UserRole =
  | 'administrator'
  | 'engineer'
  | 'broadcast-operator'
  | 'community-moderator'
  | 'standard-user';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  apiKeyHash: string;
  apiKey?: string;
  apiKeyPrefix: string;
  active: boolean;
  rateLimitPerMinute: number;
  createdAt: string;
  updatedAt: string;
  lastActiveAt?: string;
}

export interface AppEntity {
  id: string;
  name: string;
  slug: string;
  apiKeyHash: string;
  apiKey?: string;
  apiKeyPrefix: string;
  active: boolean;
  rateLimitPerMinute: number;
  createdAt: string;
  updatedAt: string;
  totalRequests: number;
  description?: string;
  lastActiveAt?: string;
}

export interface PromptTemplate {
  id: string;
  name: string;
  description: string;
  systemPrompt: string;
  userPromptTemplate: string;
  modelClass: ModelClass;
  temperature: number;
  maxTokens: number;
  active: boolean;
  variables: string[];
  createdAt: string;
  updatedAt: string;
  category: 'streaming' | 'chat' | 'radio' | 'production' | 'moderation' | 'general';
}

export interface RequestLog {
  id: string;
  appId: string;
  appName: string;
  requestId: string;
  endpoint: string;
  task: string;
  model: string;
  modelClass: ModelClass;
  status: 200 | 400 | 401 | 403 | 429 | 500;
  promptTokens: number;
  completionTokens: number;
  totalTokens: number;
  totalDurationMs: number;
  loadDurationMs: number;
  promptEvalDurationMs: number;
  evalDurationMs: number;
  createdAt: string;
  inputPayloadSummary?: string;
  outputSummary?: string;
  errorMessage?: string;
}

export interface ServerHealth {
  status: 'ok' | 'degraded' | 'error';
  service: string;
  ollama: boolean;
  database: boolean;
  redis: boolean;
  fastModel: string;
  smartModel: string;
  uptimeSeconds: number;
  cpuUsagePct: number;
  ramUsageGb: {
    used: number;
    total: number;
  };
  gpuDetected: boolean;
  activeRequests: number;
  tokensPerSec: number;
  avgLatencyMs: number;
}

export interface DeploymentStep {
  id: number;
  title: string;
  description: string;
  category: 'Infrastructure' | 'Models' | 'Gateway' | 'Database' | 'Security' | 'Verification';
  command?: string;
  codeBlock?: string;
  expectedOutput?: string;
  verificationCheck?: string;
  status: 'pending' | 'in-progress' | 'completed' | 'skipped';
}

export interface ChatMessage {
  id: string;
  role: 'system' | 'user' | 'assistant';
  content: string;
  timestamp: string;
  tokens?: number;
  model?: string;
}
