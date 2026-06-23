'use client'

import { useEffect, useState } from 'react'
import { useRouter, redirect } from 'next/navigation'
import { SiteContainer } from '@/components/site-shell'
import { FacultyForm } from '@/components/faculty/faculty-form'
import { useAuth } from '@/lib/auth'
import {
  canManageFaculty,
  getFacultyById,
  updateFaculty,
  type FacultyInput,
  type FacultyRow,
} from '@/lib/faculty'

interface EditFacultyPageProps {
  params: Promise<{ id: string }>
}

export default function EditFacultyPage({ params }: EditFacultyPageProps) {
  const router = useRouter()
  const { profile, loading: authLoading } = useAuth()
  const [faculty, setFaculty] = useState<FacultyRow | null>(null)
  const [facultyId, setFacultyId] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const loadParams = async () => {
      const resolved = await params
      setFacultyId(resolved.id)
    }

    loadParams()
  }, [params])

  useEffect(() => {
    if (!authLoading && !canManageFaculty(profile?.role_id, profile?.role_name)) {
      redirect('/dashboard/faculty')
    }
  }, [authLoading, profile?.role_id, profile?.role_name])

  useEffect(() => {
    const loadFaculty = async () => {
      if (!facultyId) return

      setLoading(true)
      const { data, error: fetchError } = await getFacultyById(facultyId)

      if (fetchError) {
        setError(fetchError instanceof Error ? fetchError.message : 'Failed to load faculty')
      } else {
        setFaculty(data)
      }

      setLoading(false)
    }

    if (!authLoading) {
      loadFaculty()
    }
  }, [authLoading, facultyId])

  const handleSubmit = async (data: FacultyInput) => {
    if (!facultyId) return

    setIsSubmitting(true)
    const { error: saveError } = await updateFaculty(facultyId, data)
    setIsSubmitting(false)

    if (saveError) {
      throw saveError
    }

    router.push('/dashboard/faculty?message=Faculty updated successfully')
  }

  if (authLoading || loading) {
    return (
      <SiteContainer className="py-8">
        <div className="flex min-h-[60vh] items-center justify-center">
          <div className="text-center">
            <div className="mx-auto mb-4 h-10 w-10 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
            <p className="text-muted-foreground">Loading faculty...</p>
          </div>
        </div>
      </SiteContainer>
    )
  }

  if (error || !faculty) {
    return (
      <SiteContainer className="py-8">
        <div className="rounded-md border border-destructive/50 bg-destructive/10 p-4 text-sm text-destructive">
          {error || 'Faculty not found'}
        </div>
      </SiteContainer>
    )
  }

  return (
    <SiteContainer className="max-w-3xl py-8">
      <FacultyForm initialData={faculty} onSubmit={handleSubmit} isLoading={isSubmitting} />
    </SiteContainer>
  )
}
