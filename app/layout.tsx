import type { Metadata } from 'next'
import { Geist } from 'next/font/google'
import './globals.css'
import { cn } from '@/lib/utils'
import { SessionProvider } from 'next-auth/react'
import { ThemeProvider } from 'next-themes'
import { Toaster } from '@/components/ui/sonner'
import { auth } from '@/lib/auth'

const geist = Geist({ subsets: ['latin'], variable: '--font-sans' })

export const metadata: Metadata = {
  title: 'Recipe Finder',
  description:
    'Find the perfect recipe for any occasion. Search by ingredients, cuisine, dietary needs, and more.',
}

export default async function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const session = await auth()
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={cn('font-sans', geist.variable)}
    >
      <body className={cn(geist.variable, 'antialiased')}>
        <SessionProvider session={session}>
          <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
            {children}
            <Toaster richColors position="top-right" />
          </ThemeProvider>
        </SessionProvider>
      </body>
    </html>
  )
}
