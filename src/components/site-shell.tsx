import type { ReactNode } from 'react'
import { cn } from '@/lib/utils'

interface SiteShellProps {
  className?: string
  children: ReactNode
}

export function SiteShell({ className, children }: SiteShellProps) {
  return (
    <div className={cn('relative flex flex-col min-h-screen', className)}>
      <main className="flex-1">{children}</main>
    </div>
  )
}

interface SiteContainerProps {
  className?: string
  children: ReactNode
}

export function SiteContainer({ className, children }: SiteContainerProps) {
  return (
    <div className={cn('container mx-auto px-4 py-8', className)}>
      {children}
    </div>
  )
}
