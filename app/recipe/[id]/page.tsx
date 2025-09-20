import React from 'react'

interface RecipeDetailProps {
  params: { id: string }
}

// Server Component: fetches recipe details from the API
export default async function RecipeDetailPage({ params }: RecipeDetailProps) {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'

  const res = await fetch(`${baseUrl}/api/recipe/${params.id}`)
  if (!res.ok) {
    return <div>Failed to load recipe details.</div>
  }
  const data = await res.json()

  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-100 pb-16">
      {/* Hero Section */}
      <section className="relative h-80 sm:h-96 w-full">
        <img
          src={data.image}
          alt={data.title}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-black/40"></div>
        <div className="absolute inset-0 flex items-center justify-center">
          <h1 className="text-4xl sm:text-5xl font-extrabold text-white drop-shadow-lg text-center px-4">
            {data.title}
          </h1>
        </div>
      </section>

      {/* Content Card */}
      <section className="max-w-4xl mx-auto -mt-16 relative z-10">
        <div className="bg-white/80 backdrop-blur border border-gray-200 shadow-2xl rounded-3xl p-8 sm:p-12">
          {/* Meta */}
          <div className="flex flex-wrap gap-6 mb-8 text-gray-600">
            <span className="px-4 py-2 rounded-full bg-blue-100 text-blue-700 font-medium shadow">
              Servings: {data.servings}
            </span>
            <span className="px-4 py-2 rounded-full bg-green-100 text-green-700 font-medium shadow">
              Ready in {data.readyInMinutes} mins
            </span>
          </div>

          {/* Ingredients */}
          <h2 className="text-2xl font-bold text-gray-900 mb-4">🛒 Ingredients</h2>
          <ul className="list-disc list-inside space-y-2 mb-10 text-gray-700">
            {data.extendedIngredients.map((ing: { original: string }, i: number) => (
              <li key={i}>{ing.original}</li>
            ))}
          </ul>

          {/* Instructions */}
          <h2 className="text-2xl font-bold text-gray-900 mb-4">👩‍🍳 Instructions</h2>
          <div
            className="prose max-w-none text-gray-700 leading-relaxed"
            dangerouslySetInnerHTML={{
              __html: data.instructions || '<p>No instructions available.</p>',
            }}
          />
        </div>
      </section>

      {/* Back Button */}
      <div className="text-center mt-12">
        <a
          href="/"
          className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-blue-600 text-white font-semibold shadow hover:bg-blue-700 transition"
        >
          ← Back to Search
        </a>
      </div>
    </main>
  )

}
