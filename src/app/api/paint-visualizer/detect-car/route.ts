import { NextRequest, NextResponse } from 'next/server'
import type { CarBodyType } from '@/lib/types/database'

interface DetectedCarData {
  make: string
  model: string
  year: number
  body_type: CarBodyType
  color_hex: string
  stub?: boolean
}

const VALID_BODY_TYPES: CarBodyType[] = [
  'sedan', 'suv', 'hatchback', 'pickup', 'coupe', 'van', 'crossover',
]

function sanitizeBodyType(raw: string): CarBodyType {
  const normalized = raw.toLowerCase().trim() as CarBodyType
  return VALID_BODY_TYPES.includes(normalized) ? normalized : 'sedan'
}

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData()
    const imageFiles = formData.getAll('images') as File[]

    if (!imageFiles.length) {
      return NextResponse.json({ error: 'At least one image is required' }, { status: 400 })
    }

    // Validate file sizes (max 10 MB each)
    for (const file of imageFiles) {
      if (file.size > 10 * 1024 * 1024) {
        return NextResponse.json(
          { error: `File "${file.name}" exceeds 10 MB limit` },
          { status: 400 },
        )
      }
    }

    const apiKey = process.env.OPENAI_API_KEY

    // ── STUB MODE ──────────────────────────────────────────────────────────
    if (!apiKey) {
      await new Promise((resolve) => setTimeout(resolve, 1500))
      const stub: DetectedCarData = {
        make: 'Toyota',
        model: 'Corolla',
        year: 2022,
        body_type: 'sedan',
        color_hex: '#1A3A5C',
        stub: true,
      }
      return NextResponse.json(stub)
    }

    // ── REAL OPENAI VISION ─────────────────────────────────────────────────
    // Use the first image (or first few) — send only the first to keep cost low
    const firstImage = imageFiles[0]
    const arrayBuffer = await firstImage.arrayBuffer()
    const base64 = Buffer.from(arrayBuffer).toString('base64')
    const mimeType = firstImage.type || 'image/jpeg'

    const prompt = `Analyze this car image and return ONLY a JSON object with these fields:
{ "make": string, "model": string, "year": number, "body_type": "sedan"|"suv"|"hatchback"|"pickup"|"coupe"|"van"|"crossover", "color_hex": string }
If uncertain, make your best guess. Return ONLY the JSON, no other text.`

    const openaiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o',
        max_tokens: 256,
        messages: [
          {
            role: 'user',
            content: [
              {
                type: 'image_url',
                image_url: {
                  url: `data:${mimeType};base64,${base64}`,
                  detail: 'low',
                },
              },
              { type: 'text', text: prompt },
            ],
          },
        ],
      }),
    })

    if (!openaiResponse.ok) {
      const errText = await openaiResponse.text()
      console.error('[detect-car] OpenAI error:', errText)
      return NextResponse.json({ error: 'AI detection failed' }, { status: 502 })
    }

    const openaiData = (await openaiResponse.json()) as {
      choices: Array<{ message: { content: string } }>
    }

    const rawContent = openaiData.choices?.[0]?.message?.content ?? ''

    let parsed: Partial<DetectedCarData>
    try {
      // Strip markdown code fences if present
      const cleaned = rawContent.replace(/```(?:json)?/g, '').replace(/```/g, '').trim()
      parsed = JSON.parse(cleaned) as Partial<DetectedCarData>
    } catch {
      console.error('[detect-car] Failed to parse OpenAI response:', rawContent)
      return NextResponse.json({ error: 'Failed to parse AI response' }, { status: 502 })
    }

    const result: DetectedCarData = {
      make: typeof parsed.make === 'string' ? parsed.make : 'Unknown',
      model: typeof parsed.model === 'string' ? parsed.model : 'Unknown',
      year: typeof parsed.year === 'number' ? parsed.year : new Date().getFullYear(),
      body_type: typeof parsed.body_type === 'string' ? sanitizeBodyType(parsed.body_type) : 'sedan',
      color_hex: typeof parsed.color_hex === 'string' ? parsed.color_hex : '#808080',
    }

    return NextResponse.json(result)
  } catch (err) {
    console.error('[detect-car] Unexpected error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
