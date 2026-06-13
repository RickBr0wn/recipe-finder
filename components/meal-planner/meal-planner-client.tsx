'use client'

import { useState, useEffect, useCallback } from 'react'
import { DndContext, DragEndEvent, DragOverlay, DragStartEvent, PointerSensor, useSensor, useSensors } from '@dnd-kit/core'
import { ChevronLeft, ChevronRight, ShoppingCart, Search } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { WeeklyCalendar, type MealPlanItem, type MealType } from './weekly-calendar'
import { DraggableRecipe } from './draggable-recipe'
import type { RecipeSearchResult } from '@/lib/spoonacular'

interface MealPlannerClientProps {
  initialItems: MealPlanItem[]
  initialWeekStart: string
}

function getWeekDates(start: string): string[] {
  const dates: string[] = []
  const base = new Date(start + 'T00:00:00')
  for (let i = 0; i < 7; i++) {
    const d = new Date(base)
    d.setDate(d.getDate() + i)
    dates.push(d.toISOString().slice(0, 10))
  }
  return dates
}

function addWeeks(start: string, n: number): string {
  const d = new Date(start + 'T00:00:00')
  d.setDate(d.getDate() + n * 7)
  return d.toISOString().slice(0, 10)
}

function formatWeekLabel(start: string): string {
  const d = new Date(start + 'T00:00:00')
  const end = new Date(d)
  end.setDate(end.getDate() + 6)
  return `${d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })} – ${end.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}`
}

export function MealPlannerClient({ initialItems, initialWeekStart }: MealPlannerClientProps) {
  const [weekStart, setWeekStart] = useState(initialWeekStart)
  const [items, setItems] = useState<MealPlanItem[]>(initialItems)
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState<RecipeSearchResult[]>([])
  const [searching, setSearching] = useState(false)
  const [activeRecipe, setActiveRecipe] = useState<RecipeSearchResult | null>(null)

  const weekDates = getWeekDates(weekStart)

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } })
  )

  const doSearch = useCallback(async (q: string) => {
    if (!q.trim()) { setSearchResults([]); return }
    setSearching(true)
    try {
      const res = await fetch(`/api/search?q=${encodeURIComponent(q)}`)
      const data = await res.json()
      setSearchResults(data.results ?? [])
    } catch {
      toast.error('Search failed')
    } finally {
      setSearching(false)
    }
  }, [])

  useEffect(() => {
    const t = setTimeout(() => doSearch(searchQuery), 400)
    return () => clearTimeout(t)
  }, [searchQuery, doSearch])

  // Fetch meal plan for current week
  useEffect(() => {
    fetch(`/api/meal-plan?week=${weekStart}`)
      .then((r) => r.json())
      .then((data: MealPlanItem[]) => { if (Array.isArray(data)) setItems(data) })
      .catch(() => {})
  }, [weekStart])

  function handleDragStart(event: DragStartEvent) {
    const recipe = searchResults.find((r) => String(r.id) === event.active.id)
    setActiveRecipe(recipe ?? null)
  }

  async function handleDragEnd(event: DragEndEvent) {
    setActiveRecipe(null)
    const { active, over } = event
    if (!over) return

    const [date, mealType] = String(over.id).split(':')
    const recipe = searchResults.find((r) => String(r.id) === active.id)
    if (!recipe || !date || !mealType) return

    const payload = {
      recipeId: recipe.id,
      recipeTitle: recipe.title,
      recipeImage: recipe.image,
      date,
      mealType: mealType as MealType,
    }

    // Optimistic update
    const tempId = `temp-${Date.now()}`
    setItems((prev) => {
      const filtered = prev.filter((i) => !(i.date === date && i.mealType === mealType))
      return [...filtered, { id: tempId, ...payload, recipeImage: recipe.image }]
    })

    try {
      const res = await fetch('/api/meal-plan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      const saved = await res.json()
      setItems((prev) => prev.map((i) => (i.id === tempId ? saved : i)))
      toast.success(`Added to ${mealType}`)
    } catch {
      setItems((prev) => prev.filter((i) => i.id !== tempId))
      toast.error('Failed to save')
    }
  }

  async function handleRemove(id: string) {
    setItems((prev) => prev.filter((i) => i.id !== id))
    await fetch(`/api/meal-plan?id=${id}`, { method: 'DELETE' })
    toast.success('Removed from meal plan')
  }

  async function addWeekToShoppingList() {
    const weekItems = items.filter((i) => weekDates.includes(i.date))
    if (weekItems.length === 0) {
      toast.error('No meals planned this week')
      return
    }
    toast.info('Shopping list feature — add ingredients from meal plan coming soon!')
  }

  return (
    <DndContext sensors={sensors} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
          <div>
            <h1 className="font-serif font-medium text-3xl text-foreground tracking-tight">Meal planner</h1>
            <p className="text-muted-foreground text-sm mt-0.5">{formatWeekLabel(weekStart)}</p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="icon" onClick={() => setWeekStart(addWeeks(weekStart, -1))}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="sm" onClick={() => setWeekStart(initialWeekStart)}>
              This week
            </Button>
            <Button variant="outline" size="icon" onClick={() => setWeekStart(addWeeks(weekStart, 1))}>
              <ChevronRight className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="sm" onClick={addWeekToShoppingList} className="gap-1.5">
              <ShoppingCart className="h-4 w-4" />
              Add to list
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-6">
          {/* Recipe search sidebar */}
          <div className="lg:sticky lg:top-20 lg:h-[calc(100vh-6rem)] lg:overflow-y-auto space-y-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search recipes to drag..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
            {searching && <p className="text-xs text-muted-foreground text-center py-4">Searching...</p>}
            <div className="space-y-2">
              {searchResults.map((recipe) => (
                <DraggableRecipe key={recipe.id} recipe={recipe} />
              ))}
            </div>
            {!searching && searchQuery && searchResults.length === 0 && (
              <p className="text-xs text-muted-foreground text-center py-4">No results</p>
            )}
            {!searchQuery && (
              <p className="text-xs text-muted-foreground text-center py-8">
                Search for recipes above, then drag them onto the calendar
              </p>
            )}
          </div>

          {/* Calendar */}
          <div>
            <WeeklyCalendar weekDates={weekDates} items={items} onRemove={handleRemove} />
          </div>
        </div>
      </div>

      <DragOverlay>
        {activeRecipe && (
          <div className="flex items-center gap-2 p-2 rounded-lg border bg-card shadow-xl ring-2 ring-primary opacity-95 max-w-[200px]">
            <p className="text-sm font-medium line-clamp-2">{activeRecipe.title}</p>
          </div>
        )}
      </DragOverlay>
    </DndContext>
  )
}
