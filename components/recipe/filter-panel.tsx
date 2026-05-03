'use client'

import { SlidersHorizontal, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet'
import { Badge } from '@/components/ui/badge'

export interface Filters {
  diet: string
  cuisine: string
  type: string
  maxTime: string
}

const DIETS = ['vegetarian', 'vegan', 'gluten free', 'ketogenic', 'paleo', 'whole30']
const CUISINES = ['italian', 'mexican', 'asian', 'mediterranean', 'american', 'french', 'indian', 'thai']
const TYPES = ['breakfast', 'lunch', 'dinner', 'dessert', 'snack', 'soup', 'salad']
const TIMES = [
  { label: 'Under 15 min', value: '15' },
  { label: 'Under 30 min', value: '30' },
  { label: 'Under 45 min', value: '45' },
  { label: 'Under 60 min', value: '60' },
]

interface FilterPanelProps {
  filters: Filters
  onChange: (filters: Filters) => void
}

function activeCount(filters: Filters) {
  return [filters.diet, filters.cuisine, filters.type, filters.maxTime].filter(Boolean).length
}

function FilterSelect({
  label,
  options,
  value,
  onChange,
}: {
  label: string
  options: { label: string; value: string }[] | string[]
  value: string
  onChange: (v: string) => void
}) {
  const normalised = options.map((o) =>
    typeof o === 'string' ? { label: o, value: o } : o
  )
  return (
    <div className="space-y-2">
      <Label className="text-sm font-medium capitalize">{label}</Label>
      <div className="flex flex-wrap gap-1.5">
        {normalised.map(({ label: l, value: v }) => (
          <button
            key={v}
            onClick={() => onChange(value === v ? '' : v)}
            className={`px-2.5 py-1 rounded-full text-xs border transition-colors capitalize ${
              value === v
                ? 'bg-primary text-primary-foreground border-primary'
                : 'border-border hover:border-primary/50 hover:bg-muted'
            }`}
          >
            {l}
          </button>
        ))}
      </div>
    </div>
  )
}

export function FilterPanel({ filters, onChange }: FilterPanelProps) {
  const count = activeCount(filters)
  const clear = () => onChange({ diet: '', cuisine: '', type: '', maxTime: '' })

  const panel = (
    <div className="space-y-6 p-1">
      <FilterSelect
        label="Diet"
        options={DIETS}
        value={filters.diet}
        onChange={(v) => onChange({ ...filters, diet: v })}
      />
      <FilterSelect
        label="Cuisine"
        options={CUISINES}
        value={filters.cuisine}
        onChange={(v) => onChange({ ...filters, cuisine: v })}
      />
      <FilterSelect
        label="Meal type"
        options={TYPES}
        value={filters.type}
        onChange={(v) => onChange({ ...filters, type: v })}
      />
      <FilterSelect
        label="Max time"
        options={TIMES}
        value={filters.maxTime}
        onChange={(v) => onChange({ ...filters, maxTime: v })}
      />
      {count > 0 && (
        <Button variant="ghost" size="sm" onClick={clear} className="w-full gap-1">
          <X className="h-3 w-3" /> Clear filters
        </Button>
      )}
    </div>
  )

  return (
    <>
      {/* Mobile — Sheet */}
      <div className="sm:hidden">
        <Sheet>
          <SheetTrigger className="flex items-center gap-1.5 px-3 py-2 rounded-lg border text-sm font-medium hover:bg-muted transition-colors">
            <SlidersHorizontal className="h-4 w-4" />
            Filters
            {count > 0 && (
              <Badge className="h-4 w-4 p-0 flex items-center justify-center text-[10px]">
                {count}
              </Badge>
            )}
          </SheetTrigger>
          <SheetContent side="bottom" className="max-h-[80vh] overflow-y-auto rounded-t-2xl">
            <SheetHeader>
              <SheetTitle>Filters</SheetTitle>
            </SheetHeader>
            <div className="mt-4">{panel}</div>
          </SheetContent>
        </Sheet>
      </div>

      {/* Desktop — inline */}
      <div className="hidden sm:block">
        <div className="flex items-center gap-2 flex-wrap">
          <SlidersHorizontal className="h-4 w-4 text-muted-foreground shrink-0" />
          {['diet', 'cuisine', 'type'].map((key) => {
            const k = key as keyof Filters
            return filters[k] ? (
              <button
                key={key}
                onClick={() => onChange({ ...filters, [k]: '' })}
                className="flex items-center gap-1 px-2.5 py-1 rounded-full text-xs bg-primary text-primary-foreground"
              >
                {filters[k]}
                <X className="h-3 w-3" />
              </button>
            ) : null
          })}
          {filters.maxTime && (
            <button
              onClick={() => onChange({ ...filters, maxTime: '' })}
              className="flex items-center gap-1 px-2.5 py-1 rounded-full text-xs bg-primary text-primary-foreground"
            >
              ≤{filters.maxTime}min
              <X className="h-3 w-3" />
            </button>
          )}

          <div className="flex gap-1 ml-2">
            {DIETS.slice(0, 4).map((d) => (
              <button
                key={d}
                onClick={() => onChange({ ...filters, diet: filters.diet === d ? '' : d })}
                className={`px-2.5 py-1 rounded-full text-xs border capitalize transition-colors ${
                  filters.diet === d
                    ? 'bg-primary text-primary-foreground border-primary'
                    : 'border-border hover:bg-muted'
                }`}
              >
                {d}
              </button>
            ))}
            <Sheet>
              <SheetTrigger className="px-2.5 py-1 rounded-full text-xs border border-dashed hover:bg-muted transition-colors">
                More...
              </SheetTrigger>
              <SheetContent side="right" className="overflow-y-auto">
                <SheetHeader>
                  <SheetTitle>Filters</SheetTitle>
                </SheetHeader>
                <div className="mt-4">{panel}</div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </>
  )
}
