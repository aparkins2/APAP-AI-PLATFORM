import React, { useState } from 'react';
import { AppEntity, PromptTemplate } from '../types';
import {
  MessageSquare,
  Share2,
  Radio,
  Tv,
  Play,
  Check,
  X,
  Edit3,
  Send,
  Sparkles,
  ShieldCheck,
  AlertTriangle,
  Copy,
  ThumbsUp,
  RefreshCw,
  Clock,
  ListPlus,
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface EcosystemDemosViewProps {
  apps: AppEntity[];
  templates: PromptTemplate[];
  onLogRequest: (log: any) => void;
}

export const EcosystemDemosView: React.FC<EcosystemDemosViewProps> = ({
  apps,
  templates,
  onLogRequest,
}) => {
  const [activeDemo, setActiveDemo] = useState<'chat' | 'multistream' | 'radio' | 'runofshow'>('chat');

  // APAP Chat Demo State
  const [chatComments, setChatComments] = useState<
    { id: string; author: string; text: string; time: string; flagged?: boolean; flagReason?: string }[]
  >([
    {
      id: 'c1',
      author: 'Marcus_Civic',
      text: 'Where can we download the presentation slides from today’s community zoning discussion?',
      time: '12:04 PM',
    },
    {
      id: 'c2',
      author: 'CryptoGainz99',
      text: 'Join our telegram t.me/fastcrypto to get 100x signals right now!!',
      time: '12:05 PM',
    },
    {
      id: 'c3',
      author: 'Aaliyah_V',
      text: 'What time is the next live Q&A segment starting?',
      time: '12:06 PM',
    },
  ]);

  const [selectedComment, setSelectedComment] = useState<any>(null);
  const [suggestedReply, setSuggestedReply] = useState<string>('');
  const [editedReply, setEditedReply] = useState<string>('');
  const [isGeneratingReply, setIsGeneratingReply] = useState<boolean>(false);
  const [moderationResult, setModerationResult] = useState<any>(null);
  const [chatHistory, setChatHistory] = useState<{ author: string; text: string; time: string; isAiApproved?: boolean }[]>([]);

  // APAP Multistream Demo State
  const [msTopic, setMsTopic] = useState('Building Communities Brick by Brick');
  const [msGuest, setMsGuest] = useState('T. Dwain Smith');
  const [msShow, setMsShow] = useState('Zlography');
  const [isGeneratingMetadata, setIsGeneratingMetadata] = useState(false);
  const [generatedMetadata, setGeneratedMetadata] = useState<{
    titles?: string;
    description?: string;
    tags?: string;
    social?: string;
  } | null>(null);

  // RadioHub Pro Demo State
  const [stationName, setStationName] = useState('RadioHub 98.5 FM');
  const [djName, setDjName] = useState('DJ Marcus Cole');
  const [nextArtist, setNextArtist] = useState('Kendrick Lamar');
  const [generatedLiners, setGeneratedLiners] = useState<string>('');
  const [isGeneratingLiners, setIsGeneratingLiners] = useState<boolean>(false);

  // Run of Show Demo State
  const [rosShowName, setRosShowName] = useState('Zlography Live Tonight');
  const [rosDuration, setRosDuration] = useState('60');
  const [rosGuest, setRosGuest] = useState('Dr. Angela Vance');
  const [generatedRos, setGeneratedRos] = useState<string>('');
  const [isGeneratingRos, setIsGeneratingRos] = useState<boolean>(false);

  const callGateway = async (
    payload: any,
    _apps: AppEntity[],
    _templates: PromptTemplate[]
  ) => {
    const res = await fetch('/v1/generate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${payload.apiKey}`,
      },
      body: JSON.stringify({ task: payload.task, input: payload.input }),
    });
    return res.json();
  };

  // 1. Trigger APAP Chat Suggested Reply
  const handleSuggestReply = async (comment: any) => {
    setSelectedComment(comment);
    setIsGeneratingReply(true);
    setSuggestedReply('');
    setModerationResult(null);

    const chatApp = apps.find((a) => a.slug === 'apap-chat') || apps[0];
    const apiKey = chatApp.apiKey;

    const res = await callGateway(
      {
        task: 'chat-reply',
        input: {
          comment: comment.text,
          author: comment.author,
          streamTopic: 'Community Revitalization & Urban Media',
          host: 'T. Dwain Smith',
        },
        apiKey,
      },
      apps,
      templates
    );

    setIsGeneratingReply(false);
    if (res.success && typeof res.result === 'string') {
      setSuggestedReply(res.result);
      setEditedReply(res.result);
    }
  };

  // 2. Trigger Chat Moderation
  const handleModerateComment = async (comment: any) => {
    setSelectedComment(comment);
    setIsGeneratingReply(true);

    const chatApp = apps.find((a) => a.slug === 'apap-chat') || apps[0];
    const apiKey = chatApp.apiKey;

    const res = await callGateway(
      {
        task: 'chat-moderation',
        input: {
          comment: comment.text,
          author: comment.author,
          accountAgeDays: '4',
        },
        apiKey,
      },
      apps,
      templates
    );

    setIsGeneratingReply(false);
    if (res.success && typeof res.result === 'object') {
      setModerationResult(res.result);
    }
  };

  const handleSendReply = () => {
    if (!editedReply.trim()) return;
    setChatHistory((prev) => [
      ...prev,
      {
        author: 'APAP Moderator (Approved)',
        text: editedReply,
        time: 'Just now',
        isAiApproved: true,
      },
    ]);
    setSelectedComment(null);
    setSuggestedReply('');
    setEditedReply('');

    confetti({
      particleCount: 25,
      spread: 50,
      origin: { y: 0.8 },
    });
  };

  // 3. Trigger Multistream Package Generation
  const handleGenerateMultistream = async () => {
    setIsGeneratingMetadata(true);
    setGeneratedMetadata(null);

    const msApp = apps.find((a) => a.slug === 'apap-multistream') || apps[0];
    const apiKey = msApp.apiKey;

    // Generate Titles
    const titlesRes = await callGateway(
      {
        task: 'stream-title',
        input: { show: msShow, topic: msTopic, guest: msGuest },
        apiKey,
      },
      apps,
      templates
    );

    // Generate Description
    const descRes = await callGateway(
      {
        task: 'stream-description',
        input: {
          title: msTopic,
          show: msShow,
          guest: msGuest,
          guestTitle: 'Civic Media Director',
          discussionPoints: msTopic,
          cta: 'https://apapmedia.com',
        },
        apiKey,
      },
      apps,
      templates
    );

    // Generate Tags
    const tagsRes = await callGateway(
      {
        task: 'youtube-tags',
        input: { topic: msTopic, guest: msGuest, category: 'Civic Media' },
        apiKey,
      },
      apps,
      templates
    );

    // Generate Social
    const socialRes = await callGateway(
      {
        task: 'social-caption',
        input: {
          quote: 'Building community brick by brick.',
          guest: msGuest,
          title: msTopic,
          insight: 'Sustainable media ownership.',
        },
        apiKey,
      },
      apps,
      templates
    );

    setGeneratedMetadata({
      titles: typeof titlesRes.result === 'string' ? titlesRes.result : '',
      description: typeof descRes.result === 'string' ? descRes.result : '',
      tags: typeof tagsRes.result === 'string' ? tagsRes.result : '',
      social: typeof socialRes.result === 'string' ? socialRes.result : '',
    });

    setIsGeneratingMetadata(false);

    confetti({
      particleCount: 45,
      spread: 70,
      origin: { y: 0.7 },
    });
  };

  // 4. RadioHub Liners
  const handleGenerateRadioLiners = async () => {
    setIsGeneratingLiners(true);
    const radioApp = apps.find((a) => a.slug === 'radiohub-pro') || apps[0];
    const apiKey = radioApp.apiKey;

    const res = await callGateway(
      {
        task: 'dj-liner-intro',
        input: {
          station: stationName,
          djName: djName,
          songArtist: nextArtist,
          vibe: 'High Energy Urban Contemporary',
        },
        apiKey,
      },
      apps,
      templates
    );

    setIsGeneratingLiners(false);
    if (res.success && typeof res.result === 'string') {
      setGeneratedLiners(res.result);
    }
  };

  // 5. Run of Show
  const handleGenerateRos = async () => {
    setIsGeneratingRos(true);
    const rosApp = apps.find((a) => a.slug === 'run-of-show') || apps[0];
    const apiKey = rosApp.apiKey;

    const res = await callGateway(
      {
        task: 'run-of-show',
        input: {
          show: rosShowName,
          durationMinutes: rosDuration,
          guest: rosGuest,
          segments: 'Cold Open, Topic Deep Dive, Viewer Q&A, Wrap Up',
          hasSponsor: 'Yes',
        },
        apiKey,
      },
      apps,
      templates
    );

    setIsGeneratingRos(false);
    if (res.success && typeof res.result === 'string') {
      setGeneratedRos(res.result);
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div>
        <h2 className="text-xl font-bold text-white flex items-center gap-2">
          <Share2 className="w-5 h-5 text-amber-400" />
          APAP Ecosystem Application Demos
        </h2>
        <p className="text-xs text-slate-400">
          Live simulation showing how APAP Chat, Multistream, RadioHub, and vMix production tools communicate with <code className="text-cyan-400 font-mono">ai.apapmedia.com</code>.
        </p>
      </div>

      {/* Demo Selector Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
        {[
          { id: 'chat', label: '1. APAP Chat & Moderation', icon: MessageSquare },
          { id: 'multistream', label: '2. Multistream Metadata Studio', icon: Tv },
          { id: 'radio', label: '3. RadioHub Pro DJ Liners', icon: Radio },
          { id: 'runofshow', label: '4. Run-of-Show Architect', icon: ListPlus },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeDemo === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveDemo(tab.id as any)}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer shrink-0 border ${
                isActive
                  ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white border-emerald-500 shadow-md'
                  : 'bg-slate-900 text-slate-300 hover:bg-slate-800 border-slate-800'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* DEMO 1: APAP CHAT & HUMAN REVIEW WORKFLOW */}
      {activeDemo === 'chat' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column: Live Chat Feed */}
          <div className="lg:col-span-6 space-y-4">
            <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse" />
                  <span className="text-xs font-bold text-white">Live Stream Viewer Comments</span>
                </div>
                <span className="text-sm text-slate-400 font-mono">APAP Chat Operator View</span>
              </div>

              <div className="space-y-2 max-h-[380px] overflow-y-auto">
                {chatComments.map((c) => (
                  <div
                    key={c.id}
                    className={`p-3 rounded-lg border transition-all text-xs space-y-2 ${
                      selectedComment?.id === c.id
                        ? 'bg-slate-950 border-emerald-500'
                        : 'bg-slate-950/80 border-slate-800/80 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-cyan-300">@{c.author}</span>
                      <span className="text-xs text-slate-500">{c.time}</span>
                    </div>
                    <p className="text-slate-200">{c.text}</p>

                    {/* Action buttons for Operator */}
                    <div className="flex items-center gap-2 pt-1">
                      <button
                        onClick={() => handleSuggestReply(c)}
                        disabled={isGeneratingReply}
                        className="px-2.5 py-1 rounded bg-emerald-950 hover:bg-emerald-900 border border-emerald-700/60 text-emerald-300 text-sm font-semibold flex items-center gap-1 cursor-pointer"
                      >
                        <Sparkles className="w-3 h-3 text-emerald-400" /> Suggest Reply (AI)
                      </button>
                      <button
                        onClick={() => handleModerateComment(c)}
                        disabled={isGeneratingReply}
                        className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-sm flex items-center gap-1 cursor-pointer"
                      >
                        <ShieldCheck className="w-3 h-3 text-amber-400" /> Check Safety
                      </button>
                    </div>
                  </div>
                ))}

                {/* Sent history */}
                {chatHistory.map((h, idx) => (
                  <div
                    key={idx}
                    className="p-3 rounded-lg bg-emerald-950/40 border border-emerald-600/40 text-xs space-y-1"
                  >
                    <div className="flex items-center justify-between text-emerald-300 font-bold">
                      <span>✓ {h.author}</span>
                      <span className="text-xs text-emerald-400/80">{h.time}</span>
                    </div>
                    <p className="text-slate-200">{h.text}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column: Operator Review & Approval Workflow */}
          <div className="lg:col-span-6 space-y-4">
            <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 space-y-4">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-white flex items-center gap-1.5">
                  <Edit3 className="w-4 h-4 text-emerald-400" />
                  Human-in-the-Loop Operator Review
                </span>
                <span className="text-sm text-slate-400">PRD Section 34 Compliance</span>
              </div>

              {/* Moderation Result Box */}
              {moderationResult && (
                <div
                  className={`p-3 rounded-lg border text-xs space-y-2 ${
                    moderationResult.classification === 'safe'
                      ? 'bg-emerald-950/40 border-emerald-700/60 text-emerald-200'
                      : 'bg-red-950/40 border-red-700/60 text-red-200'
                  }`}
                >
                  <div className="flex items-center justify-between font-bold">
                    <span className="uppercase">Classification: {moderationResult.classification}</span>
                    <span className="font-mono">Confidence: {(moderationResult.confidence * 100).toFixed(0)}%</span>
                  </div>
                  <p className="text-sm text-slate-300">{moderationResult.reason}</p>
                  <div className="font-mono text-xs text-amber-300">
                    Recommended Action: {moderationResult.actionRecommended}
                  </div>
                </div>
              )}

              {/* Operator Edit Box */}
              {suggestedReply ? (
                <div className="space-y-3">
                  <div className="text-xs text-slate-300">
                    AI generated response for <strong>@{selectedComment?.author}</strong>:
                  </div>

                  <textarea
                    rows={4}
                    value={editedReply}
                    onChange={(e) => setEditedReply(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 text-slate-100 p-3 rounded-lg text-xs leading-relaxed focus:outline-none focus:border-emerald-500 font-sans"
                  />

                  <div className="flex items-center justify-end gap-2">
                    <button
                      onClick={() => {
                        setSelectedComment(null);
                        setSuggestedReply('');
                      }}
                      className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold cursor-pointer"
                    >
                      Reject / Cancel
                    </button>
                    <button
                      onClick={handleSendReply}
                      className="px-4 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-md shadow-emerald-950/40 cursor-pointer"
                    >
                      <Send className="w-3.5 h-3.5" /> Approve & Post to Live Chat
                    </button>
                  </div>
                </div>
              ) : (
                <div className="p-8 rounded-lg bg-slate-950/60 border border-slate-800 text-center text-slate-400 text-xs space-y-1">
                  <Sparkles className="w-6 h-6 text-slate-600 mx-auto mb-1" />
                  <p>Click "Suggest Reply (AI)" on any comment on the left to trigger the APAP AI Gateway.</p>
                  <p className="text-sm text-slate-500">
                    AI never posts autonomously — operators retain complete approval authority.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* DEMO 2: APAP MULTISTREAM METADATA STUDIO */}
      {activeDemo === 'multistream' && (
        <div className="space-y-6">
          <div className="p-5 rounded-xl bg-slate-900/90 border border-slate-800 space-y-4">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Tv className="w-4 h-4 text-cyan-400" />
              Livestream Distribution Metadata Studio
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
              <div className="space-y-1">
                <label className="text-slate-300 font-medium">Show Name</label>
                <input
                  type="text"
                  value={msShow}
                  onChange={(e) => setMsShow(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 text-slate-200 px-3 py-2 rounded-lg"
                />
              </div>

              <div className="space-y-1">
                <label className="text-slate-300 font-medium">Topic / Focus</label>
                <input
                  type="text"
                  value={msTopic}
                  onChange={(e) => setMsTopic(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 text-slate-200 px-3 py-2 rounded-lg"
                />
              </div>

              <div className="space-y-1">
                <label className="text-slate-300 font-medium">Featured Guest</label>
                <input
                  type="text"
                  value={msGuest}
                  onChange={(e) => setMsGuest(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 text-slate-200 px-3 py-2 rounded-lg"
                />
              </div>
            </div>

            <button
              onClick={handleGenerateMultistream}
              disabled={isGeneratingMetadata}
              className="w-full py-2.5 rounded-lg bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg cursor-pointer"
            >
              <Sparkles className={`w-4 h-4 ${isGeneratingMetadata ? 'animate-spin' : ''}`} />
              {isGeneratingMetadata
                ? 'Synthesizing Multi-Platform Broadcast Package...'
                : 'Generate Complete Broadcast Metadata Package (4 Tasks)'}
            </button>
          </div>

          {generatedMetadata && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Titles */}
              <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
                <span className="text-xs font-bold text-amber-300 flex items-center gap-1.5">
                  1. Optimized Livestream Titles
                </span>
                <pre className="p-3 bg-slate-950 rounded-lg text-xs font-mono text-slate-200 whitespace-pre-wrap leading-relaxed border border-slate-800">
                  {generatedMetadata.titles}
                </pre>
              </div>

              {/* Tags */}
              <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
                <span className="text-xs font-bold text-cyan-300 flex items-center gap-1.5">
                  2. SEO Tags & Distribution Hashtags
                </span>
                <pre className="p-3 bg-slate-950 rounded-lg text-xs font-mono text-cyan-200 whitespace-pre-wrap leading-relaxed border border-slate-800">
                  {generatedMetadata.tags}
                </pre>
              </div>

              {/* 300-Word Description */}
              <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
                <span className="text-xs font-bold text-emerald-400 flex items-center gap-1.5">
                  3. YouTube & Facebook Stream Description
                </span>
                <pre className="p-3 bg-slate-950 rounded-lg text-xs font-mono text-slate-200 whitespace-pre-wrap leading-relaxed border border-slate-800 max-h-56 overflow-y-auto">
                  {generatedMetadata.description}
                </pre>
              </div>

              {/* Social Copy */}
              <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
                <span className="text-xs font-bold text-indigo-400 flex items-center gap-1.5">
                  4. TikTok & Reels Multi-Platform Copy
                </span>
                <pre className="p-3 bg-slate-950 rounded-lg text-xs font-mono text-slate-200 whitespace-pre-wrap leading-relaxed border border-slate-800 max-h-56 overflow-y-auto">
                  {generatedMetadata.social}
                </pre>
              </div>
            </div>
          )}
        </div>
      )}

      {/* DEMO 3: RADIOHUB PRO */}
      {activeDemo === 'radio' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-5 space-y-4">
            <div className="p-5 rounded-xl bg-slate-900/90 border border-slate-800 space-y-3">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Radio className="w-4 h-4 text-amber-400" />
                RadioHub Pro DJ Booth Settings
              </h3>

              <div className="space-y-2 text-xs">
                <div className="space-y-1">
                  <label className="text-slate-300 font-medium">Station Imaging Brand</label>
                  <input
                    type="text"
                    value={stationName}
                    onChange={(e) => setStationName(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 text-slate-200 px-3 py-2 rounded-lg"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-slate-300 font-medium">On-Air DJ Name</label>
                  <input
                    type="text"
                    value={djName}
                    onChange={(e) => setDjName(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 text-slate-200 px-3 py-2 rounded-lg"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-slate-300 font-medium">Upcoming Track / Artist</label>
                  <input
                    type="text"
                    value={nextArtist}
                    onChange={(e) => setNextArtist(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 text-slate-200 px-3 py-2 rounded-lg"
                  />
                </div>
              </div>

              <button
                onClick={handleGenerateRadioLiners}
                disabled={isGeneratingLiners}
                className="w-full py-2.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs flex items-center justify-center gap-2 shadow-md cursor-pointer"
              >
                <Sparkles className="w-4 h-4" />
                {isGeneratingLiners ? 'Crafting DJ Liners...' : 'Generate 3 Station Sweeps & Liners'}
              </button>
            </div>
          </div>

          <div className="lg:col-span-7">
            <div className="p-5 rounded-xl bg-slate-900/90 border border-slate-800 space-y-3 min-h-[300px]">
              <span className="text-xs font-bold text-white flex items-center gap-2">
                <Radio className="w-4 h-4 text-emerald-400" />
                RadioHub Live Studio Script (Teleprompter)
              </span>

              {generatedLiners ? (
                <pre className="p-4 bg-slate-950 rounded-lg text-xs font-mono text-emerald-300 whitespace-pre-wrap leading-relaxed border border-slate-800">
                  {generatedLiners}
                </pre>
              ) : (
                <div className="h-48 flex items-center justify-center text-slate-500 text-xs">
                  Configure DJ booth parameters and click generate.
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* DEMO 4: RUN-OF-SHOW ARCHITECT */}
      {activeDemo === 'runofshow' && (
        <div className="space-y-4">
          <div className="p-5 rounded-xl bg-slate-900/90 border border-slate-800 space-y-4">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <ListPlus className="w-4 h-4 text-purple-400" />
              vMix Live Production Run-of-Show Assistant
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
              <div className="space-y-1">
                <label className="text-slate-300 font-medium">Show Title</label>
                <input
                  type="text"
                  value={rosShowName}
                  onChange={(e) => setRosShowName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 text-slate-200 px-3 py-2 rounded-lg"
                />
              </div>

              <div className="space-y-1">
                <label className="text-slate-300 font-medium">Duration (Minutes)</label>
                <input
                  type="text"
                  value={rosDuration}
                  onChange={(e) => setRosDuration(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 text-slate-200 px-3 py-2 rounded-lg font-mono"
                />
              </div>

              <div className="space-y-1">
                <label className="text-slate-300 font-medium">Guest Keynote</label>
                <input
                  type="text"
                  value={rosGuest}
                  onChange={(e) => setRosGuest(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 text-slate-200 px-3 py-2 rounded-lg"
                />
              </div>
            </div>

            <button
              onClick={handleGenerateRos}
              disabled={isGeneratingRos}
              className="w-full py-2.5 rounded-lg bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-md cursor-pointer"
            >
              <Sparkles className="w-4 h-4" />
              {isGeneratingRos ? 'Calculating Timeline & Director Cues...' : 'Generate Broadcast Run-of-Show Schedule Table'}
            </button>
          </div>

          {generatedRos && (
            <div className="p-5 rounded-xl bg-slate-900 border border-slate-800 space-y-3">
              <span className="text-xs font-bold text-white">Live Broadcast Technical Cue Sheet</span>
              <pre className="p-4 bg-slate-950 rounded-lg text-xs font-mono text-slate-200 whitespace-pre-wrap leading-relaxed border border-slate-800 overflow-x-auto">
                {generatedRos}
              </pre>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
