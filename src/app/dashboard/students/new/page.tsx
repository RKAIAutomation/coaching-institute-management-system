'use client'

import { useAuth } from '@/lib/auth'
import { createStudent, canManageStudents, type StudentInput } from '@/lib/students'
import { StudentForm } from '@/components/students/student-form'
import { SiteContainer } from '@/components/site-shell'
import { redirect } from 'next/navigation'
import { useState } from 'react'

export default function AddStudentPage() {
  const { profile, loading } = useAuth()
  const [isSubmitting, setIsSubmitting] = useState(false)

  if (!loading && !canManageStudents(profile?.role_id, profile?.role_name)) {
    redirect('/dashboard/students')
  }

  const handleSubmit = async (data: StudentInput) => {
    setIsSubmitting(true)

    const { error } = await createStudent(data, profile?.institute_id, profile?.branch_id)

    setIsSubmitting(false)

    if (error) {
      throw error
    }
  }

  if (loading) {
    return (
      <SiteContainer className="py-8">
        <div className="flex min-h-[60vh] items-center justify-center">
          <div className="text-center">
            <div className="animate-spin h-10 w-10 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading...</p>
          </div>
        </div>
      </SiteContainer>
    )
  }

  return (
    <SiteContainer className="py-8 max-w-2xl">
      <StudentForm onSubmit={handleSubmit} isLoading={isSubmitting} />
    </SiteContainer>
  )
}
