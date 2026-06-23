'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import { SiteContainer } from '@/components/site-shell'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { FacultyDocuments } from '@/components/faculty/faculty-documents'
import { useAuth } from '@/lib/auth'
import { canManageFaculty, canViewFaculty, getFacultyById, type FacultyRow } from '@/lib/faculty'

interface FacultyDetailsPageProps {
  params: Promise<{ id: string }>
}

export default function FacultyDetailsPage({ params }: FacultyDetailsPageProps) {
  const { profile, loading: authLoading } = useAuth()
  const [faculty, setFaculty] = useState<FacultyRow | null>(null)
  const [facultyId, setFacultyId] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const loadParams = async () => {
      const resolved = await params
      setFacultyId(resolved.id)
    }

    loadParams()
  }, [params])

  useEffect(() => {
    if (!authLoading && !canViewFaculty(profile?.role_id, profile?.role_name)) {
      redirect('/dashboard')
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
        <Card className="border-destructive">
          <CardHeader>
            <CardTitle>Error</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-destructive">{error || 'Faculty not found'}</p>
          </CardContent>
        </Card>
      </SiteContainer>
    )
  }

  const canManage = canManageFaculty(profile?.role_id, profile?.role_name)

  return (
    <SiteContainer className="space-y-6 py-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">{faculty.full_name}</h1>
          <p className="text-muted-foreground">Faculty Details</p>
        </div>

        <div className="flex gap-2">
          <Link href="/dashboard/faculty">
            <Button variant="outline">Back</Button>
          </Link>
          {canManage && (
            <Link href={`/dashboard/faculty/${faculty.id}/edit`}>
              <Button>Edit Faculty</Button>
            </Link>
          )}
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Professional Information</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <div>
            <p className="text-sm text-muted-foreground">Employee Code</p>
            <p className="font-semibold">{faculty.employee_code}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Status</p>
            <p className="font-semibold">{faculty.status}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Specialization</p>
            <p className="font-semibold">{faculty.specialization || '-'}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Qualification</p>
            <p className="font-semibold">{faculty.qualification || '-'}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Experience</p>
            <p className="font-semibold">{faculty.experience_years ?? '-'} year(s)</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Joining Date</p>
            <p className="font-semibold">{new Date(faculty.joining_date).toLocaleDateString()}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Salary</p>
            <p className="font-semibold">{faculty.salary ?? '-'}</p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Contact Information</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <div>
            <p className="text-sm text-muted-foreground">Email</p>
            <p className="font-semibold">{faculty.email}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Phone</p>
            <p className="font-semibold">{faculty.phone}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Emergency Contact</p>
            <p className="font-semibold">{faculty.emergency_contact || '-'}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Address</p>
            <p className="font-semibold">{faculty.address || '-'}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Date of Birth</p>
            <p className="font-semibold">
              {faculty.date_of_birth ? new Date(faculty.date_of_birth).toLocaleDateString() : '-'}
            </p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Gender</p>
            <p className="font-semibold">{faculty.gender || '-'}</p>
          </div>
        </CardContent>
      </Card>

      <FacultyDocuments
        facultyId={faculty.id}
        facultyEmail={faculty.email}
        roleName={profile?.role_name}
        currentUserEmail={profile?.email}
        canManage={canManage}
      />
    </SiteContainer>
  )
}
