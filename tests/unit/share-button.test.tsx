import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { ShareButton } from '@/components/recipe/share-button'

describe('ShareButton', () => {
  beforeEach(() => {
    Object.defineProperty(window, 'location', {
      value: { href: 'http://localhost/recipe/123' },
      writable: true,
    })
  })

  it('copies URL to clipboard when Web Share API is unavailable', async () => {
    const mockWriteText = vi.fn().mockResolvedValue(undefined)
    Object.defineProperty(navigator, 'clipboard', {
      value: { writeText: mockWriteText },
      configurable: true,
    })
    Object.defineProperty(navigator, 'share', { value: undefined, configurable: true })

    render(<ShareButton title="Test Recipe" />)
    const button = screen.getByLabelText('Share recipe')
    fireEvent.click(button)

    await vi.waitFor(() => {
      expect(mockWriteText).toHaveBeenCalledWith('http://localhost/recipe/123')
    })
  })

  it('calls navigator.share when available', async () => {
    const mockShare = vi.fn().mockResolvedValue(undefined)
    Object.defineProperty(navigator, 'share', { value: mockShare, configurable: true })

    render(<ShareButton title="Test Recipe" />)
    const button = screen.getByLabelText('Share recipe')
    fireEvent.click(button)

    await vi.waitFor(() => {
      expect(mockShare).toHaveBeenCalledWith({
        title: 'Test Recipe',
        url: 'http://localhost/recipe/123',
      })
    })
  })
})
