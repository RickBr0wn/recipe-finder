'use client'

import Image from 'next/image'
import { Trash2 } from 'lucide-react'
import { useDroppable } from '@dnd-kit/core'
import { cn } from '@/lib/utils'

export type MealType = 'breakfast' | 'lunch' | 'dinner' | 'snack'
export const MEAL_TYPES: MealType[] = ['breakfast', 'lunch', 'dinner', 'snack']

export interface MealPlanItem {
  id: string
  recipeId: number
  recipeTitle: string
  recipeImage: string | null
  date: string
  mealType: string
}

interface DroppableCellProps {
  date: string
  mealType: MealType
  item?: MealPlanItem
  onRemove?: (id: string) => void
}

function DroppableCell({ date, mealType, item, onRemove }: DroppableCellProps) {
  const id = `${date}:${mealType}`
  const { isOver, setNodeRef } = useDroppable({ id })

  return (
    <div
      ref={setNodeRef}
      className={cn(
        'min-h-[80px] rounded-lg border-2 border-dashed p-1.5 transition-colors',
        isOver ? 'border-primary bg-primary/5' : 'border-border/50 bg-muted/30',
        item && 'border-solid border-border bg-card'
      )}
    >
      {item ? (
        <div className="relative group h-full">
          <div className="flex gap-2 items-start">
            {item.recipeImage && (
              <div className="relative h-12 w-12 rounded shrink-0 overflow-hidden">
                <Image src={item.recipeImage} alt={item.recipeTitle} fill sizes="48px" className="object-cover" />
              </div>
            )}
            <p className="text-xs font-medium leading-tight line-clamp-3 flex-1">{item.recipeTitle}</p>
          </div>
          <button
            onClick={() => onRemove?.(item.id)}
            className="absolute top-0 right-0 opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-destructive"
            aria-label="Remove"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        </div>
      ) : (
        <p className="text-[10px] text-muted-foreground/50 text-center mt-2">Drop recipe here</p>
      )}
    </div>
  )
}

interface WeeklyCalendarProps {
  weekDates: string[]
  items: MealPlanItem[]
  onRemove: (id: string) => void
}

const DAY_LABELS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

export function WeeklyCalendar({ weekDates, items, onRemove }: WeeklyCalendarProps) {
  const getItem = (date: string, mealType: string) =>
    items.find((i) => i.date === date && i.mealType === mealType)

  return (
    <div className="overflow-x-auto">
      <div className="min-w-[700px]">
        {/* Header row */}
        <div className="grid grid-cols-[80px_repeat(7,1fr)] gap-1 mb-2">
          <div />
          {weekDates.map((date, i) => {
            const d = new Date(date + 'T00:00:00')
            const isToday = date === new Date().toISOString().slice(0, 10)
            return (
              <div key={date} className="text-center">
                <p className="text-xs text-muted-foreground">{DAY_LABELS[i]}</p>
                <p className={cn('text-sm font-semibold', isToday && 'text-primary')}>{d.getDate()}</p>
              </div>
            )
          })}
        </div>

        {/* Meal rows */}
        {MEAL_TYPES.map((mealType) => (
          <div key={mealType} className="grid grid-cols-[80px_repeat(7,1fr)] gap-1 mb-1">
            <div className="flex items-center">
              <span className="text-xs capitalize text-muted-foreground font-medium">{mealType}</span>
            </div>
            {weekDates.map((date) => (
              <DroppableCell
                key={`${date}:${mealType}`}
                date={date}
                mealType={mealType}
                item={getItem(date, mealType)}
                onRemove={onRemove}
              />
            ))}
          </div>
        ))}
      </div>
    </div>
  )
}
