export const dynamic = 'force-dynamic'
import { NextResponse } from 'next/server'
import { query } from '@/lib/db'

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const resolvedParams = await params
  const creatorId = Number(resolvedParams.id)

  if (!creatorId || isNaN(creatorId)) {
    return NextResponse.json(
      { success: false, error: 'Invalid creator ID' },
      { status: 400 }
    )
  }

  try {
    // 1. Creator Profile from v_creator_cards (never selecting email or password)
    const profileRes = await query(
      `SELECT
        c.creator_id,
        c.full_name,
        c.bio,
        c.accepts_barter,
        c.min_paid_rate,
        c.location_id,
        c.area_name,
        c.taluka,
        c.district,
        c.primary_category,
        c.total_followers,
        c.avg_engagement_rate,
        c.avg_rating,
        c.review_count,
        c.is_verified,
        c.created_at
       FROM v_creator_cards c
       WHERE c.creator_id = $1`,
      [creatorId]
    )

    if (profileRes.rows.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Creator not found' },
        { status: 404 }
      )
    }

    const profile = profileRes.rows[0]

    // 2. Categories
    const categoriesRes = await query(
      `SELECT
        cat.category_id,
        cat.category_name,
        cc.is_primary
       FROM creator_categories cc
       JOIN categories cat ON cc.category_id = cat.category_id
       WHERE cc.creator_id = $1
       ORDER BY cc.is_primary DESC, cat.category_name ASC`,
      [creatorId]
    )

    // 3. Social Accounts with latest metrics
    const socialRes = await query(
      `SELECT
        sa.account_id,
        sa.platform,
        sa.handle,
        sa.profile_url,
        lm.metric_id,
        lm.follower_count,
        lm.avg_views,
        lm.avg_likes,
        lm.avg_comments,
        lm.engagement_rate,
        lm.audience_goa_pct,
        lm.data_source,
        lm.recorded_at
       FROM social_accounts sa
       LEFT JOIN v_creator_latest_metrics lm ON sa.account_id = lm.account_id
       WHERE sa.creator_id = $1
       ORDER BY sa.account_id ASC`,
      [creatorId]
    )

    // 4. Metric History for charts
    const metricHistoryRes = await query(
      `SELECT
        cm.metric_id,
        cm.account_id,
        sa.platform,
        sa.handle,
        cm.follower_count,
        cm.avg_views,
        cm.avg_likes,
        cm.avg_comments,
        cm.engagement_rate,
        cm.audience_goa_pct,
        cm.data_source,
        cm.recorded_at
       FROM creator_metrics cm
       JOIN social_accounts sa ON cm.account_id = sa.account_id
       WHERE sa.creator_id = $1
       ORDER BY cm.recorded_at ASC`,
      [creatorId]
    )

    // 5. Reviews with business names (never returning reviewer's email or phone)
    const reviewsRes = await query(
      `SELECT
        r.review_id,
        r.rating,
        r.comment,
        r.created_at,
        b.business_id,
        b.business_name,
        b.industry AS business_industry
       FROM reviews r
       JOIN collaboration_requests cr ON r.request_id = cr.request_id
       JOIN businesses b ON cr.business_id = b.business_id
       JOIN creators c ON cr.creator_id = c.creator_id
       WHERE r.reviewee_id = c.user_id AND c.creator_id = $1
       ORDER BY r.created_at DESC`,
      [creatorId]
    )

    const avgRating =
      reviewsRes.rows.length > 0
        ? Math.round(
            (reviewsRes.rows.reduce((sum, r) => sum + Number(r.rating), 0) /
              reviewsRes.rows.length) *
              10
          ) / 10
        : Number(profile.avg_rating) || 0

    return NextResponse.json({
      success: true,
      data: {
        profile: {
          ...profile,
          location: `${profile.area_name}, ${profile.taluka}`,
        },
        categories: categoriesRes.rows,
        social_accounts: socialRes.rows,
        metric_history: metricHistoryRes.rows,
        reviews: reviewsRes.rows,
        average_rating: avgRating,
        total_reviews: reviewsRes.rows.length,
      },
    })
  } catch (err) {
    console.error('Failed to fetch creator details:', err)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch creator details' },
      { status: 500 }
    )
  }
}

