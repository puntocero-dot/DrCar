'use server'

import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { bookingParamsSchema, reservationIdSchema } from '@/lib/validation/schemas'

function getSupabase() {
  const cookieStore = cookies()
  return createServerComponentClient({ cookies: () => cookieStore })
}

export async function getCars(filters?: { vehicleClass?: string; transmission?: string; fuelType?: string }) {
  const supabase = getSupabase()

  let query = supabase
    .from('rental_cars')
    .select('*')
    .eq('status', 'AVAILABLE')

  if (filters?.vehicleClass && filters.vehicleClass !== 'All') {
    if (filters.vehicleClass === 'Electric') {
      query = query.eq('fuel_type', 'ELECTRIC')
    } else {
      query = query.eq('vehicle_class', filters.vehicleClass)
    }
  }

  if (filters?.transmission) {
    query = query.eq('transmission', filters.transmission)
  }

  const { data, error } = await query.order('price_per_day', { ascending: true })

  if (error) {
    return { error: error.message, data: null }
  }

  return { data, error: null }
}

export async function createReservation(params: {
  carId: string
  pickup: string
  returnLoc: string
  start: string
  end: string
  totalPrice: number
}) {
  const supabase = getSupabase()

  const { data: { session } } = await supabase.auth.getSession()
  if (!session) {
    return { error: 'No autenticado', data: null }
  }

  const validation = bookingParamsSchema.safeParse({
    carId: params.carId,
    pickup: params.pickup,
    return_loc: params.returnLoc,
    start: params.start,
    end: params.end,
  })

  if (!validation.success) {
    return { error: validation.error.flatten().fieldErrors, data: null }
  }

  const { data, error } = await supabase
    .from('rental_reservations')
    .insert({
      user_id: session.user.id,
      rental_car_id: params.carId,
      pickup_location: params.pickup,
      return_location: params.returnLoc,
      pickup_date: params.start,
      return_date: params.end,
      total_price: params.totalPrice,
      status: 'PENDING',
      renters_age_check: true,
    })
    .select()
    .single()

  if (error) {
    return { error: error.message, data: null }
  }

  return { data, error: null }
}

export async function getReservation(reservationId: string) {
  const supabase = getSupabase()

  const idValidation = reservationIdSchema.safeParse(reservationId)
  if (!idValidation.success) {
    return { error: 'ID de reservación inválido', data: null }
  }

  const { data: { session } } = await supabase.auth.getSession()
  if (!session) {
    return { error: 'No autenticado', data: null }
  }

  const { data, error } = await supabase
    .from('rental_reservations')
    .select('*, rental_cars(*)')
    .eq('id', reservationId)
    .eq('user_id', session.user.id)
    .single()

  if (error) {
    return { error: error.message, data: null }
  }

  return { data, error: null }
}

export async function cancelReservation(reservationId: string) {
  const supabase = getSupabase()

  const { data: { session } } = await supabase.auth.getSession()
  if (!session) {
    return { error: 'No autenticado', data: null }
  }

  const { data, error } = await supabase
    .from('rental_reservations')
    .update({ status: 'CANCELLED' })
    .eq('id', reservationId)
    .eq('user_id', session.user.id)
    .select()
    .single()

  if (error) {
    return { error: error.message, data: null }
  }

  return { data, error: null }
}

export async function getUserReservations() {
  const supabase = getSupabase()

  const { data: { session } } = await supabase.auth.getSession()
  if (!session) {
    return { error: 'No autenticado', data: null }
  }

  const { data, error } = await supabase
    .from('rental_reservations')
    .select('*, rental_cars(*)')
    .eq('user_id', session.user.id)
    .order('created_at', { ascending: false })

  if (error) {
    return { error: error.message, data: null }
  }

  return { data, error: null }
}
