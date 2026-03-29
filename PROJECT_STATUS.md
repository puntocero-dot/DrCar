# AutoMaster AI — Estado del Proyecto

> **Última actualización:** 2026-02-27  
> **Versión:** 0.1.0 (MVP / Demo Mode)  
> **Ruta del proyecto:** `c:/Users/DELL/Desktop/Proyectos/Car2go/CascadeProjects/windsurf-project`

---

## 1. Descripción General

**AutoMaster AI** es una plataforma de gestión inteligente para talleres mecánicos automotrices. Permite administrar vehículos, reparaciones, citas, presupuestos, facturación, usuarios y permisos, con soporte para 4 roles diferenciados. El frontend está construido con **Next.js 14 (App Router)** y funciona actualmente en **modo demo** (sin backend real conectado).

---

## 2. Stack Tecnológico

| Capa | Tecnología | Versión |
|------|-----------|---------|
| **Framework** | Next.js (App Router) | 14.2.5 |
| **Lenguaje** | TypeScript | ^5 |
| **UI / Styling** | Tailwind CSS | ^3.3.0 |
| **Iconos** | Lucide React | ^0.323.0 |
| **Gráficas** | Recharts | ^2.10.3 |
| **Componentes base** | Radix UI (dialog, dropdown, select, toast, label, checkbox, switch, slot) | varias |
| **Utilidades CSS** | clsx, tailwind-merge, class-variance-authority | — |
| **Formularios** | react-hook-form + zod + @hookform/resolvers | — |
| **Fechas** | date-fns | ^3.3.1 |
| **Auth (preparado)** | @supabase/supabase-js, @supabase/auth-helpers-nextjs | — |
| **DB (pendiente)** | PostgreSQL (Railway o Supabase) | — |

---

## 3. Estructura de Archivos

```
windsurf-project/
├── .env.local                          # Variables de entorno (placeholders)
├── .env.local.example                  # Ejemplo de variables
├── .gitignore
├── package.json
├── tsconfig.json
├── tailwind.config.ts                  # Paleta custom: navy, steel, accent (orange)
├── postcss.config.js
├── next.config.js                      # Permite imágenes remotas de Supabase
├── README.md
├── PROJECT_STATUS.md                   # ← ESTE ARCHIVO
│
├── supabase/
│   └── migrations/
│       └── 001_initial_schema.sql      # Schema completo de PostgreSQL
│
└── src/
    ├── middleware.ts                    # Auth middleware (bypass si no hay Supabase)
    │
    ├── app/
    │   ├── layout.tsx                  # Root layout (Inter font, metadata)
    │   ├── page.tsx                    # Redirect → /login
    │   ├── globals.css                 # Tailwind layers + componentes custom
    │   │
    │   ├── (auth)/
    │   │   └── login/
    │   │       └── page.tsx            # Login con modo demo + Supabase dual
    │   │
    │   └── dashboard/
    │       └── superadmin/
    │           ├── layout.tsx          # Layout con Sidebar
    │           ├── page.tsx            # Dashboard principal (KPIs, charts)
    │           ├── vehicles/page.tsx   # CRUD vehículos
    │           ├── repairs/page.tsx    # Listado reparaciones
    │           ├── appointments/page.tsx # Gestión citas
    │           ├── users/page.tsx      # Gestión usuarios
    │           ├── billing/page.tsx    # Facturación
    │           ├── reports/page.tsx    # Reportes y estadísticas
    │           ├── budgets/page.tsx    # Presupuestos
    │           ├── permissions/page.tsx # Matriz de permisos
    │           └── settings/page.tsx   # Configuración del sistema
    │
    ├── components/
    │   └── dashboard/
    │       └── Sidebar.tsx             # Sidebar con nav, user info, logout
    │
    └── lib/
        ├── auth/
        │   └── demo-users.ts          # Usuarios demo + auth helpers
        ├── supabase/
        │   ├── client.ts              # createBrowserClient (Supabase)
        │   └── server.ts              # createServerClient (Supabase)
        ├── types/
        │   └── database.ts            # Tipos TS para todo el schema
        └── utils/
            └── cn.ts                   # clsx + tailwind-merge helper
```

---

## 4. Sistema de Autenticación

### 4.1 Modo Demo (ACTIVO)

El sistema detecta automáticamente si Supabase está configurado. Si las variables de entorno son placeholders, activa el **modo demo**.

**Archivo clave:** `src/lib/auth/demo-users.ts`

**Usuarios demo:**

| Email | Password | Rol | Nombre |
|-------|----------|-----|--------|
| `superadmin@automaster.com` | `demo1234` | `superadmin` | Carlos Mendoza |
| `admin@automaster.com` | `demo1234` | `admin` | María García |
| `tecnico@automaster.com` | `demo1234` | `technician` | Roberto Díaz |
| `cliente@automaster.com` | `demo1234` | `client` | Ana López |

**Flujo de login demo:**
1. `isSupabaseConfigured()` retorna `false` → activa modo demo
2. Usuario ingresa credenciales (o usa botones de autocompletado)
3. `authenticateDemo(email, password)` busca en array `DEMO_USERS`
4. Si es válido → `setDemoUser(user)` guarda en `localStorage` como `demo_user`
5. `redirectByRole(role)` redirige a `/dashboard/{role}`

**Funciones exportadas:**
- `authenticateDemo(email, password): DemoUser | null`
- `getDemoUser(): DemoUser | null` — lee de localStorage
- `setDemoUser(user): void` — escribe en localStorage
- `clearDemoUser(): void` — elimina de localStorage
- `isSupabaseConfigured(): boolean` — verifica si env vars son reales

### 4.2 Modo Supabase (PREPARADO, NO ACTIVO)

**Archivo:** `src/middleware.ts`

- Si Supabase está configurado, el middleware usa `createMiddlewareClient` para verificar sesión
- Rutas públicas: `/`, `/login`
- Si hay sesión activa en login → consulta `profiles.role` → redirige al dashboard correspondiente
- Rutas `/dashboard/*` sin sesión → redirige a `/login`
- Matcher: `['/', '/login', '/dashboard/:path*']`

**Archivos Supabase preparados:**
- `src/lib/supabase/client.ts` — `createBrowserClient`
- `src/lib/supabase/server.ts` — `createServerClient`

### 4.3 Redirección por Rol

```typescript
const routes: Record<string, string> = {
  superadmin: '/dashboard/superadmin',
  admin: '/dashboard/admin',         // ← NO EXISTE AÚN
  technician: '/dashboard/technician', // ← NO EXISTE AÚN
  client: '/dashboard/client',         // ← NO EXISTE AÚN
}
```

---

## 5. Roles y Permisos

### 5.1 Definición de Roles

| Rol | Descripción | Dashboard |
|-----|------------|-----------|
| **superadmin** | Control total del sistema, todos los módulos | ✅ Implementado |
| **admin** | Gestiona vehículos, citas, reparaciones (sin eliminar) | ❌ Pendiente |
| **technician** | Ve reparaciones asignadas, actualiza estado, sube evidencia | ❌ Pendiente |
| **client** | Ve sus vehículos, citas, estado de reparaciones | ❌ Pendiente |

### 5.2 Matriz de Permisos (definida en `permissions/page.tsx` y `001_initial_schema.sql`)

| Módulo | SuperAdmin | Admin | Técnico | Cliente |
|--------|-----------|-------|---------|---------|
| Dashboard | VCUD | V | V | V |
| Vehículos | VCUD | VCU | V | V |
| Reparaciones | VCUD | V | VU | V |
| Citas | VCUD | VCUD | V | VCU/D (propias) |
| Usuarios | VCUD | V | — | — |
| Facturación | VCUD | VCU | — | V |
| Reportes | VCUD | V | — | — |
| Presupuestos | VCUD | VCU | V | V |
| Configuración | VCUD | — | — | — |

*(V=Ver, C=Crear, U=Editar, D=Eliminar)*

---

## 6. Esquema de Base de Datos

**Archivo:** `supabase/migrations/001_initial_schema.sql`

### 6.1 Tablas

| Tabla | Campos clave | Relaciones |
|-------|-------------|------------|
| `profiles` | id (UUID, PK → auth.users), email, full_name, phone, role, avatar_url | — |
| `configuracion_permisos` | id, role, module, can_view/create/edit/delete, is_active | created_by → profiles |
| `vehiculos` | id, license_plate, vin, make, model, year, color, current_mileage, status | client_id → profiles |
| `reparaciones` | id, title, description, status, priority, estimated/actual_cost, estimated/actual_hours | vehicle_id → vehiculos, technician_id → profiles, client_id → profiles |
| `reparacion_tareas` | id, title, task_type, status, requires_evidence, urgency_level | reparacion_id → reparaciones (CASCADE) |
| `evidencias_multimedia` | id, file_type, file_url, file_name, is_before | task_id → reparacion_tareas, reparacion_id → reparaciones, vehicle_id → vehiculos, uploaded_by → profiles |
| `mantenimiento_programado` | id, service_type, scheduled_date, scheduled_mileage, status | vehicle_id → vehiculos |
| `consumo_combustible` | id, date, mileage, fuel_amount, efficiency_km_per_gallon | vehicle_id → vehiculos |
| `citas` | id, service_type, scheduled_date, duration, status, priority, reminder_sent | client_id → profiles, vehicle_id → vehiculos, technician_id → profiles |
| `presupuestos` | id, title, total_amount, labor_cost, parts_cost, tax_amount, status, valid_until | reparacion_id → reparaciones, client_id → profiles, vehicle_id → vehiculos |
| `presupuesto_detalles` | id, item_name, item_type, quantity, unit_price, total_price | presupuesto_id → presupuestos (CASCADE) |
| `configuracion_sistema` | id, key, value, description | updated_by → profiles |

### 6.2 Enums (como CHECK constraints)

- **UserRole:** `superadmin`, `admin`, `technician`, `client`
- **RepairStatus:** `en_espera`, `en_proceso`, `esperando_repuestos`, `listo_entrega`, `completado`, `cancelado`
- **Priority:** `baja`, `media`, `alta`, `urgente`
- **AppointmentStatus:** `programada`, `confirmada`, `en_progreso`, `completada`, `cancelada`, `no_asistio`
- **BudgetStatus:** `pendiente`, `enviado`, `aprobado`, `rechazado`, `vencido`
- **TaskType:** `cambio_pieza`, `mantenimiento`, `diagnostico`, `revision`, `limpieza`
- **UrgencyLevel:** `verde`, `amarillo`, `rojo`
- **VehicleStatus:** `active`, `inactive`, `in_service`

### 6.3 Características de la DB

- **UUIDs** como primary keys (`uuid_generate_v4()`)
- **Triggers** automáticos para `updated_at` en todas las tablas relevantes
- **Índices** en foreign keys y campos de búsqueda frecuente
- **RLS** habilitado en `profiles`, `vehiculos`, `reparaciones`, `citas`, `presupuestos`
- **Políticas RLS básicas** para que usuarios solo vean sus propios datos
- **Datos iniciales** de permisos y configuración del sistema insertados

### 6.4 TypeScript Types

**Archivo:** `src/lib/types/database.ts`

Tipos definidos para: `Profile`, `Vehicle`, `Repair`, `RepairTask`, `Evidence`, `Appointment`, `Budget`, `Permission`, y el tipo `Database` para Supabase typed client.

---

## 7. Páginas Implementadas (SuperAdmin)

### 7.1 Login (`/login`)
- **Archivo:** `src/app/(auth)/login/page.tsx`
- Split-screen: branding a la izquierda, formulario a la derecha
- Responsive: logo visible en mobile
- Modo demo: botones para autocompletar credenciales de cada rol
- Dual: si Supabase está configurado, usa `signInWithPassword`
- Manejo de errores, loading state, show/hide password

### 7.2 Dashboard Principal (`/dashboard/superadmin`)
- **Archivo:** `src/app/dashboard/superadmin/page.tsx`
- **KPIs:** Ingresos del mes ($7,100), Vehículos activos (28), Reparaciones abiertas (28), Técnicos activos (6)
- **Gráficas (Recharts):**
  - AreaChart: Ingresos vs Gastos (6 meses)
  - PieChart: Estado de reparaciones (donut)
  - BarChart: Carga de trabajo semanal
- **Tabla:** Reparaciones recientes (5 items con status/priority badges)
- **Citas de hoy:** 4 citas próximas
- **Alertas:** 3 alertas del sistema (danger/warning/success)
- **Filtro temporal:** Semana / Mes / Año (solo cambia state, no filtra data real)

### 7.3 Vehículos (`/dashboard/superadmin/vehicles`)
- **Archivo:** `src/app/dashboard/superadmin/vehicles/page.tsx`
- **Stats cards:** Total (8), Activos (5), En reparación (2)
- **Búsqueda:** Por marca, modelo, placa, propietario
- **Filtro:** Por estado (todos/activo/en reparación/inactivo)
- **Tabla:** 8 vehículos demo con columnas: vehículo, placa, propietario, km, estado, último servicio
- **Acciones:** Ver, Editar, Eliminar (botones presentes, sin lógica real)
- **Modal:** Formulario para crear/editar vehículo (campos: marca, modelo, año, color, placa, km, VIN, propietario)
- **Paginación:** UI presente, no funcional
- **⚠️ Pendiente:** CRUD real, validación de formulario, confirmación de eliminación

### 7.4 Reparaciones (`/dashboard/superadmin/repairs`)
- **Archivo:** `src/app/dashboard/superadmin/repairs/page.tsx`
- **Stats cards:** Total, En proceso, Urgentes, Completadas
- **Búsqueda:** Por título o vehículo
- **Filtro:** Por estado (todos/en_espera/en_proceso/esperando_repuestos/listo_entrega/completado)
- **Tabla:** 8 reparaciones demo con status badges y priority badges
- **Paginación:** UI presente, no funcional
- **⚠️ Pendiente:** Vista detalle de reparación, tareas, evidencia multimedia, asignación de técnico

### 7.5 Citas (`/dashboard/superadmin/appointments`)
- **Archivo:** `src/app/dashboard/superadmin/appointments/page.tsx`
- **Stats cards:** Total, Confirmadas, En progreso, Completadas
- **Búsqueda:** Por cliente o servicio
- **Filtro:** Por fecha (input date)
- **Tabla:** 7 citas demo con fecha/hora, duración, prioridad
- **⚠️ Pendiente:** Crear/editar cita, integración calendario, recordatorios

### 7.6 Usuarios (`/dashboard/superadmin/users`)
- **Archivo:** `src/app/dashboard/superadmin/users/page.tsx`
- **Stats cards por rol:** SuperAdmin (1), Admin (2), Técnicos (3), Clientes (4)
- **Búsqueda:** Por nombre o email
- **Filtro:** Por rol
- **Tabla:** 10 usuarios demo con avatar (inicial), email, rol (badge coloreado), estado, fecha registro
- **⚠️ Pendiente:** CRUD usuarios, asignación de roles, activar/desactivar

### 7.7 Facturación (`/dashboard/superadmin/billing`)
- **Archivo:** `src/app/dashboard/superadmin/billing/page.tsx`
- **Stats cards:** Total facturado, Pagadas, Pendientes, Vencidas
- **Búsqueda:** Por cliente o ID de factura
- **Filtro:** Por estado (pagada/pendiente/vencida/cancelada)
- **Tabla:** 8 facturas demo con método de pago (iconos), montos, estados
- **⚠️ Pendiente:** Generar facturas, PDF export, integración pagos

### 7.8 Reportes (`/dashboard/superadmin/reports`)
- **Archivo:** `src/app/dashboard/superadmin/reports/page.tsx`
- **KPIs:** Reparaciones del mes (48), Ingresos ($135k), Vehículos atendidos (40), Clientes nuevos (12)
- **Gráfica barras:** Ingresos mensuales (3 meses, barras horizontales custom)
- **Gráfica categorías:** Reparaciones por categoría (5 categorías, barras de progreso)
- **Tabla:** Rendimiento de técnicos (3 técnicos: reparaciones, completadas, tiempo promedio, satisfacción, ingresos)
- **Filtro:** Por mes (select)
- **Botón:** Exportar PDF (sin funcionalidad real)
- **⚠️ Pendiente:** Datos reales, export PDF, más periodos, gráficas interactivas

### 7.9 Presupuestos (`/dashboard/superadmin/budgets`)
- **Archivo:** `src/app/dashboard/superadmin/budgets/page.tsx`
- **Stats cards:** Total (8), Aprobados (4), Enviados (2), Monto aprobado ($25,600)
- **Búsqueda:** Por cliente o ID
- **Filtro:** Por estado (borrador/enviado/aprobado/rechazado)
- **Tabla:** 8 presupuestos demo con fecha, items, total, estado (con iconos)
- **Acciones:** Ver, Editar
- **Paginación:** UI presente
- **⚠️ Pendiente:** Crear presupuesto con líneas de detalle, enviar por email, aprobar/rechazar, convertir a reparación

### 7.10 Permisos (`/dashboard/superadmin/permissions`)
- **Archivo:** `src/app/dashboard/superadmin/permissions/page.tsx`
- **Tabs por rol:** SuperAdmin, Admin, Técnico, Cliente
- **Módulos:** 8 módulos (Vehículos, Reparaciones, Citas, Usuarios, Facturación, Reportes, Presupuestos, Configuración)
- **Acciones:** Ver, Crear, Editar, Eliminar — toggle buttons
- **SuperAdmin:** Permisos fijos, no editables (aviso visual)
- **Botón:** Guardar cambios (feedback visual "Guardado", sin persistencia real)
- **⚠️ Pendiente:** Persistencia en DB, aplicar permisos en middleware/componentes

### 7.11 Configuración (`/dashboard/superadmin/settings`)
- **Archivo:** `src/app/dashboard/superadmin/settings/page.tsx`
- **Secciones:**
  - Info del taller: nombre, dirección, teléfono, email
  - Horario y zona: apertura, cierre, timezone, moneda
  - Notificaciones: 5 toggles (email reminders, SMS, alertas citas, updates reparaciones, reporte diario)
  - Info del sistema: versión, framework, DB, storage, modo, último deploy
- **Botón:** Guardar cambios (feedback visual, sin persistencia real)
- **⚠️ Pendiente:** Persistencia en DB (`configuracion_sistema`), upload logo, temas

---

## 8. Componentes Compartidos

### 8.1 Sidebar (`src/components/dashboard/Sidebar.tsx`)
- **Navegación:** 10 links para SuperAdmin (dashboard + 9 módulos)
- **Responsive:** Toggle mobile (hamburger), overlay, botón cerrar
- **Collapse:** Modo compacto en desktop (solo iconos)
- **User info:** Lee `demo_user` de localStorage, muestra nombre + rol
- **Logout:** Limpia localStorage → redirige a `/login`
- **⚠️ No cambia links por rol** — actualmente hardcodeado a `superadminLinks`

### 8.2 Layout SuperAdmin (`src/app/dashboard/superadmin/layout.tsx`)
- Wrapper con `<Sidebar>` + `<main>` con padding
- `lg:ml-64` para compensar ancho del sidebar

### 8.3 CSS Components (`src/app/globals.css`)
- **Buttons:** `.btn-primary`, `.btn-secondary`, `.btn-danger`
- **Cards:** `.card`, `.card-hover`
- **Inputs:** `.input-field`, `.label-text`
- **Badges:** `.badge`, `.badge-success`, `.badge-warning`, `.badge-danger`, `.badge-info`
- **Sidebar:** `.sidebar-link`, `.sidebar-link-active`
- **Table:** `.table-header`, `.table-cell`
- **Scrollbar:** Custom dark scrollbar
- **Mobile:** Clase `.tech-interface` con inputs/buttons más grandes

---

## 9. Paleta de Colores (Tailwind)

| Token | Uso | Valor base |
|-------|-----|-----------|
| `navy-950` | Fondo principal | `#060b13` |
| `navy-900` | Cards, sidebar | `#0a101c` |
| `navy-800` | Cards, hover states | `#0f1829` |
| `navy-700` | Bordes, inputs bg | `#152036` |
| `steel-*` | Texto secundario, bordes | Grises azulados |
| `accent-500` | Botones, highlights | `#f97316` (orange) |
| `success` | Estados positivos | `#22c55e` |
| `warning` | Alertas | `#eab308` |
| `danger` | Errores, eliminación | `#ef4444` |

---

## 10. Variables de Entorno

**Archivo:** `.env.local`

```env
NEXT_PUBLIC_SUPABASE_URL=https://your_supabase_url.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

> Actualmente con **valores placeholder** → el sistema detecta esto y activa modo demo.
> Para conectar backend real, reemplazar con credenciales de Railway PostgreSQL + configurar Prisma (ver sección 12).

---

## 11. Cómo Ejecutar

```bash
# Instalar dependencias
npm install

# Iniciar en desarrollo
npm run dev

# La app estará en http://localhost:3000
# Se redirige automáticamente a /login
# Usar credenciales demo (ver sección 4.1)
```

---

## 12. PENDIENTE — Trabajo por Hacer

### 🔴 Prioridad Alta

#### 12.1 Conectar Backend Real (Railway PostgreSQL)
- [ ] Crear servicio PostgreSQL en Railway
- [ ] Obtener `DATABASE_URL` de Railway
- [ ] Instalar Prisma: `npm install prisma @prisma/client`
- [ ] Crear `prisma/schema.prisma` basado en `001_initial_schema.sql`
- [ ] Migrar de Supabase client a Prisma ORM
- [ ] Implementar NextAuth.js para autenticación (reemplazar demo auth)
- [ ] Crear API routes en `src/app/api/` para cada módulo
- [ ] Seed de datos iniciales (usuarios, permisos, config)

#### 12.2 CRUD Real en Todas las Páginas
Actualmente **todas las páginas usan datos hardcodeados** en arrays constantes. Falta:
- [ ] **Vehículos:** Crear, editar, eliminar con API + validación zod
- [ ] **Reparaciones:** CRUD + cambio de estado + asignación de técnico
- [ ] **Citas:** CRUD + validación de horario + recordatorios
- [ ] **Usuarios:** CRUD + cambio de rol + activar/desactivar
- [ ] **Facturación:** Generar facturas desde reparaciones completadas
- [ ] **Presupuestos:** CRUD con líneas de detalle + envío + aprobación
- [ ] **Permisos:** Persistir cambios en DB
- [ ] **Configuración:** Persistir en tabla `configuracion_sistema`

#### 12.3 Dashboards por Rol
- [ ] **Admin** (`/dashboard/admin`) — Vista reducida: vehículos, citas, reparaciones (sin eliminar)
- [ ] **Técnico** (`/dashboard/technician`) — Mobile-first: reparaciones asignadas, subir evidencia, checklist de tareas
- [ ] **Cliente** (`/dashboard/client`) — Mis vehículos, mis citas, estado de reparaciones, presupuestos recibidos

### 🟡 Prioridad Media

#### 12.4 Funcionalidades Específicas
- [ ] **Evidencia multimedia:** Upload de fotos/videos antes/después (Supabase Storage o Cloudinary)
- [ ] **Tareas de reparación:** Checklist dentro de cada reparación con evidencia requerida
- [ ] **Mantenimiento programado:** Alertas por km o fecha
- [ ] **Consumo de combustible:** Registro y eficiencia
- [ ] **Presupuesto → Reparación:** Convertir presupuesto aprobado en orden de reparación
- [ ] **Notificaciones:** Email/SMS de recordatorios de citas
- [ ] **Export PDF:** Reportes, presupuestos, facturas
- [ ] **Búsqueda global:** Barra de búsqueda en header del dashboard

#### 12.5 Mejoras de UI/UX
- [ ] **Sidebar dinámico por rol:** Mostrar solo los links permitidos según rol del usuario
- [ ] **Loading skeletons:** En lugar de esperar datos, mostrar placeholders
- [ ] **Confirmación de eliminación:** Modal de confirmación antes de borrar
- [ ] **Toast notifications:** Feedback de acciones (guardado, error, etc.)
- [ ] **Breadcrumbs:** Navegación contextual
- [ ] **Vista detalle:** Página individual para cada vehículo, reparación, cita, etc.
- [ ] **Calendario visual:** Para citas (semana/mes)
- [ ] **Dark/Light mode toggle** (actualmente solo dark)

### 🟢 Prioridad Baja

#### 12.6 Inteligencia Artificial
- [ ] **Diagnóstico predictivo:** Sugerir problemas basándose en historial del vehículo
- [ ] **Estimación de costos:** ML para estimar costo de reparación
- [ ] **Optimización de agenda:** Asignar técnicos y horarios automáticamente
- [ ] **Chatbot:** Asistente para clientes

#### 12.7 Infraestructura
- [ ] Deploy a Vercel (frontend) + Railway (DB)
- [ ] CI/CD pipeline
- [ ] Tests unitarios y E2E
- [ ] Monitoreo y logging
- [ ] Rate limiting en API

---

## 13. Decisiones Técnicas Importantes

1. **Modo Demo como fallback:** El sistema detecta si Supabase no está configurado y usa localStorage + datos hardcodeados. Esto permite demostrar la UI sin backend.

2. **Schema SQL ya diseñado:** El archivo `001_initial_schema.sql` tiene el schema completo listo para ejecutar en PostgreSQL. Incluye RLS, triggers, índices y datos seed.

3. **TypeScript types alineados con DB:** `src/lib/types/database.ts` refleja exactamente las tablas del schema SQL. Mantener sincronizados.

4. **Tailwind custom theme:** No usar colores default de Tailwind. Usar `navy-*`, `steel-*`, `accent-*` definidos en `tailwind.config.ts`.

5. **Componentes CSS en globals.css:** Los botones, cards, inputs, badges etc. están como `@apply` en `globals.css`, no como componentes React separados. Esto es intencional para simplicidad del MVP.

6. **App Router de Next.js 14:** Todas las rutas usan el directorio `app/`. No hay directorio `pages/`. Los layouts son nested.

7. **No se usa Recharts en subpáginas:** Solo el dashboard principal usa Recharts. Las subpáginas usan barras de progreso CSS custom para gráficas simples.

8. **Railway como backend recomendado:** El usuario tiene cuenta pagada de Railway. La migración debería usar Railway PostgreSQL + Prisma ORM + NextAuth.js.

---

## 14. Notas para Continuación

- **NO borrar** los datos demo de las páginas hasta que el backend esté conectado. Sirven como referencia de la estructura de datos esperada.
- **El schema SQL fue diseñado para Supabase** (usa `auth.users` como FK en profiles). Si se migra a Railway + Prisma, ajustar la tabla `profiles` para no depender de `auth.users`.
- **El sidebar actualmente solo muestra links de SuperAdmin.** Al crear dashboards de otros roles, el sidebar debe recibir el rol y mostrar links correspondientes.
- **Los formularios tienen campos visuales pero no validan ni envían.** Al conectar backend, usar `react-hook-form` + `zod` (ya instalados) para validación.
- **Las tablas no tienen paginación real.** Implementar paginación server-side cuando se conecte la DB.

---
