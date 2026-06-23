'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { deleteStudent, type StudentRow } from '@/lib/students'

interface StudentListTableProps {
  students: StudentRow[]
  onStudentDeleted?: () => void
  canManage?: boolean
}

export function StudentListTable({ students, onStudentDeleted, canManage = false }: StudentListTableProps) {
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [deleteError, setDeleteError] = useState<string | null>(null)
  const [pendingDeleteStudent, setPendingDeleteStudent] = useState<StudentRow | null>(null)

  const handleDeleteRequest = (student: StudentRow) => {
    setDeleteError(null)
    setPendingDeleteStudent(student)
  }

  const handleDeleteConfirm = async () => {
    if (!pendingDeleteStudent) return

    const studentId = pendingDeleteStudent.id
    setDeletingId(studentId)
    setDeleteError(null)
    setPendingDeleteStudent(null)

    const { error } = await deleteStudent(studentId)
    setDeletingId(null)

    if (error) {
      setDeleteError(error instanceof Error ? error.message : 'Failed to delete student')
    } else {
      onStudentDeleted?.()
    }
  }

  if (students.length === 0) {
    return (
      <Card>
        <CardContent className="py-12">
          <p className="text-center text-muted-foreground">No students found</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Students</CardTitle>
        <CardDescription>{students.length} student(s)</CardDescription>
      </CardHeader>
      <CardContent>
        {deleteError && (
          <div className="mb-4 rounded-md border border-destructive/50 bg-destructive/10 p-3 text-sm text-destructive">
            {deleteError}
          </div>
        )}

        {pendingDeleteStudent && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
            <div className="w-full max-w-md rounded-lg bg-background p-6 shadow-lg">
              <h3 className="text-lg font-semibold">Delete student?</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                Do you want to delete <span className="font-medium text-foreground">{pendingDeleteStudent.full_name}</span>?
                This action cannot be undone.
              </p>

              <div className="mt-6 flex justify-end gap-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setPendingDeleteStudent(null)}
                  disabled={deletingId === pendingDeleteStudent.id}
                >
                  No
                </Button>
                <Button
                  type="button"
                  variant="destructive"
                  onClick={handleDeleteConfirm}
                  isLoading={deletingId === pendingDeleteStudent.id}
                >
                  Yes, Delete
                </Button>
              </div>
            </div>
          </div>
        )}

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b">
                <th className="text-left py-3 px-4 font-medium">Name</th>
                <th className="text-left py-3 px-4 font-medium">Email</th>
                <th className="text-left py-3 px-4 font-medium">Phone</th>
                <th className="text-left py-3 px-4 font-medium">Status</th>
                <th className="text-left py-3 px-4 font-medium">Enrollment Date</th>
                <th className="text-left py-3 px-4 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {students.map((student) => (
                <tr key={student.id} className="border-b hover:bg-muted/50">
                  <td className="py-3 px-4">{student.full_name}</td>
                  <td className="py-3 px-4">{student.email}</td>
                  <td className="py-3 px-4">{student.phone}</td>
                  <td className="py-3 px-4">
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
                  </td>
                  <td className="py-3 px-4">{new Date(student.admission_date).toLocaleDateString()}</td>
                  <td className="py-3 px-4">
                    <div className="flex gap-2">
                      <Link href={`/dashboard/students/${student.id}`}>
                        <Button size="sm" variant="outline">
                          View
                        </Button>
                      </Link>
                      {canManage && (
                        <>
                          <Link href={`/dashboard/students/${student.id}/edit`}>
                            <Button size="sm" variant="outline">
                              Edit
                            </Button>
                          </Link>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => handleDeleteRequest(student)}
                            disabled={deletingId === student.id}
                          >
                            {deletingId === student.id ? 'Deleting...' : 'Delete'}
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
