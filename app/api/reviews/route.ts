export const dynamic = 'force-dynamic'
import { NextResponse } from 'next/server'
import { z } from 'zod'
import { query, withTransaction } from '@/lib/db'
import { requireAuth } from '@/lib/api-auth'

const createReviewSchema = z.object({
  request_id: z.coerce.number().int().positive({ message: 'Valid request_id is required' }),
  rating: z.coerce.number().int().min(1, { message: 'Rating must be between 1 and 5' }).max(5, { message: 'Rating must be between 1 and 5' }),
  comment: z.string().optional().nullable(),
})

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const creatorIdParam = searchParams.get('creator_id') || searchParams.get('creatorId')
  const filter = (searchParams.get('filter') || searchParams.get('type') || 'all').toLowerCase().trim()

  try {
    // 1. Public lookup by creator id (no auth required)
    if (creatorIdParam) {
      const creatorId = Number(creatorIdParam)
      if (!creatorId || isNaN(creatorId)) {
        return NextResponse.json(
          { success: false, error: 'Valid creator ID is required' },
          { status: 400 }
        )
      }

      const res = await query(
        `SELECT
          r.review_id,
          r.request_id,
          r.rating,
          r.comment,
          r.created_at,
          b.business_id,
          b.business_name,
          b.industry AS business_industry
         FROM reviews r
         JOIN collaboration_requests cr ON r.request_id = cr.request_id
         JOIN businesses b ON cr.business_id = b.business_id
         JOIN creators c ON cr.creator_id = c.creator_id
         WHERE c.creator_id = $1 AND r.reviewee_id = c.user_id
         ORDER BY r.created_at DESC`,
        [creatorId]
      )

      return NextResponse.json({ success: true, data: res.rows })
    }

    // 2. Authenticated user view (given and received)
    const auth = await requireAuth(request)
    if (auth instanceof Response) return auth

    const userId = Number(auth.user.user_id)

    let sql = `
      SELECT
        r.review_id,
        r.request_id,
        r.reviewer_id,
        r.reviewee_id,
        r.rating,
        r.comment,
        r.created_at,
        b.business_name,
        b.business_id,
        c.full_name AS creator_name,
        c.creator_id,
        cr.collab_type,
        cr.offered_amount,
        cr.deliverables
      FROM reviews r
      JOIN collaboration_requests cr ON r.request_id = cr.request_id
      JOIN businesses b ON cr.business_id = b.business_id
      JOIN creators c ON cr.creator_id = c.creator_id
    `
    const conditions: string[] = []
    const params: unknown[] = []

    if (filter === 'received') {
      params.push(userId)
      conditions.push(`r.reviewee_id = $${params.length}`)
    } else if (filter === 'given') {
      params.push(userId)
      conditions.push(`r.reviewer_id = $${params.length}`)
    } else {
      params.push(userId)
      conditions.push(`(r.reviewer_id = $${params.length} OR r.reviewee_id = $${params.length})`)
    }

    if (searchParams.get('with-comments') === 'true') {
      conditions.push("r.comment IS NOT NULL AND TRIM(r.comment) <> ''")
    }

    sql += ' WHERE ' + conditions.join(' AND ')
    sql += ' ORDER BY r.created_at DESC'

    const res = await query(sql, params)
    return NextResponse.json({ success: true, data: res.rows })
  } catch (err) {
    console.error('Failed to fetch reviews:', err)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch reviews' },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  const auth = await requireAuth(request)
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

  // Accept only { request_id, rating, comment }
  const parseResult = createReviewSchema.safeParse(body)
  if (!parseResult.success) {
    const firstIssue = parseResult.error.issues[0]
    return NextResponse.json(
      { success: false, error: firstIssue?.message || 'Invalid review data' },
      { status: 400 }
    )
  }

  const { request_id, rating, comment } = parseResult.data
  const reviewerId = Number(auth.user.user_id)

  try {
    // 1. Look up collaboration request to verify parties and status
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
      [request_id]
    )

    if (reqRes.rows.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Collaboration request not found' },
        { status: 404 }
      )
    }

    const reqData = reqRes.rows[0]

    // Reviews only allowed after completion
    if (reqData.status !== 'completed') {
      return NextResponse.json(
        { success: false, error: 'Reviews are permitted only for completed requests' },
        { status: 409 }
      )
    }

    // Server derives reviewee from request parties
    let revieweeId: number
    if (reviewerId === reqData.business_user_id) {
      revieweeId = reqData.creator_user_id
    } else if (reviewerId === reqData.creator_user_id) {
      revieweeId = reqData.business_user_id
    } else {
      return NextResponse.json(
        { success: false, error: 'Unauthorized: only parties to this collaboration can leave a review' },
        { status: 403 }
      )
    }

    // 2. Check for existing review by this reviewer on this request (one review per reviewer)
    const existingCheck = await query<{ review_id: number }>(
      'SELECT review_id FROM reviews WHERE request_id = $1 AND reviewer_id = $2',
      [request_id, reviewerId]
    )
    if (existingCheck.rows.length > 0) {
      return NextResponse.json(
        { success: false, error: 'You have already submitted a review for this collaboration request' },
        { status: 409 }
      )
    }

    // 3. Insert review inside transaction with audit tracking
    const insertRes = await withTransaction(reviewerId, async (client) => {
      return client.query<{ review_id: number }>(
        `INSERT INTO reviews (request_id, reviewer_id, reviewee_id, rating, comment)
         VALUES ($1, $2, $3, $4, $5)
         RETURNING review_id`,
        [request_id, reviewerId, revieweeId, rating, comment || null]
      )
    })

    return NextResponse.json(
      {
        success: true,
        data: { review_id: insertRes.rows[0].review_id },
        message: 'Review submitted successfully',
      },
      { status: 201 }
    )
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : 'Failed to submit review'
    // Duplicate review constraint violation or reviews guard trigger -> 409
    if (
      errorMsg.includes('uq_reviews_request_reviewer') ||
      errorMsg.includes('completed') ||
      errorMsg.includes('duplicate') ||
      errorMsg.includes('unique')
    ) {
      return NextResponse.json(
        { success: false, error: errorMsg },
        { status: 409 }
      )
    }
    return NextResponse.json(
      { success: false, error: errorMsg },
      { status: 400 }
    )
  }
}
