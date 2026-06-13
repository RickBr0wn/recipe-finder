import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { Heart, Clock, Users } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { FavouriteButton } from '@/components/recipe/favourite-button'

export default async function FavouritesPage() {
  const session = await auth()
  if (!session) redirect('/sign-in')

  const favourites = await prisma.favourite.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: 'desc' },
  })

  return (
    <div className="max-w-6xl mx-auto px-5 py-10">
      <div className="mb-8">
        <h1 className="font-serif font-medium text-3xl text-foreground tracking-tight">
          Favourites
        </h1>
        <p className="text-muted-foreground text-sm mt-1">
          {favourites.length} saved recipe{favourites.length !== 1 ? 's' : ''}
        </p>
      </div>

      {favourites.length === 0 ? (
        <div className="text-center py-24">
          <Heart className="h-12 w-12 mx-auto text-muted-foreground/30 mb-4" strokeWidth={1} />
          <p className="text-base font-medium text-foreground">No favourites yet</p>
          <p className="text-muted-foreground text-sm mt-1 mb-6">
            Tap the heart on any recipe to save it here.
          </p>
          <Link href="/" className="text-primary hover:text-primary/80 text-sm font-medium transition-colors duration-[140ms]">
            Browse recipes
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {favourites.map((fav) => (
            <div key={fav.id} className="group rounded-2xl border border-border/60 bg-card shadow-sm hover:shadow-md transition-all duration-[240ms] overflow-hidden flex flex-col hover:bg-secondary/30">
              {fav.recipeImage ? (
                <Link href={`/recipe/${fav.recipeId}`} className="block relative w-full h-48 overflow-hidden">
                  <Image
                    src={fav.recipeImage}
                    alt={fav.recipeTitle}
                    fill
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    className="object-cover transition-transform duration-[520ms] ease-out group-hover:scale-105"
                  />
                  <div className="absolute top-2 right-2 z-10">
                    <FavouriteButton
                      recipeId={fav.recipeId}
                      recipeTitle={fav.recipeTitle}
                      recipeImage={fav.recipeImage ?? undefined}
                      readyInMinutes={fav.readyInMinutes ?? undefined}
                      servings={fav.servings ?? undefined}
                      diets={fav.diets}
                      initialFavourited={true}
                    />
                  </div>
                </Link>
              ) : (
                <div className="absolute top-2 right-2 z-10">
                  <FavouriteButton
                    recipeId={fav.recipeId}
                    recipeTitle={fav.recipeTitle}
                    recipeImage={undefined}
                    readyInMinutes={fav.readyInMinutes ?? undefined}
                    servings={fav.servings ?? undefined}
                    diets={fav.diets}
                    initialFavourited={true}
                  />
                </div>
              )}

              <Link href={`/recipe/${fav.recipeId}`} className="p-4 flex-1 flex flex-col gap-2">
                <h2 className="font-serif font-medium text-base text-foreground group-hover:text-primary transition-colors duration-[140ms] line-clamp-2 leading-snug">
                  {fav.recipeTitle}
                </h2>
                <div className="flex flex-wrap gap-2.5 text-xs text-muted-foreground font-mono mt-auto pt-1">
                  {fav.readyInMinutes && (
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3" strokeWidth={1.5} />
                      {fav.readyInMinutes} min
                    </span>
                  )}
                  {fav.servings && (
                    <span className="flex items-center gap-1">
                      <Users className="h-3 w-3" strokeWidth={1.5} />
                      {fav.servings}
                    </span>
                  )}
                </div>
                {fav.diets.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {fav.diets.slice(0, 3).map((d) => (
                      <Badge key={d} variant="secondary" className="text-[10px] capitalize">{d}</Badge>
                    ))}
                  </div>
                )}
              </Link>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
