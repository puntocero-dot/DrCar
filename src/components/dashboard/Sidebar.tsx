'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { getDemoUser, clearDemoUser, type DemoUser } from '@/lib/auth/demo-users'
import {
  LayoutDashboard,
  Car,
  Wrench,
  Calendar,
  Users,
  FileText,
  Settings,
  BarChart3,
  Shield,
  DollarSign,
  ChevronLeft,
  ChevronRight,
  LogOut,
  Menu,
  X,
} from 'lucide-react'
import { cn } from '@/lib/utils/cn'

interface SidebarLink {
  href: string
  label: string
  icon: React.ReactNode
}

const superadminLinks: SidebarLink[] = [
  { href: '/dashboard/superadmin', label: 'Dashboard', icon: <LayoutDashboard className="w-5 h-5" /> },
  { href: '/dashboard/superadmin/vehicles', label: 'Vehículos', icon: <Car className="w-5 h-5" /> },
  { href: '/dashboard/superadmin/repairs', label: 'Reparaciones', icon: <Wrench className="w-5 h-5" /> },
  { href: '/dashboard/superadmin/appointments', label: 'Citas', icon: <Calendar className="w-5 h-5" /> },
  { href: '/dashboard/superadmin/users', label: 'Usuarios', icon: <Users className="w-5 h-5" /> },
  { href: '/ready2drivesv', label: 'Rentas (New)', icon: <Car className="w-5 h-5 text-accent-400" /> },
  { href: '/dashboard/superadmin/billing', label: 'Facturación', icon: <DollarSign className="w-5 h-5" /> },
  { href: '/dashboard/superadmin/reports', label: 'Reportes', icon: <BarChart3 className="w-5 h-5" /> },
  { href: '/dashboard/superadmin/budgets', label: 'Presupuestos', icon: <FileText className="w-5 h-5" /> },
  { href: '/dashboard/superadmin/permissions', label: 'Permisos', icon: <Shield className="w-5 h-5" /> },
  { href: '/dashboard/superadmin/settings', label: 'Configuración', icon: <Settings className="w-5 h-5" /> },
]

const technicianLinks: SidebarLink[] = [
  { href: '/dashboard/technician', label: 'Dashboard', icon: <LayoutDashboard className="w-5 h-5" /> },
  { href: '/dashboard/superadmin/repairs', label: 'Mis Reparaciones', icon: <Wrench className="w-5 h-5" /> },
  { href: '/dashboard/superadmin/appointments', label: 'Agenda Citas', icon: <Calendar className="w-5 h-5" /> },
  { href: '/dashboard/technician/settings', label: 'Configuración', icon: <Settings className="w-5 h-5" /> },
]

const clientLinks: SidebarLink[] = [
  { href: '/dashboard/client', label: 'Dashboard', icon: <LayoutDashboard className="w-5 h-5" /> },
  { href: '/dashboard/superadmin/vehicles', label: 'Mis Vehículos', icon: <Car className="w-5 h-5" /> },
  { href: '/dashboard/superadmin/appointments', label: 'Mis Citas', icon: <Calendar className="w-5 h-5" /> },
  { href: '/ready2drivesv', label: 'Alquilar Vehículo', icon: <Car className="w-5 h-5 text-accent-400" /> },
  { href: '/dashboard/client/settings', label: 'Configuración', icon: <Settings className="w-5 h-5" /> },
]

interface SidebarProps {
  userRole?: string
  userName?: string
}

export default function Sidebar({ userRole = 'superadmin', userName = 'Admin' }: SidebarProps) {
  const pathname = usePathname()
  const router = useRouter()
  const [collapsed, setCollapsed] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [demoUser, setDemoUserState] = useState<DemoUser | null>(null)

  useEffect(() => {
    const user = getDemoUser()
    if (user) setDemoUserState(user)
  }, [])

  const displayName = demoUser?.full_name || userName
  const displayRole = demoUser?.role || userRole

  const getLinks = () => {
    switch (displayRole) {
      case 'technician':
        return technicianLinks
      case 'client':
        return clientLinks
      case 'admin':
      case 'superadmin':
      default:
        return superadminLinks
    }
  }

  const links = getLinks()

  const handleLogout = () => {
    clearDemoUser()
    router.push('/login')
  }

  return (
    <>
      {/* Mobile toggle */}
      <button
        onClick={() => setMobileOpen(true)}
        className="lg:hidden fixed top-4 left-4 z-50 w-12 h-12 bg-navy-800 border border-steel-700 rounded-xl flex items-center justify-center text-steel-300 hover:text-white transition-colors"
      >
        <Menu className="w-6 h-6" />
      </button>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/60 z-40"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          'fixed top-0 left-0 h-full bg-navy-900 border-r border-steel-800 z-50 flex flex-col transition-all duration-300',
          collapsed ? 'w-20' : 'w-64',
          mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-steel-800">
          {!collapsed && (
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-accent-500 rounded-xl flex items-center justify-center">
                <Wrench className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className="text-white font-bold text-lg leading-tight">AutoMaster</h2>
                <span className="text-accent-400 text-xs font-semibold">AI</span>
              </div>
            </div>
          )}

          {collapsed && (
            <div className="w-10 h-10 bg-accent-500 rounded-xl flex items-center justify-center mx-auto">
              <Wrench className="w-5 h-5 text-white" />
            </div>
          )}

          {/* Mobile close */}
          <button
            onClick={() => setMobileOpen(false)}
            className="lg:hidden text-steel-400 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Desktop collapse */}
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="hidden lg:flex text-steel-400 hover:text-white transition-colors"
          >
            {collapsed ? <ChevronRight className="w-5 h-5" /> : <ChevronLeft className="w-5 h-5" />}
          </button>
        </div>

        {/* Nav Links */}
        <nav className="flex-1 overflow-y-auto p-3 space-y-1">
          {links.map((link) => {
            const isActive = pathname === link.href
            return (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileOpen(false)}
                className={cn(
                  'flex items-center gap-3 px-3 py-3 rounded-xl transition-all duration-200 font-medium min-h-[48px]',
                  isActive
                    ? 'text-white bg-accent-500/15 border-l-4 border-accent-500'
                    : 'text-steel-400 hover:text-white hover:bg-navy-700',
                  collapsed && 'justify-center px-0'
                )}
                title={collapsed ? link.label : undefined}
              >
                {link.icon}
                {!collapsed && <span>{link.label}</span>}
              </Link>
            )
          })}
        </nav>

        {/* Footer */}
        <div className="p-3 border-t border-steel-800">
          {!collapsed && (
            <div className="flex items-center gap-3 px-3 py-2 mb-2">
              <div className="w-8 h-8 rounded-full bg-accent-500/20 flex items-center justify-center text-accent-400 text-sm font-bold">
                {displayName.charAt(0).toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-white truncate">{displayName}</p>
                <p className="text-xs text-steel-500 capitalize">{displayRole}</p>
              </div>
            </div>
          )}
          <button
            onClick={handleLogout}
            className={cn(
              'flex items-center gap-3 px-3 py-3 rounded-xl text-steel-400 hover:text-red-400 hover:bg-red-500/10 transition-all duration-200 w-full font-medium min-h-[48px]',
              collapsed && 'justify-center px-0'
            )}
          >
            <LogOut className="w-5 h-5" />
            {!collapsed && <span>Cerrar Sesion</span>}
          </button>
        </div>
      </aside>
    </>
  )
}
