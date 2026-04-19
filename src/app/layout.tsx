import type { Metadata } from 'next'
import './globals.css'
import { ToastProvider } from '@/components/ui/Toaster'

export const metadata: Metadata = {
  title: 'AutoMaster AI x Ready2Drive SV',
  description: 'Ecosistema digital de gestión de talleres mecánicos y renta de autos premium en El Salvador. Diagnóstico por IA, reservas express y flota certificada.',
  keywords: ['taller mecánico', 'renta de autos', 'El Salvador', 'AutoMaster', 'Ready2Drive'],
  icons: {
    icon: '/favicon.svg',
    shortcut: '/favicon.svg',
  },
  openGraph: {
    title: 'AutoMaster AI x Ready2Drive SV',
    description: 'Taller inteligente + Renta premium. El ecosistema automotriz digital de El Salvador.',
    type: 'website',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="es">
      <body className="min-h-screen">
        <ToastProvider>
          {children}
        </ToastProvider>
      </body>
    </html>
  )
}
