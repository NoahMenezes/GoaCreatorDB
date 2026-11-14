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

export async function GET(request: Request) {
  const auth = await requireAuth()
  if (auth instanceof Response) return auth

  const { searchParams } = new URL(request.url)
  const collaborationId = searchParams.get('id')

  if (!collaborationId) {
    return NextResponse.json(
      { success: false, error: 'Collaboration ID is required' },
      { status: 400 }
    )
  }

  const db = await initDb()
  try {
    const collab = db
      .query(
        `SELECT c.*, cr.title as campaign_title, cr.objective, cr.compensation_type,
                u2.business_name, u2.email as business_email
         FROM collaborations c
         JOIN collaboration_requests cr ON c.request_id = cr.request_id
         JOIN users u2 ON c.business_id = u2.user_id
         WHERE c.collaboration_id = ? AND c.creator_id = ?`
      )
      .get(collaborationId, auth.user.user_id) as any | null

    if (!collab) {
      saveAndClose(db)
      return NextResponse.json(
        { success: false, error: 'Collaboration not found' },
        { status: 404 }
      )
    }

    // Get associated payment
    const payment = db
      .query('SELECT * FROM payments WHERE collaboration_id = ?')
      .get(collaborationId) as any | null

    // Get reviews
    const reviews = db
      .query('SELECT * FROM reviews WHERE collaboration_id = ?')
      .all(collaborationId) as any[]

    saveAndClose(db)
    return NextResponse.json({
      success: true,
      data: { ...collab, payment, reviews },
    })
  } catch {
    saveAndClose(db)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch collaboration details' },
      { status: 500 }
    )
  }
}
