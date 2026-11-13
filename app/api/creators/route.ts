import { NextResponse } from 'next/server'
import { getDb, closeDb } from '@/lib/db'

export interface CreatorItem {
  id: string
  name: string
  handle: string
  niche: string
  nicheSlug: string
  location: string
  followers: string
  rating: number
  baseRate: string
  er: string
  verified: boolean
  instagramUrl: string
  bio: string
}

export async function GET(request: Request) {
  const db = await getDb()
  const { searchParams } = new URL(request.url)
  const niche = searchParams.get('niche')
  const location = searchParams.get('location')

  let query = `
    SELECT profile_id, name, handle, niche, niche_slug, location,
           followers, rating, base_rate, er, verified, instagram_url, bio
    FROM creator_profiles
  `
  const params: (string | number)[] = []
  const conditions: string[] = []

  if (niche && niche !== 'all') {
    conditions.push('niche_slug = ? OR niche LIKE ?')
    params.push(niche, `%${niche}%`)
  }

  if (location) {
    conditions.push('location LIKE ?')
    params.push(`%${location}%`)
  }

  if (conditions.length > 0) {
    query += ' WHERE ' + conditions.join(' AND ')
  }

  query += ' ORDER BY rating DESC, followers DESC'

  try {
    const rows = db.query(query).all(params) as Array<{
      profile_id: string
      name: string
      handle: string
      niche: string
      niche_slug: string
      location: string
      followers: string
      rating: number
      base_rate: string
      er: string
      verified: number
      instagram_url: string
      bio: string
    }>
    closeDb()

    const data: CreatorItem[] = rows.map((r) => ({
      id: r.profile_id,
      name: r.name,
      handle: r.handle,
      niche: r.niche,
      nicheSlug: r.niche_slug,
      location: r.location,
      followers: r.followers,
      rating: r.rating,
      baseRate: r.base_rate,
      er: r.er,
      verified: r.verified === 1,
      instagramUrl: r.instagram_url,
      bio: r.bio,
    }))

    return NextResponse.json({
      success: true,
      total: data.length,
      data,
    })
  } catch {
    closeDb()
    return NextResponse.json(
      { success: false, error: 'Failed to fetch creators' },
      { status: 500 }
    )
  }
}