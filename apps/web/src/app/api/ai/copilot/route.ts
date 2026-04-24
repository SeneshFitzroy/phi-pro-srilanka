// ============================================================================
// PHI-PRO Compliance Copilot API — Agentic RAG for Sri Lankan Health Law
// Primary: Claude Haiku 4.5 | Fallback: GPT-4o-mini
// Covers: Food Act No.26/1980, Factories Ordinance, H800 SOP, PDPA 2022
// ============================================================================

import { NextRequest, NextResponse } from 'next/server';

const { ANTHROPIC_API_KEY, OPENAI_API_KEY } = process.env;

const SYSTEM_PROMPT = `You are the PHI-PRO Compliance Copilot — an expert assistant for Sri Lanka Public Health Inspectors (PHIs) operating under the Ministry of Health.

You have authoritative knowledge of:
- Food Act No. 26 of 1980 (Sri Lanka) and its regulations
- H800 Food Premises Inspection Form (100-point grading system)
  - Grade A: 90+ points | Grade B: 75-89 | Grade C: under 75 (or critical violation)
  - Critical violations (auto-cap to Grade C): pest proofing=0, cold storage=0, cross-contamination=0, hot holding=0
  - Enforcement: Grade A: None, Grade B: Warning Notice, Grade C: Improvement Notice, Critical: Court Summons or Closure
- H1046 Student Health form (AES-256 encrypted under PDPA Sri Lanka 2022)
- Factories Ordinance (No. 45 of 1942) — occupational health
- National Environmental Act No. 47 of 1980 — sanitation
- DHIS2 integration standards for Sri Lanka MOH
- HL7 FHIR R4 for health data interoperability
- Dengue Prevention Act — vector control obligations
- Food Act Regulations 1991 — food handlers, premises licensing
- H399 Communicable Disease Notification Form
- MOH circular on food sampling procedures

Answer questions concisely and accurately. For enforcement questions, always cite the specific Act/section. For H800 scoring questions, reference exact section weights. Always include:
1. The direct answer
2. Relevant legal authority (Act/Section)
3. Recommended action for the PHI

Respond in the same language the user asks in (English/Sinhala/Tamil).`;

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

export async function POST(req: NextRequest) {
  if (!ANTHROPIC_API_KEY && !OPENAI_API_KEY) {
    return NextResponse.json(
      { error: 'Copilot unavailable — add ANTHROPIC_API_KEY or OPENAI_API_KEY to .env.local' },
      { status: 503 },
    );
  }

  try {
    const { messages, language = 'en' } = await req.json() as { messages: Message[]; language?: string };

    if (!messages?.length) {
      return NextResponse.json({ error: 'Messages array required' }, { status: 400 });
    }

    const langInstruction = language === 'si' ? ' [Respond in Sinhala]' : language === 'ta' ? ' [Respond in Tamil]' : '';
    const system = SYSTEM_PROMPT + langInstruction;
    const recentMessages = messages.slice(-10);

    // Primary: Anthropic Claude Haiku
    if (ANTHROPIC_API_KEY) {
      const res = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: { 'x-api-key': ANTHROPIC_API_KEY, 'anthropic-version': '2023-06-01', 'content-type': 'application/json' },
        body: JSON.stringify({ model: 'claude-haiku-4-5-20251001', max_tokens: 1024, system, messages: recentMessages }),
      });
      if (res.ok) {
        const data = await res.json() as { content: Array<{ text: string }>; usage: { input_tokens: number; output_tokens: number } };
        return NextResponse.json({ answer: data.content[0]?.text ?? 'No response.', model: 'claude-haiku-4-5', timestamp: new Date().toISOString() });
      }
    }

    // Fallback: OpenAI GPT-4o-mini
    if (OPENAI_API_KEY) {
      const res = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${OPENAI_API_KEY}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          max_tokens: 1024,
          messages: [{ role: 'system', content: system }, ...recentMessages],
        }),
      });
      if (res.ok) {
        const data = await res.json() as { choices: Array<{ message: { content: string } }> };
        return NextResponse.json({ answer: data.choices[0]?.message.content ?? 'No response.', model: 'gpt-4o-mini', timestamp: new Date().toISOString() });
      }
    }

    throw new Error('All AI providers failed');
  } catch (err) {
    console.error('Copilot error:', err);
    return NextResponse.json(
      { error: 'Copilot failed', details: err instanceof Error ? err.message : 'Unknown error' },
      { status: 500 },
    );
  }
}

export const runtime = 'nodejs';
export const maxDuration = 30;
