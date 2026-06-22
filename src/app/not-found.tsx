import Link from 'next/link'
import { SiteContainer, SiteShell } from '@/components/site-shell'
import { Button } from '@/components/ui/button'

export default function NotFound() {
  return (
    <SiteShell>
      <SiteContainer className="py-20 text-center">
        <h1 className="text-4xl font-bold mb-4">404 - Page Not Found</h1>
        <p className="text-lg text-muted-foreground mb-8">
          The page you are looking for does not exist.
        </p>
        <Link href="/">
          <Button>Go Home</Button>
        </Link>
      </SiteContainer>
    </SiteShell>
  )
}
