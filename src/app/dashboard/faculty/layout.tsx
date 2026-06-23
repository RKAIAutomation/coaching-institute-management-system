'use client'

import { redirect } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '@/lib/auth'
import { canManageFaculty, canViewFaculty } from '@/lib/faculty'
import { Button } from '@/components/ui/button'

interface FacultyLayoutProps {
  children: React.ReactNode
}

export default function FacultyLayout({ children }: FacultyLayoutProps) {
  const { profile, loading } = useAuth()

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    )
  }

  if (!canViewFaculty(profile?.role_id, profile?.role_name)) {
    redirect('/dashboard')
  }

  return (
    <div>
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Faculty</h1>
          <p className="text-muted-foreground">Manage faculty information and records</p>
        </div>

        {canManageFaculty(profile?.role_id, profile?.role_name) && (
          <Link href="/dashboard/faculty/new">
            <Button>Add Faculty</Button>
          </Link>
        )}
      </div>

      {children}
    </div>
  )
}
