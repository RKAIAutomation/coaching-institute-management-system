import Link from 'next/link'
import { SiteShell, SiteContainer } from '@/components/site-shell'
import { Button } from '@/components/ui/button'

export default function Home() {
  return (
    <SiteShell>
      <div className="min-h-screen flex flex-col">
        {/* Header */}
        <header className="border-b border-border">
          <SiteContainer className="py-4 flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold">CIMS</h1>
              <p className="text-muted-foreground text-sm">Coaching Institute Management System</p>
            </div>
            <div className="flex gap-2">
              <Link href="/auth/sign-in">
                <Button variant="outline">Sign In</Button>
              </Link>
              <Link href="/auth/sign-up">
                <Button>Sign Up</Button>
              </Link>
            </div>
          </SiteContainer>
        </header>

        {/* Hero Section */}
        <main className="flex-1 flex items-center">
          <SiteContainer className="py-20 text-center">
            <h2 className="text-4xl font-bold mb-4">Welcome to CIMS</h2>
            <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
              A comprehensive management system for coaching institutes. Manage students, faculty,
              batches, attendance, finances, and exams all in one place.
            </p>
            <div className="flex gap-4 justify-center">
              <Link href="/dashboard">
                <Button size="lg">Go to Dashboard</Button>
              </Link>
              <Link href="/auth/sign-in">
                <Button variant="outline" size="lg">
                  Sign In
                </Button>
              </Link>
            </div>
          </SiteContainer>
        </main>

        {/* Footer */}
        <footer className="border-t border-border">
          <SiteContainer className="py-4 text-center text-sm text-muted-foreground">
            <p>&copy; 2024 Coaching Institute Management System. All rights reserved.</p>
          </SiteContainer>
        </footer>
      </div>
    </SiteShell>
  )
}
