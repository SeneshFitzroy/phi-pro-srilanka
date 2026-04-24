// ============================================================================
// PHI-PRO Compliance Copilot API — Agentic RAG for Sri Lankan Health Law
// Uses Claude claude-haiku-4-5-20251001 with augmented regulatory context
// Answers questions about: Food Act No.26/1980, Factories Ordinance, H800 SOP
// ============================================================================

import { NextRequest, NextResponse } from 'next/server';

const { ANTHROPIC_API_KEY } = process.env;

const SYSTEM_PROMPT = `You are the PHI-PRO Compliance Copilot — an expert assistant for Sri Lanka Public Health Inspectors (PHIs) operating under the Ministry of Health.

You have authoritative knowledge of:
- Food Act No. 26 of 1980 (Sri Lanka) and its regulations
- H800 Food Premises Inspection Form (100-point grading system)
  - Grade A: ≥90 points | Grade B: 75-89 | Grade C: <75 (or critical violation)
  - Critical violations (auto-cap to Grade C): pest proofing=0, cold storage=0, cross-contamination=0, hot holding=0
  - Enforcement: Grade A→None, Grade B→Warning Notice, Grade C→Improvement Notice, Critical→Court Summons, Closure Notice
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

Respond in the same language the user asks in (English/Sinhala/Tamil). If Sinhala or Tamil, respond fully in that language.`;

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

export async function POST(req: NextRequest) {
  if (!ANTHROPIC_API_KEY) {
    return NextResponse.json({ error: 'Copilot unavailable — API key not configured' }, { status: 503 });
  }

  try {
    const { messages, language = 'en' } = await req.json() as { messages: Message[]; language?: string };

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json({ error: 'Messages array required' }, { status: 400 });
    }

    const lastMessage = messages[messages.length - 1];
    if (!lastMessage || lastMessage.role !== 'user') {
      return NextResponse.json({ error: 'Last message must be from user' }, { status: 400 });
    }

    const langInstruction = language === 'si'
      ? ' [Respond in Sinhala (සිංහල)]'
      : language === 'ta'
      ? ' [Respond in Tamil (தமிழ்)]'
      : '';

    const systemWithLang = SYSTEM_PROMPT + langInstruction;

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'x-api-key': ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01',
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 1024,
        system: systemWithLang,
        messages: messages.slice(-10), // keep last 10 turns for context
      }),
    });

    if (!response.ok) {
      const err = await response.text();
      throw new Error(`Anthropic error ${response.status}: ${err}`);
    }

    const data = await response.json() as { content: Array<{ text: string }>; usage: { input_tokens: number; output_tokens: number } };
    const answer = data.content[0]?.text ?? 'No response generated.';

    return NextResponse.json({
      answer,
      tokens: data.usage,
      model: 'claude-haiku-4-5',
      timestamp: new Date().toISOString(),
    });
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
