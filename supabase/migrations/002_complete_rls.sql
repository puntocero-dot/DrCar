-- =========================================================
-- 002: Completar RLS (Row Level Security) en todas las tablas
-- =========================================================

-- Helper function to check user role
CREATE OR REPLACE FUNCTION get_user_role()
RETURNS TEXT AS $$
  SELECT role FROM profiles WHERE id = auth.uid();
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- Helper function to check if user is admin or superadmin
CREATE OR REPLACE FUNCTION is_admin_or_above()
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid()
    AND role IN ('superadmin', 'admin')
  );
$$ LANGUAGE sql SECURITY DEFINER STABLE;

CREATE OR REPLACE FUNCTION is_superadmin()
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid()
    AND role = 'superadmin'
  );
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- =========================================================
-- PROFILES - Add admin/superadmin access
-- =========================================================
CREATE POLICY "Admins can view all profiles" ON profiles
  FOR SELECT USING (is_admin_or_above());

CREATE POLICY "Superadmin can manage all profiles" ON profiles
  FOR ALL USING (is_superadmin());

-- =========================================================
-- VEHICULOS - Add technician and admin access
-- =========================================================
CREATE POLICY "Technicians can view vehicles in their repairs" ON vehiculos
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM reparaciones
      WHERE reparaciones.vehicle_id = vehiculos.id
      AND reparaciones.technician_id = auth.uid()
    )
  );

CREATE POLICY "Admins can manage all vehicles" ON vehiculos
  FOR ALL USING (is_admin_or_above());

CREATE POLICY "Clients can insert own vehicles" ON vehiculos
  FOR INSERT WITH CHECK (client_id = auth.uid());

CREATE POLICY "Clients can update own vehicles" ON vehiculos
  FOR UPDATE USING (client_id = auth.uid());

-- =========================================================
-- REPARACIONES - Add CRUD policies
-- =========================================================
CREATE POLICY "Admins can manage all repairs" ON reparaciones
  FOR ALL USING (is_admin_or_above());

CREATE POLICY "Technicians can update assigned repairs" ON reparaciones
  FOR UPDATE USING (technician_id = auth.uid());

CREATE POLICY "Clients can insert repair requests" ON reparaciones
  FOR INSERT WITH CHECK (client_id = auth.uid());

-- =========================================================
-- CITAS - Add CRUD policies
-- =========================================================
CREATE POLICY "Admins can manage all appointments" ON citas
  FOR ALL USING (is_admin_or_above());

CREATE POLICY "Technicians can view assigned appointments" ON citas
  FOR SELECT USING (technician_id = auth.uid());

CREATE POLICY "Clients can create appointments" ON citas
  FOR INSERT WITH CHECK (client_id = auth.uid());

CREATE POLICY "Clients can update own appointments" ON citas
  FOR UPDATE USING (client_id = auth.uid());

-- =========================================================
-- PRESUPUESTOS - Add policies (had none)
-- =========================================================
CREATE POLICY "Clients can view own budgets" ON presupuestos
  FOR SELECT USING (client_id = auth.uid());

CREATE POLICY "Admins can manage all budgets" ON presupuestos
  FOR ALL USING (is_admin_or_above());

-- =========================================================
-- REPARACION_TAREAS - Enable RLS + policies
-- =========================================================
ALTER TABLE reparacion_tareas ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Technicians can manage tasks on their repairs" ON reparacion_tareas
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM reparaciones
      WHERE reparaciones.id = reparacion_tareas.reparacion_id
      AND reparaciones.technician_id = auth.uid()
    )
  );

CREATE POLICY "Clients can view tasks on their repairs" ON reparacion_tareas
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM reparaciones
      WHERE reparaciones.id = reparacion_tareas.reparacion_id
      AND reparaciones.client_id = auth.uid()
    )
  );

CREATE POLICY "Admins can manage all repair tasks" ON reparacion_tareas
  FOR ALL USING (is_admin_or_above());

-- =========================================================
-- EVIDENCIAS_MULTIMEDIA - Enable RLS + policies
-- =========================================================
ALTER TABLE evidencias_multimedia ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view evidence on their repairs" ON evidencias_multimedia
  FOR SELECT USING (
    uploaded_by = auth.uid()
    OR EXISTS (
      SELECT 1 FROM reparaciones
      WHERE reparaciones.id = evidencias_multimedia.reparacion_id
      AND (reparaciones.client_id = auth.uid() OR reparaciones.technician_id = auth.uid())
    )
  );

CREATE POLICY "Technicians can upload evidence" ON evidencias_multimedia
  FOR INSERT WITH CHECK (uploaded_by = auth.uid());

CREATE POLICY "Admins can manage all evidence" ON evidencias_multimedia
  FOR ALL USING (is_admin_or_above());

-- =========================================================
-- MANTENIMIENTO_PROGRAMADO - Enable RLS + policies
-- =========================================================
ALTER TABLE mantenimiento_programado ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Vehicle owners can view scheduled maintenance" ON mantenimiento_programado
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM vehiculos
      WHERE vehiculos.id = mantenimiento_programado.vehicle_id
      AND vehiculos.client_id = auth.uid()
    )
  );

CREATE POLICY "Admins can manage all maintenance" ON mantenimiento_programado
  FOR ALL USING (is_admin_or_above());

-- =========================================================
-- CONSUMO_COMBUSTIBLE - Enable RLS + policies
-- =========================================================
ALTER TABLE consumo_combustible ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Vehicle owners can view fuel consumption" ON consumo_combustible
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM vehiculos
      WHERE vehiculos.id = consumo_combustible.vehicle_id
      AND vehiculos.client_id = auth.uid()
    )
  );

CREATE POLICY "Vehicle owners can log fuel consumption" ON consumo_combustible
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM vehiculos
      WHERE vehiculos.id = consumo_combustible.vehicle_id
      AND vehiculos.client_id = auth.uid()
    )
  );

CREATE POLICY "Admins can manage all fuel data" ON consumo_combustible
  FOR ALL USING (is_admin_or_above());

-- =========================================================
-- PRESUPUESTO_DETALLES - Enable RLS + policies
-- =========================================================
ALTER TABLE presupuesto_detalles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Clients can view details of their budgets" ON presupuesto_detalles
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM presupuestos
      WHERE presupuestos.id = presupuesto_detalles.presupuesto_id
      AND presupuestos.client_id = auth.uid()
    )
  );

CREATE POLICY "Admins can manage all budget details" ON presupuesto_detalles
  FOR ALL USING (is_admin_or_above());

-- =========================================================
-- CONFIGURACION_SISTEMA - Enable RLS (superadmin only)
-- =========================================================
ALTER TABLE configuracion_sistema ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Superadmin can manage system config" ON configuracion_sistema
  FOR ALL USING (is_superadmin());

CREATE POLICY "Admins can view system config" ON configuracion_sistema
  FOR SELECT USING (is_admin_or_above());

-- =========================================================
-- CONFIGURACION_PERMISOS - Enable RLS (superadmin only)
-- =========================================================
ALTER TABLE configuracion_permisos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Superadmin can manage permissions" ON configuracion_permisos
  FOR ALL USING (is_superadmin());

CREATE POLICY "All authenticated users can view permissions" ON configuracion_permisos
  FOR SELECT USING (auth.uid() IS NOT NULL);

-- =========================================================
-- RENTAL_RESERVATIONS - Add missing UPDATE and DELETE policies
-- =========================================================
CREATE POLICY "Users can update own reservations" ON rental_reservations
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Superadmin can manage all reservations" ON rental_reservations
  FOR ALL USING (is_superadmin());

CREATE POLICY "Admins can view all reservations" ON rental_reservations
  FOR SELECT USING (is_admin_or_above());

-- =========================================================
-- RENTAL_CARS - Add admin management
-- =========================================================
CREATE POLICY "Admins can manage rental cars" ON rental_cars
  FOR ALL USING (is_admin_or_above());
