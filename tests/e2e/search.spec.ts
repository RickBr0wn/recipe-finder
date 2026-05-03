import { test, expect } from '@playwright/test'

test.describe('Search', () => {
  test('home page loads and shows search input', async ({ page }) => {
    await page.goto('/')
    await expect(page.getByPlaceholder('Search for pasta, tacos, salad...')).toBeVisible()
    await expect(page.getByText('Find your next recipe')).toBeVisible()
  })

  test('mobile bottom nav is visible on small screens', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 })
    await page.goto('/')
    const nav = page.locator('nav').filter({ has: page.locator('a[href="/favourites"]') })
    await expect(nav).toBeVisible()
  })

  test('desktop header nav is visible on large screens', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 800 })
    await page.goto('/')
    await expect(page.getByRole('navigation').first()).toBeVisible()
  })

  test('redirects unauthenticated users to sign-in for protected routes', async ({ page }) => {
    await page.goto('/favourites')
    await expect(page).toHaveURL('/sign-in')

    await page.goto('/shopping-list')
    await expect(page).toHaveURL('/sign-in')

    await page.goto('/meal-planner')
    await expect(page).toHaveURL('/sign-in')
  })

  test('sign-in page shows OAuth options', async ({ page }) => {
    await page.goto('/sign-in')
    await expect(page.getByText('Continue with Google')).toBeVisible()
    await expect(page.getByText('Continue with GitHub')).toBeVisible()
  })
})
