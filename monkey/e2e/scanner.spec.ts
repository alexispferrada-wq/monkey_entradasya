import { test, expect } from '@playwright/test'

/**
 * E2E tests for the QR scanner.
 * Note: Camera access cannot be tested in headless mode; these tests verify
 * the scanner UI, state transitions, and error handling without real camera input.
 */

test.describe('QR Scanner', () => {
  test('scanner page loads in < 500ms', async ({ page }) => {
    const start = Date.now()
    await page.goto('/scanner')
    await page.waitForLoadState('domcontentloaded')
    const elapsed = Date.now() - start

    // SLA: scanner page (PWA shell) must load fast
    expect(elapsed).toBeLessThan(500)
  })

  test('shows idle state with "Iniciar cámara" button', async ({ page }) => {
    await page.goto('/scanner')

    await expect(page.locator('text=Scanner QR')).toBeVisible()
    await expect(page.locator('button', { hasText: 'Iniciar cámara' })).toBeVisible()
  })

  test('shows scan counter in header', async ({ page }) => {
    await page.goto('/scanner')
    // Scan count is shown in the header ("X escaneados hoy")
    await expect(page.locator('text=escaneados')).toBeVisible()
  })

  test('shows session timer in header', async ({ page }) => {
    await page.goto('/scanner')
    // Session timer should appear quickly
    await expect(page.locator('text=Sesión')).toBeVisible({ timeout: 3000 })
  })

  test('shows camera permission error gracefully', async ({ page, context }) => {
    // Deny camera permission
    await context.grantPermissions([], { origin: 'http://localhost:3001' })

    await page.goto('/scanner')
    const startButton = page.locator('button', { hasText: 'Iniciar cámara' })
    await startButton.click()

    // Should show a user-friendly error, not a raw browser error
    await expect(
      page.locator('text=cámara').or(page.locator('text=permisos'))
    ).toBeVisible({ timeout: 3000 })
  })
})

test.describe('Security: Admin auth redirect', () => {
  test('redirects /admin to /admin/login when not authenticated', async ({ page }) => {
    await page.goto('/admin')
    await expect(page).toHaveURL(/admin\/login/, { timeout: 3000 })
  })

  test('admin login page loads correctly', async ({ page }) => {
    await page.goto('/admin/login')
    await expect(page.locator('input[type="password"]')).toBeVisible()
  })

  test('admin login rejects wrong credentials', async ({ page }) => {
    await page.goto('/admin/login')

    await page.locator('input[name="usuario"]').or(page.locator('input[type="text"]').first()).fill('admin')
    await page.locator('input[type="password"]').fill('wrongpassword123')
    await page.locator('button[type="submit"]').click()

    await expect(
      page.locator('text=incorrectas').or(page.locator('text=inválidas'))
    ).toBeVisible({ timeout: 3000 })
  })
})

test.describe('Performance: admin dashboard', () => {
  test.skip(
    !process.env.ADMIN_PASSWORD,
    'Set ADMIN_PASSWORD env var to run admin performance tests'
  )

  test('admin dashboard loads in < 2000ms after login', async ({ page }) => {
    // Login
    await page.goto('/admin/login')
    await page.locator('input[type="text"]').first().fill(process.env.ADMIN_USER || 'admin')
    await page.locator('input[type="password"]').fill(process.env.ADMIN_PASSWORD || '')
    await page.locator('button[type="submit"]').click()

    const start = Date.now()
    await page.waitForURL(/\/admin$/, { timeout: 5000 })
    await page.waitForLoadState('networkidle')
    const elapsed = Date.now() - start

    console.log(`Admin dashboard load time: ${elapsed}ms`)
    expect(elapsed).toBeLessThan(2000)
  })
})
