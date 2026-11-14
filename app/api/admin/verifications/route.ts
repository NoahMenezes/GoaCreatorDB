export const dynamic = 'force-dynamic'
import { NextResponse } from 'next/server'
import { query, withTransaction } from '@/lib/db'
import { requireAdmin } from '@/lib/api-auth'

export async function GET(request: Request) {
  const auth = await requireAdmin(request)
  if (auth instanceof Response) return auth

  const { searchParams } = new URL(request.url)
  const type = (searchParams.get('type') || 'accounts').toLowerCase().trim()

  try {
    if (type === 'metrics' || type === 'metric') {
      const res = await query(`
        SELECT
          cm.metric_id,
          cm.account_id,
          cm.follower_count,
          cm.avg_views,
          cm.avg_likes,
          cm.avg_comments,
          cm.engagement_rate,
          cm.audience_goa_pct,
          cm.data_source,
          cm.verified_by,
          cm.recorded_at,
          sa.platform,
          sa.handle,
          sa.profile_url,
          c.creator_id,
          c.full_name AS creator_name
        FROM creator_metrics cm
        JOIN social_accounts sa ON cm.account_id = sa.account_id
        JOIN creators c ON sa.creator_id = c.creator_id
        WHERE cm.data_source = 'self_reported'
        ORDER BY cm.recorded_at DESC
      `)

      return NextResponse.json({ success: true, data: res.rows })
    }

    // Default: accounts
    const res = await query(`
      SELECT
        u.user_id,
        u.email,
        u.role,
        u.is_verified,
        u.created_at,
        fn_trust_score(u.user_id) AS trust_score,
        CASE
          WHEN fn_trust_score(u.user_id) >= 70 THEN 'LOW'
          WHEN fn_trust_score(u.user_id) >= 40 THEN 'MEDIUM'
          ELSE 'HIGH'
        END AS risk_label,
        c.creator_id,
        c.full_name AS creator_name,
        c.bio,
        b.business_id,
        b.business_name,
        b.industry,
        l.area_name,
        l.taluka,
        l.district
      FROM users u
      LEFT JOIN creators c ON u.user_id = c.user_id
      LEFT JOIN businesses b ON u.user_id = b.user_id
      LEFT JOIN locations l ON COALESCE(c.location_id, b.location_id) = l.location_id
      WHERE u.is_verified = false AND u.role IN ('creator', 'business')
      ORDER BY u.created_at DESC
    `)

    return NextResponse.json({ success: true, data: res.rows })
  } catch (err) {
    console.error('Failed to fetch verifications:', err)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch verifications' },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  const auth = await requireAdmin(request)
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

  const b = body as {
    type?: string
    id?: number | string
    user_id?: number | string
    metric_id?: number | string
    action?: string
    note?: string
  }

  const action = (b.action || '').toLowerCase().trim()
  if (action !== 'approve' && action !== 'reject') {
    return NextResponse.json(
      { success: false, error: 'action must be approve or reject' },
      { status: 400 }
    )
  }

  const rawType = (b.type || (b.metric_id ? 'metrics' : 'accounts')).toLowerCase().trim()
  const isMetric = rawType.includes('metric')
  const targetId = Number(b.id || (isMetric ? b.metric_id : b.user_id))
  const note = b.note?.trim() || null

  if (!targetId || isNaN(targetId)) {
    return NextResponse.json(
      { success: false, error: 'Valid target ID is required' },
      { status: 400 }
    )
  }

  const adminUserId = Number(auth.user.user_id)

  try {
    if (isMetric) {
      // Find metric row
      const mRes = await query<{ metric_id: number; data_source: string }>(
        'SELECT metric_id, data_source FROM creator_metrics WHERE metric_id = $1',
        [targetId]
      )
      if (mRes.rows.length === 0) {
        return NextResponse.json({ success: false, error: 'Metric record not found' }, { status: 404 })
      }

      if (action === 'approve') {
        await withTransaction(adminUserId, async (client) => {
          await client.query(
            "UPDATE creator_metrics SET data_source = 'admin_verified', verified_by = $1 WHERE metric_id = $2",
            [adminUserId, targetId]
          )
        })

        return NextResponse.json({
          success: true,
          message: 'Metric snapshot approved and verified by admin',
        })
      } else {
        // Reject: leaves record unchanged and logs reviewer note to audit_log
        await withTransaction(adminUserId, async (client) => {
          await client.query(
            `INSERT INTO audit_log (table_name, record_id, action, old_data, new_data, changed_by, changed_at)
             VALUES ('creator_metrics', $1, 'UPDATE', $2::jsonb, $3::jsonb, $4, now())`,
            [
              targetId,
              JSON.stringify(mRes.rows[0]),
              JSON.stringify({ note: note || 'Metric verification rejected by admin', decision: 'rejected' }),
              adminUserId,
            ]
          )
        })

        return NextResponse.json({
          success: true,
          message: 'Metric verification rejected, note recorded in audit log',
        })
      }
    } else {
      // Account verification
      const uRes = await query<{ user_id: number; is_verified: boolean; email: string }>(
        'SELECT user_id, is_verified, email FROM users WHERE user_id = $1',
        [targetId]
      )
      if (uRes.rows.length === 0) {
        return NextResponse.json({ success: false, error: 'User not found' }, { status: 404 })
      }

      if (action === 'approve') {
        await withTransaction(adminUserId, async (client) => {
          await client.query('UPDATE users SET is_verified = true WHERE user_id = $1', [targetId])
        })

        return NextResponse.json({
          success: true,
          message: 'Account verified successfully',
        })
      } else {
        // Reject: leaves record unchanged and writes note into audit_log
        await withTransaction(adminUserId, async (client) => {
          await client.query(
            `INSERT INTO audit_log (table_name, record_id, action, old_data, new_data, changed_by, changed_at)
             VALUES ('users', $1, 'UPDATE', $2::jsonb, $3::jsonb, $4, now())`,
            [
              targetId,
              JSON.stringify(uRes.rows[0]),
              JSON.stringify({ note: note || 'Account verification rejected by admin', decision: 'rejected' }),
              adminUserId,
            ]
          )
        })

        return NextResponse.json({
          success: true,
          message: 'Account verification rejected, note recorded in audit log',
        })
      }
    }
  } catch (err) {
    console.error('Failed to process verification:', err)
    return NextResponse.json(
      { success: false, error: 'Failed to process verification action' },
      { status: 500 }
    )
  }
}
