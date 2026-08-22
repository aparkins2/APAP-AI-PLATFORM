import { AppEntity, PromptTemplate, RequestLog, DeploymentStep, ServerHealth } from '../types';

export const INITIAL_HEALTH: ServerHealth = {
  status: 'ok',
  service: 'apap-ai-gateway',
  ollama: true,
  database: true,
  redis: true,
  fastModel: 'qwen3.5:4b',
  smartModel: 'qwen3.5:4b',
  uptimeSeconds: 86420,
  cpuUsagePct: 24.8,
  ramUsageGb: {
    used: 4.8,
    total: 16.0,
  },
  gpuDetected: false, // Running CPU-first per MVP PRD
  activeRequests: 2,
  tokensPerSec: 38.4,
  avgLatencyMs: 1420,
};

export const INITIAL_APPS: AppEntity[] = [
  {
    id: '1a9e7d23-74b1-4c91-9e8a-4422f1839001',
    name: 'APAP Chat',
    slug: 'apap-chat',
    apiKeyHash: 'f769fb0c4d8eed9a7042a46222947f90ec7235ed35beac540d79a0fcabbffc29',
    apiKey: 'apapai_live_234680ccfa75b1af507ea68c1457f25a',
    apiKeyPrefix: 'apapai_live_23468...f25a',
    active: true,
    rateLimitPerMinute: 60,
    createdAt: '2026-08-10T10:00:00Z',
    updatedAt: '2026-08-18T05:30:00Z',
    totalRequests: 8492,
    description: 'Live interactive chat moderation, viewer sentiment, and suggested operator replies.',
    lastActiveAt: '2 mins ago',
  },
  {
    id: '2b8d6c34-85c2-4da2-af9b-5533f2940002',
    name: 'APAP Multistream',
    slug: 'apap-multistream',
    apiKeyHash: '5cda5e66bef33ee50c5ad10faf1749d08f84a47058c565e5b9e32c93304f78aa',
    apiKey: 'apapai_live_dabbd25c1ce7ac0960059531fcbbd34e',
    apiKeyPrefix: 'apapai_live_dabbd...d34e',
    active: true,
    rateLimitPerMinute: 60,
    createdAt: '2026-08-11T12:00:00Z',
    updatedAt: '2026-08-18T06:10:00Z',
    totalRequests: 3210,
    description: 'Automated stream titles, multi-platform descriptions, YouTube tags, TikTok captions.',
    lastActiveAt: '12 mins ago',
  },
  {
    id: '3c7c5b45-96d3-4eb3-bfac-6644f3050003',
    name: 'RadioHub Pro',
    slug: 'radiohub-pro',
    apiKeyHash: 'f50ceb57df375aec5220b1d8cd6af328092d31170ce71a6a66b56e5b03fa34fe',
    apiKey: 'apapai_live_f6320ac3c6db03d102452f452ed0db03',
    apiKeyPrefix: 'apapai_live_f6320...db03',
    active: true,
    rateLimitPerMinute: 30,
    createdAt: '2026-08-12T14:30:00Z',
    updatedAt: '2026-08-17T20:15:00Z',
    totalRequests: 1845,
    description: 'DJ station liners, segment intros, show notes, and podcast episode summaries.',
    lastActiveAt: '45 mins ago',
  },
  {
    id: '4d6b4a56-a7e4-4fc4-c0bd-7755f4160004',
    name: 'Zlography',
    slug: 'zlography',
    apiKeyHash: '7d7bd69a6588314272a0426efbb9451fb8fe5dfca592d525ecf91b395d3ed8b1',
    apiKey: 'apapai_live_800ebe6f59b486cca7e349babe3a1337',
    apiKeyPrefix: 'apapai_live_800eb...1337',
    active: true,
    rateLimitPerMinute: 30,
    createdAt: '2026-08-13T09:15:00Z',
    updatedAt: '2026-08-18T04:45:00Z',
    totalRequests: 940,
    description: 'Civic leadership interview outlines, guest profiles, and documentary narrative summaries.',
    lastActiveAt: '1 hour ago',
  },
  {
    id: '5e5a3967-b8f5-40d5-d1ce-8866f5270005',
    name: 'Run-of-Show Assistant',
    slug: 'run-of-show',
    apiKeyHash: '22f80ba8026befa21cb147cbc9799e86db073ee52499ddad348a088740a6e41d',
    apiKey: 'apapai_live_0eb49ee909062dc8117983059905b70e',
    apiKeyPrefix: 'apapai_live_0eb49...b70e',
    active: true,
    rateLimitPerMinute: 30,
    createdAt: '2026-08-14T11:00:00Z',
    updatedAt: '2026-08-18T02:00:00Z',
    totalRequests: 620,
    description: 'Generates detailed minute-by-minute broadcast timelines and director cues.',
    lastActiveAt: '3 hours ago',
  },
  {
    id: '6f492878-c906-41e6-e2df-9977f6380006',
    name: 'APAP Events & Lower Thirds',
    slug: 'apap-events',
    apiKeyHash: '830f7b0fd6a83c87a05258e805edee761a7ca3d18f66bfdcdea08d2adcb57cce',
    apiKey: 'apapai_live_3651d9565515236130dc94db6fceb4a1',
    apiKeyPrefix: 'apapai_live_3651d...b4a1',
    active: true,
    rateLimitPerMinute: 45,
    createdAt: '2026-08-15T15:20:00Z',
    updatedAt: '2026-08-18T05:00:00Z',
    totalRequests: 430,
    description: 'vMix production lower third captions, guest title cards, and sponsor callouts.',
    lastActiveAt: '2 hours ago',
  },
  {
    id: '7a381789-d017-42f7-f3e0-0088f7490007',
    name: 'Admin Gateway Studio',
    slug: 'admin',
    apiKeyHash: '616bc334479422f3d79e58c66c811d3c4d6dbd5d66f701809097510fe8b1e456',
    apiKey: 'apapai_live_d93695c6fb6579214bf6946f0b6c4f87',
    apiKeyPrefix: 'apapai_live_d9369...4f87',
    active: true,
    rateLimitPerMinute: 120,
    createdAt: '2026-08-01T00:00:00Z',
    updatedAt: '2026-08-18T06:00:00Z',
    totalRequests: 4950,
    description: 'Internal testing, benchmark verification, and administrative evaluations.',
    lastActiveAt: 'Just now',
  },
];

export const INITIAL_TEMPLATES: PromptTemplate[] = [
  {
    id: 't-01',
    name: 'stream-title',
    description: 'Generate concise, professional livestream titles without deceptive clickbait.',
    systemPrompt: `You are a professional media metadata assistant for APAP Media Group.
Create concise, compelling, broadcast-quality livestream titles.
Do not use misleading clickbait or ALL CAPS.
Adhere strictly to the requested show branding and topic tone.
Return only 3 numbered title options unless otherwise specified.`,
    userPromptTemplate: `Show: {{show}}\nTopic: {{topic}}\nGuest: {{guest}}\nTarget Audience: {{audience}}\nKey Takeaway: {{keyTakeaway}}`,
    modelClass: 'fast',
    temperature: 0.3,
    maxTokens: 500,
    active: true,
    variables: ['show', 'topic', 'guest', 'audience', 'keyTakeaway'],
    createdAt: '2026-08-10T10:00:00Z',
    updatedAt: '2026-08-18T01:00:00Z',
    category: 'streaming',
  },
  {
    id: 't-02',
    name: 'stream-description',
    description: 'Generates 300-word multi-platform livestream description with timestamps and links.',
    systemPrompt: `You are an expert stream producer and SEO copywriter for APAP Media Group.
Write an engaging, clear, and comprehensive description for YouTube and Facebook livestreams.
Include a compelling hook, 3 bulleted key takeaways, guest bio highlight, and standard APAP footer.`,
    userPromptTemplate: `Title: {{title}}\nShow Name: {{show}}\nGuest Name: {{guest}}\nGuest Title: {{guestTitle}}\nDiscussion Points: {{discussionPoints}}\nLinks/CTA: {{cta}}`,
    modelClass: 'fast',
    temperature: 0.4,
    maxTokens: 400,
    active: true,
    variables: ['title', 'show', 'guest', 'guestTitle', 'discussionPoints', 'cta'],
    createdAt: '2026-08-10T10:30:00Z',
    updatedAt: '2026-08-18T02:00:00Z',
    category: 'streaming',
  },
  {
    id: 't-03',
    name: 'chat-reply',
    description: 'Suggests empathetic, professional moderator chat replies for APAP Chat operators.',
    systemPrompt: `You are a helpful APAP Chat moderation assistant.
Suggest a friendly, respectful, and on-brand reply to a live stream viewer comment.
Keep it under 2 sentences.
Never promise unverified information or make financial/legal claims.`,
    userPromptTemplate: `Viewer Comment: "{{comment}}"\nViewer Name: {{author}}\nStream Topic: {{streamTopic}}\nHost Name: {{host}}`,
    modelClass: 'fast',
    temperature: 0.3,
    maxTokens: 300,
    active: true,
    variables: ['comment', 'author', 'streamTopic', 'host'],
    createdAt: '2026-08-11T08:00:00Z',
    updatedAt: '2026-08-17T18:00:00Z',
    category: 'chat',
  },
  {
    id: 't-04',
    name: 'chat-moderation',
    description: 'Classifies live viewer comments into safe, spam, toxic, or promotional in strict JSON.',
    systemPrompt: `You are a real-time safety and spam classifier for APAP live broadcasts.
Analyze the user comment.
Output STRICT JSON with the following schema:
{
  "classification": "safe" | "spam" | "toxic" | "promotional" | "flag_for_review",
  "confidence": number (between 0.0 and 1.0),
  "reason": "short explanation",
  "actionRecommended": "allow" | "hide" | "timeout" | "ban"
}
Do not output markdown code blocks or any explanation outside the JSON.`,
    userPromptTemplate: `Comment Text: "{{comment}}"\nUsername: {{author}}\nUser Account Age Days: {{accountAgeDays}}`,
    modelClass: 'fast',
    temperature: 0.1,
    maxTokens: 400,
    active: true,
    variables: ['comment', 'author', 'accountAgeDays'],
    createdAt: '2026-08-11T09:00:00Z',
    updatedAt: '2026-08-17T22:00:00Z',
    category: 'moderation',
  },
  {
    id: 't-05',
    name: 'youtube-tags',
    description: 'Generates high-intent SEO tags and hashtags for broadcast distribution.',
    systemPrompt: `You are an SEO specialist for APAP Media Group.
Generate a comma-separated list of 15-20 relevant, high-search-intent tags and 5 trending hashtags.
Focus on topics, guest names, civic leadership, and regional media relevance.`,
    userPromptTemplate: `Topic: {{topic}}\nGuest: {{guest}}\nCategory: {{category}}`,
    modelClass: 'fast',
    temperature: 0.2,
    maxTokens: 500,
    active: true,
    variables: ['topic', 'guest', 'category'],
    createdAt: '2026-08-12T11:00:00Z',
    updatedAt: '2026-08-16T14:00:00Z',
    category: 'streaming',
  },
  {
    id: 't-06',
    name: 'social-caption',
    description: 'Creates tailored social media copy for TikTok, Instagram, X (Twitter), and Facebook.',
    systemPrompt: `You are a social media copywriter for APAP Media Group.
Create 4 distinct variations of social copy for the given segment clip:
1. TikTok / Reels (Punchy, hook-heavy, with emojis and 4 hashtags)
2. X / Twitter (Under 250 characters, engaging question)
3. Instagram Feed (Storytelling caption with call to action)
4. LinkedIn / Facebook (Professional, informative, civic community tone)`,
    userPromptTemplate: `Segment Quote/Moment: "{{quote}}"\nGuest: {{guest}}\nEpisode Title: {{title}}\nKey Insight: {{insight}}`,
    modelClass: 'fast',
    temperature: 0.5,
    maxTokens: 1000,
    active: true,
    variables: ['quote', 'guest', 'title', 'insight'],
    createdAt: '2026-08-12T15:00:00Z',
    updatedAt: '2026-08-18T00:00:00Z',
    category: 'general',
  },
  {
    id: 't-07',
    name: 'podcast-summary',
    description: 'Synthesizes RadioHub Pro episode audio transcript into structured show notes.',
    systemPrompt: `You are an executive podcast producer for RadioHub Pro.
Generate structured show notes from the episode notes:
1. One-paragraph episode synopsis (approx 75 words).
2. Key Topics Covered (bulleted with timestamps placeholders).
3. Notable Quotes.
4. Guest Information & Resources.`,
    userPromptTemplate: `Episode Title: {{title}}\nHost: {{host}}\nGuest: {{guest}}\nRaw Transcript/Notes: {{rawContent}}`,
    modelClass: 'smart',
    temperature: 0.3,
    maxTokens: 400,
    active: true,
    variables: ['title', 'host', 'guest', 'rawContent'],
    createdAt: '2026-08-13T10:00:00Z',
    updatedAt: '2026-08-17T12:00:00Z',
    category: 'radio',
  },
  {
    id: 't-08',
    name: 'guest-introduction',
    description: 'Creates warm, charismatic broadcast introductions for live show hosts.',
    systemPrompt: `You are the lead scriptwriter for APAP broadcast hosts.
Write an authentic, articulate, 30-45 second spoken introduction for the show host to read on air.
Include tone cues (e.g., [Upbeat], [Warmly], [Direct to camera]).`,
    userPromptTemplate: `Guest Name: {{guest}}\nGuest Bio/Affiliation: {{bio}}\nTopic of the Day: {{topic}}\nShow Name: {{show}}`,
    modelClass: 'fast',
    temperature: 0.4,
    maxTokens: 600,
    active: true,
    variables: ['guest', 'bio', 'topic', 'show'],
    createdAt: '2026-08-14T09:00:00Z',
    updatedAt: '2026-08-16T19:00:00Z',
    category: 'production',
  },
  {
    id: 't-09',
    name: 'run-of-show',
    description: 'Builds a complete minute-by-minute live broadcast breakdown with technical cues.',
    systemPrompt: `You are a master technical director and broadcast producer for APAP Media Group.
Generate a structured Run-of-Show schedule table:
- Segment Name
- Duration (mm:ss)
- Talent On Camera
- Video/GFX Asset (Lower Third, vMix Call, VT playback)
- Audio Source
- Transition Cue`,
    userPromptTemplate: `Show Name: {{show}}\nTotal Broadcast Length: {{durationMinutes}} minutes\nGuest: {{guest}}\nKey Segments Required: {{segments}}\nSponsor Break: {{hasSponsor}}`,
    modelClass: 'smart',
    temperature: 0.2,
    maxTokens: 400,
    active: true,
    variables: ['show', 'durationMinutes', 'guest', 'segments', 'hasSponsor'],
    createdAt: '2026-08-14T14:00:00Z',
    updatedAt: '2026-08-17T16:00:00Z',
    category: 'production',
  },
  {
    id: 't-10',
    name: 'dj-liner-intro',
    description: 'RadioHub Pro station liners, song intros, and fast-paced station sweeps.',
    systemPrompt: `You are a radio imaging producer for RadioHub Pro.
Write 3 punchy, high-energy 10-second station liners/intros that DJs can speak over the instrumental intro of a track.
Keep the style urban contemporary, polished, and exciting.`,
    userPromptTemplate: `Station Name: {{station}}\nDJ Name: {{djName}}\nNext Song/Artist: {{songArtist}}\nVibe/Tempo: {{vibe}}`,
    modelClass: 'fast',
    temperature: 0.5,
    maxTokens: 500,
    active: true,
    variables: ['station', 'djName', 'songArtist', 'vibe'],
    createdAt: '2026-08-15T11:00:00Z',
    updatedAt: '2026-08-18T03:00:00Z',
    category: 'radio',
  },
];

export const INITIAL_LOGS: RequestLog[] = [
  {
    id: 'req-901',
    appId: '1a9e7d23-74b1-4c91-9e8a-4422f1839001',
    appName: 'APAP Chat',
    requestId: '9e7b2311-64c8-40a2-9762-2309bf84aa01',
    endpoint: '/v1/generate',
    task: 'chat-moderation',
    model: 'qwen3.5:4b',
    modelClass: 'fast',
    status: 200,
    promptTokens: 184,
    completionTokens: 62,
    totalTokens: 246,
    totalDurationMs: 840,
    loadDurationMs: 12,
    promptEvalDurationMs: 210,
    evalDurationMs: 618,
    createdAt: '2026-08-18T06:23:40Z',
    inputPayloadSummary: 'Comment: "Join our crypto telegram group for 10x gains!"',
    outputSummary: '{"classification":"spam","confidence":0.98,"actionRecommended":"hide"}',
  },
  {
    id: 'req-902',
    appId: '2b8d6c34-85c2-4da2-af9b-5533f2940002',
    appName: 'APAP Multistream',
    requestId: '8f6a1200-53b7-4f91-8651-1298af73bb02',
    endpoint: '/v1/generate',
    task: 'stream-title',
    model: 'qwen3.5:4b',
    modelClass: 'fast',
    status: 200,
    promptTokens: 240,
    completionTokens: 98,
    totalTokens: 338,
    totalDurationMs: 1220,
    loadDurationMs: 14,
    promptEvalDurationMs: 290,
    evalDurationMs: 916,
    createdAt: '2026-08-18T06:21:15Z',
    inputPayloadSummary: 'Topic: Civic Leadership & Community Development, Guest: T. Dwain Smith',
    outputSummary: '1. Building Communities Brick by Brick | Civic Leadership with T. Dwain Smith...',
  },
  {
    id: 'req-903',
    appId: '3c7c5b45-96d3-4eb3-bfac-6644f3050003',
    appName: 'RadioHub Pro',
    requestId: '7e5901ff-42a6-4e80-7540-0187ae62cc03',
    endpoint: '/v1/generate',
    task: 'dj-liner-intro',
    model: 'qwen3.5:4b',
    modelClass: 'fast',
    status: 200,
    promptTokens: 195,
    completionTokens: 110,
    totalTokens: 305,
    totalDurationMs: 1150,
    loadDurationMs: 10,
    promptEvalDurationMs: 220,
    evalDurationMs: 920,
    createdAt: '2026-08-18T06:14:02Z',
    inputPayloadSummary: 'Station: RadioHub 98.5, DJ: Marcus Cole, Artist: Kendrick Lamar',
    outputSummary: 'Option 1: You are locked into the midday mix on RadioHub 98.5...',
  },
  {
    id: 'req-904',
    appId: '5e5a3967-b8f5-40d5-d1ce-8866f5270005',
    appName: 'Run-of-Show Assistant',
    requestId: '6d48f0ee-3195-4d7f-643f-f076ad51dd04',
    endpoint: '/v1/generate',
    task: 'run-of-show',
    model: 'qwen3.5:4b',
    modelClass: 'smart',
    status: 200,
    promptTokens: 380,
    completionTokens: 490,
    totalTokens: 870,
    totalDurationMs: 3450,
    loadDurationMs: 22,
    promptEvalDurationMs: 440,
    evalDurationMs: 2988,
    createdAt: '2026-08-18T05:52:19Z',
    inputPayloadSummary: 'Show: Zlography Live, Duration: 60m, Guest: Rev. Carter',
    outputSummary: '| 00:00-03:00 | Cold Open & Animated Stinger | Host | GFX: Intro Stinger |...',
  },
  {
    id: 'req-905',
    appId: '1a9e7d23-74b1-4c91-9e8a-4422f1839001',
    appName: 'APAP Chat',
    requestId: '5c37efdd-2084-4c6e-532e-ef65ac40ee05',
    endpoint: '/v1/generate',
    task: 'chat-reply',
    model: 'qwen3.5:4b',
    modelClass: 'fast',
    status: 200,
    promptTokens: 210,
    completionTokens: 55,
    totalTokens: 265,
    totalDurationMs: 760,
    loadDurationMs: 9,
    promptEvalDurationMs: 200,
    evalDurationMs: 551,
    createdAt: '2026-08-18T05:40:11Z',
    inputPayloadSummary: 'Comment: "Where can we download the event presentation slides?"',
    outputSummary: 'Thanks for tuning in! You can grab all the official slides and handouts at apapmedia.com/resources right now.',
  },
  {
    id: 'req-906',
    appId: '4d6b4a56-a7e4-4fc4-c0bd-7755f4160004',
    appName: 'Zlography',
    requestId: '4b26decc-1f73-4b5d-421d-de549b3ff006',
    endpoint: '/v1/generate',
    task: 'guest-introduction',
    model: 'qwen3.5:4b',
    modelClass: 'fast',
    status: 200,
    promptTokens: 280,
    completionTokens: 145,
    totalTokens: 425,
    totalDurationMs: 1540,
    loadDurationMs: 11,
    promptEvalDurationMs: 310,
    evalDurationMs: 1219,
    createdAt: '2026-08-18T05:15:30Z',
    inputPayloadSummary: 'Guest: Dr. Angela Vance, Bio: Urban Development Director',
    outputSummary: '[Warmly to Camera] Joining us today is Dr. Angela Vance, whose work in civic revitalization...',
  },
  {
    id: 'req-907',
    appId: '7a381789-d017-42f7-f3e0-0088f7490007',
    appName: 'Admin Gateway Studio',
    requestId: '3a15cdbb-0e62-4a4c-310c-cd438a2ee007',
    endpoint: '/v1/models',
    task: 'models-list',
    model: 'ollama-catalog',
    modelClass: 'fast',
    status: 200,
    promptTokens: 0,
    completionTokens: 80,
    totalTokens: 80,
    totalDurationMs: 45,
    loadDurationMs: 2,
    promptEvalDurationMs: 5,
    evalDurationMs: 38,
    createdAt: '2026-08-18T05:00:00Z',
    inputPayloadSummary: 'GET /v1/models',
    outputSummary: 'models: ["qwen3.5:4b", "gemma3:4b"]',
  },
];

export const DEPLOYMENT_STEPS: DeploymentStep[] = [
  {
    id: 1,
    title: 'Verify Server Resources',
    category: 'Infrastructure',
    description: 'Inspect CPU, RAM, and disk space on the APAP VPS to ensure sufficient capacity for Ollama and Fastify gateway.',
    command: `free -h && lscpu && df -h && docker --version && docker compose version`,
    expectedOutput: `RAM: 16GiB (>=8GiB recommended)\nCPU Cores: 4-8 vCPU\nDisk: >=40GB free on /opt\nDocker: >=24.0.0`,
    verificationCheck: 'Confirm available RAM is >= 4GB and disk space is >= 20GB for Ollama model weights.',
    status: 'completed',
  },
  {
    id: 2,
    title: 'Check for GPU Acceleration',
    category: 'Infrastructure',
    description: 'Verify if an NVIDIA GPU exists. If not, proceed with CPU-only mode (supported out-of-the-box for Qwen 4B).',
    command: `lspci | grep -Ei 'nvidia|amd|vga' || nvidia-smi || echo "Proceeding CPU-only"`,
    expectedOutput: `If no GPU: "Proceeding CPU-only" (standard for initial VPS rollout).`,
    verificationCheck: 'Note whether CUDA or CPU inference is configured.',
    status: 'completed',
  },
  {
    id: 3,
    title: 'Create Project Directory Structure',
    category: 'Infrastructure',
    description: 'Set up /opt/apap-ai with gateway, routes, services, migrations, config, and logs directories.',
    command: `mkdir -p /opt/apap-ai/{gateway/src/{routes,services,middleware,db},migrations,config,logs,scripts} && cd /opt/apap-ai`,
    expectedOutput: `Created folder hierarchy in /opt/apap-ai`,
    verificationCheck: 'Run ls -la /opt/apap-ai to verify clean layout.',
    status: 'completed',
  },
  {
    id: 4,
    title: 'Create Production Environment (.env)',
    category: 'Security',
    description: 'Generate secure 32-byte hexadecimal secrets for MASTER_ADMIN_KEY and WEBUI_SECRET_KEY.',
    codeBlock: `NODE_ENV=production
PORT=3000
OLLAMA_BASE_URL=http://ollama:11434
AI_FAST_MODEL=qwen3.5:4b
AI_SMART_MODEL=qwen3.5:4b
DATABASE_URL=postgresql://apap_admin:SECURE_PASS@postgres:5432/apap_platform
REDIS_URL=redis://redis:6379
WEBUI_SECRET_KEY=$(openssl rand -hex 32)
MASTER_ADMIN_KEY=$(openssl rand -hex 32)
MAX_PROMPT_LENGTH=20000
DEFAULT_MAX_OUTPUT_TOKENS=2000
DEFAULT_RATE_LIMIT=60`,
    verificationCheck: 'Ensure .env is added to .gitignore and has strict 0600 permissions.',
    status: 'completed',
  },
  {
    id: 5,
    title: 'Configure docker-compose.yml',
    category: 'Infrastructure',
    description: 'Define apap-ollama, apap-ai-gateway, and apap-open-webui on isolated bridge network apap-ai-network without exposing Ollama 11434 to public.',
    codeBlock: `services:
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
    verificationCheck: 'Run `docker compose config` to validate syntax.',
    status: 'completed',
  },
  {
    id: 6,
    title: 'Start Ollama Container First',
    category: 'Models',
    description: 'Launch the isolated Ollama container and confirm log initialization.',
    command: `docker compose up -d ollama && docker logs -f apap-ollama --tail 20`,
    expectedOutput: `Container apap-ollama Started. Listening on [::]:11434`,
    verificationCheck: 'docker ps shows apap-ollama status Up (healthy).',
    status: 'completed',
  },
  {
    id: 7,
    title: 'Pull Initial 4B Model (qwen3.5:4b)',
    category: 'Models',
    description: 'Pull the lightweight, highly efficient Qwen 4B foundational model into the persistent volume.',
    command: `docker exec -it apap-ollama ollama pull qwen3.5:4b`,
    expectedOutput: `pulling manifest\npulling 5b4c10... 100%\nverifying sha256 digest\nwriting manifest\nsuccess`,
    verificationCheck: 'Run `docker exec -it apap-ollama ollama list` to verify model is present.',
    status: 'completed',
  },
  {
    id: 8,
    title: 'Test Ollama Model Locally Inside Container',
    category: 'Models',
    description: 'Execute a quick smoke test generation to ensure CPU inference works without crashing.',
    command: `docker exec -it apap-ollama ollama run qwen3.5:4b "Write one sentence welcoming viewers to APAP Media."`,
    expectedOutput: `"Welcome to APAP Media, your home for authentic civic broadcasts and entertainment!"`,
    verificationCheck: 'Response returns within 2-3 seconds on CPU.',
    status: 'completed',
  },
  {
    id: 9,
    title: 'Test Ollama Internal REST API',
    category: 'Models',
    description: 'Verify internal JSON API response on http://localhost:11434/api/generate.',
    command: `docker exec apap-ollama curl -s http://localhost:11434/api/generate -d '{"model":"qwen3.5:4b","prompt":"Say APAP AI is operational.","stream":false}' | jq .response`,
    expectedOutput: `"APAP AI is operational."`,
    verificationCheck: 'JSON response returns status 200 with eval_count and duration metrics.',
    status: 'completed',
  },
  {
    id: 10,
    title: 'Apply PostgreSQL Schema (apap_ai)',
    category: 'Database',
    description: 'Create the apap_ai schema, apps table, templates table, and requests table in the shared database.',
    command: `docker exec -i apap-postgres psql -U apap_admin -d apap_platform < migrations/001_apap_ai.sql`,
    expectedOutput: `CREATE SCHEMA\nCREATE TABLE\nCREATE TABLE\nCREATE TABLE`,
    verificationCheck: `psql check: \dt apap_ai.* shows apps, templates, requests.`,
    status: 'completed',
  },
  {
    id: 11,
    title: 'Build Fastify Gateway Project',
    category: 'Gateway',
    description: 'Initialize Node.js ES module project with Fastify, CORS, Rate Limit, Helmet, pg, redis, and zod.',
    command: `cd gateway && npm init -y && npm install fastify @fastify/cors @fastify/helmet @fastify/rate-limit pg redis zod dotenv`,
    expectedOutput: `added 82 packages in 3s`,
    verificationCheck: 'Check package.json contains "type": "module".',
    status: 'completed',
  },
  {
    id: 12,
    title: 'Create Gateway Dockerfile',
    category: 'Gateway',
    description: 'Build lightweight node:22-alpine container image with multi-stage non-root execution.',
    codeBlock: `FROM node:22-alpine\nWORKDIR /app\nCOPY package*.json ./\nRUN npm ci --omit=dev\nCOPY src ./src\nEXPOSE 3000\nCMD ["node", "src/server.js"]`,
    verificationCheck: 'Dockerfile passes docker lint.',
    status: 'completed',
  },
  {
    id: 13,
    title: 'Build and Run APAP AI Gateway Container',
    category: 'Gateway',
    description: 'Compile the Gateway image and bind to 127.0.0.1:3100.',
    command: `cd /opt/apap-ai && docker compose build gateway && docker compose up -d gateway`,
    expectedOutput: `Container apap-ai-gateway Started`,
    verificationCheck: 'curl http://127.0.0.1:3100/health returns {"status":"ok","service":"apap-ai"}.',
    status: 'completed',
  },
  {
    id: 14,
    title: 'Seed Initial Prompt Templates',
    category: 'Database',
    description: 'Insert production-tested templates for stream-title, chat-moderation, chat-reply, etc.',
    command: `docker exec -i apap-postgres psql -U apap_admin -d apap_platform -c "SELECT count(*) FROM apap_ai.templates;"`,
    expectedOutput: `count: 10`,
    verificationCheck: 'Templates are queryable by name slug.',
    status: 'completed',
  },
  {
    id: 15,
    title: 'Provision Initial Application API Keys',
    category: 'Security',
    description: 'Generate SHA-256 hashed keys for APAP Chat, Multistream, RadioHub, and Admin.',
    command: `node scripts/generate-key.js --name "APAP Chat" --slug "apap-chat" --rate-limit 60`,
    expectedOutput: `Generated Key: apapai_live_7c4f9... (save this! Hash stored in DB)`,
    verificationCheck: 'Raw key authenticates successfully against /v1/generate.',
    status: 'completed',
  },
  {
    id: 16,
    title: 'Deploy Open WebUI (Admin Chat Interface)',
    category: 'Gateway',
    description: 'Start open-webui container bound to 127.0.0.1:3101 for internal team prompt experimentation.',
    command: `docker compose up -d open-webui`,
    expectedOutput: `Container apap-open-webui Started`,
    verificationCheck: 'Accessing 127.0.0.1:3101 presents Open WebUI setup wizard.',
    status: 'completed',
  },
  {
    id: 17,
    title: 'Configure Nginx / Reverse Proxy & Cloudflare SSL',
    category: 'Security',
    description: 'Route ai.apapmedia.com -> 127.0.0.1:3100 and ai-admin.apapmedia.com -> 127.0.0.1:3101 with Full (Strict) TLS.',
    codeBlock: `# /etc/nginx/sites-available/apap-ai.conf
server {
    server_name ai.apapmedia.com;
    listen 443 ssl http2;
    client_max_body_size 1m;
    location / {
        proxy_pass http://127.0.0.1:3100;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}

server {
    server_name ai-admin.apapmedia.com;
    listen 443 ssl http2;
    location / {
        proxy_pass http://127.0.0.1:3101;
        proxy_set_header Host $host;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
    }
}`,
    verificationCheck: 'Ensure port 11434 is blocked by firewall and not exposed.',
    status: 'completed',
  },
  {
    id: 18,
    title: 'Verify Ollama Port 11434 Is NOT Public',
    category: 'Security',
    description: 'CRITICAL SECURITY CHECK: Test public domain against port 11434 to ensure direct unauthorized access is rejected.',
    command: `curl -m 3 https://ai.apapmedia.com:11434 || echo "SUCCESS: Ollama is securely blocked from public internet."`,
    expectedOutput: `Connection refused or timed out.`,
    verificationCheck: 'Ollama is only reachable from gateway container via Docker internal bridge network.',
    status: 'completed',
  },
  {
    id: 19,
    title: 'End-to-End API Generation Test',
    category: 'Verification',
    description: 'Execute the complete round-trip test with Bearer authentication and template interpolation.',
    command: `curl -X POST https://ai.apapmedia.com/v1/generate \\
  -H "Authorization: Bearer apapai_live_REDACTED" \\
  -H "Content-Type: application/json" \\
  -d '{"task":"stream-title","input":{"show":"Zlography","topic":"Building Communities Brick by Brick","guest":"T. Dwain Smith"}}'`,
    expectedOutput: `{"success":true,"task":"stream-title","result":"1. Building Communities Brick by Brick...","model_class":"fast","processing_ms":1240}`,
    verificationCheck: 'Request is logged in apap_ai.requests with valid token stats.',
    status: 'completed',
  },
  {
    id: 20,
    title: 'Production Benchmark & Monitoring Active',
    category: 'Verification',
    description: 'Run 5 concurrent requests to benchmark CPU & RAM stability, recording TTFT and duration.',
    command: `node scripts/benchmark.js --concurrency 5 --requests 20`,
    expectedOutput: `Avg Latency: 1.4s | 0 Errors | Max RAM: 5.2GB`,
    verificationCheck: 'System ready for APAP Chat, Multistream, and RadioHub traffic.',
    status: 'completed',
  },
];
