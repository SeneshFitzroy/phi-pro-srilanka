'use client';

// ============================================================================
// PHI Assistant — floating help bubble available on every dashboard page.
//
// Online  : calls /api/ai/copilot (Claude Haiku 4.5 with the Sri Lanka health-law
//           system prompt) and caches each Q→A pair in localStorage.
// Offline : answers from the cached pairs + a built-in bank of ~20 key Q&As,
//           using a lightweight keyword-overlap match — so the assistant still
//           works in the field with no connectivity.
// This is the single agentic assistant (the old /dashboard/copilot is merged
// in here): it answers health-law questions AND drives the app — navigate to
// any module, open forms, switch theme, open search.
// ============================================================================

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Bot, Send, User, X, Loader2, Sparkles, WifiOff } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useLanguage } from '@/contexts/i18n-context';

const THEME_KEY = 'phi-pro-theme';
function applyTheme(theme: 'light' | 'dark' | 'system') {
  try {
    localStorage.setItem(THEME_KEY, theme);
    const wantDark = theme === 'dark' || (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);
    document.documentElement.classList.toggle('dark', wantDark);
  } catch { /* ignore */ }
}

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  offline?: boolean;
}

const STARTERS = [
  'Open a new H800 inspection',
  'Go to Epidemiology',
  'What score triggers a Court Summons under H800?',
  'Which violations auto-cap an inspection to Grade C?',
];

// Built-in offline knowledge bank (concise — the full RAG copilot is online).
const OFFLINE_QA: { q: string; a: string }[] = [
  { q: 'h800 grade a points score', a: 'Grade A = 90 points or more on the H800 (100-point) Food Premises Inspection Form. Enforcement: no action; routine re-inspection cycle.' },
  { q: 'h800 grade b points score warning notice', a: 'Grade B = 75–89 points. Enforcement: issue a Warning Notice; re-inspect within the period specified on the notice (commonly 14 days).' },
  { q: 'h800 grade c points score improvement notice', a: 'Grade C = below 75 points, or any critical violation regardless of total. Enforcement: issue an Improvement Notice and re-inspect within ~7 days.' },
  { q: 'critical violation auto cap grade c', a: 'Critical items that auto-cap to Grade C if scored zero: pest-proofing, cold storage, prevention of cross-contamination, hot-holding. Any one at zero → Grade C and enforcement action.' },
  { q: 'court summons closure notice legal basis food act', a: 'A Court Summons or Closure (Prohibition) Notice is issued for critical violations / imminent health risk under the Food Act No. 26 of 1980 (offences and prohibition-order provisions). The PHI prepares the charge sheet for the MOH/AG.' },
  { q: 'follow up re-inspection after grade c days', a: 'After a Grade C, re-inspect within about 7 days of the Improvement Notice expiry; after a Grade B (Warning Notice) re-inspect within the notice period (commonly 14 days).' },
  { q: 'food handler health certificate section food act', a: 'Food handlers must hold a valid health certificate; this and food-handler hygiene duties fall under the Food Act No. 26 of 1980 and the Food (Hygiene) Regulations. Check certificate validity at every inspection.' },
  { q: 'h399 communicable disease notification form', a: 'Use form H399 to notify a communicable disease. The PHI investigates, traces contacts, advises isolation, and submits the surveillance return to the Epidemiology Unit.' },
  { q: 'dengue vector control anti larval source reduction', a: 'Anti-larval and source-reduction operations are carried out under the Prevention of Mosquito-breeding Act / dengue regulations: inspect premises for breeding sites, issue notices, and mobilise the community.' },
  { q: 'factories ordinance occupational health inspection', a: 'Workplace and factory inspections are conducted under the Factories Ordinance No. 45 of 1942 — assess ventilation, lighting, welfare facilities, and occupational hazards; advise the employer in writing.' },
  { q: 'national environmental act sanitation waste', a: 'Solid waste, wastewater and excreta disposal supervision falls under the National Environmental Act No. 47 of 1980 and local-authority by-laws. Issue notices for nuisances and unsanitary conditions.' },
  { q: 'water sampling drinking water quality chlorination', a: 'Sample drinking-water sources routinely and after complaints; supervise chlorination; inspect wells and pipe-borne supplies. Submit samples to the MRI / Government Analyst.' },
  { q: 'food sampling procedure moh circular analyst', a: 'Follow the MOH food-sampling SOP: take the legal sample in three parts, label and seal, deliver promptly to the Government Analyst, and retain the relevant documentation for any prosecution.' },
  { q: 'pdpa 2022 personal data student health h1046 encryption', a: 'Student-health and other personal data are protected under the Personal Data Protection Act No. 9 of 2022. In PHI-PRO, sensitive forms (e.g. H1046) are AES-256 encrypted; access is role-restricted and logged.' },
  { q: 'school medical inspection defects referral immunisation', a: 'School health work: conduct medical inspections, record and refer defects, support the school immunisation programme, and inspect school WASH facilities, canteens and environment.' },
  { q: 'monthly return area survey gn mapping administration', a: 'Administrative duties: prepare the monthly work return, area survey, and Grama Niladhari division mapping; maintain registers; and support court work with charge sheets and evidence.' },
  { q: 'improvement notice prohibition notice difference', a: 'An Improvement Notice requires the occupier to correct specified defects by a deadline (used for Grade C). A Prohibition/Closure Notice stops the activity immediately where there is an imminent health risk (critical violations).' },
  { q: 'how to grade premises h800 process', a: 'Score each H800 section, sum to a total out of 100, apply any critical-item auto-cap, then: ≥90 = A, 75–89 = B, <75 = C. Record the grade, issue the matching notice, set the re-inspection date.' },
  { q: 'health emergency outbreak hotline number', a: 'For outbreaks / health emergencies use the Ministry of Health hotline 1390, or the Suwa Seriya / public-health emergency line; notify the MOH and Epidemiology Unit immediately.' },
  { q: 'who is a phi public health inspector role', a: 'A Public Health Inspector is the front-line preventive-health officer working from the MOH area — covering food safety, communicable disease control, environmental sanitation, school and occupational health, and enforcement of public-health law.' },
];

const CACHE_KEY = 'phi-assistant-cache-v1';
const MAX_CACHE = 60;

function loadCache(): Record<string, string> {
  if (typeof window === 'undefined') return {};
  try { return JSON.parse(localStorage.getItem(CACHE_KEY) || '{}'); } catch { return {}; }
}
function saveCache(c: Record<string, string>) {
  try {
    const entries = Object.entries(c).slice(-MAX_CACHE);
    localStorage.setItem(CACHE_KEY, JSON.stringify(Object.fromEntries(entries)));
  } catch { /* quota — ignore */ }
}

function tokenize(s: string): string[] {
  return s.toLowerCase().replace(/[^a-z0-9\s]/g, ' ').split(/\s+/).filter((w) => w.length > 2);
}

/** Best-effort offline answer: exact cache hit, else keyword overlap against cache + bank. */
function offlineAnswer(question: string, cache: Record<string, string>): string {
  const norm = question.trim().toLowerCase();
  if (cache[norm]) return cache[norm];

  const qTokens = new Set(tokenize(question));
  if (qTokens.size === 0) return 'I could not match that offline. Please try again when you have a connection.';

  let best = { score: 0, a: '' };
  // cached questions
  for (const [cq, ca] of Object.entries(cache)) {
    const overlap = tokenize(cq).filter((t) => qTokens.has(t)).length;
    if (overlap > best.score) best = { score: overlap, a: ca };
  }
  // built-in bank
  for (const item of OFFLINE_QA) {
    const overlap = tokenize(item.q).filter((t) => qTokens.has(t)).length;
    if (overlap > best.score) best = { score: overlap, a: item.a };
  }

  if (best.score >= 2) return best.a + '\n\n(Offline answer — verify against current MOH circulars; full AI answers resume when online.)';
  return 'No offline match for that question. Connect to the internet and ask again for the complete legal knowledge base.';
}

export function AiAssistantFab() {
  const { language } = useLanguage();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [online, setOnline] = useState(true);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMounted(true);
    setOnline(navigator.onLine);
    const on = () => setOnline(true);
    const off = () => setOnline(false);
    window.addEventListener('online', on);
    window.addEventListener('offline', off);
    return () => { window.removeEventListener('online', on); window.removeEventListener('offline', off); };
  }, []);

  useEffect(() => { if (open) bottomRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages, open]);

  // Agentic layer — the assistant can drive the app: navigate, switch theme,
  // open search, jump to any module/form. Returns a confirmation string when it
  // handled the message, or null to fall through to the knowledge Q&A.
  function tryAgentic(text: string): string | null {
    const t = text.toLowerCase().trim();
    const go = (label: string, href: string) => { router.push(href); return `Opening ${label}…`; };

    if (/\b(dark mode|dark theme|night mode)\b/.test(t)) { applyTheme('dark'); return 'Switched to dark mode.'; }
    if (/\b(light mode|light theme|day mode)\b/.test(t)) { applyTheme('light'); return 'Switched to light mode.'; }
    if (/\b(system theme|auto theme)\b/.test(t)) { applyTheme('system'); return 'Theme set to follow your system.'; }
    if (/^(search|find)\b/.test(t)) {
      window.dispatchEvent(new KeyboardEvent('keydown', { key: 'k', metaKey: true, bubbles: true }));
      window.dispatchEvent(new KeyboardEvent('keydown', { key: 'k', ctrlKey: true, bubbles: true }));
      return 'Opening the dashboard search — type your query.';
    }
    if (/\b(open|go to|goto|navigate|take me to|show|start|create|new)\b/.test(t)) {
      if (/new inspection|h800/.test(t)) return go('a new H800 inspection', '/dashboard/food/inspection/new');
      if (/registration|register premises|h801/.test(t)) return go('food premises registration', '/dashboard/food/registration');
      if (/sampling|h802/.test(t)) return go('food sampling', '/dashboard/food/sampling');
      if (/food/.test(t)) return go('Food Safety', '/dashboard/food');
      if (/school|vaccine|defect/.test(t)) return go('School Health', '/dashboard/school');
      if (/epidem|disease|outbreak|dengue/.test(t)) return go('Epidemiology', '/dashboard/epidemiology');
      if (/occupation|factory|worker|safety/.test(t)) return go('Occupational Health', '/dashboard/occupational');
      if (/complaint/.test(t)) return go('Complaints', '/dashboard?tab=administration');
      if (/inventory|stock/.test(t)) return go('Inventory', '/dashboard/administration/inventory');
      if (/administ|report|gn |grama/.test(t)) return go('Administration', '/dashboard?tab=administration');
      if (/calendar|schedule|task/.test(t)) return go('the unified calendar', '/dashboard#calendar');
      if (/setting/.test(t)) return go('Settings', '/dashboard/settings');
      if (/profile/.test(t)) return go('your Profile', '/dashboard/profile');
      if (/resource|download|duty/.test(t)) return go('Officer Resources', '/dashboard/resources');
      if (/dashboard|home|overview/.test(t)) return go('the Dashboard', '/dashboard');
    }
    return null;
  }

  async function send(text: string) {
    const q = text.trim();
    if (!q || loading) return;
    const userMsg: ChatMessage = { id: crypto.randomUUID(), role: 'user', content: q };
    setMessages((m) => [...m, userMsg]);
    setInput('');
    setLoading(true);

    // Agentic action first — if it's a "do this" command, execute and reply.
    const action = tryAgentic(q);
    if (action) {
      setMessages((m) => [...m, { id: crypto.randomUUID(), role: 'assistant', content: `✓ ${action}` }]);
      setLoading(false);
      return;
    }

    const cache = loadCache();

    if (!navigator.onLine) {
      const a = offlineAnswer(q, cache);
      setMessages((m) => [...m, { id: crypto.randomUUID(), role: 'assistant', content: a, offline: true }]);
      setLoading(false);
      return;
    }

    try {
      const history = [...messages, userMsg].map((m) => ({ role: m.role, content: m.content }));
      const res = await fetch('/api/ai/copilot', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: history, language }),
      });
      const data = (await res.json()) as { answer?: string; error?: string };
      if (data.answer) {
        cache[q.toLowerCase()] = data.answer;
        saveCache(cache);
        setMessages((m) => [...m, { id: crypto.randomUUID(), role: 'assistant', content: data.answer! }]);
      } else {
        // API unavailable (e.g. no key) → fall back to offline bank
        const a = offlineAnswer(q, cache);
        setMessages((m) => [...m, { id: crypto.randomUUID(), role: 'assistant', content: a, offline: true }]);
      }
    } catch {
      const a = offlineAnswer(q, cache);
      setMessages((m) => [...m, { id: crypto.randomUUID(), role: 'assistant', content: a, offline: true }]);
    } finally {
      setLoading(false);
    }
  }

  if (!mounted) return null; // client-only overlay

  return (
    <div className="print:hidden">
      {/* Launcher */}
      {!open && (
        <button
          onClick={() => setOpen(true)}
          aria-label="Open PHI Assistant"
          className="fixed bottom-5 right-5 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-violet-600 to-indigo-600 text-white shadow-lg shadow-indigo-900/30 transition-transform hover:scale-105 active:scale-95"
        >
          <Sparkles className="h-6 w-6" />
          <span className="absolute -right-0.5 -top-0.5 flex h-3.5 w-3.5">
            <span className={cn('absolute inline-flex h-full w-full rounded-full opacity-75', online ? 'animate-ping bg-emerald-400' : 'bg-amber-400')} />
            <span className={cn('relative inline-flex h-3.5 w-3.5 rounded-full ring-2 ring-white', online ? 'bg-emerald-500' : 'bg-amber-500')} />
          </span>
        </button>
      )}

      {/* Panel */}
      {open && (
        <div className="fixed inset-0 z-50 flex items-end justify-end p-0 sm:bottom-5 sm:right-5 sm:inset-auto sm:p-0">
          <div className="flex h-[100dvh] w-full flex-col bg-white shadow-2xl dark:bg-slate-900 sm:h-[560px] sm:w-[400px] sm:rounded-2xl sm:border sm:border-slate-200 dark:sm:border-slate-700">
            {/* Header */}
            <div className="flex items-center justify-between rounded-t-2xl bg-gradient-to-r from-violet-600 to-indigo-600 px-4 py-3 text-white">
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/15"><Bot className="h-5 w-5" /></div>
                <div className="leading-tight">
                  <p className="flex items-center gap-1.5 text-sm font-bold">
                    PHI Assistant
                    <span className="rounded-full bg-white/20 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider">Agentic</span>
                  </p>
                  <p className="text-[10px] text-indigo-100">
                    {online ? 'Ask, or tell me to navigate & run tasks' : 'Offline mode — cached knowledge'}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <button onClick={() => setOpen(false)} aria-label="Close" className="rounded-md p-1.5 hover:bg-white/15">
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>

            {!online && (
              <div className="flex items-center gap-2 bg-amber-50 px-4 py-2 text-[11px] font-medium text-amber-800 dark:bg-amber-950/40 dark:text-amber-300">
                <WifiOff className="h-3.5 w-3.5" /> No connection — answering from cached &amp; built-in guidance.
              </div>
            )}

            {/* Messages */}
            <div className="flex-1 space-y-3 overflow-y-auto p-3">
              {messages.length === 0 && (
                <div className="flex flex-col items-center py-6 text-center">
                  <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-violet-100 dark:bg-violet-900/30">
                    <Sparkles className="h-6 w-6 text-violet-600 dark:text-violet-400" />
                  </div>
                  <p className="text-sm font-semibold text-slate-800 dark:text-slate-100">How can I help, officer?</p>
                  <p className="mt-1 max-w-[260px] text-xs text-slate-500 dark:text-slate-400">
                    Ask about H800 grading, enforcement notices, the Food Act, or field procedures.
                  </p>
                  <div className="mt-4 w-full space-y-1.5">
                    {STARTERS.map((s) => (
                      <button
                        key={s}
                        onClick={() => send(s)}
                        className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-left text-xs text-slate-700 transition-colors hover:border-violet-300 hover:bg-violet-50 hover:text-violet-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-violet-900/20"
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {messages.map((msg) => (
                <div key={msg.id} className={cn('flex gap-2', msg.role === 'user' ? 'flex-row-reverse' : 'flex-row')}>
                  <div className={cn('flex h-7 w-7 shrink-0 items-center justify-center rounded-full', msg.role === 'user' ? 'bg-blue-600' : 'bg-gradient-to-br from-violet-600 to-indigo-600')}>
                    {msg.role === 'user' ? <User className="h-3.5 w-3.5 text-white" /> : <Bot className="h-3.5 w-3.5 text-white" />}
                  </div>
                  <div className={cn('max-w-[80%] rounded-2xl px-3 py-2 text-[13px] leading-relaxed', msg.role === 'user' ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-200')}>
                    <p className="whitespace-pre-wrap">{msg.content}</p>
                    {msg.offline && <p className="mt-1 text-[10px] font-semibold text-amber-600 dark:text-amber-400">⚡ offline</p>}
                  </div>
                </div>
              ))}

              {loading && (
                <div className="flex gap-2">
                  <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-violet-600 to-indigo-600"><Bot className="h-3.5 w-3.5 text-white" /></div>
                  <div className="flex items-center gap-2 rounded-2xl bg-slate-100 px-3 py-2 dark:bg-slate-800">
                    <Loader2 className="h-3.5 w-3.5 animate-spin text-violet-600" />
                    <span className="text-xs text-slate-500">Thinking…</span>
                  </div>
                </div>
              )}
              <div ref={bottomRef} />
            </div>

            {/* Input */}
            <form onSubmit={(e) => { e.preventDefault(); send(input); }} className="border-t border-slate-200 p-2.5 dark:border-slate-700">
              <div className="flex items-end gap-2">
                <textarea
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(input); } }}
                  rows={1}
                  placeholder="Ask the PHI Assistant…"
                  className="max-h-24 flex-1 resize-none rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-[13px] text-slate-800 placeholder:text-slate-400 focus:border-violet-400 focus:outline-none focus:ring-2 focus:ring-violet-200 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200"
                />
                <button type="submit" disabled={!input.trim() || loading} className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-violet-600 text-white transition-colors hover:bg-violet-700 disabled:opacity-40">
                  <Send className="h-4 w-4" />
                </button>
              </div>
              <p className="mt-1.5 text-center text-[10px] text-slate-400">Guidance only — verify against official MOH circulars.</p>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
