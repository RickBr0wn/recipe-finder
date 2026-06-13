import React from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { getRecipe, getSimilarRecipes } from '@/lib/spoonacular'
import { ArrowLeft, Clock, Users } from 'lucide-react'
import { buttonVariants } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { cn } from '@/lib/utils'
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

  const [similar, isFavourited] = await Promise.all([
    getSimilarRecipes(id),
    session?.user?.id
      ? prisma.favourite.findUnique({
          where: { userId_recipeId: { userId: session.user.id, recipeId: Number(id) } },
          select: { id: true },
        }).then(Boolean)
      : false,
  ])

  const macros = data.nutrition?.nutrients?.filter((n) => MACRO_NAMES.includes(n.name)) ?? []

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
        {/* Brand scrim: dark espresso gradient from bottom */}
        <div className="absolute inset-0 bg-gradient-to-t from-[oklch(0.12_0.01_50/0.92)] via-[oklch(0.12_0.01_50/0.55)] to-transparent" />
        <div className="absolute inset-0 flex flex-col justify-end p-6 sm:p-10">
          <h1 className="font-serif font-medium text-3xl sm:text-5xl text-[var(--cream-50)] max-w-3xl leading-tight tracking-tight">
            {data.title}
          </h1>
          <div className="flex flex-wrap gap-2 mt-3">
            {data.diets?.map((diet) => (
              <Badge key={diet} variant="secondary" className="bg-white/15 text-cream-50 border-white/20 capitalize text-[11px]">
                {diet}
              </Badge>
            ))}
          </div>
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
      </section>

      <div className="max-w-4xl mx-auto px-5">
        <div className="flex items-center gap-3 my-6">
          <Link href="/" className={cn(buttonVariants({ variant: 'ghost', size: 'sm' }), 'gap-1.5 text-muted-foreground hover:text-foreground')}>
            <ArrowLeft className="h-4 w-4" />
            Back to search
          </Link>
        </div>

        {/* Meta strip */}
        <div className="flex flex-wrap gap-5 mb-8 text-sm font-mono text-muted-foreground">
          <span className="flex items-center gap-1.5">
            <Clock className="h-4 w-4" strokeWidth={1.5} />
            <span className="text-foreground font-medium">{data.readyInMinutes}</span> min
          </span>
          <span className="flex items-center gap-1.5">
            <Users className="h-4 w-4" strokeWidth={1.5} />
            <span className="text-foreground font-medium">{data.servings}</span> servings
          </span>
        </div>

        {/* Nutrition macro tiles */}
        {macros.length > 0 && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-10">
            {macros.map((n) => (
              <div key={n.name} className="rounded-xl border border-border/60 bg-card p-3 text-center">
                <p className="font-mono font-medium text-2xl text-foreground">{Math.round(n.amount)}</p>
                <p className="text-xs text-muted-foreground mt-0.5 font-sans">
                  {n.name} <span className="lowercase">{n.unit}</span>
                </p>
              </div>
            ))}
          </div>
        )}

        <Separator className="mb-10 bg-border/60" />

        {/* Ingredients */}
        <section className="mb-10">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-serif font-medium text-2xl text-foreground tracking-tight">Ingredients</h2>
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
          <h2 className="font-serif font-medium text-2xl text-foreground tracking-tight mb-4">Instructions</h2>
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
            <h2 className="font-serif font-medium text-2xl text-foreground tracking-tight mb-4">You might also like</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {similar.map((s) => (
                <Link
                  key={s.id}
                  href={`/recipe/${s.id}`}
                  className="group rounded-xl border border-border/60 bg-card overflow-hidden hover:bg-secondary transition-colors duration-[140ms]"
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
                    <p className="font-serif text-sm font-medium text-foreground line-clamp-2 leading-snug">{s.title}</p>
                    <p className="text-xs text-muted-foreground font-mono mt-1.5">{s.readyInMinutes} min</p>
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
