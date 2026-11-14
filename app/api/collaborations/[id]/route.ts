export const dynamic = 'force-dynamic'
import { NextResponse } from 'next/server'
import { query } from '@/lib/db'
import { requireAuth } from '@/lib/api-auth'

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireAuth(request)
  if (auth instanceof Response) return auth

  const resolvedParams = await params
  const requestId = Number(resolvedParams.id)
  if (!requestId || isNaN(requestId)) {
    return NextResponse.json(
      { success: false, error: 'Valid collaboration ID is required' },
      { status: 400 }
    )
  }

  const role = auth.role
  const userId = Number(auth.user.user_id)

  try {
    const sql = `
      SELECT vc.*, ub.user_id AS business_user_id, uc.user_id AS creator_user_id
      FROM v_collaborations vc
      JOIN businesses b ON vc.business_id = b.business_id
      JOIN creators c ON vc.creator_id = c.creator_id
      JOIN users ub ON b.user_id = ub.user_id
      JOIN users uc ON c.user_id = uc.user_id
      WHERE vc.request_id = $1
    `
    const res = await query(sql, [requestId])

    if (res.rows.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Collaboration not found' },
        { status: 404 }
      )
    }

    const collab = res.rows[0]

    // Only parties or admin can view
    if (userId !== collab.business_user_id && userId !== collab.creator_user_id && role !== 'admin') {
      return NextResponse.json(
        { success: false, error: 'Collaboration not found' },
        { status: 404 }
      )
    }

    delete collab.business_user_id
    delete collab.creator_user_id

    // Fetch reviews on this collaboration request without exposing emails or password_hash
    const reviewsRes = await query(
      `SELECT
        r.review_id,
        r.request_id,
        r.reviewer_id,
        r.reviewee_id,
        r.rating,
        r.comment,
        r.created_at
       FROM reviews r
       WHERE r.request_id = $1
       ORDER BY r.created_at ASC`,
      [requestId]
    )

    return NextResponse.json({
      success: true,
      data: {
        ...collab,
        reviews: reviewsRes.rows,
      },
    })
  } catch (err) {
    console.error('Failed to fetch collaboration details:', err)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch collaboration details' },
      { status: 500 }
    )
  }
}
