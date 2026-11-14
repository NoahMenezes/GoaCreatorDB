'use client'

import { useCallback, useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
    AlertCircle,
    ArrowLeft,
    Calendar,
    CheckCircle2,
    Clock,
    FileText,
    Loader2,
    Mail,
    MapPin,
    MessageSquare,
    Phone,
    ShieldAlert,
    ShieldCheck,
    Star,
    X,
    XCircle,
} from 'lucide-react'

// ─── Interfaces ──────────────────────────────────────────────────────────────

export interface RequestReview {
    review_id: number
    request_id: number
    reviewer_id: number
    reviewee_id: number
    rating: number
    comment: string | null
    created_at: string
    reviewer_role?: string
}

export interface RequestDetail {
    request_id: number
    business_id: number
    creator_id: number
    collab_type: 'paid' | 'barter' | 'hybrid'
    offered_amount: number
    offer_details: string | null
    deliverables: string | null
    message: string | null
    status: 'pending' | 'accepted' | 'rejected' | 'completed' | 'cancelled'
    requested_at: string
    responded_at: string | null
    deadline: string
    business_name: string
    industry?: string
    contact_phone?: string | null
    business_instagram?: string | null
    business_area?: string | null
    business_taluka?: string | null
    business_district?: string | null
    creator_name: string
    creator_area?: string | null
    creator_taluka?: string | null
    creator_district?: string | null
    business_user_id: number
    creator_user_id: number
    business_email?: string
    creator_email?: string
    reviews?: RequestReview[]
}

interface UserAuth {
    authenticated: boolean
    user?: {
        user_id: number
        email: string
        role: 'business' | 'creator' | 'admin'
    }
}

// ─── Helper Components ───────────────────────────────────────────────────────

function StatusBadge({ status }: { status: RequestDetail['status'] }) {
    switch (status) {
        case 'pending':
            return (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider border border-border text-muted-foreground bg-background">
                    <Clock className="size-3 text-muted-foreground" />
                    Pending Creator Response
                </span>
            )
        case 'accepted':
            return (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider border border-primary/20 text-primary bg-primary/10">
                    <ShieldCheck className="size-3 text-primary" />
                    Accepted • In Progress
                </span>
            )
        case 'completed':
            return (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 bg-emerald-500/10">
                    <CheckCircle2 className="size-3 text-emerald-600 dark:text-emerald-400" />
                    Completed Deal
                </span>
            )
        case 'rejected':
            return (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider border border-destructive/20 text-destructive bg-destructive/10">
                    <XCircle className="size-3 text-destructive" />
                    Declined
                </span>
            )
        case 'cancelled':
            return (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider border border-muted text-muted-foreground bg-muted/30">
                    <X className="size-3 text-muted-foreground" />
                    Cancelled
                </span>
            )
        default:
            return (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider border border-border text-muted-foreground">
                    {status}
                </span>
            )
    }
}

function CollabTypeBadge({ type }: { type: RequestDetail['collab_type'] }) {
    return (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider border border-primary/20 text-primary bg-primary/5">
            {type.toUpperCase()} COLLAB
        </span>
    )
}

function StatusTimeline({ request }: { request: RequestDetail }) {
    const isPending = request.status === 'pending'
    const isAccepted = request.status === 'accepted'
    const isCompleted = request.status === 'completed'
    const isRejected = request.status === 'rejected'
    const isCancelled = request.status === 'cancelled'

    // Step 1: Requested
    const step1Done = true
    // Step 2: Responded
    const step2Active = isPending
    const step2Done = isAccepted || isCompleted
    const step2Failed = isRejected || (isCancelled && !request.responded_at)
    // Step 3: Completed
    const step3Done = isCompleted
    const step3Active = isAccepted
    const step3Failed = isCancelled && !isCompleted

    return (
        <div className="border border-border bg-card p-5 space-y-4">
            <div className="text-[10px] font-bold text-foreground uppercase tracking-wider">
                Collaboration Timeline
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 relative">
                {/* Step 1: Requested */}
                <div className="border border-border bg-background p-4 space-y-1 relative">
                    <div className="flex items-center justify-between">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                            Step 1 • Proposal Sent
                        </span>
                        <CheckCircle2 className="size-4 text-primary" />
                    </div>
                    <div className="text-sm font-bold text-foreground">Requested</div>
                    <div className="text-xs text-muted-foreground">
                        {new Date(request.requested_at).toLocaleDateString('en-IN', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric',
                        })}
                    </div>
                </div>

                {/* Step 2: Responded */}
                <div
                    className={`border p-4 space-y-1 ${
                        step2Done
                            ? 'border-border bg-background'
                            : step2Active
                            ? 'border-primary/50 bg-primary/5'
                            : step2Failed
                            ? 'border-destructive/30 bg-destructive/5'
                            : 'border-border/60 bg-muted/20'
                    }`}
                >
                    <div className="flex items-center justify-between">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                            Step 2 • Creator Decision
                        </span>
                        {step2Done ? (
                            <CheckCircle2 className="size-4 text-primary" />
                        ) : step2Active ? (
                            <Clock className="size-4 text-warning animate-pulse" />
                        ) : step2Failed ? (
                            <XCircle className="size-4 text-destructive" />
                        ) : (
                            <Clock className="size-4 text-muted-foreground" />
                        )}
                    </div>
                    <div className="text-sm font-bold text-foreground">
                        {isPending
                            ? 'Awaiting Creator Response'
                            : isRejected
                            ? 'Declined by Creator'
                            : isCancelled && !request.responded_at
                            ? 'Cancelled Before Response'
                            : 'Accepted & Locked'}
                    </div>
                    <div className="text-xs text-muted-foreground">
                        {request.responded_at
                            ? new Date(request.responded_at).toLocaleDateString('en-IN', {
                                  day: 'numeric',
                                  month: 'short',
                                  year: 'numeric',
                              })
                            : isPending
                            ? 'Awaiting decision'
                            : '—'}
                    </div>
                </div>

                {/* Step 3: Completed */}
                <div
                    className={`border p-4 space-y-1 ${
                        step3Done
                            ? 'border-emerald-500/30 bg-emerald-500/5'
                            : step3Active
                            ? 'border-primary/30 bg-primary/5'
                            : step3Failed || isRejected
                            ? 'border-border/60 bg-muted/20 opacity-60'
                            : 'border-border/60 bg-muted/20'
                    }`}
                >
                    <div className="flex items-center justify-between">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                            Step 3 • Campaign Delivery
                        </span>
                        {step3Done ? (
                            <CheckCircle2 className="size-4 text-emerald-600 dark:text-emerald-400" />
                        ) : step3Active ? (
                            <ShieldCheck className="size-4 text-primary" />
                        ) : (
                            <Clock className="size-4 text-muted-foreground" />
                        )}
                    </div>
                    <div className="text-sm font-bold text-foreground">
                        {isCompleted
                            ? 'Completed & Finalized'
                            : isAccepted
                            ? 'In Production (Shooting)'
                            : isCancelled
                            ? 'Cancelled'
                            : isRejected
                            ? 'Closed'
                            : 'Pending Execution'}
                    </div>
                    <div className="text-xs text-muted-foreground">
                        Deadline: {new Date(request.deadline).toLocaleDateString('en-IN', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric',
                        })}
                    </div>
                </div>
            </div>
        </div>
    )
}

// ─── Main RequestDetailView Component ─────────────────────────────────────────

export function RequestDetailView({
    requestId,
    backHref,
}: {
    requestId: number | string
    backHref?: string
}) {
    const router = useRouter()
    const [request, setRequest] = useState<RequestDetail | null>(null)
    const [auth, setAuth] = useState<UserAuth | null>(null)
    const [loading, setLoading] = useState(true)
    const [notFound, setNotFound] = useState(false)
    const [error, setError] = useState<string | null>(null)

    // Action handling
    const [actionLoading, setActionLoading] = useState(false)
    const [actionError, setActionError] = useState<string | null>(null)
    const [actionSuccess, setActionSuccess] = useState<string | null>(null)

    // Review form state
    const [rating, setRating] = useState<number>(5)
    const [hoverRating, setHoverRating] = useState<number>(0)
    const [reviewComment, setReviewComment] = useState('')
    const [reviewSubmitting, setReviewSubmitting] = useState(false)
    const [reviewSuccess, setReviewSuccess] = useState(false)
    const [reviewError, setReviewError] = useState<string | null>(null)

    const loadData = useCallback(async () => {
        setLoading(true)
        setError(null)
        setNotFound(false)

        try {
            const [authRes, reqRes] = await Promise.all([
                fetch('/api/auth/me', { credentials: 'include' }),
                fetch(`/api/requests/${requestId}`, { credentials: 'include' }),
            ])

            if (authRes.ok) {
                const authData = await authRes.json()
                setAuth(authData)
            }

            if (reqRes.status === 404) {
                setNotFound(true)
                return
            }

            const data = await reqRes.json()
            if (!reqRes.ok || !data.success) {
                throw new Error(data.error || 'Failed to fetch collaboration request')
            }

            setRequest(data.data)
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Error loading collaboration details')
        } finally {
            setLoading(false)
        }
    }, [requestId])

    useEffect(() => {
        loadData()
    }, [loadData])

    const handleAction = async (action: 'accept' | 'reject' | 'complete' | 'cancel') => {
        const actionLabels: Record<string, string> = {
            accept: 'accept this collaboration request',
            reject: 'decline this collaboration proposal',
            complete: 'mark this collaboration as completed',
            cancel: 'cancel/withdraw this collaboration request',
        }

        if (!confirm(`Are you sure you want to ${actionLabels[action]}?`)) {
            return
        }

        setActionLoading(true)
        setActionError(null)
        setActionSuccess(null)

        try {
            const res = await fetch(`/api/requests/${requestId}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({ action }),
            })

            const data = await res.json()
            if (!res.ok || !data.success) {
                throw new Error(data.error || `Failed to ${action} request`)
            }

            setActionSuccess(`Request successfully updated: ${action.toUpperCase()}`)
            await loadData()
        } catch (err) {
            setActionError(err instanceof Error ? err.message : 'Action failed')
        } finally {
            setActionLoading(false)
        }
    }

    const handleReviewSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setReviewSubmitting(true)
        setReviewError(null)
        setReviewSuccess(false)

        try {
            const res = await fetch('/api/reviews', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({
                    request_id: Number(requestId),
                    rating: Number(rating),
                    comment: reviewComment.trim() || null,
                }),
            })

            const data = await res.json()
            if (!res.ok || !data.success) {
                throw new Error(data.error || 'Failed to submit review')
            }

            setReviewSuccess(true)
            setReviewComment('')
            await loadData()
        } catch (err) {
            setReviewError(err instanceof Error ? err.message : 'Failed to post review')
        } finally {
            setReviewSubmitting(false)
        }
    }

    // Determine counterpart info based on current logged in user
    const currentUserId = auth?.user?.user_id
    const currentUserRole = auth?.user?.role
    const isCreator = currentUserRole === 'creator' || currentUserId === request?.creator_user_id
    const isBusiness = currentUserRole === 'business' || currentUserId === request?.business_user_id
    const isAdmin = currentUserRole === 'admin'

    const counterpartName = isCreator
        ? request?.business_name
        : request?.creator_name || 'Collaboration Partner'

    const counterpartLocation = isCreator
        ? [request?.business_area, request?.business_taluka, request?.business_district]
              .filter(Boolean)
              .join(', ') || 'Goa'
        : [request?.creator_area, request?.creator_taluka, request?.creator_district]
              .filter(Boolean)
              .join(', ') || 'Goa'

    // Check if current user has already submitted a review
    const alreadyReviewed = (request?.reviews || []).some(
        (r) => r.reviewer_id === currentUserId
    )

    // Permissions for actions
    const canAcceptOrDecline = isCreator && request?.status === 'pending'
    const canComplete = isBusiness && request?.status === 'accepted'
    const canCancel =
        (isBusiness && (request?.status === 'pending' || request?.status === 'accepted')) ||
        (isCreator && request?.status === 'accepted')

    // Fallback back URL
    const defaultBackHref = isCreator
        ? '/creator/requests'
        : isBusiness
        ? '/business/requests'
        : '/admin'
    const effectiveBackHref = backHref || defaultBackHref

    // ─── Loading State ─────────────────────────────────────────────────────────
    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center py-24 gap-3">
                <Loader2 className="size-8 text-primary animate-spin" />
                <p className="text-sm text-muted-foreground font-medium">
                    Loading collaboration details…
                </p>
            </div>
        )
    }

    // ─── 404 State ─────────────────────────────────────────────────────────────
    if (notFound) {
        return (
            <div className="border border-border bg-card p-10 text-center space-y-4 max-w-lg mx-auto my-12">
                <div className="size-12 bg-muted flex items-center justify-center mx-auto text-muted-foreground">
                    <AlertCircle className="size-6 text-destructive" />
                </div>
                <div className="space-y-1">
                    <h2 className="text-lg font-bold text-foreground">Request Not Found</h2>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                        Collaboration request #{requestId} could not be found or you do not have permission
                        to view this request.
                    </p>
                </div>
                <div className="pt-2">
                    <Link
                        href={effectiveBackHref}
                        className="inline-flex items-center gap-2 bg-primary hover:bg-primary/90 text-primary-foreground text-xs font-semibold px-4 py-2 transition-colors"
                    >
                        <ArrowLeft className="size-3.5" />
                        <span>Return to Requests</span>
                    </Link>
                </div>
            </div>
        )
    }

    // ─── Error State ───────────────────────────────────────────────────────────
    if (error || !request) {
        return (
            <div className="border border-destructive/20 bg-destructive/5 p-8 text-center space-y-4 max-w-lg mx-auto my-12">
                <AlertCircle className="size-8 text-destructive mx-auto" />
                <div className="space-y-1">
                    <h2 className="text-base font-bold text-destructive">Unable to Load Request</h2>
                    <p className="text-xs text-destructive/80">{error || 'An unexpected error occurred.'}</p>
                </div>
                <div className="flex justify-center gap-3 pt-2">
                    <button
                        type="button"
                        onClick={loadData}
                        className="bg-primary hover:bg-primary/90 text-primary-foreground text-xs font-semibold px-4 py-2 transition-colors cursor-pointer"
                    >
                        Retry
                    </button>
                    <Link
                        href={effectiveBackHref}
                        className="border border-border bg-card text-foreground hover:bg-muted text-xs font-semibold px-4 py-2 transition-colors"
                    >
                        Go Back
                    </Link>
                </div>
            </div>
        )
    }

    // Parse deliverables list
    const deliverablesList = request.deliverables
        ? request.deliverables.split(/[\n,]+/).map((d) => d.trim()).filter(Boolean)
        : ['Standard Campaign Deliverables']

    const formattedAmount =
        request.collab_type === 'barter'
            ? 'Barter Experience'
            : request.collab_type === 'hybrid'
            ? `₹${Number(request.offered_amount || 0).toLocaleString('en-IN')} + Barter`
            : `₹${Number(request.offered_amount || 0).toLocaleString('en-IN')}`

    return (
        <main className="space-y-6">
            {/* Top Bar with Back Link */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border pb-4">
                <Link
                    href={effectiveBackHref}
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors group cursor-pointer"
                >
                    <ArrowLeft className="size-4 group-hover:-translate-x-0.5 transition-transform" />
                    <span>Back to Requests</span>
                </Link>

                <div className="flex items-center gap-2">
                    <span className="text-xs font-mono text-muted-foreground">
                        REQ-{request.request_id}
                    </span>
                    <CollabTypeBadge type={request.collab_type} />
                    <StatusBadge status={request.status} />
                </div>
            </div>

            {/* Notification Banners */}
            {actionSuccess && (
                <div className="flex items-center gap-2 p-3 border border-primary/20 bg-primary/10 text-primary text-xs font-semibold">
                    <CheckCircle2 className="size-4 shrink-0" />
                    <span>{actionSuccess}</span>
                </div>
            )}

            {actionError && (
                <div className="flex items-center gap-2 p-3 border border-destructive/20 bg-destructive/10 text-destructive text-xs font-semibold">
                    <AlertCircle className="size-4 shrink-0" />
                    <span>{actionError}</span>
                </div>
            )}

            {/* Main Header Card */}
            <div className="border border-border bg-card p-6 space-y-4">
                <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                    <div className="space-y-1.5 flex-1">
                        <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                            {isCreator ? 'Business Partner' : isBusiness ? 'Selected Creator' : 'Partnership'}
                        </div>
                        <h1 className="text-2xl sm:text-3xl font-black text-foreground tracking-tight">
                            {counterpartName}
                        </h1>

                        <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground pt-0.5">
                            <span className="inline-flex items-center gap-1 text-foreground font-medium">
                                <MapPin className="size-3.5 text-primary" />
                                {counterpartLocation}
                            </span>
                            {request.industry && (
                                <span className="border-l border-border pl-3 text-muted-foreground">
                                    {request.industry}
                                </span>
                            )}
                            {request.business_instagram && (
                                <span className="border-l border-border pl-3 text-primary font-mono text-[11px]">
                                    {request.business_instagram}
                                </span>
                            )}
                            {request.contact_phone && (
                                <span className="border-l border-border pl-3 inline-flex items-center gap-1 text-foreground font-semibold">
                                    <Phone className="size-3 text-primary" />
                                    {request.contact_phone}
                                </span>
                            )}
                        </div>
                    </div>

                    {/* Financial summary card */}
                    <div className="border border-border bg-background p-4 min-w-[200px] text-right space-y-1">
                        <div className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                            Offered Budget
                        </div>
                        <div className="text-2xl font-black text-primary tracking-tight">
                            {formattedAmount}
                        </div>
                        <div className="text-[10px] text-muted-foreground font-medium">
                            {request.collab_type === 'paid'
                                ? 'Escrow Protected Deal'
                                : request.collab_type === 'barter'
                                ? 'Complimentary Experience'
                                : 'Hybrid Compensation'}
                        </div>
                    </div>
                </div>

                {/* Status Timeline */}
                <StatusTimeline request={request} />
            </div>

            {/* Proposal Details & Deliverables */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                {/* Left: Campaign Brief & Deliverables */}
                <div className="lg:col-span-8 space-y-6">
                    {/* Campaign Brief */}
                    <div className="border border-border bg-card p-6 space-y-4">
                        <div className="flex items-center gap-2 border-b border-border pb-3">
                            <FileText className="size-4 text-primary" />
                            <h2 className="text-sm font-bold text-foreground uppercase tracking-wider">
                                Campaign Brief &amp; Objective
                            </h2>
                        </div>

                        <div className="space-y-3">
                            <p className="text-sm text-foreground font-medium leading-relaxed">
                                {request.offer_details || 'Standard Goan hospitality campaign collaboration.'}
                            </p>

                            {request.message && (
                                <div className="border-l-2 border-primary bg-muted/30 p-3.5 space-y-1">
                                    <div className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                                        <MessageSquare className="size-3 text-primary" />
                                        Original Message
                                    </div>
                                    <p className="text-xs text-foreground italic leading-relaxed">
                                        &ldquo;{request.message}&rdquo;
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Deliverables Checklist */}
                    <div className="border border-border bg-card p-6 space-y-4">
                        <div className="flex items-center justify-between border-b border-border pb-3">
                            <div className="flex items-center gap-2">
                                <ShieldCheck className="size-4 text-primary" />
                                <h2 className="text-sm font-bold text-foreground uppercase tracking-wider">
                                    Deliverables &amp; Scope
                                </h2>
                            </div>
                            <span className="text-xs text-muted-foreground font-semibold">
                                {deliverablesList.length} Item{deliverablesList.length !== 1 ? 's' : ''}
                            </span>
                        </div>

                        <div className="space-y-2">
                            {deliverablesList.map((deliv, idx) => (
                                <div
                                    key={idx}
                                    className="flex items-start gap-3 p-3 border border-border bg-background"
                                >
                                    <div className="size-5 bg-primary/10 border border-primary/20 text-primary flex items-center justify-center shrink-0 mt-0.5">
                                        <CheckCircle2 className="size-3.5 text-primary" />
                                    </div>
                                    <span className="text-xs font-semibold text-foreground leading-snug">
                                        {deliv}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Right: Key Dates & Actions Sidebar */}
                <div className="lg:col-span-4 space-y-6">
                    {/* Key Details Summary */}
                    <div className="border border-border bg-card p-6 space-y-4">
                        <h2 className="text-xs font-bold text-foreground uppercase tracking-wider border-b border-border pb-3">
                            Deal Summary
                        </h2>

                        <div className="space-y-3 text-xs">
                            <div className="flex items-center justify-between py-1 border-b border-border/50">
                                <span className="text-muted-foreground">Compensation:</span>
                                <span className="font-bold text-foreground">{formattedAmount}</span>
                            </div>

                            <div className="flex items-center justify-between py-1 border-b border-border/50">
                                <span className="text-muted-foreground">Deliverable Deadline:</span>
                                <span className="font-semibold text-foreground flex items-center gap-1">
                                    <Calendar className="size-3 text-primary" />
                                    {new Date(request.deadline).toLocaleDateString('en-IN', {
                                        day: 'numeric',
                                        month: 'short',
                                        year: 'numeric',
                                    })}
                                </span>
                            </div>

                            <div className="flex items-center justify-between py-1 border-b border-border/50">
                                <span className="text-muted-foreground">Requested On:</span>
                                <span className="text-foreground">
                                    {new Date(request.requested_at).toLocaleDateString('en-IN', {
                                        day: 'numeric',
                                        month: 'short',
                                        year: 'numeric',
                                    })}
                                </span>
                            </div>

                            {request.responded_at && (
                                <div className="flex items-center justify-between py-1 border-b border-border/50">
                                    <span className="text-muted-foreground">Responded On:</span>
                                    <span className="text-foreground">
                                        {new Date(request.responded_at).toLocaleDateString('en-IN', {
                                            day: 'numeric',
                                            month: 'short',
                                            year: 'numeric',
                                        })}
                                    </span>
                                </div>
                            )}

                            {request.contact_phone && (
                                <div className="flex items-center justify-between py-1">
                                    <span className="text-muted-foreground">Contact Phone:</span>
                                    <span className="font-bold text-primary font-mono">
                                        {request.contact_phone}
                                    </span>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Action Buttons Box */}
                    {(canAcceptOrDecline || canComplete || canCancel) && (
                        <div className="border border-border bg-card p-6 space-y-3">
                            <div className="text-[10px] font-bold text-foreground uppercase tracking-wider">
                                Actions
                            </div>

                            {/* Creator Pending: Accept or Decline */}
                            {canAcceptOrDecline && (
                                <div className="space-y-2">
                                    <button
                                        type="button"
                                        disabled={actionLoading}
                                        onClick={() => handleAction('accept')}
                                        className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold text-xs py-2.5 flex items-center justify-center gap-2 cursor-pointer transition-colors disabled:opacity-50"
                                    >
                                        <CheckCircle2 className="size-4" />
                                        <span>Accept Request</span>
                                    </button>
                                    <button
                                        type="button"
                                        disabled={actionLoading}
                                        onClick={() => handleAction('reject')}
                                        className="w-full border border-border bg-background hover:bg-muted text-foreground font-semibold text-xs py-2.5 flex items-center justify-center gap-2 cursor-pointer transition-colors disabled:opacity-50"
                                    >
                                        <XCircle className="size-4 text-destructive" />
                                        <span>Decline Request</span>
                                    </button>
                                </div>
                            )}

                            {/* Business Accepted: Mark as Completed */}
                            {canComplete && (
                                <button
                                    type="button"
                                    disabled={actionLoading}
                                    onClick={() => handleAction('complete')}
                                    className="w-full bg-emerald-700 hover:bg-emerald-800 text-white font-semibold text-xs py-2.5 flex items-center justify-center gap-2 cursor-pointer transition-colors disabled:opacity-50"
                                >
                                    <CheckCircle2 className="size-4" />
                                    <span>Mark as Completed</span>
                                </button>
                            )}

                            {/* Either Party: Cancel Request when allowed */}
                            {canCancel && (
                                <button
                                    type="button"
                                    disabled={actionLoading}
                                    onClick={() => handleAction('cancel')}
                                    className="w-full border border-destructive/30 hover:bg-destructive/10 text-destructive font-semibold text-xs py-2.5 flex items-center justify-center gap-2 cursor-pointer transition-colors disabled:opacity-50"
                                >
                                    <X className="size-4" />
                                    <span>Cancel Collaboration</span>
                                </button>
                            )}
                        </div>
                    )}
                </div>
            </div>

            {/* Reviews Section (Only visible once completed) */}
            {request.status === 'completed' && (
                <div className="border border-border bg-card p-6 space-y-6">
                    <div className="flex items-center justify-between border-b border-border pb-4">
                        <div className="space-y-0.5">
                            <div className="flex items-center gap-2">
                                <Star className="size-4 text-primary fill-primary" />
                                <h2 className="text-base font-bold text-foreground">
                                    Collaboration Reviews &amp; Ratings
                                </h2>
                            </div>
                            <p className="text-xs text-muted-foreground">
                                Verified feedback from parties to this completed campaign.
                            </p>
                        </div>
                    </div>

                    {/* Submitted Reviews List */}
                    {request.reviews && request.reviews.length > 0 ? (
                        <div className="space-y-3">
                            {request.reviews.map((rev) => (
                                <div
                                    key={rev.review_id}
                                    className="border border-border bg-background p-4 space-y-2"
                                >
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-1.5">
                                            {[1, 2, 3, 4, 5].map((star) => (
                                                <Star
                                                    key={star}
                                                    className={`size-3.5 ${
                                                        star <= rev.rating
                                                            ? 'text-primary fill-primary'
                                                            : 'text-muted-foreground/30'
                                                    }`}
                                                />
                                            ))}
                                            <span className="text-xs font-bold text-foreground ml-1.5">
                                                {rev.rating}/5
                                            </span>
                                        </div>

                                        <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
                                            {rev.reviewer_role && (
                                                <span className="uppercase font-bold text-primary">
                                                    {rev.reviewer_role}
                                                </span>
                                            )}
                                            <span>
                                                {new Date(rev.created_at).toLocaleDateString('en-IN', {
                                                    day: 'numeric',
                                                    month: 'short',
                                                    year: 'numeric',
                                                })}
                                            </span>
                                        </div>
                                    </div>

                                    {rev.comment ? (
                                        <p className="text-xs text-foreground leading-relaxed">
                                            &ldquo;{rev.comment}&rdquo;
                                        </p>
                                    ) : (
                                        <p className="text-xs text-muted-foreground italic">
                                            No additional comments left.
                                        </p>
                                    )}
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="p-6 border border-dashed border-border text-center text-xs text-muted-foreground">
                            No reviews submitted yet for this completed collaboration.
                        </div>
                    )}

                    {/* Leave a review form (if party hasn't reviewed yet) */}
                    {!alreadyReviewed && (isCreator || isBusiness) && (
                        <div className="border-t border-border pt-6 space-y-4">
                            <div className="space-y-1">
                                <h3 className="text-sm font-bold text-foreground">
                                    Leave a Review for {counterpartName}
                                </h3>
                                <p className="text-xs text-muted-foreground">
                                    Share your experience working with {counterpartName} on this campaign.
                                </p>
                            </div>

                            {reviewSuccess && (
                                <div className="flex items-center gap-2 p-3 border border-emerald-500/20 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-xs font-semibold">
                                    <CheckCircle2 className="size-4" />
                                    <span>Your review was submitted successfully!</span>
                                </div>
                            )}

                            {reviewError && (
                                <div className="flex items-center gap-2 p-3 border border-destructive/20 bg-destructive/10 text-destructive text-xs font-semibold">
                                    <AlertCircle className="size-4" />
                                    <span>{reviewError}</span>
                                </div>
                            )}

                            <form onSubmit={handleReviewSubmit} className="space-y-4">
                                {/* Star Rating Selector */}
                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-bold text-foreground uppercase tracking-wider block">
                                        Rating *
                                    </label>
                                    <div className="flex items-center gap-1.5">
                                        {[1, 2, 3, 4, 5].map((star) => {
                                            const isSelected = (hoverRating || rating) >= star
                                            return (
                                                <button
                                                    key={star}
                                                    type="button"
                                                    onMouseEnter={() => setHoverRating(star)}
                                                    onMouseLeave={() => setHoverRating(0)}
                                                    onClick={() => setRating(star)}
                                                    className="p-1 hover:scale-110 transition-transform cursor-pointer focus:outline-none"
                                                    aria-label={`${star} Stars`}
                                                >
                                                    <Star
                                                        className={`size-6 ${
                                                            isSelected
                                                                ? 'text-primary fill-primary'
                                                                : 'text-muted-foreground/30'
                                                        }`}
                                                    />
                                                </button>
                                            )
                                        })}
                                        <span className="text-xs font-bold text-foreground ml-2">
                                            {rating} Star{rating > 1 ? 's' : ''}
                                        </span>
                                    </div>
                                </div>

                                {/* Review Comment */}
                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-bold text-foreground uppercase tracking-wider block">
                                        Feedback &amp; Comments
                                    </label>
                                    <textarea
                                        rows={3}
                                        value={reviewComment}
                                        onChange={(e) => setReviewComment(e.target.value)}
                                        placeholder={`How was your experience collaborating with ${counterpartName}?`}
                                        className="w-full border border-border bg-background px-3 py-2 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary resize-none"
                                    />
                                </div>

                                <button
                                    type="submit"
                                    disabled={reviewSubmitting}
                                    className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold text-xs px-5 py-2.5 flex items-center gap-2 cursor-pointer transition-colors disabled:opacity-50"
                                >
                                    {reviewSubmitting ? (
                                        <>
                                            <Loader2 className="size-3.5 animate-spin" />
                                            <span>Submitting Review…</span>
                                        </>
                                    ) : (
                                        <>
                                            <Star className="size-3.5 fill-primary-foreground" />
                                            <span>Submit Verified Review</span>
                                        </>
                                    )}
                                </button>
                            </form>
                        </div>
                    )}
                </div>
            )}
        </main>
    )
}

