'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Plus, ShieldCheck, Loader2, AlertCircle, RefreshCw, Mail, MessageSquare } from 'lucide-react'

interface RequestItem {
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
    creator_name: string
    creator_handle: string | null
    contact_phone?: string | null
}

export default function BusinessRequestsPage() {
    const [requests, setRequests] = useState<RequestItem[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'accepted' | 'completed' | 'rejected'>('all')
    const [actionLoadingId, setActionLoadingId] = useState<number | null>(null)
    const [contactModalItem, setContactModalItem] = useState<RequestItem | null>(null)

    const fetchRequests = async () => {
        setLoading(true)
        setError(null)
        try {
            const res = await fetch('/api/requests?limit=100')
            const data = await res.json()
            if (!res.ok || !data.success) {
                throw new Error(data.error || 'Failed to load requests')
            }
            setRequests(data.data || [])
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to fetch collaboration requests')
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchRequests()
    }, [])

    const handleComplete = async (requestId: number) => {
        if (!confirm('Are you sure you want to mark this collaboration as completed?')) return
        setActionLoadingId(requestId)
        try {
            const res = await fetch(`/api/requests/${requestId}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ action: 'complete' }),
            })
            const data = await res.json()
            if (!res.ok || !data.success) {
                alert(data.error || 'Failed to complete collaboration')
            } else {
                await fetchRequests()
            }
        } catch (err) {
            alert(err instanceof Error ? err.message : 'Error updating collaboration')
        } finally {
            setActionLoadingId(null)
        }
    }

    const handleCancel = async (requestId: number) => {
        if (!confirm('Are you sure you want to cancel/withdraw this request?')) return
        setActionLoadingId(requestId)
        try {
            const res = await fetch(`/api/requests/${requestId}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ action: 'cancel' }),
            })
            const data = await res.json()
            if (!res.ok || !data.success) {
                alert(data.error || 'Failed to cancel request')
            } else {
                await fetchRequests()
            }
        } catch (err) {
            alert(err instanceof Error ? err.message : 'Error cancelling request')
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

    const getStatusLabel = (status: RequestItem['status']) => {
        switch (status) {
            case 'pending':
                return 'Pending Creator Response'
            case 'accepted':
                return 'Accepted • In Progress'
            case 'completed':
                return 'Completed Deal'
            case 'rejected':
                return 'Declined'
            case 'cancelled':
                return 'Cancelled'
            default:
                return status
        }
    }

    const formatOfferedAmount = (req: RequestItem) => {
        if (req.collab_type === 'barter') {
            return 'Barter Experience'
        }
        const amt = `₹${Number(req.offered_amount || 0).toLocaleString()}`
        return req.collab_type === 'hybrid' ? `${amt} + Barter` : amt
    }

    const parseDeliverables = (raw: string | null) => {
        if (!raw) return ['Content Deliverables']
        return raw
            .split(/[\n,]+/)
            .map((s) => s.trim())
            .filter(Boolean)
    }

    const counts = {
        all: requests.length,
        pending: requests.filter((r) => r.status === 'pending').length,
        accepted: requests.filter((r) => r.status === 'accepted').length,
        completed: requests.filter((r) => r.status === 'completed').length,
        rejected: requests.filter((r) => r.status === 'rejected').length,
    }

    const filteredRequests = requests.filter((r) => {
        if (statusFilter === 'all') return true
        return r.status === statusFilter
    })

    return (
        <main className="space-y-8">
            <div className="border border-border bg-card p-6 rounded-sm shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-xl sm:text-2xl font-bold text-foreground tracking-tight">
                        Collaboration Requests &amp; Deals
                    </h1>
                    <p className="text-sm text-muted-foreground">
                        Track campaign briefs, dates, status, deliverables, and collaboration milestones
                    </p>
                </div>

                <Link
                    href="/business/discover"
                    className="bg-primary hover:bg-primary/90 text-primary-foreground font-medium text-sm px-5 py-3 flex items-center gap-2 transition-colors rounded-sm shadow-sm self-start md:self-auto"
                >
                    <Plus className="size-4" />
                    <span>New Booking Request</span>
                </Link>
            </div>

            <div className="flex flex-wrap gap-2 border-b border-border pb-3">
                {[
                    { id: 'all', label: `All Requests (${counts.all})` },
                    { id: 'pending', label: `Pending Response (${counts.pending})` },
                    { id: 'accepted', label: `Active & Accepted (${counts.accepted})` },
                    { id: 'completed', label: `Completed Deals (${counts.completed})` },
                    ...(counts.rejected > 0 ? [{ id: 'rejected', label: `Declined (${counts.rejected})` }] : []),
                ].map((tab) => (
                    <button
                        key={tab.id}
                        type="button"
                        onClick={() => setStatusFilter(tab.id as typeof statusFilter)}
                        className={`px-4 py-2 text-xs font-bold transition-colors cursor-pointer rounded-sm border ${
                            statusFilter === tab.id
                                ? 'bg-primary text-primary-foreground border-primary'
                                : 'bg-background text-muted-foreground border-border hover:text-foreground hover:bg-muted'
                        }`}
                    >
                        {tab.label}
                    </button>
                ))}
            </div>

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
                        onClick={fetchRequests}
                        className="inline-flex items-center gap-2 bg-background border border-border px-4 py-2 text-xs font-bold hover:bg-muted rounded-sm transition-colors cursor-pointer"
                    >
                        <RefreshCw className="size-3.5" />
                        <span>Try Again</span>
                    </button>
                </div>
            ) : filteredRequests.length === 0 ? (
                <div className="border border-border bg-card p-12 text-center rounded-sm shadow-sm space-y-3">
                    <ShieldCheck className="size-10 text-muted-foreground mx-auto stroke-1" />
                    <h3 className="text-base font-bold text-foreground">No collaboration requests found</h3>
                    <p className="text-xs text-muted-foreground max-w-sm mx-auto">
                        {statusFilter === 'all'
                            ? "You haven't sent any collaboration requests yet. Discover Goan creators to start collaborating."
                            : `No requests with status "${statusFilter === 'rejected' ? 'Declined' : statusFilter}".`}
                    </p>
                    {statusFilter === 'all' && (
                        <Link
                            href="/business/discover"
                            className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 text-xs font-bold rounded-sm hover:bg-primary/90 transition-colors mt-2"
                        >
                            <Plus className="size-3.5" />
                            <span>Browse Creators</span>
                        </Link>
                    )}
                </div>
            ) : (
                <div className="space-y-4">
                    {filteredRequests.map((req) => (
                        <div
                            key={req.request_id}
                            className="border border-border bg-card p-5 rounded-sm shadow-sm space-y-4 hover:border-primary/50 transition-colors"
                        >
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border pb-3">
                                <div className="flex items-center gap-3">
                                    <div className="size-12 overflow-hidden border border-border shrink-0 rounded-md bg-muted flex items-center justify-center font-bold text-sm text-muted-foreground">
                                        {getInitials(req.creator_name)}
                                    </div>
                                    <div>
                                        <div className="flex items-center gap-2">
                                            <Link
                                                href={`/business/requests/${req.request_id}`}
                                                className="text-sm font-bold text-foreground hover:text-primary hover:underline transition-colors"
                                            >
                                                {req.creator_name}
                                            </Link>
                                            <span className="text-xs text-muted-foreground font-mono">
                                                {req.creator_handle ? `@${req.creator_handle.replace(/^@/, '')}` : `@creator_${req.creator_id}`}
                                            </span>
                                            <Link
                                                href={`/business/requests/${req.request_id}`}
                                                className="text-[10px] text-muted-foreground border border-border px-1.5 py-0.5 font-mono hover:border-primary hover:text-primary transition-colors"
                                            >
                                                REQ-{req.request_id}
                                            </Link>
                                        </div>
                                        <div className="text-xs text-muted-foreground">
                                            Collab Type: <strong className="text-foreground capitalize">{req.collab_type}</strong> &bull; Offer: <strong className="text-foreground">{formatOfferedAmount(req)}</strong>
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
                                    {req.offer_details || 'Collaboration Proposal'}
                                </h4>
                                {req.message && (
                                    <p className="text-xs text-muted-foreground italic border-l-2 border-primary/30 pl-2">
                                        &ldquo;{req.message}&rdquo;
                                    </p>
                                )}
                                <div className="flex flex-wrap gap-2 text-xs">
                                    {parseDeliverables(req.deliverables).map((deliv) => (
                                        <span
                                            key={deliv}
                                            className="border border-border bg-muted px-2.5 py-1 rounded-sm text-muted-foreground font-medium"
                                        >
                                            ✓ {deliv}
                                        </span>
                                    ))}
                                </div>
                            </div>

                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-3 border-t border-border text-xs">
                                <div className="flex items-center gap-4 text-muted-foreground">
                                    <div className="flex items-center gap-1.5 font-semibold text-primary">
                                        <ShieldCheck className="size-4" />
                                        <span>Verified Request</span>
                                    </div>
                                    <span>Requested: {new Date(req.requested_at).toLocaleDateString()}</span>
                                    <span className="font-medium text-foreground">
                                        Deadline: {new Date(req.deadline).toLocaleDateString()}
                                    </span>
                                </div>

                                <div className="flex items-center gap-2">
                                    <Link
                                        href={`/business/requests/${req.request_id}`}
                                        className="bg-primary hover:bg-primary/90 text-primary-foreground font-medium text-xs px-3 py-1.5 transition-colors rounded-sm"
                                    >
                                        View Details &rarr;
                                    </Link>
                                    <Link
                                        href={`/business/discover?q=${encodeURIComponent(req.creator_name)}`}
                                        className="border border-border bg-background hover:bg-muted font-medium text-xs px-3 py-1.5 text-foreground transition-colors rounded-sm"
                                    >
                                        Profile
                                    </Link>

                                    {req.status === 'accepted' && (
                                        <button
                                            type="button"
                                            disabled={actionLoadingId === req.request_id}
                                            onClick={() => handleComplete(req.request_id)}
                                            className="bg-emerald-600 hover:bg-emerald-700 text-white font-medium text-xs px-3 py-1.5 transition-colors cursor-pointer rounded-sm disabled:opacity-50"
                                        >
                                            {actionLoadingId === req.request_id ? 'Completing...' : 'Mark Completed'}
                                        </button>
                                    )}

                                    {req.status === 'pending' && (
                                        <button
                                            type="button"
                                            disabled={actionLoadingId === req.request_id}
                                            onClick={() => handleCancel(req.request_id)}
                                            className="border border-border hover:bg-destructive/10 hover:text-destructive hover:border-destructive font-medium text-xs px-3 py-1.5 transition-colors cursor-pointer rounded-sm disabled:opacity-50"
                                        >
                                            {actionLoadingId === req.request_id ? 'Cancelling...' : 'Withdraw'}
                                        </button>
                                    )}

                                    {(req.status === 'accepted' || req.status === 'completed') && (
                                        <button
                                            type="button"
                                            onClick={() => setContactModalItem(req)}
                                            className="bg-primary hover:bg-primary/90 text-primary-foreground font-medium text-xs px-3 py-1.5 transition-colors cursor-pointer rounded-sm flex items-center gap-1.5"
                                        >
                                            <MessageSquare className="size-3.5" />
                                            <span>Contact Details</span>
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Contact details dialog */}
            {contactModalItem && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
                    <div className="bg-card border border-border p-6 rounded-sm shadow-xl max-w-md w-full space-y-4">
                        <div className="flex items-center justify-between border-b border-border pb-3">
                            <h3 className="font-bold text-foreground flex items-center gap-2">
                                <Mail className="size-4 text-primary" />
                                <span>Counterpart Contact Info</span>
                            </h3>
                            <button
                                type="button"
                                onClick={() => setContactModalItem(null)}
                                className="text-muted-foreground hover:text-foreground text-sm font-bold"
                            >
                                ✕
                            </button>
                        </div>
                        <div className="space-y-2 text-sm">
                            <p>
                                <span className="text-muted-foreground text-xs uppercase font-bold block">Creator Name</span>
                                <span className="font-semibold text-foreground">{contactModalItem.creator_name}</span>
                            </p>
                            {contactModalItem.creator_handle && (
                                <p>
                                    <span className="text-muted-foreground text-xs uppercase font-bold block">Instagram Handle</span>
                                    <span className="font-mono text-primary font-semibold">@{contactModalItem.creator_handle.replace(/^@/, '')}</span>
                                </p>
                            )}
                            <div className="p-3 bg-muted/50 rounded-sm text-xs text-muted-foreground">
                                Contact information is unlocked for accepted and completed collaborations. Reach out directly via Instagram or your business contact phone to coordinate production.
                            </div>
                        </div>
                        <div className="pt-2 flex justify-end">
                            <button
                                type="button"
                                onClick={() => setContactModalItem(null)}
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
