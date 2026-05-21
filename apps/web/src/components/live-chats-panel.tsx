'use client';

// LiveChatsPanel — compact officer view of live citizen chats (citizen_chats),
// embedded as a separate section inside Public Complaints. Lists the queue and
// lets an officer reply to one citizen at a time inline (real-time transcript).

import { useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { MessageCircle, Send, Loader2, IdCard, MapPin, Clock, CheckCircle2, ExternalLink } from 'lucide-react';
import { addDoc, collection, doc, onSnapshot, orderBy, query, serverTimestamp, updateDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/contexts/auth-context';

interface ChatDoc {
  id: string;
  citizenName?: string;
  nicNumber?: string;
  district?: string | null;
  status: 'queued' | 'active' | 'closed';
  lastMessageAt?: { toDate?: () => Date };
}
interface ChatMessage { id: string; role: 'user' | 'assistant' | 'officer' | 'system'; content: string; createdAt?: { toDate?: () => Date } }

function StatusPill({ status }: { status: ChatDoc['status'] }) {
  if (status === 'queued') return <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-1.5 py-0.5 text-[10px] font-bold text-amber-700 dark:bg-amber-950/40 dark:text-amber-300"><Clock className="h-2.5 w-2.5" /> queued</span>;
  if (status === 'active') return <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-1.5 py-0.5 text-[10px] font-bold text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300">● active</span>;
  return <span className="inline-flex items-center gap-1 rounded-full bg-slate-200 px-1.5 py-0.5 text-[10px] font-bold text-slate-600 dark:bg-slate-800 dark:text-slate-300"><CheckCircle2 className="h-2.5 w-2.5" /> closed</span>;
}

export function LiveChatsPanel() {
  const { user } = useAuth();
  const [chats, setChats] = useState<ChatDoc[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<'open' | 'queued' | 'active' | 'closed' | 'all'>('open');

  useEffect(() => {
    const q = query(collection(db, 'citizen_chats'), orderBy('lastMessageAt', 'desc'));
    const unsub = onSnapshot(q,
      (snap) => { setChats(snap.docs.map((d) => ({ id: d.id, ...d.data() }) as ChatDoc)); setLoading(false); },
      () => setLoading(false),
    );
    return () => unsub();
  }, []);

  const filtered = useMemo(() => chats.filter((c) => {
    if (statusFilter === 'open') return c.status !== 'closed';
    if (statusFilter === 'all') return true;
    return c.status === statusFilter;
  }), [chats, statusFilter]);

  const active = chats.find((c) => c.id === activeId) || null;
  const queued = chats.filter((c) => c.status === 'queued').length;
  const activeCount = chats.filter((c) => c.status === 'active').length;

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-sm text-muted-foreground">
          <span className="font-semibold text-foreground">{queued}</span> queued · <span className="font-semibold text-foreground">{activeCount}</span> active — reply to one citizen at a time below.
        </p>
        <div className="flex items-center gap-2">
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value as typeof statusFilter)} className="h-8 rounded-md border border-input bg-background px-2 text-xs">
            <option value="open">Open (queued + active)</option>
            <option value="queued">Queued</option>
            <option value="active">Active</option>
            <option value="closed">Closed</option>
            <option value="all">All</option>
          </select>
          <Link href="/dashboard/management/citizen-chat" className="inline-flex h-8 items-center gap-1 rounded-md border border-slate-200 px-2 text-xs font-semibold text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300">
            <ExternalLink className="h-3 w-3" /> Full workspace
          </Link>
        </div>
      </div>

      <div className="grid gap-3 lg:grid-cols-12">
        {/* List */}
        <div className="lg:col-span-4 rounded-xl border border-slate-200 dark:border-slate-800">
          <div className="max-h-[28rem] overflow-y-auto">
            {loading ? (
              <div className="flex items-center justify-center gap-2 py-10 text-sm text-muted-foreground"><Loader2 className="h-4 w-4 animate-spin" /> Loading chats…</div>
            ) : filtered.length === 0 ? (
              <div className="px-3 py-10 text-center text-sm text-muted-foreground"><MessageCircle className="mx-auto mb-2 h-8 w-8 text-violet-300" />No live chats in this view.</div>
            ) : (
              <ul className="divide-y divide-slate-100 dark:divide-slate-800">
                {filtered.map((c) => (
                  <li key={c.id}>
                    <button type="button" onClick={() => setActiveId(c.id)} className={`w-full px-3 py-2.5 text-left transition-colors hover:bg-slate-50 dark:hover:bg-slate-800/60 ${activeId === c.id ? 'bg-violet-50 dark:bg-violet-950/30' : ''}`}>
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <p className="truncate text-sm font-bold">{c.citizenName || 'Anonymous'}</p>
                          <p className="truncate text-[11px] text-muted-foreground"><span className="font-mono">{c.nicNumber || '—'}</span>{c.district && <> · {c.district}</>}</p>
                        </div>
                        <StatusPill status={c.status} />
                      </div>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        {/* Reply pane */}
        <div className="lg:col-span-8 rounded-xl border border-slate-200 dark:border-slate-800">
          {!active ? (
            <div className="flex h-full min-h-[20rem] flex-col items-center justify-center gap-2 p-6 text-center text-sm text-muted-foreground">
              <MessageCircle className="h-10 w-10 text-violet-300" />
              <p className="font-semibold">Select a chat to reply</p>
            </div>
          ) : (
            <ChatReply chat={active} officerName={user?.displayName || user?.email || 'PHI officer'} officerUid={user?.uid ?? null} />
          )}
        </div>
      </div>
    </div>
  );
}

function ChatReply({ chat, officerName, officerUid }: { chat: ChatDoc; officerName: string; officerUid: string | null }) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const bottomRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const q = query(collection(db, 'citizen_chats', chat.id, 'messages'), orderBy('createdAt', 'asc'));
    const unsub = onSnapshot(q, (snap) => setMessages(snap.docs.map((d) => ({ id: d.id, ...d.data() }) as ChatMessage)));
    return () => unsub();
  }, [chat.id]);
  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

  const send = async () => {
    const text = input.trim();
    if (!text) return;
    setSending(true);
    try {
      await addDoc(collection(db, 'citizen_chats', chat.id, 'messages'), { role: 'officer', content: text, createdAt: serverTimestamp(), officerName, officerUid });
      await updateDoc(doc(db, 'citizen_chats', chat.id), { status: 'active', lastMessageAt: serverTimestamp(), updatedAt: serverTimestamp(), assignedOfficerUid: officerUid, assignedOfficerName: officerName });
      setInput('');
    } catch { /* ignore */ } finally { setSending(false); }
  };

  const closeChat = async () => { try { await updateDoc(doc(db, 'citizen_chats', chat.id), { status: 'closed', updatedAt: serverTimestamp() }); } catch { /* */ } };

  return (
    <div className="flex h-full min-h-[20rem] flex-col">
      <div className="flex items-center justify-between gap-2 border-b border-slate-100 px-3 py-2 dark:border-slate-800">
        <div className="min-w-0 text-xs">
          <p className="truncate font-bold text-slate-900 dark:text-white">{chat.citizenName || 'Anonymous'}</p>
          <p className="flex items-center gap-2 truncate text-[10px] text-muted-foreground">
            <span className="inline-flex items-center gap-1"><IdCard className="h-3 w-3" />{chat.nicNumber || '—'}</span>
            {chat.district && <span className="inline-flex items-center gap-1"><MapPin className="h-3 w-3" />{chat.district}</span>}
          </p>
        </div>
        {chat.status !== 'closed' && <button onClick={closeChat} className="rounded-md border border-slate-200 px-2 py-1 text-[11px] font-semibold text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300">Close chat</button>}
      </div>

      <div className="flex-1 space-y-2 overflow-y-auto bg-slate-50 p-3 dark:bg-slate-950/40">
        {messages.length === 0 && <p className="py-8 text-center text-xs text-muted-foreground">Waiting for the first message…</p>}
        {messages.map((m) => (
          <div key={m.id} className={m.role === 'officer' ? 'flex justify-end' : 'flex justify-start'}>
            <div className={`max-w-[80%] rounded-2xl px-3 py-2 text-sm leading-relaxed shadow-sm ${m.role === 'officer' ? 'bg-blue-600 text-white' : m.role === 'assistant' ? 'bg-violet-100 text-violet-900 dark:bg-violet-950/40 dark:text-violet-100' : 'bg-white text-slate-800 dark:bg-slate-800 dark:text-slate-100'}`}>
              <p className="mb-0.5 text-[10px] font-bold uppercase tracking-widest opacity-70">{m.role === 'officer' ? 'You' : m.role === 'assistant' ? 'AI assistant' : 'Citizen'}</p>
              <p className="whitespace-pre-wrap">{m.content}</p>
            </div>
          </div>
        ))}
        <div ref={bottomRef} />
      </div>

      <form className="flex items-end gap-2 border-t border-slate-200 p-2 dark:border-slate-800" onSubmit={(e) => { e.preventDefault(); void send(); }}>
        <textarea value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); void send(); } }} placeholder={chat.status === 'closed' ? 'This chat is closed.' : 'Reply to the citizen…'} rows={2} disabled={chat.status === 'closed'} className="flex-1 resize-none rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-200 disabled:opacity-60 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100" />
        <button type="submit" disabled={!input.trim() || sending || chat.status === 'closed'} className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-40" aria-label="Send reply"><Send className="h-4 w-4" /></button>
      </form>
    </div>
  );
}
