import { chromium, type Page } from '@playwright/test'
import path from 'path'

const BASE = 'http://localhost:3001'
const OUT = path.join(process.cwd(), 'public', 'screenshots')
const RECIPE_ID = '654959'

async function enableDark(page: Page) {
  await page.evaluate(() => {
    document.documentElement.classList.add('dark')
    localStorage.setItem('theme', 'dark')
  })
  await page.waitForTimeout(300)
}

async function shot(page: Page, name: string, url: string, opts: { dark?: boolean; mobile?: boolean; setup?: (p: Page) => Promise<void> } = {}) {
  const { dark = false, mobile = false, setup } = opts
  await page.setViewportSize(mobile ? { width: 390, height: 844 } : { width: 1280, height: 800 })
  await page.goto(`${BASE}${url}`, { waitUntil: 'networkidle' })
  if (dark) await enableDark(page)
  if (setup) await setup(page)
  await page.screenshot({ path: `${OUT}/${name}.png` })
  console.log(`✓ ${name}`)
}

async function run() {
  const browser = await chromium.launch()
  const page = await browser.newPage()

  // --- Light mode ---
  await shot(page, 'home', '/')

  await shot(page, 'search-results', '/', {
    setup: async (p) => {
      await p.fill('input[placeholder*="pasta"]', 'pasta')
      await p.keyboard.press('Enter')
      await p.waitForSelector('[class*="rounded-2xl"]', { timeout: 10000 })
      await p.waitForTimeout(800)
    },
  })

  await shot(page, 'recipe-detail', `/recipe/${RECIPE_ID}`, {
    setup: async (p) => { await p.waitForTimeout(500) },
  })

  await shot(page, 'sign-in', '/sign-in')

  await shot(page, 'mobile-home', '/', { mobile: true })

  await shot(page, 'mobile-search', '/', {
    mobile: true,
    setup: async (p) => {
      await p.fill('input[placeholder*="pasta"]', 'chicken')
      await p.keyboard.press('Enter')
      await p.waitForSelector('[class*="rounded-2xl"]', { timeout: 10000 })
      await p.waitForTimeout(800)
    },
  })

  // --- Dark mode ---
  await shot(page, 'home-dark', '/', { dark: true })

  await shot(page, 'search-results-dark', '/', {
    dark: true,
    setup: async (p) => {
      await p.fill('input[placeholder*="pasta"]', 'pasta')
      await p.keyboard.press('Enter')
      await p.waitForSelector('[class*="rounded-2xl"]', { timeout: 10000 })
      await p.waitForTimeout(800)
    },
  })

  await shot(page, 'recipe-detail-dark', `/recipe/${RECIPE_ID}`, {
    dark: true,
    setup: async (p) => { await p.waitForTimeout(500) },
  })

  await shot(page, 'mobile-search-dark', '/', {
    mobile: true,
    dark: true,
    setup: async (p) => {
      await p.fill('input[placeholder*="pasta"]', 'chicken')
      await p.keyboard.press('Enter')
      await p.waitForSelector('[class*="rounded-2xl"]', { timeout: 10000 })
      await p.waitForTimeout(800)
    },
  })

  await browser.close()
  console.log(`\nAll screenshots saved to public/screenshots/`)
}

run().catch((e) => { console.error(e); process.exit(1) })
