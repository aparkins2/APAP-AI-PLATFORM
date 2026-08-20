export interface ServerSnippet {
  id: string;
  name: string;
  category: 'Docker & Compose' | 'Gateway Code' | 'Database SQL' | 'Reverse Proxy' | 'Scripts & Ops';
  filename: string;
  language: 'yaml' | 'javascript' | 'sql' | 'nginx' | 'bash' | 'env';
  description: string;
  content: string;
}

export const SERVER_SNIPPETS: ServerSnippet[] = [
  {
    id: 'docker-compose',
    name: 'Docker Compose Production Stack',
    category: 'Docker & Compose',
    filename: '/opt/apap-ai/docker-compose.yml',
    language: 'yaml',
    description: 'Complete multi-container composition for Ollama, Fastify Gateway, and Open WebUI with isolated network.',
    content: `version: '3.8'

services:
  # Internal Ollama Inference Engine (Port 11434 is NOT exposed to public)
  ollama:
    image: ollama/ollama:latest
    container_name: apap-ollama
    restart: unless-stopped
    volumes:
      - ollama_data:/root/.ollama
    expose:
      - "11434"
    networks:
      - apap-ai-network
    # Optional resource limits for CPU VPS
    deploy:
      resources:
        limits:
          memory: 12G

  # APAP AI Gateway (Fastify Node 22 API proxy)
  gateway:
    build:
      context: ./gateway
    container_name: apap-ai-gateway
    restart: unless-stopped
    env_file:
      - .env
    depends_on:
      - ollama
    ports:
      - "127.0.0.1:3100:3000"
    networks:
      - apap-ai-network

  # Open WebUI (Internal Admin Chat & Experimentation)
  open-webui:
    image: ghcr.io/open-webui/open-webui:main
    container_name: apap-open-webui
    restart: unless-stopped
    environment:
      OLLAMA_BASE_URL: http://ollama:11434
      WEBUI_SECRET_KEY: \${WEBUI_SECRET_KEY}
    volumes:
      - open_webui_data:/app/backend/data
    depends_on:
      - ollama
    ports:
      - "127.0.0.1:3101:8080"
    networks:
      - apap-ai-network

networks:
  apap-ai-network:
    driver: bridge

volumes:
  ollama_data:
  open_webui_data:`,
  },
  {
    id: 'env-file',
    name: 'Production Environment Config (.env)',
    category: 'Docker & Compose',
    filename: '/opt/apap-ai/.env.example',
    language: 'env',
    description: 'Environment variables for model aliases, PostgreSQL database, Redis connection, and rate limits.',
    content: `NODE_ENV=production
PORT=3000

# Ollama Internal Docker DNS
OLLAMA_BASE_URL=http://ollama:11434

# Model Routing Class Definitions
AI_FAST_MODEL=qwen3.5:4b
AI_SMART_MODEL=qwen3.5:4b

# Persistent Shared PostgreSQL Schema
DATABASE_URL=postgresql://apap_admin:CHANGE_ME_PASSWORD@postgres:5432/apap_platform?schema=apap_ai

# Shared Redis instance for Rate Limiting & Queue
REDIS_URL=redis://redis:6379

# Cryptographic Keys (generate with: openssl rand -hex 32)
WEBUI_SECRET_KEY=generate_with_openssl_rand_hex_32
MASTER_ADMIN_KEY=generate_with_openssl_rand_hex_32

# Safety & Token Limits
MAX_PROMPT_LENGTH=20000
DEFAULT_MAX_OUTPUT_TOKENS=2000
DEFAULT_RATE_LIMIT=60
HTTP_TIMEOUT_SECONDS=120`,
  },
  {
    id: 'gateway-server',
    name: 'Fastify Gateway Server Entrypoint',
    category: 'Gateway Code',
    filename: 'gateway/src/server.js',
    language: 'javascript',
    description: 'Core Fastify server setup with CORS, Helmet, rate limiting, and route registration.',
    content: `import Fastify from 'fastify';
import cors from '@fastify/cors';
import helmet from '@fastify/helmet';
import dotenv from 'dotenv';
import { generateRoutes } from './routes/generate.js';
import { chatRoutes } from './routes/chat.js';
import { healthRoutes } from './routes/health.js';
import { modelsRoutes } from './routes/models.js';
import { templatesRoutes } from './routes/templates.js';
import { errorHandler } from './middleware/errorHandler.js';

dotenv.config();

const app = Fastify({
  logger: {
    level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
    redact: ['req.headers.authorization', 'req.body.apiKey']
  }
});

// Security & Headers
await app.register(helmet);
await app.register(cors, {
  origin: process.env.ALLOWED_ORIGINS ? process.env.ALLOWED_ORIGINS.split(',') : true,
  methods: ['GET', 'POST', 'OPTIONS']
});

// Global Error Handler
app.setErrorHandler(errorHandler);

// Core Endpoints
await app.register(healthRoutes);
await app.register(generateRoutes, { prefix: '/v1' });
await app.register(chatRoutes, { prefix: '/v1' });
await app.register(modelsRoutes, { prefix: '/v1' });
await app.register(templatesRoutes, { prefix: '/v1' });

const start = async () => {
  try {
    const port = Number(process.env.PORT || 3000);
    await app.listen({ port, host: '0.0.0.0' });
    app.log.info(\`APAP AI Gateway operational on port \${port}\`);
  } catch (err) {
    app.log.error(err);
    process.exit(1);
  }
};

start();`,
  },
  {
    id: 'ollama-service',
    name: 'Ollama Client Service',
    category: 'Gateway Code',
    filename: 'gateway/src/services/ollama.js',
    language: 'javascript',
    description: 'Direct communication service with Ollama /api/generate and /api/chat endpoints.',
    content: `export async function generateWithOllama({
  model,
  systemPrompt,
  prompt,
  temperature = 0.3,
  stream = false,
  format = undefined,
  maxTokens = 2000
}) {
  const baseURL = process.env.OLLAMA_BASE_URL || 'http://ollama:11434';
  
  const payload = {
    model,
    system: systemPrompt,
    prompt,
    stream,
    options: {
      temperature,
      num_predict: maxTokens
    }
  };

  if (format === 'json') {
    payload.format = 'json';
  }

  const response = await fetch(\`\${baseURL}/api/generate\`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(payload)
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(\`Ollama request failed [\${response.status}]: \${errorText}\`);
  }

  return response.json();
}`,
  },
  {
    id: 'model-router',
    name: 'Dynamic Model Router',
    category: 'Gateway Code',
    filename: 'gateway/src/services/modelRouter.js',
    language: 'javascript',
    description: 'Routes tasks dynamically between Fast (4B) and Smart (9B/14B) models with zero client changes.',
    content: `export function selectModel(task, modelClassOverride) {
  if (modelClassOverride) {
    return modelClassOverride === 'smart' 
      ? (process.env.AI_SMART_MODEL || 'qwen3.5:4b')
      : (process.env.AI_FAST_MODEL || 'qwen3.5:4b');
  }

  const smartTasks = [
    'run-of-show',
    'podcast-summary',
    'long-summary',
    'document-analysis',
    'article-draft',
    'sentiment-deep-dive'
  ];

  if (smartTasks.includes(task)) {
    return process.env.AI_SMART_MODEL || 'qwen3.5:4b';
  }

  return process.env.AI_FAST_MODEL || 'qwen3.5:4b';
}`,
  },
  {
    id: 'auth-middleware',
    name: 'API Key Authentication Middleware',
    category: 'Gateway Code',
    filename: 'gateway/src/middleware/authenticate.js',
    language: 'javascript',
    description: 'Extracts Bearer token, computes SHA-256 hash, and verifies against apap_ai.apps table.',
    content: `import crypto from 'crypto';
import { pool } from '../db/postgres.js';

export async function authenticateApp(request, reply) {
  const authHeader = request.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return reply.status(401).send({
      success: false,
      error: 'Missing or invalid Authorization header. Expected: Bearer apapai_live_...'
    });
  }

  const token = authHeader.replace('Bearer ', '').trim();
  const tokenHash = crypto.createHash('sha256').update(token).digest('hex');

  // Check Master Admin Key first
  if (process.env.MASTER_ADMIN_KEY && token === process.env.MASTER_ADMIN_KEY) {
    request.appContext = {
      id: 'master-admin',
      name: 'Master Admin',
      slug: 'admin',
      rateLimit: 300
    };
    return;
  }

  const result = await pool.query(
    'SELECT id, name, slug, active, rate_limit_per_minute FROM apap_ai.apps WHERE api_key_hash = $1',
    [tokenHash]
  );

  if (result.rows.length === 0) {
    return reply.status(401).send({
      success: false,
      error: 'Unauthorized: Invalid API Key.'
    });
  }

  const appRecord = result.rows[0];

  if (!appRecord.active) {
    return reply.status(403).send({
      success: false,
      error: 'Forbidden: Application account is deactivated.'
    });
  }

  request.appContext = {
    id: appRecord.id,
    name: appRecord.name,
    slug: appRecord.slug,
    rateLimit: appRecord.rate_limit_per_minute
  };
}`,
  },
  {
    id: 'db-migration',
    name: 'PostgreSQL Schema Migration (001_apap_ai.sql)',
    category: 'Database SQL',
    filename: 'migrations/001_apap_ai.sql',
    language: 'sql',
    description: 'PostgreSQL DDL for apap_ai schema, apps table, templates table, and requests logging.',
    content: `-- APAP AI Server Schema Definition
CREATE SCHEMA IF NOT EXISTS apap_ai;

-- 1. Registered APAP Applications
CREATE TABLE IF NOT EXISTS apap_ai.apps (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL UNIQUE,
    slug VARCHAR(100) NOT NULL UNIQUE,
    api_key_hash TEXT NOT NULL,
    active BOOLEAN NOT NULL DEFAULT TRUE,
    rate_limit_per_minute INTEGER NOT NULL DEFAULT 60,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. Prompt Templates Registry
CREATE TABLE IF NOT EXISTS apap_ai.templates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    system_prompt TEXT NOT NULL,
    user_prompt_template TEXT,
    model_class VARCHAR(20) NOT NULL DEFAULT 'fast',
    temperature NUMERIC(3,2) DEFAULT 0.30,
    max_tokens INTEGER DEFAULT 1000,
    active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. High-Performance Request Logs
CREATE TABLE IF NOT EXISTS apap_ai.requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    app_id UUID REFERENCES apap_ai.apps(id) ON DELETE SET NULL,
    request_id UUID NOT NULL DEFAULT gen_random_uuid(),
    endpoint VARCHAR(100),
    task VARCHAR(100),
    model VARCHAR(100),
    status INTEGER,
    prompt_tokens INTEGER,
    completion_tokens INTEGER,
    total_duration_ns BIGINT,
    load_duration_ns BIGINT,
    prompt_eval_duration_ns BIGINT,
    eval_duration_ns BIGINT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for lightning fast analytics
CREATE INDEX IF NOT EXISTS idx_apap_ai_requests_app_id ON apap_ai.requests(app_id);
CREATE INDEX IF NOT EXISTS idx_apap_ai_requests_created_at ON apap_ai.requests(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_apap_ai_requests_task ON apap_ai.requests(task);`,
  },
  {
    id: 'nginx-reverse-proxy',
    name: 'Nginx Virtual Host Configuration',
    category: 'Reverse Proxy',
    filename: '/etc/nginx/sites-available/apap-ai.conf',
    language: 'nginx',
    description: 'Reverse proxy configuration for ai.apapmedia.com and ai-admin.apapmedia.com with security headers.',
    content: `# APAP AI Gateway Public Endpoint
server {
    server_name ai.apapmedia.com;
    listen 80;
    return 301 https://$host$request_uri;
}

server {
    server_name ai.apapmedia.com;
    listen 443 ssl http2;

    ssl_certificate /etc/letsencrypt/live/ai.apapmedia.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/ai.apapmedia.com/privkey.pem;

    client_max_body_size 512k;
    client_body_timeout 30s;

    # Security Headers
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-Frame-Options "DENY" always;
    add_header X-XSS-Protection "1; mode=block" always;

    location / {
        proxy_pass http://127.0.0.1:3100;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_read_timeout 120s;
    }
}

# APAP Internal Open WebUI (Admin Chat)
server {
    server_name ai-admin.apapmedia.com;
    listen 443 ssl http2;

    ssl_certificate /etc/letsencrypt/live/ai-admin.apapmedia.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/ai-admin.apapmedia.com/privkey.pem;

    location / {
        proxy_pass http://127.0.0.1:3101;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_read_timeout 300s;
    }
}`,
  },
  {
    id: 'coolify-compose',
    name: 'Coolify Docker Compose Stack',
    category: 'Docker & Compose',
    filename: 'docker-compose.coolify.yml',
    language: 'yaml',
    description: 'Optimized Docker Compose specification with Coolify Traefik reverse proxy labels and persistent volumes.',
    content: `version: '3.8'

services:
  # Internal Ollama Inference Engine (Isolated from public internet)
  ollama:
    image: ollama/ollama:latest
    container_name: apap-ollama
    restart: unless-stopped
    volumes:
      - ollama_data:/root/.ollama
    expose:
      - "11434"
    networks:
      - apap-ai-network
    deploy:
      resources:
        reservations:
          memory: 4G
        limits:
          memory: 12G

  # APAP AI Dashboard & Gateway Proxy (ai.apapmedia.com)
  app:
    build:
      context: .
      dockerfile: Dockerfile
    container_name: apap-ai-app
    restart: unless-stopped
    environment:
      - NODE_ENV=production
      - PORT=3000
      - OLLAMA_BASE_URL=http://ollama:11434
      - AI_FAST_MODEL=qwen3.5:4b
      - AI_SMART_MODEL=qwen3.5:9b
      - WEBUI_SECRET_KEY=\${WEBUI_SECRET_KEY}
      - MASTER_ADMIN_KEY=\${MASTER_ADMIN_KEY}
    depends_on:
      - ollama
    expose:
      - "3000"
    networks:
      - apap-ai-network
    labels:
      - "coolify.managed=true"
      - "coolify.domain=https://ai.apapmedia.com"

  # Open WebUI Admin Portal (ai-admin.apapmedia.com)
  open-webui:
    image: ghcr.io/open-webui/open-webui:main
    container_name: apap-open-webui
    restart: unless-stopped
    environment:
      - OLLAMA_BASE_URL=http://ollama:11434
      - WEBUI_SECRET_KEY=\${WEBUI_SECRET_KEY}
      - WEBUI_AUTH=true
      - ENABLE_SIGNUP=false
    volumes:
      - open_webui_data:/app/backend/data
    depends_on:
      - ollama
    expose:
      - "8080"
    networks:
      - apap-ai-network
    labels:
      - "coolify.managed=true"
      - "coolify.domain=https://ai-admin.apapmedia.com"

  # Redis for Per-App Token Rate Limiting
  redis:
    image: redis:7-alpine
    container_name: apap-redis
    restart: unless-stopped
    volumes:
      - redis_data:/data
    expose:
      - "6379"
    networks:
      - apap-ai-network

networks:
  apap-ai-network:
    name: apap-ai-network
    driver: bridge

volumes:
  ollama_data:
  open_webui_data:
  redis_data:`,
  },
  {
    id: 'dockerfile',
    name: 'Multi-Stage Production Dockerfile',
    category: 'Docker & Compose',
    filename: 'Dockerfile',
    language: 'yaml',
    description: 'Multi-stage Dockerfile compiling React Vite frontend and packaging Express backend with healthcheck.',
    content: `# --- Stage 1: Build Frontend Assets ---
FROM node:20-alpine AS builder

WORKDIR /app

COPY package.json package-lock.json* bun.lock* ./
RUN npm install --frozen-lockfile || npm install

COPY . .
RUN npm run build

# --- Stage 2: Production Server Runner ---
FROM node:20-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3000

COPY package.json package-lock.json* bun.lock* ./
RUN npm install --omit=dev --ignore-scripts || npm install --omit=dev
RUN npm install -g tsx

COPY --from=builder /app/dist ./dist
COPY --from=builder /app/server.ts ./server.ts
COPY --from=builder /app/package.json ./package.json

EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \\
  CMD wget --no-verbose --tries=1 --spider http://127.0.0.1:3000/health || exit 1

CMD ["tsx", "server.ts"]`,
  },
  {
    id: 'interserver-script',
    name: 'InterServer VPS Provisioning Script',
    category: 'Scripts & Ops',
    filename: 'scripts/setup-interserver.sh',
    language: 'bash',
    description: 'One-command VPS setup: 8GB Swap, kernel sysctl tuning, UFW firewall, and Coolify installation.',
    content: `#!/usr/bin/env bash
set -e

echo "=== APAP AI InterServer VPS Setup & Hardening ==="

# 1. Update system
apt-get update && apt-get upgrade -y
apt-get install -y curl wget git htop ufw software-properties-common jq net-tools ca-certificates

# 2. Configure 8GB Swap
if ! grep -q '/swapfile' /etc/fstab; then
  fallocate -l 8G /swapfile || dd if=/dev/zero of=/swapfile bs=1M count=8192
  chmod 600 /swapfile
  mkswap /swapfile
  swapon /swapfile
  echo '/swapfile none swap sw 0 0' >> /etc/fstab
fi

# Kernel memory tuning for LLMs
sysctl vm.swappiness=15
sysctl vm.vfs_cache_pressure=50
echo 'vm.swappiness=15' >> /etc/sysctl.conf
echo 'vm.vfs_cache_pressure=50' >> /etc/sysctl.conf

# 3. UFW Firewall
ufw default deny incoming
ufw default allow outgoing
ufw allow 22/tcp comment 'SSH'
ufw allow 80/tcp comment 'HTTP'
ufw allow 443/tcp comment 'HTTPS'
ufw allow 8000/tcp comment 'Coolify Dashboard'
ufw --force enable

# 4. Install Coolify
if ! command -v coolify &> /dev/null; then
  curl -fsSL https://cdn.coollabs.io/coolify/install.sh | bash
fi

echo "Setup complete! Access Coolify at http://$(curl -s ifconfig.me):8000"`,
  },
  {
    id: 'pull-models-script',
    name: 'Ollama Model Pull & Pre-Warm Script',
    category: 'Scripts & Ops',
    filename: 'scripts/pull-models.sh',
    language: 'bash',
    description: 'Pulls qwen3.5:4b, gemma3:4b, and qwen3.5:9b models into isolated Docker container volume.',
    content: `#!/usr/bin/env bash
CONTAINER_NAME="apap-ollama"

echo "Pulling Fast Model: qwen3.5:4b (~2.6 GB)..."
docker exec -it "\${CONTAINER_NAME}" ollama pull qwen3.5:4b

echo "Pulling Alternative Model: gemma3:4b (~3.3 GB)..."
docker exec -it "\${CONTAINER_NAME}" ollama pull gemma3:4b

echo "Pulling Smart Model: qwen3.5:9b (~5.8 GB)..."
docker exec -it "\${CONTAINER_NAME}" ollama pull qwen3.5:9b

echo "Installed models in Ollama:"
docker exec -it "\${CONTAINER_NAME}" ollama list`,
  },
  {
    id: 'health-script',
    name: 'Automated Health & Uptime Check Script',
    category: 'Scripts & Ops',
    filename: '/opt/apap-ai/scripts/health-check.sh',
    language: 'bash',
    description: 'Bash script for cron monitoring and automated alerting.',
    content: `#!/usr/bin/env bash
set -eo pipefail

HEALTH_URL="http://127.0.0.1:3100/health"
RESPONSE=$(curl -s -m 5 "$HEALTH_URL" || echo '{"status":"down"}')
STATUS=$(echo "$RESPONSE" | grep -o '"status":"ok"' || true)

if [ -z "$STATUS" ]; then
  echo "[$(date -u)] ALERT: APAP AI Gateway /health is FAILING! Response: $RESPONSE" >&2
  # Optional: curl -X POST -d "APAP AI Gateway is DOWN" https://hooks.slack.com/...
  exit 1
else
  echo "[$(date -u)] SUCCESS: APAP AI Gateway is healthy."
  exit 0
fi`,
  },
];
