import { test, expect } from '@playwright/test'
import { query } from '@/lib/db'

test.describe('Flow C: Business Complete & Review Flow', () => {
  test.beforeEach(async () => {
    // Ensure Café Palmeira has at least one accepted request to complete
    const bizRes = await query<{ business_id: number }>(`
      SELECT b.business_id
      FROM businesses b
      JOIN users u ON b.user_id = u.user_id
      WHERE u.email = 'palmeira@goaconnect.in'
    `)

    const businessId = bizRes.rows[0]?.business_id
    if (!businessId) return

    // Clean any prior reviews from Palmeira so that newly completed requests are reviewable
    await query(`
      DELETE FROM reviews
      WHERE request_id IN (SELECT request_id FROM collaboration_requests WHERE business_id = $1)
    `, [businessId])

    const acceptedCheck = await query<{ count: string }>(`
      SELECT COUNT(*)::text AS count
      FROM collaboration_requests
      WHERE business_id = $1 AND status = 'accepted'
    `, [businessId])

    if (parseInt(acceptedCheck.rows[0]?.count || '0', 10) === 0) {
      // Find an available creator
      const creatorRes = await query<{ creator_id: number }>('SELECT creator_id FROM creators LIMIT 1')
      if (creatorRes.rows[0]) {
        await query(`
          INSERT INTO collaboration_requests (
            business_id, creator_id, collab_type, offered_amount, deliverables, deadline, status, requested_at, responded_at
          )
          VALUES ($1, $2, 'paid', 15000, '1 Dedicated Reel & Story', CURRENT_DATE + INTERVAL '10 days', 'accepted', now() - INTERVAL '2 days', now() - INTERVAL '1 day')
        `, [businessId, creatorRes.rows[0].creator_id])
      }
    }
  })

  test('business completes accepted collaboration and submits a verified review', async ({ page }) => {
    // 1. Business logs in
    await page.goto('/login')
    await page.fill('input[type="email"]', 'palmeira@goaconnect.in')
    await page.fill('input[type="password"]', 'business123')
    await page.click('button:has-text("Sign In to GoaConnect")')

    await expect(page).toHaveURL(/\/business\/dashboard/, { timeout: 15000 })

    // 2. Navigate to business requests to complete an accepted collaboration
    await page.goto('/business/requests')
    await expect(page.locator('h1')).toContainText('Collaboration Requests')

    page.on('dialog', async (dialog) => {
      await dialog.accept()
    })

    const completeBtn = page.locator('button:has-text("Mark Completed")').first()
    await expect(completeBtn).toBeVisible({ timeout: 10000 })
    await completeBtn.click()

    // Verify it updates or page reflects completed status
    await expect(page.locator('span:has-text("Completed")').first()).toBeVisible({ timeout: 10000 })

    // 3. Navigate to Reviews page to leave a review
    await page.goto('/business/reviews')
    await expect(page.locator('h1')).toContainText('Business Ratings & Reviews')

    // Fill in review details
    const commentInput = page.locator('textarea')
    await expect(commentInput).toBeVisible({ timeout: 10000 })
    await commentInput.fill('Exceptional work! Highly professional and delivered gorgeous Goan visual aesthetics.')

    // Submit review
    await page.click('button:has-text("Publish Verified Review")')

    // Verify success banner appears
    await expect(
      page.locator('text=Review published to creator\'s verified public profile.')
    ).toBeVisible({ timeout: 10000 })
  })
})
