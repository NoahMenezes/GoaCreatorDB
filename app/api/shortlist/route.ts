export const dynamic = 'force-dynamic'
import { NextResponse } from 'next/server'
import { query } from '@/lib/db'
import { requireAuth } from '@/lib/api-auth'

export async function GET(request: Request) {
  const auth = await requireAuth(request)
  if (auth instanceof Response) return auth

  if (auth.role !== 'business') {
    return NextResponse.json(
      { success: false, error: 'Only business accounts can view shortlists' },
      { status: 403 }
    )
  }

  const userId = Number(auth.user.user_id)

  try {
    let businessId = auth.businessId
    if (!businessId) {
      const bizRes = await query<{ business_id: number }>(
        'SELECT business_id FROM businesses WHERE user_id = $1',
        [userId]
      )
      if (bizRes.rows.length === 0) {
        return NextResponse.json(
          { success: false, error: 'Business profile not found' },
          { status: 404 }
        )
      }
      businessId = bizRes.rows[0].business_id
    }

    const res = await query(
      `SELECT
        s.business_id,
        s.creator_id,
        s.note,
        s.saved_at,
        c.full_name,
        c.bio,
        c.area_name,
        c.taluka,
        c.district,
        c.primary_category,
        c.total_followers,
        c.avg_engagement_rate,
        c.avg_rating,
        c.review_count,
        c.min_paid_rate,
        c.accepts_barter,
        c.is_verified,
        COALESCE(sa.handle, '') AS handle
       FROM shortlists s
       JOIN v_creator_cards c ON s.creator_id = c.creator_id
       LEFT JOIN social_accounts sa ON c.creator_id = sa.creator_id AND sa.platform = 'instagram'
       WHERE s.business_id = $1
       ORDER BY s.saved_at DESC`,
      [businessId]
    )

    return NextResponse.json({ success: true, data: res.rows })
  } catch (err) {
    console.error('Failed to fetch shortlist:', err)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch shortlist' },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  const auth = await requireAuth(request)
  if (auth instanceof Response) return auth

  if (auth.role !== 'business') {
    return NextResponse.json(
      { success: false, error: 'Only business accounts can shortlist creators' },
      { status: 403 }
    )
  }

  const body = await request.json().catch(() => ({}))
  const creatorId = Number(body.creator_id || body.creatorId)
  const note = body.note || null

  if (!creatorId || isNaN(creatorId)) {
    return NextResponse.json(
      { success: false, error: 'Valid creator_id is required' },
      { status: 400 }
    )
  }

  const userId = Number(auth.user.user_id)

  try {
    let businessId = auth.businessId
    if (!businessId) {
      const bizRes = await query<{ business_id: number }>(
        'SELECT business_id FROM businesses WHERE user_id = $1',
        [userId]
      )
      if (bizRes.rows.length === 0) {
        return NextResponse.json(
          { success: false, error: 'Business profile not found' },
          { status: 404 }
        )
      }
      businessId = bizRes.rows[0].business_id
    }

    await query(
      `INSERT INTO shortlists (business_id, creator_id, note, saved_at)
       VALUES ($1, $2, $3, now())
       ON CONFLICT (business_id, creator_id) DO UPDATE SET
         note = EXCLUDED.note,
         saved_at = now()`,
      [businessId, creatorId, note]
    )

    return NextResponse.json({
      success: true,
      message: 'Creator shortlisted successfully',
    })
  } catch (err) {
    console.error('Failed to shortlist creator:', err)
    return NextResponse.json(
      { success: false, error: 'Failed to shortlist creator' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: Request) {
  const auth = await requireAuth(request)
  if (auth instanceof Response) return auth

  if (auth.role !== 'business') {
    return NextResponse.json(
      { success: false, error: 'Only business accounts can modify shortlists' },
      { status: 403 }
    )
  }

  const { searchParams } = new URL(request.url)
  const creatorId = Number(searchParams.get('creator_id') || searchParams.get('creatorId') || searchParams.get('id'))

  if (!creatorId || isNaN(creatorId)) {
    return NextResponse.json(
      { success: false, error: 'Valid creator_id is required' },
      { status: 400 }
    )
  }

  const userId = Number(auth.user.user_id)

  try {
    let businessId = auth.businessId
    if (!businessId) {
      const bizRes = await query<{ business_id: number }>(
        'SELECT business_id FROM businesses WHERE user_id = $1',
        [userId]
      )
      if (bizRes.rows.length === 0) {
        return NextResponse.json(
          { success: false, error: 'Business profile not found' },
          { status: 404 }
        )
      }
      businessId = bizRes.rows[0].business_id
    }

    await query(
      'DELETE FROM shortlists WHERE business_id = $1 AND creator_id = $2',
      [businessId, creatorId]
    )

    return NextResponse.json({
      success: true,
      message: 'Creator removed from shortlist',
    })
  } catch (err) {
    console.error('Failed to remove from shortlist:', err)
    return NextResponse.json(
      { success: false, error: 'Failed to remove from shortlist' },
      { status: 500 }
    )
  }
}

