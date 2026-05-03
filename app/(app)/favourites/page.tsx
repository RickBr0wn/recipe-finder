import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { Heart } from 'lucide-react'
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
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <Heart className="h-7 w-7 fill-red-500 text-red-500" />
          Favourites
        </h1>
        <p className="text-muted-foreground mt-1">{favourites.length} saved recipe{favourites.length !== 1 ? 's' : ''}</p>
      </div>

      {favourites.length === 0 ? (
        <div className="text-center py-24">
          <Heart className="h-16 w-16 mx-auto text-muted-foreground/30 mb-4" />
          <p className="text-xl font-medium text-muted-foreground">No favourites yet</p>
          <p className="text-muted-foreground text-sm mt-1 mb-6">
            Tap the heart on any recipe to save it here.
          </p>
          <Link href="/" className="text-primary hover:underline text-sm font-medium">
            Browse recipes →
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {favourites.map((fav) => (
            <div key={fav.id} className="group rounded-2xl border bg-card shadow-sm hover:shadow-md transition-all overflow-hidden flex flex-col">
              {fav.recipeImage ? (
                <Link href={`/recipe/${fav.recipeId}`} className="block relative w-full h-48 overflow-hidden">
                  <Image
                    src={fav.recipeImage}
                    alt={fav.recipeTitle}
                    fill
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <div className="absolute top-2 right-2 z-10" onClick={(e) => e.preventDefault()}>
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
                <h2 className="font-semibold text-base group-hover:text-primary transition-colors line-clamp-2">
                  {fav.recipeTitle}
                </h2>
                <div className="flex flex-wrap gap-1.5 text-xs text-muted-foreground mt-auto pt-1">
                  {fav.readyInMinutes && <span>⏱ {fav.readyInMinutes} min</span>}
                  {fav.servings && <span>👥 {fav.servings}</span>}
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
