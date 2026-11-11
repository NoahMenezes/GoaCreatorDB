import { NextResponse } from 'next/server'
import { loginUser } from '@/lib/auth'

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

        const { user, profile, token } = await loginUser(email, password)

        const response = NextResponse.json({
            success: true,
            user,
            profile,
            message: 'Signed in successfully!',
        })

        response.cookies.set('goa_session', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            path: '/',
            maxAge: 60 * 60 * 24 * 7,
        })

        return response
    } catch (err: unknown) {
        const message = err instanceof Error ? err.message : 'Invalid credentials'
        return NextResponse.json(
            { success: false, error: message },
            { status: 401 }
        )
    }
}

