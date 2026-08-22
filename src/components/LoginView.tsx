import React, { useState } from 'react';
import { ShieldCheck, Terminal, AlertCircle } from 'lucide-react';
import type { UserRole } from '../types';

interface LoginViewProps {
  onLogin: (apiKey: string, role: UserRole, name: string) => void;
}

export const LoginView: React.FC<LoginViewProps> = ({ onLogin }) => {
  const [apiKey, setApiKey] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async () => {
    if (!apiKey.trim()) {
      setError('Please enter an API key.');
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch('/v1/auth/whoami', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey.trim()}`,
        },
      });
      const contentType = res.headers.get('content-type') || '';
      const data = contentType.includes('application/json') ? await res.json() : { error: `HTTP ${res.status}` };
      if (!res.ok || !data.role) {
        setError(data.error || 'Invalid API key.');
        return;
      }
      onLogin(apiKey.trim(), data.role, data.name);
    } catch (err: any) {
      setError(err.message || 'Network error. Is the gateway connected?');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-6">
      <div className="w-full max-w-md rounded-2xl bg-slate-900 border border-slate-800 p-8 shadow-2xl shadow-black/40">
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
            <ShieldCheck className="w-6 h-6 text-emerald-400" />
          </div>
          <h1 className="text-2xl font-bold text-white">APAP AI Gateway</h1>
        </div>
        <p className="text-sm text-slate-400 mb-6">
          Enter your dashboard API key to access the workspace.
        </p>

        <div className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-slate-300 flex items-center gap-2">
              <Terminal className="w-3.5 h-3.5 text-cyan-400" />
              API Key
            </label>
            <input
              type="password"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
              placeholder="apapai_live_..."
              className="w-full bg-slate-950 border border-slate-700 text-slate-200 px-4 py-3 rounded-xl text-sm font-mono focus:outline-none focus:border-emerald-500 placeholder:text-slate-600"
            />
          </div>

          {error && (
            <div className="flex items-start gap-2 text-sm text-red-300 bg-red-950/30 border border-red-800/60 rounded-lg px-3 py-2">
              <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <button
            onClick={handleLogin}
            disabled={isLoading}
            className="w-full py-3 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-sm flex items-center justify-center gap-2 transition-all disabled:opacity-50"
          >
            {isLoading ? 'Verifying...' : 'Sign In to Dashboard'}
          </button>
        </div>

        <div className="mt-6 pt-5 border-t border-slate-800 text-xs text-slate-500 space-y-2">
          <p>Standard users are limited to the API Playground only.</p>
          <p>Administrators have full access to all views and settings.</p>
        </div>
      </div>
    </div>
  );
};
