'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { redirect } from 'next/navigation'
import { SiteContainer } from '@/components/site-shell'
import { FacultyForm } from '@/components/faculty/faculty-form'
import { useAuth } from '@/lib/auth'
import { canManageFaculty, createFaculty, type FacultyInput } from '@/lib/faculty'

export default function AddFacultyPage() {
  const router = useRouter()
  const { profile, loading } = useAuth()
  const [isSubmitting, setIsSubmitting] = useState(false)

  if (!loading && !canManageFaculty(profile?.role_id, profile?.role_name)) {
    redirect('/dashboard/faculty')
  }

  const handleSubmit = async (data: FacultyInput) => {
    setIsSubmitting(true)

    const { error } = await createFaculty(data, profile?.institute_id, profile?.branch_id)

    setIsSubmitting(false)

    if (error) {
      throw error
    }

    router.push('/dashboard/faculty?message=Faculty created successfully')
  }

  if (loading) {
    return (
      <SiteContainer className="py-8">
        <div className="flex min-h-[60vh] items-center justify-center">
          <div className="text-center">
            <div className="mx-auto mb-4 h-10 w-10 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
            <p className="text-muted-foreground">Loading...</p>
          </div>
        </div>
      </SiteContainer>
    )
  }

  return (
    <SiteContainer className="max-w-3xl py-8">
      <FacultyForm onSubmit={handleSubmit} isLoading={isSubmitting} />
    </SiteContainer>
  )
}
