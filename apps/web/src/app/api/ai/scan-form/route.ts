// ============================================================================
// PHI-PRO AI Form Scanning API — VLM-Powered H800 Digitization
// Uses: Claude 3.5 Haiku (primary) or GPT-4o-mini (fallback)
// Input:  multipart/form-data with image file (JPEG/PNG/WebP)
// Output: extracted H800 section scores + confidence levels
// ============================================================================

import { NextRequest, NextResponse } from 'next/server';

const { ANTHROPIC_API_KEY, OPENAI_API_KEY } = process.env;

const H800_EXTRACTION_PROMPT = `You are an AI assistant that digitizes Sri Lanka Public Health Inspector (PHI) H800 Food Premises Inspection forms.

Analyze this image of an H800 form and extract all numerical scores. The form has 6 sections with these maximum scores:
- Premises & Structure: max 30 (6 items × 5 each)
- Personal Hygiene: max 20 (4 items × 5 each)
- Food Handling & Storage: max 25 (5 items × 5 each)
- Equipment & Utensils: max 10 (4 items)
- Waste & Sanitation: max 10 (4 items)
- Documentation & Records: max 5 (5 items × 1 each)

Return ONLY valid JSON in this exact format (no markdown, no explanation):
{
  "sections": {
    "premises": {
      "walls": 0, "floors": 0, "ceiling": 0, "ventilation": 0, "lighting": 0, "pestProofing": 0
    },
    "hygiene": {
      "uniforms": 0, "handwashing": 0, "healthCertificates": 0, "cleanliness": 0
    },
    "foodHandling": {
      "coldStorage": 0, "hotHolding": 0, "crossContamination": 0, "rawCookedSeparation": 0, "dateLabeling": 0
    },
    "equipment": {
      "eqCleanliness": 0, "calibration": 0, "condition": 0, "rustFree": 0
    },
    "wasteSanitation": {
      "disposal": 0, "drainage": 0, "toilets": 0, "bins": 0
    },
    "documentation": {
      "supplierRecords": 0, "pestLog": 0, "cleaningSchedule": 0, "staffTraining": 0, "haccp": 0
    }
  },
  "premisesName": "",
  "ownerName": "",
  "address": "",
  "inspectionDate": "",
  "confidence": 0.0,
  "unreadableFields": []
}

Use 0 for any field you cannot clearly read. Set confidence between 0.0 and 1.0.`;

interface ScanResult {
  sections: Record<string, Record<string, number>>;
  premisesName?: string;
  ownerName?: string;
  address?: string;
  inspectionDate?: string;
  confidence: number;
  unreadableFields: string[];
  model: string;
}

async function scanWithClaude(base64Image: string, mimeType: string): Promise<ScanResult> {
  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'x-api-key': ANTHROPIC_API_KEY!,
      'anthropic-version': '2023-06-01',
      'content-type': 'application/json',
    },
    body: JSON.stringify({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 1024,
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'image',
              source: { type: 'base64', media_type: mimeType, data: base64Image },
            },
            { type: 'text', text: H800_EXTRACTION_PROMPT },
          ],
        },
      ],
    }),
  });

  if (!response.ok) throw new Error(`Anthropic API error: ${response.status}`);
  const data = await response.json() as { content: Array<{ text: string }> };
  const text = data.content[0]?.text ?? '{}';
  return { ...JSON.parse(text), model: 'claude-haiku-4-5' };
}

async function scanWithGPT4Mini(base64Image: string, mimeType: string): Promise<ScanResult> {
  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${OPENAI_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'gpt-4o-mini',
      max_tokens: 1024,
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'image_url',
              image_url: { url: `data:${mimeType};base64,${base64Image}` },
            },
            { type: 'text', text: H800_EXTRACTION_PROMPT },
          ],
        },
      ],
    }),
  });

  if (!response.ok) throw new Error(`OpenAI API error: ${response.status}`);
  const data = await response.json() as { choices: Array<{ message: { content: string } }> };
  const text = data.choices[0]?.message.content ?? '{}';
  return { ...JSON.parse(text), model: 'gpt-4o-mini' };
}

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get('image') as File | null;

    if (!file) {
      return NextResponse.json({ error: 'No image provided' }, { status: 400 });
    }

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json({ error: 'Unsupported image type. Use JPEG, PNG, or WebP.' }, { status: 400 });
    }

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json({ error: 'Image too large. Max 10MB.' }, { status: 400 });
    }

    const arrayBuffer = await file.arrayBuffer();
    const base64 = Buffer.from(arrayBuffer).toString('base64');
    const mimeType = file.type;

    let result: ScanResult;

    // Try Claude first, fall back to GPT-4o-mini
    if (ANTHROPIC_API_KEY) {
      result = await scanWithClaude(base64, mimeType);
    } else if (OPENAI_API_KEY) {
      result = await scanWithGPT4Mini(base64, mimeType);
    } else {
      return NextResponse.json(
        { error: 'No AI API key configured. Set ANTHROPIC_API_KEY or OPENAI_API_KEY.' },
        { status: 503 },
      );
    }

    return NextResponse.json({
      success: true,
      ...result,
      scannedAt: new Date().toISOString(),
    });
  } catch (err) {
    console.error('Form scan error:', err);
    return NextResponse.json(
      { error: 'Form scanning failed', details: err instanceof Error ? err.message : 'Unknown error' },
      { status: 500 },
    );
  }
}

export const runtime = 'nodejs';
export const maxDuration = 30;
