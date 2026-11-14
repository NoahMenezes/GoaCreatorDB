export const dynamic = 'force-dynamic'
import { NextResponse } from 'next/server'
import { logoutUser } from '@/lib/auth'

export async function POST(request: Request) {
  // Support token from cookie or authorization header
  const authHeader = request.headers.get('authorization')
  const bearerToken = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : undefined

  await logoutUser(bearerToken)
  const response = NextResponse.json({ success: true, message: 'Logged out successfully' })
  response.cookies.delete('goa_session')
  return response
}
