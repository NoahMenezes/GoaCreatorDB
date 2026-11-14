export const dynamic = 'force-dynamic'
import { NextResponse } from 'next/server'
import { query } from '@/lib/db'
import { requireAuth } from '@/lib/api-auth'

// Computed notifications feed (no notifications table per docs/backend-audit.md §1a & §3)
export async function GET() {
  const auth = await requireAuth()
  if (auth instanceof Response) return auth

  const userId = Number(auth.user.user_id)
  const role = auth.role

  try {
    const notifications: Array<{
      id: string
      type: string
      title: string
      message: string
      created_at: string
      link: string
      is_read: boolean
    }> = []

    // 1. Get recent collaboration requests & status changes
    if (role === 'creator') {
      const reqRes = await query(
        `SELECT
          cr.request_id,
          cr.status,
          cr.requested_at,
          cr.responded_at,
          b.business_name
         FROM collaboration_requests cr
         JOIN businesses b ON cr.business_id = b.business_id
         JOIN creators c ON cr.creator_id = c.creator_id
         WHERE c.user_id = $1
         ORDER BY cr.requested_at DESC
         LIMIT 20`,
        [userId]
      )

      for (const r of reqRes.rows) {
        if (r.status === 'pending') {
          notifications.push({
            id: `req-${r.request_id}-pending`,
            type: 'request_received',
            title: 'New Collaboration Request',
            message: `You received a new proposal from ${r.business_name}`,
            created_at: r.requested_at,
            link: '/creator/requests',
            is_read: false,
          })
        } else if (r.status === 'accepted') {
          notifications.push({
            id: `req-${r.request_id}-accepted`,
            type: 'request_accepted',
            title: 'Collaboration in Progress',
            message: `Campaign with ${r.business_name} is active`,
            created_at: r.responded_at || r.requested_at,
            link: '/creator/collaborations',
            is_read: true,
          })
        } else if (r.status === 'completed') {
          notifications.push({
            id: `req-${r.request_id}-completed`,
            type: 'collaboration_completed',
            title: 'Collaboration Completed',
            message: `Deal with ${r.business_name} marked as complete`,
            created_at: r.responded_at || r.requested_at,
            link: '/creator/collaborations',
            is_read: true,
          })
        }
      }
    } else if (role === 'business') {
      const reqRes = await query(
        `SELECT
          cr.request_id,
          cr.status,
          cr.requested_at,
          cr.responded_at,
          c.full_name AS creator_name
         FROM collaboration_requests cr
         JOIN businesses b ON cr.business_id = b.business_id
         JOIN creators c ON cr.creator_id = c.creator_id
         WHERE b.user_id = $1
         ORDER BY cr.requested_at DESC
         LIMIT 20`,
        [userId]
      )

      for (const r of reqRes.rows) {
        if (r.status === 'accepted') {
          notifications.push({
            id: `biz-req-${r.request_id}-accepted`,
            type: 'request_accepted',
            title: 'Request Accepted',
            message: `${r.creator_name} accepted your collaboration proposal`,
            created_at: r.responded_at || r.requested_at,
            link: '/business/requests',
            is_read: false,
          })
        } else if (r.status === 'rejected') {
          notifications.push({
            id: `biz-req-${r.request_id}-rejected`,
            type: 'request_declined',
            title: 'Request Declined',
            message: `${r.creator_name} declined your collaboration proposal`,
            created_at: r.responded_at || r.requested_at,
            link: '/business/requests',
            is_read: true,
          })
        }
      }
    }

    // 2. Get recent reviews received
    const reviewsRes = await query(
      `SELECT
        r.review_id,
        r.rating,
        r.created_at,
        u.email AS reviewer_email
       FROM reviews r
       JOIN users u ON r.reviewer_id = u.user_id
       WHERE r.reviewee_id = $1
       ORDER BY r.created_at DESC
       LIMIT 10`,
      [userId]
    )

    for (const rev of reviewsRes.rows) {
      notifications.push({
        id: `rev-${rev.review_id}`,
        type: 'review_received',
        title: 'New Review Received',
        message: `You received a ${rev.rating}-star review`,
        created_at: rev.created_at,
        link: role === 'business' ? '/business/reviews' : '/creator/profile',
        is_read: false,
      })
    }

    notifications.sort(
      (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    )

    return NextResponse.json({ success: true, data: notifications })
  } catch {
    return NextResponse.json(
      { success: false, error: 'Failed to fetch notifications' },
      { status: 500 }
    )
  }
}

export async function PATCH() {
  // Notifications are computed on-the-fly; mark-read is an idempotent ack
  return NextResponse.json({ success: true })
}
