'use client'

import { useEffect, useRef, useState } from 'react'
import type { PaintConfig } from '@/lib/types/database'

export function usePaintSessionSync(
  sessionId: string | null,
  accessToken: string | null,
  paintConfig: PaintConfig,
) {
  const [isSaving, setIsSaving] = useState(false)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const isFirstRender = useRef(true)

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false
      return
    }
    if (!sessionId || !accessToken) return

    if (timerRef.current) clearTimeout(timerRef.current)

    timerRef.current = setTimeout(async () => {
      setIsSaving(true)
      try {
        await fetch('/api/paint-visualizer/session', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            session_id: sessionId,
            access_token: accessToken,
            paint_config: paintConfig,
          }),
        })
      } finally {
        setIsSaving(false)
      }
    }, 2000)

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current)
    }
  }, [paintConfig]) // eslint-disable-line react-hooks/exhaustive-deps

  return { isSaving }
}
