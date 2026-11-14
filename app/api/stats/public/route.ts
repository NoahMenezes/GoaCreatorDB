export const dynamic = 'force-dynamic'
import { NextResponse } from 'next/server'
import { query } from '@/lib/db'

export async function GET() {
  try {
    const res = await query(`
      SELECT
        total_creators AS creators,
        total_businesses AS businesses,
        completed_collaborations,
        verified_users,
        total_completed_deal_volume,
        platform_avg_rating
      FROM v_admin_kpis
    `)

    const row = res.rows[0] || {
      creators: 0,
      businesses: 0,
      completed_collaborations: 0,
    }

    return NextResponse.json({
      success: true,
      data: {
        creators: Number(row.creators) || 0,
        businesses: Number(row.businesses) || 0,
        completed_collaborations: Number(row.completed_collaborations) || 0,
        verified_users: Number(row.verified_users) || 0,
        total_completed_deal_volume: Number(row.total_completed_deal_volume) || 0,
        platform_avg_rating: Number(row.platform_avg_rating) || 0,
      },
    })
  } catch (err) {
    console.error('Failed to fetch public stats:', err)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch public stats' },
      { status: 500 }
    )
  }
}

