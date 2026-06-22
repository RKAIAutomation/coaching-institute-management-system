'use client'

import { redirect } from 'next/navigation'
import { useAuth } from '@/lib/auth'
import { Navbar } from '@/components/navbar'
import { SiteShell } from '@/components/site-shell'

interface DashboardLayoutProps {
  children: React.ReactNode
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const { user, profile, loading } = useAuth()

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading dashboard...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    redirect('/auth/sign-in')
  }

  return (
    <SiteShell>
      <Navbar>
        <div className="flex items-center gap-4 ml-auto">
          <span className="text-sm">Welcome, {profile?.full_name || profile?.email || 'User'}</span>
          <span className="text-sm text-muted-foreground">({profile?.role_name || 'Authenticated'})</span>
        </div>
      </Navbar>
      <div className="flex-1 bg-muted/50">
        {children}
      </div>
    </SiteShell>
  )
}
