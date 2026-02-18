import { test, expect } from '@playwright/test'

const TEST_USER = process.env.TEST_USERNAME || 'admin'
const TEST_PASS = process.env.TEST_PASSWORD || 'changeme'

async function login(page: import('@playwright/test').Page) {
  await page.goto('/login', { waitUntil: 'networkidle' })
  await page.waitForFunction(
    () => Object.keys(document).some((k) => k.startsWith('__react')),
    { timeout: 10000 },
  )
  await page.fill('#login-username', TEST_USER)
  await page.fill('#login-password', TEST_PASS)
  await page.click('button[type="submit"]')
  await page.waitForURL(/\/$/, { timeout: 10000 })
  // Wait for dashboard content to render
  await page.locator('h1', { hasText: 'Workspaces' }).waitFor({ timeout: 10000 })
}

test('login page - glassmorphic design', async ({ page }) => {
  await page.goto('/login', { waitUntil: 'networkidle' })
  await page.screenshot({ path: '/tmp/login-screenshot.png', fullPage: true })

  const bgColor = await page.evaluate(() => getComputedStyle(document.body).backgroundColor)
  expect(bgColor).toBe('rgb(245, 245, 247)')

  const formBackdrop = await page.evaluate(() => {
    const form = document.querySelector('form')
    return form ? getComputedStyle(form).backdropFilter : 'none'
  })
  expect(formBackdrop).toContain('blur')

  const btnBg = await page.evaluate(() => {
    const btn = document.querySelector('button[type="submit"]')
    return btn ? getComputedStyle(btn).backgroundColor : ''
  })
  // Should be Apple blue #0071e3 = rgb(0, 113, 227)
  expect(btnBg).toBe('rgb(0, 113, 227)')
  console.log('Login page glassmorphic: PASS')
})

test('dashboard page - sidebar + stats cards + glass styling', async ({ page }) => {
  await login(page)
  await page.screenshot({ path: '/tmp/dashboard-screenshot.png', fullPage: true })

  // Verify sidebar
  const sidebar = page.locator('aside')
  await expect(sidebar).toBeVisible()

  const sidebarBackdrop = await page.evaluate(() => {
    const aside = document.querySelector('aside')
    return aside ? getComputedStyle(aside).backdropFilter : 'none'
  })
  expect(sidebarBackdrop).toContain('blur')

  // Verify stats cards (4+)
  const cards = page.locator('[data-slot="card"]')
  const count = await cards.count()
  console.log('Stats cards count:', count)
  expect(count).toBeGreaterThanOrEqual(4)

  // Body background
  const bgColor = await page.evaluate(() => getComputedStyle(document.body).backgroundColor)
  expect(bgColor).toBe('rgb(245, 245, 247)')

  // Verify "Workspaces" heading
  await expect(page.locator('h1', { hasText: 'Workspaces' })).toBeVisible()

  // Verify "New Workspace" button
  await expect(page.getByRole('button', { name: 'New Workspace' })).toBeVisible()

  console.log('Dashboard sidebar + stats + glass: PASS')
})

test('workspace detail page - tabs layout', async ({ page }) => {
  await login(page)

  const wsLink = page.locator('a[href^="/workspace/"]').first()
  if (await wsLink.isVisible({ timeout: 5000 }).catch(() => false)) {
    await wsLink.click()
    // Wait for workspace detail page to load
    await page.locator('[data-slot="tabs"]').waitFor({ timeout: 10000 })
    await page.screenshot({ path: '/tmp/workspace-detail-screenshot.png', fullPage: true })

    // Tabs exist
    const tabs = page.locator('[data-slot="tabs"]')
    await expect(tabs).toBeVisible()

    // Overview tab visible
    await expect(page.locator('[data-slot="tabs-trigger"]', { hasText: 'Overview' })).toBeVisible()
    // Events tab visible
    await expect(page.locator('[data-slot="tabs-trigger"]', { hasText: 'Events' })).toBeVisible()

    console.log('Workspace detail tabs: PASS')
  } else {
    console.log('No workspaces available - skipping detail page test')
  }
})
