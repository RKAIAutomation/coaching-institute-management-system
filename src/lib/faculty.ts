'use client'

import { supabase } from './supabaseClient'

export interface FacultyFormData {
  employee_code: string
  first_name: string
  last_name: string
  email: string
  phone: string
  date_of_birth?: string
  gender?: string
  qualification?: string
  specialization?: string
  experience_years?: number | null
  joining_date: string
  salary?: number | null
  status: 'active' | 'inactive' | 'on_leave'
  address?: string
  emergency_contact?: string
}

export interface FacultyInput extends FacultyFormData {
  institute_id?: string
  branch_id?: string
}

export interface FacultyRow {
  id: string
  employee_code: string
  first_name: string
  last_name: string
  full_name: string
  email: string
  phone: string
  date_of_birth?: string
  gender?: string
  qualification?: string
  specialization?: string
  experience_years?: number | null
  joining_date: string
  salary?: number | null
  status: string
  address?: string
  emergency_contact?: string
  institute_id?: string
  branch_id?: string
  created_at: string
  updated_at: string
}

export interface FacultyFilters {
  search: string
  status: string
  specialization: string
}

function toFacultyRow(row: any): FacultyRow {
  const firstName = row?.first_name || ''
  const lastName = row?.last_name || ''

  return {
    ...row,
    full_name: `${firstName} ${lastName}`.trim(),
  } as FacultyRow
}

export function validateFacultyForm(data: FacultyFormData): string[] {
  const errors: string[] = []

  if (!data.employee_code?.trim()) errors.push('Employee code is required')
  if (!data.first_name?.trim()) errors.push('First name is required')
  if (!data.last_name?.trim()) errors.push('Last name is required')
  if (!data.email?.trim()) errors.push('Email is required')
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) errors.push('Invalid email format')
  if (!data.phone?.trim()) errors.push('Phone is required')
  if (!/^\d{10,}$/.test(data.phone.replace(/\D/g, ''))) {
    errors.push('Phone must be at least 10 digits')
  }
  if (!data.joining_date) errors.push('Joining date is required')

  return errors
}

export async function createFaculty(
  facultyData: FacultyInput,
  userInstituteId?: string,
  userBranchId?: string,
) {
  try {
    const instituteId = facultyData.institute_id || userInstituteId
    const branchId = facultyData.branch_id || userBranchId

    if (!instituteId || !branchId) {
      throw new Error('Unable to save faculty: missing institute or branch information.')
    }

    const { data, error } = await supabase
      .from('faculty')
      .insert([
        {
          employee_code: facultyData.employee_code,
          first_name: facultyData.first_name,
          last_name: facultyData.last_name,
          email: facultyData.email,
          phone: facultyData.phone,
          date_of_birth: facultyData.date_of_birth || null,
          gender: facultyData.gender || null,
          qualification: facultyData.qualification || null,
          specialization: facultyData.specialization || null,
          experience_years: facultyData.experience_years ?? null,
          joining_date: facultyData.joining_date,
          salary: facultyData.salary ?? null,
          status: facultyData.status,
          address: facultyData.address || null,
          emergency_contact: facultyData.emergency_contact || null,
          institute_id: instituteId,
          branch_id: branchId,
        },
      ])
      .select()
      .single()

    if (error) throw error

    return { data: toFacultyRow(data), error: null }
  } catch (error) {
    if (error instanceof Error) return { data: null, error }
    if (error && typeof error === 'object' && 'message' in error) {
      return { data: null, error: new Error((error as any).message) }
    }
    return { data: null, error: new Error('Failed to create faculty') }
  }
}

export async function listFaculty(branchId?: string, filters?: Partial<FacultyFilters>) {
  try {
    let query = supabase
      .from('faculty')
      .select(
        `
        id,
        employee_code,
        first_name,
        last_name,
        email,
        phone,
        date_of_birth,
        gender,
        qualification,
        specialization,
        experience_years,
        joining_date,
        salary,
        status,
        address,
        emergency_contact,
        institute_id,
        branch_id,
        created_at,
        updated_at
      `,
      )

    if (branchId) {
      query = query.eq('branch_id', branchId)
    }

    if (filters?.status) {
      query = query.eq('status', filters.status)
    }

    if (filters?.specialization) {
      query = query.eq('specialization', filters.specialization)
    }

    if (filters?.search) {
      const search = filters.search.trim()
      query = query.or(
        `employee_code.ilike.%${search}%,first_name.ilike.%${search}%,last_name.ilike.%${search}%,email.ilike.%${search}%`,
      )
    }

    const { data, error } = await query.order('created_at', { ascending: false })

    if (error) throw error

    return {
      data: (data || []).map((row) => toFacultyRow(row)),
      error: null,
    }
  } catch (error) {
    return {
      data: [] as FacultyRow[],
      error,
    }
  }
}

export async function getFacultyById(facultyId: string) {
  try {
    const { data, error } = await supabase
      .from('faculty')
      .select(
        `
        id,
        employee_code,
        first_name,
        last_name,
        email,
        phone,
        date_of_birth,
        gender,
        qualification,
        specialization,
        experience_years,
        joining_date,
        salary,
        status,
        address,
        emergency_contact,
        institute_id,
        branch_id,
        created_at,
        updated_at
      `,
      )
      .eq('id', facultyId)
      .single()

    if (error) throw error

    return { data: toFacultyRow(data), error: null }
  } catch (error) {
    return { data: null, error }
  }
}

export async function updateFaculty(facultyId: string, facultyData: FacultyInput) {
  try {
    const { data, error } = await supabase
      .from('faculty')
      .update({
        employee_code: facultyData.employee_code,
        first_name: facultyData.first_name,
        last_name: facultyData.last_name,
        email: facultyData.email,
        phone: facultyData.phone,
        date_of_birth: facultyData.date_of_birth || null,
        gender: facultyData.gender || null,
        qualification: facultyData.qualification || null,
        specialization: facultyData.specialization || null,
        experience_years: facultyData.experience_years ?? null,
        joining_date: facultyData.joining_date,
        salary: facultyData.salary ?? null,
        status: facultyData.status,
        address: facultyData.address || null,
        emergency_contact: facultyData.emergency_contact || null,
        updated_at: new Date().toISOString(),
      })
      .eq('id', facultyId)
      .select()
      .single()

    if (error) throw error

    return { data: toFacultyRow(data), error: null }
  } catch (error) {
    if (error instanceof Error) return { data: null, error }
    if (error && typeof error === 'object' && 'message' in error) {
      return { data: null, error: new Error((error as any).message) }
    }
    return { data: null, error: new Error('Failed to update faculty') }
  }
}

export async function deleteFaculty(facultyId: string) {
  try {
    const { error } = await supabase.from('faculty').delete().eq('id', facultyId)
    if (error) throw error
    return { error: null }
  } catch (error) {
    if (error instanceof Error) return { error }
    if (error && typeof error === 'object' && 'message' in error) {
      return { error: new Error((error as any).message) }
    }
    return { error: new Error('Failed to delete faculty') }
  }
}

export async function getFacultySpecializations(branchId?: string) {
  try {
    let query = supabase.from('faculty').select('specialization').not('specialization', 'is', null)

    if (branchId) {
      query = query.eq('branch_id', branchId)
    }

    const { data, error } = await query

    if (error) throw error

    const specializations = Array.from(
      new Set((data || []).map((row: any) => String(row.specialization || '').trim()).filter(Boolean)),
    ).sort((a, b) => a.localeCompare(b))

    return { data: specializations, error: null }
  } catch (error) {
    return { data: [] as string[], error }
  }
}

export function canManageFaculty(_roleId?: string, roleName?: string): boolean {
  const managingRoles = ['super_admin', 'institute_admin', 'branch_manager']
  return managingRoles.includes(roleName || '')
}

export function canViewFaculty(_roleId?: string, roleName?: string): boolean {
  const viewingRoles = ['super_admin', 'institute_admin', 'branch_manager', 'faculty']
  return viewingRoles.includes(roleName || '')
}
