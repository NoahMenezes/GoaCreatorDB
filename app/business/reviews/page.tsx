'use client'

import { useState, useEffect } from 'react'
import { CheckCircle2, Send, Star, Loader2, AlertCircle, RefreshCw } from 'lucide-react'

interface ReviewItem {
    review_id: number
    request_id: number
    reviewer_id: number
    reviewee_id: number
    rating: number
    comment: string | null
    created_at: string
    business_name: string
    business_id: number
    creator_name: string
    creator_id: number
    collab_type: string
    offered_amount: number
    deliverables: string | null
}

interface CompletedRequest {
    request_id: number
    creator_name: string
    deliverables: string | null
    offer_details: string
    collab_type: string
}

export default function BusinessReviewsPage() {
    const [reviews, setReviews] = useState<ReviewItem[]>([])
    const [completedRequests, setCompletedRequests] = useState<CompletedRequest[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [businessName, setBusinessName] = useState('Café Palmeira')

    const [selectedRequestId, setSelectedRequestId] = useState<number | ''>('')
    const [rating, setRating] = useState(5)
    const [comment, setComment] = useState('')
    const [submitting, setSubmitting] = useState(false)
    const [submitSuccess, setSubmitSuccess] = useState<string | null>(null)
    const [submitError, setSubmitError] = useState<string | null>(null)

    const fetchData = async () => {
        setLoading(true)
        setError(null)
        try {
            // 1. Fetch user reviews given
            const revRes = await fetch('/api/reviews?filter=given')
            const revData = await revRes.json()
            if (!revRes.ok || !revData.success) {
                throw new Error(revData.error || 'Failed to load reviews')
            }
            setReviews(revData.data || [])

            // 2. Fetch completed requests that can be reviewed
            const reqRes = await fetch('/api/requests?status=completed&limit=100')
            const reqData = await reqRes.json()
            if (reqRes.ok && reqData.success) {
                const completed: CompletedRequest[] = reqData.data || []
                setCompletedRequests(completed)
                if (completed.length > 0 && selectedRequestId === '') {
                    setSelectedRequestId(completed[0].request_id)
                }
            }

            // 3. Fetch profile name
            const meRes = await fetch('/api/auth/me')
            const meData = await meRes.json()
            if (meRes.ok && meData.success && meData.data?.profile?.business_name) {
                setBusinessName(meData.data.profile.business_name)
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to fetch reviews data')
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchData()
    }, [])

    const handleSubmitReview = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!selectedRequestId) {
            setSubmitError('Please select a completed collaboration to review')
            return
        }

        setSubmitting(true)
        setSubmitError(null)
        setSubmitSuccess(null)

        try {
            const res = await fetch('/api/reviews', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    request_id: Number(selectedRequestId),
                    rating,
                    comment: comment.trim(),
                }),
            })
            const data = await res.json()
            if (!res.ok || !data.success) {
                throw new Error(data.error || 'Failed to publish review')
            }

            setSubmitSuccess('Review published to creator\'s verified public profile.')
            setComment('')
            await fetchData()
            setTimeout(() => {
                setSubmitSuccess(null)
            }, 3000)
        } catch (err) {
            setSubmitError(err instanceof Error ? err.message : 'Error publishing review')
        } finally {
            setSubmitting(false)
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

    const avgRating = reviews.length > 0
        ? (reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length).toFixed(1)
        : '5.0'

    return (
        <main className="space-y-8">
            <div className="border border-border bg-card p-6 rounded-sm shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-xl sm:text-2xl font-bold text-foreground tracking-tight">
                        Business Ratings &amp; Reviews
                    </h1>
                    <p className="text-sm text-muted-foreground">
                        Verified post-collaboration reviews between {businessName} and Goan creators
                    </p>
                </div>

                <div className="flex items-center gap-4 text-xs font-semibold self-start md:self-auto">
                    <div className="border border-border p-2.5 bg-background rounded-sm text-center">
                        <div className="text-lg font-black text-primary">{avgRating}</div>
                        <span className="text-[10px] text-muted-foreground uppercase">Average Given</span>
                    </div>

                    <div className="border border-border p-2.5 bg-background rounded-sm text-center">
                        <div className="text-lg font-black text-primary">{reviews.length}</div>
                        <span className="text-[10px] text-muted-foreground uppercase">Total Reviews</span>
                    </div>
                </div>
            </div>

            <div className="border border-border bg-card p-6 rounded-sm shadow-sm space-y-4">
                <div className="border-b border-border pb-3">
                    <h2 className="text-sm font-bold text-foreground">Leave a Collaboration Review</h2>
                    <p className="text-xs text-muted-foreground">
                        Reviews can be submitted only once collaboration deliverables are completed.
                    </p>
                </div>

                {submitSuccess ? (
                    <div className="p-4 border border-primary bg-primary/5 text-primary text-xs font-bold rounded-sm">
                        ✓ {submitSuccess}
                    </div>
                ) : (
                    <form onSubmit={handleSubmitReview} className="space-y-4">
                        {submitError && (
                            <div className="p-3 border border-destructive/20 bg-destructive/5 text-destructive text-xs font-medium rounded-sm">
                                {submitError}
                            </div>
                        )}

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-bold text-foreground uppercase tracking-wider">
                                    Completed Collaboration
                                </label>
                                {completedRequests.length === 0 ? (
                                    <div className="border border-border bg-muted/40 rounded-sm px-3 py-2 text-xs text-muted-foreground">
                                        No completed collaborations awaiting review.
                                    </div>
                                ) : (
                                    <select
                                        value={selectedRequestId}
                                        onChange={(e) => setSelectedRequestId(Number(e.target.value))}
                                        className="w-full border border-border bg-background rounded-sm px-3 py-2 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-ring cursor-pointer"
                                    >
                                        {completedRequests.map((cr) => (
                                            <option key={cr.request_id} value={cr.request_id}>
                                                {cr.creator_name} — {cr.offer_details || cr.deliverables || `Deal (REQ-${cr.request_id})`}
                                            </option>
                                        ))}
                                    </select>
                                )}
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-[10px] font-bold text-foreground uppercase tracking-wider">
                                    Rating (1 to 5 Stars)
                                </label>
                                <div className="flex items-center gap-1.5 pt-1">
                                    {[1, 2, 3, 4, 5].map((star) => (
                                        <button
                                            key={star}
                                            type="button"
                                            onClick={() => setRating(star)}
                                            className="cursor-pointer text-primary hover:scale-105 transition-transform"
                                        >
                                            <Star className={`size-5 ${star <= rating ? 'fill-primary' : 'text-muted-foreground'}`} />
                                        </button>
                                    ))}
                                    <span className="text-xs font-bold text-muted-foreground ml-2">
                                        {rating} of 5 Stars
                                    </span>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-[10px] font-bold text-foreground uppercase tracking-wider">
                                Detailed Feedback &amp; Results
                            </label>
                            <textarea
                                required
                                rows={3}
                                value={comment}
                                onChange={(e) => setComment(e.target.value)}
                                placeholder="Describe campaign reach, creator professionalism, footage quality, and guest engagement..."
                                className="w-full border border-border bg-background rounded-sm p-3 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-ring"
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={submitting || completedRequests.length === 0}
                            className="bg-primary hover:bg-primary/90 text-primary-foreground font-bold text-xs px-5 py-2.5 flex items-center gap-2 cursor-pointer rounded-sm shadow-sm transition-colors disabled:opacity-50"
                        >
                            {submitting ? <Loader2 className="size-3.5 animate-spin" /> : <Send className="size-3.5" />}
                            <span>{submitting ? 'Publishing...' : 'Publish Verified Review'}</span>
                        </button>
                    </form>
                )}
            </div>

            <div className="space-y-4">
                <h2 className="text-sm font-bold text-foreground">
                    Reviews Published by {businessName} ({reviews.length})
                </h2>

                {loading ? (
                    <div className="border border-border bg-card p-12 text-center rounded-sm shadow-sm flex flex-col items-center justify-center space-y-3">
                        <Loader2 className="size-8 text-primary animate-spin" />
                        <p className="text-sm text-muted-foreground">Loading reviews...</p>
                    </div>
                ) : error ? (
                    <div className="border border-destructive/20 bg-destructive/5 p-6 rounded-sm text-center space-y-3">
                        <AlertCircle className="size-8 text-destructive mx-auto" />
                        <p className="text-sm font-semibold text-destructive">{error}</p>
                        <button
                            type="button"
                            onClick={fetchData}
                            className="inline-flex items-center gap-2 bg-background border border-border px-4 py-2 text-xs font-bold hover:bg-muted rounded-sm transition-colors cursor-pointer"
                        >
                            <RefreshCw className="size-3.5" />
                            <span>Try Again</span>
                        </button>
                    </div>
                ) : reviews.length === 0 ? (
                    <div className="border border-border bg-card p-12 text-center rounded-sm shadow-sm space-y-3">
                        <Star className="size-10 text-muted-foreground mx-auto stroke-1" />
                        <h3 className="text-base font-bold text-foreground">No reviews published yet</h3>
                        <p className="text-xs text-muted-foreground max-w-sm mx-auto">
                            Once your accepted collaborations reach completion, you can submit verified reviews for your creators here.
                        </p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {reviews.map((rev) => (
                            <div
                                key={rev.review_id}
                                className="border border-border bg-card p-5 rounded-sm shadow-sm space-y-3 hover:border-primary/50 transition-colors"
                            >
                                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border pb-3">
                                    <div className="flex items-center gap-3">
                                        <div className="size-12 overflow-hidden border border-border shrink-0 rounded-md bg-muted flex items-center justify-center font-bold text-sm text-muted-foreground">
                                            {getInitials(rev.creator_name)}
                                        </div>
                                        <div>
                                            <div className="flex items-center gap-2">
                                                <h3 className="text-sm font-bold text-foreground">
                                                    {rev.creator_name}
                                                </h3>
                                                <span className="text-xs text-muted-foreground font-mono">
                                                    REQ-{rev.request_id}
                                                </span>
                                            </div>
                                            <div className="text-xs text-muted-foreground">
                                                Collab: <strong className="text-foreground capitalize">{rev.collab_type}</strong> &bull; {rev.deliverables || 'Completed Collaboration'}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-3">
                                        <div className="flex text-primary text-sm">
                                            {'★'.repeat(rev.rating)}
                                        </div>
                                        <span className="text-xs text-muted-foreground">
                                            {new Date(rev.created_at).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                                        </span>
                                    </div>
                                </div>

                                <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed italic">
                                    &ldquo;{rev.comment}&rdquo;
                                </p>

                                <div className="flex items-center justify-between text-xs pt-2 border-t border-border text-muted-foreground">
                                    <div className="flex items-center gap-1.5 font-semibold text-primary">
                                        <CheckCircle2 className="size-3.5" />
                                        <span>Verified Collaboration Review</span>
                                    </div>
                                    <span className="font-bold text-foreground">
                                        {rev.offered_amount ? `₹${Number(rev.offered_amount).toLocaleString()}` : 'Barter Deal'}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </main>
    )
}
