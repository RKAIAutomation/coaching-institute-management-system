'use client'

import { useEffect, useState } from 'react'
import { useAuth } from '@/lib/auth'
import { getStudentById, canViewStudents, type StudentWithRelations } from '@/lib/students'
import { SiteContainer } from '@/components/site-shell'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { redirect } from 'next/navigation'

interface StudentDetailPageProps {
  params: Promise<{
    id: string
  }>
}

export default function StudentDetailPage({ params }: StudentDetailPageProps) {
  const { profile, loading: authLoading } = useAuth()
  const [student, setStudent] = useState<StudentWithRelations | null>(null)
  const [loading, setLoading] = useState(true)
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
    if (!authLoading && !canViewStudents(profile?.role_id, profile?.role_name)) {
      redirect('/dashboard')
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
        <Card className="border-destructive">
          <CardHeader>
            <CardTitle>Error</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-destructive">{error || 'Student not found'}</p>
          </CardContent>
        </Card>
      </SiteContainer>
    )
  }

  const canManage = profile?.role_name && ['super_admin', 'institute_admin', 'branch_manager'].includes(profile.role_name)

  return (
    <SiteContainer className="py-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">{student.full_name}</h1>
          <p className="text-muted-foreground">Student Details</p>
        </div>
        <div className="flex gap-2">
          <Link href="/dashboard/students">
            <Button variant="outline">Back</Button>
          </Link>
          {canManage && (
            <Link href={`/dashboard/students/${student.id}/edit`}>
              <Button>Edit Student</Button>
            </Link>
          )}
        </div>
      </div>

      {/* Student Info */}
      <Card>
        <CardHeader>
          <CardTitle>Student Information</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <p className="text-sm text-muted-foreground">Email</p>
            <p className="font-semibold">{student.email}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Phone</p>
            <p className="font-semibold">{student.phone}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Date of Birth</p>
            <p className="font-semibold">{new Date(student.date_of_birth).toLocaleDateString()}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Enrollment Date</p>
            <p className="font-semibold">{new Date(student.admission_date).toLocaleDateString()}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Status</p>
            <p className="font-semibold">
              <span
                className={`inline-block rounded-full px-2 py-1 text-xs font-medium ${
                  student.status === 'active'
                    ? 'bg-green-100 text-green-800'
                    : student.status === 'inactive'
                      ? 'bg-yellow-100 text-yellow-800'
                      : 'bg-gray-100 text-gray-800'
                }`}
              >
                {student.status}
              </span>
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Parent Info */}
      {student.parent && (
        <Card>
          <CardHeader>
            <CardTitle>Parent Information</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <p className="text-sm text-muted-foreground">Name</p>
              <p className="font-semibold">{student.parent.parent_name}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Relationship</p>
              <p className="font-semibold">{student.parent.parent_relationship}</p>
            </div>
            {student.parent.parent_email && (
              <div>
                <p className="text-sm text-muted-foreground">Email</p>
                <p className="font-semibold">{student.parent.parent_email}</p>
              </div>
            )}
            {student.parent.parent_phone && (
              <div>
                <p className="text-sm text-muted-foreground">Phone</p>
                <p className="font-semibold">{student.parent.parent_phone}</p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Batch Info */}
      {student.batches && student.batches.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Enrollment</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {student.batches.map((batch, idx) => (
                <div key={idx}>
                  <p className="text-sm text-muted-foreground">Batch</p>
                  <p className="font-semibold">{batch.batches?.name || 'Unknown'}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </SiteContainer>
  )
}
