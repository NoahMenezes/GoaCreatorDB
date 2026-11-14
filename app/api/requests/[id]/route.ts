export const dynamic = 'force-dynamic'
import { NextResponse } from 'next/server'
import { query, withTransaction } from '@/lib/db'
import { requireAuth } from '@/lib/api-auth'

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireAuth(request)
  if (auth instanceof Response) return auth

  const resolvedParams = await params
  const requestId = Number(resolvedParams.id)
  if (!requestId || isNaN(requestId)) {
    return NextResponse.json(
      { success: false, error: 'Invalid request ID' },
      { status: 400 }
    )
  }

  try {
    const res = await query(
      `SELECT
        cr.*,
        b.business_name,
        b.industry,
        b.contact_phone,
        b.instagram_handle AS business_instagram,
        c.full_name AS creator_name,
        ub.user_id AS business_user_id,
        uc.user_id AS creator_user_id,
        ub.email AS business_email,
        uc.email AS creator_email
       FROM collaboration_requests cr
       JOIN businesses b ON cr.business_id = b.business_id
       JOIN creators c ON cr.creator_id = c.creator_id
       JOIN users ub ON b.user_id = ub.user_id
       JOIN users uc ON c.user_id = uc.user_id
       WHERE cr.request_id = $1`,
      [requestId]
    )

    if (res.rows.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Request not found' },
        { status: 404 }
      )
    }

    const row = res.rows[0]
    const userId = Number(auth.user.user_id)

    // Only the two parties or an admin can view the request; otherwise 404
    if (userId !== row.business_user_id && userId !== row.creator_user_id && auth.role !== 'admin') {
      return NextResponse.json(
        { success: false, error: 'Request not found' },
        { status: 404 }
      )
    }

    // Privacy rules:
    // 1. Business contact_phone is only visible to creator if request is accepted or completed
    if (userId === row.creator_user_id && row.status !== 'accepted' && row.status !== 'completed') {
      row.contact_phone = null
    }

    // 2. Never return another user's email or password hash
    if (userId === row.creator_user_id) {
      delete row.business_email
    } else if (userId === row.business_user_id) {
      delete row.creator_email
    }

    return NextResponse.json({ success: true, data: row })
  } catch (err) {
    console.error('Failed to fetch request:', err)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch collaboration request' },
      { status: 500 }
    )
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  return handleAction(request, params)
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  return handleAction(request, params)
}

async function handleAction(
  request: Request,
  paramsPromise: Promise<{ id: string }>
) {
  const auth = await requireAuth(request)
  if (auth instanceof Response) return auth

  const resolvedParams = await paramsPromise
  const requestId = Number(resolvedParams.id)
  if (!requestId || isNaN(requestId)) {
    return NextResponse.json(
      { success: false, error: 'Invalid request ID' },
      { status: 400 }
    )
  }

  const body = await request.json().catch(() => ({}))
  let action: string = (body.action || '').toLowerCase().trim()

  // Fallback: URL searchParams action (e.g. ?action=accept)
  if (!action) {
    const url = new URL(request.url)
    action = (url.searchParams.get('action') || '').toLowerCase().trim()
  }

  // Remap 'decline' to 'reject'
  if (action === 'decline') {
    action = 'reject'
  }

  if (!['accept', 'reject', 'complete', 'cancel'].includes(action)) {
    return NextResponse.json(
      { success: false, error: 'Invalid action. Must be accept, reject, complete, or cancel' },
      { status: 400 }
    )
  }

  const userId = Number(auth.user.user_id)

  try {
    // Every status change goes through the PL/pgSQL functions inside a transaction
    const updateRes = await withTransaction(userId, async (client) => {
      if (action === 'accept' || action === 'reject') {
        // Creator responds
        const crLookup = await client.query<{ creator_id: number }>(
          'SELECT creator_id FROM creators WHERE user_id = $1',
          [userId]
        )
        if (crLookup.rows.length === 0) {
          throw new Error('Unauthorized: only creators can accept or reject requests')
        }
        const creatorId = crLookup.rows[0].creator_id
        return client.query(
          'SELECT * FROM fn_respond_to_request($1, $2, $3)',
          [requestId, creatorId, action]
        )
      } else if (action === 'complete') {
        // Business completes
        const bizLookup = await client.query<{ business_id: number }>(
          'SELECT business_id FROM businesses WHERE user_id = $1',
          [userId]
        )
        if (bizLookup.rows.length === 0) {
          throw new Error('Unauthorized: only businesses can complete requests')
        }
        const businessId = bizLookup.rows[0].business_id
        return client.query(
          'SELECT * FROM fn_complete_request($1, $2)',
          [requestId, businessId]
        )
      } else if (action === 'cancel') {
        // Either party can cancel
        return client.query(
          'SELECT * FROM fn_cancel_request($1, $2)',
          [requestId, userId]
        )
      }
    })

    return NextResponse.json({
      success: true,
      data: updateRes?.rows[0] || { request_id: requestId, action },
      message: `Request successfully updated with action: ${action}`,
    })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'State transition failed'
    // Invalid transitions and state-machine violations return 409
    return NextResponse.json(
      { success: false, error: message },
      { status: 409 }
    )
  }
}
