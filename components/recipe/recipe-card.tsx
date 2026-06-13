'use client'

import Link from 'next/link'
import Image from 'next/image'
import { Clock, Users } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { FavouriteButton } from '@/components/recipe/favourite-button'
import type { RecipeSearchResult } from '@/lib/spoonacular'

interface RecipeCardProps {
  recipe: RecipeSearchResult
  isFavourited?: boolean
}

export function RecipeCard({ recipe, isFavourited = false }: RecipeCardProps) {
  const calories = recipe.nutrition?.nutrients?.find((n) => n.name === 'Calories')

  return (
    <div className="group rounded-2xl border border-border/60 bg-card shadow-sm hover:shadow-md transition-all duration-[240ms] overflow-hidden flex flex-col hover:bg-secondary/30">
      <Link href={`/recipe/${recipe.id}`} className="block relative w-full h-48 overflow-hidden">
        <Image
          src={recipe.image}
          alt={recipe.title}
          fill
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          className="object-cover transition-transform duration-[520ms] ease-out group-hover:scale-105"
        />
        <div className="absolute top-2 right-2 z-10" onClick={(e) => e.preventDefault()}>
          <FavouriteButton
            recipeId={recipe.id}
            recipeTitle={recipe.title}
            recipeImage={recipe.image}
            readyInMinutes={recipe.readyInMinutes}
            servings={recipe.servings}
            diets={recipe.diets ?? []}
            initialFavourited={isFavourited}
          />
        </div>
      </Link>

      <Link href={`/recipe/${recipe.id}`} className="p-4 flex-1 flex flex-col gap-2">
        <h2 className="font-serif font-medium text-base text-foreground group-hover:text-primary transition-colors duration-[140ms] line-clamp-2 leading-snug">
          {recipe.title}
        </h2>

        <div className="flex flex-wrap gap-2.5 mt-auto pt-2">
          {recipe.readyInMinutes && (
            <span className="flex items-center gap-1 text-xs text-muted-foreground font-mono">
              <Clock className="h-3 w-3 stroke-current" strokeWidth={1.5} />
              {recipe.readyInMinutes} min
            </span>
          )}
          {recipe.servings && (
            <span className="flex items-center gap-1 text-xs text-muted-foreground font-mono">
              <Users className="h-3 w-3 stroke-current" strokeWidth={1.5} />
              {recipe.servings}
            </span>
          )}
          {calories && (
            <span className="text-xs text-muted-foreground font-mono">
              {Math.round(calories.amount)} kcal
            </span>
          )}
        </div>

        {recipe.diets && recipe.diets.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {recipe.diets.slice(0, 3).map((diet) => (
              <Badge key={diet} variant="secondary" className="text-[10px] capitalize">
                {diet}
              </Badge>
            ))}
          </div>
        )}
      </Link>
    </div>
  )
}
