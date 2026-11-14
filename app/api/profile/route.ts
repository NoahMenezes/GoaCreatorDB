export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server'
import { initDb } from '@/lib/db'
import { requireAuth, saveAndClose } from '@/lib/api-auth'


export async function GET() {
  const auth = await requireAuth()
  if (auth instanceof Response) return auth

  const db = await initDb()
  try {
    const user = db
      .query('SELECT user_id, email, role, is_verified, is_active, created_at, updated_at FROM users WHERE user_id = ?')
      .get(auth.user.user_id) as unknown as { [key: string]: unknown } | null

    if (!user) {
      saveAndClose(db)
      return NextResponse.json({ success: false, error: 'User not found' }, { status: 404 })
    }

    let profile: Record<string, unknown> | null = null
    if (user.role === 'creator') {
      profile = db
        .query('SELECT * FROM creators WHERE user_id = ?')
        .get(user.user_id) as unknown as { [key: string]: unknown } | null
    } else if (user.role === 'business') {
      profile = db
        .query('SELECT * FROM businesses WHERE user_id = ?')
        .get(user.user_id) as unknown as { [key: string]: unknown } | null
    }

    // Calculate profile completeness for creators
    let completeness = 0
    if (user.role === 'creator' && profile) {
      const p = profile as { full_name: string; bio: string; location_id: string; avatar_url: string | null }
      const fields = [
        p.full_name,
        p.bio,
        p.location_id,
        p.avatar_url,
      ]
      const filled = fields.filter((f: string | null) => f && f.trim() !== '').length
      completeness = Math.round((filled / fields.length) * 100)
    }

    saveAndClose(db)
    return NextResponse.json({
      success: true,
      data: { user, profile, completeness },
    })
  } catch {
    saveAndClose(db)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch profile' },
      { status: 500 }
    )
  }
}

export async function PUT(request: Request) {
  const auth = await requireAuth()
  if (auth instanceof Response) return auth

  const body = await request.json()
  const db = await initDb()
  try {
    const user = db
      .query('SELECT role FROM users WHERE user_id = ?')
      .get(auth.user.user_id) as unknown as { [key: string]: unknown } | null

    if (!user) {
      saveAndClose(db)
      return NextResponse.json({ success: false, error: 'User not found' }, { status: 404 })
    }

    const now = new Date().toISOString()

    if (user.role === 'creator') {
      const {
        full_name, bio, accepts_barter, min_paid_rate, location_id,
      } = body

      const existing = db
        .query('SELECT COUNT(*) as cnt FROM creators WHERE user_id = ?')
        .get(auth.user.user_id) as { cnt: number }

      const userId = auth.user.user_id as string

      if (existing.cnt > 0) {
        db.query(
          `UPDATE creators SET full_name = ?, bio = ?, accepts_barter = ?, min_paid_rate = ?, location_id = ?, created_at = COALESCE(created_at, ?) WHERE user_id = ?`
        ).run(
          full_name || null,
          bio || null,
          accepts_barter ? 1 : 0,
          min_paid_rate || 0,
          location_id || null,
          now,
          userId
        )
      } else {
        db.query(
          `INSERT INTO creators (creator_id, user_id, location_id, full_name, bio, accepts_barter, min_paid_rate, avatar_url, created_at)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`
        ).run(
          `cr-${userId.slice(-8)}`,
          userId,
          location_id || '',
          full_name || '',
          bio || '',
          accepts_barter ? 1 : 0,
          min_paid_rate || 0,
          null,
          now
        )
      }
    }

    saveAndClose(db)
    return NextResponse.json({ success: true })
  } catch {
    saveAndClose(db)
    return NextResponse.json(
      { success: false, error: 'Failed to update profile' },
      { status: 500 }
    )
  }
}
