# AutoMaster AI - Plataforma Integral de Gestión de Talleres Mecánicos

## Arquitectura de Proyecto

### Roles de Usuario
- **SuperAdmin:** Control total, gestión de facturación, gastos, carga de trabajo
- **Admin (Recepcionista):** Entrada de vehículos, gestión de citas y presupuestos  
- **Reparador (Técnico):** Mobile First, registro de evidencia, checklist
- **Cliente:** Portal visual, historial, aprobación de presupuestos

### Stack Tecnológico
- **Frontend:** Next.js 14+ (App Router), Tailwind CSS, Lucide React
- **Backend/DB:** Supabase (Auth, DB, Storage)
- **Diseño:** Clean & Bold, Navy/Steel/Naranja

### Estructura de Carpetas
```
automaster-ai/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── (auth)/
│   │   │   └── login/
│   │   ├── dashboard/
│   │   │   ├── superadmin/
│   │   │   ├── admin/
│   │   │   ├── technician/
│   │   │   └── client/
│   │   ├── api/
│   │   └── globals.css
│   ├── components/
│   │   ├── ui/                 # Componentes base
│   │   ├── auth/
│   │   ├── dashboard/
│   │   └── forms/
│   ├── lib/
│   │   ├── supabase/
│   │   ├── utils/
│   │   └── types/
│   └── hooks/
├── public/
├── supabase/
│   └── migrations/
├── docs/
└── package.json
```
