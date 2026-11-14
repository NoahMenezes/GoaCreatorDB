'use client'

import { useCallback, useEffect, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Plus, MapPin } from 'lucide-react'
import { CollaborationRequestRow } from '@/lib/db'

const statusLabels: Record<string, string> = {
    pending: 'Pending Creator Response',
    accepted: 'Accepted • Shoot Scheduled',
    rejected: 'Declined / Rejected',
    declined: 'Declined',
    completed: 'Completed',
    cancelled: 'Cancelled',
    expired: 'Expired',
}

export default function CreatorRequestsPage() {
    const [requests, setRequests] = useState<CollaborationRequestRow[]>([])
    const [filter, setFilter] = useState<'all' | 'pending' | 'accepted' | 'rejected' | 'declined' | 'expired'>('all')
    const [loading, setLoading] = useState(true)

    const loadRequests = useCallback(async () => {
        try {
            const res = await fetch(`/api/requests?status=${filter === 'all' ? '' : filter}`, {
                credentials: 'include',
            })
            if (res.ok) {
                const data = await res.json()
                setRequests((data.data || []) as unknown as CollaborationRequestRow[])
            }
        } catch (err) {
            console.error('Requests load error:', err)
        } finally {
            setLoading(false)
        }
    }, [filter])

    useEffect(() => {
        const fetchRequests = async () => {
            try {
                const res = await fetch(`/api/requests?status=${filter === 'all' ? '' : filter}`, {
                    credentials: 'include',
                })
                if (res.ok) {
                    const data = await res.json()
                    setRequests((data.data || []) as unknown as CollaborationRequestRow[])
                }
            } catch (err) {
                console.error('Requests load error:', err)
            } finally {
                setLoading(false)
            }
        }
        fetchRequests()
    }, [filter])

    const handleAction = async (requestId: number | string, action: 'accept' | 'decline' | 'reject') => {
        if (!confirm(`Are you sure you want to ${action} this request?`)) return
        try {
            const apiAction = action === 'decline' ? 'reject' : action
            const res = await fetch(`/api/requests/${requestId}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({ action: apiAction }),
            })
            if (res.ok) {
                loadRequests()
            } else {
                const data = await res.json().catch(() => ({}))
                alert(data.error || `Failed to ${action} request`)
            }
        } catch (err) {
            alert(`Error: ${err}`)
        }
    }

    const tabs = [
        { id: 'all', label: `All Requests (${requests.length})` },
        { id: 'pending', label: `Pending (${requests.filter(r => r.status === 'pending').length})` },
        { id: 'accepted', label: `Accepted (${requests.filter(r => r.status === 'accepted').length})` },
        { id: 'rejected', label: `Rejected (${requests.filter(r => r.status === 'rejected').length})` },
    ] as const

    const filtered = filter === 'all' ? requests : requests.filter(r => r.status === filter)

    return (
        <main className="space-y-8">
            <div className="border border-border bg-card p-6 rounded-sm shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-xl sm:text-2xl font-bold text-foreground tracking-tight">
                        Collaboration Requests
                    </h1>
                    <p className="text-sm text-muted-foreground">
                        Manage incoming collaboration requests from Goan businesses and brands.
                    </p>
                </div>
                <Link
                    href="/business/discover"
                    className="bg-primary hover:bg-primary/90 text-primary-foreground font-medium text-sm px-5 py-3 flex items-center gap-2 transition-colors rounded-sm shadow-sm"
                >
                    <Plus className="size-4" />
                    <span>Browse Creators</span>
                </Link>
            </div>

            <div className="flex flex-wrap gap-2 border-b border-border pb-3">
                {tabs.map((tab) => (
                    <button
                        key={tab.id}
                        type="button"
                        onClick={() => setFilter(tab.id)}
                        className={`px-4 py-2 text-xs font-bold transition-colors cursor-pointer rounded-sm border ${
                            filter === tab.id
                                ? 'bg-primary text-primary-foreground border-primary'
                                : 'bg-background text-muted-foreground border-border hover:text-foreground hover:bg-muted'
                        }`}
                    >
                        {tab.label}
                    </button>
                ))}
            </div>

            <div className="space-y-4">
                {loading ? (
                    <div className="flex items-center justify-center py-12">
                        <div className="size-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                    </div>
                ) : filtered.length === 0 ? (
                    <div className="border border-border bg-muted/30 p-12 rounded-sm text-center">
                        <p className="text-sm text-muted-foreground">No requests found.</p>
                    </div>
                ) : (
                    filtered.map((req) => {
        const r = req as unknown as { business_email: string; request_id: string; title: string; compensation_type: string; compensation_amount: number; status: string; deadline: string | null; collaboration_type: string }
        return (
                        <div
                            key={req.request_id}
                            className="border border-border bg-card p-5 rounded-sm shadow-sm space-y-4 hover:border-primary/50 transition-colors"
                        >
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border pb-3">
                                <div className="flex items-center gap-3">
                                    <div className="size-12 overflow-hidden border border-border shrink-0 relative rounded-md">
                                        <Image
                                            unoptimized
                                            src="https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?q=80&w=200&auto=format&fit=crop"
                                            alt={r.business_email || 'Business'}
                                            width={80}
                                            height={80}
                                            className="size-full object-cover"
                                        />
                                    </div>
                                    <div>
                                        <div className="flex items-center gap-2">
                                            <h3 className="text-sm font-bold text-foreground">
                                                {req.business_email?.split('@')[0] || req.business_name || 'Business'}
                                            </h3>
                                            <span className="text-[10px] text-muted-foreground font-mono">
                                                #{req.request_id}
                                            </span>
                                        </div>
                                        <div className="text-xs text-muted-foreground">
                                            {req.deliverables || req.title || 'Collaboration Details'}
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-center gap-3">
                                    <span className={`text-[10px] font-bold px-2.5 py-1 uppercase tracking-wider rounded-sm border ${
                                        req.status === 'accepted'
                                            ? 'border-primary/20 text-primary bg-primary/5'
                                            : req.status === 'pending'
                                            ? 'border-border text-muted-foreground bg-background'
                                            : 'border-primary/20 text-primary bg-primary/5'
                                    }`}>
                                        {statusLabels[req.status] || req.status}
                                    </span>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <h4 className="text-sm font-bold text-foreground">
                                    {req.deliverables || req.offer_details || req.objective || 'Collaboration Brief'}
                                </h4>
                                <div className="flex flex-wrap gap-2 text-xs">
                                    <span className="border border-border bg-muted px-2.5 py-1 rounded-sm text-muted-foreground font-medium">
                                        Offered: ₹{req.offered_amount ?? req.compensation_amount ?? 0}
                                    </span>
                                    <span className="border border-border bg-muted px-2.5 py-1 rounded-sm text-muted-foreground font-medium">
                                        Type: {(req.collab_type || req.compensation_type || 'paid').toUpperCase()}
                                    </span>
                                    <span className="border border-border bg-muted px-2.5 py-1 rounded-sm text-muted-foreground font-medium">
                                        Status: {req.status.toUpperCase()}
                                    </span>
                                </div>
                                {req.deadline && (
                                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                        <MapPin className="size-3.5" />
                                        <span>Deadline: {req.deadline}</span>
                                    </div>
                                )}
                            </div>

                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-3 border-t border-border">
                                {req.status === 'pending' ? (
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => handleAction(req.request_id, 'accept')}
                                            className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground font-medium text-xs px-4 py-2 transition-colors cursor-pointer rounded-sm"
                                        >
                                            Accept Request
                                        </button>
                                        <button
                                            onClick={() => handleAction(req.request_id, 'decline')}
                                            className="flex-1 border border-border bg-background hover:bg-muted text-foreground font-medium text-xs px-4 py-2 transition-colors cursor-pointer rounded-sm"
                                        >
                                            Decline
                                        </button>
                                    </div>
                                ) : (
                                    <Link
                                        href="/creator/collaborations"
                                        className="flex-1 border border-border bg-background hover:bg-muted font-medium text-xs px-4 py-2 transition-colors text-foreground rounded-sm text-center"
                                    >
                                        View Collaboration
                                    </Link>
                                )}
                                <Link
                                    href="/creator/requests"
                                    className="text-xs text-muted-foreground hover:text-primary underline decoration-primary/30"
                                >
                                    View Full Brief &rarr;
                                </Link>
                            </div>
                        </div>
)}
                ))}
            </div>
        </main>
    )
}
