export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server'
import { initDb, closeDb, type SqlDatabase } from '@/lib/db'
import { requireAuth } from '@/lib/api-auth'
import crypto from 'crypto'

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
  const role = auth.user.role

  const db = await initDb()
  try {
    let query = `
      SELECT cr.*, u.email as creator_email, u2.email as business_email
      FROM collaboration_requests cr
      JOIN users u ON cr.creator_id = u.user_id
      JOIN users u2 ON cr.business_id = u2.user_id
      WHERE ${role === 'creator' ? 'cr.creator_id = ?' : 'cr.business_id = ?'}
    `
    const params: any[] = [auth.user.user_id]

    if (status && status !== 'all') {
      query += ' AND cr.status = ?'
      params.push(status)
    }

    query += ' ORDER BY cr.created_at DESC'

    const rows = db.query(query).all(params) as any[]
    saveAndClose(db)
    return NextResponse.json({ success: true, data: rows })
  } catch {
    saveAndClose(db)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch collaboration requests' },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  const auth = await requireAuth()
  if (auth instanceof Response) return auth

  if (auth.user.role !== 'business') {
    return NextResponse.json(
      { success: false, error: 'Only business accounts can create requests' },
      { status: 403 }
    )
  }

  const body = await request.json()
  const {
    creator_id,
    title,
    objective,
    compensation_amount,
    compensation_type,
    collaboration_type,
    deliverables,
    shoot_date,
    deadline,
    usage_terms,
    licensing_terms,
  } = body

  if (!creator_id || !title || !objective || !compensation_amount || !compensation_type) {
    return NextResponse.json(
      { success: false, error: 'Missing required fields' },
      { status: 400 }
    )
  }

  const db = await initDb()
  try {
    const requestId = `req-${crypto.randomUUID().slice(0, 8)}`
    const now = new Date().toISOString()

    db.query(
      `INSERT INTO collaboration_requests (request_id, creator_id, business_id, title, objective, compensation_amount, compensation_type, collaboration_type, deliverables, shoot_date, deadline, usage_terms, licensing_terms, status, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
    ).run(
      requestId,
      creator_id,
      auth.user.user_id,
      title,
      objective,
      compensation_amount,
      compensation_type,
      collaboration_type || 'hybrid',
      JSON.stringify(deliverables || []),
      shoot_date || null,
      deadline || null,
      usage_terms || null,
      licensing_terms || null,
      'pending',
      now,
      now
    )

    // Create notification for creator
    const notifId = `notif-${crypto.randomUUID().slice(0, 8)}`
    db.query(
      `INSERT INTO notifications (notification_id, user_id, type, title, message, is_read, link, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`
    ).run(
      notifId,
      creator_id,
      'request_received',
      'New Collaboration Request',
      `You have received a new collaboration request: ${title}`,
      0,
      `/creator/requests`,
      now
    )

    saveAndClose(db)
    return NextResponse.json({ success: true, data: { request_id: requestId } })
  } catch {
    saveAndClose(db)
    return NextResponse.json(
      { success: false, error: 'Failed to create collaboration request' },
      { status: 500 }
    )
  }
}
