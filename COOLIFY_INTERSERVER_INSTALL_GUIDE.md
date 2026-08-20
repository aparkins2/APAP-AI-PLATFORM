# APAP AI Server & Gateway — InterServer VPS + Coolify Deployment Guide

**Target Domains**: `ai.apapmedia.com` (API Gateway & Dashboard) & `ai-admin.apapmedia.com` (Open WebUI)  
**Infrastructure Target**: InterServer VPS (Ubuntu 22.04 / 24.04 LTS x86_64 or ARM64)  
**Deployment Platform**: [Coolify](https://coolify.io) (Self-Hosted PaaS) + Docker Engine  
**Inference Engine**: Ollama (`qwen3.5:4b`, `gemma3:4b`, `qwen3.5:9b`) on private Docker network  
**Security Architecture**: Zero exposed Ollama ports; SHA-256 Bearer Token verification; SSL via Let's Encrypt / Traefik.

---

## Architecture Overview

```
                          Internet (HTTPS / 443)
                                    │
                                    ▼
                     ┌──────────────────────────────┐
                     │     Coolify Reverse Proxy    │
                     │    (Traefik / Let's Encrypt) │
                     └───────┬──────────────┬───────┘
                             │              │
       https://ai.apapmedia.com             │ https://ai-admin.apapmedia.com
                             │              │
                             ▼              ▼
     ┌────────────────────────────────────────────────────────┐
     │  InterServer VPS (Docker Network: apap-ai-network)     │
     │                                                        │
     │  ┌──────────────────────┐    ┌──────────────────────┐  │
     │  │  APAP AI Gateway     │    │  Open WebUI          │  │
     │  │  & Dashboard         │    │  (Internal Admin)    │  │
     │  │  (Port 3000)         │    │  (Port 8080)         │  │
     │  └──────────┬───────────┘    └──────────┬───────────┘  │
     │             │                           │              │
     │             │   Private Docker DNS      │              │
     │             │   (http://ollama:11434)   │              │
     │             ▼                           ▼              │
     │  ┌──────────────────────────────────────────────────┐  │
     │  │  Ollama Inference Engine (Isolated Container)    │  │
     │  │  • Port 11434 NOT exposed publicly               │  │
     │  │  • Persistent Volume: ollama_data                │  │
     │  │  • Models: qwen3.5:4b, gemma3:4b, qwen3.5:9b     │  │
     │  └──────────────────────────────────────────────────┘  │
     │                                                        │
     │  ┌──────────────────────┐    ┌──────────────────────┐  │
     │  │  Redis 7             │    │  PostgreSQL 16       │  │
     │  │  Rate Limits & Queue │    │  Keys & Telemetry    │  │
     │  └──────────────────────┘    └──────────────────────┘  │
     └────────────────────────────────────────────────────────┘
```

---

## Hardware Sizing Recommendations (InterServer VPS)

| Workload Class | Minimum Spec | Recommended InterServer Plan | Models Supported |
| :--- | :--- | :--- | :--- |
| **Production Baseline (Standard)** | 4 vCPU / 8 GB RAM / 100 GB SSD | 4 Cores, 8GB RAM VPS (~$24/mo) | `qwen3.5:4b` (~35-45 tok/sec on CPU) |
| **High Concurrency & Smart Models** | 8 vCPU / 16 GB RAM / 150 GB NVMe | 8 Cores, 16GB RAM VPS (~$48/mo) | `qwen3.5:4b` + `qwen3.5:9b` / `gemma3:4b` |
| **Enterprise / Multi-App Peak** | 12+ vCPU / 24+ GB RAM / 200 GB NVMe | Custom VPS or Dedicated Server | Concurrent batch generation + pgvector embeddings |

> 💡 **Tip for CPU VPS Performance**: Ollama runs exceptionally fast with 4B quantized models on modern AMD EPYC / Intel Xeon processors with AVX-512 extensions available on InterServer.

---

## Phase 1: InterServer VPS Provisioning & Initial Hardening

### Step 1.1: Order VPS & Connect via SSH
1. Log into your **InterServer Client Portal** (`https://my.interserver.net`).
2. Deploy an **Ubuntu 22.04 LTS** or **Ubuntu 24.04 LTS** 64-bit instance.
3. Open your local terminal and connect as `root`:
   ```bash
   ssh root@<YOUR_INTERSERVER_VPS_IP>
   ```

### Step 1.2: System Update & Essential Packages
```bash
apt update && apt upgrade -y
apt install -y curl wget git htop ufw software-properties-common jq net-tools ca-certificates gnupg lsb-release
```

### Step 1.3: Configure 8GB SWAP Space (Crucial for AI Model Stability)
A swapfile prevents out-of-memory (OOM) killer terminations during high-concurrency LLM inference:
```bash
# Check existing swap
swapon --show

# Create 8GB swapfile if none exists
fallocate -l 8G /swapfile
chmod 600 /swapfile
mkswap /swapfile
swapon /swapfile

# Make swap permanent across reboots
echo '/swapfile none swap sw 0 0' >> /etc/fstab

# Optimize swappiness for LLM workloads
sysctl vm.swappiness=15
sysctl vm.vfs_cache_pressure=50
echo 'vm.swappiness=15' >> /etc/sysctl.conf
echo 'vm.vfs_cache_pressure=50' >> /etc/sysctl.conf
```

### Step 1.4: Configure Firewall (UFW)
Only open SSH (22), HTTP (80), HTTPS (443), and Coolify management port (8000). **Never open 11434 (Ollama) or 5432 (Postgres)** to the world.
```bash
ufw default deny incoming
ufw default allow outgoing
ufw allow 22/tcp comment 'SSH'
ufw allow 80/tcp comment 'HTTP'
ufw allow 443/tcp comment 'HTTPS'
ufw allow 8000/tcp comment 'Coolify Dashboard'
ufw --force enable
ufw status verbose
```

---

## Phase 2: Install Docker & Coolify on InterServer

### Step 2.1: Run the Official Coolify 1-Line Installer
Run the automated installation script:
```bash
curl -fsSL https://cdn.coollabs.io/coolify/install.sh | bash
```

The script will automatically:
- Install official Docker Engine and Docker Compose Plugin.
- Deploy the Coolify management container, Traefik reverse proxy, and local PostgreSQL instance.
- Initialize the systemd auto-restart service.

### Step 2.2: Complete Initial Coolify Web Setup
1. Once installation completes, open your browser and navigate to:
   ```
   http://<YOUR_INTERSERVER_VPS_IP>:8000
   ```
2. Create your **Root Admin Account** (Email & secure password).
3. Follow the onboarding wizard to select **Localhost (Docker)** as the default server target.

---

## Phase 3: DNS Records Setup

Log in to your DNS management provider (e.g., Cloudflare, Namecheap, GoDaddy, or InterServer DNS) and create the following **A Records**:

| Host / Subdomain | Type | Target Value | Proxy Status | Description |
| :--- | :--- | :--- | :--- | :--- |
| `ai.apapmedia.com` | `A` | `<YOUR_INTERSERVER_VPS_IP>` | DNS Only (or Proxied) | Gateway & Management UI |
| `ai-admin.apapmedia.com` | `A` | `<YOUR_INTERSERVER_VPS_IP>` | DNS Only (or Proxied) | Open WebUI Admin Console |
| `coolify.apapmedia.com` | `A` | `<YOUR_INTERSERVER_VPS_IP>` | DNS Only *(Optional)* | Custom Coolify Admin Domain |

---

## Phase 4: Deploying APAP AI Stack in Coolify

### Option A: Deploy via Coolify "Docker Compose" (Recommended)

1. Inside your Coolify Dashboard (`http://<YOUR_VPS_IP>:8000`), click **Projects** -> **+ Add Project** (Name: `APAP Media Platform`).
2. Click **+ Add Environment** (Name: `production`).
3. Click **+ New Resource** -> select **Docker Compose**.
4. Paste the following production-ready Compose specification into the editor:

```yaml
version: '3.8'

services:
  # Internal Ollama Inference Engine
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

  # APAP AI Gateway & Unified Dashboard
  gateway:
    build:
      context: .
      dockerfile: Dockerfile
    container_name: apap-ai-gateway
    restart: unless-stopped
    environment:
      - NODE_ENV=production
      - PORT=3000
      - OLLAMA_BASE_URL=http://ollama:11434
      - AI_FAST_MODEL=qwen3.5:4b
      - AI_SMART_MODEL=qwen3.5:9b
      - WEBUI_SECRET_KEY=${WEBUI_SECRET_KEY}
      - MASTER_ADMIN_KEY=${MASTER_ADMIN_KEY}
    volumes:
      - gateway_data:/app/data
    depends_on:
      - ollama
    expose:
      - "3000"
    networks:
      - apap-ai-network
    labels:
      - "coolify.managed=true"
      - "coolify.domain=https://ai.apapmedia.com"

  # Open WebUI (Internal Admin Playground)
  open-webui:
    image: ghcr.io/open-webui/open-webui:main
    container_name: apap-open-webui
    restart: unless-stopped
    environment:
      - OLLAMA_BASE_URL=http://ollama:11434
      - WEBUI_SECRET_KEY=${WEBUI_SECRET_KEY}
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

  # Redis for Distributed Rate Limiting
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
  gateway_data:
  open_webui_data:
  redis_data:
```

### Option B: Deploy Direct from GitHub Repository
1. In Coolify, select **+ New Resource** -> **Git Repository (Public/Private)**.
2. Enter your repository URL (e.g. `https://github.com/APAP-Media/apap-ai-server`).
3. Set Build Pack to **Dockerfile** (or **Nixpacks**).
4. Set Domain to `https://ai.apapmedia.com`.
5. Add the Environment Variables under the **Environment Variables** tab.

---

## Phase 5: Environment Variables Configuration

Generate secure random 32-byte secret tokens on your VPS:
```bash
openssl rand -hex 32
```

Configure the following variables in Coolify:

| Variable Name | Example Value | Description |
| :--- | :--- | :--- |
| `NODE_ENV` | `production` | Enables production optimizations & logs |
| `PORT` | `3000` | Gateway internal port |
| `OLLAMA_BASE_URL` | `http://ollama:11434` | Private internal Docker bridge address |
| `AI_FAST_MODEL` | `qwen3.5:4b` | Default lightweight model for low latency |
| `AI_SMART_MODEL` | `qwen3.5:9b` | Higher-capacity reasoning model |
| `WEBUI_SECRET_KEY` | *(Generated 64-character hex)* | Session key for Open WebUI auth |
| `MASTER_ADMIN_KEY` | `apapai_live_master_...` | Superadmin bypass key for gateway |
| `DATABASE_URL` | `postgresql://user:pass@host:5432/apap` | Optional shared Postgres instance |
| `REDIS_URL` | `redis://redis:6379` | Internal Redis caching & rate limiting |

---

## Phase 6: Pulling & Pre-Warming LLM Models in Ollama

Once Coolify starts the containers, pull the designated open-weights models into the persistent Docker volume:

### Execute via SSH Shell on InterServer VPS:
```bash
# Pull Fast Model (qwen3.5:4b ~2.6 GB)
docker exec -it apap-ollama ollama pull qwen3.5:4b

# Pull Alternative Multilingual Fast Model (gemma3:4b ~3.3 GB)
docker exec -it apap-ollama ollama pull gemma3:4b

# Pull Smart Class Model (qwen3.5:9b ~5.8 GB)
docker exec -it apap-ollama ollama pull qwen3.5:9b

# Verify installed models
docker exec -it apap-ollama ollama list
```

### Pre-warm model in memory:
```bash
curl http://127.0.0.1:11434/api/generate -d '{"model": "qwen3.5:4b", "prompt": "test", "stream": false}'
```

---

## Phase 7: Verification & Testing

### Test 1: Gateway Health Check
```bash
curl -i https://ai.apapmedia.com/health
```
**Expected Response:**
```json
{
  "status": "ok",
  "service": "APAP AI Gateway",
  "uptime": 124,
  "ollama": { "status": "connected", "models": ["qwen3.5:4b", "gemma3:4b", "qwen3.5:9b"] },
  "redis": { "status": "connected" }
}
```

### Test 2: APAP Chat Reply Generation
```bash
curl -X POST https://ai.apapmedia.com/v1/generate \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer apapai_live_chat_189ab042e1" \
  -d '{
    "task": "chat-reply",
    "input": {
      "comment": "Where can we download the presentation slides?",
      "author": "Marcus_Civic",
      "streamTopic": "Community Revitalization",
      "host": "T. Dwain Smith"
    }
  }'
```

### Test 3: Structured JSON Chat Moderation
```bash
curl -X POST https://ai.apapmedia.com/v1/generate \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer apapai_live_chat_189ab042e1" \
  -d '{
    "task": "chat-moderation",
    "input": {
      "comment": "Join telegram t.me/fastcrypto 100x signals right now!!",
      "author": "CryptoGainz99",
      "accountAgeDays": "1"
    }
  }'
```

---

## Phase 8: Operational Maintenance & Automated Backups

### Automatic Model Volume Backup Cron
Add a daily cron job to back up your API keys, prompts, and database:
```bash
crontab -e
```
Add the following line to back up daily at 3:00 AM:
```bash
0 3 * * * docker exec apap-ai-gateway tar -czf /root/backups/apap_ai_$(date +\%F).tar.gz /app/data
```

### Checking Container Logs in Real Time
```bash
# View Gateway Logs
docker logs -f apap-ai-gateway

# View Ollama Inference Engine Logs
docker logs -f apap-ollama

# Monitor Live VPS CPU and Memory Usage
htop
```

### Updating Coolify and Components
Coolify automatically updates itself when triggered via the UI (**Settings -> Update Coolify**). To update the Ollama image:
```bash
docker pull ollama/ollama:latest
docker stop apap-ollama
docker rm apap-ollama
# Restart via Coolify or docker-compose up -d
```

---

## Summary Checklist

- [x] InterServer VPS deployed with 4+ vCPU & 8+ GB RAM.
- [x] 8 GB SWAP configured and active.
- [x] UFW firewall active (Ports 22, 80, 443, 8000 only).
- [x] Coolify installed via 1-line script.
- [x] DNS A records set for `ai.apapmedia.com` and `ai-admin.apapmedia.com`.
- [x] Docker Compose stack deployed in Coolify with SSL auto-provisioned.
- [x] LLM models (`qwen3.5:4b`, `gemma3:4b`, `qwen3.5:9b`) pulled to `ollama_data`.
- [x] Gateway tested via `/health` and `/v1/generate` endpoints.
