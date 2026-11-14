export const dynamic = 'force-dynamic'
import { NextResponse } from 'next/server'
import { query } from '@/lib/db'
import { requireAuth } from '@/lib/api-auth'

export async function GET(request?: Request) {
  const auth = await requireAuth(request)
  if (auth instanceof Response) return auth

  const userId = Number(auth.user.user_id)

  try {
    const res = await query(
      `SELECT
        sa.account_id,
        sa.creator_id,
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
        lm.recorded_at AS last_synced_at
       FROM social_accounts sa
       JOIN creators c ON sa.creator_id = c.creator_id
       LEFT JOIN v_creator_latest_metrics lm ON sa.account_id = lm.account_id
       WHERE c.user_id = $1
       ORDER BY sa.account_id ASC`,
      [userId]
    )

    return NextResponse.json({ success: true, data: res.rows })
  } catch (err) {
    console.error('Failed to fetch social accounts:', err)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch social accounts' },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  const auth = await requireAuth(request)
  if (auth instanceof Response) return auth

  if (auth.role !== 'creator') {
    return NextResponse.json(
      { success: false, error: 'Only creators can connect social accounts' },
      { status: 403 }
    )
  }

  const userId = Number(auth.user.user_id)
  const body = await request.json()
  const { platform, handle, username, profile_url } = body
  const socialHandle = (handle || username || '').trim()

  if (!platform || !socialHandle) {
    return NextResponse.json(
      { success: false, error: 'Platform and handle are required' },
      { status: 400 }
    )
  }

  if (platform !== 'instagram' && platform !== 'youtube') {
    return NextResponse.json(
      { success: false, error: 'Platform must be instagram or youtube' },
      { status: 400 }
    )
  }

  const cleanHandle = socialHandle.startsWith('@') ? socialHandle : `@${socialHandle}`

  try {
    const crRes = await query<{ creator_id: number }>(
      'SELECT creator_id FROM creators WHERE user_id = $1',
      [userId]
    )

    if (crRes.rows.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Creator profile not found' },
        { status: 404 }
      )
    }

    const creatorId = crRes.rows[0].creator_id
    const finalProfileUrl =
      profile_url ||
      (platform === 'instagram'
        ? `https://instagram.com/${cleanHandle.replace('@', '')}`
        : `https://youtube.com/${cleanHandle}`)

    const insertRes = await query<{ account_id: number }>(
      `INSERT INTO social_accounts (creator_id, platform, handle, profile_url)
       VALUES ($1, $2, $3, $4)
       RETURNING account_id`,
      [creatorId, platform, cleanHandle, finalProfileUrl]
    )

    return NextResponse.json(
      {
        success: true,
        data: { account_id: insertRes.rows[0].account_id },
        message: 'Social account connected successfully',
      },
      { status: 201 }
    )
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : ''
    if (message.includes('unique') || message.includes('UNIQUE')) {
      return NextResponse.json(
        { success: false, error: 'This social account or platform is already connected' },
        { status: 409 }
      )
    }
    return NextResponse.json(
      { success: false, error: 'Failed to connect social account' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: Request) {
  const auth = await requireAuth(request)
  if (auth instanceof Response) return auth

  const { searchParams } = new URL(request.url)
  const accountId = Number(searchParams.get('id'))

  if (!accountId || isNaN(accountId)) {
    return NextResponse.json(
      { success: false, error: 'Valid account ID is required' },
      { status: 400 }
    )
  }

  const userId = Number(auth.user.user_id)

  try {
    // Ownership check: does this account exist and who does it belong to?
    const accRes = await query<{ account_id: number; creator_user_id: number }>(
      `SELECT sa.account_id, c.user_id AS creator_user_id
       FROM social_accounts sa
       JOIN creators c ON sa.creator_id = c.creator_id
       WHERE sa.account_id = $1`,
      [accountId]
    )

    if (accRes.rows.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Social account not found' },
        { status: 404 }
      )
    }

    // If account exists but does NOT belong to the calling user -> 403 Forbidden
    if (accRes.rows[0].creator_user_id !== userId && auth.role !== 'admin') {
      return NextResponse.json(
        { success: false, error: 'Forbidden: You do not own this social account' },
        { status: 403 }
      )
    }

    await query('DELETE FROM social_accounts WHERE account_id = $1', [accountId])

    return NextResponse.json({
      success: true,
      message: 'Social account disconnected successfully',
    })
  } catch (err) {
    console.error('Failed to disconnect social account:', err)
    return NextResponse.json(
      { success: false, error: 'Failed to disconnect social account' },
      { status: 500 }
    )
  }
}
