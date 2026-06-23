'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { deleteFaculty, type FacultyRow } from '@/lib/faculty'

interface FacultyListTableProps {
  faculty: FacultyRow[]
  totalCount: number
  onFacultyDeleted?: () => void
  canManage?: boolean
}

export function FacultyListTable({
  faculty,
  totalCount,
  onFacultyDeleted,
  canManage = false,
}: FacultyListTableProps) {
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [deleteError, setDeleteError] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  const [pendingDelete, setPendingDelete] = useState<FacultyRow | null>(null)

  const handleDeleteConfirm = async () => {
    if (!pendingDelete) return

    setDeletingId(pendingDelete.id)
    setDeleteError(null)
    setSuccessMessage(null)

    const { error } = await deleteFaculty(pendingDelete.id)
    setDeletingId(null)

    if (error) {
      setDeleteError(error instanceof Error ? error.message : 'Failed to delete faculty')
      return
    }

    setSuccessMessage('Faculty deleted successfully')
    onFacultyDeleted?.()
  }

  if (faculty.length === 0) {
    return (
      <Card>
        <CardContent className="py-12">
          <p className="text-center text-muted-foreground">No faculty found</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Faculty</CardTitle>
        <CardDescription>{totalCount} faculty member(s)</CardDescription>
      </CardHeader>
      <CardContent>
        {deleteError && (
          <div className="mb-4 rounded-md border border-destructive/50 bg-destructive/10 p-3 text-sm text-destructive">
            {deleteError}
          </div>
        )}

        {successMessage && (
          <div className="mb-4 rounded-md border border-green-500/50 bg-green-500/10 p-3 text-sm text-green-700">
            {successMessage}
          </div>
        )}

        {pendingDelete && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
            <div className="w-full max-w-md rounded-lg bg-background p-6 shadow-lg">
              <h3 className="text-lg font-semibold">Delete faculty?</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                Do you want to delete{' '}
                <span className="font-medium text-foreground">{pendingDelete.full_name}</span>?
              </p>

              <div className="mt-6 flex justify-end gap-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setPendingDelete(null)}
                  disabled={deletingId === pendingDelete.id}
                >
                  No
                </Button>
                <Button
                  type="button"
                  variant="destructive"
                  onClick={async () => {
                    await handleDeleteConfirm()
                    setPendingDelete(null)
                  }}
                  isLoading={deletingId === pendingDelete.id}
                >
                  Yes
                </Button>
              </div>
            </div>
          </div>
        )}

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b">
                <th className="px-4 py-3 text-left font-medium">Employee Code</th>
                <th className="px-4 py-3 text-left font-medium">Faculty Name</th>
                <th className="px-4 py-3 text-left font-medium">Email</th>
                <th className="px-4 py-3 text-left font-medium">Phone</th>
                <th className="px-4 py-3 text-left font-medium">Specialization</th>
                <th className="px-4 py-3 text-left font-medium">Joining Date</th>
                <th className="px-4 py-3 text-left font-medium">Status</th>
                <th className="px-4 py-3 text-left font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {faculty.map((item) => (
                <tr key={item.id} className="border-b hover:bg-muted/50">
                  <td className="px-4 py-3">{item.employee_code}</td>
                  <td className="px-4 py-3">{item.full_name}</td>
                  <td className="px-4 py-3">{item.email}</td>
                  <td className="px-4 py-3">{item.phone}</td>
                  <td className="px-4 py-3">{item.specialization || '-'}</td>
                  <td className="px-4 py-3">{new Date(item.joining_date).toLocaleDateString()}</td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-block rounded-full px-2 py-1 text-xs font-medium ${
                        item.status === 'active'
                          ? 'bg-green-100 text-green-800'
                          : item.status === 'inactive'
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-blue-100 text-blue-800'
                      }`}
                    >
                      {item.status}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2">
                      <Link href={`/dashboard/faculty/${item.id}`}>
                        <Button size="sm" variant="outline">
                          View
                        </Button>
                      </Link>

                      {canManage && (
                        <>
                          <Link href={`/dashboard/faculty/${item.id}/edit`}>
                            <Button size="sm" variant="outline">
                              Edit
                            </Button>
                          </Link>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => setPendingDelete(item)}
                            disabled={deletingId === item.id}
                          >
                            {deletingId === item.id ? 'Deleting...' : 'Delete'}
                          </Button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  )
}
