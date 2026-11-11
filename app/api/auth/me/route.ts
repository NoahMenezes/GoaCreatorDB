import { NextResponse } from 'next/server'
import { getSessionUser } from '@/lib/auth'

export async function GET() {
    try {
        const session = await getSessionUser()
        if (!session) {
            return NextResponse.json({ authenticated: false, user: null })
        }
        return NextResponse.json({ authenticated: true, user: session.user, profile: session.profile })
    } catch {
        return NextResponse.json({ authenticated: false, user: null })
    }
}
