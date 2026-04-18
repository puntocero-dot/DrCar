import { NextRequest, NextResponse } from 'next/server'
import { createClient as createSupabaseClient } from '@supabase/supabase-js'
import type { PaintSession } from '@/lib/types/database'

interface SendLinkBody {
  session_id: string
  access_token?: string
}

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as SendLinkBody

    if (!body.session_id) {
      return NextResponse.json({ error: 'session_id is required' }, { status: 400 })
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

    if (!supabaseUrl || !serviceKey) {
      return NextResponse.json({ error: 'Server configuration error' }, { status: 500 })
    }

    const client = createSupabaseClient(supabaseUrl, serviceKey)

    const { data: session, error } = (await client
      .from('paint_sessions')
      .select('id, access_token, status')
      .eq('id', body.session_id)
      .single()) as { data: Pick<PaintSession, 'id' | 'access_token' | 'status'> | null; error: { message: string } | null }

    if (error || !session) {
      return NextResponse.json({ error: 'Session not found' }, { status: 404 })
    }

    const baseUrl = process.env.NEXTAUTH_URL ?? process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'
    const link = `${baseUrl}/paint-visualizer/s/${session.access_token}`
    const whatsappText = `Hola, te comparto tu sesión de Paint Visualizer para ver los colores de tu vehículo: ${link}`
    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(whatsappText)}`

    return NextResponse.json({
      link,
      whatsapp_url: whatsappUrl,
      email_pending: true,
    })
  } catch (err) {
    console.error('[send-link POST] Unexpected error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
