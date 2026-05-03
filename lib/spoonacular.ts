const BASE_URL = 'https://api.spoonacular.com'

export interface Nutrient {
  name: string
  amount: number
  unit: string
}

export interface RecipeSearchResult {
  id: number
  title: string
  image: string
  readyInMinutes?: number
  servings?: number
  diets?: string[]
  cuisines?: string[]
  dishTypes?: string[]
  nutrition?: { nutrients: Nutrient[] }
}

export interface SearchResponse {
  results: RecipeSearchResult[]
  totalResults: number
  offset: number
  number: number
}

export interface ExtendedIngredient {
  id: number
  original: string
  name: string
  amount: number
  unit: string
}

export interface RecipeDetail {
  id: number
  title: string
  image: string
  readyInMinutes: number
  servings: number
  diets: string[]
  cuisines: string[]
  dishTypes: string[]
  instructions: string
  extendedIngredients: ExtendedIngredient[]
  nutrition?: { nutrients: Nutrient[] }
  summary: string
  sourceUrl?: string
}

export interface SimilarRecipe {
  id: number
  title: string
  imageType: string
  readyInMinutes: number
  servings: number
}

function apiKey() {
  const key = process.env.SPOONACULAR_KEY
  if (!key) throw new Error('SPOONACULAR_KEY not set')
  return key
}

export async function searchRecipes(params: {
  query: string
  diet?: string
  cuisine?: string
  type?: string
  maxReadyTime?: string
}): Promise<SearchResponse> {
  const url = new URL(`${BASE_URL}/recipes/complexSearch`)
  url.searchParams.set('query', params.query)
  url.searchParams.set('number', '40')
  url.searchParams.set('addRecipeInformation', 'true')
  url.searchParams.set('addRecipeNutrition', 'true')
  url.searchParams.set('apiKey', apiKey())
  if (params.diet) url.searchParams.set('diet', params.diet)
  if (params.cuisine) url.searchParams.set('cuisine', params.cuisine)
  if (params.type) url.searchParams.set('type', params.type)
  if (params.maxReadyTime) url.searchParams.set('maxReadyTime', params.maxReadyTime)

  const res = await fetch(url.toString(), { next: { revalidate: 300 } })
  if (!res.ok) throw new Error(`Spoonacular search error: ${res.status}`)
  return res.json()
}

export async function getRecipe(id: string): Promise<RecipeDetail> {
  const url = `${BASE_URL}/recipes/${id}/information?includeNutrition=true&apiKey=${apiKey()}`
  const res = await fetch(url, { next: { revalidate: 3600 } })
  if (!res.ok) throw new Error(`Spoonacular recipe error: ${res.status}`)
  return res.json()
}

export async function getSimilarRecipes(id: string): Promise<SimilarRecipe[]> {
  const url = `${BASE_URL}/recipes/${id}/similar?number=6&apiKey=${apiKey()}`
  const res = await fetch(url, { next: { revalidate: 3600 } })
  if (!res.ok) return []
  return res.json()
}
