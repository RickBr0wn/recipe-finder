'use client'

import { useState, useEffect, useCallback } from 'react'
import { useSession } from 'next-auth/react'
import { Search } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { RecipeCard } from '@/components/recipe/recipe-card'
import { RecipeGridSkeleton } from '@/components/recipe/recipe-card-skeleton'
import { FilterPanel, type Filters } from '@/components/recipe/filter-panel'
import type { RecipeSearchResult } from '@/lib/spoonacular'

export default function HomePage() {
  const { data: session } = useSession()
  const [query, setQuery] = useState('')
  const [filters, setFilters] = useState<Filters>({ diet: '', cuisine: '', type: '', maxTime: '' })
  const [recipes, setRecipes] = useState<RecipeSearchResult[]>([])
  const [favouriteIds, setFavouriteIds] = useState<Set<number>>(new Set())
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [searched, setSearched] = useState(false)

  useEffect(() => {
    if (!session?.user?.id) return
    fetch('/api/favourites')
      .then((r) => r.json())
      .then((data: { recipeId: number }[]) => {
        if (Array.isArray(data)) setFavouriteIds(new Set(data.map((f) => f.recipeId)))
      })
      .catch(() => {})
  }, [session?.user?.id])

  const doSearch = useCallback(async (q: string, f: Filters) => {
    if (!q.trim()) {
      setRecipes([])
      setSearched(false)
      return
    }
    setLoading(true)
    setError('')
    setSearched(true)
    try {
      const params = new URLSearchParams({ q })
      if (f.diet) params.set('diet', f.diet)
      if (f.cuisine) params.set('cuisine', f.cuisine)
      if (f.type) params.set('type', f.type)
      if (f.maxTime) params.set('maxTime', f.maxTime)
      const res = await fetch(`/api/search?${params}`)
      if (!res.ok) throw new Error('Failed')
      const data = await res.json()
      setRecipes(data.results ?? [])
    } catch {
      setError('Failed to fetch recipes. Please try again.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    const timer = setTimeout(() => doSearch(query, filters), 350)
    return () => clearTimeout(timer)
  }, [query, filters, doSearch])

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="text-center mb-10">
        <h1 className="text-4xl font-extrabold tracking-tight mb-3">Find your next recipe</h1>
        <p className="text-muted-foreground text-lg">
          Search by ingredient, craving, or cuisine — then save, plan, and shop.
        </p>
      </div>

      <div className="space-y-3 mb-8">
        <div className="relative max-w-2xl mx-auto">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Search for pasta, tacos, salad..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="pl-10 h-11 text-base rounded-xl"
          />
        </div>
        <div className="flex justify-center">
          <FilterPanel filters={filters} onChange={setFilters} />
        </div>
      </div>

      {loading && <RecipeGridSkeleton />}

      {!loading && error && (
        <p className="text-center text-destructive mt-8">{error}</p>
      )}

      {!loading && !error && recipes.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {recipes.map((recipe) => (
            <RecipeCard
              key={recipe.id}
              recipe={recipe}
              isFavourited={favouriteIds.has(recipe.id)}
            />
          ))}
        </div>
      )}

      {!loading && !error && searched && recipes.length === 0 && (
        <div className="text-center mt-20">
          <p className="text-muted-foreground text-lg">No recipes found for &quot;{query}&quot;</p>
          <p className="text-muted-foreground text-sm mt-1">Try adjusting the filters or a different search.</p>
        </div>
      )}

      {!searched && !loading && (
        <div className="text-center mt-20 text-muted-foreground space-y-2">
          <div className="text-5xl">🍽️</div>
          <p className="text-lg font-medium">Start typing to discover recipes</p>
          <p className="text-sm">Use filters to narrow results by diet, cuisine, or time</p>
        </div>
      )}
    </div>
  )
}
