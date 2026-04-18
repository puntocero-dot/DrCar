'use client'

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRealtimeSubscription } from './useRealtimeSubscription'

export function useRealtimeRepairs(technicianId?: string) {
  const [repairs, setRepairs] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  const fetchRepairs = useCallback(async () => {
    let query = supabase
      .from('reparaciones')
      .select('*, vehiculos(license_plate, make, model), profiles!reparaciones_technician_id_fkey(full_name)')
      .order('created_at', { ascending: false })

    if (technicianId) {
      query = query.eq('technician_id', technicianId)
    }

    const { data } = await query
    setRepairs(data || [])
    setLoading(false)
  }, [supabase, technicianId])

  useEffect(() => {
    fetchRepairs()
  }, [fetchRepairs])

  useRealtimeSubscription({
    table: 'reparaciones',
    filter: technicianId ? `technician_id=eq.${technicianId}` : undefined,
    onInsert: (payload) => {
      setRepairs((prev) => [payload.new, ...prev])
    },
    onUpdate: (payload) => {
      setRepairs((prev) =>
        prev.map((r) => (r.id === payload.new.id ? { ...r, ...payload.new } : r))
      )
    },
    onDelete: (payload) => {
      setRepairs((prev) => prev.filter((r) => r.id !== payload.old.id))
    },
  })

  return { repairs, loading, refetch: fetchRepairs }
}
