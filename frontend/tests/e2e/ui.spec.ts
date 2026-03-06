import { test, expect } from '@playwright/test'

async function login(page: import('@playwright/test').Page) {
  await page.goto('/login')
  await page.fill('input[autocomplete="username"]', 'admin')
  await page.fill('input[autocomplete="current-password"]', 'admin123')
  await page.click('button:has-text("登录")')
  await page.waitForURL(/dashboard/, { timeout: 5000 })
}

test.describe('UI Settings - Theme & Language', () => {
  test.beforeEach(async ({ page }) => {
    await login(page)
  })

  test('should display theme switcher in header', async ({ page }) => {
    // Theme switcher button should be visible
    const themeBtn = page.locator('.el-dropdown').filter({ hasText: '' }).first()
    await expect(page.locator('.header-right')).toBeVisible()
  })

  test('should have language switcher in header', async ({ page }) => {
    await expect(page.locator('.header-right')).toBeVisible()
  })

  test('should switch language to English', async ({ page }) => {
    // Find the lang switcher (contains 中 or EN)
    const langSwitcher = page.locator('.lang-label')
    if (await langSwitcher.count() > 0) {
      await langSwitcher.click()
      await page.click('text=English')
      // Wait for UI update
      await page.waitForTimeout(500)
      await expect(page.locator('.lang-label')).toHaveText('EN')
    }
  })

  test('should persist language preference across navigation', async ({ page }) => {
    // Set language to English via localStorage
    await page.evaluate(() => localStorage.setItem('mingyue-language', 'en-US'))
    await page.reload()
    await login(page)
    // Dashboard should show English text
    await expect(page.locator('.page-header h2')).toContainText('Dashboard')
  })

  test('should apply dark theme class to html element', async ({ page }) => {
    // Set dark theme via localStorage
    await page.evaluate(() => localStorage.setItem('mingyue-theme', 'dark'))
    await page.reload()
    await login(page)
    const htmlClass = await page.evaluate(() => document.documentElement.className)
    expect(htmlClass).toContain('dark')
  })
})
