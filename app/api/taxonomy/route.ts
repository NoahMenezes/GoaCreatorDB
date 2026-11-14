import { NextResponse } from 'next/server'
import { query } from '@/lib/db'

export async function GET() {
  try {
    const [cats, locs] = await Promise.all([
      query('SELECT category_id, category_name FROM categories ORDER BY category_name ASC'),
      query('SELECT location_id, area_name, taluka, district FROM locations ORDER BY district ASC, taluka ASC, area_name ASC'),
    ])

    return NextResponse.json({
      success: true,
      categories: cats.rows,
      locations: locs.rows,
    })
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Failed to fetch taxonomy' },
      { status: 500 }
    )
  }
}

