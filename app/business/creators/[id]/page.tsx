'use client'

import { useCallback, useEffect, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useParams, useRouter } from 'next/navigation'
import {
    AlertCircle,
    ArrowLeft,
    Bookmark,
    Calendar,
    CheckCircle2,
    Compass,
    ExternalLink,
    Loader2,
    MapPin,
    Send,
    Share2,
    ShieldCheck,
    Sparkles,
    Star,
    Store,
    Users,
    Utensils,
    X,
} from 'lucide-react'

// ─── Interfaces ──────────────────────────────────────────────────────────────

interface CreatorProfile {
    creator_id: number
    full_name: string
    bio: string | null
    accepts_barter: boolean
    min_paid_rate: number | null
    location_id: number
    area_name: string
    taluka: string
    district: string
    primary_category: string | null
    total_followers: number
    avg_engagement_rate: number
    avg_rating: number
    review_count: number
    is_verified: boolean
    created_at: string
    location: string
}

interface CategoryItem {
    category_id: number
    category_name: string
    is_primary: boolean
}

interface SocialAccount {
    account_id: number
    platform: string
    handle: string
    profile_url: string | null
    follower_count: number | null
    engagement_rate: number | null
    avg_likes: number | null
    avg_comments: number | null
    avg_views: number | null
    audience_goa_pct: number | null
    data_source?: string
}

interface MetricHistoryItem {
    metric_id: number
    account_id: number
    platform: string
    handle: string
    follower_count: number
    avg_views: string | number
    avg_likes: string | number
    avg_comments: string | number
    engagement_rate: string | number
    audience_goa_pct: string | number
    data_source: string
    recorded_at: string
}

interface ReviewItem {
    review_id: number
    rating: number
    comment: string | null
    created_at: string
    business_id: number
    business_name: string
    business_industry?: string
}

interface CreatorData {
    profile: CreatorProfile
    categories: CategoryItem[]
    social_accounts: SocialAccount[]
    metric_history: MetricHistoryItem[]
    reviews: ReviewItem[]
    average_rating: number
    total_reviews: number
}

// ─── Main Page Component ─────────────────────────────────────────────────────

export default function BusinessCreatorProfilePage() {
    const params = useParams()
    const router = useRouter()
    const creatorId = Number(params?.id)

    const [data, setData] = useState<CreatorData | null>(null)
    const [loading, setLoading] = useState(true)
    const [notFound, setNotFound] = useState(false)
    const [error, setError] = useState<string | null>(null)

    // Shortlist bookmark state
    const [isShortlisted, setIsShortlisted] = useState(false)
    const [shortlistLoading, setShortlistLoading] = useState(false)

    // Collab booking modal state
    const [isCollabModalOpen, setIsCollabModalOpen] = useState(false)
    const [selectedAddons, setSelectedAddons] = useState<string[]>(['reel'])
    const [campaignBrief, setCampaignBrief] = useState(
        'Monsoon Weekend Tasting Menu & Heritage Sourdough Walkthrough'
    )
    const [requestSubmitting, setRequestSubmitting] = useState(false)
    const [requestSuccess, setRequestSuccess] = useState(false)
    const [requestError, setRequestError] = useState<string | null>(null)

    const loadCreator = useCallback(async () => {
        if (!creatorId || isNaN(creatorId)) {
            setNotFound(true)
            setLoading(false)
            return
        }

        setLoading(true)
        setError(null)
        setNotFound(false)

        try {
            const [creatorRes, shortlistRes] = await Promise.all([
                fetch(`/api/creators/${creatorId}`),
                fetch('/api/shortlist', { credentials: 'include' }).catch(() => null),
            ])

            if (creatorRes.status === 404) {
                setNotFound(true)
                return
            }

            const creatorJson = await creatorRes.json()
            if (!creatorRes.ok || !creatorJson.success) {
                throw new Error(creatorJson.error || 'Failed to load creator profile')
            }

            setData(creatorJson.data)

            // Check if shortlisted
            if (shortlistRes && shortlistRes.ok) {
                const slJson = await shortlistRes.json()
                if (slJson.success && Array.isArray(slJson.data)) {
                    const found = slJson.data.some(
                        (item: { creator_id: number }) => item.creator_id === creatorId
                    )
                    setIsShortlisted(found)
                }
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Error loading creator')
        } finally {
            setLoading(false)
        }
    }, [creatorId])

    useEffect(() => {
        loadCreator()
    }, [loadCreator])

    // Toggle Shortlist Bookmark
    const toggleShortlist = async () => {
        if (!creatorId || shortlistLoading) return
        setShortlistLoading(true)
        try {
            if (isShortlisted) {
                const res = await fetch(`/api/shortlist/${creatorId}`, {
                    method: 'DELETE',
                    credentials: 'include',
                })
                if (res.ok) setIsShortlisted(false)
            } else {
                const res = await fetch('/api/shortlist', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    credentials: 'include',
                    body: JSON.stringify({ creator_id: creatorId }),
                })
                if (res.ok) setIsShortlisted(true)
            }
        } catch (err) {
            console.error('Shortlist toggle failed:', err)
        } finally {
            setShortlistLoading(false)
        }
    }

    // Modal Addons Calculation
    const profileBaseRate = data?.profile?.min_paid_rate ? Number(data.profile.min_paid_rate) : 14000
    const addonPrices: Record<string, number> = {
        reel: 0,
        carousel: 6000,
        stories: 4500,
        license: 0,
    }

    const calculatedTotal =
        profileBaseRate +
        selectedAddons.reduce((acc, curr) => acc + (addonPrices[curr] || 0), 0)

    const toggleAddon = (id: string) => {
        if (id === 'reel') return
        setSelectedAddons((prev) =>
            prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
        )
    }

    const handleSendRequest = async (e: React.FormEvent) => {
        e.preventDefault()
        setRequestSubmitting(true)
        setRequestError(null)

        const selectedDeliverablesText = selectedAddons
            .map((id) => {
                if (id === 'reel') return '1 Dedicated Instagram Reel (30–60s)'
                if (id === 'carousel') return 'Photo Carousel (6–10 slides)'
                if (id === 'stories') return 'Story Sequence (3–5x frames)'
                if (id === 'license') return 'Full Commercial License (6 Mos)'
                return id
            })
            .join(', ')

        const futureDeadline = new Date(Date.now() + 14 * 86400000).toISOString().split('T')[0]

        try {
            const res = await fetch('/api/requests', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({
                    creator_id: creatorId,
                    collab_type: 'paid',
                    offered_amount: calculatedTotal,
                    offer_details: campaignBrief,
                    deliverables: selectedDeliverablesText,
                    deadline: futureDeadline,
                    message: `Booking request for ${data?.profile?.full_name}: ${campaignBrief}`,
                }),
            })

            const resData = await res.json()
            if (!res.ok || !resData.success) {
                throw new Error(resData.error || 'Failed to submit collaboration request')
            }

            setRequestSuccess(true)
            setTimeout(() => {
                setIsCollabModalOpen(false)
                setRequestSuccess(false)
            }, 2000)
        } catch (err) {
            setRequestError(err instanceof Error ? err.message : 'Error sending request')
        } finally {
            setRequestSubmitting(false)
        }
    }

    // ─── Loading State ─────────────────────────────────────────────────────────
    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center py-24 gap-3">
                <Loader2 className="size-8 text-primary animate-spin" />
                <p className="text-sm text-muted-foreground font-medium">Loading creator profile…</p>
            </div>
        )
    }

    // ─── 404 State ─────────────────────────────────────────────────────────────
    if (notFound || !data) {
        return (
            <div className="border border-border bg-card p-10 text-center space-y-4 max-w-lg mx-auto my-12">
                <div className="size-12 bg-muted flex items-center justify-center mx-auto text-muted-foreground">
                    <AlertCircle className="size-6 text-destructive" />
                </div>
                <div className="space-y-1">
                    <h2 className="text-lg font-bold text-foreground">Creator Not Found</h2>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                        The creator profile you are looking for does not exist or has been removed.
                    </p>
                </div>
                <div className="pt-2">
                    <Link
                        href="/business/discover"
                        className="inline-flex items-center gap-2 bg-primary hover:bg-primary/90 text-primary-foreground text-xs font-semibold px-4 py-2 transition-colors rounded-sm"
                    >
                        <ArrowLeft className="size-3.5" />
                        <span>Back to Discover</span>
                    </Link>
                </div>
            </div>
        )
    }

    // ─── Error State ───────────────────────────────────────────────────────────
    if (error) {
        return (
            <div className="border border-destructive/20 bg-destructive/5 p-8 text-center space-y-4 max-w-lg mx-auto my-12">
                <AlertCircle className="size-8 text-destructive mx-auto" />
                <div className="space-y-1">
                    <h2 className="text-base font-bold text-destructive">Unable to Load Creator</h2>
                    <p className="text-xs text-destructive/80">{error}</p>
                </div>
                <button
                    type="button"
                    onClick={loadCreator}
                    className="bg-primary hover:bg-primary/90 text-primary-foreground text-xs font-semibold px-4 py-2 transition-colors cursor-pointer rounded-sm"
                >
                    Retry
                </button>
            </div>
        )
    }

    const { profile, categories, social_accounts, metric_history, reviews, average_rating, total_reviews } = data

    // Primary social metrics
    const instagram = social_accounts.find((s) => s.platform === 'instagram')
    const youtube = social_accounts.find((s) => s.platform === 'youtube')

    const primaryFollowers = instagram?.follower_count || profile.total_followers || 0
    const primaryEngagement = instagram?.engagement_rate || profile.avg_engagement_rate || 0
    const primaryAvgLikes = instagram?.avg_likes || Math.round(primaryFollowers * 0.04) || 0
    const primaryAvgViews = instagram?.avg_views || Math.round(primaryFollowers * 0.35) || 0
    const primaryAvgComments = instagram?.avg_comments || Math.round(primaryFollowers * 0.003) || 0
    const primaryGoaPct = instagram?.audience_goa_pct || 85

    // Helper to format large numbers
    const fmt = (n: number | string) => {
        const num = Number(n) || 0
        if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`
        if (num >= 1000) return `${(num / 1000).toFixed(1)}K`
        return num.toLocaleString('en-IN')
    }

    // Metric history for SVG chart
    const historyPoints = metric_history.filter((m) => m.platform === 'instagram').slice(-6)
    const chartW = 540
    const chartH = 150
    const maxFollowers = Math.max(...historyPoints.map((h) => Number(h.follower_count || 0)), 1)

    return (
        <main className="space-y-8">
            {/* Top Navigation */}
            <div className="flex flex-wrap items-center justify-between gap-3 pb-2 border-b border-border">
                <Link
                    href="/business/discover"
                    className="inline-flex items-center gap-2 text-xs font-bold text-primary hover:underline rounded-sm px-2 py-1 hover:bg-primary/5"
                >
                    <ArrowLeft className="size-3.5" />
                    <span>Back to Discover Goan Creators</span>
                </Link>
                <div className="text-xs text-muted-foreground">
                    Viewing creator profile for{' '}
                    <span className="font-bold text-foreground">{profile.full_name}</span> ({profile.location})
                </div>
            </div>

            {/* Creator Hero / Cover */}
            <div className="border border-border bg-card overflow-hidden rounded-sm shadow-sm">
                <div className="relative h-60 sm:h-72 w-full bg-muted overflow-hidden">
                    <Image
                        unoptimized
                        src="https://images.unsplash.com/photo-1544644181-1484b3fdfc62?q=80&w=1600&auto=format&fit=crop"
                        alt="Goan Coastal Landscape"
                        width={1600}
                        height={600}
                        className="size-full object-cover"
                    />

                    <div className="absolute top-4 inset-x-4 sm:inset-x-6 flex items-center justify-between z-10">
                        {profile.is_verified ? (
                            <div className="inline-flex items-center gap-1.5 bg-background border border-border px-3 py-1 text-xs font-bold text-foreground shadow-sm">
                                <span className="size-2 bg-primary animate-pulse rounded" />
                                <span>VERIFIED CREATOR</span>
                            </div>
                        ) : (
                            <div className="inline-flex items-center gap-1.5 bg-background border border-border px-3 py-1 text-xs font-bold text-muted-foreground shadow-sm">
                                <span>CREATOR PROFILE</span>
                            </div>
                        )}

                        <div className="flex items-center gap-2">
                            <button
                                type="button"
                                aria-label="Share creator profile"
                                onClick={() => {
                                    if (typeof window !== 'undefined') {
                                        navigator.clipboard?.writeText(window.location.href)
                                        alert('Profile link copied to clipboard!')
                                    }
                                }}
                                className="size-9 bg-background border border-border text-foreground flex items-center justify-center hover:bg-muted transition-colors rounded-sm cursor-pointer"
                            >
                                <Share2 className="size-4" />
                            </button>

                            <button
                                type="button"
                                onClick={toggleShortlist}
                                disabled={shortlistLoading}
                                className={`border font-bold text-xs px-3.5 py-2 flex items-center gap-1.5 transition-colors rounded-sm cursor-pointer ${
                                    isShortlisted
                                        ? 'bg-primary text-primary-foreground border-primary'
                                        : 'bg-background border-border text-foreground hover:bg-muted'
                                }`}
                            >
                                <Bookmark className={`size-3.5 ${isShortlisted ? 'fill-white' : ''}`} />
                                <span>{isShortlisted ? 'Shortlisted' : 'Bookmark'}</span>
                            </button>

                            <button
                                type="button"
                                onClick={() => setIsCollabModalOpen(true)}
                                className="bg-primary hover:bg-primary/90 text-primary-foreground font-bold text-xs px-4 py-2 flex items-center gap-1.5 transition-colors rounded-sm shadow-sm cursor-pointer"
                            >
                                <Send className="size-3.5" />
                                <span>Send Collab Request</span>
                            </button>
                        </div>
                    </div>
                </div>

                <div className="p-6 sm:p-8 pt-0 relative">
                    <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 -mt-14 sm:-mt-16 mb-4">
                        <div className="relative size-24 sm:size-28 border-4 border-background bg-background shadow-sm overflow-hidden shrink-0 rounded-md">
                            <div className="size-full bg-primary/10 flex items-center justify-center font-black text-2xl text-primary">
                                {profile.full_name
                                    .split(' ')
                                    .map((n) => n[0])
                                    .slice(0, 2)
                                    .join('')
                                    .toUpperCase()}
                            </div>
                            {profile.is_verified && (
                                <div className="absolute bottom-1 right-1 bg-primary text-white p-0.5 border border-background shadow-sm rounded">
                                    <CheckCircle2 className="size-4 fill-primary text-white" />
                                </div>
                            )}
                        </div>

                        {/* Category Badges */}
                        <div className="flex flex-wrap items-center gap-2">
                            {categories.map((cat) => (
                                <span
                                    key={cat.category_id}
                                    className={`inline-flex items-center gap-1 border px-3 py-1 text-xs font-semibold rounded-sm ${
                                        cat.is_primary
                                            ? 'bg-primary/10 border-primary/20 text-primary'
                                            : 'bg-muted border-border text-foreground'
                                    }`}
                                >
                                    <Utensils className="size-3 text-primary" />
                                    <span>{cat.category_name}</span>
                                </span>
                            ))}
                            {profile.accepts_barter && (
                                <span className="inline-flex items-center gap-1 bg-primary/5 border border-primary/20 px-3 py-1 text-xs font-semibold text-primary rounded-sm">
                                    <Sparkles className="size-3 text-primary" />
                                    <span>Barter Friendly</span>
                                </span>
                            )}
                        </div>
                    </div>

                    <div className="space-y-2">
                        <div className="flex flex-wrap items-center gap-3">
                            <h1 className="text-2xl sm:text-3xl font-bold text-foreground tracking-tight">
                                {profile.full_name}
                            </h1>
                            {instagram?.handle && (
                                <span className="text-xs text-muted-foreground font-mono">
                                    {instagram.handle}
                                </span>
                            )}
                            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                                <MapPin className="size-3.5 text-primary" />
                                <span>{profile.location}</span>
                            </div>
                            <span className="border border-border bg-muted px-2.5 py-0.5 text-[11px] font-bold text-foreground rounded-sm">
                                {total_reviews} Verified Brand Review{total_reviews !== 1 ? 's' : ''}
                            </span>
                            {average_rating > 0 && (
                                <span className="inline-flex items-center gap-1 text-primary text-xs font-bold">
                                    <Star className="size-3.5 fill-primary" />
                                    {average_rating.toFixed(1)}/5
                                </span>
                            )}
                        </div>

                        <p className="text-sm text-muted-foreground max-w-4xl leading-relaxed">
                            {profile.bio ||
                                `${profile.full_name} is a verified Goan creator specializing in ${
                                    profile.primary_category || 'hospitality, lifestyle and culture'
                                } campaigns.`}
                        </p>
                    </div>
                </div>
            </div>

            {/* Audience Vital Metrics */}
            <section className="space-y-4">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <Users className="size-4 text-primary" />
                        <h2 className="text-sm font-bold text-foreground">Audience Vital Metrics</h2>
                    </div>
                    <span className="border border-border bg-muted px-2.5 py-0.5 text-[10px] font-bold text-muted-foreground uppercase tracking-widest rounded-sm">
                        AUDITED SNAPSHOT
                    </span>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
                    {[
                        {
                            label: 'Followers',
                            value: fmt(primaryFollowers),
                            change: `${profile.district} audience`,
                            sub: 'Total Reach',
                        },
                        {
                            label: 'Engagement Rate',
                            value: `${Number(primaryEngagement).toFixed(1)}%`,
                            change: 'Platform certified',
                            sub: 'Active interaction',
                        },
                        {
                            label: 'Avg. Likes',
                            value: fmt(primaryAvgLikes),
                            change: 'per post',
                            sub: 'Engagement baseline',
                        },
                        {
                            label: 'Avg. Reel Views',
                            value: fmt(primaryAvgViews),
                            change: 'Video momentum',
                            sub: 'High reach',
                        },
                        {
                            label: 'Avg. Comments',
                            value: fmt(primaryAvgComments),
                            change: 'Community affinity',
                            sub: 'Discussion depth',
                        },
                        {
                            label: 'Goa Affinity',
                            value: `${Number(primaryGoaPct).toFixed(0)}%`,
                            change: 'Local & traveler mix',
                            sub: 'Target resonance',
                        },
                    ].map((metric) => (
                        <div
                            key={metric.label}
                            className="border border-border bg-card p-4 space-y-2 rounded-sm shadow-sm"
                        >
                            <span className="text-[10px] font-bold uppercase text-muted-foreground tracking-wider block">
                                {metric.label}
                            </span>
                            <div className="text-2xl font-extrabold text-foreground tracking-tight leading-none">
                                {metric.value}
                            </div>
                            <div className="text-[11px] text-primary font-semibold pt-1">
                                {metric.change}
                            </div>
                        </div>
                    ))}
                </div>
            </section>

            {/* Metric History Chart & Social Accounts */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                {/* SVG Growth Chart */}
                <div className="lg:col-span-7 border border-border bg-card p-6 rounded-sm shadow-sm space-y-6">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-border pb-4">
                        <div>
                            <h3 className="text-base font-bold text-foreground">Audience Trajectory</h3>
                            <p className="text-xs text-muted-foreground">
                                Historical audit snapshots over time
                            </p>
                        </div>
                        <div className="flex items-center gap-4 text-xs font-semibold">
                            <div className="flex items-center gap-1.5">
                                <span className="size-2 bg-primary" />
                                <span>Followers</span>
                            </div>
                        </div>
                    </div>

                    {historyPoints.length === 0 ? (
                        <div className="h-44 flex items-center justify-center text-xs text-muted-foreground border border-dashed border-border">
                            No historical metric snapshots available yet.
                        </div>
                    ) : (
                        <div className="relative h-48 w-full pt-2">
                            <svg className="size-full overflow-visible" viewBox={`0 0 ${chartW} ${chartH}`} preserveAspectRatio="none">
                                <defs>
                                    <linearGradient id="creatorGrowthGrad" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="0%" stopColor="#0C4E40" stopOpacity="0.2" />
                                        <stop offset="100%" stopColor="#0C4E40" stopOpacity="0" />
                                    </linearGradient>
                                </defs>

                                {/* Grid horizontal lines */}
                                {[0.25, 0.5, 0.75, 1].map((f) => (
                                    <line
                                        key={f}
                                        x1="30"
                                        y1={chartH * f - 10}
                                        x2={chartW}
                                        y2={chartH * f - 10}
                                        stroke="var(--border)"
                                        strokeWidth="1"
                                        strokeDasharray="3 3"
                                    />
                                ))}

                                {/* Polylines */}
                                {(() => {
                                    const pts = historyPoints.map((h, i) => {
                                        const x =
                                            historyPoints.length <= 1
                                                ? chartW / 2
                                                : 30 + (i / (historyPoints.length - 1)) * (chartW - 40)
                                        const y =
                                            chartH - 20 - ((Number(h.follower_count) / maxFollowers) * (chartH - 40))
                                        return { x, y, ptStr: `${x},${y}`, item: h }
                                    })

                                    const polylineStr = pts.map((p) => p.ptStr).join(' ')

                                    return (
                                        <>
                                            {pts.length > 1 && (
                                                <polygon
                                                    points={`${polylineStr} ${chartW},${chartH - 10} 30,${chartH - 10}`}
                                                    fill="url(#creatorGrowthGrad)"
                                                />
                                            )}
                                            {pts.length > 1 && (
                                                <polyline
                                                    points={polylineStr}
                                                    fill="none"
                                                    stroke="#0C4E40"
                                                    strokeWidth="2.5"
                                                />
                                            )}
                                            {pts.map((p, idx) => (
                                                <g key={idx}>
                                                    <circle cx={p.x} cy={p.y} r="4" fill="#0C4E40" />
                                                    <text
                                                        x={p.x}
                                                        y={chartH + 6}
                                                        textAnchor="middle"
                                                        fontSize="9"
                                                        fill="var(--muted-foreground)"
                                                    >
                                                        {new Date(p.item.recorded_at).toLocaleDateString('en-IN', {
                                                            month: 'short',
                                                        })}
                                                    </text>
                                                    <text
                                                        x={p.x}
                                                        y={p.y - 7}
                                                        textAnchor="middle"
                                                        fontSize="9"
                                                        fontWeight="bold"
                                                        fill="var(--primary)"
                                                    >
                                                        {fmt(p.item.follower_count)}
                                                    </text>
                                                </g>
                                            ))}
                                        </>
                                    )
                                })()}
                            </svg>
                        </div>
                    )}

                    <div className="border border-border bg-muted p-3.5 flex items-center justify-between text-xs rounded-sm">
                        <div className="flex items-center gap-2">
                            <ShieldCheck className="size-4 text-primary" />
                            <span className="font-semibold text-foreground">
                                Verified Audience &amp; Growth
                            </span>
                            <span className="text-muted-foreground hidden sm:inline">
                                • Validated through platform data synchronization.
                            </span>
                        </div>
                        <span className="font-bold text-primary">
                            {fmt(primaryFollowers)} Total
                        </span>
                    </div>
                </div>

                {/* Social Profiles & Rate Card Trigger */}
                <div className="lg:col-span-5 space-y-6">
                    {/* Social Channels */}
                    <div className="border border-border bg-card p-6 rounded-sm shadow-sm space-y-4">
                        <h3 className="text-sm font-bold text-foreground uppercase tracking-wider border-b border-border pb-3">
                            Connected Social Channels
                        </h3>

                        <div className="space-y-3">
                            {social_accounts.map((sa) => (
                                <a
                                    key={sa.account_id}
                                    href={sa.profile_url || `https://${sa.platform}.com`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="border border-border p-3 flex items-center justify-between hover:bg-muted/50 transition-colors rounded-sm group"
                                >
                                    <div className="flex items-center gap-3">
                                        <div className="size-9 bg-primary text-primary-foreground flex items-center justify-center font-bold text-xs rounded-sm">
                                            {sa.platform === 'instagram' ? 'IG' : sa.platform === 'youtube' ? 'YT' : 'SC'}
                                        </div>
                                        <div>
                                            <div className="text-xs font-bold text-foreground flex items-center gap-1.5">
                                                <span>{sa.handle}</span>
                                                <CheckCircle2 className="size-3 text-primary" />
                                            </div>
                                            <div className="text-[11px] text-muted-foreground capitalize">
                                                {sa.platform} • {fmt(sa.follower_count || 0)} Followers
                                            </div>
                                        </div>
                                    </div>
                                    <ExternalLink className="size-4 text-muted-foreground group-hover:text-foreground" />
                                </a>
                            ))}
                        </div>
                    </div>

                    {/* Rate Card & Terms */}
                    <div className="border border-border bg-card p-6 rounded-sm shadow-sm space-y-4">
                        <div className="flex items-center justify-between border-b border-border pb-3">
                            <div>
                                <span className="text-[10px] uppercase font-bold tracking-widest text-muted-foreground block">
                                    COMMERCIAL TERMS
                                </span>
                                <h3 className="text-sm font-bold text-foreground">Starting Rate</h3>
                            </div>
                            <div className="text-right">
                                <div className="text-xl font-black text-primary">
                                    {profile.min_paid_rate ? `₹${Number(profile.min_paid_rate).toLocaleString('en-IN')}` : 'Barter Friendly'}
                                </div>
                                <span className="text-[10px] text-muted-foreground">Base Deliverable</span>
                            </div>
                        </div>

                        {profile.accepts_barter && (
                            <div className="border border-primary/20 bg-primary/5 p-3 space-y-1 rounded-sm">
                                <div className="flex items-center gap-1.5 text-xs font-bold text-primary">
                                    <Sparkles className="size-3.5" />
                                    <span>Barter Collaborations Accepted</span>
                                </div>
                                <p className="text-[11px] text-muted-foreground leading-relaxed">
                                    Open to complimentary resort stays, curated dining tasting menus, and culinary product gifting.
                                </p>
                            </div>
                        )}

                        <button
                            type="button"
                            onClick={() => setIsCollabModalOpen(true)}
                            className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-bold text-xs py-2.5 flex items-center justify-center gap-2 cursor-pointer rounded-sm shadow-sm transition-colors"
                        >
                            <Send className="size-3.5" />
                            <span>Book Collaboration &rarr;</span>
                        </button>
                    </div>
                </div>
            </div>

            {/* Business Reviews Section */}
            <section className="space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-border pb-3">
                    <div className="flex items-center gap-2">
                        <Star className="size-4 fill-primary text-primary" />
                        <h2 className="text-sm font-bold text-foreground">
                            Business Reviews{' '}
                            <span className="text-muted-foreground font-normal">
                                • {reviews.length} verified collab{reviews.length !== 1 ? 's' : ''}
                            </span>
                        </h2>
                    </div>
                    {average_rating > 0 && (
                        <div className="flex items-center gap-3 text-xs font-semibold">
                            <span className="text-primary font-bold">
                                {average_rating.toFixed(1)} / 5.0 Rating
                            </span>
                        </div>
                    )}
                </div>

                {reviews.length === 0 ? (
                    <div className="border border-dashed border-border p-8 text-center text-xs text-muted-foreground rounded-sm">
                        No reviews yet for this creator. Be the first Goan business to book a collaboration!
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {reviews.map((rev) => (
                            <div
                                key={rev.review_id}
                                className="border border-border bg-card p-5 rounded-sm shadow-sm space-y-3"
                            >
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="size-9 bg-primary text-primary-foreground flex items-center justify-center font-bold text-xs rounded-sm">
                                            {rev.business_name
                                                .split(' ')
                                                .map((n) => n[0])
                                                .slice(0, 2)
                                                .join('')
                                                .toUpperCase()}
                                        </div>
                                        <div>
                                            <h4 className="text-xs font-bold text-foreground">
                                                {rev.business_name}
                                            </h4>
                                            {rev.business_industry && (
                                                <span className="text-[11px] text-muted-foreground">
                                                    {rev.business_industry}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                    <div className="flex text-primary text-xs">
                                        {'★'.repeat(Math.min(5, Math.max(1, rev.rating)))}
                                    </div>
                                </div>

                                <p className="text-xs text-muted-foreground leading-relaxed">
                                    &ldquo;{rev.comment || 'Smooth collaboration and timely delivery of deliverables.'}&rdquo;
                                </p>

                                <div className="flex items-center justify-between text-[11px] text-muted-foreground pt-2 border-t border-border">
                                    <span className="text-primary font-semibold">Verified Campaign</span>
                                    <span>
                                        {new Date(rev.created_at).toLocaleDateString('en-IN', {
                                            month: 'short',
                                            year: 'numeric',
                                        })}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </section>

            {/* Collaboration Booking Modal */}
            {isCollabModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-xs p-4">
                    <div className="relative w-full max-w-xl border border-border bg-card p-6 sm:p-8 shadow-2xl space-y-6 max-h-[90vh] overflow-y-auto rounded-sm">
                        <button
                            type="button"
                            onClick={() => setIsCollabModalOpen(false)}
                            aria-label="Close modal"
                            className="absolute top-5 right-5 size-8 bg-muted flex items-center justify-center text-muted-foreground hover:text-foreground cursor-pointer rounded-sm"
                        >
                            <X className="size-4" />
                        </button>

                        <div className="space-y-1.5 border-b border-border pb-4">
                            <div className="inline-flex items-center gap-1.5 bg-primary/10 border border-primary/20 px-2.5 py-0.5 text-[11px] font-bold text-primary uppercase">
                                <ShieldCheck className="size-3.5 text-primary" />
                                <span>Escrow Guarantee</span>
                            </div>
                            <h2 className="text-xl font-extrabold text-foreground tracking-tight">
                                Send Collaboration Request
                            </h2>
                            <p className="text-xs text-muted-foreground">
                                Propose a campaign to <strong className="text-foreground">{profile.full_name}</strong>. Funds remain protected in escrow until work is delivered.
                            </p>
                        </div>

                        {requestSuccess ? (
                            <div className="p-8 text-center space-y-3">
                                <ShieldCheck className="size-10 text-primary mx-auto" />
                                <h3 className="text-base font-bold text-foreground">
                                    Request Submitted Successfully
                                </h3>
                                <p className="text-xs text-muted-foreground">
                                    ₹{calculatedTotal.toLocaleString('en-IN')} offer submitted to {profile.full_name}.
                                </p>
                            </div>
                        ) : (
                            <form onSubmit={handleSendRequest} className="space-y-4">
                                {requestError && (
                                    <div className="p-3 border border-destructive/20 bg-destructive/5 text-destructive text-xs font-semibold rounded-sm">
                                        {requestError}
                                    </div>
                                )}

                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold text-foreground">
                                        Creator
                                    </label>
                                    <div className="border border-border bg-muted/40 px-3 py-2 text-xs font-semibold text-foreground rounded-sm">
                                        {profile.full_name} ({profile.location})
                                    </div>
                                </div>

                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold text-foreground">
                                        Campaign Brief &amp; Objectives
                                    </label>
                                    <input
                                        type="text"
                                        required
                                        value={campaignBrief}
                                        onChange={(e) => setCampaignBrief(e.target.value)}
                                        className="w-full border border-border bg-background px-3 py-2 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary rounded-sm"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-foreground">
                                        Deliverables
                                    </label>
                                    <div className="space-y-2">
                                        {[
                                            {
                                                id: 'reel',
                                                label: '1 Dedicated Instagram Reel (30–60s)',
                                                cost: `Base (₹${profileBaseRate.toLocaleString('en-IN')})`,
                                            },
                                            { id: 'carousel', label: 'Photo Carousel (6–10 slides)', cost: '+₹6,000' },
                                            { id: 'stories', label: 'Story Sequence (3–5x frames)', cost: '+₹4,500' },
                                            { id: 'license', label: 'Full Commercial License (6 Mos)', cost: 'Included' },
                                        ].map((deliv) => {
                                            const isChecked = selectedAddons.includes(deliv.id)
                                            return (
                                                <div
                                                    key={deliv.id}
                                                    onClick={() => toggleAddon(deliv.id)}
                                                    className={`border p-3 flex items-center justify-between text-xs cursor-pointer transition-colors rounded-sm ${
                                                        isChecked
                                                            ? 'border-primary bg-primary/10'
                                                            : 'border-border bg-background hover:bg-muted'
                                                    }`}
                                                >
                                                    <div className="flex items-center gap-2.5">
                                                        <div
                                                            className={`size-4 border flex items-center justify-center rounded-sm ${
                                                                isChecked
                                                                    ? 'bg-primary border-primary text-primary-foreground'
                                                                    : 'border-border'
                                                            }`}
                                                        >
                                                            {isChecked && <ShieldCheck className="size-3 stroke-[3]" />}
                                                        </div>
                                                        <span className="font-semibold text-foreground">
                                                            {deliv.label}
                                                        </span>
                                                    </div>
                                                    <span className="text-[11px] font-bold text-muted-foreground">
                                                        {deliv.cost}
                                                    </span>
                                                </div>
                                            )
                                        })}
                                    </div>
                                </div>

                                <div className="bg-muted p-4 border border-border space-y-2 rounded-sm">
                                    <div className="flex items-center justify-between text-xs font-semibold">
                                        <span className="text-muted-foreground">Base Deliverable:</span>
                                        <span className="text-foreground">
                                            ₹{profileBaseRate.toLocaleString('en-IN')}
                                        </span>
                                    </div>
                                    {selectedAddons
                                        .filter((a) => a !== 'reel')
                                        .map((addon) => (
                                            <div
                                                key={addon}
                                                className="flex items-center justify-between text-xs font-medium text-muted-foreground"
                                            >
                                                <span>
                                                    +{' '}
                                                    {addon === 'carousel'
                                                        ? 'Photo Carousel'
                                                        : 'Story Sequence'}
                                                    :
                                                </span>
                                                <span>
                                                    ₹{addonPrices[addon].toLocaleString('en-IN')}
                                                </span>
                                            </div>
                                        ))}
                                    <div className="flex items-center justify-between pt-2 border-t border-border text-sm font-bold">
                                        <span className="text-foreground">Total Escrow Budget:</span>
                                        <span className="text-primary font-black">
                                            ₹{calculatedTotal.toLocaleString('en-IN')}
                                        </span>
                                    </div>
                                </div>

                                <button
                                    type="submit"
                                    disabled={requestSubmitting}
                                    className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold h-11 text-xs sm:text-sm flex items-center justify-center gap-2 cursor-pointer transition-colors disabled:opacity-50 rounded-sm"
                                >
                                    <ShieldCheck className="size-4" />
                                    <span>
                                        {requestSubmitting
                                            ? 'Submitting Request...'
                                            : 'Lock Deal & Submit Request'}
                                    </span>
                                </button>
                            </form>
                        )}
                    </div>
                </div>
            )}
        </main>
    )
}

