import { test, expect } from '@playwright/test'

test.describe('Login Page', () => {
  test('should display login form', async ({ page }) => {
    await page.goto('/')
    await expect(page).toHaveURL(/login/)
    await expect(page.locator('.login-card')).toBeVisible()
  })

  test('should show validation errors on empty submit', async ({ page }) => {
    await page.goto('/login')
    await page.locator('.login-btn').click()
    // Should show validation message for both fields
    await expect(page.locator('.el-form-item__error').first()).toBeVisible()
  })

  test('should login with valid credentials', async ({ page }) => {
    await page.goto('/login')
    await page.fill('input[autocomplete="username"]', 'admin')
    await page.fill('input[autocomplete="current-password"]', 'admin123')
    await page.locator('.login-btn').click()
    // Should redirect to dashboard after login
    await page.waitForURL(/dashboard/, { timeout: 10000 })
    await expect(page).toHaveURL(/dashboard/)
  })

  test('should show error for invalid credentials', async ({ page }) => {
    await page.goto('/login')
    await page.fill('input[autocomplete="username"]', 'wronguser')
    await page.fill('input[autocomplete="current-password"]', 'wrongpass')
    await page.locator('.login-btn').click()
    // Should show error message (one message from the component)
    await expect(page.locator('.el-message--error').first()).toBeVisible({ timeout: 5000 })
  })

  test('should redirect authenticated user from login to dashboard', async ({ page }) => {
    // Login first
    await page.goto('/login')
    await page.fill('input[autocomplete="username"]', 'admin')
    await page.fill('input[autocomplete="current-password"]', 'admin123')
    await page.locator('.login-btn').click()
    await page.waitForURL(/dashboard/, { timeout: 10000 })

    // Navigate client-side to /login via Vue Router (does NOT clear in-memory JWT).
    // This mimics a user clicking a link to /login while already authenticated.
    // __vue_app__ is the Vue 3 internal handle; accessible in E2E since we own the app.
    await page.evaluate(() => {
      const router = (document.querySelector('#app') as any)?.__vue_app__
        ?.config?.globalProperties?.$router
      if (router) router.push('/login')
    })
    // Router guard should redirect back to /dashboard since user is authenticated
    await expect(page).toHaveURL(/dashboard/, { timeout: 5000 })
  })
})
