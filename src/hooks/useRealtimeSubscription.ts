'use client'

import { useEffect, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { RealtimeChannel } from '@supabase/supabase-js'

type PostgresChangeEvent = 'INSERT' | 'UPDATE' | 'DELETE' | '*'

interface UseRealtimeOptions {
  table: string
  schema?: string
  event?: PostgresChangeEvent
  filter?: string
  onInsert?: (payload: any) => void
  onUpdate?: (payload: any) => void
  onDelete?: (payload: any) => void
  onChange?: (payload: any) => void
  enabled?: boolean
}

export function useRealtimeSubscription({
  table,
  schema = 'public',
  event = '*',
  filter,
  onInsert,
  onUpdate,
  onDelete,
  onChange,
  enabled = true,
}: UseRealtimeOptions) {
  const channelRef = useRef<RealtimeChannel | null>(null)
  const supabase = createClient()

  useEffect(() => {
    if (!enabled) return

    const channelConfig: any = {
      event,
      schema,
      table,
    }
    if (filter) {
      channelConfig.filter = filter
    }

    const channel = supabase
      .channel(`realtime-${table}-${Date.now()}`)
      .on('postgres_changes', channelConfig, (payload: any) => {
        onChange?.(payload)

        switch (payload.eventType) {
          case 'INSERT':
            onInsert?.(payload)
            break
          case 'UPDATE':
            onUpdate?.(payload)
            break
          case 'DELETE':
            onDelete?.(payload)
            break
        }
      })
      .subscribe()

    channelRef.current = channel

    return () => {
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current)
      }
    }
  }, [table, schema, event, filter, enabled])

  return channelRef.current
}
