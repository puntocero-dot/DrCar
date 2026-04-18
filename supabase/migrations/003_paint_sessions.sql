-- =========================================================
-- 003: Paint Sessions — Paint Visualizer Module
-- =========================================================

CREATE TABLE IF NOT EXISTS paint_sessions (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  repair_id       uuid,  -- nullable FK to reparaciones(id), enforced at app level
  client_email    text NOT NULL,
  client_name     text NOT NULL,
  client_phone    text,
  access_token    uuid NOT NULL DEFAULT gen_random_uuid() UNIQUE,
  status          text NOT NULL DEFAULT 'active'
                    CHECK (status IN ('active', 'completed', 'archived')),
  -- car metadata (from AI detection or manual input)
  car_make        text,
  car_model       text,
  car_year        integer,
  car_body_type   text
                    CHECK (car_body_type IN ('sedan', 'suv', 'hatchback', 'pickup', 'coupe', 'van', 'crossover')),
  car_color_hex   text,
  -- GLB model assignment
  glb_model_path  text,
  -- paint config stored as JSONB
  paint_config    jsonb DEFAULT '{}'::jsonb,
  -- timestamps
  created_at      timestamptz DEFAULT now(),
  updated_at      timestamptz DEFAULT now(),
  expires_at      timestamptz DEFAULT (now() + interval '30 days'),
  created_by      uuid REFERENCES auth.users(id)
);

-- =========================================================
-- updated_at trigger (same pattern as rest of project)
-- =========================================================
CREATE OR REPLACE FUNCTION handle_paint_session_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_paint_sessions_updated_at
  BEFORE UPDATE ON paint_sessions
  FOR EACH ROW
  EXECUTE FUNCTION handle_paint_session_updated_at();

-- =========================================================
-- Row Level Security
-- =========================================================
ALTER TABLE paint_sessions ENABLE ROW LEVEL SECURITY;

-- SELECT: staff (admin/technician) OR magic-link token match OR owner
CREATE POLICY "paint_sessions_select" ON paint_sessions
  FOR SELECT USING (
    -- Admin or technician staff
    get_user_role() IN ('superadmin', 'admin', 'technician')
    -- Magic link token (public client access via custom app.paint_token setting)
    OR (
      current_setting('app.paint_token', true) IS NOT NULL
      AND current_setting('app.paint_token', true) <> ''
      AND access_token = current_setting('app.paint_token', true)::uuid
    )
    -- Owner
    OR (auth.uid() IS NOT NULL AND created_by = auth.uid())
  );

-- INSERT: any authenticated user (anon flow uses service role via API)
CREATE POLICY "paint_sessions_insert" ON paint_sessions
  FOR INSERT WITH CHECK (true);

-- UPDATE: admin/technician staff OR owner
CREATE POLICY "paint_sessions_update" ON paint_sessions
  FOR UPDATE USING (
    get_user_role() IN ('superadmin', 'admin', 'technician')
    OR (auth.uid() IS NOT NULL AND created_by = auth.uid())
  );

-- DELETE: admin only
CREATE POLICY "paint_sessions_delete" ON paint_sessions
  FOR DELETE USING (
    get_user_role() IN ('superadmin', 'admin')
  );
