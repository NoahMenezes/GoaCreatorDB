export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server'
import { getDb, closeDb } from '@/lib/db'

export interface ReelItem {
  id: string
  title: string
  caption: string
  hashtags: string[]
  audioTrack: string
  creator: {
    name: string
    handle: string
    avatar: string
    followers: string
    rating: number
    baseRate: string
    er: string
    verified: boolean
  }
  category: string
  categorySlug: string
  location: string
  videoUrl: string
  instagramUrl: string
  views: string
  likes: number
  comments: number
}

export async function GET(request: Request) {
  const db = await getDb()
  const { searchParams } = new URL(request.url)
  const category = searchParams.get('category')
  const location = searchParams.get('location')
  const search = searchParams.get('search')
  const shuffle = searchParams.get('shuffle')

  let query = `
    SELECT r.reel_id, r.title, r.caption, r.hashtags, r.audio_track,
           r.category, r.category_slug, r.location, r.video_url, r.instagram_url,
           r.views, r.likes, r.comments,
           cp.name as creator_name, cp.handle as creator_handle,
           cp.followers as creator_followers, cp.rating as creator_rating,
           cp.base_rate as creator_base_rate, cp.er as creator_er,
           cp.verified as creator_verified
    FROM reels r
    LEFT JOIN creator_profiles cp ON r.creator_profile_id = cp.profile_id
  `
  const params: (string | number)[] = []
  const conditions: string[] = []

  if (category && category !== 'all' && category !== 'All Niches') {
    conditions.push('r.category_slug = ? OR r.category = ?')
    params.push(category, category)
  }

  if (location) {
    conditions.push('r.location LIKE ?')
    params.push(`%${location}%`)
  }

  if (search) {
    const queryStr = `%${search.toLowerCase()}%`
    conditions.push(
      'LOWER(r.title) LIKE ? OR LOWER(r.caption) LIKE ? OR LOWER(r.location) LIKE ? OR LOWER(r.category) LIKE ?'
    )
    params.push(queryStr, queryStr, queryStr, queryStr)
  }

  if (conditions.length > 0) {
    query += ' WHERE ' + conditions.join(' AND ')
  }

  if (shuffle === 'true' || shuffle === '1') {
    query += ' ORDER BY RANDOM()'
  } else {
    query += ' ORDER BY r.created_at DESC'
  }

  try {
    const rows = db.query(query).all(params) as Array<{
      reel_id: string
      title: string
      caption: string
      hashtags: string
      audio_track: string
      category: string
      category_slug: string
      location: string
      video_url: string
      instagram_url: string
      views: string
      likes: number
      comments: number
      creator_name: string | null
      creator_handle: string | null
      creator_followers: string | null
      creator_rating: number | null
      creator_base_rate: string | null
      creator_er: string | null
      creator_verified: number | null
    }>
    closeDb()

    const data: ReelItem[] = rows.map((r) => ({
      id: r.reel_id,
      title: r.title,
      caption: r.caption,
      hashtags: JSON.parse(r.hashtags || '[]'),
      audioTrack: r.audio_track,
      creator: {
        name: r.creator_name || 'Unknown Creator',
        handle: r.creator_handle || '@unknown',
        avatar: r.creator_name ? r.creator_name.split(' ').map((n) => n[0]).join('') : 'UK',
        followers: r.creator_followers || '0',
        rating: r.creator_rating || 0,
        baseRate: r.creator_base_rate || '₹0/reel',
        er: r.creator_er || '0% ER',
        verified: r.creator_verified === 1,
      },
      category: r.category,
      categorySlug: r.category_slug,
      location: r.location,
      videoUrl: r.video_url,
      instagramUrl: r.instagram_url,
      views: r.views,
      likes: r.likes,
      comments: r.comments,
    }))

    return NextResponse.json({
      success: true,
      total: data.length,
      source: 'GoaConnect Verified Reels Engine',
      data,
    })
  } catch {
    closeDb()
    return NextResponse.json(
      { success: false, error: 'Failed to fetch reels' },
      { status: 500 }
    )
  }
}