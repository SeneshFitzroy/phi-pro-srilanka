// ============================================================================
// /api/moderate — toxicity / spam screening for public submissions (complaints).
// Primary: Google Perspective API (set PERSPECTIVE_API_KEY — free, generous quota).
// Fallback (no key): a lightweight heuristic so the feature still works.
// Always returns 200 with a verdict; the caller decides whether to soft-block.
// ============================================================================

import { NextRequest, NextResponse } from 'next/server';

const PERSPECTIVE_API_KEY = process.env.PERSPECTIVE_API_KEY;

interface Verdict {
  allowed: boolean;
  source: 'perspective' | 'heuristic';
  scores: Record<string, number>; // 0..1
  reason: string | null;
  flagged: string[];              // attributes that crossed the threshold
}

const THRESHOLDS: Record<string, number> = {
  TOXICITY: 0.85,
  SEVERE_TOXICITY: 0.7,
  THREAT: 0.7,
  INSULT: 0.85,
  PROFANITY: 0.9,
  SPAM: 0.9,
};

function heuristic(text: string): Verdict {
  const t = text.trim();
  const lower = t.toLowerCase();
  const flagged: string[] = [];
  const urls = (t.match(/https?:\/\/|www\.|\b[\w-]+\.(com|net|org|info|biz|xyz)\b/gi) || []).length;
  if (urls >= 3) flagged.push('links');
  const letters = (t.match(/[a-z]/gi) || []).length;
  const caps = (t.match(/[A-Z]/g) || []).length;
  if (letters > 25 && caps / letters > 0.7) flagged.push('shouting');
  if (/(.)\1{6,}/.test(t)) flagged.push('repetition');
  if (/\b(viagra|casino|crypto airdrop|free money|click here|earn \$|loan offer|bit\.ly)\b/i.test(lower)) flagged.push('spam-phrases');
  const PROFANITY = ['fuck', 'shit', 'bitch', 'bastard', 'asshole', 'cunt', 'dickhead', 'motherfucker', 'whore', 'slut'];
  const profCount = PROFANITY.filter((w) => new RegExp(`\\b${w}`, 'i').test(lower)).length;
  if (profCount >= 2) flagged.push('profanity');
  const scores: Record<string, number> = {
    SPAM: Math.min(1, urls * 0.3 + (flagged.includes('spam-phrases') ? 0.6 : 0) + (flagged.includes('repetition') ? 0.4 : 0)),
    PROFANITY: Math.min(1, profCount * 0.4),
    SHOUTING: flagged.includes('shouting') ? 0.8 : 0,
  };
  const allowed = flagged.length < 2 && !flagged.includes('spam-phrases');
  return {
    allowed,
    source: 'heuristic',
    scores,
    reason: allowed ? null : 'The text looks like spam or contains language we can’t accept. Please rephrase factually.',
    flagged,
  };
}

export async function POST(req: NextRequest) {
  let text = '';
  try { text = String((await req.json())?.text ?? '').slice(0, 4000); } catch { /* */ }
  if (!text.trim()) return NextResponse.json({ allowed: true, source: 'heuristic', scores: {}, reason: null, flagged: [] } satisfies Verdict);

  if (PERSPECTIVE_API_KEY) {
    try {
      const res = await fetch(`https://commentanalyzer.googleapis.com/v1alpha1/comments:analyze?key=${PERSPECTIVE_API_KEY}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          comment: { text },
          languages: ['en'],
          doNotStore: true,
          requestedAttributes: { TOXICITY: {}, SEVERE_TOXICITY: {}, THREAT: {}, INSULT: {}, PROFANITY: {}, SPAM: {} },
        }),
      });
      if (res.ok) {
        const data = (await res.json()) as { attributeScores?: Record<string, { summaryScore: { value: number } }> };
        const scores: Record<string, number> = {};
        const flagged: string[] = [];
        for (const [attr, v] of Object.entries(data.attributeScores ?? {})) {
          const value = v.summaryScore.value;
          scores[attr] = value;
          if (value >= (THRESHOLDS[attr] ?? 1)) flagged.push(attr);
        }
        const allowed = flagged.length === 0;
        return NextResponse.json({
          allowed,
          source: 'perspective',
          scores,
          reason: allowed ? null : `Submission flagged (${flagged.map((f) => f.toLowerCase().replace('_', ' ')).join(', ')}). Please rephrase factually and without abusive language.`,
          flagged,
        } satisfies Verdict);
      }
    } catch { /* fall through to heuristic */ }
  }

  return NextResponse.json(heuristic(text));
}

export const runtime = 'nodejs';
