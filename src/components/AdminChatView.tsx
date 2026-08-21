import React, { useState } from 'react';
import { ChatMessage } from '../types';
import {
  MessageSquare,
  Send,
  Sliders,
  Sparkles,
  Bot,
  User,
  Trash2,
  Lock,
  Zap,
  Info,
  Clock,
} from 'lucide-react';

export const AdminChatView: React.FC = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'm1',
      role: 'system',
      content: 'You are the APAP AI administrative evaluation model (qwen3.5:4b). Provide concise, accurate media production and broadcast engineering responses.',
      timestamp: '06:00 AM',
    },
    {
      id: 'm2',
      role: 'assistant',
      content: 'Hello! I am connected to the internal Ollama engine via ai-admin.apapmedia.com. How can I assist with your prompt experimentation, production scripts, or system diagnostics today?',
      timestamp: '06:00 AM',
      tokens: 42,
    },
  ]);

  const [inputMessage, setInputMessage] = useState('');
  const [systemPrompt, setSystemPrompt] = useState('You are the APAP AI administrative evaluation model (qwen3.5:4b).');
  const [isGenerating, setIsGenerating] = useState(false);
  const [temperature, setTemperature] = useState(0.7);
  const [selectedModel, setSelectedModel] = useState('qwen3.5:4b');
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputMessage.trim() || isGenerating) return;

    const userMsg: ChatMessage = {
      id: `u-${Date.now()}`,
      role: 'user',
      content: inputMessage.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputMessage('');
    setIsGenerating(true);

    // Simulate direct internal Ollama chat generation
    setTimeout(() => {
      let replyContent = '';
      const lower = userMsg.content.toLowerCase();

      if (lower.includes('stream') || lower.includes('title')) {
        replyContent = `Here are 3 broadcast title concepts based on your prompt:\n\n1. "Voice of the City: Empowering Community Creators"\n2. "The New Digital Radio Landscape: Independence & Innovation"\n3. "Behind the Broadcast: Inside APAP Media Group"`;
      } else if (lower.includes('vmix') || lower.includes('hardware') || lower.includes('setup')) {
        replyContent = `For a stable 1080p60 multi-cam vMix broadcast on APAP hardware:\n\n• Primary Input: 2x SDI / NDI HX3 cameras\n• Audio Bus: Dante / ASIO 48kHz 24-bit\n• Bitrate: 6500 Kbps H.264 (CBR) to Multistream\n• Key Cue: Ensure 2-box lower third is loaded on Overlay Channel 2.`;
      } else {
        replyContent = `[APAP Local Inference (${selectedModel})]\n\nProcessed response for internal administrative testing. The model is responding with zero third-party API dependencies at an estimated rate of ~38 tokens/sec on CPU inference.`;
      }

      const assistantMsg: ChatMessage = {
        id: `a-${Date.now()}`,
        role: 'assistant',
        content: replyContent,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        tokens: Math.round(replyContent.length / 4),
        model: selectedModel,
      };

      setMessages((prev) => [...prev, assistantMsg]);
      setIsGenerating(false);
    }, 1100);
  };

  const clearChat = () => {
    setMessages([
      {
        id: `sys-${Date.now()}`,
        role: 'system',
        content: systemPrompt,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      },
    ]);
  };

  return (
    <div className="space-y-4 pb-12">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-purple-400" />
            Open WebUI Admin Interface
          </h2>
          <p className="text-xs text-slate-400">
            Simulated environment for <span className="text-purple-300 font-mono">ai-admin.apapmedia.com (Port 3101)</span>. Used by APAP staff for direct internal experimentation.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsSettingsOpen(!isSettingsOpen)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-semibold cursor-pointer"
          >
            <Sliders className="w-3.5 h-3.5" />
            {isSettingsOpen ? 'Hide Parameters' : 'Parameters'}
          </button>
          <button
            onClick={clearChat}
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-red-400 border border-slate-700 cursor-pointer"
            title="Clear conversation"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Model Parameter Drawer */}
      {isSettingsOpen && (
        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
          <div className="space-y-1">
            <label className="text-slate-300 font-medium">Active Admin Model</label>
            <select
              value={selectedModel}
              onChange={(e) => setSelectedModel(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 text-slate-200 px-3 py-1.5 rounded-lg text-xs"
            >
              <option value="qwen3.5:4b">qwen3.5:4b (Fast / Default)</option>
              <option value="gemma3:4b">gemma3:4b (Alternative)</option>
              <option value="qwen3.5:9b">qwen3.5:9b (Smart Class)</option>
            </select>
          </div>

          <div className="space-y-1">
            <div className="flex justify-between">
              <label className="text-slate-300 font-medium">Temperature</label>
              <span className="font-mono text-purple-300">{temperature}</span>
            </div>
            <input
              type="range"
              min="0.1"
              max="1.0"
              step="0.1"
              value={temperature}
              onChange={(e) => setTemperature(parseFloat(e.target.value))}
              className="w-full accent-purple-500"
            />
          </div>

          <div className="space-y-1">
            <label className="text-slate-300 font-medium">Direct Ollama Target</label>
            <div className="bg-slate-950 px-3 py-1.5 rounded-lg font-mono text-slate-400 border border-slate-800 text-sm">
              http://ollama:11434
            </div>
          </div>
        </div>
      )}

      {/* Chat Thread Container */}
      <div className="rounded-2xl bg-slate-900/90 border border-slate-800 h-[520px] flex flex-col overflow-hidden shadow-lg">
        {/* Messages List */}
        <div className="flex-1 p-4 overflow-y-auto space-y-4">
          {messages.map((msg) => {
            if (msg.role === 'system') {
              return (
                <div
                  key={msg.id}
                  className="p-2.5 rounded-lg bg-slate-950/60 border border-slate-800 text-slate-400 text-sm font-mono flex items-center gap-2"
                >
                  <Info className="w-4 h-4 text-slate-500 shrink-0" />
                  <span>System: {msg.content}</span>
                </div>
              );
            }

            const isAssistant = msg.role === 'assistant';
            return (
              <div
                key={msg.id}
                className={`flex items-start gap-3 text-xs ${
                  isAssistant ? 'justify-start' : 'justify-end'
                }`}
              >
                {isAssistant && (
                  <div className="w-8 h-8 rounded-lg bg-purple-950 border border-purple-800/80 flex items-center justify-center text-purple-300 shrink-0">
                    <Bot className="w-4 h-4" />
                  </div>
                )}

                <div
                  className={`max-w-2xl rounded-2xl p-3.5 leading-relaxed space-y-1 ${
                    isAssistant
                      ? 'bg-slate-950 border border-slate-800 text-slate-200'
                      : 'bg-emerald-600 text-white font-medium'
                  }`}
                >
                  <div className="flex items-center justify-between gap-4 text-xs opacity-75 font-mono mb-1">
                    <span>{isAssistant ? `APAP AI (${msg.model || selectedModel})` : 'APAP Staff Member'}</span>
                    <span>{msg.timestamp}</span>
                  </div>
                  <div className="whitespace-pre-wrap">{msg.content}</div>
                </div>

                {!isAssistant && (
                  <div className="w-8 h-8 rounded-lg bg-emerald-700 flex items-center justify-center text-white shrink-0">
                    <User className="w-4 h-4" />
                  </div>
                )}
              </div>
            );
          })}

          {isGenerating && (
            <div className="flex items-center gap-2 text-xs text-slate-400 font-mono py-2">
              <div className="w-4 h-4 border-2 border-purple-500 border-t-transparent rounded-full animate-spin" />
              <span>Ollama is evaluating prompt on CPU...</span>
            </div>
          )}
        </div>

        {/* Input Bar */}
        <form
          onSubmit={handleSendMessage}
          className="p-3 bg-slate-950 border-t border-slate-800 flex items-center gap-2"
        >
          <input
            type="text"
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            placeholder="Type prompt or question to test local model..."
            className="flex-1 bg-slate-900 border border-slate-800 text-slate-100 px-4 py-2.5 rounded-xl text-xs focus:outline-none focus:border-purple-500"
          />
          <button
            type="submit"
            disabled={!inputMessage.trim() || isGenerating}
            className="p-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs disabled:opacity-50 transition-all cursor-pointer"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
};
