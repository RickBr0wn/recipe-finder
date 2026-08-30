import React from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { getRecipe, getSimilarRecipes, getRecipesDietInfo } from '@/lib/spoonacular'
import { ArrowLeft, Clock, Users, Flame } from 'lucide-react'
import { buttonVariants } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { FavouriteButton } from '@/components/recipe/favourite-button'
import { AddToShoppingListButton } from '@/components/recipe/add-to-shopping-list-button'
import { ShareButton } from '@/components/recipe/share-button'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

interface Props {
  params: Promise<{ id: string }>
}

const MACRO_NAMES = ['Calories', 'Protein', 'Fat', 'Carbohydrates']

export default async function RecipeDetailPage({ params }: Props) {
  const { id } = await params
  const session = await auth()

  let data
  try {
    data = await getRecipe(id)
  } catch {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] gap-4">
        <p className="text-muted-foreground">Failed to load recipe.</p>
        <Link href="/" className={buttonVariants({ variant: 'outline' })}>
          Back to search
        </Link>
      </div>
    )
  }

  const [rawSimilar, isFavourited] = await Promise.all([
    getSimilarRecipes(id),
    session?.user?.id
      ? prisma.favourite.findUnique({
          where: { userId_recipeId: { userId: session.user.id, recipeId: Number(id) } },
          select: { id: true },
        }).then(Boolean)
      : false,
  ])

  // Filter similar recipes to match the current recipe's dietary tags.
  // Fetch diet info in bulk (one request) then exclude recipes missing any of the current recipe's diets.
  let similar = rawSimilar
  if (data.diets.length > 0 && rawSimilar.length > 0) {
    const dietInfo = await getRecipesDietInfo(rawSimilar.map((s) => s.id))
    const dietMap = new Map(dietInfo.map((d) => [d.id, d.diets]))
    similar = rawSimilar.filter((s) => {
      const recipeDiets = dietMap.get(s.id) ?? []
      return data.diets.every((d) => recipeDiets.includes(d))
    })
    // Fall back to unfiltered if nothing passes (edge case)
    if (similar.length === 0) similar = rawSimilar
  }
  similar = similar.slice(0, 6)

  const macros = data.nutrition?.nutrients?.filter((n) => MACRO_NAMES.includes(n.name)) ?? []
  const calories = macros.find((n) => n.name === 'Calories')
  const tileMacros = macros.filter((n) => n.name !== 'Calories')

  return (
    <div className="pb-16">
      {/* Hero */}
      <section className="relative h-72 sm:h-[420px] w-full">
        <Image
          src={data.image}
          alt={data.title}
          fill
          priority
          sizes="100vw"
          className="object-cover"
        />

        <div className="absolute top-4 left-4">
          <Link
            href="/"
            aria-label="Back to search"
            className="flex items-center justify-center h-10 w-10 rounded-full bg-[var(--glass-bg-strong)] backdrop-blur-md backdrop-saturate-150 border border-[var(--glass-border)] shadow-[var(--shadow-sm)] hover:bg-[var(--surface-white)] transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </div>
        <div className="absolute top-4 right-4 flex gap-2">
          <FavouriteButton
            recipeId={data.id}
            recipeTitle={data.title}
            recipeImage={data.image}
            readyInMinutes={data.readyInMinutes}
            servings={data.servings}
            diets={data.diets}
            initialFavourited={isFavourited}
          />
          <ShareButton title={data.title} />
        </div>

        {/* Frosted glass panel overlapping the hero photo */}
        <div className="absolute inset-x-4 sm:left-1/2 sm:inset-x-auto sm:w-full sm:max-w-2xl -bottom-20 sm:-bottom-24 sm:-translate-x-1/2">
          <div className="bg-[var(--glass-bg-strong)] backdrop-blur-2xl backdrop-saturate-150 border border-[var(--glass-border)] rounded-lg shadow-[var(--shadow-lg)] p-6 sm:p-8">
            {data.dishTypes?.[0] && (
              <p className="text-xs font-bold tracking-[0.08em] uppercase text-muted-foreground mb-2">
                {data.dishTypes[0]}
              </p>
            )}
            <h1 className="font-sans font-extrabold text-2xl sm:text-4xl text-foreground leading-tight tracking-tight">
              {data.title}
            </h1>
            <div className="flex flex-wrap items-center gap-4 mt-3 text-sm font-medium tabular-nums text-muted-foreground">
              <span className="flex items-center gap-1.5">
                <Clock className="h-4 w-4" strokeWidth={1.5} />
                {data.readyInMinutes} min
              </span>
              <span className="flex items-center gap-1.5">
                <Users className="h-4 w-4" strokeWidth={1.5} />
                {data.servings} servings
              </span>
              {calories && (
                <span className="flex items-center gap-1.5">
                  <Flame className="h-4 w-4" strokeWidth={1.5} />
                  {Math.round(calories.amount)} kcal
                </span>
              )}
            </div>
            {data.diets.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-3">
                {data.diets.map((diet) => (
                  <Badge key={diet} variant="secondary" className="capitalize text-[11px]">
                    {diet}
                  </Badge>
                ))}
              </div>
            )}
          </div>
        </div>
      </section>

      <div className="max-w-4xl mx-auto px-5 pt-28 sm:pt-32">
        {/* Nutrition macro tiles */}
        {tileMacros.length > 0 && (
          <div className="grid grid-cols-3 gap-3 mb-10">
            {tileMacros.map((n) => (
              <div key={n.name} className="rounded-lg bg-card shadow-[var(--shadow-sm)] p-3 text-center">
                <p className="font-sans font-extrabold tabular-nums text-2xl text-foreground">{Math.round(n.amount)}{n.unit}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{n.name}</p>
              </div>
            ))}
          </div>
        )}

        <Separator className="mb-10" />

        {/* Ingredients */}
        <section className="mb-10">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-sans font-bold text-2xl text-foreground tracking-tight">Ingredients</h2>
            <AddToShoppingListButton
              recipeId={data.id}
              recipeName={data.title}
              ingredients={data.extendedIngredients.map((i) => ({
                name: i.name,
                amount: String(i.amount),
                unit: i.unit,
              }))}
            />
          </div>
          <ul className="space-y-2">
            {data.extendedIngredients.map((ing, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-foreground/90">
                <span className="mt-2 h-1.5 w-1.5 rounded-full bg-primary shrink-0" />
                {ing.original}
              </li>
            ))}
          </ul>
        </section>

        {/* Instructions */}
        <section className="mb-12">
          <h2 className="font-sans font-bold text-2xl text-foreground tracking-tight mb-4">Instructions</h2>
          <div
            className="prose prose-sm max-w-none text-muted-foreground leading-relaxed [&_ol]:list-decimal [&_ol]:pl-5 [&_li]:mb-2 [&_strong]:text-foreground [&_p]:text-foreground/80"
            dangerouslySetInnerHTML={{
              __html: data.instructions || '<p>No instructions available.</p>',
            }}
          />
        </section>

        {/* Similar recipes */}
        {similar.length > 0 && (
          <section>
            <h2 className="font-sans font-bold text-2xl text-foreground tracking-tight mb-4">You might also like</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {similar.map((s) => (
                <Link
                  key={s.id}
                  href={`/recipe/${s.id}`}
                  className="group rounded-lg bg-card shadow-[var(--shadow-sm)] hover:shadow-[var(--shadow-md)] overflow-hidden transition-all duration-[240ms]"
                >
                  <div className="relative w-full h-32 overflow-hidden">
                    <Image
                      src={`https://spoonacular.com/recipeImages/${s.id}-312x231.${s.imageType}`}
                      alt={s.title}
                      fill
                      sizes="(max-width: 640px) 50vw, 33vw"
                      className="object-cover transition-transform duration-[520ms] ease-out group-hover:scale-105"
                    />
                  </div>
                  <div className="p-3">
                    <p className="font-sans text-sm font-bold text-foreground line-clamp-2 leading-snug">{s.title}</p>
                    <p className="text-xs font-medium tabular-nums text-muted-foreground mt-1.5">{s.readyInMinutes} min</p>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  )
}
