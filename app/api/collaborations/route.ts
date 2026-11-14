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
  const status = searchParams.get('status')

  const db = await initDb()
  try {
    let query = `
      SELECT c.*, cr.title as campaign_title, cr.compensation_type,
             u2.email as business_email, u2.user_id as business_user_id
      FROM collaborations c
      JOIN collaboration_requests cr ON c.request_id = cr.request_id
      JOIN users u2 ON c.business_id = u2.user_id
      WHERE c.creator_id = ?
    `
    const params: any[] = [auth.user.user_id]

    if (status && status !== 'all') {
      query += ' AND c.status = ?'
      params.push(status)
    }

    query += ' ORDER BY c.created_at DESC'

    const rows = db.query(query).all(params) as any[]
    saveAndClose(db)
    return NextResponse.json({ success: true, data: rows })
  } catch {
    saveAndClose(db)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch collaborations' },
      { status: 500 }
    )
  }
}
