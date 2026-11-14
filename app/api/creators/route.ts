export const dynamic = 'force-dynamic'
import { NextResponse } from 'next/server'
import { query } from '@/lib/db'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)

  // 1. Parse filter parameters
  const q = searchParams.get('q')?.trim()
  const district = searchParams.get('district')?.trim()

  // Category array parsing (supports ?category=Food&category=Travel or ?category=Food,Travel)
  const categoryParams = searchParams.getAll('category')
  const categories: string[] = []
  for (const cat of categoryParams) {
    for (const part of cat.split(',')) {
      const trimmed = part.trim()
      if (trimmed && !categories.includes(trimmed)) {
        categories.push(trimmed)
      }
    }
  }

  // Taluka array parsing
  const talukaParams = searchParams.getAll('taluka')
  const talukas: string[] = []
  for (const tal of talukaParams) {
    for (const part of tal.split(',')) {
      const trimmed = part.trim()
      if (trimmed && !talukas.includes(trimmed)) {
        talukas.push(trimmed)
      }
    }
  }

  const minFollowers = searchParams.get('minFollowers') ? Number(searchParams.get('minFollowers')) : null
  const maxFollowers = searchParams.get('maxFollowers') ? Number(searchParams.get('maxFollowers')) : null
  const minEngagement = searchParams.get('minEngagement') ? Number(searchParams.get('minEngagement')) : null
  const collabType = searchParams.get('collabType')?.toLowerCase()?.trim()
  const maxRate = searchParams.get('maxRate') ? Number(searchParams.get('maxRate')) : null
  const verifiedOnly =
    searchParams.get('verifiedOnly') === 'true' || searchParams.get('verifiedOnly') === '1'

  // Sorting
  const sort = searchParams.get('sort')?.toLowerCase()?.trim() || 'followers'

  // Pagination
  const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10) || 1)
  const limit = Math.min(100, Math.max(1, parseInt(searchParams.get('limit') || '12', 10) || 12))
  const offset = (page - 1) * limit

  // 2. Build SQL on top of v_creator_cards (never selecting email or password)
  let sql = `
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
      c.created_at,
      COALESCE(sa.handle, '') AS handle,
      COALESCE(sa.profile_url, '') AS instagram_url,
      COUNT(*) OVER() AS total_count
    FROM v_creator_cards c
    LEFT JOIN social_accounts sa ON c.creator_id = sa.creator_id AND sa.platform = 'instagram'
  `

  const conditions: string[] = []
  const params: unknown[] = []

  // Trigram search on name and handle using GIN index
  if (q) {
    params.push(`%${q}%`)
    const paramIdx = params.length
    conditions.push(`(
      c.full_name ILIKE $${paramIdx}
      OR EXISTS (
        SELECT 1 FROM social_accounts sa_sub
        WHERE sa_sub.creator_id = c.creator_id AND sa_sub.handle ILIKE $${paramIdx}
      )
    )`)
  }

  // Category filter
  if (categories.length > 0) {
    params.push(categories)
    const paramIdx = params.length
    conditions.push(`EXISTS (
      SELECT 1 FROM jsonb_array_elements(c.categories) cat
      WHERE cat->>'category_name' = ANY($${paramIdx})
         OR (cat->>'category_id')::text = ANY($${paramIdx})
    )`)
  }

  // District filter
  if (district && district !== 'all') {
    params.push(district)
    conditions.push(`c.district = $${params.length}`)
  }

  // Taluka filter
  if (talukas.length > 0) {
    params.push(talukas)
    conditions.push(`c.taluka = ANY($${params.length})`)
  }

  // Followers range
  if (minFollowers !== null && !isNaN(minFollowers)) {
    params.push(minFollowers)
    conditions.push(`c.total_followers >= $${params.length}`)
  }
  if (maxFollowers !== null && !isNaN(maxFollowers)) {
    params.push(maxFollowers)
    conditions.push(`c.total_followers <= $${params.length}`)
  }

  // Engagement rate
  if (minEngagement !== null && !isNaN(minEngagement)) {
    params.push(minEngagement)
    conditions.push(`c.avg_engagement_rate >= $${params.length}`)
  }

  // Collab type: paid | barter | hybrid
  if (collabType === 'paid') {
    conditions.push(`c.min_paid_rate > 0`)
  } else if (collabType === 'barter') {
    conditions.push(`c.accepts_barter = true`)
  } else if (collabType === 'hybrid') {
    conditions.push(`(c.accepts_barter = true AND c.min_paid_rate > 0)`)
  }

  // Max rate
  if (maxRate !== null && !isNaN(maxRate)) {
    params.push(maxRate)
    conditions.push(`c.min_paid_rate <= $${params.length}`)
  }

  // Verified only
  if (verifiedOnly) {
    conditions.push(`c.is_verified = true`)
  }

  if (conditions.length > 0) {
    sql += ' WHERE ' + conditions.join(' AND ')
  }

  // Sorting
  switch (sort) {
    case 'engagement':
      sql += ' ORDER BY c.avg_engagement_rate DESC, c.total_followers DESC'
      break
    case 'rating':
      sql += ' ORDER BY c.avg_rating DESC, c.review_count DESC, c.total_followers DESC'
      break
    case 'recent':
      sql += ' ORDER BY c.created_at DESC'
      break
    case 'followers':
    default:
      sql += ' ORDER BY c.total_followers DESC, c.avg_rating DESC'
      break
  }

  // Pagination limits
  params.push(limit)
  sql += ` LIMIT $${params.length}`
  params.push(offset)
  sql += ` OFFSET $${params.length}`

  try {
    const res = await query(sql, params)
    const total = res.rows.length > 0 ? Number(res.rows[0].total_count) : 0
    const totalPages = Math.ceil(total / limit)

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
        created_at: r.created_at,
      }
    })

    return NextResponse.json({
      success: true,
      data,
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1,
      },
    })
  } catch (err) {
    console.error('Failed to query creators:', err)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch creators' },
      { status: 500 }
    )
  }
}
