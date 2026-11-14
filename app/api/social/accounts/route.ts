export const dynamic = 'force-dynamic'
import { NextResponse } from 'next/server'
import { query } from '@/lib/db'
import { requireAuth } from '@/lib/api-auth'

export async function GET() {
  const auth = await requireAuth()
  if (auth instanceof Response) return auth

  const userId = Number(auth.user.user_id)

  try {
    const res = await query(
      `SELECT
        sa.*,
        MAX(cm.recorded_at) AS last_synced_at
       FROM social_accounts sa
       JOIN creators c ON sa.creator_id = c.creator_id
       LEFT JOIN creator_metrics cm ON sa.account_id = cm.account_id
       WHERE c.user_id = $1
       GROUP BY sa.account_id
       ORDER BY sa.account_id DESC`,
      [userId]
    )

    return NextResponse.json({ success: true, data: res.rows })
  } catch {
    return NextResponse.json(
      { success: false, error: 'Failed to fetch social accounts' },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  const auth = await requireAuth()
  if (auth instanceof Response) return auth

  const userId = Number(auth.user.user_id)
  const body = await request.json()
  const { platform, handle, username, profile_url } = body
  const socialHandle = (handle || username || '').trim().replace(/^@/, '')

  if (!platform || !socialHandle) {
    return NextResponse.json(
      { success: false, error: 'Platform and handle are required' },
      { status: 400 }
    )
  }

  try {
    const crRes = await query<{ creator_id: number }>(
      'SELECT creator_id FROM creators WHERE user_id = $1',
      [userId]
    )

    if (crRes.rows.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Creator profile not found for user' },
        { status: 404 }
      )
    }

    const creatorId = crRes.rows[0].creator_id
    const finalProfileUrl = profile_url || (platform === 'instagram' ? `https://instagram.com/${socialHandle}` : `https://youtube.com/@${socialHandle}`)

    const insertRes = await query<{ account_id: number }>(
      `INSERT INTO social_accounts (creator_id, platform, handle, profile_url)
       VALUES ($1, $2, $3, $4)
       RETURNING account_id`,
      [creatorId, platform, socialHandle, finalProfileUrl]
    )

    return NextResponse.json({
      success: true,
      data: { account_id: insertRes.rows[0].account_id },
    })
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
  const auth = await requireAuth()
  if (auth instanceof Response) return auth

  const { searchParams } = new URL(request.url)
  const accountId = Number(searchParams.get('id'))

  if (!accountId) {
    return NextResponse.json(
      { success: false, error: 'Valid account ID is required' },
      { status: 400 }
    )
  }

  const userId = Number(auth.user.user_id)

  try {
    await query(
      `DELETE FROM social_accounts sa
       USING creators c
       WHERE sa.creator_id = c.creator_id
         AND sa.account_id = $1
         AND c.user_id = $2`,
      [accountId, userId]
    )

    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json(
      { success: false, error: 'Failed to disconnect social account' },
      { status: 500 }
    )
  }
}
