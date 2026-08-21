import React, { useState } from 'react';
import { AppEntity } from '../types';
import { generateRawApiKey, sha256Hex } from '../services/aiEngine';
import {
  Key,
  Plus,
  Shield,
  Trash2,
  RefreshCw,
  Copy,
  Check,
  AlertTriangle,
  Lock,
  Zap,
  Sliders,
  CheckCircle2,
  XCircle,
  Eye,
  EyeOff,
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface AppsViewProps {
  apps: AppEntity[];
  onAddApp: (app: AppEntity) => void;
  onUpdateApp: (app: AppEntity) => void;
  onDeleteApp: (id: string) => void;
}

export const AppsView: React.FC<AppsViewProps> = ({
  apps,
  onAddApp,
  onUpdateApp,
  onDeleteApp,
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newAppName, setNewAppName] = useState('');
  const [newAppSlug, setNewAppSlug] = useState('');
  const [newAppDescription, setNewAppDescription] = useState('');
  const [newRateLimit, setNewRateLimit] = useState(60);

  // One-time reveal key state
  const [createdKeyData, setCreatedKeyData] = useState<{
    appName: string;
    rawKey: string;
    hash: string;
  } | null>(null);

  const [copiedKey, setCopiedKey] = useState(false);
  const [simulatedRateLimitAppId, setSimulatedRateLimitAppId] = useState<string | null>(null);

  const handleNameChange = (name: string) => {
    setNewAppName(name);
    setNewAppSlug(
      name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '')
    );
  };

  const handleCreateApp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAppName.trim()) return;

    const { rawKey, prefix } = generateRawApiKey();
    const hash = await sha256Hex(rawKey);

    const newApp: AppEntity = {
      id: crypto.randomUUID(),
      name: newAppName.trim(),
      slug: newAppSlug.trim() || `app-${Date.now()}`,
      apiKeyHash: hash,
      apiKeyPrefix: prefix,
      active: true,
      rateLimitPerMinute: newRateLimit,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      totalRequests: 0,
      description: newAppDescription.trim() || 'Custom APAP application client.',
      lastActiveAt: 'Just created',
    };

    onAddApp(newApp);
    setCreatedKeyData({
      appName: newApp.name,
      rawKey,
      hash,
    });

    setNewAppName('');
    setNewAppSlug('');
    setNewAppDescription('');
    setNewRateLimit(60);
    setIsModalOpen(false);

    confetti({
      particleCount: 50,
      spread: 70,
      origin: { y: 0.6 },
    });
  };

  const handleToggleActive = (app: AppEntity) => {
    onUpdateApp({
      ...app,
      active: !app.active,
      updatedAt: new Date().toISOString(),
    });
  };

  const handleRegenerateKey = async (app: AppEntity) => {
    if (!confirm(`Are you sure you want to regenerate the API key for ${app.name}? The old key will immediately stop working.`)) {
      return;
    }

    const { rawKey, prefix } = generateRawApiKey();
    const hash = await sha256Hex(rawKey);

    onUpdateApp({
      ...app,
      apiKeyHash: hash,
      apiKeyPrefix: prefix,
      updatedAt: new Date().toISOString(),
    });

    setCreatedKeyData({
      appName: app.name,
      rawKey,
      hash,
    });
  };

  const copyKeyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(true);
    setTimeout(() => setCopiedKey(false), 2500);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header & Provision Button */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Key className="w-5 h-5 text-indigo-400" />
            Registered Applications & API Keys
          </h2>
          <p className="text-xs text-slate-400">
            Database schema: <code className="text-cyan-400 font-mono">apap_ai.apps</code>. Keys are stored as SHA-256 hashes and checked on every incoming request.
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="inline-flex items-center gap-2 px-3.5 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow-md shadow-emerald-950/40 transition-all cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          Provision New Application
        </button>
      </div>

      {/* One-Time Raw Key Reveal Alert Modal */}
      {createdKeyData && (
        <div className="p-5 rounded-xl bg-amber-950/40 border border-amber-500/60 shadow-lg space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-amber-300 font-bold text-sm">
              <AlertTriangle className="w-5 h-5 text-amber-400" />
              <span>Copy Your Raw API Key for {createdKeyData.appName}</span>
            </div>
            <button
              onClick={() => setCreatedKeyData(null)}
              className="text-xs text-amber-400/80 hover:text-amber-200 cursor-pointer font-semibold"
            >
              Dismiss
            </button>
          </div>

          <p className="text-xs text-amber-200/90 leading-relaxed">
            <strong>Security Warning:</strong> This raw API key is displayed ONCE. Store it in your consuming application's <code className="font-mono bg-amber-950/80 px-1 py-0.5 rounded">.env</code> file immediately. APAP AI only stores the cryptographic SHA-256 hash.
          </p>

          <div className="flex items-center gap-2 bg-slate-950 p-2.5 rounded-lg border border-amber-600/50">
            <code className="flex-1 font-mono text-xs text-emerald-400 select-all overflow-x-auto">
              {createdKeyData.rawKey}
            </code>
            <button
              onClick={() => copyKeyToClipboard(createdKeyData.rawKey)}
              className="px-3 py-1.5 rounded bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer shrink-0"
            >
              {copiedKey ? (
                <>
                  <Check className="w-3.5 h-3.5 text-white" /> Copied!
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" /> Copy Key
                </>
              )}
            </button>
          </div>

          <div className="text-sm font-mono text-slate-400">
            SHA-256 DB Hash: <span className="text-slate-300">{createdKeyData.hash}</span>
          </div>
        </div>
      )}

      {/* Security Architecture Principle */}
      <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 flex items-start gap-3">
        <div className="p-2 rounded-lg bg-indigo-950/80 text-indigo-400 border border-indigo-800/80 shrink-0">
          <Shield className="w-4 h-4" />
        </div>
        <div className="text-xs space-y-1">
          <span className="font-bold text-slate-200">Zero Raw Key Storage Principle</span>
          <p className="text-slate-400 leading-relaxed">
            All API keys follow the <code className="text-emerald-400 font-mono">apapai_live_...</code> format. When a request hits the Gateway, Fastify extracts the Bearer token, calculates its SHA-256 digest in milliseconds, and looks up the active application in PostgreSQL.
          </p>
        </div>
      </div>

      {/* Apps Table */}
      <div className="rounded-xl bg-slate-900/90 border border-slate-800 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-950/80 border-b border-slate-800 text-slate-400 font-medium">
              <tr>
                <th className="py-3 px-4">Application Name</th>
                <th className="py-3 px-4">Slug & Key Prefix</th>
                <th className="py-3 px-4">Rate Limit</th>
                <th className="py-3 px-4">Total Requests</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {apps.map((app) => (
                <tr key={app.id} className="hover:bg-slate-800/40 transition-colors">
                  <td className="py-3.5 px-4">
                    <div className="font-semibold text-white">{app.name}</div>
                    <div className="text-sm text-slate-400">{app.description}</div>
                  </td>
                  <td className="py-3.5 px-4 font-mono text-sm">
                    <div className="text-cyan-300 font-bold">{app.slug}</div>
                    <div className="text-slate-400">{app.apiKeyPrefix}</div>
                  </td>
                  <td className="py-3.5 px-4 font-mono">
                    <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                      {app.rateLimitPerMinute} req/min
                    </span>
                  </td>
                  <td className="py-3.5 px-4 font-mono text-slate-300">
                    {app.totalRequests.toLocaleString()}
                  </td>
                  <td className="py-3.5 px-4">
                    <button
                      onClick={() => handleToggleActive(app)}
                      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-sm font-semibold transition-all cursor-pointer ${
                        app.active
                          ? 'bg-emerald-950 text-emerald-400 border border-emerald-800/80'
                          : 'bg-red-950 text-red-400 border border-red-800/80'
                      }`}
                    >
                      {app.active ? (
                        <>
                          <CheckCircle2 className="w-3 h-3" /> Active
                        </>
                      ) : (
                        <>
                          <XCircle className="w-3 h-3" /> Disabled
                        </>
                      )}
                    </button>
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <div className="inline-flex items-center gap-2">
                      <button
                        onClick={() => handleRegenerateKey(app)}
                        className="p-1.5 rounded hover:bg-slate-800 text-slate-400 hover:text-cyan-300 transition-all cursor-pointer"
                        title="Regenerate API Key"
                      >
                        <RefreshCw className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => onDeleteApp(app.id)}
                        className="p-1.5 rounded hover:bg-slate-800 text-slate-400 hover:text-red-400 transition-all cursor-pointer"
                        title="Delete application"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Provision Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 w-full max-w-lg shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Key className="w-5 h-5 text-emerald-400" />
                Provision Application Key
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-white cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateApp} className="space-y-4 text-xs">
              <div className="space-y-1.5">
                <label className="text-slate-300 font-medium">Application Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. APAP Events Portal"
                  value={newAppName}
                  onChange={(e) => handleNameChange(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 text-slate-100 px-3 py-2 rounded-lg focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-slate-300 font-medium">Slug Identifier</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. apap-events-portal"
                  value={newAppSlug}
                  onChange={(e) => setNewAppSlug(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 text-slate-100 px-3 py-2 rounded-lg font-mono focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-slate-300 font-medium">Description</label>
                <textarea
                  rows={2}
                  placeholder="Describe the application role and workload..."
                  value={newAppDescription}
                  onChange={(e) => setNewAppDescription(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 text-slate-100 px-3 py-2 rounded-lg focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-slate-300 font-medium">Rate Limit (Per Minute)</label>
                  <span className="font-mono text-emerald-400 font-bold">{newRateLimit} req/min</span>
                </div>
                <input
                  type="range"
                  min="10"
                  max="300"
                  step="10"
                  value={newRateLimit}
                  onChange={(e) => setNewRateLimit(Number(e.target.value))}
                  className="w-full accent-emerald-500"
                />
                <div className="flex justify-between text-xs text-slate-500 font-mono">
                  <span>10 / min</span>
                  <span>60 / min (Standard)</span>
                  <span>300 / min</span>
                </div>
              </div>

              <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 text-sm text-slate-400 leading-relaxed">
                Upon creation, a fresh 32-character random key (<code className="text-emerald-400">apapai_live_...</code>) will be generated. The raw key is shown only once and its SHA-256 hash is written to <code className="text-slate-200">apap_ai.apps</code>.
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold cursor-pointer"
                >
                  Generate Key & Register App
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
