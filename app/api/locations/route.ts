export const dynamic = 'force-dynamic'
import { NextResponse } from 'next/server'
import { query } from '@/lib/db'

interface LocationRow {
  location_id: number
  area_name: string
  taluka: string
  district: string
}

export async function GET() {
  try {
    const res = await query<LocationRow>(`
      SELECT location_id, area_name, taluka, district
      FROM locations
      ORDER BY district ASC, taluka ASC, area_name ASC
    `)

    // Group by district, then by taluka
    const grouped: Record<string, Record<string, { location_id: number; area_name: string }[]>> = {}

    for (const row of res.rows) {
      if (!grouped[row.district]) {
        grouped[row.district] = {}
      }
      if (!grouped[row.district][row.taluka]) {
        grouped[row.district][row.taluka] = []
      }
      grouped[row.district][row.taluka].push({
        location_id: row.location_id,
        area_name: row.area_name,
      })
    }

    return NextResponse.json({
      success: true,
      data: grouped,
    })
  } catch (err) {
    console.error('Failed to fetch locations:', err)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch locations' },
      { status: 500 }
    )
  }
}

