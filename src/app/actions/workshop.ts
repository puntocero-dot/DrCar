'use server'

import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { vehicleSchema, appointmentSchema, repairSchema } from '@/lib/validation/schemas'

function getSupabase() {
  const cookieStore = cookies()
  return createServerComponentClient({ cookies: () => cookieStore })
}

async function requireAuth() {
  const supabase = getSupabase()
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) throw new Error('No autenticado')

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', session.user.id)
    .single()

  return { supabase, session, role: profile?.role || 'client' }
}

// --- VEHICLES ---
export async function getVehicles() {
  const { supabase, role } = await requireAuth()

  let query = supabase.from('vehiculos').select('*, profiles!vehiculos_client_id_fkey(full_name, email)')

  if (role === 'client') {
    query = supabase.from('vehiculos').select('*')
  }

  const { data, error } = await query.order('created_at', { ascending: false })
  return error ? { error: error.message, data: null } : { data, error: null }
}

export async function createVehicle(input: unknown) {
  const { supabase, session } = await requireAuth()

  const validation = vehicleSchema.safeParse(input)
  if (!validation.success) {
    return { error: validation.error.flatten().fieldErrors, data: null }
  }

  const { data, error } = await supabase
    .from('vehiculos')
    .insert({ ...validation.data, client_id: session.user.id })
    .select()
    .single()

  return error ? { error: error.message, data: null } : { data, error: null }
}

// --- REPAIRS ---
export async function getRepairs() {
  const { supabase } = await requireAuth()

  const { data, error } = await supabase
    .from('reparaciones')
    .select('*, vehiculos(license_plate, make, model), profiles!reparaciones_technician_id_fkey(full_name)')
    .order('created_at', { ascending: false })

  return error ? { error: error.message, data: null } : { data, error: null }
}

export async function createRepair(input: unknown) {
  const { supabase, session } = await requireAuth()

  const validation = repairSchema.safeParse(input)
  if (!validation.success) {
    return { error: validation.error.flatten().fieldErrors, data: null }
  }

  const { data, error } = await supabase
    .from('reparaciones')
    .insert({
      ...validation.data,
      client_id: session.user.id,
      created_by: session.user.id,
    })
    .select()
    .single()

  return error ? { error: error.message, data: null } : { data, error: null }
}

export async function updateRepairStatus(repairId: string, status: string) {
  const { supabase } = await requireAuth()

  const validStatuses = ['en_espera', 'en_proceso', 'esperando_repuestos', 'listo_entrega', 'completado', 'cancelado']
  if (!validStatuses.includes(status)) {
    return { error: 'Estado inválido', data: null }
  }

  const updateData: Record<string, unknown> = { status }
  if (status === 'completado') {
    updateData.completion_date = new Date().toISOString()
  }

  const { data, error } = await supabase
    .from('reparaciones')
    .update(updateData)
    .eq('id', repairId)
    .select()
    .single()

  return error ? { error: error.message, data: null } : { data, error: null }
}

// --- APPOINTMENTS ---
export async function getAppointments() {
  const { supabase } = await requireAuth()

  const { data, error } = await supabase
    .from('citas')
    .select('*, vehiculos(license_plate, make, model), profiles!citas_client_id_fkey(full_name, email)')
    .order('scheduled_date', { ascending: true })

  return error ? { error: error.message, data: null } : { data, error: null }
}

export async function createAppointment(input: unknown) {
  const { supabase, session } = await requireAuth()

  const validation = appointmentSchema.safeParse(input)
  if (!validation.success) {
    return { error: validation.error.flatten().fieldErrors, data: null }
  }

  const { data, error } = await supabase
    .from('citas')
    .insert({
      ...validation.data,
      client_id: session.user.id,
      created_by: session.user.id,
    })
    .select()
    .single()

  return error ? { error: error.message, data: null } : { data, error: null }
}

export async function updateAppointmentStatus(appointmentId: string, status: string) {
  const { supabase } = await requireAuth()

  const validStatuses = ['programada', 'confirmada', 'en_progreso', 'completada', 'cancelada', 'no_asistio']
  if (!validStatuses.includes(status)) {
    return { error: 'Estado inválido', data: null }
  }

  const { data, error } = await supabase
    .from('citas')
    .update({ status })
    .eq('id', appointmentId)
    .select()
    .single()

  return error ? { error: error.message, data: null } : { data, error: null }
}

// --- USERS (admin only) ---
export async function getUsers() {
  const { supabase, role } = await requireAuth()

  if (!['superadmin', 'admin'].includes(role)) {
    return { error: 'No autorizado', data: null }
  }

  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .order('created_at', { ascending: false })

  return error ? { error: error.message, data: null } : { data, error: null }
}

// --- DASHBOARD STATS ---
export async function getDashboardStats() {
  const { supabase, role } = await requireAuth()

  if (!['superadmin', 'admin'].includes(role)) {
    return { error: 'No autorizado', data: null }
  }

  const [repairs, appointments, vehicles, reservations] = await Promise.all([
    supabase.from('reparaciones').select('id, status, priority, actual_cost, created_at'),
    supabase.from('citas').select('id, status, scheduled_date'),
    supabase.from('vehiculos').select('id, status'),
    supabase.from('rental_reservations').select('id, status, total_price, created_at'),
  ])

  return {
    data: {
      repairs: repairs.data || [],
      appointments: appointments.data || [],
      vehicles: vehicles.data || [],
      reservations: reservations.data || [],
    },
    error: null,
  }
}
