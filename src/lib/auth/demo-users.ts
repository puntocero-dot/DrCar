export type DemoRole = 'superadmin' | 'admin' | 'technician' | 'client'

export interface DemoUser {
  id: string
  email: string
  password: string
  role: DemoRole
  full_name: string
  avatar_url: string | null
}

export const DEMO_USERS: DemoUser[] = [
  {
    id: 'demo-superadmin-001',
    email: 'superadmin@automaster.com',
    password: 'demo1234',
    role: 'superadmin',
    full_name: 'Carlos Mendoza',
    avatar_url: null,
  },
  {
    id: 'demo-admin-001',
    email: 'admin@automaster.com',
    password: 'demo1234',
    role: 'admin',
    full_name: 'María García',
    avatar_url: null,
  },
  {
    id: 'demo-tech-001',
    email: 'tecnico@automaster.com',
    password: 'demo1234',
    role: 'technician',
    full_name: 'Roberto Díaz',
    avatar_url: null,
  },
  {
    id: 'demo-client-001',
    email: 'cliente@automaster.com',
    password: 'demo1234',
    role: 'client',
    full_name: 'Ana López',
    avatar_url: null,
  },
]

export function authenticateDemo(email: string, password: string): DemoUser | null {
  return DEMO_USERS.find((u) => u.email === email && u.password === password) || null
}

export function getDemoUser(): DemoUser | null {
  if (typeof window === 'undefined') return null
  const stored = localStorage.getItem('demo_user')
  if (!stored) return null
  try {
    return JSON.parse(stored) as DemoUser
  } catch {
    return null
  }
}

export function setDemoUser(user: DemoUser): void {
  localStorage.setItem('demo_user', JSON.stringify(user))
}

export function clearDemoUser(): void {
  localStorage.removeItem('demo_user')
}

export function isSupabaseConfigured(): boolean {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  return !!url && url.startsWith('http') && !url.includes('your_supabase')
}
