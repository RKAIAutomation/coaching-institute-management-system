'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { SiteContainer } from '@/components/site-shell'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/lib/auth'
import { canManageFaculty, listFaculty, type FacultyRow } from '@/lib/faculty'
import { FacultyFilters, type FacultyFilters as FacultyFiltersType } from '@/components/faculty/faculty-filters'
import { FacultyListTable } from '@/components/faculty/faculty-list-table'

export default function FacultyPage() {
  const { profile, loading: authLoading } = useAuth()
  const searchParams = useSearchParams()

  const [faculty, setFaculty] = useState<FacultyRow[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(searchParams.get('message'))
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState<number | 'custom'>(10)
  const [customPageSize, setCustomPageSize] = useState('')
  const [filters, setFilters] = useState<FacultyFiltersType>({
    search: '',
    status: '',
    specialization: '',
  })

  const resolvedPageSize = useMemo(() => {
    if (pageSize === 'custom') {
      const parsed = Number(customPageSize)
      return Number.isFinite(parsed) && parsed > 0 ? parsed : 10
    }

    return pageSize
  }, [pageSize, customPageSize])

  const totalPages = Math.max(1, Math.ceil(faculty.length / resolvedPageSize))

  const paginatedFaculty = useMemo(() => {
    const start = (currentPage - 1) * resolvedPageSize
    return faculty.slice(start, start + resolvedPageSize)
  }, [faculty, currentPage, resolvedPageSize])

  const loadFaculty = useCallback(async () => {
    if (!profile?.branch_id) return

    setLoading(true)
    setError(null)

    const { data, error: fetchError } = await listFaculty(profile.branch_id, filters)

    setLoading(false)

    if (fetchError) {
      setError(fetchError instanceof Error ? fetchError.message : 'Failed to load faculty')
      return
    }

    setFaculty(data)
  }, [filters, profile?.branch_id])

  useEffect(() => {
    if (!authLoading && profile?.branch_id) {
      loadFaculty()
    }
  }, [authLoading, profile?.branch_id, loadFaculty])

  useEffect(() => {
    if (!successMessage) return
    const timer = setTimeout(() => setSuccessMessage(null), 3500)
    return () => clearTimeout(timer)
  }, [successMessage])

  useEffect(() => {
    setCurrentPage(1)
  }, [filters, resolvedPageSize])

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages)
    }
  }, [currentPage, totalPages])

  const renderPageButtons = () => {
    const maxButtons = 5
    const pages: number[] = []

    if (totalPages <= maxButtons) {
      for (let page = 1; page <= totalPages; page += 1) pages.push(page)
      return pages
    }

    const startPage = Math.max(1, currentPage - 2)
    const endPage = Math.min(totalPages, startPage + maxButtons - 1)
    const adjustedStart = Math.max(1, endPage - maxButtons + 1)

    for (let page = adjustedStart; page <= endPage; page += 1) pages.push(page)
    return pages
  }

  if (authLoading) {
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

  return (
    <SiteContainer className="space-y-6 py-8">
      <FacultyFilters branchId={profile?.branch_id} onFilterChange={setFilters} />

      {successMessage && (
        <div className="rounded-md border border-green-500/50 bg-green-500/10 p-4 text-sm text-green-700">
          {successMessage}
        </div>
      )}

      <Card>
        <CardContent className="flex flex-col gap-4 py-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-center gap-3">
            <label className="text-sm font-medium" htmlFor="faculty-page-size-select">
              Rows per page
            </label>

            <select
              id="faculty-page-size-select"
              className="h-10 rounded-md border border-input bg-background px-3 text-sm"
              value={pageSize}
              onChange={(e) => {
                const value = e.target.value
                if (value === 'custom') {
                  setPageSize('custom')
                  return
                }
                setPageSize(Number(value))
              }}
            >
              <option value={10}>10</option>
              <option value={20}>20</option>
              <option value={50}>50</option>
              <option value={100}>100</option>
              <option value="custom">Custom</option>
            </select>

            {pageSize === 'custom' && (
              <input
                type="number"
                min={1}
                className="h-10 w-28 rounded-md border border-input bg-background px-3 text-sm"
                placeholder="Rows"
                value={customPageSize}
                onChange={(e) => setCustomPageSize(e.target.value)}
              />
            )}
          </div>

          <div className="text-sm text-muted-foreground">
            Showing {paginatedFaculty.length} of {faculty.length} faculty member(s)
          </div>
        </CardContent>
      </Card>

      {error && (
        <div className="rounded-md border border-destructive/50 bg-destructive/10 p-4 text-sm text-destructive">
          {error}
        </div>
      )}

      {loading ? (
        <div className="flex min-h-[400px] items-center justify-center">
          <div className="text-center">
            <div className="mx-auto mb-4 h-10 w-10 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
            <p className="text-muted-foreground">Loading faculty...</p>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="max-h-[65vh] overflow-auto rounded-lg border bg-card">
            <FacultyListTable
              faculty={paginatedFaculty}
              totalCount={faculty.length}
              onFacultyDeleted={loadFaculty}
              canManage={canManageFaculty(profile?.role_id, profile?.role_name)}
            />
          </div>

          {faculty.length > 0 && (
            <div className="flex flex-wrap items-center justify-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(1)}
                disabled={currentPage === 1}
              >
                First
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage((page) => Math.max(1, page - 1))}
                disabled={currentPage === 1}
              >
                Prev
              </Button>

              {renderPageButtons().map((pageNumber) => (
                <Button
                  key={pageNumber}
                  variant={currentPage === pageNumber ? 'primary' : 'outline'}
                  size="sm"
                  onClick={() => setCurrentPage(pageNumber)}
                >
                  {pageNumber}
                </Button>
              ))}

              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage((page) => Math.min(totalPages, page + 1))}
                disabled={currentPage === totalPages}
              >
                Next
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(totalPages)}
                disabled={currentPage === totalPages}
              >
                Last
              </Button>
            </div>
          )}
        </div>
      )}
    </SiteContainer>
  )
}
