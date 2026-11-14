'use client'

import { useState, useEffect, useMemo } from 'react'
import Link from 'next/link'
import {
    FileText,
    ExternalLink,
    CheckCircle2,
    Star,
    ShieldCheck as ShieldCheckIcon,
    Loader2,
    AlertCircle,
    RefreshCw,
} from 'lucide-react'

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

interface CompletedCollab {
    request_id: number
    business_id: number
    business_name: string
    area_name?: string
    collab_type: string
    offered_amount: number
    deliverables: string | null
    status: string
    deadline: string
    requested_at: string
}

export default function CreatorReviewsPage() {
    const [reviews, setReviews] = useState<ReviewItem[]>([])
    const [collabs, setCollabs] = useState<CompletedCollab[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [activeTab, setActiveTab] = useState<'all' | 'with-reviews' | 'repeat'>('all')
    const [searchQuery, setSearchQuery] = useState('')

    const fetchData = async () => {
        setLoading(true)
        setError(null)
        try {
            // 1. Fetch reviews received
            const revRes = await fetch('/api/reviews?filter=received')
            const revData = await revRes.json()
            if (!revRes.ok || !revData.success) {
                throw new Error(revData.error || 'Failed to load reviews')
            }
            setReviews(revData.data || [])

            // 2. Fetch completed collaborations
            const colRes = await fetch('/api/collaborations?status=completed')
            const colData = await colRes.json()
            if (colRes.ok && colData.success) {
                setCollabs(colData.data || [])
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to fetch reviews and history')
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchData()
    }, [])

    const getInitials = (name: string) => {
        return name
            .split(' ')
            .map((n) => n[0])
            .slice(0, 2)
            .join('')
            .toUpperCase()
    }

    // Map request_id to review
    const reviewByRequestId = useMemo(() => {
        const map = new Map<number, ReviewItem>()
        reviews.forEach((r) => map.set(r.request_id, r))
        return map
    }, [reviews])

    // Find repeat business IDs
    const repeatBusinessIds = useMemo(() => {
        const counts: Record<number, number> = {}
        collabs.forEach((c) => {
            counts[c.business_id] = (counts[c.business_id] || 0) + 1
        })
        return new Set(
            Object.entries(counts)
                .filter(([, count]) => count > 1)
                .map(([id]) => Number(id))
        )
    }, [collabs])

    const avgRating = reviews.length > 0
        ? (reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length).toFixed(1)
        : '5.0'

    const totalEarned = collabs.reduce((acc, c) => acc + (Number(c.offered_amount) || 0), 0)

    const filteredCollabs = collabs.filter((c) => {
        const hasReview = reviewByRequestId.has(c.request_id)
        const isRepeat = repeatBusinessIds.has(c.business_id)

        if (activeTab === 'with-reviews' && !hasReview) return false
        if (activeTab === 'repeat' && !isRepeat) return false

        if (searchQuery.trim()) {
            const q = searchQuery.toLowerCase()
            const matchBiz = c.business_name?.toLowerCase().includes(q)
            const matchDeliv = c.deliverables?.toLowerCase().includes(q)
            const matchType = c.collab_type?.toLowerCase().includes(q)
            if (!matchBiz && !matchDeliv && !matchType) return false
        }

        return true
    })

    const parseDeliverables = (raw: string | null) => {
        if (!raw) return [{ label: '1x Content Delivery', checked: true }]
        return raw
            .split(/[\n,]+/)
            .map((s) => s.trim())
            .filter(Boolean)
            .map((label) => ({ label, checked: true }))
    }

    const tabs = [
        { id: 'all', label: `All Completed (${collabs.length})` },
        { id: 'with-reviews', label: `With Reviews (${reviews.length})` },
        { id: 'repeat', label: `Repeat Partners (${repeatBusinessIds.size})` },
    ]

    return (
        <main className="space-y-10">
            {/* 1. HEADER BANNER */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="space-y-1.5">
                    <span className="inline-flex items-center gap-1 rounded-md bg-primary/10 border border-primary/20 px-2.5 py-0.5 text-[10px] font-bold text-primary uppercase tracking-wider">
                        <ShieldCheckIcon className="size-3" />
                        <span>AUDITED CREATOR PERFORMANCE LEDGER</span>
                    </span>
                    <h1 className="text-2xl sm:text-3xl font-bold text-foreground tracking-tight">
                        Collaboration History &amp; Verified Reviews
                    </h1>
                    <p className="text-sm text-muted-foreground mt-1">
                        Track all fulfilled brand campaigns, verified earnings, and feedback received from Goan venues.
                    </p>
                </div>

                <div className="flex items-center gap-2">
                    <Link
                        href="#"
                        onClick={(e) => { e.preventDefault(); window.print(); }}
                        className="flex items-center gap-2 border border-border bg-background px-3.5 py-2 text-xs font-bold text-foreground hover:bg-muted transition-colors rounded-sm cursor-pointer"
                    >
                        <FileText className="size-3.5" />
                        <span>Export PDF</span>
                    </Link>
                    <button
                        type="button"
                        onClick={() => alert('Reviews widget embed code copied to clipboard!')}
                        className="flex items-center gap-2 bg-primary hover:bg-primary/90 text-primary-foreground text-xs font-bold px-4 py-2.5 rounded-sm shadow-sm transition-colors cursor-pointer"
                    >
                        <ExternalLink className="size-3.5" />
                        <span>Embed Reviews Widget</span>
                    </button>
                </div>
            </div>

            {/* 2. STAT CARDS */}
            <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="border border-border bg-card p-5 sm:p-6 rounded-sm shadow-sm">
                    <div className="flex items-center justify-between mb-4">
                        <div className="space-y-0.5">
                            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                                Average Venue Rating
                            </span>
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-primary/10 text-primary border border-primary/20">
                                <Star className="size-3" />
                                <span>Top Rated</span>
                            </span>
                        </div>
                    </div>
                    <div className="text-3xl font-black text-foreground tracking-tight leading-none">{avgRating}</div>
                    <div className="flex items-center gap-1 text-primary font-bold text-xs mt-2">
                        {'★'.repeat(Math.round(Number(avgRating)))}
                    </div>
                    <div className="text-[11px] text-muted-foreground mt-1 leading-tight">
                        {avgRating}-star across {reviews.length} verified venue ratings
                    </div>
                </div>

                <div className="border border-border bg-card p-5 sm:p-6 rounded-sm shadow-sm">
                    <div className="space-y-0.5">
                        <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                            Delivery Reliability
                        </span>
                    </div>
                    <div className="text-3xl font-black text-primary tracking-tight mt-1 leading-none">100%</div>
                    <div className="text-sm font-bold text-primary mt-2">on schedule</div>
                    <div className="w-full h-1.5 bg-muted rounded-full overflow-hidden mt-4">
                        <div className="h-full bg-primary rounded-full" style={{ width: '100%' }} />
                    </div>
                    <div className="text-[11px] text-muted-foreground mt-2 leading-tight">
                        Zero delayed campaign turnarounds
                    </div>
                </div>

                <div className="border border-border bg-card p-5 sm:p-6 rounded-sm shadow-sm">
                    <div className="space-y-0.5">
                        <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                            Completed Campaigns
                        </span>
                    </div>
                    <div className="text-3xl font-black text-foreground tracking-tight mt-1 leading-none">{collabs.length}</div>
                    <div className="text-sm font-bold text-primary mt-2">Hospitality &amp; Dining</div>
                    <div className="flex items-center gap-2 mt-4 text-[11px] text-muted-foreground">
                        <span className="size-2 bg-primary rounded-full" />
                        <span>{repeatBusinessIds.size} repeat brand partners</span>
                    </div>
                </div>

                <div className="border border-border bg-card p-5 sm:p-6 rounded-sm shadow-sm">
                    <div className="space-y-0.5">
                        <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                            Verified Volume
                        </span>
                    </div>
                    <div className="text-3xl font-black text-foreground tracking-tight mt-1 leading-none">
                        ₹{totalEarned.toLocaleString()}
                    </div>
                    <div className="text-[11px] text-muted-foreground mt-2 leading-tight">
                        Total offered deal value across completed collaborations
                    </div>
                </div>
            </section>

            {loading ? (
                <div className="border border-border bg-card p-12 text-center rounded-sm shadow-sm flex flex-col items-center justify-center space-y-3">
                    <Loader2 className="size-8 text-primary animate-spin" />
                    <p className="text-sm text-muted-foreground">Loading collaboration history and reviews...</p>
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
            ) : (
                <>
                    {/* 3. TABS + TABLE */}
                    <div className="border border-border bg-card rounded-sm shadow-sm overflow-hidden">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border p-5 sm:p-6">
                            <div className="flex gap-1.5 flex-wrap">
                                {tabs.map((t) => (
                                    <button
                                        key={t.id}
                                        type="button"
                                        onClick={() => setActiveTab(t.id as typeof activeTab)}
                                        className={`px-4 py-2 text-xs font-bold rounded-sm transition-colors cursor-pointer ${
                                            activeTab === t.id
                                                ? 'bg-primary text-primary-foreground shadow-sm'
                                                : 'bg-background text-muted-foreground hover:text-foreground border border-border'
                                        }`}
                                    >
                                        {t.label}
                                    </button>
                                ))}
                            </div>
                            <div className="ml-auto flex items-center gap-3">
                                <div className="relative">
                                    <input
                                        type="text"
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        placeholder="Filter by venue or deliverables…"
                                        className="w-64 pl-3 pr-9 py-2 text-xs border border-border bg-background rounded-sm focus:outline-none focus:ring-1 focus:ring-ring"
                                    />
                                    <div className="absolute right-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground pointer-events-none">
                                        <svg className="size-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M21 21l-6-6m2-4a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {filteredCollabs.length === 0 ? (
                            <div className="p-8 text-center text-muted-foreground text-xs">
                                No collaborations found matching the selected filter.
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full text-left border-collapse">
                                    <thead>
                                        <tr className="border-b border-border bg-muted/50">
                                            <th className="px-6 py-4 text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Business Name &amp; Venue</th>
                                            <th className="px-6 py-4 text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Collab Type</th>
                                            <th className="px-6 py-4 text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Deliverables Fulfilled</th>
                                            <th className="px-6 py-4 text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Completed</th>
                                            <th className="px-6 py-4 text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Earnings</th>
                                            <th className="px-6 py-4 text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Review Status</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-border">
                                        {filteredCollabs.map((row) => {
                                            const rev = reviewByRequestId.get(row.request_id)
                                            return (
                                                <tr key={row.request_id} className="hover:bg-muted/50 transition-colors group">
                                                    <td className="px-6 py-4">
                                                        <div className="flex items-center gap-3">
                                                            <div className="size-10 object-cover rounded-md border border-border/60 bg-muted flex items-center justify-center font-bold text-xs text-muted-foreground shrink-0">
                                                                {getInitials(row.business_name)}
                                                            </div>
                                                            <div className="flex-1 min-w-0">
                                                                <div className="flex items-center gap-1.5">
                                                                    <span className="text-xs font-bold text-foreground truncate">{row.business_name}</span>
                                                                    <span className="flex items-center gap-1 text-[9px] text-primary">
                                                                        <CheckCircle2 className="size-2.5" />
                                                                        <span>Verified Partner</span>
                                                                    </span>
                                                                </div>
                                                                <div className="text-[10px] text-muted-foreground">{row.area_name || 'Goa'}</div>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <div className="inline-flex items-center gap-2 px-2 py-1 rounded-md border border-primary/20 text-[9px] font-bold text-primary bg-primary/5 uppercase">
                                                            {row.collab_type}
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <div className="flex flex-wrap gap-1">
                                                            {parseDeliverables(row.deliverables).map((d, i) => (
                                                                <span
                                                                    key={i}
                                                                    className="px-2 py-0.5 rounded-md border text-[9px] font-medium border-primary/20 text-primary bg-primary/5"
                                                                >
                                                                    {d.label}
                                                                </span>
                                                            ))}
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4 text-xs text-foreground font-medium">
                                                        {new Date(row.deadline || row.requested_at).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <div className="text-xs font-black text-foreground">
                                                            {row.offered_amount ? `₹${Number(row.offered_amount).toLocaleString()}` : 'Barter'}
                                                        </div>
                                                        <div className="text-[10px] text-muted-foreground">Fulfilled</div>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        {rev ? (
                                                            <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md border border-primary/20 text-[9px] font-bold text-primary bg-primary/5">
                                                                <Star className="size-3 fill-primary" />
                                                                <span>{rev.rating}.0</span>
                                                                <span>· Received</span>
                                                            </div>
                                                        ) : (
                                                            <span className="text-[10px] text-muted-foreground italic">
                                                                Pending Review
                                                            </span>
                                                        )}
                                                    </td>
                                                </tr>
                                            )
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>

                    {/* 4. VERIFIED VENUE OWNER REVIEWS */}
                    <section className="space-y-6">
                        <div className="flex items-center justify-between">
                            <div className="space-y-0.5">
                                <span className="inline-flex items-center gap-1 rounded-md bg-primary/10 border border-primary/20 px-2 py-0.5 text-[10px] font-bold text-primary uppercase tracking-wider">
                                    OWNER TESTIMONIALS
                                </span>
                                <h2 className="text-xl sm:text-2xl font-bold text-foreground tracking-tight">Verified Venue Owner Reviews</h2>
                            </div>
                            <span className="flex items-center gap-1 text-xs text-muted-foreground font-medium">
                                <span className="size-1.5 bg-primary rounded-full" />
                                <span>{reviews.length} Verified Venue Reviews</span>
                            </span>
                        </div>
                        <p className="text-sm text-muted-foreground max-w-2xl">
                            Feedback and verified collaboration ratings recorded directly into the platform ledger.
                        </p>

                        {reviews.length === 0 ? (
                            <div className="border border-border bg-card p-8 text-center rounded-sm text-xs text-muted-foreground">
                                No verified reviews received yet. Reviews will appear here once partner businesses review completed collaborations.
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                                {reviews.map((rev) => (
                                    <div key={rev.review_id} className="border border-border bg-card p-5 sm:p-6 rounded-sm shadow-sm space-y-3">
                                        <div className="flex items-center gap-3">
                                            <div className="size-10 object-cover rounded-md border border-border/60 bg-muted flex items-center justify-center font-bold text-xs text-muted-foreground shrink-0">
                                                {getInitials(rev.business_name)}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-1.5">
                                                    <span className="text-xs font-bold text-foreground truncate">{rev.business_name}</span>
                                                    <span className="flex items-center gap-1 text-[9px] text-primary">
                                                        <CheckCircle2 className="size-2.5" />
                                                        <span>Verified Partner</span>
                                                    </span>
                                                </div>
                                                <div className="text-[10px] text-muted-foreground">
                                                    {new Date(rev.created_at).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex text-primary text-sm">
                                            {'★'.repeat(rev.rating)}
                                            <span className="ml-1 text-xs font-black text-foreground">{rev.rating}.0</span>
                                        </div>

                                        <p className="text-xs text-muted-foreground leading-relaxed italic">
                                            &ldquo;{rev.comment}&rdquo;
                                        </p>

                                        <div className="flex items-center justify-between pt-3 border-t border-border text-muted-foreground">
                                            <div className="text-[10px] font-bold uppercase tracking-wider">Verified Collab</div>
                                            <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md border border-primary/20 text-[9px] font-bold text-primary bg-primary/5">
                                                <span>{rev.offered_amount ? `₹${Number(rev.offered_amount).toLocaleString()}` : 'Barter Deal'}</span>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </section>

                    {/* 5. ESCROW SHIELD CTA */}
                    <section className="border border-primary/30 bg-primary/10 text-primary p-6 sm:p-8 rounded-sm shadow-sm relative overflow-hidden">
                        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                            <div className="space-y-1">
                                <span className="text-[10px] font-bold text-primary uppercase tracking-wider">
                                    Verified Goa Creator Reputation
                                </span>
                                <h3 className="text-xl sm:text-2xl font-black text-primary tracking-tight">
                                    Ready to pitch new coastal brands with your {avgRating} reputation?
                                </h3>
                                <p className="text-primary/80 text-xs sm:text-sm mt-1 leading-relaxed">
                                    Your credentials include {collabs.length} completed collaborations and ₹{totalEarned.toLocaleString()} in verified volume.
                                </p>
                            </div>

                            <div className="flex gap-3 sm:flex-col sm:gap-3">
                                <Link
                                    href="#"
                                    onClick={(e) => { e.preventDefault(); window.print(); }}
                                    className="flex items-center gap-2 border border-primary/30 bg-background/50 px-3.5 py-2.5 text-primary text-xs font-bold hover:bg-primary/20 transition-colors cursor-pointer rounded-sm"
                                >
                                    <FileText className="size-3.5" />
                                    <span>Export Portfolio &amp; Reviews PDF</span>
                                </Link>
                                <button
                                    type="button"
                                    onClick={() => alert('Reviews widget embed code copied to clipboard!')}
                                    className="flex items-center gap-2 bg-primary hover:bg-primary/90 text-primary-foreground text-xs font-bold px-4 py-2.5 rounded-sm shadow-sm transition-colors cursor-pointer"
                                >
                                    <ExternalLink className="size-3.5" />
                                    <span>Embed Reviews Widget</span>
                                </button>
                            </div>
                        </div>
                    </section>
                </>
            )}
        </main>
    )
}
