export const dynamic = 'force-dynamic'
import { NextResponse } from 'next/server'
import { query } from '@/lib/db'

export async function GET() {
  try {
    const res = await query(`
      SELECT
        c.creator_id,
        c.full_name,
        c.bio,
        c.accepts_barter,
        c.min_paid_rate,
        c.location_id,
        c.area_name,
        c.taluka,
        c.district,
        c.categories,
        c.primary_category,
        c.total_followers,
        c.avg_engagement_rate,
        c.avg_rating,
        c.review_count,
        c.is_verified,
        COALESCE(sa.handle, '') AS handle,
        COALESCE(sa.profile_url, '') AS instagram_url
      FROM v_creator_cards c
      LEFT JOIN social_accounts sa ON c.creator_id = sa.creator_id AND sa.platform = 'instagram'
      WHERE c.is_verified = true
      ORDER BY c.total_followers DESC, c.avg_rating DESC
      LIMIT 6
    `)

    const data = res.rows.map((r) => {
      const followersNum = Number(r.total_followers) || 0
      const formattedFollowers =
        followersNum >= 1000000
          ? `${(followersNum / 1000000).toFixed(1)}M`
          : followersNum >= 1000
          ? `${(followersNum / 1000).toFixed(1)}k`
          : `${followersNum}`

      return {
        id: r.creator_id,
        creator_id: r.creator_id,
        name: r.full_name,
        full_name: r.full_name,
        handle: r.handle ? (r.handle.startsWith('@') ? r.handle : `@${r.handle}`) : '',
        niche: r.primary_category || 'General',
        nicheSlug: (r.primary_category || 'general').toLowerCase().replace(/[^a-z0-9]+/g, '-'),
        location: `${r.area_name}, ${r.taluka}`,
        area_name: r.area_name,
        taluka: r.taluka,
        district: r.district,
        categories: r.categories || [],
        followers: formattedFollowers,
        total_followers: followersNum,
        rating: Number(r.avg_rating) || 0,
        avg_rating: Number(r.avg_rating) || 0,
        review_count: Number(r.review_count) || 0,
        baseRate: `₹${Number(r.min_paid_rate) || 0}`,
        min_paid_rate: Number(r.min_paid_rate) || 0,
        accepts_barter: Boolean(r.accepts_barter),
        er: `${Number(r.avg_engagement_rate) || 0}%`,
        avg_engagement_rate: Number(r.avg_engagement_rate) || 0,
        verified: Boolean(r.is_verified),
        is_verified: Boolean(r.is_verified),
        instagramUrl: r.instagram_url,
        bio: r.bio || '',
      }
    })

    return NextResponse.json({
      success: true,
      data,
    })
  } catch (err) {
    console.error('Failed to fetch featured creators:', err)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch featured creators' },
      { status: 500 }
    )
  }
}

