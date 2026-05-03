import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const saveSchema = z.object({
  recipeId: z.number(),
  recipeTitle: z.string(),
  recipeImage: z.string().optional(),
  readyInMinutes: z.number().optional(),
  servings: z.number().optional(),
  diets: z.array(z.string()).optional(),
})

export async function GET() {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const favourites = await prisma.favourite.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: 'desc' },
  })
  return NextResponse.json(favourites)
}

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json()
  const parsed = saveSchema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: 'Invalid body' }, { status: 400 })

  const { recipeId, recipeTitle, recipeImage, readyInMinutes, servings, diets } = parsed.data

  const favourite = await prisma.favourite.upsert({
    where: { userId_recipeId: { userId: session.user.id, recipeId } },
    create: { userId: session.user.id, recipeId, recipeTitle, recipeImage, readyInMinutes, servings, diets: diets ?? [] },
    update: {},
  })
  return NextResponse.json(favourite, { status: 201 })
}

export async function DELETE(req: NextRequest) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const recipeId = Number(new URL(req.url).searchParams.get('recipeId'))
  if (!recipeId) return NextResponse.json({ error: 'Missing recipeId' }, { status: 400 })

  await prisma.favourite.deleteMany({
    where: { userId: session.user.id, recipeId },
  })
  return NextResponse.json({ ok: true })
}
