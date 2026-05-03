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
    <div className="group rounded-2xl border bg-card shadow-sm hover:shadow-md transition-all overflow-hidden flex flex-col">
      <Link href={`/recipe/${recipe.id}`} className="block relative w-full h-48 overflow-hidden">
        <Image
          src={recipe.image}
          alt={recipe.title}
          fill
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          className="object-cover transition-transform duration-500 group-hover:scale-105"
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
        <h2 className="font-semibold text-base text-card-foreground group-hover:text-primary transition-colors line-clamp-2">
          {recipe.title}
        </h2>

        <div className="flex flex-wrap gap-1.5 mt-auto pt-2">
          {recipe.readyInMinutes && (
            <span className="flex items-center gap-1 text-xs text-muted-foreground">
              <Clock className="h-3 w-3" />
              {recipe.readyInMinutes} min
            </span>
          )}
          {recipe.servings && (
            <span className="flex items-center gap-1 text-xs text-muted-foreground">
              <Users className="h-3 w-3" />
              {recipe.servings}
            </span>
          )}
          {calories && (
            <span className="text-xs text-muted-foreground">
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
