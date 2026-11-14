export const dynamic = 'force-dynamic'
import { NextResponse } from 'next/server'
import { query } from '@/lib/db'
import { requireAuth } from '@/lib/api-auth'

export async function GET(request: Request) {
  const auth = await requireAuth()
  if (auth instanceof Response) return auth

  const { searchParams } = new URL(request.url)
  const filter = searchParams.get('filter') || 'all'
  const userId = Number(auth.user.user_id)

  try {
    let sql = `
      SELECT
        r.*,
        cr.offer_details,
        b.business_name,
        c.full_name AS creator_name,
        ur.email AS reviewer_email,
        ue.email AS reviewee_email
      FROM reviews r
      JOIN collaboration_requests cr ON r.request_id = cr.request_id
      JOIN businesses b ON cr.business_id = b.business_id
      JOIN creators c ON cr.creator_id = c.creator_id
      JOIN users ur ON r.reviewer_id = ur.user_id
      JOIN users ue ON r.reviewee_id = ue.user_id
      WHERE r.reviewer_id = $1 OR r.reviewee_id = $1
    `
    const params: unknown[] = [userId]

    if (filter === 'with-reviews') {
      sql += ' AND r.comment IS NOT NULL AND TRIM(r.comment) <> \'\''
    }

    sql += ' ORDER BY r.created_at DESC'

    const res = await query(sql, params)
    return NextResponse.json({ success: true, data: res.rows })
  } catch {
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
  const requestId = Number(body.request_id || body.collaboration_id)
  const rating = Number(body.rating)
  const comment = body.comment || null

  if (!requestId || !rating || rating < 1 || rating > 5) {
    return NextResponse.json(
      { success: false, error: 'Valid request ID and rating (1-5) are required' },
      { status: 400 }
    )
  }

  const reviewerId = Number(auth.user.user_id)

  try {
    // Look up the request to find counterpart reviewee
    const reqRes = await query<{
      request_id: number
      status: string
      business_user_id: number
      creator_user_id: number
    }>(
      `SELECT
        cr.request_id,
        cr.status,
        b.user_id AS business_user_id,
        c.user_id AS creator_user_id
       FROM collaboration_requests cr
       JOIN businesses b ON cr.business_id = b.business_id
       JOIN creators c ON cr.creator_id = c.creator_id
       WHERE cr.request_id = $1`,
      [requestId]
    )

    if (reqRes.rows.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Collaboration request not found' },
        { status: 404 }
      )
    }

    const reqData = reqRes.rows[0]
    if (reqData.status !== 'completed') {
      return NextResponse.json(
        { success: false, error: 'Reviews are only allowed for completed collaborations' },
        { status: 400 }
      )
    }

    let revieweeId: number
    if (reviewerId === reqData.business_user_id) {
      revieweeId = reqData.creator_user_id
    } else if (reviewerId === reqData.creator_user_id) {
      revieweeId = reqData.business_user_id
    } else {
      return NextResponse.json(
        { success: false, error: 'Only participants in this collaboration can leave a review' },
        { status: 403 }
      )
    }

    const insertRes = await query<{ review_id: number }>(
      `INSERT INTO reviews (request_id, reviewer_id, reviewee_id, rating, comment)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING review_id`,
      [requestId, reviewerId, revieweeId, rating, comment]
    )

    return NextResponse.json({
      success: true,
      data: { review_id: insertRes.rows[0].review_id },
    })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to submit review'
    const status = message.includes('duplicate') || message.includes('unique') ? 409 : 400
    return NextResponse.json(
      { success: false, error: message },
      { status }
    )
  }
}
