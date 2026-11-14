export const dynamic = 'force-dynamic'
import { NextResponse } from 'next/server'
import { query } from '@/lib/db'
import { requireAuth } from '@/lib/api-auth'

export async function GET(request?: Request) {
  const auth = await requireAuth(request)
  if (auth instanceof Response) return auth

  const userId = Number(auth.user.user_id)
  const role = auth.role

  try {
    if (role === 'creator') {
      const crRes = await query<{ creator_id: number; full_name: string; bio: string | null; location_id: number }>(
        'SELECT creator_id, full_name, bio, location_id FROM creators WHERE user_id = $1',
        [userId]
      )

      if (crRes.rows.length === 0) {
        return NextResponse.json({
          success: true,
          data: {
            pending: 0,
            new_requests: 0,
            accepted: 0,
            accepted_collaborations: 0,
            completed: 0,
            completed_campaigns: 0,
            average_rating: 0,
            profile_completeness: 20,
            total_earnings: 0,
            pending_payments: 0,
          },
        })
      }

      const creator = crRes.rows[0]

      // Request counts & earnings
      const statsRes = await query(`
        SELECT
          COUNT(*) FILTER (WHERE cr.status = 'pending')::int AS pending,
          COUNT(*) FILTER (WHERE cr.status = 'accepted')::int AS accepted,
          COUNT(*) FILTER (WHERE cr.status = 'completed')::int AS completed,
          COALESCE(SUM(cr.offered_amount) FILTER (WHERE cr.status = 'completed' AND cr.collab_type IN ('paid', 'hybrid')), 0)::int AS total_earnings,
          COALESCE(SUM(cr.offered_amount) FILTER (WHERE cr.status = 'accepted' AND cr.collab_type IN ('paid', 'hybrid')), 0)::int AS pending_payments
        FROM collaboration_requests cr
        WHERE cr.creator_id = $1
      `, [creator.creator_id])

      const stats = statsRes.rows[0]

      // Average rating
      const ratingRes = await query<{ avg_rating: number }>(
        'SELECT COALESCE(AVG(rating), 0)::float AS avg_rating FROM reviews WHERE reviewee_id = $1',
        [userId]
      )
      const avgRating = Math.round((ratingRes.rows[0]?.avg_rating || 0) * 10) / 10

      // Profile completeness
      const [catsRes, saRes] = await Promise.all([
        query('SELECT COUNT(*)::int AS count FROM creator_categories WHERE creator_id = $1', [creator.creator_id]),
        query('SELECT COUNT(*)::int AS count FROM social_accounts WHERE creator_id = $1', [creator.creator_id]),
      ])

      let completenessScore = 20 // baseline
      if (creator.full_name?.trim()) completenessScore += 20
      if (creator.bio?.trim()) completenessScore += 20
      if (creator.location_id) completenessScore += 20
      if (catsRes.rows[0]?.count > 0) completenessScore += 10
      if (saRes.rows[0]?.count > 0) completenessScore += 10

      return NextResponse.json({
        success: true,
        data: {
          pending: stats.pending,
          new_requests: stats.pending,
          accepted: stats.accepted,
          accepted_collaborations: stats.accepted,
          completed: stats.completed,
          completed_campaigns: stats.completed,
          average_rating: avgRating,
          profile_completeness: Math.min(100, completenessScore),
          total_earnings: stats.total_earnings,
          pending_payments: stats.pending_payments,
        },
      })
    } else if (role === 'business') {
      const bizRes = await query<{ business_id: number; business_name: string }>(
        'SELECT business_id, business_name FROM businesses WHERE user_id = $1',
        [userId]
      )

      if (bizRes.rows.length === 0) {
        return NextResponse.json({
          success: true,
          data: {
            active_requests: 0,
            new_requests: 0,
            accepted: 0,
            accepted_collaborations: 0,
            completed: 0,
            completed_campaigns: 0,
            shortlisted_count: 0,
            recent_requests: [],
            total_spent: 0,
            total_earnings: 0,
            average_rating: 0,
          },
        })
      }

      const business = bizRes.rows[0]

      // Request counts & spending
      const statsRes = await query(`
        SELECT
          COUNT(*) FILTER (WHERE cr.status = 'pending')::int AS active_requests,
          COUNT(*) FILTER (WHERE cr.status = 'accepted')::int AS accepted,
          COUNT(*) FILTER (WHERE cr.status = 'completed')::int AS completed,
          COALESCE(SUM(cr.offered_amount) FILTER (WHERE cr.status = 'completed' AND cr.collab_type IN ('paid', 'hybrid')), 0)::int AS total_spent
        FROM collaboration_requests cr
        WHERE cr.business_id = $1
      `, [business.business_id])

      const stats = statsRes.rows[0]

      // Shortlisted count
      const shortlistRes = await query<{ count: number }>(
        'SELECT COUNT(*)::int AS count FROM shortlists WHERE business_id = $1',
        [business.business_id]
      )
      const shortlistedCount = shortlistRes.rows[0]?.count || 0

      // Recent requests (last 5)
      const recentReqRes = await query(`
        SELECT
          cr.request_id,
          cr.collab_type,
          cr.offered_amount,
          cr.deliverables,
          cr.status,
          cr.requested_at,
          c.full_name AS creator_name,
          c.creator_id
        FROM collaboration_requests cr
        JOIN creators c ON cr.creator_id = c.creator_id
        WHERE cr.business_id = $1
        ORDER BY cr.requested_at DESC
        LIMIT 5
      `, [business.business_id])

      // Average rating
      const ratingRes = await query<{ avg_rating: number }>(
        'SELECT COALESCE(AVG(rating), 0)::float AS avg_rating FROM reviews WHERE reviewee_id = $1',
        [userId]
      )
      const avgRating = Math.round((ratingRes.rows[0]?.avg_rating || 0) * 10) / 10

      return NextResponse.json({
        success: true,
        data: {
          active_requests: stats.active_requests,
          new_requests: stats.active_requests,
          accepted: stats.accepted,
          accepted_collaborations: stats.accepted,
          completed: stats.completed,
          completed_campaigns: stats.completed,
          shortlisted_count: shortlistedCount,
          recent_requests: recentReqRes.rows,
          total_spent: stats.total_spent,
          total_earnings: stats.total_spent, // alias for dashboard compatibility
          average_rating: avgRating,
        },
      })
    } else {
      // Admin overview
      const adminRes = await query(`
        SELECT
          pending_requests AS active_requests,
          pending_requests AS new_requests,
          active_collaborations AS accepted,
          active_collaborations AS accepted_collaborations,
          completed_collaborations AS completed,
          completed_collaborations AS completed_campaigns,
          total_completed_deal_volume AS total_spent,
          total_completed_deal_volume AS total_earnings,
          platform_avg_rating AS average_rating
        FROM v_admin_kpis
      `)

      return NextResponse.json({
        success: true,
        data: adminRes.rows[0] || {},
      })
    }
  } catch (err) {
    console.error('Failed to fetch dashboard stats:', err)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch dashboard stats' },
      { status: 500 }
    )
  }
}
