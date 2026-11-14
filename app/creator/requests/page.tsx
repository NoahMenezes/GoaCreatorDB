'use client'

import { useCallback, useEffect, useState } from 'react'
import Link from 'next/link'
import { Plus, MapPin, Loader2, AlertCircle, RefreshCw, ShieldCheck, MessageSquare } from 'lucide-react'

interface CollaborationRequest {
    request_id: number
    business_id: number
    creator_id: number
    collab_type: 'paid' | 'barter' | 'hybrid'
    offered_amount: number
    offer_details: string
    deliverables: string | null
    message: string | null
    status: 'pending' | 'accepted' | 'rejected' | 'completed' | 'cancelled'
    requested_at: string
    responded_at: string | null
    deadline: string
    business_name: string
    business_industry?: string
    creator_name: string
}

export default function CreatorRequestsPage() {
    const [requests, setRequests] = useState<CollaborationRequest[]>([])
    const [filter, setFilter] = useState<'all' | 'pending' | 'accepted' | 'rejected'>('all')
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [actionLoadingId, setActionLoadingId] = useState<number | null>(null)
    const [selectedBrief, setSelectedBrief] = useState<CollaborationRequest | null>(null)

    const loadRequests = useCallback(async () => {
        setLoading(true)
        setError(null)
        try {
            const res = await fetch(`/api/requests?status=${filter === 'all' ? '' : filter}&limit=100`, {
                credentials: 'include',
            })
            const data = await res.json()
            if (!res.ok || !data.success) {
                throw new Error(data.error || 'Failed to load requests')
            }
            setRequests(data.data || [])
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Requests load error')
        } finally {
            setLoading(false)
        }
    }, [filter])

    useEffect(() => {
        loadRequests()
    }, [loadRequests])

    const handleAction = async (requestId: number, action: 'accept' | 'reject') => {
        const actionLabel = action === 'reject' ? 'decline' : 'accept'
        if (!confirm(`Are you sure you want to ${actionLabel} this request?`)) return

        setActionLoadingId(requestId)
        try {
            const res = await fetch(`/api/requests/${requestId}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({ action }),
            })
            const data = await res.json()
            if (res.ok && data.success) {
                await loadRequests()
            } else {
                alert(data.error || `Failed to ${actionLabel} request`)
            }
        } catch (err) {
            alert(`Error: ${err instanceof Error ? err.message : String(err)}`)
        } finally {
            setActionLoadingId(null)
        }
    }

    const getInitials = (name: string) => {
        return name
            .split(' ')
            .map((n) => n[0])
            .slice(0, 2)
            .join('')
            .toUpperCase()
    }

    const getStatusLabel = (status: CollaborationRequest['status']) => {
        switch (status) {
            case 'pending':
                return 'Pending Creator Response'
            case 'accepted':
                return 'Accepted • In Progress'
            case 'rejected':
                return 'Declined'
            case 'completed':
                return 'Completed'
            case 'cancelled':
                return 'Cancelled'
            default:
                return status
        }
    }

    const counts = {
        all: requests.length,
        pending: requests.filter((r) => r.status === 'pending').length,
        accepted: requests.filter((r) => r.status === 'accepted').length,
        rejected: requests.filter((r) => r.status === 'rejected').length,
    }

    const tabs = [
        { id: 'all', label: `All Requests (${counts.all})` },
        { id: 'pending', label: `Pending (${counts.pending})` },
        { id: 'accepted', label: `Accepted (${counts.accepted})` },
        { id: 'rejected', label: `Declined (${counts.rejected})` },
    ] as const

    const filtered = filter === 'all' ? requests : requests.filter((r) => r.status === filter)

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
                    href="/creator/collaborations"
                    className="bg-primary hover:bg-primary/90 text-primary-foreground font-medium text-sm px-5 py-3 flex items-center gap-2 transition-colors rounded-sm shadow-sm"
                >
                    <Plus className="size-4" />
                    <span>View Collaborations</span>
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
                    <div className="border border-border bg-card p-12 text-center rounded-sm shadow-sm flex flex-col items-center justify-center space-y-3">
                        <Loader2 className="size-8 text-primary animate-spin" />
                        <p className="text-sm text-muted-foreground">Loading collaboration requests...</p>
                    </div>
                ) : error ? (
                    <div className="border border-destructive/20 bg-destructive/5 p-6 rounded-sm text-center space-y-3">
                        <AlertCircle className="size-8 text-destructive mx-auto" />
                        <p className="text-sm font-semibold text-destructive">{error}</p>
                        <button
                            type="button"
                            onClick={loadRequests}
                            className="inline-flex items-center gap-2 bg-background border border-border px-4 py-2 text-xs font-bold hover:bg-muted rounded-sm transition-colors cursor-pointer"
                        >
                            <RefreshCw className="size-3.5" />
                            <span>Try Again</span>
                        </button>
                    </div>
                ) : filtered.length === 0 ? (
                    <div className="border border-border bg-muted/30 p-12 rounded-sm text-center space-y-3">
                        <ShieldCheck className="size-10 text-muted-foreground mx-auto stroke-1" />
                        <h3 className="text-base font-bold text-foreground">No requests found</h3>
                        <p className="text-sm text-muted-foreground max-w-sm mx-auto">
                            {filter === 'all'
                                ? 'No incoming collaboration requests received yet.'
                                : `No requests with status "${filter === 'rejected' ? 'Declined' : filter}".`}
                        </p>
                    </div>
                ) : (
                    filtered.map((req) => (
                        <div
                            key={req.request_id}
                            className="border border-border bg-card p-5 rounded-sm shadow-sm space-y-4 hover:border-primary/50 transition-colors"
                        >
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border pb-3">
                                <div className="flex items-center gap-3">
                                    <div className="size-12 overflow-hidden border border-border shrink-0 rounded-md bg-muted flex items-center justify-center font-bold text-sm text-muted-foreground">
                                        {getInitials(req.business_name)}
                                    </div>
                                    <div>
                                        <div className="flex items-center gap-2">
                                            <Link
                                                href={`/creator/requests/${req.request_id}`}
                                                className="text-sm font-bold text-foreground hover:text-primary hover:underline transition-colors"
                                            >
                                                {req.business_name}
                                            </Link>
                                            <span className="text-[10px] text-muted-foreground font-mono">
                                                #REQ-{req.request_id}
                                            </span>
                                        </div>
                                        <div className="text-xs text-muted-foreground">
                                            {req.deliverables || req.offer_details || 'Collaboration Proposal'}
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-center gap-3">
                                    <span
                                        className={`text-[10px] font-bold px-2.5 py-1 uppercase tracking-wider rounded-sm border ${
                                            req.status === 'accepted'
                                                ? 'border-primary/20 text-primary bg-primary/5'
                                                : req.status === 'pending'
                                                ? 'border-border text-muted-foreground bg-background'
                                                : req.status === 'completed'
                                                ? 'border-emerald-500/20 text-emerald-600 dark:text-emerald-400 bg-emerald-500/5'
                                                : 'border-muted text-muted-foreground bg-muted/20'
                                        }`}
                                    >
                                        {getStatusLabel(req.status)}
                                    </span>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <h4 className="text-sm font-bold text-foreground">
                                    {req.offer_details || req.deliverables || 'Collaboration Brief'}
                                </h4>
                                {req.message && (
                                    <p className="text-xs text-muted-foreground italic border-l-2 border-primary/30 pl-2">
                                        &ldquo;{req.message}&rdquo;
                                    </p>
                                )}
                                <div className="flex flex-wrap gap-2 text-xs">
                                    <span className="border border-border bg-muted px-2.5 py-1 rounded-sm text-muted-foreground font-medium">
                                        Offered: {req.collab_type === 'barter' ? 'Barter' : `₹${Number(req.offered_amount || 0).toLocaleString()}`}
                                    </span>
                                    <span className="border border-border bg-muted px-2.5 py-1 rounded-sm text-muted-foreground font-medium">
                                        Type: {req.collab_type.toUpperCase()}
                                    </span>
                                    <span className="border border-border bg-muted px-2.5 py-1 rounded-sm text-muted-foreground font-medium">
                                        Status: {req.status === 'rejected' ? 'DECLINED' : req.status.toUpperCase()}
                                    </span>
                                </div>
                                {req.deadline && (
                                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                        <MapPin className="size-3.5" />
                                        <span>Deadline: {new Date(req.deadline).toLocaleDateString()}</span>
                                    </div>
                                )}
                            </div>

                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-3 border-t border-border">
                                {req.status === 'pending' ? (
                                    <div className="flex gap-2">
                                        <button
                                            type="button"
                                            disabled={actionLoadingId === req.request_id}
                                            onClick={() => handleAction(req.request_id, 'accept')}
                                            className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground font-medium text-xs px-4 py-2 transition-colors cursor-pointer rounded-sm disabled:opacity-50"
                                        >
                                            {actionLoadingId === req.request_id ? 'Accepting...' : 'Accept Request'}
                                        </button>
                                        <button
                                            type="button"
                                            disabled={actionLoadingId === req.request_id}
                                            onClick={() => handleAction(req.request_id, 'reject')}
                                            className="flex-1 border border-border bg-background hover:bg-muted text-foreground font-medium text-xs px-4 py-2 transition-colors cursor-pointer rounded-sm disabled:opacity-50"
                                        >
                                            {actionLoadingId === req.request_id ? 'Declining...' : 'Decline'}
                                        </button>
                                    </div>
                                ) : (
                                    <Link
                                        href={`/creator/requests/${req.request_id}`}
                                        className="flex-1 border border-border bg-background hover:bg-muted font-medium text-xs px-4 py-2 transition-colors text-foreground rounded-sm text-center"
                                    >
                                        View Details
                                    </Link>
                                )}
                                <Link
                                    href={`/creator/requests/${req.request_id}`}
                                    className="text-xs text-muted-foreground hover:text-primary underline decoration-primary/30 cursor-pointer"
                                >
                                    View Full Details &rarr;
                                </Link>
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* Brief details dialog */}
            {selectedBrief && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
                    <div className="bg-card border border-border p-6 rounded-sm shadow-xl max-w-lg w-full space-y-4">
                        <div className="flex items-center justify-between border-b border-border pb-3">
                            <h3 className="font-bold text-foreground flex items-center gap-2">
                                <MessageSquare className="size-4 text-primary" />
                                <span>Campaign Brief: REQ-{selectedBrief.request_id}</span>
                            </h3>
                            <button
                                type="button"
                                onClick={() => setSelectedBrief(null)}
                                className="text-muted-foreground hover:text-foreground text-sm font-bold"
                            >
                                ✕
                            </button>
                        </div>

                        <div className="space-y-3 text-sm">
                            <div>
                                <span className="text-muted-foreground text-[10px] uppercase font-bold block">Business</span>
                                <span className="font-semibold text-foreground text-base">{selectedBrief.business_name}</span>
                                {selectedBrief.business_industry && (
                                    <span className="text-xs text-muted-foreground block">{selectedBrief.business_industry}</span>
                                )}
                            </div>

                            <div>
                                <span className="text-muted-foreground text-[10px] uppercase font-bold block">Offer Details</span>
                                <p className="text-xs text-foreground font-medium">{selectedBrief.offer_details || 'Standard Campaign'}</p>
                            </div>

                            {selectedBrief.deliverables && (
                                <div>
                                    <span className="text-muted-foreground text-[10px] uppercase font-bold block">Deliverables</span>
                                    <p className="text-xs text-foreground bg-muted/40 p-2.5 rounded-sm border border-border">
                                        {selectedBrief.deliverables}
                                    </p>
                                </div>
                            )}

                            {selectedBrief.message && (
                                <div>
                                    <span className="text-muted-foreground text-[10px] uppercase font-bold block">Message</span>
                                    <p className="text-xs text-muted-foreground italic border-l-2 border-primary/40 pl-2">
                                        &ldquo;{selectedBrief.message}&rdquo;
                                    </p>
                                </div>
                            )}

                            <div className="grid grid-cols-2 gap-3 pt-2 text-xs">
                                <div>
                                    <span className="text-muted-foreground text-[10px] uppercase font-bold block">Status</span>
                                    <span className="font-bold text-foreground capitalize">
                                        {getStatusLabel(selectedBrief.status)}
                                    </span>
                                </div>
                                <div>
                                    <span className="text-muted-foreground text-[10px] uppercase font-bold block">Offered Amount</span>
                                    <span className="font-bold text-primary">
                                        {selectedBrief.collab_type === 'barter'
                                            ? 'Barter Experience'
                                            : `₹${Number(selectedBrief.offered_amount || 0).toLocaleString()}`}
                                    </span>
                                </div>
                                <div>
                                    <span className="text-muted-foreground text-[10px] uppercase font-bold block">Requested Date</span>
                                    <span className="font-semibold text-foreground">
                                        {new Date(selectedBrief.requested_at).toLocaleDateString()}
                                    </span>
                                </div>
                                <div>
                                    <span className="text-muted-foreground text-[10px] uppercase font-bold block">Deadline</span>
                                    <span className="font-semibold text-foreground">
                                        {new Date(selectedBrief.deadline).toLocaleDateString()}
                                    </span>
                                </div>
                            </div>
                        </div>

                        <div className="pt-3 border-t border-border flex justify-end">
                            <button
                                type="button"
                                onClick={() => setSelectedBrief(null)}
                                className="bg-primary text-primary-foreground font-medium text-xs px-4 py-2 rounded-sm cursor-pointer"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </main>
    )
}
