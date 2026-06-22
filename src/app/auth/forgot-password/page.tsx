'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { SiteContainer, SiteShell } from '@/components/site-shell'
import { resetPassword } from '@/lib/auth'

export default function ForgotPassword() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  async function handleResetPassword(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setSuccess('')
    setLoading(true)

    try {
      const { error: authError } = await resetPassword(email)
      if (authError) {
        setError(authError.message)
      } else {
        setSuccess('Check your email for password reset instructions')
        setEmail('')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  return (
    <SiteShell>
      <SiteContainer className="py-20 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Forgot Password</CardTitle>
            <CardDescription>Enter your email to receive password reset instructions</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleResetPassword} className="space-y-4">
              {error && <div className="p-3 bg-destructive/10 text-destructive rounded text-sm">{error}</div>}
              {success && <div className="p-3 bg-green-600/10 text-green-600 rounded text-sm">{success}</div>}

              <div>
                <label className="block text-sm font-medium mb-1">Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full px-3 py-2 border border-input rounded-md bg-background text-foreground"
                  placeholder="you@example.com"
                />
              </div>

              <Button type="submit" className="w-full" isLoading={loading}>
                Send Reset Link
              </Button>
            </form>

            <p className="mt-4 text-sm text-center space-y-2">
              <p>
                Remember your password?{' '}
                <Link href="/auth/sign-in" className="text-primary hover:underline">
                  Sign in
                </Link>
              </p>
              <p>
                  Don&apos;t have an account?{' '}
                <Link href="/auth/sign-up" className="text-primary hover:underline">
                  Sign up
                </Link>
              </p>
            </p>
          </CardContent>
        </Card>
      </SiteContainer>
    </SiteShell>
  )
}
