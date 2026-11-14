export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server'
import { initDb, closeDb, type SqlDatabase } from '@/lib/db'
import { requireAuth } from '@/lib/api-auth'

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

export async function GET() {
  const auth = await requireAuth()
  if (auth instanceof Response) return auth

  const db = await initDb()
  try {
    const userId = auth.user.user_id

    const pendingRequests = db
      .query(
        'SELECT COUNT(*) as cnt FROM collaboration_requests WHERE creator_id = ? AND status = ?'
      )
      .get(userId, 'pending') as { cnt: number }

    const acceptedCollabs = db
      .query(
        'SELECT COUNT(*) as cnt FROM collaborations WHERE creator_id = ? AND status = ?'
      )
      .get(userId, 'accepted') as { cnt: number }

    const completedCollabs = db
      .query(
        'SELECT COUNT(*) as cnt FROM collaborations WHERE creator_id = ? AND status = ?'
      )
      .get(userId, 'completed') as { cnt: number }

    const avgRatingRow = db
      .query(
        'SELECT AVG(rating) as avg FROM reviews WHERE reviewee_id = ?'
      )
      .get(userId) as { avg: number | null }

    const totalEarningsRow = db
      .query(
        'SELECT SUM(payment_amount) as total FROM collaborations WHERE creator_id = ? AND payment_status = ?'
      )
      .get(userId, 'paid') as { total: number | null }

    const pendingPaymentsRow = db
      .query(
        'SELECT SUM(payment_amount) as total FROM collaborations WHERE creator_id = ? AND payment_status = ?'
      )
      .get(userId, 'pending') as { total: number | null }

    saveAndClose(db)
    return NextResponse.json({
      success: true,
      data: {
        new_requests: pendingRequests.cnt,
        accepted_collaborations: acceptedCollabs.cnt,
        completed_campaigns: completedCollabs.cnt,
        average_rating: avgRatingRow.avg ? Math.round(avgRatingRow.avg * 10) / 10 : 0,
        total_earnings: totalEarningsRow.total || 0,
        pending_payments: pendingPaymentsRow.total || 0,
      },
    })
  } catch {
    saveAndClose(db)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch dashboard stats' },
      { status: 500 }
    )
  }
}
