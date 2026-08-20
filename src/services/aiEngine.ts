import { AppEntity, PromptTemplate, RequestLog, ModelClass } from '../types';

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

// Generate realistic responses tailored to APAP Media requirements
export function generateSimulatedOutput(
  task: string,
  input: Record<string, any>,
  template?: PromptTemplate
): { text: string; structuredJson?: Record<string, any>; tokens: { prompt: number; completion: number } } {
  const show = input.show || input.station || 'Zlography';
  const topic = input.topic || input.discussionPoints || 'Civic Leadership & Community Media';
  const guest = input.guest || 'T. Dwain Smith';
  const comment = input.comment || '';
  const author = input.author || 'Viewer_88';

  switch (task) {
    case 'stream-title':
      return {
        text: `1. ${topic} | ${show} with ${guest}\n2. How ${guest} is Transforming Civic Media | ${show}\n3. ${show} Live: ${topic} & Future Impact`,
        tokens: { prompt: 210, completion: 74 },
      };

    case 'stream-description':
      return {
        text: `🔴 LIVE BROADCAST | ${show}\n\nJoin us for an in-depth conversation on "${topic}" featuring special guest ${guest}.\n\n📌 KEY DISCUSSION POINTS:\n• 00:00 - Introduction & Welcome\n• 04:30 - The Evolution of Civic & Community Media\n• 18:15 - Practical Strategies with ${guest}\n• 34:00 - Live Audience Q&A\n\n🔗 LINKS & RESOURCES:\n• Official Website: https://apapmedia.com\n• Support the Broadcast: https://apapmedia.com/support\n• Follow on Socials: @APAPMediaGroup\n\nProduced by APAP Media Group. All rights reserved.`,
        tokens: { prompt: 280, completion: 185 },
      };

    case 'chat-reply':
      return {
        text: `Hi @${author}! Thank you for tuning in to ${show}. You can check out all the featured resources and event links directly in the stream description below or visit apapmedia.com!`,
        tokens: { prompt: 160, completion: 48 },
      };

    case 'chat-moderation': {
      const isSpam =
        comment.toLowerCase().includes('crypto') ||
        comment.toLowerCase().includes('telegram') ||
        comment.toLowerCase().includes('http') ||
        comment.toLowerCase().includes('free cash') ||
        comment.toLowerCase().includes('t.me/');
      const isToxic =
        comment.toLowerCase().includes('hate') ||
        comment.toLowerCase().includes('scam') ||
        comment.toLowerCase().includes('idiot') ||
        comment.toLowerCase().includes('trash');

      let classification = 'safe';
      let confidence = 0.96;
      let reason = 'Constructive viewer feedback related to the broadcast discussion.';
      let actionRecommended = 'allow';

      if (isSpam) {
        classification = 'spam';
        confidence = 0.99;
        reason = 'External promotional or unauthorized cryptocurrency/link solicitation.';
        actionRecommended = 'hide';
      } else if (isToxic) {
        classification = 'toxic';
        confidence = 0.94;
        reason = 'Violates community guidelines on respectful discourse.';
        actionRecommended = 'timeout';
      }

      const structured = {
        classification,
        confidence,
        reason,
        actionRecommended,
        evaluatedAt: new Date().toISOString(),
        flaggedTerms: isSpam ? ['promo link'] : isToxic ? ['insult'] : [],
      };

      return {
        text: JSON.stringify(structured, null, 2),
        structuredJson: structured,
        tokens: { prompt: 190, completion: 72 },
      };
    }

    case 'youtube-tags':
      return {
        text: `TAGS: APAP Media, ${show}, ${guest}, ${topic}, Civic Leadership, Community Broadcasting, Live Streaming, Urban Media, Digital Journalism, Production Tools, RadioHub Pro, Live Q&A, Media Group, Leadership Dialogue\n\nHASHTAGS: #APAPMedia #${show.replace(/\s+/g, '')} #CivicLeadership #${guest.replace(/[^a-zA-Z]/g, '')} #CommunityFirst`,
        tokens: { prompt: 140, completion: 86 },
      };

    case 'social-caption':
      return {
        text: `📱 TIKTOK / REELS:\n"When you build community brick by brick, the foundation never shakes." 🎙️ Special guest ${guest} drops powerful insights on this week's ${show}! Tap the link in bio to watch full episode. 🚀 #APAPMedia #${show.replace(/\s+/g, '')} #Inspiration #CivicImpact\n\n🐦 X / TWITTER:\n"What does it take to truly revitalize community media?" ${guest} joined us on ${show} to break down actionable strategies. Catch the full stream here: https://ai.apapmedia.com\n\n📸 INSTAGRAM FEED:\nAuthentic conversations create real change. On this episode of ${show}, we sat down with ${guest} to discuss ${topic}.\n\nDrop your thoughts below: What is the most crucial step in building lasting community momentum? 👇`,
        tokens: { prompt: 250, completion: 210 },
      };

    case 'podcast-summary':
      return {
        text: `EPISODE SUMMARY — ${input.title || show}\n\nIn this high-energy installment of RadioHub Pro, host ${input.host || 'Marcus Cole'} welcomes ${guest} to explore "${topic}". The conversation dives deep into grassroots community organizing, modern digital audio distribution, and practical lessons learned from years in the media trenches.\n\nKEY TAKEAWAYS:\n• [02:40] Finding your authentic voice in digital radio\n• [12:15] Overcoming operational bottlenecks on independent budgets\n• [24:30] How ${guest} navigates civic partnerships\n• [38:00] Advice for emerging creators and producers\n\nNOTABLE QUOTE:\n"You do not need a multi-million dollar studio to produce multi-million dollar community value." — ${guest}`,
        tokens: { prompt: 340, completion: 260 },
      };

    case 'guest-introduction':
      return {
        text: `[Warm, confident tone to camera]\n\n"Welcome back to ${show}, everyone! Today, we are privileged to welcome a visionary leader who has dedicated their career to empowering communities from the ground up. Please give a warm APAP welcome to ${guest}!"\n\n[Turn to Guest Monitor / vMix Call]\n"It's great to have you with us today, ${guest}. Let's jump right into the big question..."`,
        tokens: { prompt: 190, completion: 110 },
      };

    case 'run-of-show':
      return {
        text: `RUN-OF-SHOW SCHEDULE: ${show} (${input.durationMinutes || 60} Minutes)\n\n| TIME | SEGMENT | TALENT | GFX & VIDEO ASSET | AUDIO | CUE / NOTES |\n|---|---|---|---|---|---|\n| 00:00 - 02:00 | Pre-Roll & Countdown | Host (VO) | Motion Countdown / Billboard | Station Intro Bed | Fade Bed to Host |\n| 02:00 - 05:00 | Cold Open & Show Intro | Host | Host Cam 1 / Lower Third Title | Host Mic | Intro Guest Teaser |\n| 05:00 - 15:00 | Guest Introduction & Icebreaker | Host + ${guest} | Split Screen 2-Box / Guest Lower Third | Host & Remote Audio | Transition to Topic Deep Dive |\n| 15:00 - 28:00 | Topic: ${topic} | Host + ${guest} | Full-Screen Slides / VT Package 1 | Discussion Audio | Standby for Sponsor Break |\n| 28:00 - 30:00 | Sponsor & Station Liner | Host (VO) | Sponsor Billboard VT | Sponsor Audio Stinger | Back to 2-Box Cam |\n| 30:00 - 45:00 | Interactive Audience Q&A | Host + ${guest} | APAP Chat Overlay / Highlight Box | Host & Guest | Prep Closing Takeaways |\n| 45:00 - 55:00 | Final Insights & Call-to-Action | Host + ${guest} | Socials Card / Resource QR Code | Discussion Audio | Wind down |\n| 55:00 - 60:00 | Outro & Closing Credits | Host | Full Credit Roll / Lower Third Outro | Outro Music Bed | Fade to Black |`,
        tokens: { prompt: 390, completion: 430 },
      };

    case 'dj-liner-intro':
      return {
        text: `RADIO LINERS — RadioHub Pro:\n\n1. [High Energy, 0:08]: "You're locked into the hottest sound in the city — this is RadioHub Pro! Coming up next, brand new vibes from ${input.songArtist || 'Kendrick Lamar'}. Don't touch that dial!"\n\n2. [Smooth, 0:10]: "From the streets to your speakers, nobody does it like RadioHub. Keep it locked, we've got ${input.songArtist || 'your favorite tracks'} dropping right now."\n\n3. [Station Sweep, 0:06]: "Commercial free, authentic beats. This is RadioHub Pro with ${input.djName || 'DJ Marcus'}!"`,
        tokens: { prompt: 180, completion: 125 },
      };

    default:
      return {
        text: `APAP AI Gateway processed task "${task}" successfully.\nResult generated for inputs: ${JSON.stringify(input)}`,
        tokens: { prompt: 150, completion: 60 },
      };
  }
}

// Full simulation of the APAP AI Gateway execution pipeline
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

  // Verify API Key format
  if (!params.apiKey.startsWith('apapai_live_')) {
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
      error: 'Invalid API key format. Must begin with apapai_live_',
      statusCode: 401,
    };
  }

  // Find app matching (in real life hashes match, here we match active app or master)
  const isMasterKey = params.apiKey.includes('master') || params.apiKey.length >= 20;
  let matchingApp = apps.find((a) => a.active);

  if (!matchingApp && !isMasterKey) {
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

  const modelName = modelClass === 'smart' ? 'qwen3.5:4b' : 'qwen3.5:4b';

  // 3. Generate Simulated AI Output
  const simulated = generateSimulatedOutput(params.task, params.input, matchedTemplate);

  // Artificial CPU execution delay (800ms - 1800ms to reflect realistic Ollama CPU inference)
  const baseLatency = modelClass === 'smart' ? 1400 : 900;
  const jitter = Math.floor(Math.random() * 400);
  const simulatedDelay = baseLatency + jitter;

  await new Promise((resolve) => setTimeout(resolve, Math.min(simulatedDelay, 1200)));

  const totalDurationMs = Math.round(performance.now() - start);
  const totalDurationNs = totalDurationMs * 1_000_000;
  const loadDurationNs = 12 * 1_000_000;
  const promptEvalDurationNs = Math.round(totalDurationNs * 0.25);
  const evalDurationNs = totalDurationNs - loadDurationNs - promptEvalDurationNs;

  return {
    success: true,
    requestId: reqId,
    task: params.task,
    modelClass,
    model: modelName,
    result: simulated.structuredJson || simulated.text,
    processingMs: totalDurationMs,
    tokens: {
      prompt: simulated.tokens.prompt,
      completion: simulated.tokens.completion,
      total: simulated.tokens.prompt + simulated.tokens.completion,
    },
    metrics: {
      totalDurationNs,
      loadDurationNs,
      promptEvalDurationNs,
      evalDurationNs,
    },
    statusCode: 200,
  };
}
