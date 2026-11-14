export const dynamic = 'force-dynamic'
import { NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'

export async function GET(request: Request) {
  try {
    const authHeader = request.headers.get('authorization')
    const bearerToken = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : undefined

    const sessionData = await getSession(bearerToken)
    if (!sessionData) {
      return NextResponse.json({ authenticated: false, user: null, profile: null })
    }

    return NextResponse.json({
      authenticated: true,
      user: sessionData.user,
      profile: sessionData.profile,
      role: sessionData.user.role,
      creator_id: sessionData.creatorId,
      business_id: sessionData.businessId,
    })
  } catch {
    return NextResponse.json({ authenticated: false, user: null, profile: null })
  }
}
