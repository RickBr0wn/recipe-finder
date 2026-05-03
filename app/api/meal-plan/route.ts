import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const saveSchema = z.object({
  recipeId: z.number(),
  recipeTitle: z.string(),
  recipeImage: z.string().optional(),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  mealType: z.enum(['breakfast', 'lunch', 'dinner', 'snack']),
})

export async function GET(req: NextRequest) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const week = new URL(req.url).searchParams.get('week')

  const where: { userId: string; date?: { gte: string; lte: string } } = { userId: session.user.id }
  if (week) {
    const start = new Date(week)
    const end = new Date(start)
    end.setDate(end.getDate() + 6)
    where.date = {
      gte: start.toISOString().slice(0, 10),
      lte: end.toISOString().slice(0, 10),
    }
  }

  const items = await prisma.mealPlanItem.findMany({ where, orderBy: [{ date: 'asc' }, { mealType: 'asc' }] })
  return NextResponse.json(items)
}

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json()
  const parsed = saveSchema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: 'Invalid body' }, { status: 400 })

  const { recipeId, recipeTitle, recipeImage, date, mealType } = parsed.data

  const item = await prisma.mealPlanItem.upsert({
    where: { userId_date_mealType: { userId: session.user.id, date, mealType } },
    create: { userId: session.user.id, recipeId, recipeTitle, recipeImage, date, mealType },
    update: { recipeId, recipeTitle, recipeImage },
  })
  return NextResponse.json(item, { status: 201 })
}

export async function DELETE(req: NextRequest) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const id = new URL(req.url).searchParams.get('id')
  if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 })

  await prisma.mealPlanItem.deleteMany({ where: { id, userId: session.user.id } })
  return NextResponse.json({ ok: true })
}
