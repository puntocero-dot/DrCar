import { z } from 'zod'

// --- Auth Schemas ---
export const loginSchema = z.object({
  email: z.string().email('Email inválido').min(1, 'Email requerido'),
  password: z.string().min(6, 'Mínimo 6 caracteres').max(128, 'Máximo 128 caracteres'),
})

export type LoginInput = z.infer<typeof loginSchema>

// --- Booking Schemas ---
export const bookingParamsSchema = z.object({
  carId: z.string().uuid('ID de vehículo inválido'),
  pickup: z.string().min(1, 'Lugar de retiro requerido'),
  return_loc: z.string().min(1, 'Lugar de devolución requerido'),
  start: z.string().refine((val) => !isNaN(Date.parse(val)), 'Fecha de inicio inválida'),
  end: z.string().refine((val) => !isNaN(Date.parse(val)), 'Fecha de fin inválida'),
}).refine((data) => {
  const startDate = new Date(data.start)
  const endDate = new Date(data.end)
  return endDate > startDate
}, {
  message: 'La fecha de fin debe ser posterior a la de inicio',
  path: ['end'],
})

export type BookingParams = z.infer<typeof bookingParamsSchema>

export const reservationIdSchema = z.string().uuid('ID de reservación inválido')

// --- Rental Car Schemas ---
export const rentalCarFilterSchema = z.object({
  pickup: z.string().optional(),
  start: z.string().optional(),
  end: z.string().optional(),
  vehicleClass: z.string().optional(),
  transmission: z.enum(['AUTOMATIC', 'MANUAL']).optional(),
  fuelType: z.enum(['GASOLINE', 'DIESEL', 'HYBRID', 'ELECTRIC']).optional(),
  minPrice: z.number().min(0).optional(),
  maxPrice: z.number().min(0).optional(),
})

// --- Payment Schemas ---
export const paymentInitSchema = z.object({
  reservationId: z.string().uuid('ID de reservación inválido'),
  paymentMethod: z.enum(['card', 'qr'], {
    errorMap: () => ({ message: 'Método de pago inválido' }),
  }),
})

export type PaymentInitInput = z.infer<typeof paymentInitSchema>

// --- Email Notification Schemas ---
export const bookingEmailSchema = z.object({
  email: z.string().email('Email inválido'),
  reservationId: z.string().uuid('ID de reservación inválido'),
  carModel: z.string().min(1, 'Modelo requerido'),
  totalPrice: z.number().min(0, 'Precio inválido'),
})

export type BookingEmailInput = z.infer<typeof bookingEmailSchema>

// --- Vehicle Schemas (Workshop) ---
export const vehicleSchema = z.object({
  license_plate: z.string().min(1, 'Placa requerida').max(20),
  vin: z.string().max(17).optional(),
  make: z.string().min(1, 'Marca requerida'),
  model: z.string().min(1, 'Modelo requerido'),
  year: z.number().int().min(1900).max(new Date().getFullYear() + 1),
  color: z.string().optional(),
  engine_type: z.string().optional(),
  current_mileage: z.number().int().min(0).optional(),
})

export type VehicleInput = z.infer<typeof vehicleSchema>

// --- Appointment Schemas ---
export const appointmentSchema = z.object({
  vehicle_id: z.string().uuid('ID de vehículo inválido'),
  service_type: z.string().min(1, 'Tipo de servicio requerido'),
  description: z.string().optional(),
  scheduled_date: z.string().refine((val) => !isNaN(Date.parse(val)), 'Fecha inválida'),
  priority: z.enum(['baja', 'media', 'alta']).default('media'),
  notes: z.string().optional(),
})

export type AppointmentInput = z.infer<typeof appointmentSchema>

// --- Repair Schemas ---
export const repairSchema = z.object({
  vehicle_id: z.string().uuid('ID de vehículo inválido'),
  title: z.string().min(1, 'Título requerido'),
  description: z.string().optional(),
  priority: z.enum(['baja', 'media', 'alta', 'urgente']).default('media'),
  estimated_cost: z.number().min(0).optional(),
  estimated_hours: z.number().int().min(0).optional(),
  notes: z.string().optional(),
})

export type RepairInput = z.infer<typeof repairSchema>
