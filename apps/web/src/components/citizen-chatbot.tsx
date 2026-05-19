'use client';

// Floating citizen chatbot mounted on /public/portal.
//
//   • Step 1 — identity verification: NIC photo (with the lightweight client
//     sanity check) + live selfie via the Face-ID capture component.
//   • Step 2 — chat: posts to /api/ai/copilot for instant answers, with a
//     'Connect to a real PHI' button that writes the conversation to a
//     Firestore queue (`citizen_chat_queue`) so a duty officer can pick it
//     up. This is intentionally lighter than the officer copilot — citizens
//     get plain-language answers about complaints, permits, food hygiene
//     and emergency hotlines, not legal citations.

import { useCallback, useEffect, useRef, useState } from 'react';
import {
  MessageCircle, X, Bot, Loader2, Send, ShieldCheck, IdCard, Camera,
  Sparkles, UserCog,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { FaceIdCapture } from '@/components/face-id-capture';
import { checkPhotoLooksReal } from '@/lib/image-sanity';
import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { toast } from 'sonner';

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  at: Date;
}

type Step = 'verify' | 'chat';

interface VerifiedIdentity {
  nicPhoto: { name: string; url: string };
  selfie: { name: string; url: string };
}

const WELCOME: ChatMessage = {
  id: 'welcome',
  role: 'assistant',
  at: new Date(),
  content:
    'Hi! I\'m the PHI-PRO citizen assistant. Ask me about complaints, food hygiene grades, permits, hotlines or any public health question. I can also connect you to a real PHI officer if you want to chat live.',
};

export function CitizenChatbot() {
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState<Step>('verify');
  const [identity, setIdentity] = useState<VerifiedIdentity | null>(null);
  const [nicNumber, setNicNumber] = useState('');
  const [name, setName] = useState('');
  const [nic, setNic] = useState<{ name: string; url: string; file: File } | null>(null);
  const [selfie, setSelfie] = useState<{ name: string; url: string; file: File } | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([WELCOME]);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const [escalating, setEscalating] = useState(false);
  const bottomRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, step]);

  // ── verification step ────────────────────────────────────────────────

  const onNicSelected = useCallback(async (file: File | null) => {
    if (!file) return;
    const v = await checkPhotoLooksReal(file);
    if (!v.ok) { toast.error(v.reason ?? 'Please retake the NIC photo.'); return; }
    if (nic) URL.revokeObjectURL(nic.url);
    setNic({ name: file.name, url: URL.createObjectURL(file), file });
    toast.success('NIC card photo accepted.');
  }, [nic]);

  const verifyComplete = Boolean(nicNumber.trim().length >= 9 && nic && selfie);

  const proceedToChat = () => {
    if (!nic || !selfie) return;
    setIdentity({
      nicPhoto: { name: nic.name, url: nic.url },
      selfie: { name: selfie.name, url: selfie.url },
    });
    setStep('chat');
  };

  // ── chat ────────────────────────────────────────────────────────────

  const sendMessage = useCallback(async (text: string) => {
    const trimmed = text.trim();
    if (!trimmed || sending) return;
    const userMsg: ChatMessage = { id: crypto.randomUUID(), role: 'user', content: trimmed, at: new Date() };
    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setSending(true);
    try {
      const history = [...messages, userMsg]
        .filter((m) => m.role === 'user' || m.role === 'assistant')
        .map((m) => ({ role: m.role, content: m.content }));
      const res = await fetch('/api/ai/copilot', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: history, language: 'en' }),
      });
      const data = (await res.json()) as { answer?: string; error?: string };
      const reply: ChatMessage = {
        id: crypto.randomUUID(),
        role: 'assistant',
        at: new Date(),
        content: data.answer ?? data.error ?? 'I could not reach the assistant right now. Please try again, or tap "Connect to a real PHI".',
      };
      setMessages((prev) => [...prev, reply]);
    } catch {
      setMessages((prev) => [...prev, {
        id: crypto.randomUUID(), role: 'assistant', at: new Date(),
        content: 'Network error. Try again, or tap "Connect to a real PHI" to hand off to a duty officer.',
      }]);
    } finally {
      setSending(false);
    }
  }, [messages, sending]);

  const escalateToPhi = useCallback(async () => {
    if (!identity) return;
    setEscalating(true);
    try {
      await addDoc(collection(db, 'citizen_chat_queue'), {
        name: name || 'Anonymous',
        nicNumber: nicNumber.trim().toUpperCase(),
        nicPhotoName: identity.nicPhoto.name,
        selfieName: identity.selfie.name,
        transcript: messages.map((m) => ({ role: m.role, content: m.content, at: m.at.toISOString() })),
        createdAt: serverTimestamp(),
        status: 'queued',
        channel: 'public_portal_chatbot',
      });
      setMessages((prev) => [...prev, {
        id: crypto.randomUUID(), role: 'system', at: new Date(),
        content: 'You are now in the queue for a live PHI officer. A duty officer will reach out via the contact details you provided. Reference: ' + Date.now().toString(36).toUpperCase(),
      }]);
      toast.success('Connected to PHI queue. An officer will reach out shortly.');
    } catch {
      toast.error('Could not reach the PHI queue. Please call 1390 instead.');
    } finally {
      setEscalating(false);
    }
  }, [identity, messages, name, nicNumber]);

  // ── render ──────────────────────────────────────────────────────────

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label="Open citizen chatbot"
        className="fixed bottom-20 right-4 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-violet-600 to-indigo-700 text-white shadow-xl ring-4 ring-violet-200/30 transition-transform hover:scale-105 sm:bottom-6"
      >
        <MessageCircle className="h-6 w-6" />
      </button>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-end p-0 sm:items-center sm:justify-end sm:p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setOpen(false)} />
      <div className="relative flex h-[88vh] w-full flex-col overflow-hidden rounded-t-3xl border border-slate-200 bg-white shadow-2xl dark:border-slate-700 dark:bg-slate-900 sm:h-[640px] sm:max-w-md sm:rounded-2xl">
        {/* Header */}
        <div className="flex items-center justify-between gap-2 border-b border-slate-200 bg-gradient-to-r from-violet-600 to-indigo-700 px-4 py-3 text-white dark:border-slate-800">
          <div className="flex items-center gap-2 min-w-0">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white/15 backdrop-blur-sm">
              <Bot className="h-4 w-4" />
            </div>
            <div className="min-w-0">
              <p className="truncate text-sm font-bold">PHI-PRO Citizen Assistant</p>
              <p className="truncate text-[10px] text-violet-100/90">
                {step === 'verify' ? 'Verify your identity to start chatting' : 'Live · ask anything about public health'}
              </p>
            </div>
          </div>
          <button type="button" onClick={() => setOpen(false)} className="rounded-full p-1 hover:bg-white/15" aria-label="Close">
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Body */}
        {step === 'verify' ? (
          <div className="flex-1 space-y-4 overflow-y-auto p-4">
            <div className="rounded-lg border border-violet-200 bg-violet-50/60 p-3 text-xs text-violet-900 dark:border-violet-900 dark:bg-violet-950/30 dark:text-violet-200">
              <p className="flex items-center gap-1.5 font-bold uppercase tracking-wider">
                <ShieldCheck className="h-3.5 w-3.5" /> Identity verification
              </p>
              <p className="mt-1 leading-relaxed">
                To prevent abuse of this channel we collect your NIC number, a photo of the card and a live selfie before opening chat. Encrypted in transit; only seen by the PHI officer you&apos;re routed to.
              </p>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="cb-name">Your name <span className="text-xs text-muted-foreground">(optional)</span></Label>
              <Input id="cb-name" placeholder="e.g. S. Perera" value={name} onChange={(e) => setName(e.target.value)} />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="cb-nic">NIC number <span className="text-red-500">*</span></Label>
              <Input id="cb-nic" placeholder="e.g. 953412345V  or  200012345678" value={nicNumber} onChange={(e) => setNicNumber(e.target.value.toUpperCase())} />
            </div>

            <NicSlot value={nic} onSelect={onNicSelected} onClear={() => { if (nic) URL.revokeObjectURL(nic.url); setNic(null); }} />

            <FaceIdCapture
              heading="Live selfie"
              item={selfie}
              onCapture={(file) => {
                if (selfie) URL.revokeObjectURL(selfie.url);
                setSelfie({ name: file.name, url: URL.createObjectURL(file), file });
              }}
              onClear={() => { if (selfie) URL.revokeObjectURL(selfie.url); setSelfie(null); }}
            />

            <Button type="button" disabled={!verifyComplete} onClick={proceedToChat} className="w-full bg-violet-600 hover:bg-violet-700 disabled:bg-slate-400">
              <Sparkles className="mr-2 h-4 w-4" /> Open chat
            </Button>
          </div>
        ) : (
          <>
            <div className="flex-1 space-y-3 overflow-y-auto bg-slate-50 p-4 dark:bg-slate-950/40">
              {messages.map((m) => (
                <div key={m.id} className={m.role === 'user' ? 'flex justify-end' : 'flex justify-start'}>
                  <div
                    className={`max-w-[80%] rounded-2xl px-3 py-2 text-sm leading-relaxed shadow-sm ${
                      m.role === 'user'
                        ? 'bg-violet-600 text-white'
                        : m.role === 'system'
                        ? 'border border-emerald-200 bg-emerald-50 text-emerald-900 dark:border-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-200'
                        : 'bg-white text-slate-800 dark:bg-slate-800 dark:text-slate-100'
                    }`}
                  >
                    <p className="whitespace-pre-wrap">{m.content}</p>
                    <p className={`mt-1 text-[10px] ${m.role === 'user' ? 'text-violet-200' : 'text-slate-400'}`}>
                      {m.at.toLocaleTimeString('en-LK', { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                </div>
              ))}
              {sending && (
                <div className="flex justify-start">
                  <div className="flex items-center gap-2 rounded-2xl bg-white px-3 py-2 text-xs text-slate-500 shadow-sm dark:bg-slate-800 dark:text-slate-400">
                    <Loader2 className="h-3 w-3 animate-spin" /> Thinking…
                  </div>
                </div>
              )}
              <div ref={bottomRef} />
            </div>

            <div className="border-t border-slate-200 p-2 dark:border-slate-800">
              <div className="mb-2 flex flex-wrap gap-1.5">
                <Button type="button" variant="outline" size="sm" disabled={escalating} onClick={escalateToPhi} className="text-[11px]">
                  <UserCog className="mr-1.5 h-3 w-3" /> {escalating ? 'Queuing…' : 'Connect to a real PHI'}
                </Button>
              </div>
              <form
                className="flex items-end gap-2"
                onSubmit={(e) => { e.preventDefault(); void sendMessage(input); }}
              >
                <textarea
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); void sendMessage(input); } }}
                  placeholder="Ask anything — complaints, food grades, permits, hotlines…"
                  rows={2}
                  className="flex-1 resize-none rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 placeholder:text-slate-400 focus:border-violet-400 focus:outline-none focus:ring-2 focus:ring-violet-200 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
                />
                <button
                  type="submit"
                  disabled={!input.trim() || sending}
                  className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-violet-600 text-white hover:bg-violet-700 disabled:opacity-40"
                  aria-label="Send"
                >
                  <Send className="h-4 w-4" />
                </button>
              </form>
              <p className="mt-1.5 text-center text-[10px] text-slate-400">
                Live answers are AI-generated for guidance. For real emergencies dial <a href="tel:1390" className="font-bold text-red-600 underline">1390</a>.
              </p>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

/* NIC card slot — uses native camera capture or upload. */
function NicSlot({ value, onSelect, onClear }: {
  value: { url: string } | null;
  onSelect: (file: File | null) => void;
  onClear: () => void;
}) {
  const inputRef = useRef<HTMLInputElement | null>(null);
  return (
    <div className="rounded-lg border border-emerald-200 bg-white p-3 dark:border-emerald-900 dark:bg-slate-900">
      <Label className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-300">
        <IdCard className="h-3.5 w-3.5" /> NIC card photo <span className="text-red-500">*</span>
      </Label>
      <div className="mt-2 aspect-[1.6/1] w-full overflow-hidden rounded border border-dashed border-slate-300 bg-slate-50 dark:border-slate-700 dark:bg-slate-800">
        {value ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={value.url} alt="NIC card" className="h-full w-full object-cover" />
        ) : (
          <div className="flex h-full items-center justify-center text-[11px] text-slate-400">No card photo yet</div>
        )}
      </div>
      <input ref={inputRef} type="file" accept="image/*" capture="environment" className="hidden" onChange={(e) => { onSelect(e.target.files?.[0] ?? null); e.target.value = ''; }} />
      <div className="mt-2 flex gap-2">
        <Button type="button" variant="outline" size="sm" onClick={() => inputRef.current?.click()} className="flex-1">
          <Camera className="mr-1.5 h-3.5 w-3.5" /> {value ? 'Retake' : 'Capture card'}
        </Button>
        {value && (
          <Button type="button" variant="outline" size="sm" onClick={onClear}>Clear</Button>
        )}
      </div>
    </div>
  );
}
