export const dynamic = 'force-dynamic'
import { NextResponse } from 'next/server'
import { query } from '@/lib/db'
import { requireAuth } from '@/lib/api-auth'

export async function GET(request: Request) {
  const auth = await requireAuth()
  if (auth instanceof Response) return auth

  const { searchParams } = new URL(request.url)
  const status = searchParams.get('status')
  const role = auth.role
  const userId = auth.user.user_id

  try {
    let sql = `
      SELECT
        cr.*,
        b.business_name,
        c.full_name AS creator_name,
        ub.email AS business_email,
        uc.email AS creator_email
      FROM collaboration_requests cr
      JOIN businesses b ON cr.business_id = b.business_id
      JOIN creators c ON cr.creator_id = c.creator_id
      JOIN users ub ON b.user_id = ub.user_id
      JOIN users uc ON c.user_id = uc.user_id
      WHERE ${role === 'creator' ? 'c.user_id = $1' : 'b.user_id = $1'}
    `
    const params: unknown[] = [userId]

    if (status && status !== 'all') {
      params.push(status)
      sql += ` AND cr.status = $${params.length}`
    }

    sql += ' ORDER BY cr.requested_at DESC'

    const res = await query(sql, params)
    return NextResponse.json({ success: true, data: res.rows })
  } catch {
    return NextResponse.json(
      { success: false, error: 'Failed to fetch collaboration requests' },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  const auth = await requireAuth()
  if (auth instanceof Response) return auth

  if (auth.role !== 'business') {
    return NextResponse.json(
      { success: false, error: 'Only business accounts can create requests' },
      { status: 403 }
    )
  }

  const body = await request.json()
  const {
    creator_id,
    collab_type,
    offered_amount,
    offer_details,
    deliverables,
    message,
    deadline,
  } = body

  if (!creator_id || !collab_type || offered_amount === undefined || !deadline) {
    return NextResponse.json(
      { success: false, error: 'Missing required fields (creator_id, collab_type, offered_amount, deadline)' },
      { status: 400 }
    )
  }

  try {
    // Look up business_id for the logged in user
    const bizRes = await query<{ business_id: number }>(
      'SELECT business_id FROM businesses WHERE user_id = $1',
      [auth.user.user_id]
    )

    if (bizRes.rows.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Business profile not found for user' },
        { status: 404 }
      )
    }

    const businessId = bizRes.rows[0].business_id
    const amount = Number(offered_amount) || 0
    const deliverableStr = typeof deliverables === 'string' ? deliverables : JSON.stringify(deliverables || [])

    const insertRes = await query<{ request_id: number }>(
      `INSERT INTO collaboration_requests
       (business_id, creator_id, collab_type, offered_amount, offer_details, deliverables, message, deadline, status)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, 'pending')
       RETURNING request_id`,
      [
        businessId,
        Number(creator_id),
        collab_type,
        amount,
        offer_details || null,
        deliverableStr,
        message || null,
        deadline,
      ]
    )

    return NextResponse.json({
      success: true,
      data: { request_id: insertRes.rows[0].request_id },
    })
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : 'Failed to create collaboration request'
    return NextResponse.json(
      { success: false, error: errorMsg },
      { status: 400 }
    )
  }
}
