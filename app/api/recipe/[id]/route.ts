import { NextRequest, NextResponse } from 'next/server'

// GET /api/recipe/:id
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const { id } = params
  if (!id) {
    return NextResponse.json({ error: 'No recipe ID provided' }, { status: 400 })
  }

  const apiKey = process.env.SPOONACULAR_KEY
  const apiUrl = `https://api.spoonacular.com/recipes/${id}/information?apiKey=${apiKey}`

  try {
    const res = await fetch(apiUrl)
    if (!res.ok) {
      return NextResponse.json({ error: 'Failed to fetch recipe details' }, { status: res.status })
    }
    const data = await res.json()
    return NextResponse.json(data)
  } catch (err) {
    return NextResponse.json({ error: 'Failed to fetch recipe details' }, { status: 500 })
  }
}
