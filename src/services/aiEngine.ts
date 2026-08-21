import { AppEntity, PromptTemplate, ModelClass } from '../types';

export interface GenerateParams {
  task: string;
  input: Record<string, any>;
  rawPrompt?: string;
  temperature?: number;
  maxTokens?: number;
  apiKey?: string;
  modelClassOverride?: ModelClass;
  requireStructuredJson?: boolean;
}

export interface GenerateResult {
  success: boolean;
  requestId: string;
  task: string;
  modelClass: ModelClass;
  model: string;
  result: string | Record<string, any>;
  processingMs: number;
  tokens: {
    prompt: number;
    completion: number;
    total: number;
  };
  metrics: {
    totalDurationNs: number;
    loadDurationNs: number;
    promptEvalDurationNs: number;
    evalDurationNs: number;
  };
  error?: string;
  statusCode: number;
}

// Generate realistic SHA-256 simulation
export async function sha256Hex(text: string): Promise<string> {
  const enc = new TextEncoder();
  const data = enc.encode(text);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
}

// Generate fresh secure API key
export function generateRawApiKey(): { rawKey: string; prefix: string } {
  const chars = 'abcdef0123456789';
  let rand = '';
  for (let i = 0; i < 32; i++) {
    rand += chars[Math.floor(Math.random() * chars.length)];
  }
  const rawKey = `apapai_live_${rand}`;
  const prefix = `apapai_live_${rand.slice(0, 5)}...${rand.slice(-4)}`;
  return { rawKey, prefix };
}

// Interpolate template placeholders {{variable}}
export function interpolateTemplate(template: string, data: Record<string, any>): string {
  return template.replace(/\{\{\s*([a-zA-Z0-9_]+)\s*\}\}/g, (match, key) => {
    return data[key] !== undefined && data[key] !== null ? String(data[key]) : `[${key}]`;
  });
}

// Resolve model name from task/modelClass and environment variables
function selectModel(
  task: string,
  modelClassOverride?: ModelClass
): { name: string; class: ModelClass } {
  const smartTasks = ['run-of-show', 'podcast-summary', 'long-summary', 'document-analysis'];

  let modelClass: ModelClass = 'fast';
  if (modelClassOverride) {
    modelClass = modelClassOverride;
  } else if (smartTasks.includes(task)) {
    modelClass = 'smart';
  }

  const envKey = modelClass === 'smart' ? 'AI_SMART_MODEL' : 'AI_FAST_MODEL';
  const name = process.env[envKey] || 'qwen3.5:4b';

  return { name, class: modelClass };
}

// Build system + user prompt from templates or raw inputs
function buildPrompt(
  params: GenerateParams,
  templates: PromptTemplate[]
): { systemPrompt: string; userPrompt: string; matchedTemplate?: PromptTemplate } {
  const matchedTemplate = templates.find((t) => t.name === params.task && t.active);

  let systemPrompt: string;
  let userPrompt: string;

  if (params.rawPrompt) {
    systemPrompt = matchedTemplate?.systemPrompt || 'You are a helpful assistant for APAP Media Group.';
    userPrompt = params.rawPrompt;
  } else if (matchedTemplate) {
    systemPrompt = matchedTemplate.systemPrompt;
    userPrompt = interpolateTemplate(matchedTemplate.userPromptTemplate, params.input);
  } else {
    systemPrompt = 'You are a helpful assistant for APAP Media Group.';
    userPrompt = `Task: ${params.task}\nInput:\n${JSON.stringify(params.input, null, 2)}`;
  }

  return { systemPrompt, userPrompt, matchedTemplate };
}

// Call Ollama /api/generate for real inference
async function callOllama(payload: {
  model: string;
  systemPrompt: string;
  userPrompt: string;
  temperature: number;
  maxTokens: number;
  format?: 'json';
}): Promise<{
  response: string;
  promptTokens: number;
  completionTokens: number;
  totalDurationNs: number;
  loadDurationNs: number;
  promptEvalDurationNs: number;
  evalDurationNs: number;
}> {
  const baseURL = process.env.OLLAMA_BASE_URL || 'http://ollama:11434';
  const timeoutMs = Number(process.env.OLLAMA_TIMEOUT_MS) || 240_000;

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  const response = await fetch(`${baseURL}/api/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: payload.model,
      messages: [
        { role: 'system', content: payload.systemPrompt },
        { role: 'user', content: payload.userPrompt },
      ],
      stream: false,
      options: {
        temperature: payload.temperature,
        num_predict: payload.maxTokens,
      },
      ...(payload.format ? { format: payload.format } : {}),
    }),
    signal: controller.signal,
  });

  clearTimeout(timeoutId);

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Ollama request failed [${response.status}]: ${errorText}`);
  }

  const data = (await response.json()) as any;

  return {
    response: data.message?.content || '',
    promptTokens: data.prompt_eval_count || 0,
    completionTokens: data.eval_count || 0,
    totalDurationNs: data.total_duration || 0,
    loadDurationNs: data.load_duration || 0,
    promptEvalDurationNs: data.prompt_eval_duration || 0,
    evalDurationNs: data.eval_duration || 0,
  };
}

// Full APAP AI Gateway execution pipeline
export async function executeGatewayRequest(
  params: GenerateParams,
  apps: AppEntity[],
  templates: PromptTemplate[]
): Promise<GenerateResult> {
  const start = performance.now();
  const reqId = crypto.randomUUID();

  // 1. Authentication Check
  if (!params.apiKey) {
    return {
      success: false,
      requestId: reqId,
      task: params.task,
      modelClass: 'fast',
      model: 'qwen3.5:4b',
      result: '',
      processingMs: Math.round(performance.now() - start),
      tokens: { prompt: 0, completion: 0, total: 0 },
      metrics: { totalDurationNs: 0, loadDurationNs: 0, promptEvalDurationNs: 0, evalDurationNs: 0 },
      error: 'Missing Authorization header. Expected "Authorization: Bearer apapai_live_..."',
      statusCode: 401,
    };
  }

  // Verify API Key format (master or valid key)
  const masterAdminKey = process.env.MASTER_ADMIN_KEY;
  const isMaster = masterAdminKey && params.apiKey === masterAdminKey;
  const isLiveKey = params.apiKey.startsWith('apapai_live_');

  if (!isMaster && !isLiveKey) {
    return {
      success: false,
      requestId: reqId,
      task: params.task,
      modelClass: 'fast',
      model: 'qwen3.5:4b',
      result: '',
      processingMs: Math.round(performance.now() - start),
      tokens: { prompt: 0, completion: 0, total: 0 },
      metrics: { totalDurationNs: 0, loadDurationNs: 0, promptEvalDurationNs: 0, evalDurationNs: 0 },
      error: 'Invalid API key format. Must begin with apapai_live_ or match MASTER_ADMIN_KEY',
      statusCode: 401,
    };
  }

  // Find active application (skip for master admin)
  if (!isMaster) {
    const matchingApp = apps.find((a) => a.active);
    if (!matchingApp) {
      return {
        success: false,
        requestId: reqId,
        task: params.task,
        modelClass: 'fast',
        model: 'qwen3.5:4b',
        result: '',
        processingMs: Math.round(performance.now() - start),
        tokens: { prompt: 0, completion: 0, total: 0 },
        metrics: { totalDurationNs: 0, loadDurationNs: 0, promptEvalDurationNs: 0, evalDurationNs: 0 },
        error: 'Application account is disabled or unauthorized.',
        statusCode: 403,
      };
    }
  }

  // 2. Resolve Template & Model Routing
  const matchedTemplate = templates.find((t) => t.name === params.task);
  const smartTasks = ['run-of-show', 'podcast-summary', 'long-summary', 'document-analysis'];
  const modelClass: ModelClass = params.modelClassOverride
    ? params.modelClassOverride
    : matchedTemplate
    ? matchedTemplate.modelClass
    : smartTasks.includes(params.task)
    ? 'smart'
    : 'fast';

  const { name: modelName } = selectModel(params.task, modelClass);

  // 3. Build Prompt & Call Ollama
  const { systemPrompt, userPrompt } = buildPrompt(params, templates);
  const isJsonTask =
    params.requireStructuredJson ||
    params.task === 'chat-moderation' ||
    (matchedTemplate?.systemPrompt?.toLowerCase().includes('json') ?? false);

  const temperature =
    params.temperature ?? matchedTemplate?.temperature ?? (isJsonTask ? 0.1 : 0.4);
  const maxTokens =
    params.maxTokens ??
    matchedTemplate?.maxTokens ??
    Number(process.env.DEFAULT_MAX_OUTPUT_TOKENS) ??
    2000;

  try {
    const ollamaResult = await callOllama({
      model: modelName,
      systemPrompt,
      userPrompt,
      temperature,
      maxTokens,
      format: isJsonTask ? 'json' : undefined,
    });

    // Parse structured JSON if applicable
    let result: string | Record<string, any> = ollamaResult.response;
    if (isJsonTask) {
      try {
        result = JSON.parse(ollamaResult.response);
      } catch {
        // Leave as raw string if the model didn't return valid JSON
      }
    }

    const totalDurationMs = Math.round(performance.now() - start);

    return {
      success: true,
      requestId: reqId,
      task: params.task,
      modelClass,
      model: modelName,
      result,
      processingMs: totalDurationMs,
      tokens: {
        prompt: ollamaResult.promptTokens,
        completion: ollamaResult.completionTokens,
        total: ollamaResult.promptTokens + ollamaResult.completionTokens,
      },
      metrics: {
        totalDurationNs: ollamaResult.totalDurationNs,
        loadDurationNs: ollamaResult.loadDurationNs,
        promptEvalDurationNs: ollamaResult.promptEvalDurationNs,
        evalDurationNs: ollamaResult.evalDurationNs,
      },
      statusCode: 200,
    };
  } catch (error: any) {
    return {
      success: false,
      requestId: reqId,
      task: params.task,
      modelClass,
      model: modelName,
      result: '',
      processingMs: Math.round(performance.now() - start),
      tokens: { prompt: 0, completion: 0, total: 0 },
      metrics: { totalDurationNs: 0, loadDurationNs: 0, promptEvalDurationNs: 0, evalDurationNs: 0 },
      error: error.message || 'Ollama inference failed',
      statusCode: 500,
    };
  }
}
