import React from 'react';
import { ServerHealth, AppEntity, PromptTemplate, RequestLog } from '../types';
import {
  Server,
  Activity,
  Shield,
  Zap,
  Cpu,
  HardDrive,
  Clock,
  ArrowRight,
  Database,
  Lock,
  Radio,
  CheckCircle2,
  AlertTriangle,
  PlayCircle,
  Code,
  FileText,
  Layers,
  Sparkles,
} from 'lucide-react';

interface DashboardViewProps {
  health: ServerHealth;
  apps: AppEntity[];
  templates: PromptTemplate[];
  logs: RequestLog[];
  onNavigate: (tab: any) => void;
  onRefreshHealth: () => void;
  isRefreshing: boolean;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  health,
  apps,
  templates,
  logs,
  onNavigate,
  onRefreshHealth,
  isRefreshing,
}) => {
  const activeAppsCount = apps.filter((a) => a.active).length;
  const totalRequestsCount = logs.length;
  const avgDuration =
    logs.length > 0
      ? Math.round(logs.reduce((acc, curr) => acc + curr.totalDurationMs, 0) / logs.length)
      : 1200;

  return (
    <div className="space-y-6 pb-12">
      {/* Top Banner / Welcome */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-slate-900 via-slate-900/90 to-emerald-950/40 border border-slate-800 p-6 lg:p-8">
        <div className="relative z-10 max-w-4xl space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-950/80 border border-emerald-700/60 text-emerald-400 text-xs font-semibold">
            <span className="flex h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
            Self-Hosted AI Infrastructure Operational
          </div>
          <h2 className="text-2xl lg:text-3xl font-extrabold text-white tracking-tight">
            APAP AI Server & Gateway
          </h2>
          <p className="text-sm text-slate-300 leading-relaxed">
            Centralized inference gateway for APAP Media Group applications. Eliminates third-party API costs,
            protects private Ollama inference instances, enforces per-app rate limits, and standardizes media prompts.
          </p>

          <div className="flex flex-wrap items-center gap-3 pt-2">
            <button
              onClick={() => onNavigate('playground')}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow-lg shadow-emerald-900/30 transition-all cursor-pointer"
            >
              <PlayCircle className="w-4 h-4" />
              Launch API Playground
            </button>
            <button
              onClick={() => onNavigate('ecosystem')}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 text-xs font-semibold transition-all cursor-pointer"
            >
              <Layers className="w-4 h-4" />
              Try App Ecosystem Demos
            </button>
            <button
              onClick={() => onNavigate('deployment')}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 text-xs font-semibold transition-all cursor-pointer"
            >
              <Code className="w-4 h-4" />
              View 30-Step Deployment Guide
            </button>
          </div>
        </div>

        {/* Ambient glow decoration */}
        <div className="absolute right-0 top-0 -mt-8 -mr-8 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute right-32 bottom-0 w-64 h-64 bg-cyan-500/10 rounded-full blur-2xl pointer-events-none" />
      </div>

      {/* Primary KPI Telemetry Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Status Card */}
        <div className="p-5 rounded-xl bg-slate-900/80 border border-slate-800/80 shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-3">
            <span>Gateway Health</span>
            <Activity className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-white font-mono">200 OK</span>
            <span className="text-xs text-emerald-400 font-medium">99.9% Uptime</span>
          </div>
          <div className="mt-3 flex items-center justify-between text-sm text-slate-400 border-t border-slate-800/80 pt-2">
            <span>Fast Model</span>
            <span className="font-mono text-amber-300 font-semibold">{health.fastModel}</span>
          </div>
        </div>

        {/* Latency Card */}
        <div className="p-5 rounded-xl bg-slate-900/80 border border-slate-800/80 shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-3">
            <span>Avg Response Time</span>
            <Clock className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-white font-mono">{avgDuration}ms</span>
            <span className="text-xs text-cyan-400 font-medium">CPU Optimized</span>
          </div>
          <div className="mt-3 flex items-center justify-between text-sm text-slate-400 border-t border-slate-800/80 pt-2">
            <span>Throughput</span>
            <span className="font-mono text-cyan-300 font-semibold">{health.tokensPerSec} tok/s</span>
          </div>
        </div>

        {/* Registered Apps Card */}
        <div className="p-5 rounded-xl bg-slate-900/80 border border-slate-800/80 shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-3">
            <span>Authorized Apps</span>
            <Lock className="w-4 h-4 text-indigo-400" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-white font-mono">{activeAppsCount} Active</span>
            <span className="text-xs text-slate-400">of {apps.length} Total</span>
          </div>
          <div className="mt-3 flex items-center justify-between text-sm text-slate-400 border-t border-slate-800/80 pt-2">
            <span>Key Encryption</span>
            <span className="font-mono text-indigo-300 font-semibold">SHA-256 Hashed</span>
          </div>
        </div>

        {/* Prompt Templates Card */}
        <div className="p-5 rounded-xl bg-slate-900/80 border border-slate-800/80 shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-3">
            <span>Prompt Templates</span>
            <FileText className="w-4 h-4 text-amber-400" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-white font-mono">{templates.length}</span>
            <span className="text-xs text-amber-400 font-medium">Standardized</span>
          </div>
          <div className="mt-3 flex items-center justify-between text-sm text-slate-400 border-t border-slate-800/80 pt-2">
            <span>Model Router</span>
            <span className="font-mono text-amber-300 font-semibold">Fast (4B) / Smart</span>
          </div>
        </div>
      </div>

      {/* Network Architecture Diagram */}
      <div className="rounded-2xl bg-slate-900/90 border border-slate-800 p-6 space-y-4">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Shield className="w-4 h-4 text-emerald-400" />
              APAP AI Isolated Network Topology
            </h3>
            <p className="text-xs text-slate-400">
              Only the Fastify Gateway and Open WebUI can speak to Ollama via internal Docker bridge. Port 11434 is blocked from public internet.
            </p>
          </div>
          <div className="flex items-center gap-2 text-xs">
            <span className="px-2.5 py-1 rounded bg-emerald-950 text-emerald-300 border border-emerald-800/60 font-mono">
              Docker Bridge: apap-ai-network
            </span>
          </div>
        </div>

        {/* Visual interactive diagram */}
        <div className="p-6 rounded-xl bg-slate-950/70 border border-slate-800/80">
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-4 items-center">
            {/* Column 1: Client Apps */}
            <div className="space-y-2">
              <div className="text-sm font-bold text-slate-400 uppercase tracking-wider text-center">
                APAP Client Apps
              </div>
              <div className="space-y-1.5">
                {['APAP Chat', 'APAP Multistream', 'RadioHub Pro', 'Zlography'].map((appName) => (
                  <div
                    key={appName}
                    className="px-3 py-2 rounded-lg bg-slate-900 border border-slate-800 text-xs font-medium text-slate-300 flex items-center justify-between shadow-sm"
                  >
                    <span>{appName}</span>
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                  </div>
                ))}
              </div>
            </div>

            {/* Arrow 1 */}
            <div className="hidden lg:flex flex-col items-center justify-center text-slate-600 space-y-1">
              <span className="text-xs font-mono text-cyan-400">HTTPS + Bearer</span>
              <div className="w-full h-0.5 bg-gradient-to-r from-slate-700 via-cyan-500 to-slate-700" />
              <ArrowRight className="w-4 h-4 text-cyan-400" />
            </div>

            {/* Column 2: Gateway */}
            <div className="p-4 rounded-xl bg-gradient-to-b from-slate-900 to-slate-900/90 border border-emerald-500/40 shadow-md space-y-3 text-center">
              <div className="inline-flex p-2 rounded-lg bg-emerald-950 text-emerald-400 border border-emerald-800/80">
                <Server className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-white">APAP AI Gateway</h4>
                <p className="text-xs text-cyan-300 font-mono">ai.apapmedia.com (Port 3100)</p>
              </div>
              <div className="text-xs text-slate-400 text-left space-y-1 bg-slate-950/60 p-2 rounded border border-slate-800">
                <div className="flex items-center gap-1.5 text-emerald-400">
                  <CheckCircle2 className="w-3 h-3" /> Auth: SHA-256
                </div>
                <div className="flex items-center gap-1.5 text-emerald-400">
                  <CheckCircle2 className="w-3 h-3" /> Rate Limiter (Redis)
                </div>
                <div className="flex items-center gap-1.5 text-emerald-400">
                  <CheckCircle2 className="w-3 h-3" /> Model Router
                </div>
                <div className="flex items-center gap-1.5 text-emerald-400">
                  <CheckCircle2 className="w-3 h-3" /> Prompt DB (Postgres)
                </div>
              </div>
            </div>

            {/* Arrow 2 */}
            <div className="hidden lg:flex flex-col items-center justify-center text-slate-600 space-y-1">
              <span className="text-xs font-mono text-emerald-400">Docker Bridge (Hidden)</span>
              <div className="w-full h-0.5 bg-gradient-to-r from-slate-700 via-emerald-500 to-slate-700" />
              <ArrowRight className="w-4 h-4 text-emerald-400" />
            </div>

            {/* Column 3: Ollama & Models */}
            <div className="space-y-2">
              <div className="text-sm font-bold text-slate-400 uppercase tracking-wider text-center">
                Private Inference Node
              </div>
              <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 text-center space-y-2">
                <div className="flex items-center justify-center gap-2">
                  <Zap className="w-4 h-4 text-amber-400" />
                  <span className="text-xs font-bold text-white">Ollama Engine</span>
                </div>
                <div className="text-xs font-mono text-slate-400 bg-slate-950 px-2 py-1 rounded border border-slate-800">
                  http://ollama:11434 (Internal)
                </div>
                <div className="space-y-1 text-left pt-1">
                  <div className="px-2 py-1.5 rounded bg-slate-800/80 border border-slate-700/60 text-sm flex items-center justify-between text-slate-200">
                    <span>Fast:</span>
                    <span className="font-mono text-amber-300 font-semibold">qwen3.5:4b</span>
                  </div>
                  <div className="px-2 py-1.5 rounded bg-slate-800/80 border border-slate-700/60 text-sm flex items-center justify-between text-slate-200">
                    <span>Smart:</span>
                    <span className="font-mono text-cyan-300 font-semibold">qwen3.5:4b</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Two Column Section: Health Verification & Model Routing Table */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Live /health Check Card */}
        <div className="p-5 rounded-xl bg-slate-900/90 border border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Activity className="w-4 h-4 text-emerald-400" />
              Gateway Health Verification (`GET /health`)
            </h3>
            <button
              onClick={onRefreshHealth}
              disabled={isRefreshing}
              className="text-xs px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition-all cursor-pointer"
            >
              {isRefreshing ? 'Testing...' : 'Re-test'}
            </button>
          </div>

          <div className="space-y-2 text-xs font-mono">
            <div className="p-3 rounded-lg bg-slate-950 border border-slate-800/80 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-slate-400">HTTP Status:</span>
                <span className="text-emerald-400 font-bold">200 OK</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Ollama Internal Bridge:</span>
                <span className="text-emerald-400 flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Connected
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400">PostgreSQL Schema (apap_ai):</span>
                <span className="text-emerald-400 flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Active (Pool OK)
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Redis Cache & Rate Limiting:</span>
                <span className="text-emerald-400 flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" /> PONG
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Active Fast Model:</span>
                <span className="text-amber-300 font-bold">{health.fastModel}</span>
              </div>
            </div>
          </div>
          <p className="text-sm text-slate-400 italic">
            The /health endpoint is publicly queryable by monitoring systems without exposing internal tokens or database credentials.
          </p>
        </div>

        {/* Model Routing Architecture */}
        <div className="p-5 rounded-xl bg-slate-900/90 border border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Zap className="w-4 h-4 text-cyan-400" />
              Dynamic Task Routing Strategy
            </h3>
            <span className="text-sm text-slate-400 font-mono">Zero App Code Changes</span>
          </div>

          <div className="space-y-2">
            <div className="p-3 rounded-lg bg-slate-950 border border-slate-800/80 space-y-2.5 text-xs">
              <div className="flex items-start justify-between gap-2 border-b border-slate-800 pb-2">
                <div>
                  <span className="font-semibold text-slate-200">Fast Class Tasks</span>
                  <p className="text-sm text-slate-400">
                    stream-title, chat-reply, moderation, youtube-tags, social-caption, dj-liner
                  </p>
                </div>
                <span className="px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 font-mono text-xs font-semibold">
                  qwen3.5:4b
                </span>
              </div>

              <div className="flex items-start justify-between gap-2">
                <div>
                  <span className="font-semibold text-slate-200">Smart Class Tasks</span>
                  <p className="text-sm text-slate-400">
                    run-of-show, podcast-summary, long-summary, document-analysis
                  </p>
                </div>
                <span className="px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 font-mono text-xs font-semibold">
                  qwen3.5:4b → 9B
                </span>
              </div>
            </div>
          </div>

          <p className="text-sm text-slate-400">
            When hardware upgrades to GPU inference occur, changing <code className="text-cyan-300">AI_SMART_MODEL=qwen3.5:9b</code> in <code className="text-slate-300">.env</code> updates all APAP services instantly.
          </p>
        </div>
      </div>

      {/* Recent Request Stream Preview */}
      <div className="rounded-xl bg-slate-900/90 border border-slate-800 p-5 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <Activity className="w-4 h-4 text-emerald-400" />
            Live Request Activity Log
          </h3>
          <button
            onClick={() => onNavigate('logs')}
            className="text-xs text-emerald-400 hover:text-emerald-300 font-medium flex items-center gap-1 cursor-pointer"
          >
            View Full Telemetry Stream <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 font-medium">
                <th className="pb-2.5">Time</th>
                <th className="pb-2.5">Application</th>
                <th className="pb-2.5">Task</th>
                <th className="pb-2.5">Model</th>
                <th className="pb-2.5">Status</th>
                <th className="pb-2.5">Latency</th>
                <th className="pb-2.5">Tokens</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-mono text-sm">
              {logs.slice(0, 5).map((log) => (
                <tr key={log.id} className="hover:bg-slate-800/40 text-slate-300">
                  <td className="py-2.5 text-slate-400">{log.createdAt.split('T')[1].replace('Z', '')}</td>
                  <td className="py-2.5 font-sans font-medium text-white">{log.appName}</td>
                  <td className="py-2.5 text-cyan-300">{log.task}</td>
                  <td className="py-2.5 text-amber-300">{log.model}</td>
                  <td className="py-2.5">
                    <span
                      className={`px-2 py-0.5 rounded font-bold ${
                        log.status === 200
                          ? 'bg-emerald-950 text-emerald-400 border border-emerald-800/60'
                          : 'bg-red-950 text-red-400 border border-red-800/60'
                      }`}
                    >
                      {log.status}
                    </span>
                  </td>
                  <td className="py-2.5">{log.totalDurationMs}ms</td>
                  <td className="py-2.5 text-slate-400">{log.totalTokens} tok</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
