'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import {
    Bookmark,
    ChevronRight,
    ExternalLink,
    Rocket,
    Send,
    ShieldCheck,
    Store,
    TrendingUp,
    Users,
    Loader2,
    AlertCircle,
    RefreshCw,
} from 'lucide-react'

interface DashboardStats {
    active_requests?: number
    new_requests?: number
    accepted?: number
    accepted_collaborations?: number
    completed?: number
    completed_campaigns?: number
    shortlisted_count?: number
    total_spent?: number
    total_earnings?: number
    average_rating?: number
}

interface RequestItem {
    request_id: number
    creator_name: string
    creator_handle: string | null
    offer_details: string
    deliverables: string | null
    collab_type: string
    offered_amount: number
    status: string
    deadline: string
}

interface RecommendedCreator {
    id: number
    creator_id: number
    name: string
    full_name: string
    handle: string
    location: string
    area_name?: string
    taluka?: string
    tags: string[]
    categories?: { category_name: string }[]
    reach: string
    engagement: string
    baseRate: string
    min_paid_rate?: number
}

export default function BusinessDashboardPage() {
    const [stats, setStats] = useState<DashboardStats>({})
    const [requests, setRequests] = useState<RequestItem[]>([])
    const [recommendations, setRecommendations] = useState<RecommendedCreator[]>([])
    const [savedBookmarks, setSavedBookmarks] = useState<Record<number, boolean>>({})
    const [businessProfile, setBusinessProfile] = useState<{ name: string; location: string }>({
        name: 'Café Palmeira (Demo Fictional)',
        location: 'Calangute, North Goa · Verified Partner · Peak Season',
    })
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    const loadData = async () => {
        setLoading(true)
        setError(null)
        try {
            const [statsRes, reqRes, recRes, shortRes, meRes] = await Promise.all([
                fetch('/api/dashboard/stats', { credentials: 'include' }),
                fetch('/api/requests?limit=5', { credentials: 'include' }),
                fetch('/api/creators/featured', { credentials: 'include' }),
                fetch('/api/shortlist', { credentials: 'include' }),
                fetch('/api/auth/me', { credentials: 'include' }),
            ])

            if (statsRes.ok) {
                const sData = await statsRes.json()
                setStats(sData.data || {})
            }

            if (reqRes.ok) {
                const rData = await reqRes.json()
                setRequests(rData.data || [])
            }

            if (recRes.ok) {
                const cData = await recRes.json()
                const rawList: Record<string, unknown>[] = cData.data || []
                const parsed: RecommendedCreator[] = rawList.slice(0, 3).map((r) => {
                    const cid = Number(r.creator_id || r.id)
                    const tags = Array.isArray(r.categories)
                        ? (r.categories as { category_name: string }[]).map((c) => c.category_name)
                        : [String(r.niche || 'General')]
                    return {
                        id: cid,
                        creator_id: cid,
                        name: String(r.full_name || r.name || 'Creator'),
                        full_name: String(r.full_name || r.name || 'Creator'),
                        handle: String(r.handle || `@creator_${cid}`),
                        location: r.area_name ? `${r.area_name}, ${r.taluka || 'Goa'}` : String(r.location || 'North Goa'),
                        tags: tags.slice(0, 2),
                        reach: String(r.followers || '45K'),
                        engagement: `${r.engagementRate || r.avg_engagement_rate || '6.5'}%`,
                        baseRate: r.min_paid_rate ? `₹${Number(r.min_paid_rate).toLocaleString()} / collab` : '₹5,000 / collab',
                    }
                })
                setRecommendations(parsed)
            }

            if (shortRes.ok) {
                const sData = await shortRes.json()
                const bookmarkMap: Record<number, boolean> = {}
                if (Array.isArray(sData.data)) {
                    sData.data.forEach((item: { creator_id: number }) => {
                        bookmarkMap[item.creator_id] = true
                    })
                }
                setSavedBookmarks(bookmarkMap)
            }

            if (meRes.ok) {
                const mData = await meRes.json()
                const p = mData.data?.profile
                if (p?.business_name) {
                    setBusinessProfile({
                        name: p.business_name,
                        location: p.area_name ? `${p.area_name}, ${p.taluka} · Verified Partner · Peak Season` : 'North Goa · Verified Partner · Peak Season',
                    })
                }
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Dashboard load error')
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        loadData()
    }, [])

    const toggleBookmark = async (creatorId: number) => {
        const currentlySaved = !!savedBookmarks[creatorId]
        setSavedBookmarks((prev) => ({ ...prev, [creatorId]: !currentlySaved }))

        try {
            if (currentlySaved) {
                await fetch(`/api/shortlist/${creatorId}`, { method: 'DELETE' })
            } else {
                await fetch('/api/shortlist', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ creator_id: creatorId }),
                })
            }
        } catch (err) {
            console.error('Failed to update bookmark:', err)
            // Revert state on error
            setSavedBookmarks((prev) => ({ ...prev, [creatorId]: currentlySaved }))
        }
    }

    const statCards = [
        {
            title: 'Active Collaborations',
            value: `${stats.accepted || stats.accepted_collaborations || 0} Ongoing`,
            sub: 'Accepted collaborations awaiting production',
            icon: Rocket,
        },
        {
            title: 'Total Creators Booked',
            value: `${stats.completed || stats.completed_campaigns || 0} Deals`,
            sub: 'Completed campaigns',
            icon: Users,
        },
        {
            title: 'Campaign Value Secured',
            value: `₹${(stats.total_spent || stats.total_earnings || 0).toLocaleString()}`,
            sub: 'Completed collaboration volume',
            icon: ShieldCheck,
        },
        {
            title: 'Avg Creator Rating',
            value: `${stats.average_rating || 5.0} / 5`,
            sub: 'Average feedback rating',
            icon: TrendingUp,
        },
    ]

    const getStatusLabel = (status: string) => {
        if (status === 'rejected') return 'DECLINED'
        return status.toUpperCase()
    }

    return (
        <main className="space-y-10">
            {/* 1. Header Banner */}
            <div className="border border-border bg-card p-6 rounded-sm shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="space-y-1.5">
                    <div className="flex items-center gap-2">
                        <Store className="size-5 text-primary" />
                        <h1 className="text-xl sm:text-2xl font-bold text-foreground tracking-tight">
                            Welcome back, {businessProfile.name}
                        </h1>
                    </div>
                    <p className="text-sm text-muted-foreground">
                        {businessProfile.location}
                    </p>
                </div>

                <div className="flex items-center gap-3">
                    <Link
                        href="/business/discover"
                        className="bg-primary hover:bg-primary/90 text-primary-foreground font-medium text-sm px-5 py-3 flex items-center gap-2 transition-colors rounded-sm shadow-sm"
                    >
                        <span>Discover Creators</span>
                        <ChevronRight className="size-4" />
                    </Link>

                    <Link
                        href="/business/requests"
                        className="border border-border bg-background hover:bg-muted font-medium text-sm px-4 py-3 flex items-center gap-2 transition-colors text-foreground rounded-sm"
                    >
                        <Send className="size-4" />
                        <span>View Requests</span>
                    </Link>
                </div>
            </div>

            {loading ? (
                <div className="border border-border bg-card p-12 text-center rounded-sm shadow-sm flex flex-col items-center justify-center space-y-3">
                    <Loader2 className="size-8 text-primary animate-spin" />
                    <p className="text-sm text-muted-foreground">Loading dashboard analytics...</p>
                </div>
            ) : error ? (
                <div className="border border-destructive/20 bg-destructive/5 p-6 rounded-sm text-center space-y-3">
                    <AlertCircle className="size-8 text-destructive mx-auto" />
                    <p className="text-sm font-semibold text-destructive">{error}</p>
                    <button
                        type="button"
                        onClick={loadData}
                        className="inline-flex items-center gap-2 bg-background border border-border px-4 py-2 text-xs font-bold hover:bg-muted rounded-sm transition-colors cursor-pointer"
                    >
                        <RefreshCw className="size-3.5" />
                        <span>Try Again</span>
                    </button>
                </div>
            ) : (
                <>
                    {/* 2. Stat KPI Cards */}
                    <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                        {statCards.map((card) => {
                            const Icon = card.icon
                            return (
                                <div
                                    key={card.title}
                                    className="border border-border bg-card p-5 space-y-2 rounded-sm shadow-sm"
                                >
                                    <div className="flex items-start justify-between gap-2">
                                        <div className="space-y-0.5">
                                            <span className="text-[10px] font-bold uppercase text-muted-foreground tracking-wider block">
                                                {card.title}
                                            </span>
                                            <span className="text-[10px] text-muted-foreground block">{card.sub}</span>
                                        </div>
                                        <div className="size-8 flex items-center justify-center rounded-md border border-border bg-background">
                                            <Icon className="size-4 text-primary" />
                                        </div>
                                    </div>
                                    <div className="text-2xl sm:text-3xl font-black text-foreground tracking-tight pt-1">
                                        {card.value}
                                    </div>
                                </div>
                            )
                        })}
                    </section>

                    {/* 3. Active Collaboration Workflow */}
                    <section className="border border-border bg-card p-6 rounded-sm shadow-sm space-y-6">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border pb-4">
                            <div>
                                <h2 className="text-sm font-bold text-foreground">Recent Collaboration Requests</h2>
                                <p className="text-xs text-muted-foreground">
                                    Campaign briefs, dates, and status milestones
                                </p>
                            </div>

                            <Link
                                href="/business/requests"
                                className="text-xs font-bold text-primary hover:underline flex items-center gap-1"
                            >
                                <span>Manage All Requests ({requests.length})</span>
                                <ChevronRight className="size-3.5" />
                            </Link>
                        </div>

                        <div className="space-y-3">
                            {requests.length === 0 ? (
                                <div className="border border-border bg-muted/30 p-8 rounded-sm text-center">
                                    <p className="text-sm text-muted-foreground">No active collaboration requests.</p>
                                </div>
                            ) : (
                                requests.map((row) => (
                                    <div
                                        key={row.request_id}
                                        className="border border-border p-4 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:border-primary/50 transition-colors bg-background"
                                    >
                                        <div className="flex items-center gap-3.5 flex-1 min-w-0">
                                            <div className="size-10 shrink-0 rounded-sm bg-primary text-primary-foreground flex items-center justify-center font-bold text-xs border border-primary/20">
                                                {row.creator_name.split(' ').map((n) => n[0]).slice(0, 2).join('')}
                                            </div>
                                            <div className="min-w-0 flex-1">
                                                <div className="flex items-center gap-2">
                                                    <h3 className="text-sm font-bold text-foreground truncate">
                                                        {row.creator_name}
                                                    </h3>
                                                    <span className="text-xs text-muted-foreground font-mono">
                                                        {row.creator_handle ? `@${row.creator_handle.replace(/^@/, '')}` : `@creator_${row.request_id}`}
                                                    </span>
                                                </div>
                                                <p className="text-xs text-muted-foreground truncate">
                                                    {row.offer_details || row.deliverables || 'Collaboration Proposal'}
                                                </p>
                                            </div>
                                        </div>

                                        <div className="flex flex-wrap items-center gap-3 self-start md:self-auto shrink-0">
                                            <span className="text-xs text-muted-foreground font-medium">
                                                {row.collab_type === 'barter' ? 'Barter' : `₹${Number(row.offered_amount || 0).toLocaleString()}`}
                                            </span>

                                            <span className="text-[10px] font-bold px-2 py-0.5 uppercase tracking-wider border border-primary/20 text-primary bg-primary/5">
                                                {getStatusLabel(row.status)}
                                            </span>

                                            <span className="text-xs text-muted-foreground">
                                                Deadline: {new Date(row.deadline).toLocaleDateString()}
                                            </span>

                                            <Link
                                                href={`/business/discover?q=${encodeURIComponent(row.creator_name)}`}
                                                className="border border-border bg-background hover:bg-muted text-foreground text-xs font-bold px-3 py-1.5 transition-colors flex items-center gap-1 rounded-sm"
                                            >
                                                <span>View Creator</span>
                                                <ExternalLink className="size-3" />
                                            </Link>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </section>

                    {/* 4. Curated Recommendations */}
                    <section className="border border-border bg-card p-6 rounded-sm shadow-sm space-y-4">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-border pb-3">
                            <div>
                                <h2 className="text-sm font-bold text-foreground">Recommended Creators</h2>
                                <p className="text-xs text-muted-foreground">
                                    Verified Goan creators across food, hospitality, and coastal culture
                                </p>
                            </div>

                            <Link
                                href="/business/discover"
                                className="text-xs font-bold text-primary hover:underline flex items-center gap-1"
                            >
                                <span>Explore All</span>
                                <ChevronRight className="size-3.5" />
                            </Link>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                            {recommendations.map((creator) => {
                                const isShortlisted = !!savedBookmarks[creator.creator_id]

                                return (
                                    <div
                                        key={creator.creator_id}
                                        className="border border-border p-5 space-y-4 bg-background rounded-sm shadow-sm hover:border-primary/50 transition-colors flex flex-col justify-between"
                                    >
                                        <div className="space-y-3">
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-2.5">
                                                    <div className="size-9 shrink-0 rounded-sm bg-primary text-primary-foreground flex items-center justify-center font-bold text-xs border border-primary/20">
                                                        {creator.name.split(' ').map((n) => n[0]).slice(0, 2).join('')}
                                                    </div>
                                                    <div>
                                                        <h3 className="text-sm font-bold text-foreground">
                                                            {creator.name}
                                                        </h3>
                                                        <span className="text-xs text-muted-foreground block">
                                                            {creator.location}
                                                        </span>
                                                    </div>
                                                </div>

                                                <button
                                                    type="button"
                                                    onClick={() => toggleBookmark(creator.creator_id)}
                                                    aria-label="Bookmark creator"
                                                    className={`size-8 border flex items-center justify-center cursor-pointer transition-colors rounded-sm ${
                                                        isShortlisted
                                                            ? 'border-primary text-primary bg-primary/5'
                                                            : 'border-border text-muted-foreground hover:text-primary hover:border-primary/50'
                                                    }`}
                                                >
                                                    <Bookmark className={`size-4 ${isShortlisted ? 'fill-current' : ''}`} />
                                                </button>
                                            </div>

                                            <div className="flex flex-wrap gap-1.5">
                                                {creator.tags.map((tag) => (
                                                    <span
                                                        key={tag}
                                                        className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-muted border border-border text-muted-foreground"
                                                    >
                                                        {tag}
                                                    </span>
                                                ))}
                                            </div>

                                            <div className="grid grid-cols-2 gap-2 pt-1">
                                                <div className="p-2.5 rounded-sm bg-muted border border-border/60">
                                                    <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider block">
                                                        Reach
                                                    </span>
                                                    <span className="text-base font-extrabold text-foreground">
                                                        {creator.reach}
                                                    </span>
                                                </div>
                                                <div className="p-2.5 rounded-sm bg-muted border border-border/60">
                                                    <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider block">
                                                        Engagement
                                                    </span>
                                                    <span className="text-base font-extrabold text-primary">
                                                        {creator.engagement}
                                                    </span>
                                                </div>
                                            </div>

                                            <div className="p-2.5 rounded-sm bg-muted border border-border/60 flex items-center justify-between text-xs">
                                                <span className="font-bold text-muted-foreground uppercase text-[10px]">
                                                    Base Rate
                                                </span>
                                                <span className="font-extrabold text-foreground">
                                                    {creator.baseRate}
                                                </span>
                                            </div>
                                        </div>

                                        <Link
                                            href={`/business/discover?q=${encodeURIComponent(creator.name)}`}
                                            className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-medium text-xs py-2.5 flex items-center justify-center gap-2 transition-colors rounded-sm shadow-sm"
                                        >
                                            <Send className="size-3.5" />
                                            <span>Send Collab Request</span>
                                        </Link>
                                    </div>
                                )
                            })}
                        </div>
                    </section>
                </>
            )}
        </main>
    )
}
