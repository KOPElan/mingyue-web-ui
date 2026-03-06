import { test, expect } from '@playwright/test'

test.describe('Login Page', () => {
  test('should display login form', async ({ page }) => {
    await page.goto('/')
    await expect(page).toHaveURL(/login/)
    await expect(page.locator('.login-card')).toBeVisible()
  })

  test('should show validation errors on empty submit', async ({ page }) => {
    await page.goto('/login')
    const loginBtn = page.getByRole('button', { name: /登录|Login/ })
    await loginBtn.click()
    // Should show validation message
    await expect(page.locator('.el-form-item__error')).toBeVisible()
  })

  test('should login with valid credentials', async ({ page }) => {
    await page.goto('/login')
    await page.fill('input[autocomplete="username"]', 'admin')
    await page.fill('input[autocomplete="current-password"]', 'admin123')
    await page.click('button:has-text("登录")')
    // Should redirect to dashboard after login
    await page.waitForURL(/dashboard/, { timeout: 5000 })
    await expect(page).toHaveURL(/dashboard/)
  })

  test('should show error for invalid credentials', async ({ page }) => {
    await page.goto('/login')
    await page.fill('input[autocomplete="username"]', 'wronguser')
    await page.fill('input[autocomplete="current-password"]', 'wrongpass')
    await page.click('button:has-text("登录")')
    // Should show error message
    await expect(page.locator('.el-message')).toBeVisible({ timeout: 3000 })
  })

  test('should redirect authenticated user from login to dashboard', async ({ page }) => {
    // Login first
    await page.goto('/login')
    await page.fill('input[autocomplete="username"]', 'admin')
    await page.fill('input[autocomplete="current-password"]', 'admin123')
    await page.click('button:has-text("登录")')
    await page.waitForURL(/dashboard/, { timeout: 5000 })

    // Try to go back to login - should redirect to dashboard
    await page.goto('/login')
    await expect(page).toHaveURL(/dashboard/)
  })
})
