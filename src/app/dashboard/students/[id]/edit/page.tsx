'use client'

import { useEffect, useState } from 'react'
import { useAuth } from '@/lib/auth'
import {
  getStudentById,
  updateStudent,
  canManageStudents,
  type StudentInput,
  type StudentWithRelations,
} from '@/lib/students'
import { StudentForm } from '@/components/students/student-form'
import { SiteContainer } from '@/components/site-shell'
import { redirect } from 'next/navigation'

interface EditStudentPageProps {
  params: Promise<{
    id: string
  }>
}

export default function EditStudentPage({ params }: EditStudentPageProps) {
  const { profile, loading: authLoading } = useAuth()
  const [student, setStudent] = useState<StudentWithRelations | null>(null)
  const [loading, setLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [studentId, setStudentId] = useState<string | null>(null)

  useEffect(() => {
    const getParams = async () => {
      const resolvedParams = await params
      setStudentId(resolvedParams.id)
    }
    getParams()
  }, [params])

  useEffect(() => {
    if (!authLoading && !canManageStudents(profile?.role_id, profile?.role_name)) {
      redirect('/dashboard/students')
    }
  }, [profile, authLoading])

  useEffect(() => {
    const loadStudent = async () => {
      if (!studentId) return
      setLoading(true)
      const { data, error: fetchError } = await getStudentById(studentId)

      if (fetchError) {
        setError(fetchError instanceof Error ? fetchError.message : 'Failed to load student')
      } else {
        setStudent(data)
      }
      setLoading(false)
    }

    if (!authLoading) {
      loadStudent()
    }
  }, [studentId, authLoading])

  const handleSubmit = async (data: StudentInput) => {
    if (!studentId) return
    setIsSubmitting(true)

    const { error } = await updateStudent(studentId, data)

    setIsSubmitting(false)

    if (error) {
      throw error
    }
  }

  if (authLoading || loading) {
    return (
      <SiteContainer className="py-8">
        <div className="flex min-h-[60vh] items-center justify-center">
          <div className="text-center">
            <div className="animate-spin h-10 w-10 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading student...</p>
          </div>
        </div>
      </SiteContainer>
    )
  }

  if (error || !student) {
    return (
      <SiteContainer className="py-8">
        <div className="rounded-md border border-destructive/50 bg-destructive/10 p-4 text-sm text-destructive">
          {error || 'Student not found'}
        </div>
      </SiteContainer>
    )
  }

  return (
    <SiteContainer className="py-8 max-w-2xl">
      <StudentForm
        initialData={student}
        onSubmit={handleSubmit}
        isLoading={isSubmitting}
      />
    </SiteContainer>
  )
}
