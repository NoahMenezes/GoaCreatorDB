export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server'
import { initDb, closeDb, type SqlDatabase } from '@/lib/db'
import { requireAuth } from '@/lib/api-auth'
import { saveAndClose } from '@/lib/api-auth'
import crypto from 'crypto'

export async function GET() {
  const auth = await requireAuth()
  if (auth instanceof Response) return auth

  const db = await initDb()
  try {
    const rows = db
      .query(
        'SELECT * FROM social_accounts WHERE user_id = ? ORDER BY created_at DESC'
      )
      .all(auth.user.user_id) as unknown as { account_id: string }[]
    saveAndClose(db)
    return NextResponse.json({ success: true, data: rows })
  } catch {
    saveAndClose(db)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch social accounts' },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  const auth = await requireAuth()
  if (auth instanceof Response) return auth

  const body = await request.json()
  const { platform, platform_user_id, username, profile_picture_url } = body

  if (!platform || !platform_user_id || !username) {
    return NextResponse.json(
      { success: false, error: 'Platform, platform user ID, and username are required' },
      { status: 400 }
    )
  }

  const db = await initDb()
  try {
    const accountId = `sa-${crypto.randomUUID().slice(0, 8)}`
    const now = new Date().toISOString()

    db.query(
      `INSERT INTO social_accounts (account_id, user_id, platform, platform_user_id, username, profile_picture_url, is_connected, connected_at, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
    ).run(
      accountId,
      auth.user.user_id,
      platform,
      platform_user_id,
      username,
      profile_picture_url || null,
      1,
      now,
      now,
      now
    )

    saveAndClose(db)
    return NextResponse.json({ success: true, data: { account_id: accountId } })
  } catch (err: unknown) {
    saveAndClose(db)
    const message = err instanceof Error ? err.message : ''
    if (message.includes('UNIQUE')) {
      return NextResponse.json(
        { success: false, error: 'This social account is already connected' },
        { status: 409 }
      )
    }
    return NextResponse.json(
      { success: false, error: 'Failed to connect social account' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: Request) {
  const auth = await requireAuth()
  if (auth instanceof Response) return auth

  const { searchParams } = new URL(request.url)
  const accountId = searchParams.get('id')

  if (!accountId) {
    return NextResponse.json(
      { success: false, error: 'Account ID is required' },
      { status: 400 }
    )
  }

  const db = await initDb()
  try {
    db.query('DELETE FROM social_accounts WHERE account_id = ? AND user_id = ?').run(
      accountId,
      auth.user.user_id
    )
    saveAndClose(db)
    return NextResponse.json({ success: true })
  } catch {
    saveAndClose(db)
    return NextResponse.json(
      { success: false, error: 'Failed to disconnect social account' },
      { status: 500 }
    )
  }
}
