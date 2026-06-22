'use client'

import { useAuth } from '@/lib/auth'
import { SiteContainer } from '@/components/site-shell'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { OverviewCard } from '@/components/dashboard/overview-card'

export default function Dashboard() {
  const { profile, loading, error, sessionUserId, profileQueryResult, rawError } = useAuth()

  if (loading) {
    return (
      <SiteContainer className="py-8">
        <div className="flex min-h-[60vh] items-center justify-center">
          <div className="text-center">
            <div className="animate-spin h-10 w-10 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading dashboard data...</p>
          </div>
        </div>
      </SiteContainer>
    )
  }

  if (error) {
    return (
      <SiteContainer className="py-8">
        <Card>
          <CardHeader>
            <CardTitle>Unable to load dashboard</CardTitle>
            <CardDescription>An error occurred while loading your profile.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <p className="text-sm text-destructive">{error.message}</p>
              {rawError && (
                <div className="rounded-md border border-destructive/20 bg-destructive/5 p-3 text-sm font-mono space-y-1">
                  <p className="font-semibold text-destructive">Supabase error details:</p>
                  <p>message: {rawError.message || 'N/A'}</p>
                  <p>details: {rawError.details || 'N/A'}</p>
                  <p>hint: {rawError.hint || 'N/A'}</p>
                  <p>code: {rawError.code || 'N/A'}</p>
                </div>
              )}
              <div className="rounded-md border border-border bg-background p-3 text-sm font-mono space-y-1">
                <p className="font-semibold">Debug info:</p>
                <p>sessionUserId: {sessionUserId || 'none'}</p>
                <p>query data: {profileQueryResult?.data ? JSON.stringify(profileQueryResult.data) : 'none'}</p>
                <p>query error: {profileQueryResult?.error ? JSON.stringify(profileQueryResult.error) : 'none'}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </SiteContainer>
    )
  }

  return (
    <SiteContainer className="py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Dashboard</h1>
        <p className="text-muted-foreground">Welcome to your dashboard</p>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <OverviewCard
          title="Total Students"
          value="1,234"
          description="Active students enrolled"
          trend={{ value: 12, isPositive: true }}
        />
        <OverviewCard
          title="Total Faculty"
          value="48"
          description="Active faculty members"
          trend={{ value: 5, isPositive: true }}
        />
        <OverviewCard
          title="Attendance Rate"
          value="94%"
          description="Average attendance this month"
          trend={{ value: 3, isPositive: true }}
        />
        <OverviewCard
          title="Pending Fees"
          value="₹2.5L"
          description="Amount pending collection"
          trend={{ value: 8, isPositive: false }}
        />
      </div>

      {/* Role-Specific Info */}
      <Card>
        <CardHeader>
          <CardTitle>Your Role</CardTitle>
          <CardDescription>Role information and permissions</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-muted-foreground">Role</p>
              <p className="font-semibold">{profile?.role_name || 'N/A'}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Institute</p>
              <p className="font-semibold">{profile?.institute_name || 'N/A'}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Branch</p>
              <p className="font-semibold">{profile?.branch_name || 'N/A'}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Email</p>
              <p className="font-semibold text-sm">{profile?.email || 'N/A'}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Next Steps */}
      <Card className="mt-8">
        <CardHeader>
          <CardTitle>Getting Started</CardTitle>
          <CardDescription>Complete these steps to set up your system</CardDescription>
        </CardHeader>
        <CardContent>
          <ul className="space-y-3">
            <li className="flex items-start gap-3">
              <input type="checkbox" className="mt-1" disabled />
              <div>
                <p className="font-medium">Create institutes and branches</p>
                <p className="text-sm text-muted-foreground">Set up your organization structure</p>
              </div>
            </li>
            <li className="flex items-start gap-3">
              <input type="checkbox" className="mt-1" disabled />
              <div>
                <p className="font-medium">Add courses and subjects</p>
                <p className="text-sm text-muted-foreground">Define your curriculum</p>
              </div>
            </li>
            <li className="flex items-start gap-3">
              <input type="checkbox" className="mt-1" disabled />
              <div>
                <p className="font-medium">Enroll students and faculty</p>
                <p className="text-sm text-muted-foreground">Build your organization</p>
              </div>
            </li>
            <li className="flex items-start gap-3">
              <input type="checkbox" className="mt-1" disabled />
              <div>
                <p className="font-medium">Configure fee structures</p>
                <p className="text-sm text-muted-foreground">Set up billing and payments</p>
              </div>
            </li>
          </ul>
        </CardContent>
      </Card>
    </SiteContainer>
  )
}
