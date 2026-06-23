'use client'

import { supabase } from './supabaseClient'

const BUCKET_NAME = 'faculty-documents'

export interface FacultyDocumentRow {
  id: string
  faculty_id: string
  document_name: string
  document_type: string
  file_path: string
  created_at?: string
}

export interface UploadFacultyDocumentInput {
  facultyId: string
  documentName: string
  documentType: string
  file: File
}

export const ALLOWED_DOCUMENT_MIME_TYPES = [
  'application/pdf',
  'image/jpeg',
  'image/png',
  'image/webp',
]

export const ALLOWED_DOCUMENT_EXTENSIONS = ['pdf', 'jpg', 'jpeg', 'png', 'webp']

export function validateFacultyDocumentFile(file: File): string | null {
  const ext = file.name.split('.').pop()?.toLowerCase() || ''
  const hasAllowedMime = ALLOWED_DOCUMENT_MIME_TYPES.includes(file.type)
  const hasAllowedExtension = ALLOWED_DOCUMENT_EXTENSIONS.includes(ext)

  if (!hasAllowedMime && !hasAllowedExtension) {
    return 'Only PDF, JPG, PNG, and WEBP files are allowed'
  }

  return null
}

function toFacultyDocumentRow(row: any): FacultyDocumentRow {
  const fileUrl = String(row.file_url || row.file_path || '')
  const uploadedAt = row.uploaded_at || row.created_at

  return {
    id: String(row.id),
    faculty_id: String(row.faculty_id),
    document_name: String(row.document_name || ''),
    document_type: String(row.document_type || ''),
    file_path: fileUrl,
    created_at: uploadedAt ? String(uploadedAt) : undefined,
  }
}

function isAbsoluteUrl(value: string): boolean {
  return /^https?:\/\//i.test(value)
}

function extractStoragePath(filePathOrUrl: string): string | null {
  if (!filePathOrUrl) return null

  if (!isAbsoluteUrl(filePathOrUrl)) {
    return filePathOrUrl
  }

  try {
    const parsed = new URL(filePathOrUrl)
    const markers = ['/object/public/', '/object/sign/', '/object/authenticated/']

    for (const marker of markers) {
      const markerIndex = parsed.pathname.indexOf(marker)
      if (markerIndex === -1) continue

      const suffix = parsed.pathname.slice(markerIndex + marker.length)
      const bucketPrefix = `${BUCKET_NAME}/`

      if (suffix.startsWith(bucketPrefix)) {
        return decodeURIComponent(suffix.slice(bucketPrefix.length))
      }
    }
  } catch {
    return null
  }

  return null
}

export async function listFacultyDocuments(facultyId: string) {
  try {
    const { data, error } = await supabase
      .from('faculty_documents')
      .select('id, faculty_id, document_name, document_type, file_url, uploaded_at')
      .eq('faculty_id', facultyId)
      .order('uploaded_at', { ascending: false })

    if (error) throw error

    return {
      data: (data || []).map((row) => toFacultyDocumentRow(row)),
      error: null,
    }
  } catch (error) {
    return {
      data: [] as FacultyDocumentRow[],
      error,
    }
  }
}

export async function uploadFacultyDocument(input: UploadFacultyDocumentInput) {
  try {
    const fileValidationError = validateFacultyDocumentFile(input.file)
    if (fileValidationError) {
      throw new Error(fileValidationError)
    }

    const fileExt = input.file.name.split('.').pop()?.toLowerCase() || 'bin'
    const safeName = input.documentName.toLowerCase().replace(/[^a-z0-9]+/g, '-')
    const uniqueSuffix = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
    const filePath = `faculty/${input.facultyId}/${safeName}-${uniqueSuffix}.${fileExt}`

    const { error: uploadError } = await supabase.storage.from(BUCKET_NAME).upload(filePath, input.file, {
      upsert: false,
      contentType: input.file.type || undefined,
    })

    if (uploadError) throw uploadError

    const { data, error: insertError } = await supabase
      .from('faculty_documents')
      .insert([
        {
          faculty_id: input.facultyId,
          document_name: input.documentName,
          document_type: input.documentType,
          file_url: filePath,
        },
      ])
      .select('id, faculty_id, document_name, document_type, file_url, uploaded_at')
      .single()

    if (insertError) {
      await supabase.storage.from(BUCKET_NAME).remove([filePath])
      throw insertError
    }

    return { data: toFacultyDocumentRow(data), error: null }
  } catch (error) {
    if (error instanceof Error) return { data: null, error }
    if (error && typeof error === 'object' && 'message' in error) {
      return { data: null, error: new Error((error as any).message) }
    }
    return { data: null, error: new Error('Failed to upload faculty document') }
  }
}

export async function getFacultyDocumentSignedUrl(filePath: string, expiresIn = 60) {
  try {
    if (isAbsoluteUrl(filePath)) {
      return { data: filePath, error: null }
    }

    const storagePath = extractStoragePath(filePath)
    if (!storagePath) {
      throw new Error('Invalid document file path')
    }

    const { data, error } = await supabase.storage.from(BUCKET_NAME).createSignedUrl(storagePath, expiresIn)

    if (error) throw error

    return { data: data.signedUrl, error: null }
  } catch (error) {
    return { data: null, error }
  }
}

export async function deleteFacultyDocument(document: FacultyDocumentRow) {
  try {
    const storagePath = extractStoragePath(document.file_path)

    if (storagePath) {
      const { error: storageError } = await supabase.storage.from(BUCKET_NAME).remove([storagePath])
      if (storageError) throw storageError
    }

    const { error: deleteError } = await supabase.from('faculty_documents').delete().eq('id', document.id)

    if (deleteError) throw deleteError

    return { error: null }
  } catch (error) {
    if (error instanceof Error) return { error }
    if (error && typeof error === 'object' && 'message' in error) {
      return { error: new Error((error as any).message) }
    }
    return { error: new Error('Failed to delete document') }
  }
}
