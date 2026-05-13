// ============================================================================
// /api/icd?q=… — ICD-11 disease-code lookup.
// Live: WHO ICD-11 API (set ICD_API_CLIENT_ID + ICD_API_CLIENT_SECRET — free at
// icd.who.int/icdapi). Falls back to a built-in list of common Sri Lanka
// notifiable diseases (codes marked "indicative" — confirm against WHO ICD-11).
// ============================================================================

import { NextRequest, NextResponse } from 'next/server';

const CLIENT_ID = process.env.ICD_API_CLIENT_ID;
const CLIENT_SECRET = process.env.ICD_API_CLIENT_SECRET;
const RELEASE = '2024-01';

export interface IcdResult { code: string; title: string; indicative?: boolean }

// Built-in indicative list — common notifiable diseases in Sri Lanka (Health-160).
// Codes are best-effort ICD-11 MMS references; verify against the official WHO browser.
const BUILTIN: IcdResult[] = [
  { code: '1D2Z', title: 'Dengue fever', indicative: true },
  { code: '1D24', title: 'Severe dengue / dengue haemorrhagic fever', indicative: true },
  { code: '1A07', title: 'Typhoid fever', indicative: true },
  { code: '1A09', title: 'Paratyphoid fever', indicative: true },
  { code: '1A00', title: 'Cholera', indicative: true },
  { code: '1A02', title: 'Shigellosis (bacillary dysentery)', indicative: true },
  { code: '1A36', title: 'Amoebiasis (amoebic dysentery)', indicative: true },
  { code: '1A40', title: 'Foodborne intoxication / food poisoning', indicative: true },
  { code: '1A0Z', title: 'Acute diarrhoeal disease, unspecified', indicative: true },
  { code: '1E50.0', title: 'Acute hepatitis A', indicative: true },
  { code: '1E50.1', title: 'Acute hepatitis B', indicative: true },
  { code: '1E50.2', title: 'Acute hepatitis C', indicative: true },
  { code: '1B10', title: 'Respiratory tuberculosis', indicative: true },
  { code: '1F40', title: 'Plasmodium falciparum malaria', indicative: true },
  { code: '1F4Z', title: 'Malaria, unspecified', indicative: true },
  { code: '1F03', title: 'Measles', indicative: true },
  { code: '1F02', title: 'Rubella', indicative: true },
  { code: '1D80', title: 'Mumps', indicative: true },
  { code: '1E90', title: 'Varicella (chickenpox)', indicative: true },
  { code: '1C12', title: 'Whooping cough (pertussis)', indicative: true },
  { code: '1C17', title: 'Diphtheria', indicative: true },
  { code: '1C13', title: 'Tetanus', indicative: true },
  { code: '1B91', title: 'Leptospirosis', indicative: true },
  { code: '1C82', title: 'Rabies', indicative: true },
  { code: '1C85', title: 'Japanese encephalitis', indicative: true },
  { code: 'RA01.0', title: 'COVID-19, virus identified', indicative: true },
  { code: '1E32', title: 'Influenza, virus not identified', indicative: true },
  { code: '1D01', title: 'Bacterial meningitis', indicative: true },
  { code: '1C81', title: 'Acute poliomyelitis / acute flaccid paralysis', indicative: true },
  { code: '1F66', title: 'Lymphatic filariasis', indicative: true },
  { code: '1F54', title: 'Cutaneous leishmaniasis', indicative: true },
  { code: '1A0Y', title: 'Animal bite (for rabies risk assessment)', indicative: true },
];

let tokenCache: { token: string; exp: number } | null = null;
async function getToken(): Promise<string | null> {
  if (!CLIENT_ID || !CLIENT_SECRET) return null;
  if (tokenCache && tokenCache.exp > Date.now() + 30_000) return tokenCache.token;
  try {
    const res = await fetch('https://icdaccessmanagement.who.int/connect/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({ grant_type: 'client_credentials', scope: 'icdapi_access', client_id: CLIENT_ID, client_secret: CLIENT_SECRET }),
    });
    if (!res.ok) return null;
    const data = (await res.json()) as { access_token: string; expires_in: number };
    tokenCache = { token: data.access_token, exp: Date.now() + data.expires_in * 1000 };
    return data.access_token;
  } catch { return null; }
}

const stripTags = (s: string) => s.replace(/<[^>]+>/g, '').trim();

export async function GET(req: NextRequest) {
  const q = (req.nextUrl.searchParams.get('q') || '').trim();
  if (q.length < 2) return NextResponse.json({ results: [], source: CLIENT_ID ? 'who' : 'builtin' });

  const token = await getToken();
  if (token) {
    try {
      const res = await fetch(`https://id.who.int/icd/release/11/${RELEASE}/mms/search?q=${encodeURIComponent(q)}&flatResults=true`, {
        headers: { Authorization: `Bearer ${token}`, Accept: 'application/json', 'Accept-Language': 'en', 'API-Version': 'v2' },
      });
      if (res.ok) {
        const data = (await res.json()) as { destinationEntities?: Array<{ theCode?: string; title?: string }> };
        const results: IcdResult[] = (data.destinationEntities ?? []).filter((e) => e.theCode).slice(0, 12).map((e) => ({ code: e.theCode!, title: stripTags(e.title ?? '') }));
        return NextResponse.json({ results, source: 'who' });
      }
    } catch { /* fall through */ }
  }

  const term = q.toLowerCase();
  const results = BUILTIN.filter((b) => b.title.toLowerCase().includes(term) || b.code.toLowerCase().includes(term)).slice(0, 12);
  return NextResponse.json({ results, source: 'builtin' });
}

export const runtime = 'nodejs';
export const revalidate = 3600;
