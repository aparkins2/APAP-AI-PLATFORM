import express, { Request, Response } from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;
const OLLAMA_BASE_URL = process.env.OLLAMA_BASE_URL || 'http://ollama:11434';

app.use(express.json({ limit: '10mb' }));

// Health Check endpoint for Coolify / Docker / Traefik
app.get('/health', async (_req: Request, res: Response) => {
  let ollamaOnline = false;
  let availableModels: string[] = [];

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 2000);
    const response = await fetch(`${OLLAMA_BASE_URL}/api/tags`, {
      signal: controller.signal,
    });
    clearTimeout(timeoutId);

    if (response.ok) {
      const data = (await response.json()) as { models?: { name: string }[] };
      ollamaOnline = true;
      availableModels = (data.models || []).map((m) => m.name);
    }
  } catch {
    ollamaOnline = false;
  }

  res.status(200).json({
    status: 'ok',
    service: 'APAP AI Server & Gateway',
    timestamp: new Date().toISOString(),
    uptime: Math.floor(process.uptime()),
    ollama: {
      url: OLLAMA_BASE_URL,
      connected: ollamaOnline,
      models: availableModels,
    },
    version: '1.0.0',
    environment: process.env.NODE_ENV || 'production',
  });
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
