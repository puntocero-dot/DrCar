import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'AutoMaster AI - Gestión de Talleres Mecánicos',
  description: 'Plataforma integral de gestión de talleres mecánicos con IA',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="es">
      <body className="min-h-screen">
        {children}
      </body>
    </html>
  )
}
