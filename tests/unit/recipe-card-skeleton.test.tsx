import { describe, it, expect } from 'vitest'
import { render } from '@testing-library/react'
import { RecipeGridSkeleton } from '@/components/recipe/recipe-card-skeleton'

describe('RecipeGridSkeleton', () => {
  it('renders the requested number of skeletons', () => {
    const { container } = render(<RecipeGridSkeleton count={6} />)
    const cards = container.querySelectorAll('.rounded-lg')
    expect(cards.length).toBe(6)
  })

  it('defaults to 9 skeletons', () => {
    const { container } = render(<RecipeGridSkeleton />)
    const cards = container.querySelectorAll('.rounded-lg')
    expect(cards.length).toBe(9)
  })
})
