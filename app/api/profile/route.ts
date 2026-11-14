export const dynamic = 'force-dynamic'
import { NextResponse } from 'next/server'
import { query, withTransaction } from '@/lib/db'
import { requireAuth } from '@/lib/api-auth'

export async function GET(request?: Request) {
  const auth = await requireAuth(request)
  if (auth instanceof Response) return auth

  const userId = Number(auth.user.user_id)
  const role = auth.role

  try {
    const userRes = await query(
      'SELECT user_id, email, role, is_verified, created_at, updated_at FROM users WHERE user_id = $1',
      [userId]
    )

    if (userRes.rows.length === 0) {
      return NextResponse.json({ success: false, error: 'User not found' }, { status: 404 })
    }

    const user = userRes.rows[0]
    let profile: Record<string, unknown> | null = null
    let categories: unknown[] = []

    if (role === 'creator') {
      const crRes = await query(
        `SELECT c.*, l.area_name, l.taluka, l.district
         FROM creators c
         JOIN locations l ON c.location_id = l.location_id
         WHERE c.user_id = $1`,
        [userId]
      )
      profile = crRes.rows[0] ?? null

      if (profile) {
        const catRes = await query(
          `SELECT cat.category_id, cat.category_name, cc.is_primary
           FROM creator_categories cc
           JOIN categories cat ON cc.category_id = cat.category_id
           WHERE cc.creator_id = $1
           ORDER BY cc.is_primary DESC, cat.category_name ASC`,
          [profile.creator_id]
        )
        categories = catRes.rows
      }
    } else if (role === 'business') {
      const bizRes = await query(
        `SELECT b.*, l.area_name, l.taluka, l.district
         FROM businesses b
         JOIN locations l ON b.location_id = l.location_id
         WHERE b.user_id = $1`,
        [userId]
      )
      profile = bizRes.rows[0] ?? null
    }

    // Profile completeness calculation
    let completeness = 0
    if (role === 'creator' && profile) {
      const p = profile as { full_name?: string; bio?: string; location_id?: number }
      let score = 20 // Base account creation
      if (p.full_name && p.full_name.trim()) score += 20
      if (p.bio && p.bio.trim()) score += 20
      if (p.location_id) score += 20
      if (categories.length > 0) score += 20
      completeness = Math.min(100, score)
    }

    return NextResponse.json({
      success: true,
      data: {
        user,
        profile,
        categories,
        completeness,
      },
    })
  } catch (err) {
    console.error('Failed to fetch profile:', err)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch profile' },
      { status: 500 }
    )
  }
}

export async function PUT(request: Request) {
  const auth = await requireAuth(request)
  if (auth instanceof Response) return auth

  const userId = Number(auth.user.user_id)
  const role = auth.role
  const body = await request.json()

  try {
    if (role === 'creator') {
      const { full_name, bio, accepts_barter, min_paid_rate, location_id, categories } = body

      // Validate location_id if provided
      if (location_id !== undefined) {
        const locId = Number(location_id)
        if (!locId || isNaN(locId) || locId <= 0) {
          return NextResponse.json(
            { success: false, error: 'Valid location_id is required' },
            { status: 422 }
          )
        }
        const locCheck = await query('SELECT location_id FROM locations WHERE location_id = $1', [locId])
        if (locCheck.rows.length === 0) {
          return NextResponse.json(
            { success: false, error: 'Location not found' },
            { status: 422 }
          )
        }
      }

      await withTransaction(userId, async (client) => {
        // 1. Update creators fields
        const crRes = await client.query<{ creator_id: number }>(
          `UPDATE creators
           SET full_name = COALESCE($1, full_name),
               bio = COALESCE($2, bio),
               accepts_barter = COALESCE($3, accepts_barter),
               min_paid_rate = COALESCE($4, min_paid_rate),
               location_id = COALESCE($5, location_id)
           WHERE user_id = $6
           RETURNING creator_id`,
          [
            full_name !== undefined ? full_name : null,
            bio !== undefined ? bio : null,
            accepts_barter !== undefined ? Boolean(accepts_barter) : null,
            min_paid_rate !== undefined ? Number(min_paid_rate) : null,
            location_id !== undefined ? Number(location_id) : null,
            userId,
          ]
        )

        if (crRes.rows.length === 0) {
          throw new Error('Creator profile not found')
        }
        const creatorId = crRes.rows[0].creator_id

        // 2. If categories provided, replace the whole set with exactly one primary
        if (Array.isArray(categories) && categories.length > 0) {
          await client.query('DELETE FROM creator_categories WHERE creator_id = $1', [creatorId])

          let hasPrimary = false
          for (let i = 0; i < categories.length; i++) {
            const item = categories[i]
            const catId = typeof item === 'object' ? Number(item.category_id) : Number(item)
            let isPrimary = typeof item === 'object' ? Boolean(item.is_primary) : false

            // Ensure exactly one category is primary
            if (isPrimary && !hasPrimary) {
              hasPrimary = true
            } else if (isPrimary && hasPrimary) {
              isPrimary = false
            }

            // If we are at the last item and still no primary, make the first item primary
            if (i === categories.length - 1 && !hasPrimary) {
              isPrimary = true
            }

            await client.query(
              `INSERT INTO creator_categories (creator_id, category_id, is_primary)
               VALUES ($1, $2, $3)
               ON CONFLICT (creator_id, category_id) DO UPDATE SET is_primary = EXCLUDED.is_primary`,
              [creatorId, catId, isPrimary]
            )
          }
        }
      })

      return NextResponse.json({
        success: true,
        message: 'Creator profile updated successfully',
      })
    } else if (role === 'business') {
      const { business_name, industry, description, contact_phone, instagram_handle, location_id } = body

      // Validate location_id if provided
      if (location_id !== undefined) {
        const locId = Number(location_id)
        if (!locId || isNaN(locId) || locId <= 0) {
          return NextResponse.json(
            { success: false, error: 'Valid location_id is required' },
            { status: 422 }
          )
        }
        const locCheck = await query('SELECT location_id FROM locations WHERE location_id = $1', [locId])
        if (locCheck.rows.length === 0) {
          return NextResponse.json(
            { success: false, error: 'Location not found' },
            { status: 422 }
          )
        }
      }

      await query(
        `UPDATE businesses
         SET business_name = COALESCE($1, business_name),
             industry = COALESCE($2, industry),
             description = COALESCE($3, description),
             contact_phone = COALESCE($4, contact_phone),
             instagram_handle = COALESCE($5, instagram_handle),
             location_id = COALESCE($6, location_id)
         WHERE user_id = $7`,
        [
          business_name !== undefined ? business_name : null,
          industry !== undefined ? industry : null,
          description !== undefined ? description : null,
          contact_phone !== undefined ? contact_phone : null,
          instagram_handle !== undefined ? instagram_handle : null,
          location_id !== undefined ? Number(location_id) : null,
          userId,
        ]
      )

      return NextResponse.json({
        success: true,
        message: 'Business profile updated successfully',
      })
    }

    return NextResponse.json(
      { success: false, error: 'Invalid user role' },
      { status: 400 }
    )
  } catch (err: unknown) {
    console.error('Failed to update profile:', err)
    const errorMsg = err instanceof Error ? err.message : 'Failed to update profile'
    return NextResponse.json(
      { success: false, error: errorMsg },
      { status: 500 }
    )
  }
}
