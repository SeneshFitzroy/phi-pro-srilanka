'use client';

// Officer-side dashboard for live citizen chats.
//
// Lists every chat in `citizen_chats` (most recent first), with district
// + status filters. Selecting a chat opens a two-pane workspace: identity
// panel (name, NIC, district, prior triage) on the left and a live
// onSnapshot transcript on the right. The officer can post replies that
// the citizen's chatbot sees in real time.
//
// Routing rules:
//   - 'queued' chats appear first. The first officer to send a reply
//     flips the chat to 'active'.
//   - Officers in the chat's district see those chats highlighted; chats
//     without a district are visible to everyone.
//   - A 'Close chat' button moves status -> 'closed' (citizen sees the
//     status change in their chatbot header).

import { useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import {
  ArrowLeft, Bot, MessageCircle, Send, Loader2, MapPin, IdCard,
  UserCircle2, CheckCircle2, Clock, X, Filter,
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  addDoc,
  collection,
  doc,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  updateDoc,
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/contexts/auth-context';
import { DISTRICTS } from '@/data/phi-officers';

interface ChatDoc {
  id: string;
  citizenName: string;
  nicNumber: string;
  district: string | null;
  status: 'queued' | 'active' | 'closed';
  channel: string;
  lastMessageAt?: { toDate?: () => Date };
  createdAt?: { toDate?: () => Date };
}

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'officer' | 'system';
  content: string;
  createdAt?: { toDate?: () => Date };
}

export default function CitizenChatPage() {
  const { user } = useAuth();
  const [chats, setChats] = useState<ChatDoc[]>([]);
  const [chatsLoading, setChatsLoading] = useState(true);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<'all' | 'queued' | 'active' | 'closed'>('all');
  const [districtFilter, setDistrictFilter] = useState<string>('all');

  /* Subscribe to the chat list */
  useEffect(() => {
    const q = query(collection(db, 'citizen_chats'), orderBy('lastMessageAt', 'desc'));
    const unsub = onSnapshot(
      q,
      (snap) => {
        setChats(snap.docs.map((d) => ({ id: d.id, ...d.data() }) as ChatDoc));
        setChatsLoading(false);
      },
      () => { setChatsLoading(false); },
    );
    return () => unsub();
  }, []);

  const filtered = useMemo(() => chats.filter((c) => {
    if (statusFilter !== 'all' && c.status !== statusFilter) return false;
    if (districtFilter !== 'all' && (c.district ?? '') !== districtFilter) return false;
    return true;
  }), [chats, statusFilter, districtFilter]);

  const active = chats.find((c) => c.id === activeId);

  return (
    <div className="flex h-[calc(100vh-6rem)] flex-col gap-3">
      {/* Header */}
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <Link href="/dashboard/management"><Button variant="ghost" size="icon"><ArrowLeft className="h-5 w-5" /></Button></Link>
          <div>
            <h1 className="flex items-center gap-2 text-xl font-bold">
              <MessageCircle className="h-5 w-5 text-violet-600" /> Citizen chat queue
            </h1>
            <p className="text-xs text-muted-foreground">Live conversations with verified citizens · district-routed</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="rounded-full bg-violet-100 px-2.5 py-1 text-[10px] font-bold text-violet-700 dark:bg-violet-950/40 dark:text-violet-300">
            {chats.filter((c) => c.status === 'queued').length} queued · {chats.filter((c) => c.status === 'active').length} active
          </span>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="flex flex-wrap items-center gap-2 p-3 text-xs">
          <Filter className="h-3.5 w-3.5 text-muted-foreground" />
          <select className="h-8 rounded-md border border-input bg-background px-2 text-xs" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value as typeof statusFilter)}>
            <option value="all">All status</option>
            <option value="queued">Queued</option>
            <option value="active">Active</option>
            <option value="closed">Closed</option>
          </select>
          <select className="h-8 rounded-md border border-input bg-background px-2 text-xs" value={districtFilter} onChange={(e) => setDistrictFilter(e.target.value)}>
            <option value="all">All districts</option>
            <option value="">No district</option>
            {DISTRICTS.map((d) => <option key={d.district} value={d.district}>{d.district}</option>)}
          </select>
          {filtered.length !== chats.length && (
            <Button variant="ghost" size="sm" className="h-7 text-xs" onClick={() => { setStatusFilter('all'); setDistrictFilter('all'); }}>
              <X className="mr-1 h-3 w-3" /> Clear
            </Button>
          )}
        </CardContent>
      </Card>

      {/* Two-pane workspace */}
      <div className="grid flex-1 grid-cols-1 gap-3 overflow-hidden lg:grid-cols-12">
        {/* List */}
        <Card className="lg:col-span-4">
          <CardContent className="h-full overflow-y-auto p-0">
            {chatsLoading ? (
              <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
                <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Loading chats…
              </div>
            ) : filtered.length === 0 ? (
              <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
                No chats match the current filter.
              </div>
            ) : (
              <ul className="divide-y divide-slate-100 dark:divide-slate-800">
                {filtered.map((c) => (
                  <li key={c.id}>
                    <button
                      type="button"
                      onClick={() => setActiveId(c.id)}
                      className={`w-full px-3 py-3 text-left transition-colors hover:bg-slate-50 dark:hover:bg-slate-800/60 ${activeId === c.id ? 'bg-violet-50 dark:bg-violet-950/30' : ''}`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <p className="truncate text-sm font-bold">{c.citizenName || 'Anonymous'}</p>
                          <p className="truncate text-[11px] text-muted-foreground">
                            <span className="font-mono">{c.nicNumber}</span>
                            {c.district && <> · {c.district}</>}
                          </p>
                        </div>
                        <StatusPill status={c.status} />
                      </div>
                      <p className="mt-1 text-[10px] text-muted-foreground">
                        Last activity: {c.lastMessageAt?.toDate?.()?.toLocaleString('en-LK') ?? '—'}
                      </p>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>

        {/* Detail */}
        <Card className="lg:col-span-8">
          <CardContent className="flex h-full flex-col p-0">
            {!active ? (
              <div className="flex h-full flex-col items-center justify-center gap-2 text-sm text-muted-foreground">
                <Bot className="h-12 w-12 text-violet-300" />
                <p className="font-semibold">Select a chat from the list</p>
                <p className="text-xs">Verified citizens appear here as they request live help.</p>
              </div>
            ) : (
              <ActiveChat
                chat={active}
                officerName={user?.displayName || user?.email || 'PHI officer'}
                officerUid={user?.uid ?? null}
              />
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

/* ── Status pill ────────────────────────────────────────────────────── */
function StatusPill({ status }: { status: ChatDoc['status'] }) {
  if (status === 'queued') return <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-1.5 py-0.5 text-[10px] font-bold text-amber-700 dark:bg-amber-950/40 dark:text-amber-300"><Clock className="h-2.5 w-2.5" /> queued</span>;
  if (status === 'active') return <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-1.5 py-0.5 text-[10px] font-bold text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300">● active</span>;
  return <span className="inline-flex items-center gap-1 rounded-full bg-slate-200 px-1.5 py-0.5 text-[10px] font-bold text-slate-600 dark:bg-slate-800 dark:text-slate-300"><CheckCircle2 className="h-2.5 w-2.5" /> closed</span>;
}

/* ── Active chat pane ───────────────────────────────────────────────── */
function ActiveChat({ chat, officerName, officerUid }: { chat: ChatDoc; officerName: string; officerUid: string | null }) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const bottomRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const q = query(collection(db, 'citizen_chats', chat.id, 'messages'), orderBy('createdAt', 'asc'));
    const unsub = onSnapshot(q, (snap) => {
      setMessages(snap.docs.map((d) => ({ id: d.id, ...d.data() }) as ChatMessage));
    });
    return () => unsub();
  }, [chat.id]);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

  const send = async () => {
    const text = input.trim();
    if (!text) return;
    setSending(true);
    try {
      await addDoc(collection(db, 'citizen_chats', chat.id, 'messages'), {
        role: 'officer',
        content: text,
        createdAt: serverTimestamp(),
        officerName,
        officerUid,
      });
      // First officer reply flips status -> active.
      await updateDoc(doc(db, 'citizen_chats', chat.id), {
        status: chat.status === 'closed' ? 'active' : 'active',
        lastMessageAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        assignedOfficerUid: officerUid,
        assignedOfficerName: officerName,
      });
      setInput('');
    } catch { /* ignore */ }
    finally { setSending(false); }
  };

  const closeChat = async () => {
    try { await updateDoc(doc(db, 'citizen_chats', chat.id), { status: 'closed', updatedAt: serverTimestamp() }); } catch { /* */ }
  };

  return (
    <div className="grid h-full grid-cols-1 lg:grid-cols-[260px_1fr]">
      {/* Identity panel */}
      <div className="border-b border-slate-200 bg-slate-50 p-3 text-xs dark:border-slate-800 dark:bg-slate-900/40 lg:border-b-0 lg:border-r">
        <div className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-violet-100 text-violet-700 dark:bg-violet-950/40 dark:text-violet-300">
            <UserCircle2 className="h-5 w-5" />
          </div>
          <div className="min-w-0">
            <p className="truncate font-bold text-slate-900 dark:text-white">{chat.citizenName || 'Anonymous'}</p>
            <p className="truncate text-[10px] text-muted-foreground">{chat.channel}</p>
          </div>
        </div>
        <dl className="mt-3 space-y-2">
          <div>
            <dt className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-widest text-slate-400">
              <IdCard className="h-3 w-3" /> NIC
            </dt>
            <dd className="font-mono">{chat.nicNumber}</dd>
          </div>
          <div>
            <dt className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-widest text-slate-400">
              <MapPin className="h-3 w-3" /> District
            </dt>
            <dd>{chat.district ?? <span className="text-slate-400">— not detected</span>}</dd>
          </div>
          <div>
            <dt className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Started</dt>
            <dd>{chat.createdAt?.toDate?.()?.toLocaleString('en-LK') ?? '—'}</dd>
          </div>
          <div>
            <dt className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Status</dt>
            <dd><StatusPill status={chat.status} /></dd>
          </div>
        </dl>
        <div className="mt-4 flex flex-col gap-2">
          {chat.status !== 'closed' && (
            <Button type="button" variant="outline" size="sm" onClick={closeChat} className="text-xs">
              Close chat
            </Button>
          )}
        </div>
      </div>

      {/* Transcript + composer */}
      <div className="flex h-full min-h-0 flex-col">
        <div className="flex-1 space-y-2 overflow-y-auto bg-slate-50 p-3 dark:bg-slate-950/40">
          {messages.length === 0 && (
            <p className="py-8 text-center text-xs text-muted-foreground">Waiting for the first message…</p>
          )}
          {messages.map((m) => (
            <div key={m.id} className={m.role === 'officer' ? 'flex justify-end' : 'flex justify-start'}>
              <div className={`max-w-[80%] rounded-2xl px-3 py-2 text-sm leading-relaxed shadow-sm ${
                m.role === 'officer'
                  ? 'bg-blue-600 text-white'
                  : m.role === 'system'
                  ? 'border border-emerald-200 bg-emerald-50 text-emerald-900 dark:border-emerald-900 dark:bg-emerald-950/30 dark:text-emerald-200'
                  : m.role === 'assistant'
                  ? 'bg-violet-100 text-violet-900 dark:bg-violet-950/40 dark:text-violet-100'
                  : 'bg-white text-slate-800 dark:bg-slate-800 dark:text-slate-100'
              }`}>
                <p className="mb-0.5 text-[10px] font-bold uppercase tracking-widest opacity-70">
                  {m.role === 'officer' ? 'You' : m.role === 'assistant' ? 'AI assistant' : m.role === 'system' ? 'System' : 'Citizen'}
                </p>
                <p className="whitespace-pre-wrap">{m.content}</p>
                <p className="mt-1 text-[10px] opacity-70">
                  {m.createdAt?.toDate?.()?.toLocaleTimeString('en-LK', { hour: '2-digit', minute: '2-digit' }) ?? ''}
                </p>
              </div>
            </div>
          ))}
          <div ref={bottomRef} />
        </div>

        <form className="flex items-end gap-2 border-t border-slate-200 p-2 dark:border-slate-800" onSubmit={(e) => { e.preventDefault(); void send(); }}>
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); void send(); } }}
            placeholder={chat.status === 'closed' ? 'This chat is closed.' : 'Reply to the citizen…'}
            rows={2}
            disabled={chat.status === 'closed'}
            className="flex-1 resize-none rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 placeholder:text-slate-400 focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-200 disabled:opacity-60 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
          />
          <button
            type="submit"
            disabled={!input.trim() || sending || chat.status === 'closed'}
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-40"
            aria-label="Send reply"
          >
            <Send className="h-4 w-4" />
          </button>
        </form>
      </div>
    </div>
  );
}
