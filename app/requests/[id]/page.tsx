'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { RequestDetailView } from '@/components/requests/request-detail-view'
import { Loader2 } from 'lucide-react'

export default function SharedRequestDetailPage() {
    const params = useParams()
    const router = useRouter()
    const requestId = params?.id as string
    const [checking, setChecking] = useState(true)

    useEffect(() => {
        fetch('/api/auth/me')
            .then((r) => r.json())
            .then((data) => {
                if (data.authenticated) {
                    if (data.user?.role === 'creator') {
                        router.replace(`/creator/requests/${requestId}`)
                    } else if (data.user?.role === 'business') {
                        router.replace(`/business/requests/${requestId}`)
                    } else {
                        // Admin or standalone
                        setChecking(false)
                    }
                } else {
                    router.replace(`/login?redirect=/requests/${requestId}`)
                }
            })
            .catch(() => setChecking(false))
    }, [requestId, router])

    if (checking) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-background text-foreground">
                <Loader2 className="size-6 text-primary animate-spin" />
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-background text-foreground p-6 sm:p-10 max-w-5xl mx-auto">
            <RequestDetailView requestId={requestId} backHref="/admin" />
        </div>
    )
}

