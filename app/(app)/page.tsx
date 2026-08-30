'use client'

import { useState, useEffect, useCallback } from 'react'
import { useSession } from 'next-auth/react'
import Image from 'next/image'
import { Search, ChefHat } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { RecipeCard } from '@/components/recipe/recipe-card'
import { RecipeGridSkeleton } from '@/components/recipe/recipe-card-skeleton'
import { FilterPanel, type Filters } from '@/components/recipe/filter-panel'
import type { RecipeSearchResult, RandomRecipe } from '@/lib/spoonacular'

export default function HomePage() {
  const { data: session } = useSession()
  const [query, setQuery] = useState('')
  const [filters, setFilters] = useState<Filters>({ diet: '', cuisine: '', type: '', maxTime: '' })
  const [recipes, setRecipes] = useState<RecipeSearchResult[]>([])
  const [favouriteIds, setFavouriteIds] = useState<Set<number>>(new Set())
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [searched, setSearched] = useState(false)
  const [heroImages, setHeroImages] = useState<RandomRecipe[]>([])

  useEffect(() => {
    fetch('/api/random?number=3')
      .then((r) => r.json())
      .then((data: { recipes: RandomRecipe[] }) => setHeroImages(data.recipes ?? []))
      .catch(() => {})
  }, [])

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
    <div className="max-w-6xl mx-auto px-5 py-12">
      <div className="text-center mb-10">
        <h1 className="font-sans font-extrabold text-4xl sm:text-5xl text-foreground tracking-tight mb-3 leading-tight">
          Find your next recipe
        </h1>
        <p className="text-muted-foreground text-lg">
          Search by ingredient, craving, or cuisine. Then save, plan, and shop.
        </p>
      </div>

      <div className="relative">
        {heroImages.length > 0 ? (
          <div className="grid grid-cols-[1.3fr_1fr_1fr] gap-4 h-56 sm:h-72 rounded-3xl overflow-hidden">
            {heroImages.map((r) => (
              <div key={r.id} className="relative h-full w-full">
                <Image
                  src={r.image}
                  alt={r.title}
                  fill
                  sizes="(max-width: 640px) 33vw, 400px"
                  className="object-cover"
                  priority
                />
              </div>
            ))}
          </div>
        ) : (
          <div className="h-56 sm:h-72 rounded-3xl bg-muted animate-pulse" />
        )}

        <div className="relative -mt-7 sm:-mt-9 flex justify-center px-4">
          <div className="flex items-center gap-2 w-full max-w-xl bg-[var(--glass-bg-strong)] backdrop-blur-xl backdrop-saturate-150 border border-[var(--glass-border)] rounded-full py-1.5 pl-5 pr-1.5 shadow-[var(--shadow-lg)]">
            <Search className="h-4 w-4 text-muted-foreground shrink-0" strokeWidth={1.5} />
            <Input
              type="text"
              placeholder="Search for pasta, tacos, salad..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="border-0 bg-transparent shadow-none h-9 text-base focus-visible:ring-0 px-1"
            />
            <Button
              size="sm"
              className="shrink-0"
              onClick={() => doSearch(query, filters)}
            >
              Search
            </Button>
          </div>
        </div>
      </div>

      <div className="flex justify-center mt-10 mb-2">
        <FilterPanel filters={filters} onChange={setFilters} />
      </div>

      <div className="mt-6">
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
          <div className="text-center mt-16 space-y-3">
            <ChefHat className="h-10 w-10 text-muted-foreground/40 mx-auto" strokeWidth={1} />
            <p className="text-foreground text-base font-medium">Start typing to discover recipes</p>
            <p className="text-muted-foreground text-sm">Use filters to narrow results by diet, cuisine, or time.</p>
          </div>
        )}
      </div>
    </div>
  )
}
