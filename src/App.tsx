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
import { LoginView } from './components/LoginView';

import {
  INITIAL_HEALTH,
  INITIAL_APPS,
  INITIAL_TEMPLATES,
  INITIAL_LOGS,
  DEPLOYMENT_STEPS,
} from './data/initialData';
import { AppEntity, PromptTemplate, RequestLog, DeploymentStep, ServerHealth, UserRole } from './types';

export function App() {
  const [apiKey, setApiKey] = useState<string>('');
  const [role, setRole] = useState<UserRole | null>(null);
  const [userName, setUserName] = useState<string>('');
  const [isAuthChecking, setIsAuthChecking] = useState<boolean>(true);
  const [activeTab, setActiveTab] = useState<NavTab>('dashboard');
  const [health, setHealth] = useState<ServerHealth>(INITIAL_HEALTH);
  const [isRefreshingHealth, setIsRefreshingHealth] = useState<boolean>(false);
  const [apps, setApps] = useState<AppEntity[]>(INITIAL_APPS);
  const [templates, setTemplates] = useState<PromptTemplate[]>(INITIAL_TEMPLATES);
  const [logs, setLogs] = useState<RequestLog[]>(INITIAL_LOGS);
  const [deploymentSteps, setDeploymentSteps] = useState<DeploymentStep[]>(DEPLOYMENT_STEPS);

  const roleTabs: Record<UserRole, NavTab[]> = {
    administrator: ['dashboard', 'playground', 'apps', 'templates', 'logs', 'ecosystem', 'admin-chat', 'deployment'],
    engineer: ['dashboard', 'playground', 'apps', 'templates', 'logs', 'deployment'],
    'broadcast-operator': ['dashboard', 'playground', 'templates', 'ecosystem'],
    'community-moderator': ['dashboard', 'playground', 'logs', 'admin-chat'],
    'standard-user': ['playground'],
  };

  const isTabAllowed = (tab: NavTab, r: UserRole | null) => {
    if (!r) return false;
    return roleTabs[r].includes(tab);
  };

  const loadDashboardData = async (key: string) => {
    try {
      const endpoints: { url: string; setter: (data: any) => void }[] = [
        { url: '/health', setter: (data) => setHealth(data as ServerHealth) },
        { url: '/v1/apps', setter: (data) => setApps(data as AppEntity[]) },
        { url: '/v1/templates', setter: (data) => setTemplates(data as PromptTemplate[]) },
        { url: '/v1/logs', setter: (data) => setLogs(data as RequestLog[]) },
      ];
      const results = await Promise.all(
        endpoints.map((e) =>
          fetch(e.url, { headers: { Authorization: `Bearer ${key}` } }).then((res) => ({ res, setter: e.setter }))
        )
      );
      for (const { res, setter } of results) {
        if (res.ok) {
          const data = await res.json();
          setter(data);
        }
      }
    } catch (err) {
      console.error('Failed to load dashboard data', err);
    }
  };

  const handleLogin = (newKey: string, newRole: UserRole, name: string) => {
    setApiKey(newKey);
    setRole(newRole);
    setUserName(name);
    localStorage.setItem('apapai_dashboard_key', newKey);
    localStorage.setItem('apapai_dashboard_role', newRole);
    localStorage.setItem('apapai_dashboard_name', name);
    const allowed = roleTabs[newRole];
    setActiveTab(allowed.includes(activeTab) ? activeTab : allowed[0]);
    loadDashboardData(newKey);
  };

  const handleLogout = () => {
    setApiKey('');
    setRole(null);
    setUserName('');
    localStorage.removeItem('apapai_dashboard_key');
    localStorage.removeItem('apapai_dashboard_role');
    localStorage.removeItem('apapai_dashboard_name');
  };

  // Restore session on mount and validate the stored key
  useEffect(() => {
    const checkAuth = async () => {
      const storedKey = localStorage.getItem('apapai_dashboard_key');
      if (!storedKey) {
        setIsAuthChecking(false);
        return;
      }
      try {
        const res = await fetch('/v1/auth/whoami', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${storedKey}`,
          },
        });
        if (res.ok) {
          const data = (await res.json()) as { id: string; name: string; role: UserRole };
          setApiKey(storedKey);
          setRole(data.role);
          setUserName(data.name);
          const allowed = roleTabs[data.role];
          setActiveTab(allowed.includes(activeTab) ? activeTab : allowed[0]);
          loadDashboardData(storedKey);
        } else {
          localStorage.removeItem('apapai_dashboard_key');
        }
      } catch (err) {
        console.error('Auth check failed', err);
      } finally {
        setIsAuthChecking(false);
      }
    };

    checkAuth();

    const healthInterval = setInterval(async () => {
      if (!apiKey) return;
      try {
        const res = await fetch('/health', { headers: { Authorization: `Bearer ${apiKey}` } });
        if (res.ok) {
          const data = (await res.json()) as ServerHealth;
          setHealth(data);
        }
      } catch {
        // ignore polling errors
      }
    }, 5000);

    return () => clearInterval(healthInterval);
  }, [apiKey]);

  const handleRefreshHealth = async () => {
    if (!apiKey) return;
    setIsRefreshingHealth(true);
    try {
      const res = await fetch('/health', { headers: { Authorization: `Bearer ${apiKey}` } });
      if (res.ok) {
        const data = (await res.json()) as ServerHealth;
        setHealth(data);
      }
    } catch (err) {
      console.error('Failed to refresh health', err);
    } finally {
      setIsRefreshingHealth(false);
    }
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

  if (isAuthChecking) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center text-slate-400">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
          <span className="text-sm">Checking session...</span>
        </div>
      </div>
    );
  }

  if (!role) {
    return <LoginView onLogin={handleLogin} />;
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-50 flex flex-col antialiased selection:bg-emerald-500 selection:text-slate-950 font-sans">
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
          role={role}
          appsCount={apps.length}
          templatesCount={templates.length}
          logsCount={logs.length}
        />

        <main className="flex-1 overflow-y-auto p-6 lg:p-10 max-w-8xl mx-auto w-full">
          {activeTab === 'dashboard' && isTabAllowed('dashboard', role) && (
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

          {activeTab === 'playground' && isTabAllowed('playground', role) && (
            <PlaygroundView
              apps={apps}
              templates={templates}
              apiKey={apiKey}
              onLogRequest={handleLogRequest}
            />
          )}

          {activeTab === 'apps' && isTabAllowed('apps', role) && (
            <AppsView
              apps={apps}
              onAddApp={handleAddApp}
              onUpdateApp={handleUpdateApp}
              onDeleteApp={handleDeleteApp}
            />
          )}

          {activeTab === 'templates' && isTabAllowed('templates', role) && (
            <TemplatesView
              templates={templates}
              onAddTemplate={handleAddTemplate}
              onUpdateTemplate={handleUpdateTemplate}
              onDeleteTemplate={handleDeleteTemplate}
              onSendToPlayground={handleSendToPlayground}
            />
          )}

          {activeTab === 'logs' && isTabAllowed('logs', role) && (
            <LogsView logs={logs} apps={apps} />
          )}

          {activeTab === 'ecosystem' && isTabAllowed('ecosystem', role) && (
            <EcosystemDemosView
              apps={apps}
              templates={templates}
              apiKey={apiKey}
              onLogRequest={handleLogRequest}
            />
          )}

          {activeTab === 'admin-chat' && isTabAllowed('admin-chat', role) && <AdminChatView />}

          {activeTab === 'deployment' && isTabAllowed('deployment', role) && (
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
