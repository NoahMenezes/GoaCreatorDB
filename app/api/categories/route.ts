export const dynamic = 'force-dynamic'
import { NextResponse } from 'next/server'
import { query } from '@/lib/db'

export async function GET() {
  try {
    const res = await query(`
      SELECT
        c.category_id,
        c.category_name,
        COALESCE(v.creator_count, 0) AS creator_count,
        COALESCE(v.primary_creator_count, 0) AS primary_creator_count,
        COALESCE(v.pct_of_creators, 0) AS pct_of_creators
      FROM categories c
      LEFT JOIN v_category_distribution v ON c.category_id = v.category_id
      ORDER BY c.category_id ASC
    `)

    return NextResponse.json({
      success: true,
      data: res.rows,
    })
  } catch (err) {
    console.error('Failed to fetch categories:', err)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch categories' },
      { status: 500 }
    )
  }
}

