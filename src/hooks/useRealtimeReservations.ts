'use client'

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRealtimeSubscription } from './useRealtimeSubscription'

export function useRealtimeReservations(userId?: string) {
  const [reservations, setReservations] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  const fetchReservations = useCallback(async () => {
    let query = supabase
      .from('rental_reservations')
      .select('*, rental_cars(*)')
      .order('created_at', { ascending: false })

    if (userId) {
      query = query.eq('user_id', userId)
    }

    const { data } = await query
    setReservations(data || [])
    setLoading(false)
  }, [supabase, userId])

  useEffect(() => {
    fetchReservations()
  }, [fetchReservations])

  useRealtimeSubscription({
    table: 'rental_reservations',
    filter: userId ? `user_id=eq.${userId}` : undefined,
    onInsert: (payload) => {
      setReservations((prev) => [payload.new, ...prev])
    },
    onUpdate: (payload) => {
      setReservations((prev) =>
        prev.map((r) => (r.id === payload.new.id ? { ...r, ...payload.new } : r))
      )
    },
  })

  return { reservations, loading, refetch: fetchReservations }
}
