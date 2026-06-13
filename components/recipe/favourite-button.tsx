'use client'

import { useState } from 'react'
import { Heart } from 'lucide-react'
import { useSession } from 'next-auth/react'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'

interface FavouriteButtonProps {
  recipeId: number
  recipeTitle: string
  recipeImage?: string
  readyInMinutes?: number
  servings?: number
  diets?: string[]
  initialFavourited?: boolean
  className?: string
}

export function FavouriteButton({
  recipeId,
  recipeTitle,
  recipeImage,
  readyInMinutes,
  servings,
  diets = [],
  initialFavourited = false,
  className,
}: FavouriteButtonProps) {
  const { data: session } = useSession()
  const [favourited, setFavourited] = useState(initialFavourited)
  const [loading, setLoading] = useState(false)

  async function toggle(e: React.MouseEvent) {
    e.preventDefault()
    e.stopPropagation()

    if (!session) {
      toast.error('Sign in to save favourites')
      return
    }

    setLoading(true)
    const prev = favourited
    setFavourited(!prev)

    try {
      if (prev) {
        const res = await fetch(`/api/favourites?recipeId=${recipeId}`, { method: 'DELETE' })
        if (!res.ok) throw new Error('Failed')
        toast.success('Removed from favourites')
      } else {
        const res = await fetch('/api/favourites', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ recipeId, recipeTitle, recipeImage, readyInMinutes, servings, diets }),
        })
        if (!res.ok) throw new Error('Failed')
        toast.success('Saved to favourites')
      }
    } catch {
      setFavourited(prev)
      toast.error('Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  return (
    <button
      onClick={toggle}
      disabled={loading}
      aria-label={favourited ? 'Remove from favourites' : 'Save to favourites'}
      className={cn(
        'flex items-center justify-center h-8 w-8 rounded-full bg-background/80 backdrop-blur border shadow-sm transition-colors hover:bg-background',
        loading && 'opacity-50 cursor-not-allowed',
        className
      )}
    >
      <Heart
        className={cn('h-4 w-4 transition-colors', favourited ? 'fill-red-500 text-red-500' : 'text-muted-foreground')}
      />
    </button>
  )
}
