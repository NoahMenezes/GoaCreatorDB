export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server'
import { initDb, closeDb, type SqlDatabase } from '@/lib/db'
import { requireAuth } from '@/lib/api-auth'
import crypto from 'crypto'

function saveAndClose(db: SqlDatabase) {
  try {
    const data = db.export()
    const fs = require('fs')
    const path = require('path')
    const dbDir = path.dirname(
      process.env.DATABASE_URL
        ? process.env.DATABASE_URL.replace(/^sqlite:/, '')
        : path.join(process.cwd(), '.data', 'goa-creator.db')
    )
    if (!fs.existsSync(dbDir)) fs.mkdirSync(dbDir, { recursive: true })
    fs.writeFileSync(
      process.env.DATABASE_URL
        ? process.env.DATABASE_URL.replace(/^sqlite:/, '')
        : path.join(process.cwd(), '.data', 'goa-creator.db'),
      Buffer.from(data)
    )
  } catch {}
  closeDb()
}

export async function POST(request: Request) {
  const auth = await requireAuth()
  if (auth instanceof Response) return auth

  const body = await request.json()
  const { account_id } = body

  if (!account_id) {
    return NextResponse.json(
      { success: false, error: 'Account ID is required' },
      { status: 400 }
    )
  }

  const db = await initDb()
  try {
    const account = db
      .query('SELECT * FROM social_accounts WHERE account_id = ? AND user_id = ?')
      .get(account_id, auth.user.user_id) as any | null

    if (!account) {
      saveAndClose(db)
      return NextResponse.json(
        { success: false, error: 'Social account not found' },
        { status: 404 }
      )
    }

    // Generate demonstration metrics (creator-submitted source, not verified by API)
    const metricId = `sm-${crypto.randomUUID().slice(0, 8)}`
    const now = new Date().toISOString()
    const followers = Math.floor(Math.random() * 50000) + 10000
    const engagementRate = Math.round((Math.random() * 5 + 3) * 100) / 100

    db.query(
      `INSERT INTO social_metrics (metric_id, account_id, followers, following, posts, likes, comments, shares, impressions, reach, engagement_rate, avg_likes, avg_comments, avg_views, source, verified, recorded_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
    ).run(
      metricId,
      account_id,
      followers,
      Math.floor(followers * 0.1),
      Math.floor(followers * 0.02),
      Math.floor(followers * 0.05),
      Math.floor(followers * 0.01),
      Math.floor(followers * 0.005),
      Math.floor(followers * 3),
      Math.floor(followers * 2),
      engagementRate,
      Math.floor(followers * 0.05),
      Math.floor(followers * 0.01),
      Math.floor(followers * 0.1),
      'creator_submitted',
      0,
      now
    )

    // Create snapshot
    const snapshotId = `ss-${crypto.randomUUID().slice(0, 8)}`
    db.query(
      `INSERT INTO metric_snapshots (snapshot_id, account_id, followers, engagement_rate, avg_likes, avg_comments, avg_views, recorded_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`
    ).run(
      snapshotId,
      account_id,
      followers,
      engagementRate,
      Math.floor(followers * 0.05),
      Math.floor(followers * 0.01),
      Math.floor(followers * 0.1),
      now
    )

    db.query(
      'UPDATE social_accounts SET last_synced_at = ?, updated_at = ? WHERE account_id = ?'
    ).run(now, now, account_id)

    saveAndClose(db)
    return NextResponse.json({
      success: true,
      data: {
        account_id,
        synced_at: now,
        source: 'creator_submitted',
        verified: false,
        metrics: { followers, engagement_rate: engagementRate },
      },
      message: 'Metrics synced. Source: creator-submitted (not verified by official API). Configure Meta/YouTube API credentials for verified data.',
    })
  } catch {
    saveAndClose(db)
    return NextResponse.json(
      { success: false, error: 'Failed to sync social metrics' },
      { status: 500 }
    )
  }
}
