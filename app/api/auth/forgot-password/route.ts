export const dynamic = 'force-dynamic'
import { NextResponse } from 'next/server'
import { query } from '@/lib/db'
import crypto from 'crypto'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { email } = body

    if (!email) {
      return NextResponse.json(
        { success: false, error: 'Email is required' },
        { status: 400 }
      )
    }

    const emailClean = email.trim().toLowerCase()
    const userRes = await query('SELECT user_id FROM users WHERE email = $1', [emailClean])

    // Always return success to prevent email enumeration
    if (userRes.rows.length === 0) {
      return NextResponse.json({
        success: true,
        message: 'If an account exists, a reset link has been sent.',
      })
    }

    const userId = userRes.rows[0].user_id

    // Generate raw token and store its SHA-256 hash (never store raw token)
    const rawToken = crypto.randomBytes(32).toString('hex')
    const tokenHash = crypto.createHash('sha256').update(rawToken).digest('hex')
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000) // 1-hour expiry

    await query(
      `INSERT INTO password_reset_tokens (user_id, token_hash, expires_at)
       VALUES ($1, $2, $3)`,
      [userId, tokenHash, expiresAt]
    )

    return NextResponse.json({
      success: true,
      message: 'If an account exists, a reset link has been sent.',
      ...(process.env.NODE_ENV === 'development' && {
        reset_token: rawToken,
        reset_url: `/reset-password?token=${rawToken}`,
      }),
    })
  } catch {
    return NextResponse.json(
      { success: false, error: 'Failed to process reset request' },
      { status: 500 }
    )
  }
}
