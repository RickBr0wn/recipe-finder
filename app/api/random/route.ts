import { NextRequest, NextResponse } from 'next/server'
import { getRandomRecipes } from '@/lib/spoonacular'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const number = Number(searchParams.get('number') ?? '3')

  try {
    const recipes = await getRandomRecipes(number)
    return NextResponse.json({ recipes })
  } catch (err) {
    console.error('Random recipes error:', err)
    return NextResponse.json({ recipes: [] })
  }
}
