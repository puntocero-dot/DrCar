-- AutoMaster AI - Esquema Inicial de Base de Datos
-- Compatible con Supabase PostgreSQL

-- Extensiones necesarias
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Tabla de Perfiles de Usuario (extiende auth.users)
CREATE TABLE IF NOT EXISTS profiles (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT,
  phone TEXT,
  role TEXT NOT NULL CHECK (role IN ('superadmin', 'admin', 'technician', 'client')),
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla de Configuración de Permisos
CREATE TABLE IF NOT EXISTS configuracion_permisos (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  role TEXT NOT NULL CHECK (role IN ('superadmin', 'admin', 'technician', 'client')),
  module TEXT NOT NULL,
  can_view BOOLEAN DEFAULT true,
  can_create BOOLEAN DEFAULT false,
  can_edit BOOLEAN DEFAULT false,
  can_delete BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  created_by UUID REFERENCES profiles(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(role, module)
);

-- Tabla de Vehículos
CREATE TABLE IF NOT EXISTS vehiculos (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  client_id UUID REFERENCES profiles(id) NOT NULL,
  license_plate TEXT UNIQUE NOT NULL,
  vin TEXT UNIQUE,
  make TEXT NOT NULL,
  model TEXT NOT NULL,
  year INTEGER NOT NULL,
  color TEXT,
  engine_type TEXT,
  current_mileage INTEGER DEFAULT 0,
  last_service_date DATE,
  next_service_date DATE,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'in_service')),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla de Reparaciones
CREATE TABLE IF NOT EXISTS reparaciones (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  vehicle_id UUID REFERENCES vehiculos(id) NOT NULL,
  technician_id UUID REFERENCES profiles(id),
  client_id UUID REFERENCES profiles(id) NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  status TEXT DEFAULT 'en_espera' CHECK (status IN ('en_espera', 'en_proceso', 'esperando_repuestos', 'listo_entrega', 'completado', 'cancelado')),
  priority TEXT DEFAULT 'media' CHECK (priority IN ('baja', 'media', 'alta', 'urgente')),
  estimated_cost DECIMAL(10,2),
  actual_cost DECIMAL(10,2),
  estimated_hours INTEGER,
  actual_hours INTEGER,
  start_date TIMESTAMP WITH TIME ZONE,
  completion_date TIMESTAMP WITH TIME ZONE,
  notes TEXT,
  created_by UUID REFERENCES profiles(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla de Tareas de Reparación
CREATE TABLE IF NOT EXISTS reparacion_tareas (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  reparacion_id UUID REFERENCES reparaciones(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  task_type TEXT NOT NULL CHECK (task_type IN ('cambio_pieza', 'mantenimiento', 'diagnostico', 'revision', 'limpieza')),
  status TEXT DEFAULT 'pendiente' CHECK (status IN ('pendiente', 'en_progreso', 'completada', 'cancelada')),
  requires_evidence BOOLEAN DEFAULT false,
  estimated_time INTEGER,
  actual_time INTEGER,
  parts_used TEXT,
  urgency_level TEXT DEFAULT 'verde' CHECK (urgency_level IN ('verde', 'amarillo', 'rojo')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla de Evidencias Multimedia
CREATE TABLE IF NOT EXISTS evidencias_multimedia (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  task_id UUID REFERENCES reparacion_tareas(id) ON DELETE CASCADE,
  reparacion_id UUID REFERENCES reparaciones(id) ON DELETE CASCADE,
  vehicle_id UUID REFERENCES vehiculos(id) ON DELETE CASCADE,
  uploaded_by UUID REFERENCES profiles(id) NOT NULL,
  file_type TEXT NOT NULL CHECK (file_type IN ('image', 'video', 'document')),
  file_url TEXT NOT NULL,
  file_name TEXT NOT NULL,
  file_size INTEGER,
  description TEXT,
  is_before BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla de Mantenimiento Programado
CREATE TABLE IF NOT EXISTS mantenimiento_programado (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  vehicle_id UUID REFERENCES vehiculos(id) NOT NULL,
  service_type TEXT NOT NULL CHECK (service_type IN ('oil_change', 'filter_change', 'brake_service', 'tire_rotation', 'general_service')),
  description TEXT,
  scheduled_date DATE NOT NULL,
  scheduled_mileage INTEGER,
  status TEXT DEFAULT 'programado' CHECK (status IN ('programado', 'completado', 'cancelado', 'pospuesto')),
  estimated_cost DECIMAL(10,2),
  actual_cost DECIMAL(10,2),
  notes TEXT,
  created_by UUID REFERENCES profiles(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla de Consumo de Combustible
CREATE TABLE IF NOT EXISTS consumo_combustible (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  vehicle_id UUID REFERENCES vehiculos(id) NOT NULL,
  date DATE NOT NULL,
  mileage INTEGER NOT NULL,
  fuel_amount DECIMAL(8,3) NOT NULL,
  fuel_type TEXT,
  price_per_gallon DECIMAL(8,2),
  total_cost DECIMAL(10,2),
  efficiency_km_per_gallon DECIMAL(8,2),
  notes TEXT,
  created_by UUID REFERENCES profiles(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla de Citas
CREATE TABLE IF NOT EXISTS citas (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  client_id UUID REFERENCES profiles(id) NOT NULL,
  vehicle_id UUID REFERENCES vehiculos(id) NOT NULL,
  technician_id UUID REFERENCES profiles(id),
  service_type TEXT NOT NULL,
  description TEXT,
  scheduled_date TIMESTAMP WITH TIME ZONE NOT NULL,
  duration INTEGER, -- en minutos
  status TEXT DEFAULT 'programada' CHECK (status IN ('programada', 'confirmada', 'en_progreso', 'completada', 'cancelada', 'no_asistio')),
  priority TEXT DEFAULT 'media' CHECK (priority IN ('baja', 'media', 'alta')),
  estimated_cost DECIMAL(10,2),
  notes TEXT,
  reminder_sent BOOLEAN DEFAULT false,
  created_by UUID REFERENCES profiles(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla de Presupuestos
CREATE TABLE IF NOT EXISTS presupuestos (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  reparacion_id UUID REFERENCES reparaciones(id) ON DELETE CASCADE,
  client_id UUID REFERENCES profiles(id) NOT NULL,
  vehicle_id UUID REFERENCES vehiculos(id) NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  total_amount DECIMAL(10,2) NOT NULL,
  labor_cost DECIMAL(10,2),
  parts_cost DECIMAL(10,2),
  tax_amount DECIMAL(10,2),
  status TEXT DEFAULT 'pendiente' CHECK (status IN ('pendiente', 'enviado', 'aprobado', 'rechazado', 'vencido')),
  valid_until DATE,
  notes TEXT,
  created_by UUID REFERENCES profiles(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla de Detalles de Presupuesto
CREATE TABLE IF NOT EXISTS presupuesto_detalles (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  presupuesto_id UUID REFERENCES presupuestos(id) ON DELETE CASCADE NOT NULL,
  item_name TEXT NOT NULL,
  item_type TEXT CHECK (item_type IN ('part', 'labor', 'service')),
  quantity INTEGER DEFAULT 1,
  unit_price DECIMAL(10,2) NOT NULL,
  total_price DECIMAL(10,2) NOT NULL,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla de Configuración del Sistema
CREATE TABLE IF NOT EXISTS configuracion_sistema (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  key TEXT UNIQUE NOT NULL,
  value TEXT,
  description TEXT,
  is_active BOOLEAN DEFAULT true,
  updated_by UUID REFERENCES profiles(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para optimización
CREATE INDEX IF NOT EXISTS idx_vehiculos_client_id ON vehiculos(client_id);
CREATE INDEX IF NOT EXISTS idx_vehiculos_license_plate ON vehiculos(license_plate);
CREATE INDEX IF NOT EXISTS idx_reparaciones_vehicle_id ON reparaciones(vehicle_id);
CREATE INDEX IF NOT EXISTS idx_reparaciones_status ON reparaciones(status);
CREATE INDEX IF NOT EXISTS idx_reparaciones_technician_id ON reparaciones(technician_id);
CREATE INDEX IF NOT EXISTS idx_citas_client_id ON citas(client_id);
CREATE INDEX IF NOT EXISTS idx_citas_vehicle_id ON citas(vehicle_id);
CREATE INDEX IF NOT EXISTS idx_citas_scheduled_date ON citas(scheduled_date);
CREATE INDEX IF NOT EXISTS idx_evidencias_reparacion_id ON evidencias_multimedia(reparacion_id);
CREATE INDEX IF NOT EXISTS idx_evidencias_task_id ON evidencias_multimedia(task_id);
CREATE INDEX IF NOT EXISTS idx_mantenimiento_vehicle_id ON mantenimiento_programado(vehicle_id);
CREATE INDEX IF NOT EXISTS idx_consumo_vehicle_id ON consumo_combustible(vehicle_id);

-- Triggers para updated_at
CREATE OR REPLACE FUNCTION trigger_set_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_profiles_updated_at BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION trigger_set_timestamp();

CREATE TRIGGER set_vehiculos_updated_at BEFORE UPDATE ON vehiculos
  FOR EACH ROW EXECUTE FUNCTION trigger_set_timestamp();

CREATE TRIGGER set_reparaciones_updated_at BEFORE UPDATE ON reparaciones
  FOR EACH ROW EXECUTE FUNCTION trigger_set_timestamp();

CREATE TRIGGER set_reparacion_tareas_updated_at BEFORE UPDATE ON reparacion_tareas
  FOR EACH ROW EXECUTE FUNCTION trigger_set_timestamp();

CREATE TRIGGER set_mantenimiento_programado_updated_at BEFORE UPDATE ON mantenimiento_programado
  FOR EACH ROW EXECUTE FUNCTION trigger_set_timestamp();

CREATE TRIGGER set_citas_updated_at BEFORE UPDATE ON citas
  FOR EACH ROW EXECUTE FUNCTION trigger_set_timestamp();

CREATE TRIGGER set_presupuestos_updated_at BEFORE UPDATE ON presupuestos
  FOR EACH ROW EXECUTE FUNCTION trigger_set_timestamp();

CREATE TRIGGER set_configuracion_permisos_updated_at BEFORE UPDATE ON configuracion_permisos
  FOR EACH ROW EXECUTE FUNCTION trigger_set_timestamp();

CREATE TRIGGER set_configuracion_sistema_updated_at BEFORE UPDATE ON configuracion_sistema
  FOR EACH ROW EXECUTE FUNCTION trigger_set_timestamp();

-- RLS (Row Level Security) Policies
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE vehiculos ENABLE ROW LEVEL SECURITY;
ALTER TABLE reparaciones ENABLE ROW LEVEL SECURITY;
ALTER TABLE citas ENABLE ROW LEVEL SECURITY;
ALTER TABLE presupuestos ENABLE ROW LEVEL SECURITY;

-- Políticas básicas de RLS
CREATE POLICY "Users can view own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Technicians can view assigned repairs" ON reparaciones
  FOR SELECT USING (technician_id = auth.uid() OR client_id = auth.uid());

CREATE POLICY "Clients can view own vehicles" ON vehiculos
  FOR SELECT USING (client_id = auth.uid());

CREATE POLICY "Clients can view own appointments" ON citas
  FOR SELECT USING (client_id = auth.uid());

-- Insertar configuración inicial de permisos
INSERT INTO configuracion_permisos (role, module, can_view, can_create, can_edit, can_delete) VALUES
('superadmin', 'dashboard', true, true, true, true),
('superadmin', 'users', true, true, true, true),
('superadmin', 'vehicles', true, true, true, true),
('superadmin', 'repairs', true, true, true, true),
('superadmin', 'appointments', true, true, true, true),
('superadmin', 'billing', true, true, true, true),
('superadmin', 'reports', true, true, true, true),

('admin', 'dashboard', true, false, false, false),
('admin', 'vehicles', true, true, true, false),
('admin', 'appointments', true, true, true, false),
('admin', 'repairs', true, false, false, false),

('technician', 'dashboard', true, false, false, false),
('technician', 'repairs', true, false, true, false),
('technician', 'vehicles', true, false, false, false),

('client', 'dashboard', true, false, false, false),
('client', 'vehicles', true, false, false, false),
('client', 'appointments', true, true, false, false),
('client', 'repairs', true, false, false, false);

-- Insertar configuración del sistema
INSERT INTO configuracion_sistema (key, value, description) VALUES
('workshop_name', 'AutoMaster AI', 'Nombre del taller'),
('workshop_address', '', 'Dirección del taller'),
('workshop_phone', '', 'Teléfono del taller'),
('workshop_email', '', 'Email del taller'),
('currency', 'USD', 'Moneda por defecto'),
('tax_rate', '0.13', 'Tasa de impuestos por defecto'),
('reminder_hours', '24', 'Horas antes para enviar recordatorios de citas'),
('max_file_size', '10485760', 'Tamaño máximo de archivos en bytes (10MB)');
