export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server'
import { initDb } from '@/lib/db'
import { requireAuth, saveAndClose } from '@/lib/api-auth'
import crypto from 'crypto'


export async function GET(request: Request) {
  const auth = await requireAuth()
  if (auth instanceof Response) return auth

  const { searchParams } = new URL(request.url)
  const filter = searchParams.get('filter') || 'all'
  const business = searchParams.get('business')

  const db = await initDb()
  try {
    let query = `
      SELECT r.*, c.title as campaign_title,
             u2.business_name, u2.email as business_email
      FROM reviews r
      JOIN collaborations c ON r.collaboration_id = c.collaboration_id
      JOIN users u2 ON c.business_id = u2.user_id
      WHERE r.reviewer_id = ?
    `
    const params: unknown[] = [auth.user.user_id]

    if (filter === 'with-reviews') {
      query += ' AND r.comment IS NOT NULL AND r.comment != ""'
    }

    if (business) {
      query += ' AND u2.user_id = ?'
      params.push(business)
    }

    query += ' ORDER BY r.created_at DESC'

    const rows = db.query(query).all(params) as unknown as Record<string, unknown>[]
    saveAndClose(db)
    return NextResponse.json({ success: true, data: rows })
  } catch {
    saveAndClose(db)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch reviews' },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  const auth = await requireAuth()
  if (auth instanceof Response) return auth

  const body = await request.json()
  const { collaboration_id, rating, comment } = body

  if (!collaboration_id || !rating || rating < 1 || rating > 5) {
    return NextResponse.json(
      { success: false, error: 'Valid collaboration ID and rating (1-5) are required' },
      { status: 400 }
    )
  }

  const db = await initDb()
  try {
    // Verify collaboration exists, is completed, and belongs to this creator
    const collab = db
      .query(
        'SELECT * FROM collaborations WHERE collaboration_id = ? AND creator_id = ? AND status = ?'
      )
      .get(collaboration_id, auth.user.user_id, 'completed') as unknown as { [key: string]: unknown } | null

    if (!collab) {
      saveAndClose(db)
      return NextResponse.json(
        { success: false, error: 'Collaboration not found, not completed, or not owned by you' },
        { status: 404 }
      )
    }

    // Check for duplicate review
    const existing = db
      .query('SELECT COUNT(*) as cnt FROM reviews WHERE collaboration_id = ? AND reviewer_id = ?')
      .get(collaboration_id, auth.user.user_id) as { cnt: number } | null

    if (existing && existing.cnt > 0) {
      saveAndClose(db)
      return NextResponse.json(
        { success: false, error: 'You have already reviewed this collaboration' },
        { status: 409 }
      )
    }

    const reviewId = `rev-${crypto.randomUUID().slice(0, 8)}`
    const now = new Date().toISOString()

    db.query(
      `INSERT INTO reviews (review_id, collaboration_id, reviewer_id, reviewee_id, rating, comment, is_verified, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`
    ).run(
      reviewId,
      collaboration_id,
      auth.user.user_id,
      collab.business_id,
      rating,
      comment || null,
      1,
      now,
      now
    )

    // Notify business
    const notifId = `notif-${crypto.randomUUID().slice(0, 8)}`
    db.query(
      `INSERT INTO notifications (notification_id, user_id, type, title, message, is_read, link, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`
    ).run(
      notifId,
      collab.business_id,
      'review_received',
      'New Review Received',
      `You received a new ${rating}-star review for collaboration "${collab.title || collab.campaign_title}".`,
      0,
      `/business/reviews`,
      now
    )

    saveAndClose(db)
    return NextResponse.json({ success: true, data: { review_id: reviewId } })
  } catch {
    saveAndClose(db)
    return NextResponse.json(
      { success: false, error: 'Failed to submit review' },
      { status: 500 }
    )
  }
}
