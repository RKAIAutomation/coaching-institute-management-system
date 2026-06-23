'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { getFacultySpecializations } from '@/lib/faculty'

export interface FacultyFilters {
  search: string
  status: string
  specialization: string
}

interface FacultyFiltersProps {
  branchId?: string
  onFilterChange: (filters: FacultyFilters) => void
}

export function FacultyFilters({ branchId, onFilterChange }: FacultyFiltersProps) {
  const [specializations, setSpecializations] = useState<string[]>([])
  const [filters, setFilters] = useState<FacultyFilters>({
    search: '',
    status: '',
    specialization: '',
  })

  useEffect(() => {
    const loadSpecializations = async () => {
      const { data } = await getFacultySpecializations(branchId)
      setSpecializations(data)
    }

    loadSpecializations()
  }, [branchId])

  const handleChange = (key: keyof FacultyFilters, value: string) => {
    const nextFilters = { ...filters, [key]: value }
    setFilters(nextFilters)
    onFilterChange(nextFilters)
  }

  const handleReset = () => {
    const resetFilters: FacultyFilters = {
      search: '',
      status: '',
      specialization: '',
    }

    setFilters(resetFilters)
    onFilterChange(resetFilters)
  }

  return (
    <Card>
      <CardContent className="pt-6">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
          <div>
            <label className="mb-2 block text-sm font-medium">Search</label>
            <input
              type="text"
              placeholder="Code, name, email..."
              value={filters.search}
              onChange={(e) => handleChange('search', e.target.value)}
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium">Status</label>
            <select
              value={filters.status}
              onChange={(e) => handleChange('status', e.target.value)}
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground"
            >
              <option value="">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="on_leave">On Leave</option>
            </select>
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium">Specialization</label>
            <select
              value={filters.specialization}
              onChange={(e) => handleChange('specialization', e.target.value)}
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground"
            >
              <option value="">All Specializations</option>
              {specializations.map((specialization) => (
                <option key={specialization} value={specialization}>
                  {specialization}
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
