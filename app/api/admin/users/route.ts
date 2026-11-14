export const dynamic = 'force-dynamic'
import { NextResponse } from 'next/server'
import { query, withTransaction } from '@/lib/db'
import { requireAdmin } from '@/lib/api-auth'

export async function GET(request: Request) {
  const auth = await requireAdmin(request)
  if (auth instanceof Response) return auth

  const { searchParams } = new URL(request.url)
  const q = searchParams.get('q')?.trim()
  const role = searchParams.get('role')?.toLowerCase()?.trim()
  const verified = searchParams.get('verified')

  const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10) || 1)
  const limit = Math.min(100, Math.max(1, parseInt(searchParams.get('limit') || '20', 10) || 20))
  const offset = (page - 1) * limit

  try {
    let sql = `
      SELECT
        u.user_id,
        u.email,
        u.role,
        u.is_verified,
        u.created_at,
        u.updated_at,
        c.creator_id,
        c.full_name AS creator_name,
        b.business_id,
        b.business_name,
        l.area_name,
        l.taluka,
        l.district,
        COALESCE(sa.handle, '') AS handle,
        COUNT(*) OVER() AS total_count
      FROM users u
      LEFT JOIN creators c ON u.user_id = c.user_id
      LEFT JOIN businesses b ON u.user_id = b.user_id
      LEFT JOIN locations l ON COALESCE(c.location_id, b.location_id) = l.location_id
      LEFT JOIN social_accounts sa ON c.creator_id = sa.creator_id AND sa.platform = 'instagram'
    `
    const conditions: string[] = []
    const params: unknown[] = []

    if (role && role !== 'all') {
      params.push(role)
      conditions.push(`u.role = $${params.length}`)
    }

    if (verified !== null && verified !== undefined && verified !== '') {
      const isVer = verified === 'true' || verified === '1'
      params.push(isVer)
      conditions.push(`u.is_verified = $${params.length}`)
    }

    if (q) {
      params.push(`%${q}%`)
      const paramIdx = params.length
      conditions.push(`(
        c.full_name ILIKE $${paramIdx}
        OR b.business_name ILIKE $${paramIdx}
        OR u.email ILIKE $${paramIdx}
        OR sa.handle ILIKE $${paramIdx}
        OR l.taluka ILIKE $${paramIdx}
        OR EXISTS (
          SELECT 1 FROM creator_categories cc
          JOIN categories cat ON cc.category_id = cat.category_id
          WHERE cc.creator_id = c.creator_id AND cat.category_name ILIKE $${paramIdx}
        )
      )`)
    }

    if (conditions.length > 0) {
      sql += ' WHERE ' + conditions.join(' AND ')
    }

    sql += ' ORDER BY u.created_at DESC'

    params.push(limit)
    sql += ` LIMIT $${params.length}`
    params.push(offset)
    sql += ` OFFSET $${params.length}`

    const res = await query(sql, params)
    const total = res.rows.length > 0 ? Number(res.rows[0].total_count) : 0
    const totalPages = Math.ceil(total / limit)

    const data = res.rows.map((row) => {
      const { total_count, ...cleanRow } = row
      return cleanRow
    })

    return NextResponse.json({
      success: true,
      data,
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1,
      },
    })
  } catch (err) {
    console.error('Failed to query admin users:', err)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch users' },
      { status: 500 }
    )
  }
}

export async function PATCH(request: Request) {
  const auth = await requireAdmin(request)
  if (auth instanceof Response) return auth

  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json(
      { success: false, error: 'Invalid JSON request body' },
      { status: 400 }
    )
  }

  const { user_id, id, is_verified } = body as { user_id?: number | string; id?: number | string; is_verified?: boolean }
  const targetId = Number(user_id || id)

  if (!targetId || isNaN(targetId) || typeof is_verified !== 'boolean') {
    return NextResponse.json(
      { success: false, error: 'Valid user_id and boolean is_verified are required' },
      { status: 400 }
    )
  }

  const adminUserId = Number(auth.user.user_id)

  try {
    const updateRes = await withTransaction(adminUserId, async (client) => {
      return client.query(
        'UPDATE users SET is_verified = $1 WHERE user_id = $2 RETURNING user_id, email, role, is_verified',
        [is_verified, targetId]
      )
    })

    if (updateRes.rows.length === 0) {
      return NextResponse.json({ success: false, error: 'User not found' }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      data: updateRes.rows[0],
      message: `User is_verified set to ${is_verified}`,
    })
  } catch (err) {
    console.error('Failed to update user verification:', err)
    return NextResponse.json(
      { success: false, error: 'Failed to update user verification' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: Request) {
  const auth = await requireAdmin(request)
  if (auth instanceof Response) return auth

  const { searchParams } = new URL(request.url)
  let targetId = Number(searchParams.get('id') || searchParams.get('user_id'))

  if (!targetId || isNaN(targetId)) {
    const body = await request.json().catch(() => ({}))
    targetId = Number(body.id || body.user_id)
  }

  if (!targetId || isNaN(targetId)) {
    return NextResponse.json(
      { success: false, error: 'Valid user_id is required' },
      { status: 400 }
    )
  }

  const adminUserId = Number(auth.user.user_id)

  // Safeguard 1: Cannot delete yourself
  if (targetId === adminUserId) {
    return NextResponse.json(
      { success: false, error: 'Cannot delete your own admin account' },
      { status: 409 }
    )
  }

  try {
    const userRes = await query<{ user_id: number; role: string }>('SELECT user_id, role FROM users WHERE user_id = $1', [targetId])
    if (userRes.rows.length === 0) {
      return NextResponse.json({ success: false, error: 'User not found' }, { status: 404 })
    }

    // Safeguard 2: Cannot delete the last admin
    if (userRes.rows[0].role === 'admin') {
      const adminCountRes = await query<{ count: number }>("SELECT COUNT(*)::int AS count FROM users WHERE role = 'admin'")
      if ((adminCountRes.rows[0]?.count || 0) <= 1) {
        return NextResponse.json(
          { success: false, error: 'Cannot delete the last remaining admin user' },
          { status: 409 }
        )
      }
    }

    await withTransaction(adminUserId, async (client) => {
      // Cascades per ERD
      await client.query('DELETE FROM users WHERE user_id = $1', [targetId])
    })

    return NextResponse.json({
      success: true,
      message: 'User deleted successfully',
    })
  } catch (err) {
    console.error('Failed to delete user:', err)
    return NextResponse.json(
      { success: false, error: 'Failed to delete user' },
      { status: 500 }
    )
  }
}

