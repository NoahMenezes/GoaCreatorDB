import { test, expect } from '@playwright/test'
import { query } from '@/lib/db'

test.describe('Flow A: Business Registration / Login & Collaboration Request', () => {
  test.beforeEach(async () => {
    // Clear any existing pending requests for Café Palmeira to guarantee clean slate for creating a new request
    await query(`
      DELETE FROM collaboration_requests
      WHERE business_id = (
        SELECT business_id FROM businesses WHERE user_id = (
          SELECT user_id FROM users WHERE email = 'palmeira@goaconnect.in'
        )
      )
      AND status = 'pending'
    `)
  })

  test('business logs in, discovers creators, and sends a collaboration request', async ({ page }) => {
    // 1. Business logs in
    await page.goto('/login')
    await expect(page.locator('h1')).toContainText('Welcome back to GoaConnect')

    await page.fill('input[type="email"]', 'palmeira@goaconnect.in')
    await page.fill('input[type="password"]', 'business123')
    await page.click('button:has-text("Sign In to GoaConnect")')

    // Verify redirected to business dashboard
    await expect(page).toHaveURL(/\/business\/dashboard/, { timeout: 15000 })
    await expect(page.locator('h1')).toContainText('Welcome back, Café Palmeira')

    // 2. Discover creators
    await page.goto('/business/discover')
    await expect(page.locator('h1')).toContainText('Discover Goan Creators')
    await expect(page.locator('div[data-creator-card]').first()).toBeVisible({ timeout: 15000 })

    // 3. Open New Request modal
    await page.click('button:has-text("New Request")')
    await expect(page.locator('h2:has-text("Send Collaboration Request")')).toBeVisible()

    // Select Rahul Naik if available in options, or select the first option
    const creatorSelect = page.locator('select').filter({ hasText: /Rahul|Creator/i }).first()
    if (await creatorSelect.isVisible().catch(() => false)) {
      const options = await creatorSelect.locator('option').allTextContents()
      const rahulOption = options.find((opt) => opt.includes('Rahul'))
      if (rahulOption) {
        await creatorSelect.selectOption({ label: rahulOption })
      }
    }

    // Fill campaign brief
    const briefInput = page.locator('input[required]').first()
    await briefInput.fill('E2E Goa Creator Showcase Campaign')

    // Submit request
    await page.click('button:has-text("Lock Deal & Submit Request")')

    // Verify request submitted successfully
    await expect(page.locator('h3:has-text("Request Sent")')).toBeVisible({ timeout: 10000 })
  })
})
