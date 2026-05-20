'use client';

// Floating citizen chatbot mounted on /public/portal.
//
//   • Step 1 — identity + location: NIC number, NIC photo (image-sanity
//     check), live selfie (FaceIdCapture). Geolocation is captured in the
//     background and reverse-geocoded to a Sri Lankan district so the
//     downstream PHI handoff lands with the nearest duty officer.
//   • Step 2 — chat: posts to /api/ai/copilot for instant answers, with a
//     'Connect to a live PHI officer' button. Once escalated, the chat
//     turns into a real Firestore-backed two-way conversation
//     (subcollection citizen_chats/{chatId}/messages) so the assigned
//     officer can reply live and the citizen sees the reply in-place.
//
// The mobile layout is full-bleed sheet (100dvh) with a compact 44px
// header so the form scrolls comfortably on a phone — the previous
// 88vh + 2-line header was cropping content as you saw in the bug report.

import { useCallback, useEffect, useRef, useState } from 'react';
import {
  MessageCircle, X, Bot, Loader2, Send, ShieldCheck, IdCard, Camera,
  Sparkles, UserCog, MapPin,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { FaceIdCapture } from '@/components/face-id-capture';
import { checkPhotoLooksReal } from '@/lib/image-sanity';
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
import { toast } from 'sonner';
import { DISTRICTS } from '@/data/phi-officers';

interface UiMessage {
  id: string;
  role: 'user' | 'assistant' | 'officer' | 'system';
  content: string;
  at: Date;
}

type Step = 'verify' | 'chat';

interface VerifiedIdentity {
  nicPhoto: { name: string; url: string };
  selfie: { name: string; url: string };
  district: string | null;
  coords: { lat: number; lng: number } | null;
}

const WELCOME: UiMessage = {
  id: 'welcome',
  role: 'assistant',
  at: new Date(),
  content:
    'Hi! I\'m the PHI-PRO citizen assistant. Ask me about complaints, food hygiene grades, permits or any public health question. I can also connect you to a real PHI officer in your district if you want to chat live.',
};

export function CitizenChatbot() {
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState<Step>('verify');

  // identity state
  const [identity, setIdentity] = useState<VerifiedIdentity | null>(null);
  const [nicNumber, setNicNumber] = useState('');
  const [name, setName] = useState('');
  const [nic, setNic] = useState<{ name: string; url: string; file: File } | null>(null);
  const [selfie, setSelfie] = useState<{ name: string; url: string; file: File } | null>(null);
  const [district, setDistrict] = useState<string>('');
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [locStatus, setLocStatus] = useState<'idle' | 'getting' | 'ok' | 'denied'>('idle');

  /* Manual one-tap location detect — works even after the user denied the
     first auto-prompt, or if they want to refresh their position. */
  const detectLocation = useCallback(() => {
    if (!('geolocation' in navigator)) { setLocStatus('denied'); return; }
    setLocStatus('getting');
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const c = { lat: pos.coords.latitude, lng: pos.coords.longitude };
        setCoords(c);
        try {
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${c.lat}&lon=${c.lng}&zoom=10&addressdetails=1&accept-language=en`,
            { headers: { Accept: 'application/json' } },
          );
          const j = await res.json() as { address?: Record<string, string> };
          const raw = (j.address?.county || j.address?.state_district || j.address?.region || '').toLowerCase();
          const matched = DISTRICTS.find((d) => raw.includes(d.district.toLowerCase()));
          if (matched) {
            setDistrict(matched.district);
            toast.success(`Detected: ${matched.district}`);
          } else {
            toast.message('Location captured — please pick your district below.');
          }
        } catch { toast.message('Location captured. Reverse geocode unavailable — pick district below.'); }
        setLocStatus('ok');
      },
      () => { setLocStatus('denied'); toast.error('Location permission denied. Pick your district below.'); },
      { enableHighAccuracy: false, timeout: 8000, maximumAge: 60_000 },
    );
  }, []);

  // chat state
  const [messages, setMessages] = useState<UiMessage[]>([WELCOME]);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const [escalating, setEscalating] = useState(false);
  const [chatId, setChatId] = useState<string | null>(null);
  const [officerOnline, setOfficerOnline] = useState(false);
  const bottomRef = useRef<HTMLDivElement | null>(null);

  /* Auto-detect on first open — silent. Users can still tap the dedicated
     button below to re-run if they originally denied or want to refresh. */
  useEffect(() => {
    if (!open || step !== 'verify' || coords || locStatus !== 'idle') return;
    detectLocation();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, step]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, step]);

  /* ── verification step ────────────────────────────────────────────── */

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
      district: district || null,
      coords,
    });
    setStep('chat');
  };

  /* ── AI chat (pre-escalation) ─────────────────────────────────────── */

  const sendMessage = useCallback(async (text: string) => {
    const trimmed = text.trim();
    if (!trimmed || sending) return;
    const userMsg: UiMessage = { id: crypto.randomUUID(), role: 'user', content: trimmed, at: new Date() };
    setMessages((prev) => [...prev, userMsg]);
    setInput('');

    // If we're already in a Firestore chat, write to the messages
    // subcollection — the onSnapshot listener will echo it back.
    if (chatId) {
      try {
        await addDoc(collection(db, 'citizen_chats', chatId, 'messages'), {
          role: 'user',
          content: trimmed,
          createdAt: serverTimestamp(),
        });
      } catch {
        toast.error('Could not send message. Try again.');
      }
      return;
    }

    // Otherwise call the AI copilot for a quick reply.
    setSending(true);
    try {
      const history = [...messages, userMsg]
        .filter((m) => m.role === 'user' || m.role === 'assistant')
        .map((m) => ({ role: m.role === 'assistant' ? 'assistant' : 'user', content: m.content }));
      const res = await fetch('/api/ai/copilot', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: history, language: 'en' }),
      });
      const data = (await res.json()) as { answer?: string; error?: string };
      setMessages((prev) => [...prev, {
        id: crypto.randomUUID(), role: 'assistant', at: new Date(),
        content: data.answer ?? data.error ?? 'I could not reach the assistant right now. Try the "Connect to a live PHI" button.',
      }]);
    } catch {
      setMessages((prev) => [...prev, {
        id: crypto.randomUUID(), role: 'assistant', at: new Date(),
        content: 'Network error. Try again, or tap "Connect to a live PHI" to hand off to a duty officer.',
      }]);
    } finally {
      setSending(false);
    }
  }, [chatId, messages, sending]);

  /* ── escalate to a real PHI ───────────────────────────────────────── */

  const escalateToPhi = useCallback(async () => {
    if (!identity || escalating || chatId) return;
    setEscalating(true);
    try {
      // Create the chat document with district routing metadata. PHI
      // officers see chats addressed to their district first.
      const docRef = await addDoc(collection(db, 'citizen_chats'), {
        citizenName: name || 'Anonymous',
        nicNumber: nicNumber.trim().toUpperCase(),
        nicPhotoName: identity.nicPhoto.name,
        selfieName: identity.selfie.name,
        district: identity.district ?? null,
        coords: identity.coords ?? null,
        status: 'queued',           // queued -> active -> closed
        channel: 'public_portal_chatbot',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        lastMessageAt: serverTimestamp(),
      });
      setChatId(docRef.id);

      // Seed the messages subcollection with the prior AI transcript so
      // the officer has full context. Failures here are non-fatal — the
      // chat itself is created already.
      for (const m of messages.filter((mm) => mm.role === 'user' || mm.role === 'assistant')) {
        try {
          await addDoc(collection(db, 'citizen_chats', docRef.id, 'messages'), {
            role: m.role,
            content: m.content,
            createdAt: serverTimestamp(),
            seed: true,
          });
        } catch { /* seed failure is non-fatal */ }
      }

      setMessages((prev) => [...prev, {
        id: crypto.randomUUID(), role: 'system', at: new Date(),
        content: identity.district
          ? `Connecting you to a PHI officer in ${identity.district}… you'll see their replies here as soon as they pick up.`
          : 'Connecting you to the next available PHI officer… you\'ll see their replies here as soon as they pick up.',
      }]);
      toast.success('Connected to the PHI queue.');
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      // The live two-way queue (citizen_chats) needs its Firestore rules
      // deployed. If it's denied/unavailable we DON'T dead-end the citizen —
      // we fall back to filing a one-way "live chat request" into the
      // public_complaints inbox (whose rules are already in production), so
      // a duty officer still receives it. The citizen gets a tracking ref.
      const isPermission = /permission|insufficient|missing|denied/i.test(msg);
      const isNetwork = /network|offline|failed to fetch/i.test(msg);

      if (!isNetwork) {
        try {
          const trackingId = `CHAT-${Date.now().toString(36).toUpperCase()}`;
          const transcript = messages
            .filter((m) => m.role === 'user' || m.role === 'assistant')
            .map((m) => `${m.role === 'user' ? 'Citizen' : 'AI'}: ${m.content}`)
            .join('\n');
          await addDoc(collection(db, 'public_complaints'), {
            trackingId,
            type: 'Live chat request',
            description: `Citizen requested a live PHI chat from the portal assistant.\n\nNIC: ${nicNumber.trim().toUpperCase()}\nName: ${name || 'Anonymous'}\n\n--- Conversation so far ---\n${transcript || '(no prior messages)'}`,
            location: identity.district ?? 'Not specified',
            district: identity.district ?? 'Not specified',
            status: 'new',
            priority: 'medium',
            channel: 'public_portal_chatbot',
            nicNumber: nicNumber.trim().toUpperCase(),
            createdAt: serverTimestamp(),
          });
          setMessages((prev) => [...prev, {
            id: crypto.randomUUID(), role: 'system', at: new Date(),
            content: `Your request has been logged with the PHI office${identity.district ? ` for ${identity.district}` : ''}. Reference: ${trackingId}. An officer will follow up using the details you provided. For urgent help dial 1390.`,
          }]);
          toast.success('Request logged with the PHI office.');
          setEscalating(false);
          return;
        } catch { /* fall through to the friendly error below */ }
      }

      const friendly = isPermission
        ? 'The live chat queue isn\'t enabled yet, and we couldn\'t log your request automatically. Please call 1390 (Ministry of Health, 24 / 7).'
        : isNetwork
        ? 'Network error. Check your connection and try again, or call 1390.'
        : `Could not reach the PHI queue. Please call 1390. (${msg.slice(0, 80)})`;
      toast.error(friendly);
      setMessages((prev) => [...prev, {
        id: crypto.randomUUID(), role: 'system', at: new Date(),
        content: `${friendly}`,
      }]);
    } finally {
      setEscalating(false);
    }
  }, [chatId, escalating, identity, messages, name, nicNumber]);

  /* ── live Firestore listener — officer messages stream in here ──── */

  useEffect(() => {
    if (!chatId) return;
    const q = query(collection(db, 'citizen_chats', chatId, 'messages'), orderBy('createdAt', 'asc'));
    const unsub = onSnapshot(q, (snap) => {
      // Replace UI messages with the canonical Firestore stream (officer +
      // citizen turns + seeds) — keeps things in order regardless of who
      // sent first.
      const next: UiMessage[] = [WELCOME];
      snap.forEach((d) => {
        const data = d.data() as { role: string; content: string; createdAt?: { toDate?: () => Date } };
        next.push({
          id: d.id,
          role: (data.role as UiMessage['role']) ?? 'assistant',
          content: data.content ?? '',
          at: data.createdAt?.toDate?.() ?? new Date(),
        });
      });
      setMessages(next);
    });

    // Watch the parent doc for status -> 'active' so we can show "Officer
    // online" in the header.
    const unsubDoc = onSnapshot(doc(db, 'citizen_chats', chatId), (snap) => {
      const data = snap.data() as { status?: string } | undefined;
      setOfficerOnline(data?.status === 'active');
    });
    return () => { unsub(); unsubDoc(); };
  }, [chatId]);

  /* Mark chat as closed when the user closes the modal mid-conversation. */
  useEffect(() => () => {
    if (chatId) {
      updateDoc(doc(db, 'citizen_chats', chatId), { status: 'closed', updatedAt: serverTimestamp() }).catch(() => {});
    }
  }, [chatId]);

  /* ── render ───────────────────────────────────────────────────────── */

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
    <div className="fixed inset-0 z-50 flex flex-col bg-black/55 backdrop-blur-sm sm:items-center sm:justify-end sm:p-4">
      {/* invisible backdrop close */}
      <button type="button" aria-label="Dismiss chatbot" className="absolute inset-0" onClick={() => setOpen(false)} />

      <div className="relative flex h-[100dvh] w-full flex-col overflow-hidden bg-white shadow-2xl dark:bg-slate-900 sm:h-[640px] sm:max-w-md sm:rounded-2xl sm:border sm:border-slate-200 dark:sm:border-slate-700">
        {/* Compact header — one line on mobile, two on >= sm */}
        <div className="flex items-center justify-between gap-2 border-b border-slate-200 bg-gradient-to-r from-violet-600 to-indigo-700 px-3 py-2 text-white dark:border-slate-800">
          <div className="flex items-center gap-2 min-w-0">
            <div className="flex h-7 w-7 items-center justify-center rounded-full bg-white/15 backdrop-blur-sm">
              <Bot className="h-3.5 w-3.5" />
            </div>
            <div className="min-w-0">
              <p className="truncate text-sm font-bold leading-tight">PHI-PRO Assistant</p>
              <p className="hidden truncate text-[10px] text-violet-100/90 sm:block">
                {step === 'verify'
                  ? 'Verify your identity to start chatting'
                  : officerOnline
                  ? 'Officer online · live conversation'
                  : chatId
                  ? 'Waiting for an officer to pick up…'
                  : 'AI-powered citizen help'}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-1">
            {officerOnline && <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/90 px-1.5 py-0.5 text-[10px] font-bold">● Officer</span>}
            <button type="button" onClick={() => setOpen(false)} className="rounded-full p-1 hover:bg-white/15" aria-label="Close">
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Body */}
        {step === 'verify' ? (
          <div className="flex-1 space-y-3 overflow-y-auto p-3 sm:p-4">
            <div className="rounded-lg border border-violet-200 bg-violet-50/60 p-3 text-xs text-violet-900 dark:border-violet-900 dark:bg-violet-950/30 dark:text-violet-200">
              <p className="flex items-center gap-1.5 font-bold uppercase tracking-wider">
                <ShieldCheck className="h-3.5 w-3.5" /> Identity + location
              </p>
              <p className="mt-1 leading-relaxed">
                To stop abuse and route you to the right PHI officer we collect your NIC, a card photo, a live selfie and your district. Encrypted in transit; only seen by the receiving PHI.
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

            <div className="space-y-1.5">
              <Label htmlFor="cb-district">Your district <span className="text-xs text-muted-foreground">(used to route you to the nearest PHI)</span></Label>
              <div className="flex items-center gap-2">
                <select id="cb-district" className="flex h-10 w-full rounded-md border border-input bg-background px-3 text-sm" value={district} onChange={(e) => setDistrict(e.target.value)}>
                  <option value="">Select…</option>
                  {DISTRICTS.map((d) => <option key={d.district} value={d.district}>{d.district}</option>)}
                </select>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={detectLocation}
                  disabled={locStatus === 'getting'}
                  className="h-10 shrink-0 gap-1 text-xs"
                  title="Detect your district from GPS"
                >
                  {locStatus === 'getting'
                    ? <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    : <MapPin className="h-3.5 w-3.5" />}
                  {locStatus === 'getting' ? '…' : locStatus === 'ok' ? 'Refresh GPS' : 'Use GPS'}
                </Button>
              </div>
              {locStatus === 'denied' && (
                <p className="text-[10px] text-amber-600">Location permission denied. Pick your district manually above.</p>
              )}
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
            <div className="flex-1 space-y-3 overflow-y-auto bg-slate-50 p-3 dark:bg-slate-950/40 sm:p-4">
              {messages.map((m) => (
                <div key={m.id} className={m.role === 'user' ? 'flex justify-end' : 'flex justify-start'}>
                  <div
                    className={`max-w-[85%] rounded-2xl px-3 py-2 text-sm leading-relaxed shadow-sm ${
                      m.role === 'user'
                        ? 'bg-violet-600 text-white'
                        : m.role === 'system'
                        ? 'border border-emerald-200 bg-emerald-50 text-emerald-900 dark:border-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-200'
                        : m.role === 'officer'
                        ? 'border-l-4 border-blue-500 bg-blue-50 text-blue-900 dark:border-blue-700 dark:bg-blue-950/40 dark:text-blue-100'
                        : 'bg-white text-slate-800 dark:bg-slate-800 dark:text-slate-100'
                    }`}
                  >
                    {m.role === 'officer' && (
                      <p className="mb-0.5 text-[10px] font-bold uppercase tracking-widest text-blue-700 dark:text-blue-300">PHI officer</p>
                    )}
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
              {!chatId && (
                <div className="mb-2 flex flex-wrap gap-1.5">
                  <Button type="button" variant="outline" size="sm" disabled={escalating} onClick={escalateToPhi} className="text-[11px]">
                    <UserCog className="mr-1.5 h-3 w-3" />
                    {escalating ? 'Queuing…' : identity?.district ? `Connect to PHI · ${identity.district}` : 'Connect to a live PHI'}
                  </Button>
                </div>
              )}
              <form
                className="flex items-end gap-2"
                onSubmit={(e) => { e.preventDefault(); void sendMessage(input); }}
              >
                <textarea
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); void sendMessage(input); } }}
                  placeholder={chatId ? 'Reply to the PHI officer…' : 'Ask anything — complaints, food grades, permits, hotlines…'}
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
                For emergencies dial <a href="tel:1390" className="font-bold text-red-600 underline">1390</a>.
              </p>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

/* NIC card slot */
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
        {value
          // eslint-disable-next-line @next/next/no-img-element
          ? <img src={value.url} alt="NIC card" className="h-full w-full object-cover" />
          : <div className="flex h-full items-center justify-center text-[11px] text-slate-400">No card photo yet</div>}
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
