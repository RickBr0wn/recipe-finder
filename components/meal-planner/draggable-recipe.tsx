'use client'

import Image from 'next/image'
import { useDraggable } from '@dnd-kit/core'
import { CSS } from '@dnd-kit/utilities'
import { cn } from '@/lib/utils'
import type { RecipeSearchResult } from '@/lib/spoonacular'

interface DraggableRecipeProps {
  recipe: RecipeSearchResult
}

export function DraggableRecipe({ recipe }: DraggableRecipeProps) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: String(recipe.id),
    data: {
      recipeId: recipe.id,
      recipeTitle: recipe.title,
      recipeImage: recipe.image,
    },
  })

  return (
    <div
      ref={setNodeRef}
      style={{ transform: CSS.Translate.toString(transform) }}
      {...listeners}
      {...attributes}
      className={cn(
        'flex items-center gap-2 p-2 rounded-lg border bg-card cursor-grab active:cursor-grabbing select-none hover:bg-muted transition-colors',
        isDragging && 'opacity-50 shadow-lg ring-2 ring-primary z-50'
      )}
    >
      {recipe.image && (
        <div className="relative h-10 w-10 rounded shrink-0 overflow-hidden">
          <Image src={recipe.image} alt={recipe.title} fill sizes="40px" className="object-cover" />
        </div>
      )}
      <p className="text-sm font-medium line-clamp-2 flex-1">{recipe.title}</p>
    </div>
  )
}
