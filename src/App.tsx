import React, { useState, useEffect } from 'react';
import { NavTab, Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { DashboardView } from './components/DashboardView';
import { PlaygroundView } from './components/PlaygroundView';
import { AppsView } from './components/AppsView';
import { TemplatesView } from './components/TemplatesView';
import { LogsView } from './components/LogsView';
import { EcosystemDemosView } from './components/EcosystemDemosView';
import { AdminChatView } from './components/AdminChatView';
import { DeploymentView } from './components/DeploymentView';

import {
  INITIAL_HEALTH,
  INITIAL_APPS,
  INITIAL_TEMPLATES,
  INITIAL_LOGS,
  DEPLOYMENT_STEPS,
} from './data/initialData';
import { AppEntity, PromptTemplate, RequestLog, DeploymentStep, ServerHealth } from './types';

export function App() {
  const [activeTab, setActiveTab] = useState<NavTab>('dashboard');
  const [health, setHealth] = useState<ServerHealth>(INITIAL_HEALTH);
  const [isRefreshingHealth, setIsRefreshingHealth] = useState<boolean>(false);
  const [apps, setApps] = useState<AppEntity[]>(INITIAL_APPS);
  const [templates, setTemplates] = useState<PromptTemplate[]>(INITIAL_TEMPLATES);
  const [logs, setLogs] = useState<RequestLog[]>(INITIAL_LOGS);
  const [deploymentSteps, setDeploymentSteps] = useState<DeploymentStep[]>(DEPLOYMENT_STEPS);

  // Subtle telemetry simulation heartbeat
  useEffect(() => {
    const interval = setInterval(() => {
      setHealth((prev) => {
        const cpuJitter = +(20 + Math.random() * 8).toFixed(1);
        const ramJitter = +(4.7 + Math.random() * 0.3).toFixed(1);
        const tokJitter = +(36 + Math.random() * 6).toFixed(1);
        const latJitter = Math.round(1350 + Math.random() * 150);

        return {
          ...prev,
          cpuUsagePct: cpuJitter,
          ramUsageGb: {
            used: ramJitter,
            total: prev.ramUsageGb.total,
          },
          tokensPerSec: tokJitter,
          avgLatencyMs: latJitter,
          uptimeSeconds: prev.uptimeSeconds + 3,
        };
      });
    }, 4000);

    return () => clearInterval(interval);
  }, []);

  const handleRefreshHealth = () => {
    setIsRefreshingHealth(true);
    setTimeout(() => {
      setHealth((prev) => ({
        ...prev,
        status: 'ok',
        ollama: true,
        database: true,
        redis: true,
        avgLatencyMs: Math.round(1100 + Math.random() * 200),
      }));
      setIsRefreshingHealth(false);
    }, 600);
  };

  const handleAddApp = (newApp: AppEntity) => {
    setApps((prev) => [newApp, ...prev]);
  };

  const handleUpdateApp = (updatedApp: AppEntity) => {
    setApps((prev) => prev.map((a) => (a.id === updatedApp.id ? updatedApp : a)));
  };

  const handleDeleteApp = (id: string) => {
    setApps((prev) => prev.filter((a) => a.id !== id));
  };

  const handleAddTemplate = (newTmpl: PromptTemplate) => {
    setTemplates((prev) => [newTmpl, ...prev]);
  };

  const handleUpdateTemplate = (updatedTmpl: PromptTemplate) => {
    setTemplates((prev) => prev.map((t) => (t.id === updatedTmpl.id ? updatedTmpl : t)));
  };

  const handleDeleteTemplate = (id: string) => {
    setTemplates((prev) => prev.filter((t) => t.id !== id));
  };

  const handleLogRequest = (newLog: RequestLog) => {
    setLogs((prev) => [newLog, ...prev]);
    // increment app total count
    setApps((prev) =>
      prev.map((app) =>
        app.id === newLog.appId
          ? { ...app, totalRequests: app.totalRequests + 1, lastActiveAt: 'Just now' }
          : app
      )
    );
  };

  const handleToggleDeploymentStep = (id: number) => {
    setDeploymentSteps((prev) =>
      prev.map((step) =>
        step.id === id
          ? { ...step, status: step.status === 'completed' ? 'pending' : 'completed' }
          : step
      )
    );
  };

  const handleSendToPlayground = (taskName: string) => {
    setActiveTab('playground');
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col antialiased selection:bg-emerald-500 selection:text-slate-950 font-sans">
      {/* Global Header */}
      <Header
        health={health}
        activeTab={activeTab}
        onRefreshHealth={handleRefreshHealth}
        isRefreshing={isRefreshingHealth}
      />

      {/* App Body with Sidebar */}
      <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
        <Sidebar
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          appsCount={apps.length}
          templatesCount={templates.length}
          logsCount={logs.length}
        />

        <main className="flex-1 overflow-y-auto p-4 lg:p-8 max-w-7xl mx-auto w-full">
          {activeTab === 'dashboard' && (
            <DashboardView
              health={health}
              apps={apps}
              templates={templates}
              logs={logs}
              onNavigate={setActiveTab}
              onRefreshHealth={handleRefreshHealth}
              isRefreshing={isRefreshingHealth}
            />
          )}

          {activeTab === 'playground' && (
            <PlaygroundView
              apps={apps}
              templates={templates}
              onLogRequest={handleLogRequest}
            />
          )}

          {activeTab === 'apps' && (
            <AppsView
              apps={apps}
              onAddApp={handleAddApp}
              onUpdateApp={handleUpdateApp}
              onDeleteApp={handleDeleteApp}
            />
          )}

          {activeTab === 'templates' && (
            <TemplatesView
              templates={templates}
              onAddTemplate={handleAddTemplate}
              onUpdateTemplate={handleUpdateTemplate}
              onDeleteTemplate={handleDeleteTemplate}
              onSendToPlayground={handleSendToPlayground}
            />
          )}

          {activeTab === 'logs' && (
            <LogsView logs={logs} apps={apps} />
          )}

          {activeTab === 'ecosystem' && (
            <EcosystemDemosView
              apps={apps}
              templates={templates}
              onLogRequest={handleLogRequest}
            />
          )}

          {activeTab === 'admin-chat' && <AdminChatView />}

          {activeTab === 'deployment' && (
            <DeploymentView
              deploymentSteps={deploymentSteps}
              onToggleStep={handleToggleDeploymentStep}
            />
          )}
        </main>
      </div>
    </div>
  );
}

export default App;
