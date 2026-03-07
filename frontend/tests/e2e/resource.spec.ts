import { test, expect } from '@playwright/test'

// Helper: login before each test
async function login(page: import('@playwright/test').Page) {
  await page.goto('/login')
  await page.fill('input[autocomplete="username"]', 'admin')
  await page.fill('input[autocomplete="current-password"]', 'admin123')
  await page.click('button:has-text("登录")')
  await page.waitForURL(/dashboard/, { timeout: 10000 })
}

test.describe('Resource Management Pages', () => {
  test.beforeEach(async ({ page }) => {
    await login(page)
  })

  test('should navigate to agent manager', async ({ page }) => {
    await page.click('text=Agent 管理')
    await expect(page).toHaveURL(/agents/)
    await expect(page.locator('.agent-manager')).toBeVisible()
  })

  test('should navigate to system overview', async ({ page }) => {
    await page.click('text=系统监控')
    await expect(page).toHaveURL(/system/)
    await expect(page.locator('.system-overview')).toBeVisible()
  })

  test('should navigate to process manager', async ({ page }) => {
    await page.click('text=进程管理')
    await expect(page).toHaveURL(/processes/)
    await expect(page.locator('.process-manager')).toBeVisible()
  })

  test('should navigate to disk manager', async ({ page }) => {
    await page.click('text=磁盘管理')
    await expect(page).toHaveURL(/disks/)
    await expect(page.locator('.disk-manager')).toBeVisible()
  })

  test('should navigate to file manager', async ({ page }) => {
    await page.click('text=文件管理')
    await expect(page).toHaveURL(/files/)
    await expect(page.locator('.file-manager')).toBeVisible()
  })

  test('should navigate to share manager', async ({ page }) => {
    await page.click('text=共享管理')
    await expect(page).toHaveURL(/shares/)
    await expect(page.locator('.share-manager')).toBeVisible()
  })

  test('should navigate to network ACL manager', async ({ page }) => {
    await page.click('text=网络与 ACL')
    await expect(page).toHaveURL(/network/)
    await expect(page.locator('.network-acl-manager')).toBeVisible()
  })

  test('agent manager should show add agent button', async ({ page }) => {
    await page.goto('/agents')
    await expect(page.locator('button:has-text("添加 Agent")')).toBeVisible()
  })
})
