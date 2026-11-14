export const dynamic = 'force-dynamic'
import { NextResponse } from 'next/server'
import { loginUser, AuthError } from '@/lib/auth'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { email, password } = body

    if (!email || !password) {
      return NextResponse.json(
        { success: false, error: 'Email and password are required.' },
        { status: 400 }
      )
    }

    const clientIp =
      request.headers.get('x-forwarded-for')?.split(',')[0].trim() ||
      request.headers.get('x-real-ip') ||
      '127.0.0.1'

    const { user, profile, token } = await loginUser(email, password, clientIp)

    const response = NextResponse.json({
      success: true,
      user,
      profile,
      message: 'Signed in successfully!',
    })

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
    return NextResponse.json(
      { success: false, error: 'Invalid credentials' },
      { status: 401 }
    )
  }
}
