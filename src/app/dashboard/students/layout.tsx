'use client'

import { redirect } from 'next/navigation'
import { useAuth } from '@/lib/auth'
import { canViewStudents } from '@/lib/students'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

interface StudentsLayoutProps {
  children: React.ReactNode
}

export default function StudentsLayout({ children }: StudentsLayoutProps) {
  const { profile, loading } = useAuth()

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    )
  }

  // Check if user can view students
  if (!canViewStudents(profile?.role_id, profile?.role_name)) {
    redirect('/dashboard')
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold">Students</h1>
          <p className="text-muted-foreground">Manage student information and enrollment</p>
        </div>
        {profile?.role_name &&
          ['super_admin', 'institute_admin', 'branch_manager'].includes(profile.role_name) && (
            <Link href="/dashboard/students/new">
              <Button>Add Student</Button>
            </Link>
          )}
      </div>

      {children}
    </div>
  )
}
