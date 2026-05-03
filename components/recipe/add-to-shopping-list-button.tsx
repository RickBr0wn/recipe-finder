'use client'

import { useState } from 'react'
import { ShoppingCart } from 'lucide-react'
import { useSession } from 'next-auth/react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'

interface Ingredient {
  name: string
  amount: string
  unit: string
}

interface AddToShoppingListButtonProps {
  recipeId: number
  recipeName: string
  ingredients: Ingredient[]
}

export function AddToShoppingListButton({ recipeId, recipeName, ingredients }: AddToShoppingListButtonProps) {
  const { data: session } = useSession()
  const [loading, setLoading] = useState(false)

  async function addAll() {
    if (!session) {
      toast.error('Sign in to use the shopping list')
      return
    }
    setLoading(true)
    try {
      await fetch('/api/shopping-list', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: ingredients.map((i) => ({
            name: i.name,
            amount: i.amount,
            unit: i.unit,
            recipeId,
            recipeName,
          })),
        }),
      })
      toast.success(`Added ${ingredients.length} ingredients to your list`, {
        action: { label: 'View list', onClick: () => window.location.href = '/shopping-list' },
      })
    } catch {
      toast.error('Failed to add ingredients')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Button variant="outline" size="sm" onClick={addAll} disabled={loading} className="gap-1.5">
      <ShoppingCart className="h-4 w-4" />
      Add to list
    </Button>
  )
}
