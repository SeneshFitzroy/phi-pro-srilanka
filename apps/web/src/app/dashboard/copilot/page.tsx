'use client';

// ============================================================================
// Compliance Copilot — Agentic RAG for Sri Lankan Public Health Law
// Powered by Claude claude-haiku-4-5-20251001 with PHI-specific system prompt
// Covers: Food Act 1980, H800 SOP, H1046, Factories Ordinance, DHIS2
// ============================================================================

import { useState, useRef, useEffect } from 'react';
import { Bot, Send, User, Sparkles, BookOpen, Scale, Loader2, ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useLanguage } from '@/contexts/i18n-context';

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

const STARTER_QUESTIONS = [
  'What score triggers a Court Summons under the H800 grading system?',
  'What are the critical violations that auto-cap an inspection to Grade C?',
  'Which section of the Food Act covers food handler health certificates?',
  'How many days before a follow-up inspection after a Grade C?',
  'What is the legal basis for issuing a Closure Notice?',
  'Explain the H800 cold storage critical item requirement.',
];

export default function CopilotPage() {
  const { language } = useLanguage();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [showStarters, setShowStarters] = useState(true);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  async function sendMessage(text: string) {
    if (!text.trim() || loading) return;

    const userMsg: ChatMessage = {
      id: crypto.randomUUID(),
      role: 'user',
      content: text.trim(),
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setLoading(true);
    setShowStarters(false);

    try {
      const history = [...messages, userMsg].map((m) => ({ role: m.role, content: m.content }));
      const res = await fetch('/api/ai/copilot', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: history, language }),
      });

      const data = await res.json() as { answer?: string; error?: string };

      const assistantMsg: ChatMessage = {
        id: crypto.randomUUID(),
        role: 'assistant',
        content: data.answer ?? data.error ?? 'No response.',
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, assistantMsg]);
    } catch {
      setMessages((prev) => [
        ...prev,
        { id: crypto.randomUUID(), role: 'assistant', content: 'Network error. Please try again.', timestamp: new Date() },
      ]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex h-full flex-col gap-4">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-violet-600 to-indigo-600 shadow">
              <Sparkles className="h-5 w-5 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-900 dark:text-white">Compliance Copilot</h1>
              <p className="text-xs text-slate-500">Agentic RAG · Sri Lanka Health Law · Food Act No.26/1980</p>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="rounded-full bg-green-100 px-2.5 py-1 text-xs font-semibold text-green-700 dark:bg-green-900/30 dark:text-green-400">
            Live
          </div>
          <div className="hidden rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs text-slate-500 dark:border-slate-700 dark:bg-slate-800 sm:block">
            Claude Haiku 4.5 · PHI Context
          </div>
        </div>
      </div>

      {/* Source badges */}
      <div className="flex flex-wrap gap-2">
        {[
          { icon: Scale, label: 'Food Act No.26/1980', color: 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/20 dark:text-blue-400 dark:border-blue-800' },
          { icon: BookOpen, label: 'H800 SOP', color: 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-900/20 dark:text-emerald-400 dark:border-emerald-800' },
          { icon: BookOpen, label: 'Factories Ordinance', color: 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-900/20 dark:text-amber-400 dark:border-amber-800' },
          { icon: BookOpen, label: 'PDPA 2022', color: 'bg-violet-50 text-violet-700 border-violet-200 dark:bg-violet-900/20 dark:text-violet-400 dark:border-violet-800' },
          { icon: BookOpen, label: 'DHIS2 Standards', color: 'bg-red-50 text-red-700 border-red-200 dark:bg-red-900/20 dark:text-red-400 dark:border-red-800' },
        ].map(({ icon: Icon, label, color }) => (
          <span key={label} className={cn('flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-semibold', color)}>
            <Icon className="h-3 w-3" />
            {label}
          </span>
        ))}
      </div>

      {/* Chat area */}
      <div className="flex flex-1 flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-700 dark:bg-slate-900">
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {/* Welcome */}
          {messages.length === 0 && (
            <div className="flex flex-col items-center justify-center py-10 text-center">
              <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-100 to-indigo-100 dark:from-violet-900/30 dark:to-indigo-900/30">
                <Bot className="h-8 w-8 text-violet-600 dark:text-violet-400" />
              </div>
              <h2 className="mb-1 text-lg font-bold text-slate-900 dark:text-white">PHI Compliance Copilot</h2>
              <p className="mb-6 max-w-md text-sm text-slate-500 dark:text-slate-400">
                Ask about enforcement procedures, H800 grading rules, Sri Lankan health legislation,
                or inspection protocols. Answers cite specific Acts and sections.
              </p>

              {showStarters && (
                <div className="w-full max-w-lg space-y-2">
                  <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-400">
                    <ChevronDown className="h-3 w-3" />
                    Suggested questions
                  </div>
                  {STARTER_QUESTIONS.map((q) => (
                    <button
                      key={q}
                      onClick={() => sendMessage(q)}
                      className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-left text-sm text-slate-700 transition-all hover:border-violet-300 hover:bg-violet-50 hover:text-violet-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:border-violet-600 dark:hover:bg-violet-900/20"
                    >
                      {q}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Messages */}
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={cn('flex gap-3', msg.role === 'user' ? 'flex-row-reverse' : 'flex-row')}
            >
              <div className={cn(
                'flex h-8 w-8 shrink-0 items-center justify-center rounded-full',
                msg.role === 'user'
                  ? 'bg-[#0066cc]'
                  : 'bg-gradient-to-br from-violet-600 to-indigo-600',
              )}>
                {msg.role === 'user'
                  ? <User className="h-4 w-4 text-white" />
                  : <Bot className="h-4 w-4 text-white" />
                }
              </div>
              <div className={cn(
                'max-w-[80%] rounded-2xl px-4 py-3 text-sm leading-relaxed',
                msg.role === 'user'
                  ? 'bg-[#0066cc] text-white'
                  : 'bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-200',
              )}>
                <p className="whitespace-pre-wrap">{msg.content}</p>
                <p className={cn(
                  'mt-1.5 text-[10px]',
                  msg.role === 'user' ? 'text-blue-200' : 'text-slate-400',
                )}>
                  {msg.timestamp.toLocaleTimeString('en-LK', { hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>
            </div>
          ))}

          {loading && (
            <div className="flex gap-3">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-violet-600 to-indigo-600">
                <Bot className="h-4 w-4 text-white" />
              </div>
              <div className="flex items-center gap-2 rounded-2xl bg-slate-100 px-4 py-3 dark:bg-slate-800">
                <Loader2 className="h-4 w-4 animate-spin text-violet-600" />
                <span className="text-sm text-slate-500">Consulting regulations…</span>
              </div>
            </div>
          )}

          <div ref={bottomRef} />
        </div>

        {/* Input */}
        <div className="border-t border-slate-200 p-3 dark:border-slate-700">
          <form
            onSubmit={(e) => { e.preventDefault(); sendMessage(input); }}
            className="flex items-end gap-2"
          >
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(input); }
              }}
              placeholder="Ask about H800 enforcement, Food Act provisions, inspection protocols…"
              rows={2}
              className="flex-1 resize-none rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm text-slate-800 placeholder:text-slate-400 focus:border-violet-400 focus:outline-none focus:ring-2 focus:ring-violet-200 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200 dark:placeholder:text-slate-500"
            />
            <button
              type="submit"
              disabled={!input.trim() || loading}
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#0066cc] text-white transition-all hover:bg-blue-700 disabled:opacity-40"
            >
              <Send className="h-4 w-4" />
            </button>
          </form>
          <p className="mt-2 text-center text-[10px] text-slate-400">
            AI answers are for guidance only — always verify against official MOH circulars.
          </p>
        </div>
      </div>
    </div>
  );
}
