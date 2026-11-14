export const dynamic = 'force-dynamic'
import { NextResponse } from 'next/server'
import { query } from '@/lib/db'
import { requireAuth } from '@/lib/api-auth'

export async function GET(request: Request) {
  const auth = await requireAuth(request)
  if (auth instanceof Response) return auth

  const { searchParams } = new URL(request.url)
  const idParam = searchParams.get('id')
  const status = searchParams.get('status')?.trim()
  const role = auth.role
  const userId = Number(auth.user.user_id)

  try {
    let sql = `
      SELECT vc.*
      FROM v_collaborations vc
      JOIN businesses b ON vc.business_id = b.business_id
      JOIN creators c ON vc.creator_id = c.creator_id
    `
    const conditions: string[] = []
    const params: unknown[] = []

    // Scoped by role: business sees its own, creator sees its own
    if (role === 'creator') {
      params.push(userId)
      conditions.push(`c.user_id = $${params.length}`)
    } else if (role === 'business') {
      params.push(userId)
      conditions.push(`b.user_id = $${params.length}`)
    } else if (role !== 'admin') {
      return NextResponse.json({ success: true, data: [] })
    }

    // Single collaboration query via ?id=
    if (idParam) {
      const singleId = Number(idParam)
      if (!singleId || isNaN(singleId)) {
        return NextResponse.json(
          { success: false, error: 'Valid collaboration ID is required' },
          { status: 400 }
        )
      }
      params.push(singleId)
      conditions.push(`vc.request_id = $${params.length}`)
    }

    // Status filter
    if (status && status !== 'all') {
      params.push(status)
      conditions.push(`vc.status = $${params.length}`)
    }

    if (conditions.length > 0) {
      sql += ' WHERE ' + conditions.join(' AND ')
    }

    sql += ' ORDER BY vc.requested_at DESC'

    const res = await query(sql, params)

    if (idParam) {
      if (res.rows.length === 0) {
        return NextResponse.json(
          { success: false, error: 'Collaboration not found' },
          { status: 404 }
        )
      }
      return NextResponse.json({ success: true, data: res.rows[0] })
    }

    return NextResponse.json({ success: true, data: res.rows })
  } catch (err) {
    console.error('Failed to fetch collaborations:', err)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch collaborations' },
      { status: 500 }
    )
  }
}
