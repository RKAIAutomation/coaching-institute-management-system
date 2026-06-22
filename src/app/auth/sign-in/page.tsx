'use client'

import { useState } from 'react'
import type { FormEvent } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { SiteContainer, SiteShell } from '@/components/site-shell'
import { signInWithEmail } from '@/lib/auth'

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export default function SignIn() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  async function handleSignIn(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError('')
    setSuccess('')

    if (!emailPattern.test(email.trim())) {
      setError('Please enter a valid email address.')
      return
    }

    if (password.trim().length < 8) {
      setError('Password must be at least 8 characters long.')
      return
    }

    setLoading(true)

    try {
      const { data, error: authError } = await signInWithEmail(email.trim(), password)

      if (authError) {
        const authErrorDetails = authError as {
          message: string
          details?: string
          hint?: string
          status?: number
        }

        const authMessage = [
          authErrorDetails.message,
          authErrorDetails.details,
          authErrorDetails.hint,
          authErrorDetails.status ? `status: ${authErrorDetails.status}` : null,
        ]
          .filter(Boolean)
          .join(' - ')

        setError(
          authMessage ||
            `Sign in failed. ${JSON.stringify(authError, null, 2)}`,
        )
        return
      }

      if (data?.session?.user) {
        setSuccess('Login successful, redirecting...')
        setTimeout(() => {
          router.push('/dashboard')
        }, 1000)
      } else {
        setError('Sign in failed. Please try again.')
      }
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'An unexpected error occurred.',
      )
    } finally {
      setLoading(false)
    }
  }

  return (
    <SiteShell>
      <SiteContainer className="py-20 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Sign In</CardTitle>
            <CardDescription>Enter your email and password to sign in</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSignIn} className="space-y-4">
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

              <div>
                <label className="block text-sm font-medium mb-1">Password</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full px-3 py-2 border border-input rounded-md bg-background text-foreground"
                  placeholder="••••••••"
                />
              </div>

              <Button type="submit" className="w-full" isLoading={loading}>
                Sign In
              </Button>
            </form>

            <div className="mt-4 text-sm text-center space-y-2">
              <p>
                <Link href="/auth/forgot-password" className="text-primary hover:underline">
                  Forgot password?
                </Link>
              </p>
              <p>
                Don&apos;t have an account?{' '}
                <Link href="/auth/sign-up" className="text-primary hover:underline">
                  Sign up
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>
      </SiteContainer>
    </SiteShell>
  )
}
