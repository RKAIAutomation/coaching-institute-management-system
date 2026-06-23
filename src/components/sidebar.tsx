'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { canViewStudents } from '@/lib/students'
import { canViewFaculty } from '@/lib/faculty'
import { useAuth } from '@/lib/auth'

export function Sidebar() {
  const pathname = usePathname()
  const { profile } = useAuth()

  const navItems = [
    {
      href: '/dashboard',
      label: 'Dashboard',
      exact: true,
    },
  ]

  // Add Students link if user can view students
  if (canViewStudents(profile?.role_id, profile?.role_name)) {
    navItems.push({
      href: '/dashboard/students',
      label: 'Students',
      exact: false,
    })
  }

  if (canViewFaculty(profile?.role_id, profile?.role_name)) {
    navItems.push({
      href: '/dashboard/faculty',
      label: 'Faculty',
      exact: false,
    })
  }

  return (
    <aside className="w-64 border-r border-border bg-background">
      <nav className="space-y-1 p-4">
        {navItems.map((item) => {
          const isActive = item.exact ? pathname === item.href : pathname.startsWith(item.href)

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'block px-4 py-2 rounded-md text-sm font-medium transition-colors',
                isActive
                  ? 'bg-primary text-primary-foreground'
                  : 'text-foreground hover:bg-muted',
              )}
            >
              {item.label}
            </Link>
          )
        })}
      </nav>
    </aside>
  )
}
