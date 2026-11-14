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
        c.category_id,
        c.category_name,
        COUNT(cc.creator_id)::int AS creator_count
      FROM categories c
      LEFT JOIN creator_categories cc ON c.category_id = cc.category_id
      GROUP BY c.category_id, c.category_name
      ORDER BY c.category_name ASC
    `)

    return NextResponse.json({ success: true, data: res.rows })
  } catch (err) {
    console.error('Failed to fetch categories:', err)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch categories' },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  const auth = await requireAdmin(request)
  if (auth instanceof Response) return auth

  const body = await request.json().catch(() => ({}))
  const categoryName = (body.category_name || body.name || '').trim()

  if (!categoryName) {
    return NextResponse.json(
      { success: false, error: 'category_name is required' },
      { status: 400 }
    )
  }

  const adminUserId = Number(auth.user.user_id)

  try {
    const insertRes = await withTransaction(adminUserId, async (client) => {
      return client.query<{ category_id: number; category_name: string }>(
        'INSERT INTO categories (category_name) VALUES ($1) RETURNING category_id, category_name',
        [categoryName]
      )
    })

    return NextResponse.json(
      {
        success: true,
        data: insertRes.rows[0],
        message: 'Category created successfully',
      },
      { status: 201 }
    )
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : ''
    if (msg.includes('uq_categories_category_name') || msg.includes('unique') || msg.includes('duplicate')) {
      return NextResponse.json(
        { success: false, error: 'A category with this name already exists' },
        { status: 409 }
      )
    }
    return NextResponse.json(
      { success: false, error: 'Failed to create category' },
      { status: 500 }
    )
  }
}

export async function PUT(request: Request) {
  const auth = await requireAdmin(request)
  if (auth instanceof Response) return auth

  const body = await request.json().catch(() => ({}))
  const categoryId = Number(body.category_id || body.id)
  const categoryName = (body.category_name || body.name || '').trim()

  if (!categoryId || isNaN(categoryId) || !categoryName) {
    return NextResponse.json(
      { success: false, error: 'Valid category_id and category_name are required' },
      { status: 400 }
    )
  }

  const adminUserId = Number(auth.user.user_id)

  try {
    const updateRes = await withTransaction(adminUserId, async (client) => {
      return client.query(
        'UPDATE categories SET category_name = $1 WHERE category_id = $2 RETURNING category_id, category_name',
        [categoryName, categoryId]
      )
    })

    if (updateRes.rows.length === 0) {
      return NextResponse.json({ success: false, error: 'Category not found' }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      data: updateRes.rows[0],
      message: 'Category updated successfully',
    })
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : ''
    if (msg.includes('uq_categories_category_name') || msg.includes('unique') || msg.includes('duplicate')) {
      return NextResponse.json(
        { success: false, error: 'A category with this name already exists' },
        { status: 409 }
      )
    }
    return NextResponse.json(
      { success: false, error: 'Failed to update category' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: Request) {
  const auth = await requireAdmin(request)
  if (auth instanceof Response) return auth

  const { searchParams } = new URL(request.url)
  let categoryId = Number(searchParams.get('id') || searchParams.get('category_id'))

  if (!categoryId || isNaN(categoryId)) {
    const body = await request.json().catch(() => ({}))
    categoryId = Number(body.id || body.category_id)
  }

  if (!categoryId || isNaN(categoryId)) {
    return NextResponse.json(
      { success: false, error: 'Valid category_id is required' },
      { status: 400 }
    )
  }

  const adminUserId = Number(auth.user.user_id)

  try {
    // Check if category exists
    const checkRes = await query('SELECT category_id FROM categories WHERE category_id = $1', [categoryId])
    if (checkRes.rows.length === 0) {
      return NextResponse.json({ success: false, error: 'Category not found' }, { status: 404 })
    }

    // Deleting a row that is still referenced returns 409 with a clear message
    const refRes = await query<{ count: number }>(
      'SELECT COUNT(*)::int AS count FROM creator_categories WHERE category_id = $1',
      [categoryId]
    )
    if ((refRes.rows[0]?.count || 0) > 0) {
      return NextResponse.json(
        {
          success: false,
          error: `Cannot delete category: it is still referenced by ${refRes.rows[0].count} creator profile(s)`,
        },
        { status: 409 }
      )
    }

    await withTransaction(adminUserId, async (client) => {
      await client.query('DELETE FROM categories WHERE category_id = $1', [categoryId])
    })

    return NextResponse.json({
      success: true,
      message: 'Category deleted successfully',
    })
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : ''
    if (msg.includes('foreign key') || msg.includes('constraint')) {
      return NextResponse.json(
        { success: false, error: 'Cannot delete category: it is still referenced by other records' },
        { status: 409 }
      )
    }
    return NextResponse.json(
      { success: false, error: 'Failed to delete category' },
      { status: 500 }
    )
  }
}

