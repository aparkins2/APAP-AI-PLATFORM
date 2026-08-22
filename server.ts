import express, { Request, Response } from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import os from 'os';
import nodeCrypto from 'node:crypto';
import { executeGatewayRequest } from './src/services/aiEngine.ts';
import { INITIAL_APPS, INITIAL_TEMPLATES, INITIAL_USERS } from './src/data/initialData.ts';
import type { RequestLog, ServerHealth, AppEntity, User, UserRole } from './src/types/index.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;
const OLLAMA_BASE_URL = process.env.OLLAMA_BASE_URL || 'http://ollama:11434';
const MASTER_ADMIN_KEY = process.env.MASTER_ADMIN_KEY;

app.use(express.json({ limit: '10mb' }));

// RBAC helpers
function sha256Sync(text: string): string {
  return nodeCrypto.createHash('sha256').update(text).digest('hex');
}

function resolveIdentity(apiKey: string): { id: string; name: string; role: UserRole } | null {
  if (MASTER_ADMIN_KEY && apiKey === MASTER_ADMIN_KEY) {
    return { id: 'master-admin', name: 'Master Admin', role: 'administrator' };
  }
  const keyHash = sha256Sync(apiKey);
  const user = INITIAL_USERS.find((u) => u.apiKeyHash === keyHash);
  if (user) {
    return { id: user.id, name: user.name, role: user.role };
  }
  return null;
}

function requireRole(...allowedRoles: UserRole[]) {
  return (req: Request, res: Response, next: () => void) => {
    const authHeader = req.headers.authorization || '';
    if (!authHeader.startsWith('Bearer ')) {
      res.status(401).json({ error: 'Missing or invalid Authorization header' });
      return;
    }
    const apiKey = authHeader.replace('Bearer ', '').trim();
    const identity = resolveIdentity(apiKey);
    if (!identity || !allowedRoles.includes(identity.role)) {
      res.status(403).json({ error: 'Forbidden: insufficient role' });
      return;
    }
    next();
  };
}

function requireAuth(req: Request, res: Response, next: () => void) {
  const authHeader = req.headers.authorization || '';
  if (!authHeader.startsWith('Bearer ')) {
    res.status(401).json({ error: 'Missing or invalid Authorization header' });
    return;
  }
  const apiKey = authHeader.replace('Bearer ', '').trim();
  if (!resolveIdentity(apiKey)) {
    res.status(401).json({ error: 'Invalid API key' });
    return;
  }
  next();
}

// In-memory request log (lost on container restart)
let requestLogs: RequestLog[] = [];

// Helper to build a ServerHealth snapshot
async function buildHealth(): Promise<ServerHealth> {
  let ollamaOnline = false;
  const totalMem = os.totalmem() / 1024 / 1024 / 1024;
  const freeMem = os.freemem() / 1024 / 1024 / 1024;

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000);
    const response = await fetch(`${OLLAMA_BASE_URL}/api/tags`, {
      signal: controller.signal,
    });
    clearTimeout(timeoutId);
    ollamaOnline = response.ok;
  } catch {
    ollamaOnline = false;
  }

  const status = ollamaOnline ? 'ok' : 'degraded';

  return {
    status,
    service: 'apap-ai-gateway',
    ollama: ollamaOnline,
    database: true,
    redis: true,
    fastModel: process.env.AI_FAST_MODEL || 'qwen3.5:4b',
    smartModel: process.env.AI_SMART_MODEL || 'qwen3.5:4b',
    uptimeSeconds: Math.floor(process.uptime()),
    cpuUsagePct: 0,
    ramUsageGb: {
      used: Math.round((totalMem - freeMem) * 10) / 10,
      total: Math.round(totalMem * 10) / 10,
    },
    gpuDetected: false,
    activeRequests: 0,
    tokensPerSec: 0,
    avgLatencyMs: 0,
  };
}

// Health Check endpoint for Coolify / Docker / Traefik
app.get('/health', async (_req: Request, res: Response) => {
  const health = await buildHealth();
  res.status(health.status === 'ok' ? 200 : 503).json(health);
});

// List available Ollama models
app.get('/v1/models', requireAuth, async (_req: Request, res: Response) => {
  try {
    const response = await fetch(`${OLLAMA_BASE_URL}/api/tags`);
    if (!response.ok) throw new Error(`Ollama status ${response.status}`);
    const data = (await response.json()) as { models?: { name: string }[] };
    res.json({ models: (data.models || []).map((m) => m.name) });
  } catch (error: any) {
    res.status(503).json({ error: error.message });
  }
});

// List prompt templates
app.get('/v1/templates', requireAuth, (_req: Request, res: Response) => {
  res.json(INITIAL_TEMPLATES);
});

// List apps without exposing real API key hashes
app.get(
  '/v1/apps',
  requireRole('administrator', 'engineer'),
  (_req: Request, res: Response) => {
    const safeApps: AppEntity[] = INITIAL_APPS.map((app) => ({ ...app, apiKeyHash: 'hidden' }));
    res.json(safeApps);
  }
);

// Recent request logs
app.get(
  '/v1/logs',
  requireRole('administrator', 'engineer', 'community-moderator'),
  (_req: Request, res: Response) => {
    res.json(requestLogs.slice(0, 100));
  }
);

// Identify the role for a dashboard API key
app.post('/v1/auth/whoami', (req: Request, res: Response) => {
  const authHeader = req.headers.authorization || '';
  if (!authHeader.startsWith('Bearer ')) {
    res.status(401).json({ error: 'Missing or invalid Authorization header' });
    return;
  }
  const apiKey = authHeader.replace('Bearer ', '').trim();
  const identity = resolveIdentity(apiKey);
  if (!identity) {
    res.status(401).json({ error: 'Invalid API key' });
    return;
  }
  res.json({ id: identity.id, name: identity.name, role: identity.role });
});

// Generate endpoint - forwards to Ollama via the APAP AI Engine
app.post('/v1/generate', async (req: Request, res: Response) => {
  const authHeader = req.headers.authorization || '';
  if (!authHeader.startsWith('Bearer ')) {
    res.status(401).json({
      success: false,
      error: 'Missing or invalid Authorization header. Expected: Bearer apapai_live_...',
    });
    return;
  }

  const apiKey = authHeader.replace('Bearer ', '').trim();
  const {
    task,
    input,
    rawPrompt,
    temperature,
    maxTokens,
    modelClassOverride,
    requireStructuredJson,
  } = req.body;

  if (!task || typeof input !== 'object' || input === null) {
    res.status(400).json({
      success: false,
      error: 'task and input are required',
    });
    return;
  }

  const result = await executeGatewayRequest(
    {
      task,
      input,
      rawPrompt,
      temperature,
      maxTokens,
      apiKey,
      modelClassOverride,
      requireStructuredJson,
    },
    INITIAL_APPS,
    INITIAL_TEMPLATES,
    INITIAL_USERS
  );

  // Log the request for the dashboard
  const log: RequestLog = {
    id: crypto.randomUUID(),
    appId: result.appId || 'unknown',
    appName: result.appName || 'Unknown',
    requestId: result.requestId,
    endpoint: '/v1/generate',
    task: result.task,
    model: result.model,
    modelClass: result.modelClass,
    status: result.statusCode as RequestLog['status'],
    promptTokens: result.tokens.prompt,
    completionTokens: result.tokens.completion,
    totalTokens: result.tokens.total,
    totalDurationMs: result.processingMs,
    loadDurationMs: Math.round((result.metrics.loadDurationNs || 0) / 1_000_000),
    promptEvalDurationMs: Math.round((result.metrics.promptEvalDurationNs || 0) / 1_000_000),
    evalDurationMs: Math.round((result.metrics.evalDurationNs || 0) / 1_000_000),
    createdAt: new Date().toISOString(),
    inputPayloadSummary: JSON.stringify(req.body.input || {}).slice(0, 120),
    outputSummary:
      typeof result.result === 'string'
        ? result.result.slice(0, 120)
        : JSON.stringify(result.result || '').slice(0, 120),
    errorMessage: result.error,
  };

  requestLogs.unshift(log);
  if (requestLogs.length > 500) requestLogs = requestLogs.slice(0, 500);

  res.status(result.statusCode).json(result);
});

// Serve compiled static UI assets from dist/
const distPath = path.join(__dirname, 'dist');
if (fs.existsSync(distPath)) {
  app.use(express.static(distPath));

  // SPA fallback for React router
  app.get('*', (_req: Request, res: Response) => {
    res.sendFile(path.join(distPath, 'index.html'));
  });
} else {
  // If dist doesn't exist yet (e.g. running in development mode before build)
  app.get('/', (_req: Request, res: Response) => {
    res.send(`
      <!DOCTYPE html>
      <html>
        <head><title>APAP AI Server</title></head>
        <body style="font-family: sans-serif; background: #0b0f19; color: #fff; padding: 40px; text-align: center;">
          <h1 style="color: #10b981;">APAP AI Gateway & Management Server</h1>
          <p>The server is running in production mode. Run <code>npm run build</code> to generate the client UI.</p>
          <p><a href="/health" style="color: #38bdf8;">Check Health Endpoint (/health)</a></p>
        </body>
      </html>
    `);
  });
}

app.listen(PORT, () => {
  console.log(`[APAP AI] Server operational on port ${PORT}`);
  console.log(`[APAP AI] Ollama backend target: ${OLLAMA_BASE_URL}`);
  console.log(`[APAP AI] Health check active at http://localhost:${PORT}/health`);
});
