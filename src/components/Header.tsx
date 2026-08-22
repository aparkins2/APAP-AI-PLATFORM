import React from 'react';
import { ServerHealth, UserRole } from '../types';
import { Server, Activity, ShieldCheck, Cpu, HardDrive, Zap, Radio, LogOut, UserCircle2 } from 'lucide-react';

interface HeaderProps {
  health: ServerHealth;
  activeTab: string;
  onRefreshHealth: () => void;
  isRefreshing: boolean;
  userName?: string;
  role?: UserRole | null;
  onLogout?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  health,
  activeTab,
  onRefreshHealth,
  isRefreshing,
  userName,
  role,
  onLogout,
}) => {
  return (
    <header className="bg-slate-900/90 backdrop-blur-md border-b border-slate-800 sticky top-0 z-40 px-4 lg:px-6 py-3.5 flex flex-wrap items-center justify-between gap-4">
      {/* Brand & Identity */}
      <div className="flex items-center gap-3">
        <div className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 via-teal-500 to-cyan-500 shadow-lg shadow-emerald-500/20">
          <Server className="w-5 h-5 text-white" />
          <span className="absolute -top-1 -right-1 flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
          </span>
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-base font-bold text-white tracking-tight flex items-center gap-1.5">
              APAP AI Server
              <span className="text-xs uppercase font-semibold px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-400 border border-emerald-800/80">
                Gateway v1.0
              </span>
            </h1>
          </div>
          <p className="text-xs text-slate-400 flex items-center gap-2">
            <span className="text-cyan-400 font-mono">ai.apapmedia.com</span>
            <span className="text-slate-600">•</span>
            <span>Self-Hosted Media AI Platform</span>
          </p>
        </div>
      </div>

      {/* Telemetry Status Bar */}
      <div className="flex items-center flex-wrap gap-2 text-xs">
        {/* Model Badge */}
        <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-slate-800/80 border border-slate-700/70 text-slate-300">
          <Zap className="w-3.5 h-3.5 text-amber-400" />
          <span className="text-slate-400">Fast Model:</span>
          <span className="font-mono font-semibold text-amber-300">{health.fastModel}</span>
        </div>

        {/* System Load */}
        <div className="hidden md:flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-slate-800/80 border border-slate-700/70 text-slate-300">
          <Cpu className="w-3.5 h-3.5 text-cyan-400" />
          <span className="text-slate-400">CPU:</span>
          <span className="font-mono text-cyan-300">{health.cpuUsagePct}%</span>
        </div>

        {/* RAM Usage */}
        <div className="hidden lg:flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-slate-800/80 border border-slate-700/70 text-slate-300">
          <HardDrive className="w-3.5 h-3.5 text-indigo-400" />
          <span className="text-slate-400">RAM:</span>
          <span className="font-mono text-indigo-300">{health.ramUsageGb.used} / {health.ramUsageGb.total} GB</span>
        </div>

        {/* Health Status Indicator */}
        <button
          onClick={onRefreshHealth}
          disabled={isRefreshing}
          title="Click to ping /health endpoint"
          className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-emerald-950/70 hover:bg-emerald-900/60 border border-emerald-700/50 text-emerald-300 transition-all cursor-pointer"
        >
          <Activity className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin text-emerald-400' : 'text-emerald-400'}`} />
          <span className="font-medium font-mono text-xs">
            {isRefreshing ? 'Pinging /health...' : 'Gateway Healthy (200 OK)'}
          </span>
          <span className="text-xs text-emerald-400/80 bg-emerald-900/50 px-1.5 py-0.5 rounded font-mono">
            {health.avgLatencyMs}ms
          </span>
        </button>

        {/* Ollama Protected Notice */}
        <div className="hidden xl:flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-slate-800/80 border border-slate-700/70 text-slate-300">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
          <span className="text-slate-400">Ollama Port 11434:</span>
          <span className="text-emerald-400 font-semibold">Private & Secured</span>
        </div>

        {/* Signed-in User & Logout */}
        {userName && (
          <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-slate-800/80 border border-slate-700/70 text-slate-300">
            <UserCircle2 className="w-3.5 h-3.5 text-cyan-400" />
            <span className="font-semibold text-white">{userName}</span>
            {role && (
              <span className="text-xs capitalize text-slate-400">({role.replace(/-/g, ' ')})</span>
            )}
          </div>
        )}
        {onLogout && (
          <button
            onClick={onLogout}
            title="Sign out of the dashboard"
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-red-950/60 hover:bg-red-900/60 border border-red-800/60 text-red-300 transition-all cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span className="font-medium text-xs">Logout</span>
          </button>
        )}
      </div>
    </header>
  );
};
