import { test, expect } from '@playwright/test'
import { query } from '@/lib/db'

test.describe('Flow D: Admin Verification Flow', () => {
  test.beforeEach(async () => {
    // Ensure at least one unverified user account exists
    await query(`
      UPDATE users
      SET is_verified = false
      WHERE user_id = (
        SELECT user_id FROM users WHERE role != 'admin' LIMIT 1
      )
    `)

    // Ensure at least one self_reported metric row exists
    await query(`
      UPDATE creator_metrics
      SET data_source = 'self_reported', verified_by = NULL
      WHERE metric_id = (
        SELECT metric_id FROM creator_metrics LIMIT 1
      )
    `)
  })

  test('admin logs in, verifies a user account, and verifies a metrics row', async ({ page }) => {
    // 1. Admin logs in
    await page.goto('/login')
    await page.fill('input[type="email"]', 'admin@goaconnect.in')
    await page.fill('input[type="password"]', 'admin123')
    await page.click('button:has-text("Sign In to GoaConnect")')

    // Redirected to admin overview
    await expect(page).toHaveURL(/\/admin/, { timeout: 15000 })
    await expect(page.locator('h1')).toContainText('Admin Overview & Control Center')

    // 2. Verify an unverified user account
    await expect(page.locator('button:has-text("Accounts")')).toBeVisible()
    const approveAccountBtn = page.locator('button:has-text("Approve Account")').first()
    await expect(approveAccountBtn).toBeVisible({ timeout: 10000 })
    await approveAccountBtn.click()

    // Verify success banner appears for user verification
    await expect(page.locator('text=verified successfully')).toBeVisible({ timeout: 10000 })

    // 3. Switch to Metrics tab and verify a metrics snapshot
    await page.click('button:has-text("Metrics Snapshots")')
    const approveMetricBtn = page.locator('button:has-text("Approve Metric")').first()
    await expect(approveMetricBtn).toBeVisible({ timeout: 10000 })
    await approveMetricBtn.click()

    // Verify success banner appears for metrics approval
    await expect(page.locator('text=approved and verified')).toBeVisible({ timeout: 10000 })
  })
})

