import React, { useState } from 'react';
import { PromptTemplate, ModelClass } from '../types';
import {
  FileCode,
  Plus,
  Search,
  Zap,
  Sliders,
  Play,
  Edit2,
  Trash2,
  Check,
  Copy,
  Layers,
  Sparkles,
} from 'lucide-react';

interface TemplatesViewProps {
  templates: PromptTemplate[];
  onAddTemplate: (tmpl: PromptTemplate) => void;
  onUpdateTemplate: (tmpl: PromptTemplate) => void;
  onDeleteTemplate: (id: string) => void;
  onSendToPlayground: (taskName: string) => void;
}

export const TemplatesView: React.FC<TemplatesViewProps> = ({
  templates,
  onAddTemplate,
  onUpdateTemplate,
  onDeleteTemplate,
  onSendToPlayground,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [editingTemplate, setEditingTemplate] = useState<PromptTemplate | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState<boolean>(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // New Template Form State
  const [formName, setFormName] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [formSystemPrompt, setFormSystemPrompt] = useState('');
  const [formUserTemplate, setFormUserTemplate] = useState('');
  const [formModelClass, setFormModelClass] = useState<ModelClass>('fast');
  const [formTemperature, setFormTemperature] = useState(0.3);
  const [formMaxTokens, setFormMaxTokens] = useState(1000);
  const [formCategory, setFormCategory] = useState<any>('streaming');

  // Filter templates
  const filteredTemplates = templates.filter((tmpl) => {
    const matchesCategory = selectedCategory === 'all' || tmpl.category === selectedCategory;
    const matchesSearch =
      tmpl.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tmpl.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tmpl.systemPrompt.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const extractVariables = (templateStr: string): string[] => {
    const matches = templateStr.match(/\{\{\s*([a-zA-Z0-9_]+)\s*\}\}/g);
    if (!matches) return [];
    return Array.from(new Set(matches.map((m) => m.replace(/[\{\}\s]/g, ''))));
  };

  const handleCreateTemplate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim()) return;

    const slugName = formName.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    const variables = extractVariables(formUserTemplate);

    const newTmpl: PromptTemplate = {
      id: `tmpl-${Date.now()}`,
      name: slugName,
      description: formDescription,
      systemPrompt: formSystemPrompt,
      userPromptTemplate: formUserTemplate,
      modelClass: formModelClass,
      temperature: formTemperature,
      maxTokens: formMaxTokens,
      active: true,
      variables: variables.length > 0 ? variables : ['topic', 'guest'],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      category: formCategory,
    };

    onAddTemplate(newTmpl);
    setIsCreateModalOpen(false);
    resetForm();
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingTemplate) return;

    const variables = extractVariables(editingTemplate.userPromptTemplate);
    onUpdateTemplate({
      ...editingTemplate,
      variables,
      updatedAt: new Date().toISOString(),
    });
    setEditingTemplate(null);
  };

  const resetForm = () => {
    setFormName('');
    setFormDescription('');
    setFormSystemPrompt('');
    setFormUserTemplate('');
    setFormModelClass('fast');
    setFormTemperature(0.3);
    setFormMaxTokens(1000);
    setFormCategory('streaming');
  };

  const copyTemplateSystem = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Top Bar */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <FileCode className="w-5 h-5 text-amber-400" />
            Prompt Template Registry
          </h2>
          <p className="text-xs text-slate-400">
            Database schema: <code className="text-cyan-400 font-mono">apap_ai.templates</code>. Standardizes prompts centrally so consuming apps never hard-code raw LLM system prompts.
          </p>
        </div>

        <button
          onClick={() => {
            resetForm();
            setIsCreateModalOpen(true);
          }}
          className="inline-flex items-center gap-2 px-3.5 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow-md shadow-emerald-950/40 transition-all cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          Create Prompt Template
        </button>
      </div>

      {/* Category Pills & Search */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
          {[
            { id: 'all', label: 'All Templates' },
            { id: 'streaming', label: 'Livestreaming' },
            { id: 'chat', label: 'APAP Chat' },
            { id: 'moderation', label: 'Moderation & Safety' },
            { id: 'radio', label: 'RadioHub Pro' },
            { id: 'production', label: 'Run of Show / Production' },
          ].map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer shrink-0 ${
                selectedCategory === cat.id
                  ? 'bg-amber-500 text-slate-950 font-bold shadow-sm'
                  : 'bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Search Input */}
        <div className="relative w-full sm:w-64">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search templates or prompts..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-900 border border-slate-800 text-slate-200 pl-8 pr-3 py-1.5 rounded-lg text-xs focus:outline-none focus:border-amber-500"
          />
        </div>
      </div>

      {/* Templates Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredTemplates.map((tmpl) => (
          <div
            key={tmpl.id}
            className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 hover:border-slate-700 transition-all flex flex-col justify-between space-y-4 shadow-sm"
          >
            <div className="space-y-2.5">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <h3 className="font-mono text-sm font-bold text-amber-300 flex items-center gap-1.5">
                    {tmpl.name}
                  </h3>
                  <span className="text-xs uppercase font-semibold text-slate-400 tracking-wider">
                    {tmpl.category}
                  </span>
                </div>
                <span
                  className={`px-2 py-0.5 rounded font-mono text-xs font-bold ${
                    tmpl.modelClass === 'smart'
                      ? 'bg-purple-950 text-purple-300 border border-purple-800/70'
                      : 'bg-emerald-950 text-emerald-300 border border-emerald-800/70'
                  }`}
                >
                  {tmpl.modelClass.toUpperCase()}
                </span>
              </div>

              <p className="text-xs text-slate-300 line-clamp-2">{tmpl.description}</p>

              {/* System Prompt Preview */}
              <div className="bg-slate-950 p-2.5 rounded-lg border border-slate-800/80 text-sm font-mono text-slate-400 relative">
                <div className="line-clamp-3 leading-relaxed">{tmpl.systemPrompt}</div>
                <button
                  onClick={() => copyTemplateSystem(tmpl.systemPrompt, tmpl.id)}
                  className="absolute top-1.5 right-1.5 p-1 rounded bg-slate-800/80 hover:bg-slate-700 text-slate-300 text-xs cursor-pointer"
                  title="Copy system prompt"
                >
                  {copiedId === tmpl.id ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                </button>
              </div>

              {/* Variables */}
              <div className="flex flex-wrap items-center gap-1">
                <span className="text-xs text-slate-500 font-medium mr-1">Variables:</span>
                {tmpl.variables.map((v) => (
                  <span
                    key={v}
                    className="px-1.5 py-0.5 rounded bg-slate-800 text-cyan-300 font-mono text-xs border border-slate-700"
                  >
                    {`{{${v}}}`}
                  </span>
                ))}
              </div>
            </div>

            {/* Bottom Actions */}
            <div className="flex items-center justify-between pt-3 border-t border-slate-800/80 text-xs">
              <div className="text-xs text-slate-400 font-mono">
                Temp: <span className="text-slate-200">{tmpl.temperature}</span> • Max:{' '}
                <span className="text-slate-200">{tmpl.maxTokens}</span>
              </div>

              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => onSendToPlayground(tmpl.name)}
                  className="px-2.5 py-1 rounded bg-emerald-950 hover:bg-emerald-900 border border-emerald-700/60 text-emerald-300 text-sm font-semibold flex items-center gap-1 cursor-pointer"
                  title="Test template in sandbox playground"
                >
                  <Play className="w-3 h-3" /> Test
                </button>
                <button
                  onClick={() => setEditingTemplate(tmpl)}
                  className="p-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 cursor-pointer"
                  title="Edit Template"
                >
                  <Edit2 className="w-3 h-3" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Edit Modal */}
      {editingTemplate && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 w-full max-w-xl shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Edit2 className="w-4 h-4 text-amber-400" />
                Edit Template: {editingTemplate.name}
              </h3>
              <button
                onClick={() => setEditingTemplate(null)}
                className="text-slate-400 hover:text-white cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="space-y-4 text-xs">
              <div className="space-y-1">
                <label className="text-slate-300 font-medium">Description</label>
                <input
                  type="text"
                  value={editingTemplate.description}
                  onChange={(e) =>
                    setEditingTemplate({ ...editingTemplate, description: e.target.value })
                  }
                  className="w-full bg-slate-950 border border-slate-800 text-slate-100 px-3 py-2 rounded-lg"
                />
              </div>

              <div className="space-y-1">
                <label className="text-slate-300 font-medium">System Prompt</label>
                <textarea
                  rows={4}
                  value={editingTemplate.systemPrompt}
                  onChange={(e) =>
                    setEditingTemplate({ ...editingTemplate, systemPrompt: e.target.value })
                  }
                  className="w-full bg-slate-950 border border-slate-800 text-slate-100 font-mono px-3 py-2 rounded-lg"
                />
              </div>

              <div className="space-y-1">
                <label className="text-slate-300 font-medium">
                  User Prompt Template (use <code className="text-amber-400">{`{{variable}}`}</code> placeholders)
                </label>
                <textarea
                  rows={3}
                  value={editingTemplate.userPromptTemplate}
                  onChange={(e) =>
                    setEditingTemplate({ ...editingTemplate, userPromptTemplate: e.target.value })
                  }
                  className="w-full bg-slate-950 border border-slate-800 text-slate-100 font-mono px-3 py-2 rounded-lg"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-slate-300 font-medium">Model Class</label>
                  <select
                    value={editingTemplate.modelClass}
                    onChange={(e) =>
                      setEditingTemplate({
                        ...editingTemplate,
                        modelClass: e.target.value as ModelClass,
                      })
                    }
                    className="w-full bg-slate-950 border border-slate-800 text-slate-100 px-3 py-2 rounded-lg"
                  >
                    <option value="fast">Fast (qwen3.5:4b)</option>
                    <option value="smart">Smart (qwen3.5:4b / 9B)</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-slate-300 font-medium">
                    Temperature ({editingTemplate.temperature})
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.05"
                    value={editingTemplate.temperature}
                    onChange={(e) =>
                      setEditingTemplate({
                        ...editingTemplate,
                        temperature: parseFloat(e.target.value),
                      })
                    }
                    className="w-full accent-amber-500"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setEditingTemplate(null)}
                  className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold cursor-pointer"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Create Modal */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 w-full max-w-xl shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Plus className="w-5 h-5 text-emerald-400" />
                Create Standardized Prompt Template
              </h3>
              <button
                onClick={() => setIsCreateModalOpen(false)}
                className="text-slate-400 hover:text-white cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateTemplate} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-slate-300 font-medium">Template Slug Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. guest-bio-extractor"
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 text-slate-100 font-mono px-3 py-2 rounded-lg"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-slate-300 font-medium">Category</label>
                  <select
                    value={formCategory}
                    onChange={(e) => setFormCategory(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 text-slate-100 px-3 py-2 rounded-lg"
                  >
                    <option value="streaming">Livestreaming</option>
                    <option value="chat">APAP Chat</option>
                    <option value="moderation">Safety & Moderation</option>
                    <option value="radio">RadioHub Pro</option>
                    <option value="production">Production & Studio</option>
                    <option value="general">General Media</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-slate-300 font-medium">Description</label>
                <input
                  type="text"
                  required
                  placeholder="Explain when client apps should invoke this template..."
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 text-slate-100 px-3 py-2 rounded-lg"
                />
              </div>

              <div className="space-y-1">
                <label className="text-slate-300 font-medium">System Prompt</label>
                <textarea
                  rows={3}
                  required
                  placeholder="You are an expert assistant for APAP Media Group..."
                  value={formSystemPrompt}
                  onChange={(e) => setFormSystemPrompt(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 text-slate-100 font-mono px-3 py-2 rounded-lg"
                />
              </div>

              <div className="space-y-1">
                <label className="text-slate-300 font-medium">
                  User Prompt Template (use <code className="text-amber-400">{`{{variable}}`}</code>)
                </label>
                <textarea
                  rows={2}
                  placeholder="Topic: {{topic}}&#10;Guest: {{guest}}"
                  value={formUserTemplate}
                  onChange={(e) => setFormUserTemplate(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 text-slate-100 font-mono px-3 py-2 rounded-lg"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-slate-300 font-medium">Model Class</label>
                  <select
                    value={formModelClass}
                    onChange={(e) => setFormModelClass(e.target.value as ModelClass)}
                    className="w-full bg-slate-950 border border-slate-800 text-slate-100 px-3 py-2 rounded-lg"
                  >
                    <option value="fast">Fast (qwen3.5:4b)</option>
                    <option value="smart">Smart (qwen3.5:4b / 9B)</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-slate-300 font-medium">Temperature ({formTemperature})</label>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.05"
                    value={formTemperature}
                    onChange={(e) => setFormTemperature(parseFloat(e.target.value))}
                    className="w-full accent-emerald-500"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold cursor-pointer"
                >
                  Save to Template Registry
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
