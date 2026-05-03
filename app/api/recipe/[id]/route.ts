import { NextRequest, NextResponse } from 'next/server'
import { getRecipe } from '@/lib/spoonacular'

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params

  try {
    const data = await getRecipe(id)
    return NextResponse.json(data)
  } catch (err) {
    console.error('Recipe fetch error:', err)
    return NextResponse.json({ error: 'Failed to fetch recipe' }, { status: 500 })
  }
}
