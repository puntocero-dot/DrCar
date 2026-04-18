import React from 'react'

interface CardProps {
  children: React.ReactNode
  className?: string
  variant?: 'default' | 'outline' | 'glass'
  onClick?: () => void
}

export function Card({
  children,
  className = '',
  variant = 'default',
  onClick
}: CardProps) {
  const baseStyles = 'rounded-2xl overflow-hidden transition-all'

  const variants = {
    default: 'bg-navy-900/50 border border-steel-800 shadow-xl',
    outline: 'bg-transparent border border-steel-800 hover:border-accent-500/50',
    glass: 'bg-zinc-900/80 backdrop-blur-xl border border-zinc-800 shadow-2xl'
  }

  return (
    <div className={`${baseStyles} ${variants[variant]} ${className}`} onClick={onClick}>
      {children}
    </div>
  )
}

export function CardHeader({ children, className = '' }: { children: React.ReactNode, className?: string }) {
  return <div className={`p-6 border-b border-steel-800 ${className}`}>{children}</div>
}

export function CardContent({ children, className = '' }: { children: React.ReactNode, className?: string }) {
  return <div className={`p-6 ${className}`}>{children}</div>
}

export function CardFooter({ children, className = '' }: { children: React.ReactNode, className?: string }) {
  return <div className={`p-6 border-t border-steel-800 ${className}`}>{children}</div>
}
