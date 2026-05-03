import { describe, it, expect, vi, beforeEach } from 'vitest'
import { searchRecipes, getRecipe, getSimilarRecipes } from '@/lib/spoonacular'

vi.stubEnv('SPOONACULAR_KEY', 'test-key')

const mockFetch = vi.fn()
vi.stubGlobal('fetch', mockFetch)

describe('spoonacular helpers', () => {
  beforeEach(() => {
    mockFetch.mockReset()
  })

  it('searchRecipes builds the correct URL', async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: async () => ({ results: [], totalResults: 0, offset: 0, number: 40 }),
    })

    await searchRecipes({ query: 'pasta', diet: 'vegan' })

    const url = mockFetch.mock.calls[0][0] as string
    expect(url).toContain('complexSearch')
    expect(url).toContain('query=pasta')
    expect(url).toContain('diet=vegan')
    expect(url).toContain('addRecipeInformation=true')
    expect(url).toContain('addRecipeNutrition=true')
  })

  it('searchRecipes throws on non-ok response', async () => {
    mockFetch.mockResolvedValue({ ok: false, status: 402 })
    await expect(searchRecipes({ query: 'x' })).rejects.toThrow('Spoonacular search error: 402')
  })

  it('getRecipe calls the correct endpoint', async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: async () => ({ id: 123, title: 'Test Recipe' }),
    })

    const result = await getRecipe('123')
    expect(result.id).toBe(123)

    const url = mockFetch.mock.calls[0][0] as string
    expect(url).toContain('/recipes/123/information')
    expect(url).toContain('includeNutrition=true')
  })

  it('getSimilarRecipes returns empty array on error', async () => {
    mockFetch.mockResolvedValue({ ok: false, status: 500 })
    const result = await getSimilarRecipes('123')
    expect(result).toEqual([])
  })
})
