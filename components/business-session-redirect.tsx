'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export function BusinessSessionRedirect() {
    const router = useRouter()

    useEffect(() => {
        fetch('/api/auth/me')
            .then((r) => r.json())
            .then((data) => {
                if (data.authenticated && data.user?.role === 'business') {
                    // eslint-disable-next-line @next/next/no-location-assign-relative-destination
                    window.location.href = '/portal'
                }
            })
            .catch(() => {})
    }, [router])

    return null
}

