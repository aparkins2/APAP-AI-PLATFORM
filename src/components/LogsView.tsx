import React, { useState } from 'react';
import { RequestLog, AppEntity } from '../types';
import {
  ListFilter,
  Search,
  Download,
  Clock,
  Zap,
  Activity,
  ShieldAlert,
  ChevronRight,
  Database,
  Layers,
  ArrowUpDown,
} from 'lucide-react';

interface LogsViewProps {
  logs: RequestLog[];
  apps: AppEntity[];
}

export const LogsView: React.FC<LogsViewProps> = ({ logs, apps }) => {
  const [selectedApp, setSelectedApp] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [inspectingLog, setInspectingLog] = useState<RequestLog | null>(null);

  const filteredLogs = logs.filter((log) => {
    const matchesApp = selectedApp === 'all' || log.appId === selectedApp;
    const matchesStatus =
      selectedStatus === 'all' || String(log.status) === selectedStatus;
    const matchesSearch =
      log.task.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.appName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.requestId.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesApp && matchesStatus && matchesSearch;
  });

  const totalTokens = logs.reduce((acc, l) => acc + l.totalTokens, 0);
  const avgLatency =
    logs.length > 0
      ? Math.round(logs.reduce((acc, l) => acc + l.totalDurationMs, 0) / logs.length)
      : 0;
  const successCount = logs.filter((l) => l.status === 200).length;
  const successRate = logs.length > 0 ? ((successCount / logs.length) * 100).toFixed(1) : '100';

  const exportLogsAsJson = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(logs, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `apap_ai_requests_${new Date().toISOString().slice(0, 10)}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <ListFilter className="w-5 h-5 text-emerald-400" />
            Request Telemetry & Performance Logs
          </h2>
          <p className="text-xs text-slate-400">
            Database schema: <code className="text-cyan-400 font-mono">apap_ai.requests</code>. High-resolution inference latency metrics without retaining sensitive user prompts.
          </p>
        </div>

        <button
          onClick={exportLogsAsJson}
          className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-semibold transition-all cursor-pointer"
        >
          <Download className="w-3.5 h-3.5" />
          Export JSON Telemetry
        </button>
      </div>

      {/* KPI Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800">
          <span className="text-xs text-slate-400">Total Logged Requests</span>
          <div className="text-2xl font-bold text-white font-mono mt-1">{logs.length}</div>
          <div className="text-sm text-emerald-400 mt-1">100% gateway captured</div>
        </div>

        <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800">
          <span className="text-xs text-slate-400">Success Rate</span>
          <div className="text-2xl font-bold text-emerald-400 font-mono mt-1">{successRate}%</div>
          <div className="text-sm text-slate-400 mt-1">{successCount} successful calls</div>
        </div>

        <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800">
          <span className="text-xs text-slate-400">Avg Inference Latency</span>
          <div className="text-2xl font-bold text-cyan-300 font-mono mt-1">{avgLatency} ms</div>
          <div className="text-sm text-cyan-400/80 mt-1">qwen3.5:4b on CPU VPS</div>
        </div>

        <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800">
          <span className="text-xs text-slate-400">Total Token Volume</span>
          <div className="text-2xl font-bold text-amber-300 font-mono mt-1">
            {totalTokens.toLocaleString()}
          </div>
          <div className="text-sm text-slate-400 mt-1">Zero third-party API fee</div>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="flex items-center justify-between flex-wrap gap-3 bg-slate-900/90 p-3 rounded-xl border border-slate-800">
        <div className="flex items-center flex-wrap gap-2 text-xs">
          {/* App Filter */}
          <div className="flex items-center gap-1.5">
            <span className="text-slate-400">Application:</span>
            <select
              value={selectedApp}
              onChange={(e) => setSelectedApp(e.target.value)}
              className="bg-slate-950 border border-slate-700 text-slate-200 px-2.5 py-1 rounded-lg text-xs"
            >
              <option value="all">All Applications</option>
              {apps.map((app) => (
                <option key={app.id} value={app.id}>
                  {app.name}
                </option>
              ))}
            </select>
          </div>

          {/* Status Filter */}
          <div className="flex items-center gap-1.5">
            <span className="text-slate-400">HTTP Status:</span>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="bg-slate-950 border border-slate-700 text-slate-200 px-2.5 py-1 rounded-lg text-xs"
            >
              <option value="all">All Statuses</option>
              <option value="200">200 OK</option>
              <option value="401">401 Unauthorized</option>
              <option value="403">403 Forbidden</option>
              <option value="429">429 Rate Limited</option>
            </select>
          </div>
        </div>

        {/* Search */}
        <div className="relative w-full sm:w-60">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2" />
          <input
            type="text"
            placeholder="Search task or request ID..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 text-slate-200 pl-8 pr-3 py-1 rounded-lg text-xs focus:outline-none focus:border-emerald-500"
          />
        </div>
      </div>

      {/* Logs Table */}
      <div className="rounded-xl bg-slate-900/90 border border-slate-800 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-950/80 border-b border-slate-800 text-slate-400 font-medium font-mono text-sm">
              <tr>
                <th className="py-3 px-4">Timestamp</th>
                <th className="py-3 px-4">Application</th>
                <th className="py-3 px-4">Task</th>
                <th className="py-3 px-4">Model Class</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Total Latency</th>
                <th className="py-3 px-4">Tokens (In/Out)</th>
                <th className="py-3 px-4 text-right">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-mono text-sm">
              {filteredLogs.map((log) => (
                <tr
                  key={log.id}
                  onClick={() => setInspectingLog(log)}
                  className="hover:bg-slate-800/50 transition-colors cursor-pointer"
                >
                  <td className="py-3 px-4 text-slate-400">
                    {log.createdAt.replace('T', ' ').replace('Z', '')}
                  </td>
                  <td className="py-3 px-4 font-sans font-medium text-white">{log.appName}</td>
                  <td className="py-3 px-4 text-cyan-300 font-bold">{log.task}</td>
                  <td className="py-3 px-4">
                    <span
                      className={`px-2 py-0.5 rounded text-xs ${
                        log.modelClass === 'smart'
                          ? 'bg-purple-950 text-purple-300'
                          : 'bg-emerald-950 text-emerald-300'
                      }`}
                    >
                      {log.model}
                    </span>
                  </td>
                  <td className="py-3 px-4">
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
                  <td className="py-3 px-4 text-slate-200 font-bold">{log.totalDurationMs} ms</td>
                  <td className="py-3 px-4 text-slate-400">
                    <span className="text-slate-300">{log.promptTokens}</span> /{' '}
                    <span className="text-amber-300">{log.completionTokens}</span>
                  </td>
                  <td className="py-3 px-4 text-right">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setInspectingLog(log);
                      }}
                      className="p-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300"
                    >
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Inspect Log Drawer / Modal */}
      {inspectingLog && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 w-full max-w-2xl shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <Activity className="w-4 h-4 text-emerald-400" />
                  Request Inspector: {inspectingLog.task}
                </h3>
                <div className="text-sm font-mono text-slate-400">
                  ID: {inspectingLog.requestId}
                </div>
              </div>
              <button
                onClick={() => setInspectingLog(null)}
                className="text-slate-400 hover:text-white cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* High Resolution Duration Breakdown */}
            <div className="space-y-2">
              <span className="text-xs font-bold text-slate-200">Ollama Internal Nanosecond Breakdown</span>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs font-mono">
                <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800">
                  <span className="text-xs text-slate-400">Total Duration:</span>
                  <div className="text-white font-bold">{inspectingLog.totalDurationMs} ms</div>
                </div>
                <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800">
                  <span className="text-xs text-slate-400">Load Time:</span>
                  <div className="text-cyan-300 font-bold">{inspectingLog.loadDurationMs} ms</div>
                </div>
                <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800">
                  <span className="text-xs text-slate-400">Prompt Eval:</span>
                  <div className="text-indigo-300 font-bold">{inspectingLog.promptEvalDurationMs} ms</div>
                </div>
                <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800">
                  <span className="text-xs text-slate-400">Eval (Gen):</span>
                  <div className="text-amber-300 font-bold">{inspectingLog.evalDurationMs} ms</div>
                </div>
              </div>
            </div>

            {/* Token Economy */}
            <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 flex items-center justify-between text-xs font-mono">
              <span className="text-slate-400">Token Economy:</span>
              <div className="flex gap-4">
                <span>
                  Prompt: <strong className="text-slate-200">{inspectingLog.promptTokens}</strong>
                </span>
                <span>
                  Completion: <strong className="text-amber-300">{inspectingLog.completionTokens}</strong>
                </span>
                <span>
                  Total: <strong className="text-emerald-400">{inspectingLog.totalTokens}</strong>
                </span>
              </div>
            </div>

            {/* Summaries */}
            {inspectingLog.inputPayloadSummary && (
              <div className="space-y-1">
                <span className="text-xs font-bold text-slate-300">Input Variables Summary</span>
                <pre className="p-2.5 rounded bg-slate-950 border border-slate-800 text-sm font-mono text-slate-300 whitespace-pre-wrap">
                  {inspectingLog.inputPayloadSummary}
                </pre>
              </div>
            )}

            {inspectingLog.outputSummary && (
              <div className="space-y-1">
                <span className="text-xs font-bold text-slate-300">Generated Output Snippet</span>
                <pre className="p-2.5 rounded bg-slate-950 border border-slate-800 text-sm font-mono text-emerald-300 whitespace-pre-wrap max-h-48 overflow-y-auto">
                  {inspectingLog.outputSummary}
                </pre>
              </div>
            )}

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setInspectingLog(null)}
                className="px-4 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-white text-xs cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
