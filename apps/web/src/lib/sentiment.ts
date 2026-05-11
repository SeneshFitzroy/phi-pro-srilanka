// ============================================================================
// Lightweight sentiment / urgency scoring for triaging public complaints.
// AFINN-style lexicon (compact subset) + a public-health urgency lexicon — no
// dependency, runs offline. Returns a normalised negativity score, an urgency
// score, and a derived triage priority. For nuanced Sinhala/Tamil text you'd
// route to an LLM; the lexicon covers transliterated English well enough for
// queue ordering. The PHI still decides — this only sorts the queue.
// ============================================================================

// Negative-valence words (weight -1..-5, AFINN-inspired, public-health flavoured)
const NEGATIVE: Record<string, number> = {
  dead: -5, death: -5, dying: -5, died: -5, fatal: -5, killed: -4, poisoned: -4, poisoning: -4,
  outbreak: -4, epidemic: -4, contaminated: -4, contamination: -3, infested: -4, infestation: -4,
  rats: -3, rat: -3, cockroach: -3, cockroaches: -3, maggots: -4, vermin: -3, sewage: -3, faeces: -3, feces: -3,
  rotten: -3, rotting: -3, decay: -3, decaying: -3, mould: -3, mold: -3, moldy: -3, filth: -3, filthy: -3,
  disgusting: -3, vomit: -3, vomiting: -3, diarrhoea: -3, diarrhea: -3, sick: -2, illness: -2, hospitalised: -4, hospitalized: -4,
  dengue: -3, cholera: -4, typhoid: -4, leptospirosis: -3, hepatitis: -3, jaundice: -3, fever: -2, rash: -2,
  unhygienic: -3, unsanitary: -3, dirty: -2, smell: -2, stench: -3, foul: -3, hazard: -3, hazardous: -3, dangerous: -3, danger: -3,
  expired: -2, spoiled: -3, spoilt: -3, bad: -2, terrible: -3, awful: -3, horrible: -3, worst: -3, worse: -2, unsafe: -3,
  complaint: -1, problem: -1, issue: -1, broken: -2, leaking: -2, overflowing: -2, blocked: -1, abandoned: -1, neglected: -2,
  threat: -3, threatening: -3, urgent: -2, emergency: -3,
};
const POSITIVE: Record<string, number> = { clean: 2, hygienic: 2, safe: 2, fixed: 2, resolved: 2, good: 2, fine: 1, ok: 1, satisfied: 2, thanks: 1 };

// Words that escalate urgency regardless of overall valence (count → urgency score)
const URGENCY = new Set([
  'outbreak', 'epidemic', 'death', 'dead', 'dying', 'died', 'fatal', 'poisoning', 'poisoned', 'hospitalised', 'hospitalized',
  'cholera', 'typhoid', 'children', 'child', 'school', 'baby', 'infant', 'elderly', 'pregnant',
  'urgent', 'emergency', 'immediately', 'spreading', 'many', 'several', 'multiple', 'cases', 'sick',
]);

const NEGATORS = new Set(['not', 'no', 'never', "isn't", "wasn't", "aren't", "didn't", "doesn't", 'without']);

export type Polarity = 'negative' | 'neutral' | 'positive';
export type TriagePriority = 'high' | 'medium' | 'low';

export interface Triage {
  /** Comparative negativity: <0 negative, ~0 neutral, >0 positive. */
  score: number;
  polarity: Polarity;
  /** 0..1 — how urgent the language sounds (children, deaths, outbreaks…). */
  urgency: number;
  priority: TriagePriority;
  /** Notable terms that drove the score, for an explanation chip. */
  terms: string[];
}

function tokenize(text: string): string[] {
  return text.toLowerCase().replace(/[^a-z'\s]/g, ' ').split(/\s+/).filter(Boolean);
}

export function analyseComplaint(text: string): Triage {
  const tokens = tokenize(text);
  if (tokens.length === 0) return { score: 0, polarity: 'neutral', urgency: 0, priority: 'low', terms: [] };

  let sum = 0;
  let hits = 0;
  let urgencyHits = 0;
  const terms = new Set<string>();
  tokens.forEach((tok, i) => {
    const w = NEGATIVE[tok] ?? (POSITIVE[tok] ? POSITIVE[tok] : 0);
    if (w !== 0) {
      const negated = i > 0 && NEGATORS.has(tokens[i - 1]);
      sum += negated ? -w : w;
      hits++;
      if (w < 0) terms.add(tok);
    }
    if (URGENCY.has(tok)) { urgencyHits++; terms.add(tok); }
  });

  const score = hits ? sum / Math.sqrt(tokens.length) : 0; // comparative, length-damped
  const urgency = Math.min(1, urgencyHits / 4 + (score < -2 ? 0.3 : 0));
  const polarity: Polarity = score < -0.6 ? 'negative' : score > 0.6 ? 'positive' : 'neutral';

  let priority: TriagePriority = 'low';
  if (urgency >= 0.5 || score <= -3) priority = 'high';
  else if (urgency >= 0.25 || score <= -1.2 || polarity === 'negative') priority = 'medium';

  return { score: Number(score.toFixed(2)), polarity, urgency: Number(urgency.toFixed(2)), priority, terms: Array.from(terms).slice(0, 6) };
}

export const priorityRank: Record<TriagePriority, number> = { high: 0, medium: 1, low: 2 };
