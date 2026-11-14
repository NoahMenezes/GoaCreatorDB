export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server'
import { initDb } from '@/lib/db'
import { requireAuth, saveAndClose } from '@/lib/api-auth'


export async function GET() {
  const auth = await requireAuth()
  if (auth instanceof Response) return auth

  const db = await initDb()
  try {
    const rows = db
      .query(
        'SELECT * FROM notifications WHERE user_id = ? ORDER BY created_at DESC LIMIT 50'
      )
      .all(auth.user.user_id) as unknown as Record<string, unknown>[]
    saveAndClose(db)
    return NextResponse.json({ success: true, data: rows })
  } catch {
    saveAndClose(db)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch notifications' },
      { status: 500 }
    )
  }
}

export async function PATCH(request: Request) {
  const auth = await requireAuth()
  if (auth instanceof Response) return auth

  const body = await request.json()
  const { notification_id, is_read } = body

  if (!notification_id) {
    return NextResponse.json(
      { success: false, error: 'Notification ID is required' },
      { status: 400 }
    )
  }

  const db = await initDb()
  try {
    db.query('UPDATE notifications SET is_read = ? WHERE notification_id = ? AND user_id = ?').run(
      is_read ? 1 : 0,
      notification_id,
      auth.user.user_id
    )
    saveAndClose(db)
    return NextResponse.json({ success: true })
  } catch {
    saveAndClose(db)
    return NextResponse.json(
      { success: false, error: 'Failed to update notification' },
      { status: 500 }
    )
  }
}
