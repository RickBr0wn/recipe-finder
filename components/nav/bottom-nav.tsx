'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { ChefHat, Heart, ShoppingCart, CalendarDays } from 'lucide-react'
import { cn } from '@/lib/utils'

const NAV_ITEMS = [
  { href: '/', label: 'Search', icon: ChefHat },
  { href: '/favourites', label: 'Favourites', icon: Heart },
  { href: '/shopping-list', label: 'List', icon: ShoppingCart },
  { href: '/meal-planner', label: 'Planner', icon: CalendarDays },
]

export default function BottomNav() {
  const pathname = usePathname()

  return (
    <nav className="sm:hidden fixed bottom-0 left-0 right-0 z-50 border-t bg-background/95 backdrop-blur">
      <div className="grid grid-cols-4 h-16">
        {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
          const active = pathname === href
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                'flex flex-col items-center justify-center gap-1 text-xs transition-colors',
                active ? 'text-primary' : 'text-muted-foreground'
              )}
            >
              <Icon className={cn('h-5 w-5', active && 'stroke-[2.5]')} />
              <span>{label}</span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
