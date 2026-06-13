'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useSession, signOut } from 'next-auth/react'
import { ChefHat, LogOut } from 'lucide-react'
import { buttonVariants } from '@/components/ui/button'
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
  { href: '/shopping-list', label: 'Shopping list' },
  { href: '/meal-planner', label: 'Meal planner' },
]

export default function Header() {
  const pathname = usePathname()
  const { data: session } = useSession()

  return (
    <header className="sticky top-0 z-50 border-b border-border/60 bg-background/80 backdrop-blur-md">
      <div className="max-w-6xl mx-auto px-5 h-14 flex items-center gap-4">
        <Link href="/" className="flex items-center gap-2 shrink-0">
          <ChefHat className="h-5 w-5 text-primary" strokeWidth={2} />
          <span className="font-serif font-medium text-base text-foreground hidden sm:inline tracking-tight">
            Recipe Finder
          </span>
        </Link>

        <nav className="hidden sm:flex items-center gap-0.5 flex-1">
          {NAV_LINKS.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              className={cn(
                'px-3 py-1.5 rounded-md text-sm transition-colors duration-[140ms]',
                pathname === href
                  ? 'text-primary font-medium'
                  : 'text-muted-foreground hover:text-foreground hover:bg-secondary'
              )}
            >
              {label}
            </Link>
          ))}
        </nav>

        <div className="ml-auto flex items-center gap-2">
          {session ? (
            <DropdownMenu>
              <DropdownMenuTrigger className="flex items-center rounded-full outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background">
                <Avatar className="h-8 w-8">
                  <AvatarImage
                    src={session.user?.image ?? undefined}
                    alt={session.user?.name ?? 'User'}
                  />
                  <AvatarFallback className="bg-secondary text-foreground text-xs font-medium">
                    {session.user?.name?.[0]?.toUpperCase() ?? 'U'}
                  </AvatarFallback>
                </Avatar>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <div className="px-2 py-1.5 text-sm">
                  <p className="font-medium text-foreground">{session.user?.name}</p>
                  <p className="text-muted-foreground text-xs">{session.user?.email}</p>
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => signOut({ callbackUrl: '/' })}
                  className="text-destructive focus:text-destructive"
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
