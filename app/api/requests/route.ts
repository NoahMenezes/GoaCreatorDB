export const dynamic = 'force-dynamic'
import { NextResponse } from 'next/server'
import { z } from 'zod'
import { query, withTransaction } from '@/lib/db'
import { requireAuth } from '@/lib/api-auth'

// Zod Schema for POST /api/requests
const createRequestSchema = z
  .object({
    creator_id: z.coerce.number().int().positive({ message: 'Valid creator_id is required' }),
    collab_type: z.enum(['paid', 'barter', 'hybrid'], {
      message: "collab_type must be 'paid', 'barter', or 'hybrid'",
    }),
    offered_amount: z.coerce.number().min(0, { message: 'offered_amount must be >= 0' }).default(0),
    deliverables: z.union([
      z.string().min(1, { message: 'deliverables cannot be empty' }),
      z.array(z.string()).min(1, { message: 'deliverables cannot be empty' }),
    ]),
    offer_details: z.string().optional().nullable(),
    message: z.string().optional().nullable(),
    deadline: z.string().min(1, { message: 'deadline is required' }),
  })
  .superRefine((data, ctx) => {
    // Paid and hybrid require offered_amount > 0
    if ((data.collab_type === 'paid' || data.collab_type === 'hybrid') && data.offered_amount <= 0) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'offered_amount must be greater than 0 for paid and hybrid collaborations',
        path: ['offered_amount'],
      })
    }

    // Deadline must be in the future
    const deadlineDate = new Date(data.deadline)
    if (isNaN(deadlineDate.getTime())) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Invalid deadline date format',
        path: ['deadline'],
      })
    } else {
      const todayStr = new Date().toISOString().split('T')[0]
      const deadlineStr = deadlineDate.toISOString().split('T')[0]
      if (deadlineStr <= todayStr) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Deadline must be in the future',
          path: ['deadline'],
        })
      }
    }
  })

export async function GET(request: Request) {
  const auth = await requireAuth(request)
  if (auth instanceof Response) return auth

  const { searchParams } = new URL(request.url)
  const status = searchParams.get('status')?.trim()
  const q = searchParams.get('q')?.trim()
  const role = auth.role
  const userId = Number(auth.user.user_id)

  const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10) || 1)
  const limit = Math.min(100, Math.max(1, parseInt(searchParams.get('limit') || '20', 10) || 20))
  const offset = (page - 1) * limit

  try {
    let sql = `
      SELECT
        cr.request_id,
        cr.business_id,
        cr.creator_id,
        cr.collab_type,
        cr.offered_amount,
        cr.offer_details,
        cr.deliverables,
        cr.message,
        cr.status,
        cr.requested_at,
        cr.responded_at,
        cr.deadline,
        b.business_name,
        b.industry AS business_industry,
        c.full_name AS creator_name,
        (SELECT handle FROM social_accounts sa WHERE sa.creator_id = c.creator_id LIMIT 1) AS creator_handle,
        CASE
          WHEN cr.status IN ('accepted', 'completed') THEN b.contact_phone
          ELSE NULL
        END AS contact_phone,
        COUNT(*) OVER() AS total_count
      FROM collaboration_requests cr
      JOIN businesses b ON cr.business_id = b.business_id
      JOIN creators c ON cr.creator_id = c.creator_id
    `

    const conditions: string[] = []
    const params: unknown[] = []

    // Scoped by role
    if (role === 'creator') {
      params.push(userId)
      conditions.push(`c.user_id = $${params.length}`)
    } else if (role === 'business') {
      params.push(userId)
      conditions.push(`b.user_id = $${params.length}`)
    } else if (role !== 'admin') {
      return NextResponse.json({ success: true, data: [], pagination: { total: 0, page, limit, totalPages: 0, hasNext: false, hasPrev: false } })
    }

    // Filter by status
    if (status && status !== 'all') {
      params.push(status)
      conditions.push(`cr.status = $${params.length}`)
    }

    // Search query
    if (q) {
      params.push(`%${q}%`)
      const paramIdx = params.length
      conditions.push(`(
        c.full_name ILIKE $${paramIdx}
        OR b.business_name ILIKE $${paramIdx}
        OR cr.deliverables ILIKE $${paramIdx}
        OR cr.offer_details ILIKE $${paramIdx}
      )`)
    }

    if (conditions.length > 0) {
      sql += ' WHERE ' + conditions.join(' AND ')
    }

    sql += ' ORDER BY cr.requested_at DESC'

    // Pagination
    params.push(limit)
    sql += ` LIMIT $${params.length}`
    params.push(offset)
    sql += ` OFFSET $${params.length}`

    const res = await query(sql, params)
    const total = res.rows.length > 0 ? Number(res.rows[0].total_count) : 0
    const totalPages = Math.ceil(total / limit)

    // Format deliverables and clean up internal columns
    const data = res.rows.map((row) => {
      const { total_count, ...cleanRow } = row
      return cleanRow
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
    console.error('Failed to fetch requests:', err)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch collaboration requests' },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  const auth = await requireAuth(request)
  if (auth instanceof Response) return auth

  const url = new URL(request.url)
  const queryId = url.searchParams.get('id')
  const queryAction = url.searchParams.get('action')

  // Short-lived alias support for legacy POST /api/requests?id=...&action=...
  if (queryId && queryAction) {
    const { PATCH: patchHandler } = await import('@/app/api/requests/[id]/route')
    return patchHandler(request, { params: Promise.resolve({ id: queryId }) })
  }

  if (auth.role !== 'business') {
    return NextResponse.json(
      { success: false, error: 'Only business accounts can create requests' },
      { status: 403 }
    )
  }

  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json(
      { success: false, error: 'Invalid JSON request body' },
      { status: 400 }
    )
  }

  // Zod validation
  const parseResult = createRequestSchema.safeParse(body)
  if (!parseResult.success) {
    const firstIssue = parseResult.error.issues[0]
    return NextResponse.json(
      { success: false, error: firstIssue?.message || 'Validation failed', details: parseResult.error.issues },
      { status: 400 }
    )
  }

  const { creator_id, collab_type, offered_amount, offer_details, deliverables, message, deadline } =
    parseResult.data

  const userId = Number(auth.user.user_id)

  try {
    // 1. Look up business_id from session/database (never trust client)
    let businessId = auth.businessId
    if (!businessId) {
      const bizRes = await query<{ business_id: number }>(
        'SELECT business_id FROM businesses WHERE user_id = $1',
        [userId]
      )
      if (bizRes.rows.length === 0) {
        return NextResponse.json(
          { success: false, error: 'Business profile not found for user' },
          { status: 404 }
        )
      }
      businessId = bizRes.rows[0].business_id
    }

    // 2. Verify creator exists
    const creatorCheck = await query<{ creator_id: number }>(
      'SELECT creator_id FROM creators WHERE creator_id = $1',
      [creator_id]
    )
    if (creatorCheck.rows.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Creator not found' },
        { status: 404 }
      )
    }

    // 3. Check for existing pending request between this business and creator
    const pendingCheck = await query<{ request_id: number }>(
      `SELECT request_id FROM collaboration_requests
       WHERE business_id = $1 AND creator_id = $2 AND status = 'pending'`,
      [businessId, creator_id]
    )
    if (pendingCheck.rows.length > 0) {
      return NextResponse.json(
        { success: false, error: 'A pending collaboration request already exists for this creator' },
        { status: 409 }
      )
    }

    const deliverableStr = typeof deliverables === 'string' ? deliverables : JSON.stringify(deliverables)

    // 4. Insert request inside transaction with audit context
    const insertRes = await withTransaction(userId, async (client) => {
      return client.query<{ request_id: number }>(
        `INSERT INTO collaboration_requests (
           business_id, creator_id, collab_type, offered_amount, offer_details,
           deliverables, message, deadline, status
         ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, 'pending')
         RETURNING request_id`,
        [
          businessId,
          creator_id,
          collab_type,
          offered_amount,
          offer_details || null,
          deliverableStr,
          message || null,
          deadline,
        ]
      )
    })

    return NextResponse.json(
      {
        success: true,
        data: { request_id: insertRes.rows[0].request_id },
        message: 'Collaboration request created successfully',
      },
      { status: 201 }
    )
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : 'Failed to create collaboration request'
    // Unique pending request constraint violation -> 409
    if (errorMsg.includes('uq_requests_pending_pair') || errorMsg.includes('unique') || errorMsg.includes('duplicate')) {
      return NextResponse.json(
        { success: false, error: 'A pending collaboration request already exists for this creator' },
        { status: 409 }
      )
    }
    return NextResponse.json(
      { success: false, error: errorMsg },
      { status: 400 }
    )
  }
}
