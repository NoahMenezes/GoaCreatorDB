export const dynamic = 'force-dynamic'
import { NextResponse } from 'next/server'
import { query } from '@/lib/db'
import { requireAuth } from '@/lib/api-auth'

export async function GET() {
  const auth = await requireAuth()
  if (auth instanceof Response) return auth

  const userId = Number(auth.user.user_id)

  try {
    const res = await query(
      `SELECT
        sa.*,
        lm.metric_id,
        lm.follower_count,
        lm.avg_likes,
        lm.avg_views,
        lm.avg_comments,
        lm.engagement_rate,
        lm.audience_goa_pct,
        lm.data_source,
        lm.verified_by,
        lm.recorded_at
       FROM social_accounts sa
       JOIN creators c ON sa.creator_id = c.creator_id
       LEFT JOIN v_creator_latest_metrics lm ON sa.account_id = lm.account_id
       WHERE c.user_id = $1
       ORDER BY sa.account_id DESC`,
      [userId]
    )

    const result = res.rows.map((row) => ({
      account_id: row.account_id,
      creator_id: row.creator_id,
      platform: row.platform,
      handle: row.handle,
      profile_url: row.profile_url,
      metrics: row.metric_id
        ? {
            metric_id: row.metric_id,
            followers: row.follower_count,
            follower_count: row.follower_count,
            avg_likes: row.avg_likes,
            avg_views: row.avg_views,
            avg_comments: row.avg_comments,
            engagement_rate: row.engagement_rate,
            audience_goa_pct: row.audience_goa_pct,
            data_source: row.data_source,
            verified: row.data_source === 'admin_verified',
            recorded_at: row.recorded_at,
          }
        : null,
    }))

    return NextResponse.json({ success: true, data: result })
  } catch {
    return NextResponse.json(
      { success: false, error: 'Failed to fetch social metrics' },
      { status: 500 }
    )
  }
}
