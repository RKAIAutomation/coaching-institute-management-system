import type { ReactNode } from 'react'
import { cn } from '@/lib/utils'

interface NavbarProps {
  className?: string
  children?: ReactNode
}

export function Navbar({ className, children }: NavbarProps) {
  return (
    <nav
      className={cn(
        'sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60',
        className,
      )}
    >
      <div className="flex h-16 items-center justify-between px-4">
        <div className="flex items-center gap-2">
          <h1 className="text-xl font-bold">CIMS</h1>
        </div>
        {children}
      </div>
    </nav>
  )
}
