import { NextRequest, NextResponse } from 'next/server'

// GET /api/search?q=...
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const query = searchParams.get('q')

  if (!query) {
    return NextResponse.json({ error: 'No query provided' }, { status: 400 })
  }

  const apiKey = process.env.SPOONACULAR_KEY
  const apiUrl = `https://api.spoonacular.com/recipes/complexSearch?query=${query}&number=40&apiKey=${apiKey}`

  try {
    const res = await fetch(apiUrl)
    const data = await res.json()
    return NextResponse.json(data)
  } catch (err) {
    return NextResponse.json({ error: 'Failed to fetch recipes' }, { status: 500 })
  }
}
