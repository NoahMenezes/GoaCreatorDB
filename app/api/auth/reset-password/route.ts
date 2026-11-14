export const dynamic = 'force-dynamic'
import { NextResponse } from 'next/server'
import { query, withTransaction } from '@/lib/db'
import { hashPassword } from '@/lib/auth'
import crypto from 'crypto'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { token, password } = body

    if (!token || !password) {
      return NextResponse.json(
        { success: false, error: 'Token and password are required' },
        { status: 400 }
      )
    }

    if (password.length < 6) {
      return NextResponse.json(
        { success: false, error: 'Password must be at least 6 characters' },
        { status: 400 }
      )
    }

    const tokenHash = crypto.createHash('sha256').update(token).digest('hex')

    const tokenRes = await query(
      `SELECT token_id, user_id
       FROM password_reset_tokens
       WHERE token_hash = $1 AND expires_at > now() AND used_at IS NULL`,
      [tokenHash]
    )

    if (tokenRes.rows.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Invalid or expired reset token' },
        { status: 400 }
      )
    }

    const { token_id, user_id } = tokenRes.rows[0]
    const passwordHash = await hashPassword(password)

    await withTransaction(async (client) => {
      await client.query(
        'UPDATE users SET password_hash = $1 WHERE user_id = $2',
        [passwordHash, user_id]
      )
      await client.query(
        'UPDATE password_reset_tokens SET used_at = now() WHERE token_id = $1',
        [token_id]
      )
    })

    return NextResponse.json({
      success: true,
      message: 'Password has been reset successfully.',
    })
  } catch {
    return NextResponse.json(
      { success: false, error: 'Failed to reset password' },
      { status: 500 }
    )
  }
}
