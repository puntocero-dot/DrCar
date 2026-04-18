import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { createClient as createSupabaseClient } from '@supabase/supabase-js'
import { cookies } from 'next/headers'
import { GLB_MODEL_MAP } from '@/lib/paint/materials'
import type { PaintConfig, PaintSession, CarBodyType } from '@/lib/types/database'

// ── helpers ────────────────────────────────────────────────────────────────

/** Untyped Supabase client — bypasses complex generic constraints */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function getAnonClient(): any {
  return createRouteHandlerClient({ cookies })
}

// ── POST — Create session ──────────────────────────────────────────────────

interface CreateSessionBody {
  client_name: string
  client_email: string
  client_phone?: string
  car_make?: string
  car_model?: string
  car_year?: number
  car_body_type?: CarBodyType
  repair_id?: string
}

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as CreateSessionBody

    if (!body.client_name || !body.client_email) {
      return NextResponse.json(
        { error: 'client_name and client_email are required' },
        { status: 400 },
      )
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(body.client_email)) {
      return NextResponse.json({ error: 'Invalid email address' }, { status: 400 })
    }

    const glb_model_path =
      body.car_body_type && GLB_MODEL_MAP[body.car_body_type]
        ? GLB_MODEL_MAP[body.car_body_type]
        : '/models/cars/ferrari.glb'

    const insertPayload = {
      client_name: body.client_name,
      client_email: body.client_email,
      client_phone: body.client_phone ?? null,
      car_make: body.car_make ?? null,
      car_model: body.car_model ?? null,
      car_year: body.car_year ?? null,
      car_body_type: body.car_body_type ?? null,
      glb_model_path,
      repair_id: body.repair_id ?? null,
      status: 'active',
      paint_config: {},
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

    let client: ReturnType<typeof getAnonClient>
    if (supabaseUrl && serviceKey) {
      client = createSupabaseClient(supabaseUrl, serviceKey)
    } else {
      client = getAnonClient()
    }

    const { data, error: insertError } = (await client
      .from('paint_sessions')
      .insert(insertPayload)
      .select('id, access_token')
      .single()) as { data: Pick<PaintSession, 'id' | 'access_token'> | null; error: { message: string } | null }

    if (insertError || !data) {
      console.error('[session POST] Supabase error:', insertError)
      return NextResponse.json(
        { error: insertError?.message ?? 'Failed to create session' },
        { status: 500 },
      )
    }

    return NextResponse.json({
      session_id: data.id,
      access_token: data.access_token,
      configure_url: `/paint-visualizer/configure/${data.id}`,
    })
  } catch (err) {
    console.error('[session POST] Unexpected error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// ── GET — Fetch session by token ───────────────────────────────────────────

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const token = searchParams.get('token')

    if (!token) {
      return NextResponse.json({ error: 'token query param is required' }, { status: 400 })
    }

    const db = getAnonClient()

    const { data, error } = (await db
      .from('paint_sessions')
      .select('*')
      .eq('access_token', token)
      .eq('status', 'active')
      .gt('expires_at', new Date().toISOString())
      .single()) as { data: PaintSession | null; error: { message: string } | null }

    if (error || !data) {
      return NextResponse.json({ error: 'Session not found or expired' }, { status: 404 })
    }

    return NextResponse.json(data)
  } catch (err) {
    console.error('[session GET] Unexpected error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// ── PATCH — Update paint_config ────────────────────────────────────────────

interface PatchSessionBody {
  session_id: string
  access_token: string
  paint_config: PaintConfig
}

export async function PATCH(req: NextRequest) {
  try {
    const body = (await req.json()) as PatchSessionBody

    if (!body.session_id || !body.access_token || !body.paint_config) {
      return NextResponse.json(
        { error: 'session_id, access_token, and paint_config are required' },
        { status: 400 },
      )
    }

    const db = getAnonClient()

    // Verify token ownership first
    const { data: existing, error: fetchError } = (await db
      .from('paint_sessions')
      .select('id')
      .eq('id', body.session_id)
      .eq('access_token', body.access_token)
      .eq('status', 'active')
      .single()) as { data: { id: string } | null; error: { message: string } | null }

    if (fetchError || !existing) {
      return NextResponse.json({ error: 'Session not found or token mismatch' }, { status: 404 })
    }

    const { error: updateError } = (await db
      .from('paint_sessions')
      .update({
        paint_config: body.paint_config,
        updated_at: new Date().toISOString(),
      })
      .eq('id', body.session_id)) as { error: { message: string } | null }

    if (updateError) {
      console.error('[session PATCH] Update error:', updateError)
      return NextResponse.json({ error: updateError.message }, { status: 500 })
    }

    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error('[session PATCH] Unexpected error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
