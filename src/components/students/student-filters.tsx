'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { getBatches } from '@/lib/students'

interface StudentFiltersProps {
  onFilterChange: (filters: StudentFilters) => void
}

export interface StudentFilters {
  search: string
  status: string
  batch_id: string
}

export function StudentFilters({ onFilterChange }: StudentFiltersProps) {
  const [batches, setBatches] = useState<Array<{ id: string; name: string }>>([])
  const [filters, setFilters] = useState<StudentFilters>({
    search: '',
    status: '',
    batch_id: '',
  })

  useEffect(() => {
    const loadBatches = async () => {
      const { data } = await getBatches()
      setBatches(data)
    }
    loadBatches()
  }, [])

  const handleChange = (key: keyof StudentFilters, value: string) => {
    const newFilters = { ...filters, [key]: value }
    setFilters(newFilters)
    onFilterChange(newFilters)
  }

  const handleReset = () => {
    const emptyFilters: StudentFilters = {
      search: '',
      status: '',
      batch_id: '',
    }
    setFilters(emptyFilters)
    onFilterChange(emptyFilters)
  }

  return (
    <Card>
      <CardContent className="pt-6">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
          <div>
            <label className="block text-sm font-medium mb-2">Search</label>
            <input
              type="text"
              placeholder="Name, email, phone..."
              value={filters.search}
              onChange={(e) => handleChange('search', e.target.value)}
              className="w-full px-3 py-2 border border-input rounded-md bg-background text-foreground text-sm"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Status</label>
            <select
              value={filters.status}
              onChange={(e) => handleChange('status', e.target.value)}
              className="w-full px-3 py-2 border border-input rounded-md bg-background text-foreground text-sm"
            >
              <option value="">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="graduated">Graduated</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Batch</label>
            <select
              value={filters.batch_id}
              onChange={(e) => handleChange('batch_id', e.target.value)}
              className="w-full px-3 py-2 border border-input rounded-md bg-background text-foreground text-sm"
            >
              <option value="">All Batches</option>
              {batches.map((batch) => (
                <option key={batch.id} value={batch.id}>
                  {batch.name}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-end gap-2">
            <Button onClick={handleReset} variant="outline" className="w-full">
              Reset Filters
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
