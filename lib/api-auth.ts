import { getSessionUser } from '@/lib/auth'
import { saveAndClose } from '@/lib/api-helpers'

export async function requireAuth(): Promise<{ user: Record<string, unknown>; role: string } | Response> {
  const session = await getSessionUser()
  if (!session) {
    return new Response(
      JSON.stringify({ success: false, error: 'Authentication required' }),
      { status: 401, headers: { 'Content-Type': 'application/json' } }
    )
  }
  return { user: session.user, role: session.user.role }
}

export { saveAndClose }
