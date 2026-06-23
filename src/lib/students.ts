'use client'

import { supabase } from './supabaseClient'

// Types for student data
export interface StudentFormData {
  first_name: string
  last_name: string
  email: string
  phone: string
  date_of_birth: string
  admission_date: string
  status: 'active' | 'inactive' | 'graduated'
  admission_number?: string
  gender?: string
  address?: string
}

export interface ParentFormData {
  parent_name: string
  parent_email: string
  parent_phone: string
  parent_relationship: string
}

export interface StudentInput extends StudentFormData {
  branch_id?: string
  institute_id?: string
  parent: ParentFormData
  batch_id?: string
}

export interface StudentRow {
  id: string
  first_name: string
  last_name: string
  full_name: string
  email: string
  phone: string
  date_of_birth: string
  admission_date: string
  status: string
  admission_number?: string
  gender?: string
  address?: string
  profile_id?: string
  institute_id?: string
  branch_id?: string
  created_at: string
  updated_at: string
}

export interface ParentRow {
  id: string
  student_id: string
  parent_name: string
  parent_email: string
  parent_phone: string
  parent_relationship: string
  created_at: string
  updated_at: string
}

export interface StudentWithRelations extends StudentRow {
  batches?: Array<{
    batch_id: string
    batches?: { id: string; name: string }
  }>
  parent?: ParentRow
}

function deriveFullName(firstName?: string, lastName?: string): string {
  return `${firstName || ''} ${lastName || ''}`.trim()
}

function splitFullName(fullName?: string): { firstName: string; lastName: string } {
  const raw = (fullName || '').trim()
  if (!raw) {
    return { firstName: '', lastName: '' }
  }

  const parts = raw.split(/\s+/)
  return {
    firstName: parts[0] || '',
    lastName: parts.slice(1).join(' '),
  }
}

function toStudentRow(row: any): StudentRow {
  const fallback = splitFullName(row?.full_name)
  const firstName = row?.first_name || fallback.firstName
  const lastName = row?.last_name || fallback.lastName

  return {
    ...row,
    first_name: firstName,
    last_name: lastName,
    full_name: deriveFullName(firstName, lastName),
  } as StudentRow
}

// Validation functions
export function validateStudentForm(data: StudentFormData): string[] {
  const errors: string[] = []

  if (!data.first_name?.trim()) errors.push('First name is required')
  if (!data.last_name?.trim()) errors.push('Last name is required')
  if (!data.email?.trim()) errors.push('Email is required')
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) errors.push('Invalid email format')
  if (!data.phone?.trim()) errors.push('Phone is required')
  if (!/^\d{10,}$/.test(data.phone.replace(/\D/g, ''))) errors.push('Phone must be at least 10 digits')
  if (!data.date_of_birth) errors.push('Date of birth is required')
  if (!data.admission_date) errors.push('Enrollment date is required')
  if (!data.status) errors.push('Status is required')

  return errors
}

export function validateParentForm(data: ParentFormData): string[] {
  const errors: string[] = []

  if (!data.parent_name?.trim()) errors.push('Parent name is required')
  if (data.parent_email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.parent_email)) {
    errors.push('Invalid parent email format')
  }
  if (data.parent_phone && !/^\d{10,}$/.test(data.parent_phone.replace(/\D/g, ''))) {
    errors.push('Parent phone must be at least 10 digits')
  }
  if (!data.parent_relationship?.trim()) errors.push('Parent relationship is required')

  return errors
}

// Database queries
export async function createStudent(
  studentData: StudentInput,
  userInstituteId?: string,
  userBranchId?: string,
) {
  try {
    let instituteId = studentData.institute_id || userInstituteId
    let branchId = studentData.branch_id || userBranchId

    if ((!instituteId || !branchId) && studentData.batch_id) {
      const { data: batchData, error: batchError } = await supabase
        .from('batches')
        .select('branch_id, institute_id')
        .eq('id', studentData.batch_id)
        .single()

      if (batchError) throw batchError
      if (batchData) {
        branchId = branchId || batchData.branch_id
        instituteId = instituteId || batchData.institute_id
      }
    }

    if (!instituteId && branchId) {
      const { data: branchData, error: branchError } = await supabase
        .from('branches')
        .select('institute_id')
        .eq('id', branchId)
        .single()

      if (branchError) throw branchError
      if (branchData) {
        instituteId = branchData.institute_id
      }
    }

    if (!instituteId || !branchId) {
      throw new Error('Unable to save student: missing institute or branch information.')
    }

    // Create student record
    const { data: student, error: studentError } = await supabase
      .from('students')
      .insert([
        {
          first_name: studentData.first_name,
          last_name: studentData.last_name,
          email: studentData.email,
          phone: studentData.phone,
          date_of_birth: studentData.date_of_birth,
          admission_date: studentData.admission_date,
          status: studentData.status,
          admission_number: studentData.admission_number || null,
          gender: studentData.gender || null,
          address: studentData.address || null,
          institute_id: instituteId,
          branch_id: branchId,
        },
      ])
      .select()
      .single()

    if (studentError) throw studentError
    if (!student) throw new Error('Failed to create student')

    // Create parent record if provided
    if (studentData.parent.parent_name) {
      const { error: parentError } = await supabase.from('parents').insert([
        {
          student_id: student.id,
          parent_name: studentData.parent.parent_name,
          parent_email: studentData.parent.parent_email || null,
          parent_phone: studentData.parent.parent_phone || null,
          parent_relationship: studentData.parent.parent_relationship,
        },
      ])

      if (parentError) throw parentError
    }

    // Assign to batch if provided
    if (studentData.batch_id) {
      const { error: batchError } = await supabase.from('student_batches').insert([
        {
          student_id: student.id,
          batch_id: studentData.batch_id,
        },
      ])

      if (batchError) throw batchError
    }

    return { data: student, error: null }
  } catch (error) {
    if (error instanceof Error) {
      return { data: null, error }
    }

    if (error && typeof error === 'object' && 'message' in error) {
      return { data: null, error: new Error((error as any).message) }
    }

    return { data: null, error: new Error('Failed to save student') }
  }
}

export async function updateStudent(
  studentId: string,
  studentData: StudentInput,
) {
  try {
    const { data: student, error: studentError } = await supabase
      .from('students')
      .update({
        first_name: studentData.first_name,
        last_name: studentData.last_name,
        email: studentData.email,
        phone: studentData.phone,
        date_of_birth: studentData.date_of_birth,
        admission_date: studentData.admission_date,
        status: studentData.status,
        admission_number: studentData.admission_number || null,
        gender: studentData.gender || null,
        address: studentData.address || null,
      })
      .eq('id', studentId)
      .select()
      .single()

    if (studentError) throw studentError

    // Keep the parent row in sync with the student row.
    if (studentData.parent.parent_name?.trim()) {
      const { error: parentError } = await supabase.from('parents').upsert(
        {
          student_id: studentId,
          parent_name: studentData.parent.parent_name,
          parent_email: studentData.parent.parent_email || null,
          parent_phone: studentData.parent.parent_phone || null,
          parent_relationship: studentData.parent.parent_relationship,
        },
        {
          onConflict: 'student_id',
        },
      )

      if (parentError) throw parentError
    }

    // Update batch assignment if provided
    if (studentData.batch_id) {
      const { error: batchError } = await supabase.from('student_batches').upsert(
        {
          student_id: studentId,
          batch_id: studentData.batch_id,
        },
        {
          onConflict: 'student_id',
        },
      )

      if (batchError) throw batchError
    } else {
      const { error: batchDeleteError } = await supabase
        .from('student_batches')
        .delete()
        .eq('student_id', studentId)

      if (batchDeleteError) throw batchDeleteError
    }

    return { data: student, error: null }
  } catch (error) {
    if (error instanceof Error) {
      return { data: null, error }
    }

    if (error && typeof error === 'object' && 'message' in error) {
      return { data: null, error: new Error((error as any).message) }
    }

    return { data: null, error: new Error('Failed to update student') }
  }
}

export async function getStudentById(studentId: string) {
  try {
    const { data: student, error: studentError } = await supabase
      .from('students')
      .select(
        `
        id,
        first_name,
        last_name,
        email,
        phone,
        date_of_birth,
        admission_date,
        status,
        admission_number,
        gender,
        address,
        profile_id,
        institute_id,
        branch_id,
        created_at,
        updated_at
      `,
      )
      .eq('id', studentId)
      .single()

    if (studentError) throw studentError

    const { data: parent } = await supabase
      .from('parents')
      .select('*')
      .eq('student_id', studentId)
      .single()

    const { data: batches } = await supabase
      .from('student_batches')
      .select('batch_id, batches(id, name)')
      .eq('student_id', studentId)

    const mappedStudent = toStudentRow(student)

    return {
      data: {
        ...mappedStudent,
        parent,
        batches: (batches || []) as any,
      } as unknown as StudentWithRelations,
      error: null,
    }
  } catch (error) {
    return { data: null, error }
  }
}

export async function listStudents(
  branchId?: string,
  batchId?: string,
  status?: string,
  search?: string,
) {
  try {
    let query = supabase
      .from('students')
      .select(
        `
        id,
        first_name,
        last_name,
        email,
        phone,
        date_of_birth,
        status,
        admission_date,
        admission_number,
        gender,
        address,
        profile_id,
        institute_id,
        branch_id,
        created_at,
        updated_at
      `,
      )

    if (branchId) {
      query = query.eq('branch_id', branchId)
    }

    if (status) {
      query = query.eq('status', status)
    }

    if (search) {
      query = query.or(`first_name.ilike.%${search}%,last_name.ilike.%${search}%,email.ilike.%${search}%,phone.ilike.%${search}%`)
    }

    const { data: students, error: studentsError } = await query.order('created_at', {
      ascending: false,
    })

    if (studentsError) throw studentsError

    // If filtering by batch, filter results
    if (batchId) {
      const { data: batchStudents } = await supabase
        .from('student_batches')
        .select('student_id')
        .eq('batch_id', batchId)

      const batchStudentIds = new Set(batchStudents?.map((bs) => bs.student_id) || [])
      return {
        data: (students?.filter((s) => batchStudentIds.has(s.id)).map((s) => toStudentRow(s)) || []),
        error: null,
      }
    }

    return { data: (students || []).map((s) => toStudentRow(s)), error: null }
  } catch (error) {
    return { data: [], error }
  }
}

export async function deleteStudent(studentId: string) {
  try {
    // Delete child rows first so the student delete is not blocked by FKs.
    const { error: parentError } = await supabase.from('parents').delete().eq('student_id', studentId)

    if (parentError) throw parentError

    const { error: batchError } = await supabase.from('student_batches').delete().eq('student_id', studentId)

    if (batchError) throw batchError

    // Delete student
    const { error: studentError } = await supabase.from('students').delete().eq('id', studentId)

    if (studentError) throw studentError

    return { error: null }
  } catch (error) {
    if (error instanceof Error) {
      return { error }
    }

    if (error && typeof error === 'object' && 'message' in error) {
      return { error: new Error((error as any).message) }
    }

    return { error: new Error('Failed to delete student') }
  }
}

export async function getBatches() {
  try {
    const { data: batches, error } = await supabase
      .from('batches')
      .select('id, name')
      .order('name', { ascending: true })

    if (error) throw error

    return { data: batches || [], error: null }
  } catch (error) {
    return { data: [], error }
  }
}

export async function getCourses() {
  try {
    const { data: courses, error } = await supabase
      .from('courses')
      .select('id, name')
      .order('name', { ascending: true })

    if (error) throw error

    return { data: courses || [], error: null }
  } catch (error) {
    return { data: [], error }
  }
}

// Helper to check if user can manage students
export function canManageStudents(_roleId?: string, roleName?: string): boolean {
  const managingRoles = ['super_admin', 'institute_admin', 'branch_manager']
  return managingRoles.includes(roleName || '')
}

export function canViewStudents(_roleId?: string, roleName?: string): boolean {
  const viewingRoles = ['super_admin', 'institute_admin', 'branch_manager', 'faculty']
  return viewingRoles.includes(roleName || '')
}
