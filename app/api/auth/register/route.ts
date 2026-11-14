export const dynamic = 'force-dynamic'
import { NextResponse } from 'next/server'
import { registerUser, AuthError } from '@/lib/auth'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { email, password, role, location_id, businessData, creatorData } = body

    if (!email || !password || !role) {
      return NextResponse.json(
        { success: false, error: 'Email, password, and role are required.' },
        { status: 400 }
      )
    }

    if (role === 'admin') {
      return NextResponse.json(
        { success: false, error: 'Admin accounts cannot be registered.' },
        { status: 403 }
      )
    }

    if (password.length < 6) {
      return NextResponse.json(
        { success: false, error: 'Password must be at least 6 characters.' },
        { status: 400 }
      )
    }

    const { user, profile, token } = await registerUser({
      email,
      password,
      role,
      location_id,
      businessData,
      creatorData,
    })

    const response = NextResponse.json(
      {
        success: true,
        user,
        profile,
        message: 'Registration successful!',
      },
      { status: 201 }
    )

    // Set session cookie (httpOnly, SameSite=lax, 7-day expiry)
    response.cookies.set('goa_session', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 7,
    })

    return response
  } catch (err: unknown) {
    if (err instanceof AuthError) {
      return NextResponse.json(
        { success: false, error: err.message },
        { status: err.status }
      )
    }
    const message = err instanceof Error ? err.message : 'Registration failed'
    return NextResponse.json(
      { success: false, error: message },
      { status: 400 }
    )
  }
}
