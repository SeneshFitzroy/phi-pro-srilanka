// ============================================================================
// /api/health-news — Sri Lanka health-news aggregator with a verification badge.
//
// Source: NewsAPI.org (set NEWSAPI_KEY — free dev tier). Cross-references stories
// across sources: a story corroborated by ≥2 distinct outlets → "verified";
// single outlet → "single-source". If GOOGLE_FACTCHECK_KEY is set, headlines are
// also checked against the Google Fact Check Tools API → "disputed" when a claim
// review rates it false/misleading.
// Without NEWSAPI_KEY a small curated sample list is returned so the page works.
// ============================================================================

import { NextRequest, NextResponse } from 'next/server';

const NEWSAPI_KEY = process.env.NEWSAPI_KEY;
const FACTCHECK_KEY = process.env.GOOGLE_FACTCHECK_KEY;

export type Verification = 'verified' | 'single-source' | 'disputed';
export interface NewsItem {
  title: string;
  description: string;
  url: string;
  source: string;
  publishedAt: string;
  verification: Verification;
  corroboratingSources: string[];
  factCheck?: { rating: string; publisher: string; url: string } | null;
}

const STOPWORDS = new Set(['the', 'a', 'an', 'and', 'or', 'of', 'in', 'on', 'to', 'for', 'with', 'as', 'at', 'by', 'is', 'are', 'be', 'sri', 'lanka', 'lankan', 'health', 'says', 'amid', 'over', 'new']);
const keywords = (s: string) => s.toLowerCase().replace(/[^a-z\s]/g, ' ').split(/\s+/).filter((w) => w.length > 3 && !STOPWORDS.has(w));
const overlap = (a: string[], b: string[]) => { const sb = new Set(b); return a.filter((w) => sb.has(w)).length; };

const SAMPLE: NewsItem[] = [
  { title: 'Ministry of Health steps up dengue control ahead of inter-monsoon rains', description: 'PHIs island-wide intensify source-reduction and premises inspections as rainfall raises Aedes breeding risk.', url: 'https://www.health.gov.lk', source: 'Ministry of Health', publishedAt: new Date(Date.now() - 2 * 864e5).toISOString(), verification: 'verified', corroboratingSources: ['Ministry of Health', 'Epidemiology Unit', 'Daily News'], factCheck: null },
  { title: 'Food safety drive: dozens of premises issued improvement notices in Colombo', description: 'Routine H800 inspections lead to enforcement action against eateries failing hygiene standards.', url: 'https://www.health.gov.lk', source: 'Daily News', publishedAt: new Date(Date.now() - 3 * 864e5).toISOString(), verification: 'verified', corroboratingSources: ['Daily News', 'Daily Mirror'], factCheck: null },
  { title: 'World Health Day programmes conducted in schools across the island', description: 'School health teams and PHIs run health-education and WASH-improvement activities.', url: 'https://www.health.gov.lk', source: 'Sunday Observer', publishedAt: new Date(Date.now() - 9 * 864e5).toISOString(), verification: 'single-source', corroboratingSources: ['Sunday Observer'], factCheck: null },
  { title: 'Viral message claims a “new waterborne outbreak” — officials say no such alert', description: 'Health authorities urge the public to rely on official MOH bulletins; the circulating claim is unverified.', url: 'https://www.epid.gov.lk', source: 'Social media', publishedAt: new Date(Date.now() - 1 * 864e5).toISOString(), verification: 'disputed', corroboratingSources: [], factCheck: { rating: 'Misleading / no official basis', publisher: 'Epidemiology Unit', url: 'https://www.epid.gov.lk' } },
  { title: 'Leptospirosis advisory for paddy-farming districts after heavy rain', description: 'PHIs distribute prophylaxis guidance and conduct awareness sessions with farming communities.', url: 'https://www.epid.gov.lk', source: 'Epidemiology Unit', publishedAt: new Date(Date.now() - 5 * 864e5).toISOString(), verification: 'verified', corroboratingSources: ['Epidemiology Unit', 'Daily Mirror'], factCheck: null },
];

interface NewsApiArticle { title: string; description: string | null; url: string; publishedAt: string; source: { name: string } }

async function factCheckHeadline(title: string): Promise<NewsItem['factCheck']> {
  if (!FACTCHECK_KEY) return null;
  try {
    const res = await fetch(`https://factchecktools.googleapis.com/v1alpha1/claims:search?query=${encodeURIComponent(title.slice(0, 120))}&languageCode=en&key=${FACTCHECK_KEY}`);
    if (!res.ok) return null;
    const data = (await res.json()) as { claims?: Array<{ claimReview?: Array<{ textualRating?: string; publisher?: { name?: string }; url?: string }> }> };
    const review = data.claims?.[0]?.claimReview?.[0];
    if (!review?.textualRating) return null;
    if (/false|incorrect|misleading|unproven|pants on fire|no evidence/i.test(review.textualRating)) {
      return { rating: review.textualRating, publisher: review.publisher?.name ?? 'fact-checker', url: review.url ?? '' };
    }
    return null;
  } catch { return null; }
}

export async function GET(req: NextRequest) {
  const claim = req.nextUrl.searchParams.get('claim');
  if (claim) {
    const fc = await factCheckHeadline(claim);
    return NextResponse.json({ claim, factCheck: fc, verdict: fc ? 'disputed' : (FACTCHECK_KEY ? 'no-matching-claim-review' : 'fact-check-not-configured') });
  }

  if (!NEWSAPI_KEY) return NextResponse.json({ articles: SAMPLE, source: 'sample' });

  try {
    const q = encodeURIComponent('("Sri Lanka") AND (health OR hospital OR dengue OR "public health" OR food safety OR outbreak OR epidemiology OR vaccine OR sanitation)');
    const res = await fetch(`https://newsapi.org/v2/everything?q=${q}&language=en&sortBy=publishedAt&pageSize=30&apiKey=${NEWSAPI_KEY}`, { next: { revalidate: 900 } });
    if (!res.ok) throw new Error(`newsapi ${res.status}`);
    const data = (await res.json()) as { articles?: NewsApiArticle[] };
    const arts = (data.articles ?? []).filter((a) => a.title && a.url);

    // Cross-reference: group by keyword overlap to find corroboration.
    const kw = arts.map((a) => keywords(`${a.title} ${a.description ?? ''}`));
    const items: NewsItem[] = await Promise.all(arts.slice(0, 24).map(async (a, i) => {
      const corrobSources = new Set<string>([a.source.name]);
      for (let j = 0; j < arts.length; j++) {
        if (j === i) continue;
        if (arts[j].source.name === a.source.name) continue;
        if (overlap(kw[i], kw[j]) >= 3) corrobSources.add(arts[j].source.name);
      }
      const fc = await factCheckHeadline(a.title);
      const verification: Verification = fc ? 'disputed' : corrobSources.size >= 2 ? 'verified' : 'single-source';
      return {
        title: a.title, description: a.description ?? '', url: a.url, source: a.source.name,
        publishedAt: a.publishedAt, verification, corroboratingSources: Array.from(corrobSources), factCheck: fc,
      };
    }));
    return NextResponse.json({ articles: items, source: 'newsapi' });
  } catch {
    return NextResponse.json({ articles: SAMPLE, source: 'sample-fallback' });
  }
}

export const runtime = 'nodejs';
