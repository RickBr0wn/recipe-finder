'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'

interface Recipe {
  id: number
  title: string
  image: string
}

export default function Home() {
  const [query, setQuery] = useState('')
  const [recipes, setRecipes] = useState<Recipe[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!query) return

    const timer = setTimeout(async () => {
      setLoading(true)
      setError('')
      try {
        const res = await fetch(`/api/search?q=${query}`)
        const data = await res.json()
        if (data.results) setRecipes(data.results)
        else setRecipes([])
      } catch {
        setError('Failed to fetch recipes')
      } finally {
        setLoading(false)
      }
    }, 300) // debounce

    return () => clearTimeout(timer)
  }, [query])

  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-100 p-6 sm:p-12">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <header className="text-center mb-12">
          <h1 className="text-5xl font-extrabold tracking-tight text-gray-900 drop-shadow-sm">
            🍽️ Recipe <span className="text-blue-600">Finder</span>
          </h1>
          <p className="mt-4 text-lg text-gray-500">
            Discover recipes by ingredients, cravings, or cuisine.
          </p>
        </header>

        {/* Search Bar */}
        <div className="flex justify-center mb-12">
          <div className="relative w-full max-w-2xl">
            <input
              type="text"
              placeholder="Search delicious recipes..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-full px-6 py-4 pl-12 rounded-2xl border border-gray-200 shadow-lg focus:outline-none focus:ring-4 focus:ring-blue-200 text-lg bg-white/80 backdrop-blur transition"
            />
            <svg
              className="absolute left-4 top-1/2 -translate-y-1/2 h-6 w-6 text-gray-400"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              viewBox="0 0 24 24"
            >
              <path d="M21 21l-4.35-4.35m0 0A7.5 7.5 0 104.5 4.5a7.5 7.5 0 0012.15 12.15z" />
            </svg>
          </div>
        </div>

        {/* States */}
        {loading && <p className="text-center text-blue-500 font-medium">Loading recipes...</p>}
        {error && <p className="text-center text-red-500 font-medium">{error}</p>}

        {/* Recipes Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10">
          {recipes.map((recipe) => (
            <Link
              key={recipe.id}
              href={`/recipe/${recipe.id}`}
              className="group rounded-3xl bg-white/80 backdrop-blur border border-gray-100 shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden flex flex-col"
            >
              <div className="relative w-full h-56 overflow-hidden">
                <img
                  src={recipe.image}
                  alt={recipe.title}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-70 group-hover:opacity-90 transition"></div>
                <span className="absolute top-3 right-3 bg-white/90 backdrop-blur px-3 py-1 rounded-full text-xs font-semibold text-blue-600 shadow">
                  #{recipe.id}
                </span>
              </div>
              <div className="flex-1 p-6 flex flex-col justify-between">
                <h2 className="font-bold text-xl text-gray-800 group-hover:text-blue-600 transition-colors line-clamp-2">
                  {recipe.title}
                </h2>
                <button className="mt-4 inline-flex items-center gap-2 text-sm font-medium text-blue-600 hover:text-blue-800 transition">
                  View Recipe →
                </button>
              </div>
            </Link>
          ))}
        </div>

        {/* Empty state */}
        {(!loading && recipes.length === 0 && query) && (
          <p className="text-center text-gray-400 mt-16 text-lg">
            No recipes found. Try another search!
          </p>
        )}
      </div>
    </main>
  )

}
