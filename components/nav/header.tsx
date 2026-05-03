'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useSession, signOut } from 'next-auth/react'
import { useTheme } from 'next-themes'
import { Sun, Moon, LogOut } from 'lucide-react'
import { Button, buttonVariants } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { cn } from '@/lib/utils'

const NAV_LINKS = [
  { href: '/', label: 'Search' },
  { href: '/favourites', label: 'Favourites' },
  { href: '/shopping-list', label: 'Shopping List' },
  { href: '/meal-planner', label: 'Meal Planner' },
]

export default function Header() {
  const pathname = usePathname()
  const { data: session } = useSession()
  const { theme, setTheme } = useTheme()

  return (
    <header className="sticky top-0 z-50 border-b bg-background/80 backdrop-blur">
      <div className="max-w-7xl mx-auto px-4 h-14 flex items-center gap-4">
        <Link href="/" className="flex items-center gap-2 font-bold text-lg shrink-0">
          <span className="text-2xl">🍽️</span>
          <span className="hidden sm:inline">Recipe Finder</span>
        </Link>

        <nav className="hidden sm:flex items-center gap-1 flex-1">
          {NAV_LINKS.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              className={cn(
                'px-3 py-1.5 rounded-md text-sm font-medium transition-colors',
                pathname === href
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:text-foreground hover:bg-muted'
              )}
            >
              {label}
            </Link>
          ))}
        </nav>

        <div className="ml-auto flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            aria-label="Toggle theme"
          >
            <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
            <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
          </Button>

          {session ? (
            <DropdownMenu>
              <DropdownMenuTrigger className="flex items-center rounded-full outline-none ring-offset-2 focus-visible:ring-2 focus-visible:ring-ring">
                <Avatar className="h-8 w-8">
                  <AvatarImage
                    src={session.user?.image ?? undefined}
                    alt={session.user?.name ?? 'User'}
                  />
                  <AvatarFallback>
                    {session.user?.name?.[0]?.toUpperCase() ?? 'U'}
                  </AvatarFallback>
                </Avatar>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <div className="px-2 py-1.5 text-sm">
                  <p className="font-medium">{session.user?.name}</p>
                  <p className="text-muted-foreground text-xs">{session.user?.email}</p>
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => signOut({ callbackUrl: '/' })}
                  className="text-destructive"
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  Sign out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Link href="/sign-in" className={buttonVariants({ size: 'sm' })}>
              Sign in
            </Link>
          )}
        </div>
      </div>
    </header>
  )
}
