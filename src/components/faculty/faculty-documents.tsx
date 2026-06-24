'use client'

import { useEffect, useMemo, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  deleteFacultyDocument,
  getFacultyDocumentSignedUrl,
  listFacultyDocuments,
  uploadFacultyDocument,
  type FacultyDocumentRow,
} from '@/lib/faculty-documents'

interface FacultyDocumentsProps {
  facultyId: string
  facultyEmail: string
  roleName?: string
  currentUserEmail?: string
  canManage: boolean
}

export function FacultyDocuments({
  facultyId,
  facultyEmail,
  roleName,
  currentUserEmail,
  canManage,
}: FacultyDocumentsProps) {
  const [documents, setDocuments] = useState<FacultyDocumentRow[]>([])
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [actingDocumentId, setActingDocumentId] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  const [pendingDeleteDoc, setPendingDeleteDoc] = useState<FacultyDocumentRow | null>(null)

  const [documentName, setDocumentName] = useState('')
  const [documentType, setDocumentType] = useState('')
  const [selectedFile, setSelectedFile] = useState<File | null>(null)

  const canViewDocuments = useMemo(() => {
    if (canManage) return true

    if (roleName !== 'faculty') return false

    return (
      String(currentUserEmail || '').trim().toLowerCase() === String(facultyEmail || '').trim().toLowerCase()
    )
  }, [canManage, roleName, currentUserEmail, facultyEmail])

  const loadDocuments = async () => {
    if (!canViewDocuments) {
      setLoading(false)
      return
    }

    setLoading(true)
    setError(null)

    const { data, error: loadError } = await listFacultyDocuments(facultyId)

    setLoading(false)

    if (loadError) {
      setError(loadError instanceof Error ? loadError.message : 'Failed to load documents')
      return
    }

    setDocuments(data)
  }

  useEffect(() => {
    loadDocuments()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [facultyId, canViewDocuments])

  useEffect(() => {
    if (!successMessage) return
    const timer = setTimeout(() => setSuccessMessage(null), 3000)
    return () => clearTimeout(timer)
  }, [successMessage])

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!selectedFile) {
      setError('Please select a file')
      return
    }

    if (!documentName.trim()) {
      setError('Document name is required')
      return
    }

    if (!documentType.trim()) {
      setError('Document type is required')
      return
    }

    setUploading(true)
    setError(null)
    setSuccessMessage(null)

    const { error: uploadError } = await uploadFacultyDocument({
      facultyId,
      documentName: documentName.trim(),
      documentType: documentType.trim(),
      file: selectedFile,
    })

    setUploading(false)

    if (uploadError) {
      setError(uploadError instanceof Error ? uploadError.message : 'Failed to upload document')
      return
    }

    setDocumentName('')
    setDocumentType('')
    setSelectedFile(null)
    setSuccessMessage('Document uploaded successfully')
    await loadDocuments()
  }

  const handleViewDownload = async (doc: FacultyDocumentRow) => {
    setActingDocumentId(doc.id)
    setError(null)

    const { data, error: signedUrlError } = await getFacultyDocumentSignedUrl(doc.file_path)

    setActingDocumentId(null)

    if (signedUrlError || !data) {
      setError(signedUrlError instanceof Error ? signedUrlError.message : 'Failed to open document')
      return
    }

    window.open(data, '_blank', 'noopener,noreferrer')
  }

  const handleDelete = async () => {
    if (!pendingDeleteDoc) return

    setActingDocumentId(pendingDeleteDoc.id)
    setError(null)
    setSuccessMessage(null)

    const { error: deleteError } = await deleteFacultyDocument(pendingDeleteDoc)

    setActingDocumentId(null)
    setPendingDeleteDoc(null)

    if (deleteError) {
      setError(deleteError instanceof Error ? deleteError.message : 'Failed to delete document')
      return
    }

    setSuccessMessage('Document deleted successfully')
    await loadDocuments()
  }

  if (!canViewDocuments) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Documents</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            You are not allowed to view documents for this faculty member.
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Documents</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {error && (
          <div className="rounded-md border border-destructive/50 bg-destructive/10 p-3 text-sm text-destructive">
            {error}
          </div>
        )}

        {successMessage && (
          <div className="rounded-md border border-green-500/50 bg-green-500/10 p-3 text-sm text-green-700">
            {successMessage}
          </div>
        )}

        {canManage && (
          <form onSubmit={handleUpload} className="grid grid-cols-1 gap-3 rounded-md border p-4 md:grid-cols-4">
            <div className="md:col-span-1">
              <label className="mb-1 block text-sm font-medium">Document Name</label>
              <input
                type="text"
                value={documentName}
                onChange={(e) => setDocumentName(e.target.value)}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                placeholder="ID Proof"
              />
            </div>

            <div className="md:col-span-1">
              <label className="mb-1 block text-sm font-medium">Document Type</label>
              <input
                type="text"
                value={documentType}
                onChange={(e) => setDocumentType(e.target.value)}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                placeholder="Aadhaar"
              />
            </div>

            <div className="md:col-span-1">
              <label className="mb-1 block text-sm font-medium">File</label>
              <input
                type="file"
                accept=".pdf,.jpg,.jpeg,.png,.webp"
                onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              />
            </div>

            <div className="md:col-span-1 flex items-end">
              <Button type="submit" isLoading={uploading} className="w-full">
                Upload
              </Button>
            </div>
          </form>
        )}

        {loading ? (
          <div className="py-8 text-center text-sm text-muted-foreground">Loading documents...</div>
        ) : documents.length === 0 ? (
          <div className="rounded-md border p-6 text-center text-sm text-muted-foreground">
            No documents uploaded yet.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="px-3 py-2 text-left font-medium">Document Name</th>
                  <th className="px-3 py-2 text-left font-medium">Document Type</th>
                  <th className="px-3 py-2 text-left font-medium">Uploaded On</th>
                  <th className="px-3 py-2 text-left font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {documents.map((doc) => (
                  <tr key={doc.id} className="border-b">
                    <td className="px-3 py-2">{doc.document_name}</td>
                    <td className="px-3 py-2">{doc.document_type}</td>
                    <td className="px-3 py-2">
                      {doc.created_at ? new Date(doc.created_at).toLocaleDateString() : '-'}
                    </td>
                    <td className="px-3 py-2">
                      <div className="flex flex-wrap gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleViewDownload(doc)}
                          disabled={actingDocumentId === doc.id}
                        >
                          View/Download
                        </Button>

                        {canManage && (
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => setPendingDeleteDoc(doc)}
                            disabled={actingDocumentId === doc.id}
                          >
                            Delete
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {pendingDeleteDoc && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
            <div className="w-full max-w-md rounded-lg bg-background p-6 shadow-lg">
              <h3 className="text-lg font-semibold">Delete document?</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                Are you sure you want to delete <span className="font-medium">{pendingDeleteDoc.document_name}</span>?
              </p>

              <div className="mt-6 flex justify-end gap-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setPendingDeleteDoc(null)}
                  disabled={actingDocumentId === pendingDeleteDoc.id}
                >
                  No
                </Button>
                <Button
                  type="button"
                  variant="destructive"
                  onClick={handleDelete}
                  isLoading={actingDocumentId === pendingDeleteDoc.id}
                >
                  Yes
                </Button>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
