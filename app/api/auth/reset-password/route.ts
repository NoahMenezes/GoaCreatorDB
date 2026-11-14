export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server'
import { initDb } from '@/lib/db'
import { saveAndClose } from '@/lib/api-auth'
import { hashPassword } from '@/lib/auth'


export async function POST(request: Request) {
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

  const db = await initDb()
  try {
    const session = db
      .query(
        'SELECT * FROM sessions WHERE token = ? AND expires_at > ?'
      )
      .get(`reset-${token}`, new Date().toISOString()) as unknown as { [key: string]: unknown } | null

    if (!session) {
      saveAndClose(db)
      return NextResponse.json(
        { success: false, error: 'Invalid or expired reset token' },
        { status: 400 }
      )
    }

    const passwordHash = await hashPassword(password)

    db.query(
      'UPDATE users SET password_hash = ?, updated_at = ? WHERE user_id = ?'
    ).run(passwordHash, new Date().toISOString(), session.user_id)

    // Delete the reset session
    db.query('DELETE FROM sessions WHERE token = ?').run(`reset-${token}`)

    saveAndClose(db)
    return NextResponse.json({
      success: true,
      message: 'Password has been reset successfully.',
    })
  } catch {
    saveAndClose(db)
    return NextResponse.json(
      { success: false, error: 'Failed to reset password' },
      { status: 500 }
    )
  }
}
