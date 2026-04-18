import { cookies } from 'next/headers'
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { AlertCircle, Paintbrush } from 'lucide-react'
import type { PaintSession, PaintConfig } from '@/lib/types/database'
import MagicSessionViewer from './MagicSessionViewer'

interface PageProps {
  params: { token: string }
}

export default async function PaintSessionTokenPage({ params }: PageProps) {
  const cookieStore = cookies()
  // Use untyped client to avoid Relationships constraint with @supabase/supabase-js v2.97+
  const supabase = createServerComponentClient({ cookies: () => cookieStore })

  const { data: session, error } = (await supabase
    .from('paint_sessions')
    .select('*')
    .eq('access_token', params.token)
    .eq('status', 'active')
    .gt('expires_at', new Date().toISOString())
    .single()) as { data: PaintSession | null; error: unknown }

  if (error || !session) {
    return (
      <main className="min-h-screen bg-gray-950 flex items-center justify-center px-4">
        <div className="max-w-md w-full text-center space-y-4">
          <div className="w-14 h-14 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center mx-auto">
            <AlertCircle className="w-7 h-7 text-red-400" />
          </div>
          <h1 className="text-xl font-semibold text-white">Sesión no encontrada</h1>
          <p className="text-gray-400 text-sm leading-relaxed">
            El enlace es inválido, ha expirado o la sesión fue desactivada.
            <br />
            Solicita un nuevo enlace de visualización.
          </p>
          <a
            href="/paint-visualizer"
            className="inline-flex items-center gap-2 mt-2 text-sm text-yellow-400 hover:text-yellow-300 transition-colors"
          >
            <Paintbrush className="w-4 h-4" />
            Crear nueva sesión
          </a>
        </div>
      </main>
    )
  }

  const initialPaintConfig: PaintConfig =
    session.paint_config && typeof session.paint_config === 'object'
      ? (session.paint_config as PaintConfig)
      : {}

  return (
    <MagicSessionViewer
      sessionId={session.id}
      accessToken={session.access_token}
      clientName={session.client_name}
      glbModelPath={session.glb_model_path ?? '/models/cars/ferrari.glb'}
      initialPaintConfig={initialPaintConfig}
    />
  )
}
