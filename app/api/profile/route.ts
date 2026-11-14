export const dynamic = 'force-dynamic'
import { NextResponse } from 'next/server'
import { query } from '@/lib/db'
import { requireAuth } from '@/lib/api-auth'

export async function GET() {
  const auth = await requireAuth()
  if (auth instanceof Response) return auth

  const userId = Number(auth.user.user_id)

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

    if (user.role === 'creator') {
      const crRes = await query(
        `SELECT c.*, l.area_name, l.taluka, l.district
         FROM creators c
         JOIN locations l ON c.location_id = l.location_id
         WHERE c.user_id = $1`,
        [userId]
      )
      profile = crRes.rows[0] ?? null
    } else if (user.role === 'business') {
      const bizRes = await query(
        `SELECT b.*, l.area_name, l.taluka, l.district
         FROM businesses b
         JOIN locations l ON b.location_id = l.location_id
         WHERE b.user_id = $1`,
        [userId]
      )
      profile = bizRes.rows[0] ?? null
    }

    // Calculate profile completeness for creators
    let completeness = 0
    if (user.role === 'creator' && profile) {
      const p = profile as { full_name: string; bio: string | null; location_id: number | null }
      const fields = [p.full_name, p.bio, p.location_id]
      const filled = fields.filter((f) => f !== null && f !== undefined && String(f).trim() !== '').length
      completeness = Math.round((filled / fields.length) * 100)
    }

    return NextResponse.json({
      success: true,
      data: { user, profile, completeness },
    })
  } catch {
    return NextResponse.json(
      { success: false, error: 'Failed to fetch profile' },
      { status: 500 }
    )
  }
}

export async function PUT(request: Request) {
  const auth = await requireAuth()
  if (auth instanceof Response) return auth

  const userId = Number(auth.user.user_id)
  const body = await request.json()

  try {
    if (auth.role === 'creator') {
      const { full_name, bio, accepts_barter, min_paid_rate, location_id } = body
      const locId = Number(location_id) || 1

      await query(
        `UPDATE creators
         SET full_name = COALESCE($1, full_name),
             bio = COALESCE($2, bio),
             accepts_barter = COALESCE($3, accepts_barter),
             min_paid_rate = COALESCE($4, min_paid_rate),
             location_id = COALESCE($5, location_id)
         WHERE user_id = $6`,
        [
          full_name ?? null,
          bio ?? null,
          accepts_barter !== undefined ? Boolean(accepts_barter) : null,
          min_paid_rate !== undefined ? Number(min_paid_rate) : null,
          locId,
          userId,
        ]
      )
    } else if (auth.role === 'business') {
      const { business_name, industry, description, contact_phone, instagram_handle, location_id } = body
      const locId = Number(location_id) || 1

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
          business_name ?? null,
          industry ?? null,
          description ?? null,
          contact_phone ?? null,
          instagram_handle ?? null,
          locId,
          userId,
        ]
      )
    }

    return NextResponse.json({ success: true })
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : 'Failed to update profile'
    return NextResponse.json(
      { success: false, error: errorMsg },
      { status: 500 }
    )
  }
}
