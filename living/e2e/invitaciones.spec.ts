import { test, expect } from '@playwright/test'

/**
 * E2E tests for the invitation request flow.
 * These tests verify the complete user journey: landing page → event page → form submission.
 */

test.describe('Invitation flow', () => {
  test('homepage loads and shows event list or "Próximamente"', async ({ page }) => {
    const start = Date.now()
    await page.goto('/')
    const elapsed = Date.now() - start

    // SLA: homepage must load in < 2000ms
    expect(elapsed).toBeLessThan(2000)

    await expect(page.locator('h1')).toBeVisible()
    // Either events are shown or the empty state
    const hasEvents = await page.locator('a[href^="/"]').count()
    const hasEmptyState = await page.locator('text=Próximamente').isVisible().catch(() => false)
    expect(hasEvents > 0 || hasEmptyState).toBeTruthy()
  })

  test('navbar is visible and has the Living Club logo', async ({ page }) => {
    await page.goto('/')
    const nav = page.locator('nav')
    await expect(nav).toBeVisible()
    // Logo image inside nav
    const logo = nav.locator('img')
    await expect(logo).toBeVisible()
  })

  test('invitation form rejects disposable email', async ({ page }) => {
    // This test only runs if there are active events with a slug
    await page.goto('/')
    const eventLink = page.locator('a[href^="/"][href!="/"][href!="/club"]').first()
    const hasEvents = (await eventLink.count()) > 0
    test.skip(!hasEvents, 'No active events available')

    const href = await eventLink.getAttribute('href')
    if (!href) return

    await page.goto(href)
    await page.waitForLoadState('networkidle')

    // Fill in the invitation form with a disposable email
    const nombreInput = page.locator('input[type="text"]').first()
    const emailInput = page.locator('input[type="email"]').first()

    await nombreInput.fill('Test User')
    await emailInput.fill('test@mailinator.com')
    await page.locator('button[type="submit"]').click()

    // Expect an error message about disposable email
    await expect(page.locator('text=descartables').or(page.locator('text=temporales'))).toBeVisible({
      timeout: 5000,
    })
  })

  test('invitation form rejects empty fields', async ({ page }) => {
    await page.goto('/')
    const eventLink = page.locator('a[href^="/"][href!="/"][href!="/club"]').first()
    const hasEvents = (await eventLink.count()) > 0
    test.skip(!hasEvents, 'No active events available')

    const href = await eventLink.getAttribute('href')
    if (!href) return

    await page.goto(href)
    await page.waitForLoadState('networkidle')

    // Try submitting without filling the form
    await page.locator('button[type="submit"]').click()

    // HTML5 validation should prevent submission
    const nombreInput = page.locator('input[type="text"]').first()
    await expect(nombreInput).toBeFocused()
  })

  test('club page loads under 1 second', async ({ page }) => {
    const start = Date.now()
    await page.goto('/club')
    await page.waitForLoadState('domcontentloaded')
    const elapsed = Date.now() - start

    expect(elapsed).toBeLessThan(1000)
    await expect(page.locator('text=Club Living')).toBeVisible()
  })

  test('club registration rejects disposable email', async ({ page }) => {
    await page.goto('/club')

    const nombreInput = page.locator('input[type="text"]').first()
    const emailInput = page.locator('input[type="email"]').first()
    const submitButton = page.locator('button[type="submit"]')

    await nombreInput.fill('Test Person')
    await emailInput.fill('fake@yopmail.com')
    await submitButton.click()

    await expect(
      page.locator('text=descartables').or(page.locator('text=temporales'))
    ).toBeVisible({ timeout: 5000 })
  })
})
