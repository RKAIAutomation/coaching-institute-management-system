'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import {
  validateStudentForm,
  validateParentForm,
  getBatches,
  type StudentInput,
  type StudentWithRelations,
} from '@/lib/students'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

interface StudentFormProps {
  initialData?: StudentWithRelations
  onSubmit: (data: StudentInput) => Promise<void>
  isLoading?: boolean
}

export function StudentForm({ initialData, onSubmit, isLoading = false }: StudentFormProps) {
  const router = useRouter()
  const [batches, setBatches] = useState<Array<{ id: string; name: string }>>([])
  const [errors, setErrors] = useState<string[]>([])

  const initialFirstName = initialData?.first_name || initialData?.full_name?.split(' ')[0] || ''
  const initialLastName =
    initialData?.last_name || initialData?.full_name?.split(' ').slice(1).join(' ') || ''

  const [formData, setFormData] = useState<StudentInput>({
    first_name: initialFirstName,
    last_name: initialLastName,
    email: initialData?.email || '',
    phone: initialData?.phone || '',
    date_of_birth: initialData?.date_of_birth || '',
    admission_date: initialData?.admission_date || '',
    status: (initialData?.status as 'active' | 'inactive' | 'graduated') || 'active',
    admission_number: initialData?.admission_number || '',
    gender: initialData?.gender || '',
    address: initialData?.address || '',
    institute_id: initialData?.institute_id,
    branch_id: initialData?.branch_id,
    batch_id: initialData?.batches?.[0]?.batch_id || '',
    parent: {
      parent_name: initialData?.parent?.parent_name || '',
      parent_email: initialData?.parent?.parent_email || '',
      parent_phone: initialData?.parent?.parent_phone || '',
      parent_relationship: initialData?.parent?.parent_relationship || '',
    },
  })

  useEffect(() => {
    const loadBatches = async () => {
      const { data } = await getBatches()
      setBatches(data)
    }
    loadBatches()
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrors([])

    // Validate
    const studentErrors = validateStudentForm(formData)
    const parentErrors = validateParentForm(formData.parent)
    const allErrors = [...studentErrors, ...parentErrors]

    if (allErrors.length > 0) {
      setErrors(allErrors)
      return
    }

    try {
      await onSubmit(formData)
      router.push('/dashboard/students')
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : typeof error === 'string'
          ? error
          : error && typeof error === 'object' && 'message' in error
          ? (error as any).message
          : 'Failed to save student'

      setErrors([message])
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{initialData ? 'Edit Student' : 'Add Student'}</CardTitle>
        <CardDescription>Enter student and parent information</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {errors.length > 0 && (
            <div className="rounded-md border border-destructive/50 bg-destructive/10 p-4">
              <p className="text-sm font-medium text-destructive">Errors:</p>
              <ul className="mt-2 list-inside space-y-1 text-sm text-destructive">
                {errors.map((error, i) => (
                  <li key={i}>• {error}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Student Section */}
          <div>
            <h3 className="mb-4 font-semibold">Student Information</h3>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div>
                <label className="block text-sm font-medium mb-1">First Name *</label>
                <input
                  type="text"
                  value={formData.first_name}
                  onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                  className="w-full px-3 py-2 border border-input rounded-md bg-background text-foreground"
                  placeholder="John"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Last Name *</label>
                <input
                  type="text"
                  value={formData.last_name}
                  onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                  className="w-full px-3 py-2 border border-input rounded-md bg-background text-foreground"
                  placeholder="Doe"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Email *</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-3 py-2 border border-input rounded-md bg-background text-foreground"
                  placeholder="john@example.com"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Phone *</label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full px-3 py-2 border border-input rounded-md bg-background text-foreground"
                  placeholder="9876543210"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Date of Birth *</label>
                <input
                  type="date"
                  value={formData.date_of_birth}
                  onChange={(e) => setFormData({ ...formData, date_of_birth: e.target.value })}
                  className="w-full px-3 py-2 border border-input rounded-md bg-background text-foreground"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Enrollment Date *</label>
                <input
                  type="date"
                  value={formData.admission_date}
                  onChange={(e) => setFormData({ ...formData, admission_date: e.target.value })}
                  className="w-full px-3 py-2 border border-input rounded-md bg-background text-foreground"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Status *</label>
                <select
                  value={formData.status}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      status: e.target.value as 'active' | 'inactive' | 'graduated',
                    })
                  }
                  className="w-full px-3 py-2 border border-input rounded-md bg-background text-foreground"
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                  <option value="graduated">Graduated</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Admission Number</label>
                <input
                  type="text"
                  value={formData.admission_number || ''}
                  onChange={(e) => setFormData({ ...formData, admission_number: e.target.value })}
                  className="w-full px-3 py-2 border border-input rounded-md bg-background text-foreground"
                  placeholder="ADM-001"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Gender</label>
                <select
                  value={formData.gender || ''}
                  onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                  className="w-full px-3 py-2 border border-input rounded-md bg-background text-foreground"
                >
                  <option value="">Select gender</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium mb-1">Address</label>
                <textarea
                  value={formData.address || ''}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  className="w-full px-3 py-2 border border-input rounded-md bg-background text-foreground"
                  placeholder="Enter address"
                  rows={3}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Batch</label>
                <select
                  value={formData.batch_id || ''}
                  onChange={(e) => setFormData({ ...formData, batch_id: e.target.value })}
                  className="w-full px-3 py-2 border border-input rounded-md bg-background text-foreground"
                >
                  <option value="">Select a batch</option>
                  {batches.map((batch) => (
                    <option key={batch.id} value={batch.id}>
                      {batch.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Parent Section */}
          <div>
            <h3 className="mb-4 font-semibold">Parent Information</h3>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div>
                <label className="block text-sm font-medium mb-1">Parent Name *</label>
                <input
                  type="text"
                  value={formData.parent.parent_name}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      parent: { ...formData.parent, parent_name: e.target.value },
                    })
                  }
                  className="w-full px-3 py-2 border border-input rounded-md bg-background text-foreground"
                  placeholder="Jane Doe"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Parent Email</label>
                <input
                  type="email"
                  value={formData.parent.parent_email}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      parent: { ...formData.parent, parent_email: e.target.value },
                    })
                  }
                  className="w-full px-3 py-2 border border-input rounded-md bg-background text-foreground"
                  placeholder="jane@example.com"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Parent Phone</label>
                <input
                  type="tel"
                  value={formData.parent.parent_phone}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      parent: { ...formData.parent, parent_phone: e.target.value },
                    })
                  }
                  className="w-full px-3 py-2 border border-input rounded-md bg-background text-foreground"
                  placeholder="9876543210"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Relationship *</label>
                <input
                  type="text"
                  value={formData.parent.parent_relationship}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      parent: { ...formData.parent, parent_relationship: e.target.value },
                    })
                  }
                  className="w-full px-3 py-2 border border-input rounded-md bg-background text-foreground"
                  placeholder="Mother"
                />
              </div>
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex gap-4">
            <Button type="submit" isLoading={isLoading}>
              {initialData ? 'Update Student' : 'Add Student'}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => router.back()}
            >
              Cancel
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
