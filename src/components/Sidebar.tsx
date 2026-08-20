import React from 'react';
import {
  LayoutDashboard,
  Terminal,
  Key,
  FileCode,
  ListFilter,
  Layers,
  MessageSquare,
  BookOpen,
  Server,
  ShieldAlert,
  Radio,
  Share2,
} from 'lucide-react';

export type NavTab =
  | 'dashboard'
  | 'playground'
  | 'apps'
  | 'templates'
  | 'logs'
  | 'ecosystem'
  | 'admin-chat'
  | 'deployment';

interface SidebarProps {
  activeTab: NavTab;
  setActiveTab: (tab: NavTab) => void;
  appsCount: number;
  templatesCount: number;
  logsCount: number;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  setActiveTab,
  appsCount,
  templatesCount,
  logsCount,
}) => {
  const navItems: {
    id: NavTab;
    label: string;
    icon: React.ComponentType<{ className?: string }>;
    badge?: string | number;
    badgeColor?: string;
    section?: string;
  }[] = [
    {
      id: 'dashboard',
      label: 'Gateway Overview',
      icon: LayoutDashboard,
      section: 'Core Server',
    },
    {
      id: 'playground',
      label: 'API Playground (/v1)',
      icon: Terminal,
      badge: 'Live',
      badgeColor: 'bg-cyan-900/80 text-cyan-300 border border-cyan-700/60',
    },
    {
      id: 'apps',
      label: 'Apps & API Keys',
      icon: Key,
      badge: appsCount,
      badgeColor: 'bg-slate-800 text-slate-300 border border-slate-700',
    },
    {
      id: 'templates',
      label: 'Prompt Templates',
      icon: FileCode,
      badge: templatesCount,
      badgeColor: 'bg-slate-800 text-slate-300 border border-slate-700',
    },
    {
      id: 'logs',
      label: 'Request Telemetry',
      icon: ListFilter,
      badge: logsCount,
      badgeColor: 'bg-emerald-950 text-emerald-400 border border-emerald-800/80',
    },
    {
      id: 'ecosystem',
      label: 'APAP App Integrations',
      icon: Share2,
      badge: '4 Demos',
      badgeColor: 'bg-amber-950 text-amber-300 border border-amber-800/70',
      section: 'Applications & UI',
    },
    {
      id: 'admin-chat',
      label: 'Open WebUI (Admin)',
      icon: MessageSquare,
      badge: 'ai-admin',
      badgeColor: 'bg-purple-950 text-purple-300 border border-purple-800/70',
    },
    {
      id: 'deployment',
      label: 'Deployment & Configs',
      icon: BookOpen,
      badge: '30 Steps',
      badgeColor: 'bg-blue-950 text-blue-300 border border-blue-800/70',
      section: 'DevOps & Rollout',
    },
  ];

  return (
    <aside className="w-full md:w-64 bg-slate-900/95 border-r border-slate-800 flex flex-col shrink-0">
      <div className="p-3 space-y-6 flex-1">
        <div>
          <div className="text-[11px] font-semibold tracking-wider text-slate-500 uppercase px-3 mb-2">
            Gateway Engine
          </div>
          <div className="space-y-1">
            {navItems.slice(0, 5).map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                    isActive
                      ? 'bg-emerald-600/20 text-emerald-300 border border-emerald-500/40 shadow-sm'
                      : 'text-slate-300 hover:bg-slate-800/80 hover:text-white'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Icon
                      className={`w-4 h-4 ${
                        isActive ? 'text-emerald-400' : 'text-slate-400'
                      }`}
                    />
                    <span>{item.label}</span>
                  </div>
                  {item.badge !== undefined && (
                    <span
                      className={`text-[10px] font-mono font-semibold px-2 py-0.5 rounded-full ${
                        item.badgeColor || 'bg-slate-800 text-slate-400'
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        <div>
          <div className="text-[11px] font-semibold tracking-wider text-slate-500 uppercase px-3 mb-2">
            Client Apps & UI
          </div>
          <div className="space-y-1">
            {navItems.slice(5, 7).map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                    isActive
                      ? 'bg-emerald-600/20 text-emerald-300 border border-emerald-500/40 shadow-sm'
                      : 'text-slate-300 hover:bg-slate-800/80 hover:text-white'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Icon
                      className={`w-4 h-4 ${
                        isActive ? 'text-emerald-400' : 'text-slate-400'
                      }`}
                    />
                    <span>{item.label}</span>
                  </div>
                  {item.badge !== undefined && (
                    <span
                      className={`text-[10px] font-mono font-semibold px-2 py-0.5 rounded-full ${
                        item.badgeColor || 'bg-slate-800 text-slate-400'
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        <div>
          <div className="text-[11px] font-semibold tracking-wider text-slate-500 uppercase px-3 mb-2">
            Infrastructure & Guide
          </div>
          <div className="space-y-1">
            {navItems.slice(7).map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                    isActive
                      ? 'bg-emerald-600/20 text-emerald-300 border border-emerald-500/40 shadow-sm'
                      : 'text-slate-300 hover:bg-slate-800/80 hover:text-white'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Icon
                      className={`w-4 h-4 ${
                        isActive ? 'text-emerald-400' : 'text-slate-400'
                      }`}
                    />
                    <span>{item.label}</span>
                  </div>
                  {item.badge !== undefined && (
                    <span
                      className={`text-[10px] font-mono font-semibold px-2 py-0.5 rounded-full ${
                        item.badgeColor || 'bg-slate-800 text-slate-400'
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Footer Host Information */}
      <div className="p-3 border-t border-slate-800 bg-slate-950/60">
        <div className="rounded-lg p-2.5 bg-slate-900 border border-slate-800 text-[11px] text-slate-400 space-y-1.5">
          <div className="flex items-center justify-between text-slate-300 font-medium">
            <span>Primary Host</span>
            <span className="text-emerald-400 font-mono">127.0.0.1:3100</span>
          </div>
          <div className="flex items-center justify-between text-[10px]">
            <span>Model Engine</span>
            <span className="font-mono text-cyan-300">Ollama (Bridge)</span>
          </div>
          <div className="flex items-center justify-between text-[10px]">
            <span>Database</span>
            <span className="font-mono text-indigo-300">apap_ai (PG)</span>
          </div>
        </div>
      </div>
    </aside>
  );
};
