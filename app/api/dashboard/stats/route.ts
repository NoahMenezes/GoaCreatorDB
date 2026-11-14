export const dynamic = 'force-dynamic'
import { NextResponse } from 'next/server'
import { query } from '@/lib/db'
import { requireAuth } from '@/lib/api-auth'

export async function GET() {
  const auth = await requireAuth()
  if (auth instanceof Response) return auth

  try {
    const userId = auth.user.user_id
    const role = auth.role

    const joinClause =
      role === 'creator'
        ? 'JOIN creators c ON cr.creator_id = c.creator_id WHERE c.user_id = $1'
        : role === 'business'
        ? 'JOIN businesses b ON cr.business_id = b.business_id WHERE b.user_id = $1'
        : 'WHERE 1=1' // Admin sees overall

    const params = role === 'admin' ? [] : [userId]

    const statsSql = `
      SELECT
        COUNT(*) FILTER (WHERE cr.status = 'pending')::int AS new_requests,
        COUNT(*) FILTER (WHERE cr.status = 'accepted')::int AS accepted_collaborations,
        COUNT(*) FILTER (WHERE cr.status = 'completed')::int AS completed_campaigns,
        COALESCE(SUM(cr.offered_amount) FILTER (WHERE cr.status = 'completed' AND cr.collab_type IN ('paid', 'hybrid')), 0)::int AS total_earnings,
        COALESCE(SUM(cr.offered_amount) FILTER (WHERE cr.status = 'accepted' AND cr.collab_type IN ('paid', 'hybrid')), 0)::int AS pending_payments
      FROM collaboration_requests cr
      ${joinClause}
    `

    const ratingSql = `
      SELECT COALESCE(AVG(rating), 0)::float AS avg_rating
      FROM reviews
      ${role === 'admin' ? '' : 'WHERE reviewee_id = $1'}
    `

    const [statsRes, ratingRes] = await Promise.all([
      query(statsSql, params),
      query(ratingSql, params),
    ])

    const stats = statsRes.rows[0] || {
      new_requests: 0,
      accepted_collaborations: 0,
      completed_campaigns: 0,
      total_earnings: 0,
      pending_payments: 0,
    }
    const avgRating = ratingRes.rows[0]?.avg_rating || 0

    return NextResponse.json({
      success: true,
      data: {
        new_requests: stats.new_requests,
        accepted_collaborations: stats.accepted_collaborations,
        completed_campaigns: stats.completed_campaigns,
        average_rating: Math.round(avgRating * 10) / 10,
        total_earnings: stats.total_earnings,
        pending_payments: stats.pending_payments,
      },
    })
  } catch (err) {
    console.error('Failed to fetch dashboard stats:', err)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch dashboard stats' },
      { status: 500 }
    )
  }
}
