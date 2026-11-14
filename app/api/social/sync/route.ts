export const dynamic = 'force-dynamic'
import { NextResponse } from 'next/server'
import { query } from '@/lib/db'
import { requireAuth } from '@/lib/api-auth'

export async function POST(request: Request) {
  const auth = await requireAuth()
  if (auth instanceof Response) return auth

  const body = await request.json()
  const accountId = Number(body.account_id)

  if (!accountId) {
    return NextResponse.json(
      { success: false, error: 'Account ID is required' },
      { status: 400 }
    )
  }

  const userId = Number(auth.user.user_id)

  try {
    const accRes = await query(
      `SELECT sa.*
       FROM social_accounts sa
       JOIN creators c ON sa.creator_id = c.creator_id
       WHERE sa.account_id = $1 AND c.user_id = $2`,
      [accountId, userId]
    )

    if (accRes.rows.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Social account not found or not owned by you' },
        { status: 404 }
      )
    }

    // Generate demonstration self-reported metrics
    const followers = Math.floor(Math.random() * 50000) + 10000
    const engagementRate = Math.round((Math.random() * 5 + 3) * 100) / 100
    const avgLikes = Math.floor(followers * 0.05)
    const avgComments = Math.floor(followers * 0.01)
    const avgViews = Math.floor(followers * 0.25)
    const audienceGoaPct = Math.round((Math.random() * 40 + 30) * 10) / 10

    const metricRes = await query<{ metric_id: number }>(
      `INSERT INTO creator_metrics
       (account_id, follower_count, avg_likes, avg_views, avg_comments, engagement_rate, audience_goa_pct, data_source)
       VALUES ($1, $2, $3, $4, $5, $6, $7, 'self_reported')
       RETURNING metric_id`,
      [accountId, followers, avgLikes, avgViews, avgComments, engagementRate, audienceGoaPct]
    )

    return NextResponse.json({
      success: true,
      data: {
        account_id: accountId,
        metric_id: metricRes.rows[0].metric_id,
        data_source: 'self_reported',
        verified: false,
        metrics: {
          follower_count: followers,
          engagement_rate: engagementRate,
          avg_likes: avgLikes,
          avg_views: avgViews,
          audience_goa_pct: audienceGoaPct,
        },
      },
      message: 'Metrics synced. Source: self_reported (not admin-verified).',
    })
  } catch {
    return NextResponse.json(
      { success: false, error: 'Failed to sync social metrics' },
      { status: 500 }
    )
  }
}
