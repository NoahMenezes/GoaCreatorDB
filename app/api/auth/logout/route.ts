import { NextResponse } from 'next/server'
import { logoutUser } from '@/lib/auth'

export async function POST() {
    await logoutUser()
    const response = NextResponse.json({ success: true, message: 'Logged out' })
    response.cookies.delete('goa_session')
    return response
}
