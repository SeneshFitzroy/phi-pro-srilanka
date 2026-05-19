'use client';

// Universal share control used everywhere on PHI-PRO (alerts, food grades,
// inspections, certificates, complaints, news, etc.).
//
// Behaviour:
//   - Mobile + any browser exposing `navigator.share` → opens the system
//     share sheet (WhatsApp / X / Telegram / Instagram / Email / Save to
//     Files, whichever the OS offers).
//   - Desktop / unsupported → opens a popover with explicit WhatsApp / X /
//     Facebook / LinkedIn / Email / Copy link buttons. Each share carries
//     the canonical phipro.lk deep-link the caller passes in.
//
// All consumers should use this instead of bespoke clipboard-copy buttons —
// keeps the behaviour identical across the app.

import { useState } from 'react';
import {
  Share2, Check, Copy, MessageCircle, Mail, Send, Linkedin,
} from 'lucide-react';
import { Button } from '@/components/ui/button';

export interface ShareTarget {
  /** Page title — used as the OS share-sheet title and the email subject. */
  title: string;
  /** Long-form body — included in the system share + the email body. */
  text: string;
  /** Canonical deep-link to the resource being shared. */
  url: string;
}

interface Props {
  data: ShareTarget;
  /** Visual variant — `ghost` for compact toolbar use, `outline` for cards. */
  variant?: 'ghost' | 'outline';
  /** Small / sm size for inline use. */
  size?: 'sm' | 'icon';
  /** Override the trigger button label. Default: "Share". */
  label?: string;
  className?: string;
}

export function ShareButton({ data, variant = 'ghost', size = 'sm', label = 'Share', className = '' }: Props) {
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  const canWebShare = typeof navigator !== 'undefined' && typeof navigator.share === 'function';
  const fullBody = `${data.text}\n${data.url}`;

  const trySystemShare = async () => {
    try {
      await navigator.share({ title: data.title, text: data.text, url: data.url });
    } catch { /* user cancelled — fine */ }
  };

  const copyAll = async () => {
    try {
      await navigator.clipboard.writeText(fullBody);
      setCopied(true);
      setTimeout(() => { setCopied(false); setOpen(false); }, 1200);
    } catch { /* ignore */ }
  };

  return (
    <div className="relative inline-block">
      <Button
        type="button"
        variant={variant}
        size={size}
        className={`gap-1 ${className}`}
        onClick={canWebShare ? trySystemShare : () => setOpen((v) => !v)}
        aria-label="Share"
      >
        <Share2 className="h-3.5 w-3.5" />
        {size !== 'icon' && <span className="text-xs">{label}</span>}
      </Button>

      {!canWebShare && open && (
        <>
          {/* invisible backdrop that closes the popover on outside click */}
          <button
            type="button"
            aria-label="Dismiss share menu"
            className="fixed inset-0 z-10"
            onClick={() => setOpen(false)}
          />
          <div className="absolute right-0 top-9 z-20 w-60 rounded-lg border border-slate-200 bg-white p-2 shadow-xl dark:border-slate-700 dark:bg-slate-900">
            <p className="px-2 pb-1.5 text-[10px] font-bold uppercase tracking-widest text-slate-400">Share</p>

            <a
              href={`https://wa.me/?text=${encodeURIComponent(fullBody)}`}
              target="_blank" rel="noopener noreferrer"
              onClick={() => setOpen(false)}
              className="flex items-center gap-2 rounded-md px-2 py-1.5 text-sm font-semibold text-slate-700 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-800"
            >
              <MessageCircle className="h-4 w-4 text-emerald-600" /> WhatsApp
            </a>

            <a
              href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(data.text)}&url=${encodeURIComponent(data.url)}`}
              target="_blank" rel="noopener noreferrer"
              onClick={() => setOpen(false)}
              className="flex items-center gap-2 rounded-md px-2 py-1.5 text-sm font-semibold text-slate-700 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-800"
            >
              <Send className="h-4 w-4 text-sky-500" /> X / Twitter
            </a>

            <a
              href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(data.url)}`}
              target="_blank" rel="noopener noreferrer"
              onClick={() => setOpen(false)}
              className="flex items-center gap-2 rounded-md px-2 py-1.5 text-sm font-semibold text-slate-700 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-800"
            >
              <Share2 className="h-4 w-4 text-blue-600" /> Facebook
            </a>

            <a
              href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(data.url)}`}
              target="_blank" rel="noopener noreferrer"
              onClick={() => setOpen(false)}
              className="flex items-center gap-2 rounded-md px-2 py-1.5 text-sm font-semibold text-slate-700 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-800"
            >
              <Linkedin className="h-4 w-4 text-blue-700" /> LinkedIn
            </a>

            <a
              href={`mailto:?subject=${encodeURIComponent(data.title)}&body=${encodeURIComponent(fullBody)}`}
              onClick={() => setOpen(false)}
              className="flex items-center gap-2 rounded-md px-2 py-1.5 text-sm font-semibold text-slate-700 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-800"
            >
              <Mail className="h-4 w-4 text-rose-500" /> Email
            </a>

            <button
              type="button"
              onClick={copyAll}
              className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-sm font-semibold text-slate-700 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-800"
            >
              {copied
                ? <><Check className="h-4 w-4 text-emerald-600" /> Copied!</>
                : <><Copy className="h-4 w-4 text-slate-500" /> Copy link</>}
            </button>
          </div>
        </>
      )}
    </div>
  );
}
