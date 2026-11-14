export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server'
import { initDb, closeDb, type SqlDatabase } from '@/lib/db'
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
  const body = await request.json()
  const { email } = body

  if (!email) {
    return NextResponse.json(
      { success: false, error: 'Email is required' },
      { status: 400 }
    )
  }

  const db = await initDb()
  try {
    const user = db
      .query('SELECT * FROM users WHERE email = ?')
      .get(email.trim().toLowerCase()) as any | null

    // Always return success to prevent email enumeration
    if (!user) {
      saveAndClose(db)
      return NextResponse.json({
        success: true,
        message: 'If an account exists, a reset link has been sent.',
      })
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString('hex')
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000).toISOString() // 1 hour

    db.query(
      `INSERT INTO sessions (token, user_id, created_at, expires_at)
       VALUES (?, ?, ?, ?)`
    ).run(`reset-${resetToken}`, user.user_id, new Date().toISOString(), expiresAt)

    saveAndClose(db)

    // In production, send an email with the reset link
    // For development, the token is returned in the response
    return NextResponse.json({
      success: true,
      message: 'If an account exists, a reset link has been sent.',
      ...(process.env.NODE_ENV === 'development' && {
        reset_token: resetToken,
        reset_url: `/auth/reset-password?token=${resetToken}`,
      }),
    })
  } catch {
    saveAndClose(db)
    return NextResponse.json(
      { success: false, error: 'Failed to process reset request' },
      { status: 500 }
    )
  }
}
