export const dynamic = 'force-dynamic'
import { NextResponse } from 'next/server'
import { query } from '@/lib/db'
import { requireAuth } from '@/lib/api-auth'

export async function GET(request: Request) {
  const auth = await requireAuth()
  if (auth instanceof Response) return auth

  const userId = Number(auth.user.user_id)
  const { searchParams } = new URL(request.url)
  const accountId = searchParams.get('account_id') ? Number(searchParams.get('account_id')) : null

  try {
    let sql = `
      SELECT
        cm.metric_id,
        cm.account_id,
        sa.platform,
        sa.handle,
        cm.follower_count,
        cm.avg_likes,
        cm.avg_views,
        cm.avg_comments,
        cm.engagement_rate,
        cm.audience_goa_pct,
        cm.data_source,
        cm.verified_by,
        cm.recorded_at
      FROM creator_metrics cm
      JOIN social_accounts sa ON cm.account_id = sa.account_id
      JOIN creators c ON sa.creator_id = c.creator_id
      WHERE c.user_id = $1
    `
    const params: unknown[] = [userId]

    if (accountId) {
      params.push(accountId)
      sql += ` AND cm.account_id = $${params.length}`
    }

    sql += ' ORDER BY cm.account_id ASC, cm.recorded_at DESC'

    const res = await query(sql, params)

    return NextResponse.json({
      success: true,
      data: res.rows,
    })
  } catch (err) {
    console.error('Failed to fetch social metric history:', err)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch social metrics' },
      { status: 500 }
    )
  }
}
