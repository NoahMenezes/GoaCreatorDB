export const dynamic = 'force-dynamic'
import { NextResponse } from 'next/server'
import { query } from '@/lib/db'

export interface CreatorItem {
  id: number | string
  name: string
  handle: string
  niche: string
  nicheSlug: string
  location: string
  followers: string
  rating: number
  baseRate: string
  er: string
  verified: boolean
  instagramUrl: string
  bio: string
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const niche = searchParams.get('niche')
  const location = searchParams.get('location')

  let sql = `
    SELECT
      c.creator_id,
      c.full_name,
      COALESCE(sa.handle, '') AS handle,
      COALESCE(c.primary_category, 'General') AS primary_category,
      CONCAT(c.area_name, ', ', c.taluka) AS location_display,
      c.total_followers,
      c.avg_rating,
      c.min_paid_rate,
      c.avg_engagement_rate,
      c.is_verified,
      COALESCE(sa.profile_url, '') AS profile_url,
      COALESCE(c.bio, '') AS bio
    FROM v_creator_cards c
    LEFT JOIN social_accounts sa ON c.creator_id = sa.creator_id AND sa.platform = 'instagram'
  `

  const conditions: string[] = []
  const params: unknown[] = []

  if (niche && niche !== 'all') {
    params.push(`%${niche}%`)
    conditions.push(`c.primary_category ILIKE $${params.length}`)
  }

  if (location) {
    params.push(`%${location}%`)
    conditions.push(`(c.area_name ILIKE $${params.length} OR c.taluka ILIKE $${params.length})`)
  }

  if (conditions.length > 0) {
    sql += ' WHERE ' + conditions.join(' AND ')
  }

  sql += ' ORDER BY c.avg_rating DESC, c.total_followers DESC'

  try {
    const res = await query(sql, params)

    const data: CreatorItem[] = res.rows.map((r) => {
      const followersNum = Number(r.total_followers) || 0
      const formattedFollowers =
        followersNum >= 1000000
          ? `${(followersNum / 1000000).toFixed(1)}M`
          : followersNum >= 1000
          ? `${(followersNum / 1000).toFixed(1)}k`
          : `${followersNum}`

      return {
        id: r.creator_id,
        name: r.full_name,
        handle: r.handle ? (r.handle.startsWith('@') ? r.handle : `@${r.handle}`) : '',
        niche: r.primary_category,
        nicheSlug: r.primary_category.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
        location: r.location_display,
        followers: formattedFollowers,
        rating: Number(r.avg_rating) || 0,
        baseRate: `₹${Number(r.min_paid_rate) || 0}`,
        er: `${Number(r.avg_engagement_rate) || 0}%`,
        verified: Boolean(r.is_verified),
        instagramUrl: r.profile_url,
        bio: r.bio,
      }
    })

    return NextResponse.json({
      success: true,
      total: data.length,
      data,
    })
  } catch {
    return NextResponse.json(
      { success: false, error: 'Failed to fetch creators' },
      { status: 500 }
    )
  }
}
