import { NextRequest, NextResponse } from 'next/server'
import { searchRecipes } from '@/lib/spoonacular'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const query = searchParams.get('q')

  if (!query) {
    return NextResponse.json({ error: 'No query provided' }, { status: 400 })
  }

  try {
    const data = await searchRecipes({
      query,
      diet: searchParams.get('diet') ?? undefined,
      cuisine: searchParams.get('cuisine') ?? undefined,
      type: searchParams.get('type') ?? undefined,
      maxReadyTime: searchParams.get('maxTime') ?? undefined,
    })
    return NextResponse.json(data)
  } catch (err) {
    console.error('Search error:', err)
    return NextResponse.json({ error: 'Failed to fetch recipes' }, { status: 500 })
  }
}
