// ============================================================================
// /api/moderate — toxicity / spam screening for public submissions (complaints).
// Primary  : OpenAI Moderation API   (FREE — no extra cost, uses OPENAI_API_KEY)
// Fallback : lightweight local heuristic so the feature still works offline.
// Always returns 200 with a verdict; the caller decides whether to soft-block.
// ============================================================================

import { NextRequest, NextResponse } from 'next/server';

const { OPENAI_API_KEY } = process.env;

interface Verdict {
  allowed: boolean;
  source: 'openai' | 'heuristic';
  scores: Record<string, number>; // 0..1
  reason: string | null;
  flagged: string[];              // attributes that crossed the threshold
}

// OpenAI returns 11 category scores; map to PHI-PRO thresholds.
const OPENAI_THRESHOLDS: Record<string, number> = {
  harassment: 0.85,
  'harassment/threatening': 0.7,
  hate: 0.85,
  'hate/threatening': 0.7,
  'self-harm': 0.85,
  'self-harm/intent': 0.7,
  'self-harm/instructions': 0.7,
  sexual: 0.9,
  'sexual/minors': 0.5,
  violence: 0.85,
  'violence/graphic': 0.85,
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

  // ── Primary: OpenAI Moderation API (FREE — no separate billing) ─────────
  if (OPENAI_API_KEY) {
    try {
      const res = await fetch('https://api.openai.com/v1/moderations', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${OPENAI_API_KEY}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ model: 'omni-moderation-latest', input: text }),
      });
      if (res.ok) {
        const data = (await res.json()) as {
          results?: Array<{
            flagged: boolean;
            categories: Record<string, boolean>;
            category_scores: Record<string, number>;
          }>;
        };
        const r = data.results?.[0];
        if (r) {
          const scores: Record<string, number> = {};
          const flagged: string[] = [];
          for (const [attr, value] of Object.entries(r.category_scores)) {
            scores[attr] = value;
            if (value >= (OPENAI_THRESHOLDS[attr] ?? 1)) flagged.push(attr);
          }
          const allowed = flagged.length === 0 && !r.flagged;
          return NextResponse.json({
            allowed,
            source: 'openai',
            scores,
            reason: allowed
              ? null
              : `Submission flagged (${flagged.length ? flagged.join(', ') : 'policy violation'}). Please rephrase factually and without abusive language.`,
            flagged,
          } satisfies Verdict);
        }
      }
    } catch { /* fall through to heuristic */ }
  }

  return NextResponse.json(heuristic(text));
}

export const runtime = 'nodejs';
