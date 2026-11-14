export const dynamic = 'force-dynamic'
import { NextResponse } from 'next/server'
import { query } from '@/lib/db'
import { requireAuth } from '@/lib/api-auth'

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ creatorId: string }> }
) {
  const auth = await requireAuth(request)
  if (auth instanceof Response) return auth

  if (auth.role !== 'business') {
    return NextResponse.json(
      { success: false, error: 'Only business accounts can shortlist creators' },
      { status: 403 }
    )
  }

  const resolvedParams = await params
  const creatorId = Number(resolvedParams.creatorId)
  if (!creatorId || isNaN(creatorId)) {
    return NextResponse.json(
      { success: false, error: 'Valid creator ID is required' },
      { status: 400 }
    )
  }

  const body = await request.json().catch(() => ({}))
  const note = body.note || null
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

    // Check that creator exists
    const creatorCheck = await query<{ creator_id: number }>(
      'SELECT creator_id FROM creators WHERE creator_id = $1',
      [creatorId]
    )
    if (creatorCheck.rows.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Creator not found' },
        { status: 404 }
      )
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
    console.error('Failed to update shortlist:', err)
    return NextResponse.json(
      { success: false, error: 'Failed to update shortlist' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ creatorId: string }> }
) {
  const auth = await requireAuth(request)
  if (auth instanceof Response) return auth

  if (auth.role !== 'business') {
    return NextResponse.json(
      { success: false, error: 'Only business accounts can modify shortlists' },
      { status: 403 }
    )
  }

  const resolvedParams = await params
  const creatorId = Number(resolvedParams.creatorId)
  if (!creatorId || isNaN(creatorId)) {
    return NextResponse.json(
      { success: false, error: 'Valid creator ID is required' },
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
    console.error('Failed to delete from shortlist:', err)
    return NextResponse.json(
      { success: false, error: 'Failed to delete from shortlist' },
      { status: 500 }
    )
  }
}

