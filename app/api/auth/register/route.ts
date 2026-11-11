import { NextResponse } from 'next/server'
import { registerUser } from '@/lib/auth'

export async function POST(request: Request) {
    try {
        const body = await request.json()
        const { email, password, role, businessData, creatorData } = body

        if (!email || !password || !role) {
            return NextResponse.json(
                { success: false, error: 'Email, password, and role are required.' },
                { status: 400 }
            )
        }

        if (password.length < 6) {
            return NextResponse.json(
                { success: false, error: 'Password must be at least 6 characters.' },
                { status: 400 }
            )
        }

        const { user, token } = await registerUser({
            email,
            password,
            role,
            businessData,
            creatorData,
        })

        const response = NextResponse.json({
            success: true,
            user,
            message: 'Registration successful!',
        })

        // Set session cookie
        response.cookies.set('goa_session', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            path: '/',
            maxAge: 60 * 60 * 24 * 7, // 7 days
        })

        return response
    } catch (err: unknown) {
        const message = err instanceof Error ? err.message : 'Registration failed'
        return NextResponse.json(
            { success: false, error: message },
            { status: 400 }
        )
    }
}

