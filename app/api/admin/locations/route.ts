export const dynamic = 'force-dynamic'
import { NextResponse } from 'next/server'
import { query, withTransaction } from '@/lib/db'
import { requireAdmin } from '@/lib/api-auth'

export async function GET(request: Request) {
  const auth = await requireAdmin(request)
  if (auth instanceof Response) return auth

  try {
    const res = await query(`
      SELECT
        l.location_id,
        l.area_name,
        l.taluka,
        l.district,
        COUNT(DISTINCT c.creator_id)::int AS creator_count,
        COUNT(DISTINCT b.business_id)::int AS business_count
      FROM locations l
      LEFT JOIN creators c ON l.location_id = c.location_id
      LEFT JOIN businesses b ON l.location_id = b.location_id
      GROUP BY l.location_id, l.area_name, l.taluka, l.district
      ORDER BY l.district ASC, l.taluka ASC, l.area_name ASC
    `)

    return NextResponse.json({ success: true, data: res.rows })
  } catch (err) {
    console.error('Failed to fetch admin locations:', err)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch locations' },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  const auth = await requireAdmin(request)
  if (auth instanceof Response) return auth

  const body = await request.json().catch(() => ({}))
  const areaName = (body.area_name || '').trim()
  const taluka = (body.taluka || '').trim()
  const district = (body.district || '').trim()

  if (!areaName || !taluka || !district) {
    return NextResponse.json(
      { success: false, error: 'area_name, taluka, and district are required' },
      { status: 400 }
    )
  }

  if (district !== 'North Goa' && district !== 'South Goa') {
    return NextResponse.json(
      { success: false, error: "district must be 'North Goa' or 'South Goa'" },
      { status: 400 }
    )
  }

  const adminUserId = Number(auth.user.user_id)

  try {
    const insertRes = await withTransaction(adminUserId, async (client) => {
      return client.query<{
        location_id: number
        area_name: string
        taluka: string
        district: string
      }>(
        'INSERT INTO locations (area_name, taluka, district) VALUES ($1, $2, $3) RETURNING location_id, area_name, taluka, district',
        [areaName, taluka, district]
      )
    })

    return NextResponse.json(
      {
        success: true,
        data: insertRes.rows[0],
        message: 'Location created successfully',
      },
      { status: 201 }
    )
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : ''
    if (msg.includes('uq_locations_area_taluka') || msg.includes('unique') || msg.includes('duplicate')) {
      return NextResponse.json(
        { success: false, error: 'A location with this area_name and taluka already exists' },
        { status: 409 }
      )
    }
    return NextResponse.json(
      { success: false, error: 'Failed to create location' },
      { status: 500 }
    )
  }
}

export async function PUT(request: Request) {
  const auth = await requireAdmin(request)
  if (auth instanceof Response) return auth

  const body = await request.json().catch(() => ({}))
  const locationId = Number(body.location_id || body.id)
  const areaName = (body.area_name || '').trim()
  const taluka = (body.taluka || '').trim()
  const district = (body.district || '').trim()

  if (!locationId || isNaN(locationId) || !areaName || !taluka || !district) {
    return NextResponse.json(
      { success: false, error: 'Valid location_id, area_name, taluka, and district are required' },
      { status: 400 }
    )
  }

  if (district !== 'North Goa' && district !== 'South Goa') {
    return NextResponse.json(
      { success: false, error: "district must be 'North Goa' or 'South Goa'" },
      { status: 400 }
    )
  }

  const adminUserId = Number(auth.user.user_id)

  try {
    const updateRes = await withTransaction(adminUserId, async (client) => {
      return client.query(
        'UPDATE locations SET area_name = $1, taluka = $2, district = $3 WHERE location_id = $4 RETURNING location_id, area_name, taluka, district',
        [areaName, taluka, district, locationId]
      )
    })

    if (updateRes.rows.length === 0) {
      return NextResponse.json({ success: false, error: 'Location not found' }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      data: updateRes.rows[0],
      message: 'Location updated successfully',
    })
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : ''
    if (msg.includes('uq_locations_area_taluka') || msg.includes('unique') || msg.includes('duplicate')) {
      return NextResponse.json(
        { success: false, error: 'A location with this area_name and taluka already exists' },
        { status: 409 }
      )
    }
    return NextResponse.json(
      { success: false, error: 'Failed to update location' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: Request) {
  const auth = await requireAdmin(request)
  if (auth instanceof Response) return auth

  const { searchParams } = new URL(request.url)
  let locationId = Number(searchParams.get('id') || searchParams.get('location_id'))

  if (!locationId || isNaN(locationId)) {
    const body = await request.json().catch(() => ({}))
    locationId = Number(body.id || body.location_id)
  }

  if (!locationId || isNaN(locationId)) {
    return NextResponse.json(
      { success: false, error: 'Valid location_id is required' },
      { status: 400 }
    )
  }

  const adminUserId = Number(auth.user.user_id)

  try {
    const checkRes = await query('SELECT location_id FROM locations WHERE location_id = $1', [locationId])
    if (checkRes.rows.length === 0) {
      return NextResponse.json({ success: false, error: 'Location not found' }, { status: 404 })
    }

    // Deleting a row that is still referenced returns 409 with a clear message
    const [crRef, bizRef] = await Promise.all([
      query<{ count: number }>('SELECT COUNT(*)::int AS count FROM creators WHERE location_id = $1', [locationId]),
      query<{ count: number }>('SELECT COUNT(*)::int AS count FROM businesses WHERE location_id = $1', [locationId]),
    ])

    const totalRefs = (crRef.rows[0]?.count || 0) + (bizRef.rows[0]?.count || 0)
    if (totalRefs > 0) {
      return NextResponse.json(
        {
          success: false,
          error: `Cannot delete location: it is still referenced by ${totalRefs} profile(s)`,
        },
        { status: 409 }
      )
    }

    await withTransaction(adminUserId, async (client) => {
      await client.query('DELETE FROM locations WHERE location_id = $1', [locationId])
    })

    return NextResponse.json({
      success: true,
      message: 'Location deleted successfully',
    })
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : ''
    if (msg.includes('foreign key') || msg.includes('constraint') || msg.includes('fk_')) {
      return NextResponse.json(
        { success: false, error: 'Cannot delete location: it is still referenced by other records' },
        { status: 409 }
      )
    }
    return NextResponse.json(
      { success: false, error: 'Failed to delete location' },
      { status: 500 }
    )
  }
}

