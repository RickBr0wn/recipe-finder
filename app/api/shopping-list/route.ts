import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const addSchema = z.object({
  items: z.array(z.object({
    name: z.string(),
    amount: z.string().optional(),
    unit: z.string().optional(),
    recipeId: z.number().optional(),
    recipeName: z.string().optional(),
  })),
})

const patchSchema = z.object({
  id: z.string(),
  checked: z.boolean(),
})

export async function GET() {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const items = await prisma.shoppingItem.findMany({
    where: { userId: session.user.id },
    orderBy: [{ recipeName: 'asc' }, { createdAt: 'asc' }],
  })
  return NextResponse.json(items)
}

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json()
  const parsed = addSchema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: 'Invalid body' }, { status: 400 })

  const items = await prisma.shoppingItem.createMany({
    data: parsed.data.items.map((item) => ({ userId: session.user.id, ...item })),
  })
  return NextResponse.json(items, { status: 201 })
}

export async function PATCH(req: NextRequest) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json()
  const parsed = patchSchema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: 'Invalid body' }, { status: 400 })

  const { id, checked } = parsed.data
  const item = await prisma.shoppingItem.updateMany({
    where: { id, userId: session.user.id },
    data: { checked },
  })
  return NextResponse.json(item)
}

export async function DELETE(req: NextRequest) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const url = new URL(req.url)
  const id = url.searchParams.get('id')
  const clearChecked = url.searchParams.get('clearChecked') === 'true'

  if (clearChecked) {
    await prisma.shoppingItem.deleteMany({ where: { userId: session.user.id, checked: true } })
    return NextResponse.json({ ok: true })
  }

  if (id) {
    await prisma.shoppingItem.deleteMany({ where: { id, userId: session.user.id } })
    return NextResponse.json({ ok: true })
  }

  return NextResponse.json({ error: 'Missing id or clearChecked param' }, { status: 400 })
}
