'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { validateFacultyForm, type FacultyInput, type FacultyRow } from '@/lib/faculty'

interface FacultyFormProps {
  initialData?: FacultyRow
  onSubmit: (data: FacultyInput) => Promise<void>
  isLoading?: boolean
}

export function FacultyForm({ initialData, onSubmit, isLoading = false }: FacultyFormProps) {
  const router = useRouter()
  const [errors, setErrors] = useState<string[]>([])

  const [formData, setFormData] = useState<FacultyInput>({
    employee_code: initialData?.employee_code || '',
    first_name: initialData?.first_name || '',
    last_name: initialData?.last_name || '',
    email: initialData?.email || '',
    phone: initialData?.phone || '',
    date_of_birth: initialData?.date_of_birth || '',
    gender: initialData?.gender || '',
    qualification: initialData?.qualification || '',
    specialization: initialData?.specialization || '',
    experience_years: initialData?.experience_years ?? null,
    joining_date: initialData?.joining_date || '',
    salary: initialData?.salary ?? null,
    status: (initialData?.status as 'active' | 'inactive' | 'on_leave') || 'active',
    address: initialData?.address || '',
    emergency_contact: initialData?.emergency_contact || '',
    institute_id: initialData?.institute_id,
    branch_id: initialData?.branch_id,
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrors([])

    const formErrors = validateFacultyForm(formData)
    if (formErrors.length > 0) {
      setErrors(formErrors)
      return
    }

    try {
      await onSubmit(formData)
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : typeof error === 'string'
          ? error
          : error && typeof error === 'object' && 'message' in error
          ? (error as any).message
          : 'Failed to save faculty'

      setErrors([message])
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{initialData ? 'Edit Faculty' : 'Add Faculty'}</CardTitle>
        <CardDescription>Enter faculty details</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {errors.length > 0 && (
            <div className="rounded-md border border-destructive/50 bg-destructive/10 p-4">
              <p className="text-sm font-medium text-destructive">Errors:</p>
              <ul className="mt-2 list-inside space-y-1 text-sm text-destructive">
                {errors.map((error, idx) => (
                  <li key={idx}>- {error}</li>
                ))}
              </ul>
            </div>
          )}

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <label className="mb-1 block text-sm font-medium">Employee Code *</label>
              <input
                type="text"
                value={formData.employee_code}
                onChange={(e) => setFormData({ ...formData, employee_code: e.target.value })}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-foreground"
                placeholder="EMP-001"
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium">Status *</label>
              <select
                value={formData.status}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    status: e.target.value as 'active' | 'inactive' | 'on_leave',
                  })
                }
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-foreground"
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="on_leave">On Leave</option>
              </select>
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium">First Name *</label>
              <input
                type="text"
                value={formData.first_name}
                onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-foreground"
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium">Last Name *</label>
              <input
                type="text"
                value={formData.last_name}
                onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-foreground"
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium">Email *</label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-foreground"
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium">Phone *</label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-foreground"
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium">Date of Birth</label>
              <input
                type="date"
                value={formData.date_of_birth || ''}
                onChange={(e) => setFormData({ ...formData, date_of_birth: e.target.value })}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-foreground"
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium">Gender</label>
              <select
                value={formData.gender || ''}
                onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-foreground"
              >
                <option value="">Select gender</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
              </select>
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium">Qualification</label>
              <input
                type="text"
                value={formData.qualification || ''}
                onChange={(e) => setFormData({ ...formData, qualification: e.target.value })}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-foreground"
                placeholder="M.Sc, B.Ed"
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium">Specialization</label>
              <input
                type="text"
                value={formData.specialization || ''}
                onChange={(e) => setFormData({ ...formData, specialization: e.target.value })}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-foreground"
                placeholder="Mathematics"
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium">Experience (Years)</label>
              <input
                type="number"
                min={0}
                step="0.5"
                value={formData.experience_years ?? ''}
                onChange={(e) => {
                  const value = e.target.value
                  setFormData({ ...formData, experience_years: value ? Number(value) : null })
                }}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-foreground"
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium">Joining Date *</label>
              <input
                type="date"
                value={formData.joining_date}
                onChange={(e) => setFormData({ ...formData, joining_date: e.target.value })}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-foreground"
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium">Salary</label>
              <input
                type="number"
                min={0}
                step="0.01"
                value={formData.salary ?? ''}
                onChange={(e) => {
                  const value = e.target.value
                  setFormData({ ...formData, salary: value ? Number(value) : null })
                }}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-foreground"
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium">Emergency Contact</label>
              <input
                type="text"
                value={formData.emergency_contact || ''}
                onChange={(e) => setFormData({ ...formData, emergency_contact: e.target.value })}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-foreground"
              />
            </div>

            <div className="md:col-span-2">
              <label className="mb-1 block text-sm font-medium">Address</label>
              <textarea
                value={formData.address || ''}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-foreground"
                rows={3}
              />
            </div>
          </div>

          <div className="flex gap-4">
            <Button type="submit" isLoading={isLoading}>
              {initialData ? 'Update Faculty' : 'Add Faculty'}
            </Button>
            <Button type="button" variant="outline" onClick={() => router.back()}>
              Cancel
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
