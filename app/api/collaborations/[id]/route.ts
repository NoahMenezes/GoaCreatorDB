export const dynamic = 'force-dynamic'
import { NextResponse } from 'next/server'
import { query } from '@/lib/db'
import { requireAuth } from '@/lib/api-auth'

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireAuth()
  if (auth instanceof Response) return auth

  const resolvedParams = await params
  const requestId = Number(resolvedParams.id)
  if (!requestId) {
    return NextResponse.json(
      { success: false, error: 'Valid collaboration ID is required' },
      { status: 400 }
    )
  }

  try {
    const res = await query(
      `SELECT vc.*
       FROM v_collaborations vc
       WHERE vc.request_id = $1`,
      [requestId]
    )

    if (res.rows.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Collaboration not found' },
        { status: 404 }
      )
    }

    const collab = res.rows[0]

    // Fetch any reviews on this collaboration request
    const reviewsRes = await query(
      `SELECT r.*, u.email as reviewer_email
       FROM reviews r
       JOIN users u ON r.reviewer_id = u.user_id
       WHERE r.request_id = $1`,
      [requestId]
    )

    return NextResponse.json({
      success: true,
      data: {
        ...collab,
        reviews: reviewsRes.rows,
      },
    })
  } catch {
    return NextResponse.json(
      { success: false, error: 'Failed to fetch collaboration details' },
      { status: 500 }
    )
  }
}
