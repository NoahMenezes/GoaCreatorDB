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
  const userId = Number(auth.user.user_id)

  try {
    let sql = `
      SELECT vc.*
      FROM v_collaborations vc
      JOIN businesses b ON vc.business_id = b.business_id
      JOIN creators c ON vc.creator_id = c.creator_id
      WHERE ${role === 'creator' ? 'c.user_id = $1' : 'b.user_id = $1'}
    `
    const params: unknown[] = [userId]

    if (status && status !== 'all') {
      params.push(status)
      sql += ` AND vc.status = $${params.length}`
    }

    sql += ' ORDER BY vc.requested_at DESC'

    const res = await query(sql, params)
    return NextResponse.json({ success: true, data: res.rows })
  } catch {
    return NextResponse.json(
      { success: false, error: 'Failed to fetch collaborations' },
      { status: 500 }
    )
  }
}
