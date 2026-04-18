export type UserRole = 'superadmin' | 'admin' | 'technician' | 'client'

export type RepairStatus = 'en_espera' | 'en_proceso' | 'esperando_repuestos' | 'listo_entrega' | 'completado' | 'cancelado'

export type Priority = 'baja' | 'media' | 'alta' | 'urgente'

export type UrgencyLevel = 'verde' | 'amarillo' | 'rojo'

export type AppointmentStatus = 'programada' | 'confirmada' | 'en_progreso' | 'completada' | 'cancelada' | 'no_asistio'

export type BudgetStatus = 'pendiente' | 'enviado' | 'aprobado' | 'rechazado' | 'vencido'

export interface Profile {
  id: string
  email: string
  full_name: string | null
  phone: string | null
  role: UserRole
  avatar_url: string | null
  created_at: string
  updated_at: string
}

export interface Vehicle {
  id: string
  client_id: string
  license_plate: string
  vin: string | null
  make: string
  model: string
  year: number
  color: string | null
  engine_type: string | null
  current_mileage: number
  last_service_date: string | null
  next_service_date: string | null
  status: 'active' | 'inactive' | 'in_service'
  notes: string | null
  created_at: string
  updated_at: string
}

export interface Repair {
  id: string
  vehicle_id: string
  technician_id: string | null
  client_id: string
  title: string
  description: string | null
  status: RepairStatus
  priority: Priority
  estimated_cost: number | null
  actual_cost: number | null
  estimated_hours: number | null
  actual_hours: number | null
  start_date: string | null
  completion_date: string | null
  notes: string | null
  created_by: string | null
  created_at: string
  updated_at: string
}

export interface RepairTask {
  id: string
  reparacion_id: string
  title: string
  description: string | null
  task_type: 'cambio_pieza' | 'mantenimiento' | 'diagnostico' | 'revision' | 'limpieza'
  status: 'pendiente' | 'en_progreso' | 'completada' | 'cancelada'
  requires_evidence: boolean
  estimated_time: number | null
  actual_time: number | null
  parts_used: string | null
  urgency_level: UrgencyLevel
  created_at: string
  updated_at: string
}

export interface Evidence {
  id: string
  task_id: string | null
  reparacion_id: string | null
  vehicle_id: string | null
  uploaded_by: string
  file_type: 'image' | 'video' | 'document'
  file_url: string
  file_name: string
  file_size: number | null
  description: string | null
  is_before: boolean
  created_at: string
}

export interface Appointment {
  id: string
  client_id: string
  vehicle_id: string
  technician_id: string | null
  service_type: string
  description: string | null
  scheduled_date: string
  duration: number | null
  status: AppointmentStatus
  priority: Priority
  estimated_cost: number | null
  notes: string | null
  reminder_sent: boolean
  created_by: string | null
  created_at: string
  updated_at: string
}

export interface Budget {
  id: string
  reparacion_id: string | null
  client_id: string
  vehicle_id: string
  title: string
  description: string | null
  total_amount: number
  labor_cost: number | null
  parts_cost: number | null
  tax_amount: number | null
  status: BudgetStatus
  valid_until: string | null
  notes: string | null
  created_by: string | null
  created_at: string
  updated_at: string
}

export interface Permission {
  id: string
  role: UserRole
  module: string
  can_view: boolean
  can_create: boolean
  can_edit: boolean
  can_delete: boolean
  is_active: boolean
  created_by: string | null
  created_at: string
  updated_at: string
}

export type TransmissionType = 'AUTOMATIC' | 'MANUAL'
export type FuelType = 'GASOLINE' | 'DIESEL' | 'HYBRID' | 'ELECTRIC'
export type RentalStatus = 'AVAILABLE' | 'RENTED' | 'MAINTENANCE' | 'OUT_OF_SERVICE'
export type ReservationStatus = 'PENDING_PAYMENT' | 'PAID' | 'CONFIRMED' | 'ACTIVE' | 'COMPLETED' | 'CANCELLED'

export interface RentalCar {
  id: string
  plate: string
  brand: string
  model: string
  year: number
  vehicle_class: string
  image_url: string | null
  seats: number
  doors: number
  luggage_capacity: number
  transmission: TransmissionType
  fuel_type: FuelType
  price_per_day: number
  status: RentalStatus
  created_at: string
  updated_at: string
}

export interface RentalReservation {
  id: string
  user_id: string | null
  rental_car_id: string
  pickup_location: string
  return_location: string
  pickup_date: string
  return_date: string
  renters_age_check: boolean
  promo_code: string | null
  total_price: number
  status: ReservationStatus
  created_at: string
  updated_at: string
}

// =========================================================
// Paint Visualizer Types
// =========================================================

export type PaintSessionStatus = 'active' | 'completed' | 'archived'
export type CarBodyType = 'sedan' | 'suv' | 'hatchback' | 'pickup' | 'coupe' | 'van' | 'crossover'
export type PaintFinish = 'solid' | 'metallic' | 'pearl' | 'matte'

export interface PartPaintConfig {
  color: string        // hex
  finish: PaintFinish
  metalness?: number   // 0-1
  roughness?: number   // 0-1
  clearcoat?: number   // 0-1
}

export interface PaintConfig {
  body?: PartPaintConfig
  doors?: PartPaintConfig
  roof?: PartPaintConfig
  wheels?: PartPaintConfig
  bumper_front?: PartPaintConfig
  bumper_rear?: PartPaintConfig
}

export interface PaintSession {
  id: string
  repair_id: string | null
  client_email: string
  client_name: string
  client_phone: string | null
  access_token: string
  status: PaintSessionStatus
  car_make: string | null
  car_model: string | null
  car_year: number | null
  car_body_type: CarBodyType | null
  car_color_hex: string | null
  glb_model_path: string | null
  paint_config: PaintConfig
  created_at: string
  updated_at: string
  expires_at: string
  created_by: string | null
}

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: Profile
        Insert: Omit<Profile, 'created_at' | 'updated_at'>
        Update: Partial<Profile>
      }
      vehiculos: {
        Row: Vehicle
        Insert: Omit<Vehicle, 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Vehicle>
      }
      reparaciones: {
        Row: Repair
        Insert: Omit<Repair, 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Repair>
      }
      evidencias_multimedia: {
        Row: Evidence
        Insert: Omit<Evidence, 'id' | 'created_at'>
        Update: Partial<Evidence>
      }
      configuracion_permisos: {
        Row: Permission
        Insert: Omit<Permission, 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Permission>
      }
      citas: {
        Row: Appointment
        Insert: Omit<Appointment, 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Appointment>
      }
      rental_cars: {
        Row: RentalCar
        Insert: Omit<RentalCar, 'id' | 'created_at' | 'updated_at'>
        Update: Partial<RentalCar>
      }
      rental_reservations: {
        Row: RentalReservation
        Insert: Omit<RentalReservation, 'id' | 'created_at' | 'updated_at'>
        Update: Partial<RentalReservation>
      }
      paint_sessions: {
        Row: PaintSession
        Insert: Omit<PaintSession, 'id' | 'access_token' | 'created_at' | 'updated_at' | 'expires_at'> & {
          status?: PaintSessionStatus
          paint_config?: PaintConfig
        }
        Update: Partial<Omit<PaintSession, 'id' | 'access_token' | 'created_at'>>
        Relationships: never[]
      }
    }
  }
}
