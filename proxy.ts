import { NextRequest, NextResponse } from 'next/server'
import { query } from './lib/db'

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl
  const token = request.cookies.get('goa_session')?.value

  // 1. Role-based route protection for /creator/*, /business/*, and /admin/*
  if (
    pathname.startsWith('/creator') ||
    pathname.startsWith('/business') ||
    pathname.startsWith('/admin')
  ) {
    if (!token) {
      return NextResponse.redirect(
        new URL(`/login?redirect=${encodeURIComponent(pathname)}`, request.url)
      )
    }

    try {
      const res = await query<{ role: string }>(
        `SELECT u.role
         FROM sessions s
         JOIN users u ON s.user_id = u.user_id
         WHERE s.token = $1 AND s.expires_at > now()`,
        [token]
      )
      const user = res.rows[0]
      if (!user) {
        return NextResponse.redirect(
          new URL(`/login?redirect=${encodeURIComponent(pathname)}`, request.url)
        )
      }

      if (pathname.startsWith('/creator') && user.role !== 'creator') {
        return new NextResponse(
          JSON.stringify({ success: false, error: 'Forbidden: Creator access required' }),
          {
            status: 403,
            headers: { 'Content-Type': 'application/json' },
          }
        )
      }

      if (pathname.startsWith('/business') && user.role !== 'business') {
        return new NextResponse(
          JSON.stringify({ success: false, error: 'Forbidden: Business access required' }),
          {
            status: 403,
            headers: { 'Content-Type': 'application/json' },
          }
        )
      }

      if (pathname.startsWith('/admin') && user.role !== 'admin') {
        return new NextResponse(
          JSON.stringify({ success: false, error: 'Forbidden: Admin access required' }),
          {
            status: 403,
            headers: { 'Content-Type': 'application/json' },
          }
        )
      }
    } catch {
      return NextResponse.redirect(
        new URL(`/login?redirect=${encodeURIComponent(pathname)}`, request.url)
      )
    }
  }

  // 2. Redirect logged-in users away from /login based on their role
  if (pathname === '/login' && token) {
    try {
      const res = await query<{ role: string }>(
        `SELECT u.role
         FROM sessions s
         JOIN users u ON s.user_id = u.user_id
         WHERE s.token = $1 AND s.expires_at > now()`,
        [token]
      )
      const user = res.rows[0]
      if (user) {
        if (user.role === 'admin') {
          return NextResponse.redirect(new URL('/admin', request.url))
        }
        if (user.role === 'business') {
          return NextResponse.redirect(new URL('/business/dashboard', request.url))
        }
        if (user.role === 'creator') {
          return NextResponse.redirect(new URL('/creator/dashboard', request.url))
        }
      }
    } catch {
      // Allow proceeding to /login if lookup failed
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/creator/:path*', '/business/:path*', '/admin/:path*', '/login'],
}
