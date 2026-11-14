import { test, expect } from '@playwright/test'
import { query } from '@/lib/db'

test.describe('Flow B: Creator Accept Flow', () => {
  test.beforeEach(async () => {
    // Ensure Rahul has at least one pending request to accept
    const res = await query<{ count: string }>(`
      SELECT COUNT(*)::text AS count
      FROM collaboration_requests cr
      JOIN creators c ON cr.creator_id = c.creator_id
      JOIN users u ON c.user_id = u.user_id
      WHERE u.email = 'rahul@goaconnect.in' AND cr.status = 'pending'
    `)

    if (parseInt(res.rows[0]?.count || '0', 10) === 0) {
      const bizRes = await query<{ business_id: number }>('SELECT business_id FROM businesses LIMIT 1')
      const creatorRes = await query<{ creator_id: number }>(`
        SELECT c.creator_id
        FROM creators c
        JOIN users u ON c.user_id = u.user_id
        WHERE u.email = 'rahul@goaconnect.in'
      `)
      if (bizRes.rows[0] && creatorRes.rows[0]) {
        // Clear any old pending pairs between these two
        await query(
          'DELETE FROM collaboration_requests WHERE business_id = $1 AND creator_id = $2 AND status = $3',
          [bizRes.rows[0].business_id, creatorRes.rows[0].creator_id, 'pending']
        )
        await query(`
          INSERT INTO collaboration_requests (
            business_id, creator_id, collab_type, offered_amount, deliverables, deadline, status, requested_at
          )
          VALUES ($1, $2, 'paid', 14000, '1 Dedicated Instagram Reel', CURRENT_DATE + INTERVAL '14 days', 'pending', now())
        `, [bizRes.rows[0].business_id, creatorRes.rows[0].creator_id])
      }
    }
  })

  test('creator logs in and accepts collaboration request', async ({ page }) => {
    // 1. Creator logs in
    await page.goto('/login')
    await page.click('button:has-text("Creator Account")')
    await page.fill('input[type="email"]', 'rahul@goaconnect.in')
    await page.fill('input[type="password"]', 'creator123')
    await page.click('button:has-text("Sign In to GoaConnect")')

    // Redirected to creator dashboard
    await expect(page).toHaveURL(/\/creator\/dashboard/, { timeout: 15000 })

    // 2. Navigate to requests page
    await page.goto('/creator/requests')
    await expect(page.locator('h1')).toContainText('Collaboration Requests')

    // Handle the window confirm dialog
    page.on('dialog', async (dialog) => {
      await dialog.accept()
    })

    // 3. Find and click "Accept Request"
    const acceptBtn = page.locator('button:has-text("Accept Request")').first()
    await expect(acceptBtn).toBeVisible({ timeout: 10000 })
    await acceptBtn.click()

    // 4. Verify request transitions to accepted state
    await expect(
      page.locator('span:has-text("Accepted • In Progress"), a:has-text("View Collaboration")').first()
    ).toBeVisible({ timeout: 10000 })
  })
})

