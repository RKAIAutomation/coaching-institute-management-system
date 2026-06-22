import type { Metadata } from 'next'
import './globals.css'


export const metadata: Metadata = {
  title: 'Coaching Institute Management System',
  description: 'Enterprise-grade management system for coaching institutes',
}

export const viewport = {
  width: 'device-width',
  initialScale: 1,
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="bg-background text-foreground">{children}</body>
    </html>
  )
}
