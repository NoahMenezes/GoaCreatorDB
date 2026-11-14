export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server'
import { initDb } from '@/lib/db'
import { requireAuth, saveAndClose } from '@/lib/api-auth'
import crypto from 'crypto'


export async function POST(request: Request) {
  const auth = await requireAuth()
  if (auth instanceof Response) return auth

  const { searchParams } = new URL(request.url)
  const requestId = searchParams.get('id')
  const action = searchParams.get('action') // 'accept' or 'decline'

  if (!requestId || !action || !['accept', 'decline'].includes(action)) {
    return NextResponse.json(
      { success: false, error: 'Valid request ID and action (accept/decline) are required' },
      { status: 400 }
    )
  }

  const db = await initDb()
  try {
    // Verify the request exists and belongs to this creator
    const existing = db
      .query(
        'SELECT * FROM collaboration_requests WHERE request_id = ? AND creator_id = ? AND status = ?'
      )
      .get(requestId, auth.user.user_id, 'pending') as unknown as { [key: string]: unknown } | null

    if (!existing) {
      saveAndClose(db)
      return NextResponse.json(
        { success: false, error: 'Request not found, not pending, or not owned by you' },
        { status: 404 }
      )
    }

    const now = new Date().toISOString()

    if (action === 'accept') {
      // Update request status
      db.query(
        'UPDATE collaboration_requests SET status = ?, updated_at = ?, responded_at = ? WHERE request_id = ?'
      ).run('accepted', now, now, requestId)

      // Create collaboration record
      const collabId = `collab-${crypto.randomUUID().slice(0, 8)}`
      db.query(
        `INSERT INTO collaborations (collaboration_id, request_id, creator_id, business_id, status, campaign_brief, deliverables, deadline, payment_amount, payment_status, escrow_locked, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
      ).run(
        collabId,
        requestId,
        existing.creator_id,
        existing.business_id,
        'accepted',
        existing.objective,
        existing.deliverables,
        existing.deadline || null,
        existing.compensation_amount,
        'pending',
        existing.compensation_amount,
        now,
        now
      )

      // Create payment record
      const paymentId = `pay-${crypto.randomUUID().slice(0, 8)}`
      db.query(
        `INSERT INTO payments (payment_id, collaboration_id, amount, status, escrow_locked, escrow_released, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`
      ).run(
        paymentId,
        collabId,
        existing.compensation_amount,
        'pending',
        existing.compensation_amount,
        0,
        now,
        now
      )

      // Notify business
      const notifId = `notif-${crypto.randomUUID().slice(0, 8)}`
      db.query(
        `INSERT INTO notifications (notification_id, user_id, type, title, message, is_read, link, created_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`
      ).run(
        notifId,
        existing.business_id,
        'request_accepted',
        'Collaboration Request Accepted',
        `Your request "${existing.title}" has been accepted by the creator.`,
        0,
        `/business/requests`,
        now
      )
    } else {
      // Decline
      db.query(
        'UPDATE collaboration_requests SET status = ?, updated_at = ?, responded_at = ? WHERE request_id = ?'
      ).run('declined', now, now, requestId)

      // Notify business
      const notifId = `notif-${crypto.randomUUID().slice(0, 8)}`
      db.query(
        `INSERT INTO notifications (notification_id, user_id, type, title, message, is_read, link, created_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`
      ).run(
        notifId,
        existing.business_id,
        'request_declined',
        'Collaboration Request Declined',
        `Your request "${existing.title}" has been declined by the creator.`,
        0,
        `/business/requests`,
        now
      )
    }

    saveAndClose(db)
    return NextResponse.json({
      success: true,
      data: { request_id: requestId, status: action === 'accept' ? 'accepted' : 'declined' },
    })
  } catch {
    saveAndClose(db)
    return NextResponse.json(
      { success: false, error: `Failed to ${action} request` },
      { status: 500 }
    )
  }
}
