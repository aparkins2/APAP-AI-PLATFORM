import React, { useState } from 'react';
import { DeploymentStep } from '../types';
import { SERVER_SNIPPETS } from '../data/codeSnippets';
import {
  BookOpen,
  CheckCircle2,
  Copy,
  Check,
  Terminal,
  FileCode,
  Layers,
  Download,
  ExternalLink,
  Shield,
  Server,
  Cpu,
  Database,
  Lock,
  Zap,
  Globe,
  HardDrive,
  Sparkles,
  ArrowRight,
  CloudLightning,
} from 'lucide-react';

interface DeploymentViewProps {
  deploymentSteps: DeploymentStep[];
  onToggleStep: (id: number) => void;
}

export const DeploymentView: React.FC<DeploymentViewProps> = ({
  deploymentSteps,
  onToggleStep,
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'interserver' | 'guide' | 'snippets' | 'roadmap'>('interserver');
  const [selectedSnippetId, setSelectedSnippetId] = useState<string>('coolify-compose');
  const [copiedSnippet, setCopiedSnippet] = useState<string | null>(null);
  const [stepFilter, setStepFilter] = useState<string>('all');

  const selectedSnippet =
    SERVER_SNIPPETS.find((s) => s.id === selectedSnippetId) || SERVER_SNIPPETS[0];

  const copyText = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedSnippet(id);
    setTimeout(() => setCopiedSnippet(null), 2000);
  };

  const completedStepsCount = deploymentSteps.filter((s) => s.status === 'completed').length;
  const progressPct = Math.round((completedStepsCount / deploymentSteps.length) * 100);

  const filteredSteps = deploymentSteps.filter((s) => {
    if (stepFilter === 'all') return true;
    return s.category.toLowerCase() === stepFilter.toLowerCase();
  });

  const downloadInstallGuide = () => {
    const guideSnippet = SERVER_SNIPPETS.find((s) => s.id === 'interserver-script');
    const content = `# APAP AI Server - InterServer VPS & Coolify Deployment Guide\n\nTarget Domains: ai.apapmedia.com & ai-admin.apapmedia.com\n\nRun the quick installer on Ubuntu 22.04/24.04:\ncurl -fsSL https://cdn.coollabs.io/coolify/install.sh | bash\n\nRefer to repository file: COOLIFY_INTERSERVER_INSTALL_GUIDE.md for complete 8-phase instructions.`;
    
    const blob = new Blob([content], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'COOLIFY_INTERSERVER_INSTALL_GUIDE.md';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Top Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Server className="w-5 h-5 text-blue-400" />
            InterServer VPS, Coolify & Deployment Hub
          </h2>
          <p className="text-xs text-slate-400">
            Automated installation and configuration for Docker & Coolify on InterServer VPS at <code className="text-cyan-400 font-mono">ai.apapmedia.com</code>.
          </p>
        </div>

        {/* Subtab Toggle */}
        <div className="flex items-center gap-1 bg-slate-900 p-1 rounded-xl border border-slate-800 text-xs flex-wrap">
          <button
            onClick={() => setActiveSubTab('interserver')}
            className={`px-3 py-1.5 rounded-lg font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
              activeSubTab === 'interserver'
                ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <CloudLightning className="w-3.5 h-3.5" />
            InterServer + Coolify Guide
          </button>
          <button
            onClick={() => setActiveSubTab('guide')}
            className={`px-3 py-1.5 rounded-lg font-semibold transition-all cursor-pointer ${
              activeSubTab === 'guide'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            30-Step Checklist ({completedStepsCount}/{deploymentSteps.length})
          </button>
          <button
            onClick={() => setActiveSubTab('snippets')}
            className={`px-3 py-1.5 rounded-lg font-semibold transition-all cursor-pointer ${
              activeSubTab === 'snippets'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Config Files (Compose / Dockerfile)
          </button>
          <button
            onClick={() => setActiveSubTab('roadmap')}
            className={`px-3 py-1.5 rounded-lg font-semibold transition-all cursor-pointer ${
              activeSubTab === 'roadmap'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Architecture Roadmap
          </button>
        </div>
      </div>

      {/* 0. INTERSERVER VPS & COOLIFY STEP-BY-STEP SPECIALIZED GUIDE */}
      {activeSubTab === 'interserver' && (
        <div className="space-y-6">
          {/* Quick Actions Card */}
          <div className="p-5 rounded-2xl bg-gradient-to-r from-slate-900 via-slate-900 to-blue-950/40 border border-slate-800 space-y-4">
            <div className="flex items-center justify-between flex-wrap gap-3">
              <div>
                <span className="text-xs font-bold text-blue-400 uppercase tracking-wider flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5" /> Production Deployment Package Ready
                </span>
                <h3 className="text-base font-bold text-white mt-1">
                  Deploy to InterServer VPS with Coolify in 4 Quick Phases
                </h3>
                <p className="text-xs text-slate-300 max-w-2xl mt-1">
                  Self-host private Ollama LLM models (<code className="text-cyan-300">qwen3.5:4b</code>, <code className="text-cyan-300">gemma3:4b</code>, <code className="text-cyan-300">qwen3.5:9b</code>) on an isolated Docker network with automated SSL certificates and zero API fees.
                </p>
              </div>

              <button
                onClick={downloadInstallGuide}
                className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold flex items-center gap-2 shadow-lg cursor-pointer transition-all shrink-0"
              >
                <Download className="w-4 h-4" />
                Download COOLIFY_INSTALL_GUIDE.md
              </button>
            </div>

            {/* Architecture Highlights */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-2">
              <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800">
                <div className="text-sm text-slate-400 flex items-center gap-1.5">
                  <Globe className="w-3.5 h-3.5 text-emerald-400" /> Gateway Domain
                </div>
                <div className="text-xs font-mono font-bold text-white mt-1">ai.apapmedia.com</div>
                <div className="text-xs text-emerald-400 mt-0.5">Traefik Port 3000 (SSL Auto)</div>
              </div>

              <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800">
                <div className="text-sm text-slate-400 flex items-center gap-1.5">
                  <Shield className="w-3.5 h-3.5 text-purple-400" /> Admin Interface
                </div>
                <div className="text-xs font-mono font-bold text-white mt-1">ai-admin.apapmedia.com</div>
                <div className="text-xs text-purple-400 mt-0.5">Open WebUI Port 8080</div>
              </div>

              <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800">
                <div className="text-sm text-slate-400 flex items-center gap-1.5">
                  <Lock className="w-3.5 h-3.5 text-amber-400" /> Ollama Security
                </div>
                <div className="text-xs font-mono font-bold text-white mt-1">http://ollama:11434</div>
                <div className="text-xs text-amber-400 mt-0.5">0 Exposed Public Ports</div>
              </div>

              <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800">
                <div className="text-sm text-slate-400 flex items-center gap-1.5">
                  <HardDrive className="w-3.5 h-3.5 text-cyan-400" /> VPS Hardware
                </div>
                <div className="text-xs font-mono font-bold text-white mt-1">4-8 vCPU / 8-16 GB RAM</div>
                <div className="text-xs text-cyan-400 mt-0.5">8 GB Swapfile Configured</div>
              </div>
            </div>
          </div>

          {/* Step-by-Step InterServer Execution Cards */}
          <div className="space-y-4">
            {/* Step 1: VPS Setup & Swap */}
            <div className="p-5 rounded-xl bg-slate-900 border border-slate-800 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-blue-600 text-white text-xs font-bold flex items-center justify-center">
                    1
                  </span>
                  <h4 className="text-sm font-bold text-white">
                    Phase 1: InterServer VPS Provisioning & System Hardening (SSH)
                  </h4>
                </div>
                <span className="text-sm text-slate-400 font-mono">Ubuntu 22.04 / 24.04 LTS</span>
              </div>
              <p className="text-xs text-slate-300">
                Connect via SSH as <code className="text-cyan-300">root</code> and execute the automated InterServer setup script (or run commands manually to configure UFW firewall and 8GB swap):
              </p>

              <div className="relative">
                <pre className="bg-slate-950 p-3 rounded-lg border border-slate-800 font-mono text-xs text-emerald-300 overflow-x-auto">
{`# 1. Update system packages
apt update && apt upgrade -y
apt install -y curl wget git htop ufw jq net-tools

# 2. Configure 8GB Swap space for CPU inference stability
fallocate -l 8G /swapfile && chmod 600 /swapfile && mkswap /swapfile && swapon /swapfile
echo '/swapfile none swap sw 0 0' >> /etc/fstab

# 3. Configure UFW Firewall (Never expose 11434 to public)
ufw default deny incoming && ufw default allow outgoing
ufw allow 22/tcp && ufw allow 80/tcp && ufw allow 443/tcp && ufw allow 8000/tcp
ufw --force enable`}
                </pre>
                <button
                  onClick={() =>
                    copyText(
                      `apt update && apt upgrade -y\napt install -y curl wget git htop ufw jq net-tools\nfallocate -l 8G /swapfile && chmod 600 /swapfile && mkswap /swapfile && swapon /swapfile\necho '/swapfile none swap sw 0 0' >> /etc/fstab\nufw default deny incoming && ufw default allow outgoing\nufw allow 22/tcp && ufw allow 80/tcp && ufw allow 443/tcp && ufw allow 8000/tcp\nufw --force enable`,
                      'step1-cmd'
                    )
                  }
                  className="absolute top-2 right-2 p-1.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs cursor-pointer"
                  title="Copy commands"
                >
                  {copiedSnippet === 'step1-cmd' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>

            {/* Step 2: Install Coolify */}
            <div className="p-5 rounded-xl bg-slate-900 border border-slate-800 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-blue-600 text-white text-xs font-bold flex items-center justify-center">
                    2
                  </span>
                  <h4 className="text-sm font-bold text-white">
                    Phase 2: Install Coolify via 1-Line Installer
                  </h4>
                </div>
                <span className="text-sm text-slate-400 font-mono">Port 8000</span>
              </div>
              <p className="text-xs text-slate-300">
                Run Coolify's official automated script to install Docker Engine, Traefik Reverse Proxy, and the Coolify Dashboard:
              </p>

              <div className="relative">
                <pre className="bg-slate-950 p-3 rounded-lg border border-slate-800 font-mono text-xs text-cyan-300 overflow-x-auto">
{`curl -fsSL https://cdn.coollabs.io/coolify/install.sh | bash`}
                </pre>
                <button
                  onClick={() => copyText(`curl -fsSL https://cdn.coollabs.io/coolify/install.sh | bash`, 'step2-cmd')}
                  className="absolute top-2 right-2 p-1.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs cursor-pointer"
                >
                  {copiedSnippet === 'step2-cmd' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              </div>
              <div className="text-sm text-slate-400">
                After completion, navigate to <code className="text-white font-mono">http://&lt;YOUR_VPS_IP&gt;:8000</code> in your browser to create the Root Admin Account.
              </div>
            </div>

            {/* Step 3: DNS Records Setup */}
            <div className="p-5 rounded-xl bg-slate-900 border border-slate-800 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-blue-600 text-white text-xs font-bold flex items-center justify-center">
                    3
                  </span>
                  <h4 className="text-sm font-bold text-white">
                    Phase 3: DNS Records Configuration
                  </h4>
                </div>
                <span className="text-sm text-slate-400">DNS Management Console</span>
              </div>
              <p className="text-xs text-slate-300">
                Point your domain DNS A records to your InterServer VPS IP address:
              </p>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="bg-slate-950 border-b border-slate-800 font-mono text-sm text-slate-400">
                    <tr>
                      <th className="p-2.5">Subdomain</th>
                      <th className="p-2.5">Type</th>
                      <th className="p-2.5">Target Value</th>
                      <th className="p-2.5">Coolify Service</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60 font-mono text-sm">
                    <tr>
                      <td className="p-2.5 text-white font-bold">ai.apapmedia.com</td>
                      <td className="p-2.5 text-blue-400">A</td>
                      <td className="p-2.5 text-slate-300">&lt;YOUR_INTERSERVER_VPS_IP&gt;</td>
                      <td className="p-2.5 text-emerald-400">APAP Gateway & Dashboard</td>
                    </tr>
                    <tr>
                      <td className="p-2.5 text-white font-bold">ai-admin.apapmedia.com</td>
                      <td className="p-2.5 text-blue-400">A</td>
                      <td className="p-2.5 text-slate-300">&lt;YOUR_INTERSERVER_VPS_IP&gt;</td>
                      <td className="p-2.5 text-purple-400">Open WebUI Admin Chat</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* Step 4: Deploy in Coolify & Pull Models */}
            <div className="p-5 rounded-xl bg-slate-900 border border-slate-800 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-blue-600 text-white text-xs font-bold flex items-center justify-center">
                    4
                  </span>
                  <h4 className="text-sm font-bold text-white">
                    Phase 4: Create Coolify Docker Compose Resource & Pull LLM Models
                  </h4>
                </div>
                <span className="text-sm text-emerald-400 font-mono">1-Click Deploy</span>
              </div>
              <p className="text-xs text-slate-300">
                1. In Coolify: <strong>Projects</strong> &rarr; <strong>+ Add Project</strong> &rarr; <strong>+ New Resource</strong> &rarr; Select <strong>Docker Compose</strong>.  
                2. Paste the content of <code className="text-cyan-300">docker-compose.coolify.yml</code> (found in Config Files tab).  
                3. Click <strong>Deploy</strong>.  
                4. SSH into your VPS and pull the target open-weights models into the persistent Docker volume:
              </p>

              <div className="relative">
                <pre className="bg-slate-950 p-3 rounded-lg border border-slate-800 font-mono text-xs text-amber-300 overflow-x-auto">
{`# Pull fast model (qwen3.5:4b ~2.6 GB)
docker exec -it apap-ollama ollama pull qwen3.5:4b

# Pull alternative fast model (gemma3:4b ~3.3 GB)
docker exec -it apap-ollama ollama pull gemma3:4b

# Pull smart model (qwen3.5:9b ~5.8 GB)
docker exec -it apap-ollama ollama pull qwen3.5:9b

# Verify installed models
docker exec -it apap-ollama ollama list`}
                </pre>
                <button
                  onClick={() =>
                    copyText(
                      `docker exec -it apap-ollama ollama pull qwen3.5:4b\ndocker exec -it apap-ollama ollama pull gemma3:4b\ndocker exec -it apap-ollama ollama pull qwen3.5:9b\ndocker exec -it apap-ollama ollama list`,
                      'step4-cmd'
                    )
                  }
                  className="absolute top-2 right-2 p-1.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs cursor-pointer"
                >
                  {copiedSnippet === 'step4-cmd' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 1. STEP-BY-STEP CHECKLIST */}
      {activeSubTab === 'guide' && (
        <div className="space-y-4">
          {/* Progress Bar */}
          <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-slate-200">Rollout Progress</span>
              <span className="font-mono text-blue-400 font-bold">
                {completedStepsCount} of {deploymentSteps.length} Steps Completed ({progressPct}%)
              </span>
            </div>
            <div className="w-full bg-slate-950 rounded-full h-2 overflow-hidden border border-slate-800">
              <div
                className="bg-gradient-to-r from-blue-500 to-emerald-500 h-2 rounded-full transition-all duration-500"
                style={{ width: `${progressPct}%` }}
              />
            </div>
          </div>

          {/* Category Filter */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
            {['all', 'Infrastructure', 'Models', 'Gateway', 'Database', 'Security', 'Verification'].map(
              (cat) => (
                <button
                  key={cat}
                  onClick={() => setStepFilter(cat)}
                  className={`px-3 py-1 rounded-lg capitalize transition-all cursor-pointer shrink-0 ${
                    stepFilter === cat
                      ? 'bg-blue-600 text-white font-bold'
                      : 'bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800'
                  }`}
                >
                  {cat}
                </button>
              )
            )}
          </div>

          {/* Steps List */}
          <div className="space-y-3">
            {filteredSteps.map((step) => {
              const isDone = step.status === 'completed';
              return (
                <div
                  key={step.id}
                  className={`p-4 rounded-xl border transition-all space-y-3 ${
                    isDone
                      ? 'bg-slate-900/90 border-slate-800'
                      : 'bg-slate-900/50 border-slate-800/60'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3">
                      <button
                        onClick={() => onToggleStep(step.id)}
                        className={`mt-0.5 w-5 h-5 rounded flex items-center justify-center transition-all cursor-pointer ${
                          isDone
                            ? 'bg-emerald-600 text-white shadow-sm'
                            : 'bg-slate-800 border border-slate-700 text-transparent hover:border-slate-500'
                        }`}
                      >
                        <Check className="w-3.5 h-3.5" />
                      </button>

                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-xs font-bold text-blue-400">
                            STEP {step.id}
                          </span>
                          <span className="text-xs font-bold text-white">{step.title}</span>
                          <span className="text-xs px-2 py-0.5 rounded bg-slate-800 text-slate-400 border border-slate-700">
                            {step.category}
                          </span>
                        </div>
                        <p className="text-xs text-slate-300 mt-1">{step.description}</p>
                      </div>
                    </div>
                  </div>

                  {/* Command or Code */}
                  {step.command && (
                    <div className="relative">
                      <pre className="bg-slate-950 p-2.5 rounded-lg border border-slate-800 font-mono text-sm text-cyan-300 overflow-x-auto">
                        {step.command}
                      </pre>
                      <button
                        onClick={() => copyText(step.command!, `cmd-${step.id}`)}
                        className="absolute top-1.5 right-1.5 p-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs cursor-pointer"
                        title="Copy command"
                      >
                        {copiedSnippet === `cmd-${step.id}` ? (
                          <Check className="w-3 h-3 text-emerald-400" />
                        ) : (
                          <Copy className="w-3 h-3" />
                        )}
                      </button>
                    </div>
                  )}

                  {step.codeBlock && (
                    <div className="relative">
                      <pre className="bg-slate-950 p-3 rounded-lg border border-slate-800 font-mono text-sm text-slate-300 overflow-x-auto max-h-48 leading-relaxed">
                        {step.codeBlock}
                      </pre>
                      <button
                        onClick={() => copyText(step.codeBlock!, `code-${step.id}`)}
                        className="absolute top-2 right-2 p-1.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs cursor-pointer"
                        title="Copy code"
                      >
                        {copiedSnippet === `code-${step.id}` ? (
                          <Check className="w-3.5 h-3.5 text-emerald-400" />
                        ) : (
                          <Copy className="w-3.5 h-3.5" />
                        )}
                      </button>
                    </div>
                  )}

                  {step.verificationCheck && (
                    <div className="text-sm text-slate-400 flex items-center gap-1.5 font-mono">
                      <span className="text-emerald-400">✓ Verification Check:</span>
                      <span>{step.verificationCheck}</span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 2. SERVER CONFIG FILES */}
      {activeSubTab === 'snippets' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* File Selector */}
          <div className="lg:col-span-4 space-y-2">
            <div className="text-xs font-bold text-slate-400 uppercase tracking-wider px-1">
              Configuration & Deployment Files
            </div>
            <div className="space-y-1">
              {SERVER_SNIPPETS.map((snippet) => (
                <button
                  key={snippet.id}
                  onClick={() => setSelectedSnippetId(snippet.id)}
                  className={`w-full text-left p-3 rounded-xl border text-xs transition-all cursor-pointer ${
                    selectedSnippetId === snippet.id
                      ? 'bg-slate-800 border-blue-500/80 text-white shadow-sm'
                      : 'bg-slate-900/80 border-slate-800 text-slate-300 hover:bg-slate-800/60'
                  }`}
                >
                  <div className="font-semibold text-slate-100">{snippet.name}</div>
                  <div className="font-mono text-xs text-blue-300 mt-0.5">{snippet.filename}</div>
                  <div className="text-xs text-slate-400 mt-1">{snippet.category}</div>
                </button>
              ))}
            </div>
          </div>

          {/* File Code Viewer */}
          <div className="lg:col-span-8 space-y-3">
            <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between">
              <div>
                <h4 className="text-sm font-bold text-white font-mono">{selectedSnippet.filename}</h4>
                <p className="text-xs text-slate-400">{selectedSnippet.description}</p>
              </div>
              <button
                onClick={() => copyText(selectedSnippet.content, selectedSnippet.id)}
                className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-md"
              >
                {copiedSnippet === selectedSnippet.id ? (
                  <>
                    <Check className="w-3.5 h-3.5" /> Copied!
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" /> Copy File Content
                  </>
                )}
              </button>
            </div>

            <div className="rounded-xl bg-slate-950 border border-slate-800 p-4 font-mono text-xs text-slate-200 overflow-x-auto max-h-[520px] leading-relaxed">
              <pre>{selectedSnippet.content}</pre>
            </div>
          </div>
        </div>
      )}

      {/* 3. ARCHITECTURE ROADMAP */}
      {activeSubTab === 'roadmap' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-5 rounded-xl bg-slate-900 border border-slate-800 space-y-3">
              <div className="p-2 w-fit rounded-lg bg-emerald-950 text-emerald-400 border border-emerald-800">
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-white text-sm">Phase 1: InterServer MVP (Current)</h3>
              <ul className="text-xs text-slate-300 space-y-1.5 list-disc pl-4">
                <li>InterServer CPU VPS deployment (qwen3.5:4b)</li>
                <li>Private Ollama bridge on apap-ai-network</li>
                <li>Coolify automatic SSL & Traefik routing</li>
                <li>Prompt template registry with 10 templates</li>
                <li>Per-app rate limiting via Redis</li>
              </ul>
            </div>

            <div className="p-5 rounded-xl bg-slate-900 border border-slate-800 space-y-3">
              <div className="p-2 w-fit rounded-lg bg-cyan-950 text-cyan-400 border border-cyan-800">
                <Zap className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-white text-sm">Phase 2: BullMQ Async Queues</h3>
              <ul className="text-xs text-slate-300 space-y-1.5 list-disc pl-4">
                <li>Redis BullMQ async job queues</li>
                <li>Server-Sent Events (SSE) streaming output</li>
                <li>Multi-task batch metadata generation</li>
                <li>APAP Chat automated sentiment analysis</li>
              </ul>
            </div>

            <div className="p-5 rounded-xl bg-slate-900 border border-slate-800 space-y-3">
              <div className="p-2 w-fit rounded-lg bg-purple-950 text-purple-400 border border-purple-800">
                <Database className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-white text-sm">Phase 3: RAG & GPU Migration</h3>
              <ul className="text-xs text-slate-300 space-y-1.5 list-disc pl-4">
                <li>PostgreSQL pgvector semantic search</li>
                <li>Embedding model: qwen3-embedding:0.6b</li>
                <li>Dedicated GPU node migration (9B/14B models)</li>
                <li>Local Whisper speech-to-text transcription</li>
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
