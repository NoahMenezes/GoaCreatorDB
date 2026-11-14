export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server'
import { initDb, closeDb, type SqlDatabase } from '@/lib/db'
import { requireAuth } from '@/lib/api-auth'

function saveAndClose(db: SqlDatabase) {
  try {
    const data = db.export()
    const fs = require('fs')
    const path = require('path')
    const dbDir = path.dirname(
      process.env.DATABASE_URL
        ? process.env.DATABASE_URL.replace(/^sqlite:/, '')
        : path.join(process.cwd(), '.data', 'goa-creator.db')
    )
    if (!fs.existsSync(dbDir)) fs.mkdirSync(dbDir, { recursive: true })
    fs.writeFileSync(
      process.env.DATABASE_URL
        ? process.env.DATABASE_URL.replace(/^sqlite:/, '')
        : path.join(process.cwd(), '.data', 'goa-creator.db'),
      Buffer.from(data)
    )
  } catch {}
  closeDb()
}

export async function GET() {
  const auth = await requireAuth()
  if (auth instanceof Response) return auth

  const db = await initDb()
  try {
    const user = db
      .query('SELECT user_id, email, role, is_verified, is_active, created_at, updated_at FROM users WHERE user_id = ?')
      .get(auth.user.user_id) as any | null

    if (!user) {
      saveAndClose(db)
      return NextResponse.json({ success: false, error: 'User not found' }, { status: 404 })
    }

    let profile: any = null
    if (user.role === 'creator') {
      profile = db
        .query('SELECT * FROM creators WHERE user_id = ?')
        .get(user.user_id) as any | null
    } else if (user.role === 'business') {
      profile = db
        .query('SELECT * FROM businesses WHERE user_id = ?')
        .get(user.user_id) as any | null
    }

    // Calculate profile completeness for creators
    let completeness = 0
    if (user.role === 'creator' && profile) {
      const fields = [
        profile.full_name,
        profile.bio,
        profile.location_id,
        profile.avatar_url,
      ]
      const filled = fields.filter((f: any) => f && f.toString().trim() !== '').length
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
      .get(auth.user.user_id) as any | null

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
          auth.user.user_id
        )
      } else {
        db.query(
          `INSERT INTO creators (creator_id, user_id, location_id, full_name, bio, accepts_barter, min_paid_rate, avatar_url, created_at)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`
        ).run(
          `cr-${auth.user.user_id.slice(-8)}`,
          auth.user.user_id,
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
