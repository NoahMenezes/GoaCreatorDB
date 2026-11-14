export const dynamic = 'force-dynamic'
import { NextResponse } from 'next/server'
import { query } from '@/lib/db'
import { requireAuth } from '@/lib/api-auth'

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireAuth(request)
  if (auth instanceof Response) return auth

  const resolvedParams = await params
  const requestId = Number(resolvedParams.id)
  if (!requestId) {
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

    // Authorization: only the business or creator party can view the request
    if (userId !== row.business_user_id && userId !== row.creator_user_id && auth.role !== 'admin') {
      return NextResponse.json(
        { success: false, error: 'Unauthorized to view this request' },
        { status: 403 }
      )
    }

    // Privacy rules:
    // 1. Business contact_phone is only visible to creator if request is accepted or completed
    if (userId === row.creator_user_id && row.status !== 'accepted' && row.status !== 'completed') {
      row.contact_phone = null
    }

    // 2. Never return another user's email
    if (userId === row.creator_user_id) {
      delete row.business_email
    } else if (userId === row.business_user_id) {
      delete row.creator_email
    }

    return NextResponse.json({ success: true, data: row })
  } catch {
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
  if (!requestId) {
    return NextResponse.json(
      { success: false, error: 'Invalid request ID' },
      { status: 400 }
    )
  }

  const body = await request.json().catch(() => ({}))
  let action: string = body.action || ''

  // Fallback: URL searchParams action (e.g. ?action=accept)
  if (!action) {
    const url = new URL(request.url)
    action = url.searchParams.get('action') || ''
  }

  // Remap 'decline' to 'reject' per D3/D14
  if (action === 'decline') {
    action = 'reject'
  }

  if (!['accept', 'reject', 'complete', 'cancel'].includes(action)) {
    return NextResponse.json(
      { success: false, error: 'Invalid action. Must be accept, reject, complete, or cancel' },
      { status: 400 }
    )
  }

  try {
    const userId = Number(auth.user.user_id)
    let updateRes

    if (action === 'accept' || action === 'reject') {
      // Find creator_id for this user
      const crLookup = await query<{ creator_id: number }>(
        'SELECT creator_id FROM creators WHERE user_id = $1',
        [userId]
      )
      if (crLookup.rows.length === 0) {
        return NextResponse.json(
          { success: false, error: 'Creator profile not found for user' },
          { status: 403 }
        )
      }
      const creatorId = crLookup.rows[0].creator_id
      updateRes = await query(
        'SELECT * FROM fn_respond_to_request($1, $2, $3)',
        [requestId, creatorId, action]
      )
    } else if (action === 'complete') {
      const bizLookup = await query<{ business_id: number }>(
        'SELECT business_id FROM businesses WHERE user_id = $1',
        [userId]
      )
      if (bizLookup.rows.length === 0) {
        return NextResponse.json(
          { success: false, error: 'Business profile not found for user' },
          { status: 403 }
        )
      }
      const businessId = bizLookup.rows[0].business_id
      updateRes = await query(
        'SELECT * FROM fn_complete_request($1, $2)',
        [requestId, businessId]
      )
    } else if (action === 'cancel') {
      updateRes = await query(
        'SELECT * FROM fn_cancel_request($1, $2)',
        [requestId, userId]
      )
    }

    return NextResponse.json({
      success: true,
      data: updateRes?.rows[0] || { request_id: requestId, action },
    })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'State transition failed'
    const status = message.includes('Unauthorized') ? 403 : message.includes('Cannot') || message.includes('status') ? 409 : 400
    return NextResponse.json(
      { success: false, error: message },
      { status }
    )
  }
}
