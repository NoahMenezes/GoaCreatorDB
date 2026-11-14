import { getSession, AuthError, type SanitizedUser } from '@/lib/auth'
import { saveAndClose } from '@/lib/api-helpers'

export interface AuthContext {
  user: SanitizedUser
  role: 'admin' | 'business' | 'creator'
  creatorId?: number
  businessId?: number
}

export async function requireAuth(reqOrToken?: Request | string): Promise<AuthContext | Response> {
  try {
    let token: string | undefined
    if (typeof reqOrToken === 'string') {
      token = reqOrToken
    } else if (reqOrToken instanceof Request) {
      const authHeader = reqOrToken.headers.get('Authorization')
      if (authHeader && authHeader.startsWith('Bearer ')) {
        token = authHeader.substring(7).trim()
      } else {
        const cookieHeader = reqOrToken.headers.get('Cookie') || reqOrToken.headers.get('cookie')
        if (cookieHeader) {
          const match = cookieHeader.match(/goa_session=([^;]+)/)
          if (match) token = match[1]
        }
      }
    }

    const sessionData = await getSession(token)
    if (!sessionData) {
      return new Response(
        JSON.stringify({ success: false, error: 'Authentication required' }),
        { status: 401, headers: { 'Content-Type': 'application/json' } }
      )
    }

    return {
      user: sessionData.user,
      role: sessionData.user.role,
      creatorId: sessionData.creatorId,
      businessId: sessionData.businessId,
    }
  } catch (err) {
    const status = err instanceof AuthError ? err.status : 401
    const message = err instanceof Error ? err.message : 'Authentication required'
    return new Response(
      JSON.stringify({ success: false, error: message }),
      { status, headers: { 'Content-Type': 'application/json' } }
    )
  }
}

export { saveAndClose }
