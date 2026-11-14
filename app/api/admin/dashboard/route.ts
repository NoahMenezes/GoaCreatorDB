export const dynamic = 'force-dynamic'
import { NextResponse } from 'next/server'
import { query } from '@/lib/db'
import { requireAdmin } from '@/lib/api-auth'

export async function GET(request: Request) {
  const auth = await requireAdmin(request)
  if (auth instanceof Response) return auth

  try {
    const [kpiRes, catRes, velocityRes, topCreatorsRes, topBusinessesRes, talukaRes] = await Promise.all([
      query(`
        SELECT
          k.total_users,
          k.total_creators,
          k.total_businesses,
          k.verified_users,
          k.completed_collaborations AS completed_deals,
          k.total_completed_deal_volume,
          k.platform_avg_rating,
          k.total_audit_entries,
          (SELECT COUNT(*)::INT FROM collaboration_requests) AS total_requests,
          (
            (SELECT COUNT(*)::INT FROM users WHERE is_verified = false AND role IN ('creator', 'business')) +
            (SELECT COUNT(*)::INT FROM creator_metrics WHERE data_source = 'self_reported')
          ) AS pending_verifications,
          (SELECT COUNT(*)::INT FROM users WHERE is_verified = false AND role IN ('creator', 'business')) AS pending_accounts,
          (SELECT COUNT(*)::INT FROM creator_metrics WHERE data_source = 'self_reported') AS pending_metrics
        FROM v_admin_kpis k
      `),
      query('SELECT * FROM v_category_distribution ORDER BY creator_count DESC'),
      query('SELECT * FROM v_monthly_request_velocity LIMIT 6'),
      query('SELECT * FROM v_top_creators LIMIT 5'),
      query('SELECT * FROM v_top_businesses LIMIT 5'),
      query('SELECT * FROM v_taluka_stats'),
    ])

    const kpiRow = kpiRes.rows[0] || {}

    return NextResponse.json({
      success: true,
      data: {
        kpis: {
          total_creators: Number(kpiRow.total_creators) || 0,
          total_businesses: Number(kpiRow.total_businesses) || 0,
          total_requests: Number(kpiRow.total_requests) || 0,
          completed_deals: Number(kpiRow.completed_deals) || 0,
          pending_verifications: Number(kpiRow.pending_verifications) || 0,
          pending_accounts: Number(kpiRow.pending_accounts) || 0,
          pending_metrics: Number(kpiRow.pending_metrics) || 0,
          total_users: Number(kpiRow.total_users) || 0,
          verified_users: Number(kpiRow.verified_users) || 0,
          total_completed_deal_volume: Number(kpiRow.total_completed_deal_volume) || 0,
          platform_avg_rating: Number(kpiRow.platform_avg_rating) || 0,
          total_audit_entries: Number(kpiRow.total_audit_entries) || 0,
        },
        category_distribution: catRes.rows,
        request_velocity: velocityRes.rows,
        top_creators: topCreatorsRes.rows,
        top_businesses: topBusinessesRes.rows,
        taluka_stats: talukaRes.rows,
      },
    })
  } catch (err) {
    console.error('Failed to fetch admin dashboard:', err)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch admin dashboard data' },
      { status: 500 }
    )
  }
}

