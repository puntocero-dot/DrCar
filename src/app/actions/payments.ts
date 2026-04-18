'use server'

import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { reservationIdSchema } from '@/lib/validation/schemas'

function getSupabase() {
  const cookieStore = cookies()
  return createServerComponentClient({ cookies: () => cookieStore })
}

export async function initiatePayment(reservationId: string, paymentMethod: 'card' | 'qr') {
  const supabase = getSupabase()

  // Validate input
  const idValidation = reservationIdSchema.safeParse(reservationId)
  if (!idValidation.success) {
    return { error: 'ID de reservación inválido', data: null }
  }

  // Verify auth
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) {
    return { error: 'No autenticado', data: null }
  }

  // Fetch reservation and verify ownership
  const { data: reservation, error: fetchError } = await supabase
    .from('rental_reservations')
    .select('*, rental_cars(brand, model)')
    .eq('id', reservationId)
    .eq('user_id', session.user.id)
    .single()

  if (fetchError || !reservation) {
    return { error: 'Reservación no encontrada', data: null }
  }

  if (reservation.status === 'CONFIRMED' || reservation.status === 'COMPLETED') {
    return { error: 'Esta reservación ya fue pagada', data: null }
  }

  if (reservation.status === 'CANCELLED') {
    return { error: 'Esta reservación fue cancelada', data: null }
  }

  // In a real implementation, this would:
  // 1. Create a payment record in a payments table
  // 2. Integrate with Serfinsa/BAC payment gateway
  // 3. Return a payment session URL or token
  // For now, we process server-side (not client-side like before)

  const { data: updated, error: updateError } = await supabase
    .from('rental_reservations')
    .update({ status: 'CONFIRMED' })
    .eq('id', reservationId)
    .eq('user_id', session.user.id)
    .select()
    .single()

  if (updateError) {
    return { error: 'Error procesando pago', data: null }
  }

  // Send confirmation email
  try {
    const rentalCar = (reservation as any).rental_cars
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'
    await fetch(`${baseUrl}/api/resend/booking-email`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: session.user.email,
        reservationId,
        carModel: `${rentalCar?.brand} ${rentalCar?.model}`,
        totalPrice: reservation.total_price,
      }),
    })
  } catch {
    // Email failure should not block payment confirmation
  }

  return {
    data: {
      reservationId,
      status: 'CONFIRMED',
      paymentMethod,
      totalPrice: reservation.total_price,
    },
    error: null,
  }
}

export async function verifyPayment(reservationId: string) {
  const supabase = getSupabase()

  const { data: { session } } = await supabase.auth.getSession()
  if (!session) {
    return { error: 'No autenticado', data: null }
  }

  const { data, error } = await supabase
    .from('rental_reservations')
    .select('id, status, total_price')
    .eq('id', reservationId)
    .eq('user_id', session.user.id)
    .single()

  if (error || !data) {
    return { error: 'Reservación no encontrada', data: null }
  }

  return {
    data: {
      reservationId: data.id,
      status: data.status,
      isPaid: data.status === 'CONFIRMED' || data.status === 'COMPLETED',
    },
    error: null,
  }
}
