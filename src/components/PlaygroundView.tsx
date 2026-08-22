import React, { useState } from 'react';
import { AppEntity, PromptTemplate, RequestLog, ModelClass } from '../types';
import {
  Terminal,
  Play,
  Copy,
  Check,
  Zap,
  Clock,
  ShieldCheck,
  FileCode,
  Layers,
  Sparkles,
  Sliders,
  Code2,
  AlertCircle,
  Database,
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface PlaygroundViewProps {
  apps: AppEntity[];
  templates: PromptTemplate[];
  onLogRequest: (log: RequestLog) => void;
}

export const PlaygroundView: React.FC<PlaygroundViewProps> = ({
  apps,
  templates,
  onLogRequest,
}) => {
  const [selectedTask, setSelectedTask] = useState<string>('stream-title');
  const [selectedAppId, setSelectedAppId] = useState<string>(apps[0]?.id || '');
  const [apiKeyInput, setApiKeyInput] = useState<string>(apps[0]?.apiKey || '');
  const [modelClassOverride, setModelClassOverride] = useState<ModelClass | 'auto'>('auto');
  const [temperature, setTemperature] = useState<number>(0.3);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [codeLang, setCodeLang] = useState<'curl' | 'nodejs' | 'python'>('curl');
  const [isExecuting, setIsExecuting] = useState<boolean>(false);
  const [responseOutput, setResponseOutput] = useState<any>(null);
  const [responseStatus, setResponseStatus] = useState<number | null>(null);
  const [responseMetrics, setResponseMetrics] = useState<any>(null);

  // Variable inputs map for the selected task
  const currentTemplate = templates.find((t) => t.name === selectedTask);

  const [formInputs, setFormInputs] = useState<Record<string, string>>({
    show: 'Zlography Live',
    topic: 'Civic Leadership and Community Development',
    guest: 'T. Dwain Smith',
    audience: 'Urban media creators, community leaders, broadcast operators',
    keyTakeaway: 'Sustainable community-driven media infrastructure',
    comment: 'Where can we download the official slides from today’s presentation?',
    author: 'CivicViewer_99',
    station: 'RadioHub Pro 98.5',
    djName: 'Marcus Cole',
    songArtist: 'Kendrick Lamar',
    title: 'Building Communities Brick by Brick',
    durationMinutes: '60',
    segments: 'Host Intro, Guest Interview, Viewer Q&A, Wrap Up',
    hasSponsor: 'Yes - APAP Media Foundation',
  });

  const handleInputChange = (key: string, value: string) => {
    setFormInputs((prev) => ({ ...prev, [key]: value }));
  };

  const handleTaskChange = (newTask: string) => {
    setSelectedTask(newTask);
    const tmpl = templates.find((t) => t.name === newTask);
    if (tmpl) {
      setTemperature(tmpl.temperature);
    }
  };

  const handleAppSelect = (appId: string) => {
    setSelectedAppId(appId);
    const app = apps.find((a) => a.id === appId);
    if (app) {
      setApiKeyInput(app.apiKey);
    }
  };

  const handleExecute = async () => {
    setIsExecuting(true);
    setResponseOutput(null);
    setResponseStatus(null);
    setResponseMetrics(null);

    try {
      const res = await fetch('/v1/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKeyInput}`,
        },
        body: JSON.stringify({
          task: selectedTask,
          input: formInputs,
          temperature,
          modelClassOverride: modelClassOverride === 'auto' ? undefined : modelClassOverride,
        }),
      });
      const contentType = res.headers.get('content-type') || '';
      const result = contentType.includes('application/json')
        ? await res.json()
        : { success: false, error: `Gateway error: ${res.status} ${res.statusText || 'Timeout'}`, statusCode: res.status };

      setResponseOutput(result.result || result.error);
      setResponseStatus(result.statusCode);
      setResponseMetrics({
        model: result.model,
        modelClass: result.modelClass,
        processingMs: result.processingMs,
        tokens: result.tokens,
        metrics: result.metrics,
      });

      // Log request to telemetry
      const activeApp = apps.find((a) => a.id === selectedAppId) || apps[0];
      const newLog: RequestLog = {
        id: `req-${Date.now()}`,
        appId: activeApp?.id || 'unknown',
        appName: activeApp?.name || 'API Playground',
        requestId: result.requestId,
        endpoint: '/v1/generate',
        task: selectedTask,
        model: result.model,
        modelClass: result.modelClass,
        status: (result.statusCode as any) || 200,
        promptTokens: result.tokens.prompt,
        completionTokens: result.tokens.completion,
        totalTokens: result.tokens.total,
        totalDurationMs: result.processingMs,
        loadDurationMs: 12,
        promptEvalDurationMs: Math.round(result.processingMs * 0.25),
        evalDurationMs: Math.round(result.processingMs * 0.72),
        createdAt: new Date().toISOString(),
        inputPayloadSummary: JSON.stringify(formInputs).slice(0, 100),
        outputSummary: typeof result.result === 'string' ? result.result.slice(0, 100) : JSON.stringify(result.result).slice(0, 100),
        errorMessage: result.error,
      };

      onLogRequest(newLog);

      if (result.success) {
        confetti({
          particleCount: 35,
          spread: 60,
          origin: { y: 0.8 },
          colors: ['#10b981', '#06b6d4', '#6366f1'],
        });
      }
    } catch (err: any) {
      setResponseOutput(err.message || 'Execution error');
      setResponseStatus(500);
    } finally {
      setIsExecuting(false);
    }
  };

  // Generate code snippet
  const getGeneratedCode = () => {
    const payload = JSON.stringify({ task: selectedTask, input: formInputs }, null, 2);

    if (codeLang === 'curl') {
      return `curl -X POST https://ai.apapmedia.com/v1/generate \\
  -H "Authorization: Bearer ${apiKeyInput}" \\
  -H "Content-Type: application/json" \\
  -d '${payload}'`;
    }

    if (codeLang === 'nodejs') {
      return `import fetch from 'node-fetch';

const response = await fetch('https://ai.apapmedia.com/v1/generate', {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer ${apiKeyInput}',
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    task: '${selectedTask}',
    input: ${JSON.stringify(formInputs, null, 4)}
  })
});

const data = await response.json();
console.log(data);`;
    }

    if (codeLang === 'python') {
      return `import requests

url = "https://ai.apapmedia.com/v1/generate"
headers = {
    "Authorization": "Bearer ${apiKeyInput}",
    "Content-Type": "application/json"
}
payload = {
    "task": "${selectedTask}",
    "input": ${JSON.stringify(formInputs, null, 4)}
}

response = requests.post(url, headers=headers, json=payload)
print(response.json())`;
    }

    return '';
  };

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedCode(id);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Playground Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Terminal className="w-5 h-5 text-emerald-400" />
            Interactive API Gateway Playground
          </h2>
          <p className="text-xs text-slate-400">
            Simulate live requests to <span className="text-cyan-400 font-mono">POST https://ai.apapmedia.com/v1/generate</span>.
          </p>
        </div>

        {/* Quick App Preset Selector */}
        <div className="flex items-center gap-2 text-xs">
          <span className="text-slate-400">Application Identity:</span>
          <select
            value={selectedAppId}
            onChange={(e) => handleAppSelect(e.target.value)}
            className="bg-slate-900 border border-slate-700 text-slate-200 px-3 py-1.5 rounded-lg text-xs font-medium focus:outline-none focus:border-emerald-500"
          >
            {apps.map((app) => (
              <option key={app.id} value={app.id}>
                {app.name} ({app.slug})
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Request Configuration (7 Cols) */}
        <div className="lg:col-span-7 space-y-4">
          {/* Authorization & Headers Panel */}
          <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 space-y-3">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-slate-200 flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                1. Authorization Header
              </span>
              <span className="text-sm text-slate-400 font-mono">SHA-256 Verified at Gateway</span>
            </div>

            <div className="space-y-1.5">
              <div className="relative">
                <input
                  type="text"
                  value={apiKeyInput}
                  onChange={(e) => setApiKeyInput(e.target.value)}
                  placeholder="Bearer apapai_live_..."
                  className="w-full bg-slate-950 border border-slate-800 text-slate-200 px-3 py-2 rounded-lg text-xs font-mono focus:outline-none focus:border-emerald-500 pr-20"
                />
                <button
                  onClick={() => setApiKeyInput('apapai_invalid_bad_token')}
                  className="absolute right-2 top-1.5 px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-xs text-slate-400 font-mono cursor-pointer"
                  title="Test invalid key rejection"
                >
                  Test 401
                </button>
              </div>
            </div>
          </div>

          {/* Task & Parameters Selection */}
          <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 space-y-4">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-slate-200 flex items-center gap-1.5">
                <FileCode className="w-4 h-4 text-cyan-400" />
                2. Select Prompt Template Task
              </span>
              <span className="text-sm text-amber-300 font-mono">
                Class: {currentTemplate?.modelClass || 'fast'}
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {templates.map((tmpl) => (
                <button
                  key={tmpl.id}
                  onClick={() => handleTaskChange(tmpl.name)}
                  className={`px-3 py-2 rounded-lg text-left text-xs font-medium transition-all cursor-pointer border ${
                    selectedTask === tmpl.name
                      ? 'bg-emerald-950/80 border-emerald-500 text-emerald-300 shadow-sm'
                      : 'bg-slate-950 border-slate-800 text-slate-300 hover:bg-slate-800/80'
                  }`}
                >
                  <div className="font-mono font-semibold">{tmpl.name}</div>
                  <div className="text-xs text-slate-400 truncate">{tmpl.description}</div>
                </button>
              ))}
            </div>

            {/* System Prompt & Template Variable Inputs */}
            {currentTemplate && (
              <div className="p-3 rounded-lg bg-slate-950/80 border border-slate-800/80 space-y-3">
                <div className="flex items-center justify-between text-sm text-slate-400">
                  <span className="font-medium text-slate-300">Active System Prompt (Gateway DB):</span>
                  <span className="font-mono text-emerald-400">Temp: {temperature}</span>
                </div>
                <div className="text-sm font-mono text-slate-400 bg-slate-900 p-2.5 rounded border border-slate-800 max-h-24 overflow-y-auto leading-relaxed">
                  {currentTemplate.systemPrompt}
                </div>

                <div className="text-xs font-bold text-slate-300 pt-1">
                  Template Variables (Input JSON Payload):
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {currentTemplate.variables.map((variable) => (
                    <div key={variable} className="space-y-1">
                      <label className="text-sm font-mono text-slate-400 capitalize">
                        {variable}:
                      </label>
                      <input
                        type="text"
                        value={formInputs[variable] || ''}
                        onChange={(e) => handleInputChange(variable, e.target.value)}
                        placeholder={`Enter ${variable}...`}
                        className="w-full bg-slate-900 border border-slate-800 text-slate-200 px-2.5 py-1.5 rounded text-xs focus:outline-none focus:border-emerald-500"
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Model & Temp Options */}
            <div className="flex items-center justify-between flex-wrap gap-4 pt-2 text-xs border-t border-slate-800">
              <div className="flex items-center gap-2">
                <span className="text-slate-400">Model Class:</span>
                <select
                  value={modelClassOverride}
                  onChange={(e) => setModelClassOverride(e.target.value as any)}
                  className="bg-slate-950 border border-slate-800 text-slate-200 px-2.5 py-1 rounded text-xs"
                >
                  <option value="auto">Auto-Routed (Task Default)</option>
                  <option value="fast">Fast (qwen3.5:4b)</option>
                  <option value="smart">Smart (qwen3.5:4b / 9B)</option>
                </select>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-slate-400">Temperature:</span>
                <input
                  type="range"
                  min="0.0"
                  max="1.0"
                  step="0.1"
                  value={temperature}
                  onChange={(e) => setTemperature(parseFloat(e.target.value))}
                  className="w-24 accent-emerald-500"
                />
                <span className="font-mono text-emerald-400 font-bold">{temperature}</span>
              </div>
            </div>

            {/* Action Trigger */}
            <button
              onClick={handleExecute}
              disabled={isExecuting}
              className="w-full py-2.5 rounded-lg bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-emerald-950/40 transition-all cursor-pointer disabled:opacity-50"
            >
              <Play className={`w-4 h-4 ${isExecuting ? 'animate-spin' : ''}`} />
              {isExecuting ? 'Dispatching to Ollama Node...' : 'Execute Request (POST /v1/generate)'}
            </button>
          </div>
        </div>

        {/* Right Column: Live Output & Code Snippet (5 Cols) */}
        <div className="lg:col-span-5 space-y-4">
          {/* Response Payload Box */}
          <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 space-y-3 min-h-[320px] flex flex-col">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-white flex items-center gap-2">
                <Terminal className="w-4 h-4 text-emerald-400" />
                Response Payload
              </span>
              {responseStatus && (
                <span
                  className={`font-mono text-xs px-2 py-0.5 rounded font-bold ${
                    responseStatus === 200
                      ? 'bg-emerald-950 text-emerald-400 border border-emerald-800/80'
                      : 'bg-red-950 text-red-400 border border-red-800/80'
                  }`}
                >
                  HTTP {responseStatus}
                </span>
              )}
            </div>

            {/* Response Content */}
            <div className="flex-1 bg-slate-950 rounded-lg p-3.5 border border-slate-800/80 overflow-y-auto max-h-[360px] font-mono text-xs text-slate-200 whitespace-pre-wrap leading-relaxed">
              {isExecuting ? (
                <div className="h-full flex flex-col items-center justify-center text-slate-400 space-y-2 py-12">
                  <div className="w-6 h-6 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
                  <span className="text-xs">Processing inference on local Ollama container...</span>
                </div>
              ) : responseOutput ? (
                typeof responseOutput === 'object' ? (
                  JSON.stringify(responseOutput, null, 2)
                ) : (
                  responseOutput
                )
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-slate-500 py-16 text-center space-y-1">
                  <Play className="w-6 h-6 text-slate-600 mb-1" />
                  <span>Ready for execution</span>
                  <span className="text-sm text-slate-600">
                    Click "Execute Request" to test endpoint response.
                  </span>
                </div>
              )}
            </div>

            {/* Metrics Breakdown Pill */}
            {responseMetrics && (
              <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800 text-sm font-mono text-slate-400 space-y-1.5">
                <div className="flex items-center justify-between text-slate-300">
                  <span className="flex items-center gap-1 text-cyan-300">
                    <Clock className="w-3.5 h-3.5" /> Total Latency:
                  </span>
                  <span className="font-bold text-white">{responseMetrics.processingMs} ms</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span>Prompt / Output Tokens:</span>
                  <span className="text-amber-300 font-semibold">
                    {responseMetrics.tokens.prompt} in / {responseMetrics.tokens.completion} out ({responseMetrics.tokens.total} total)
                  </span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span>Inference Model:</span>
                  <span className="text-emerald-400">{responseMetrics.model}</span>
                </div>
              </div>
            )}
          </div>

          {/* Client Code Exporter */}
          <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-white flex items-center gap-1.5">
                <Code2 className="w-4 h-4 text-cyan-400" />
                Integration Code Snippet
              </span>
              <div className="flex items-center gap-1">
                {(['curl', 'nodejs', 'python'] as const).map((lang) => (
                  <button
                    key={lang}
                    onClick={() => setCodeLang(lang)}
                    className={`px-2 py-0.5 rounded text-xs font-mono uppercase cursor-pointer ${
                      codeLang === lang
                        ? 'bg-emerald-600 text-white font-bold'
                        : 'bg-slate-800 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    {lang}
                  </button>
                ))}
              </div>
            </div>

            <div className="relative">
              <pre className="bg-slate-950 p-3 rounded-lg border border-slate-800 text-sm font-mono text-cyan-300 overflow-x-auto max-h-40 leading-relaxed">
                {getGeneratedCode()}
              </pre>
              <button
                onClick={() => copyToClipboard(getGeneratedCode(), 'snippet')}
                className="absolute top-2 right-2 p-1.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs flex items-center gap-1 cursor-pointer"
                title="Copy snippet"
              >
                {copiedCode === 'snippet' ? (
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                ) : (
                  <Copy className="w-3.5 h-3.5" />
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
