'use client'

import { useEffect, useState } from 'react'
import {
    AlertCircle,
    Building2,
    CheckCircle2,
    Handshake,
    Loader2,
    ShieldAlert,
    Star,
    TrendingUp,
    Users,
} from 'lucide-react'

interface AdminKpis {
    total_creators: number
    total_businesses: number
    total_requests: number
    completed_deals: number
    pending_verifications: number
    total_users: number
    verified_users: number
    total_completed_deal_volume: number
    platform_avg_rating: number
}

interface CategoryRow {
    category_name: string
    creator_count: number
}

interface VelocityRow {
    month: string
    request_count: number
}

interface TopCreatorRow {
    creator_id: number
    full_name: string
    handle: string
    taluka: string
    completed_campaigns: number
    avg_rating: number
}

interface TopBusinessRow {
    business_id: number
    business_name: string
    taluka: string
    total_requests: number
    completed_requests: number
}

interface DashboardData {
    kpis: AdminKpis
    category_distribution: CategoryRow[]
    request_velocity: VelocityRow[]
    top_creators: TopCreatorRow[]
    top_businesses: TopBusinessRow[]
}

function TrustBadge({ score }: { score: number }) {
    if (score >= 75)
        return (
            <span className="px-2 py-0.5 text-[10px] font-bold uppercase border border-primary/30 bg-primary/10 text-primary">
                LOW
            </span>
        )
    if (score >= 45)
        return (
            <span className="px-2 py-0.5 text-[10px] font-bold uppercase border border-warning/30 bg-warning/10 text-warning">
                MEDIUM
            </span>
        )
    return (
        <span className="px-2 py-0.5 text-[10px] font-bold uppercase border border-destructive/30 bg-destructive/10 text-destructive">
            HIGH
        </span>
    )
}

export default function AdminOverviewPage() {
    const [data, setData] = useState<DashboardData | null>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        fetch('/api/admin/dashboard')
            .then((r) => r.json())
            .then((d) => {
                if (d.success) setData(d.data)
                else setError(d.error || 'Failed to load dashboard data')
            })
            .catch((e) => setError(e.message || 'Network error'))
            .finally(() => setLoading(false))
    }, [])

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center py-24 gap-3">
                <Loader2 className="size-8 text-primary animate-spin" />
                <p className="text-sm text-muted-foreground">Loading admin dashboard…</p>
            </div>
        )
    }

    if (error) {
        return (
            <div className="flex flex-col items-center justify-center py-24 gap-3">
                <AlertCircle className="size-8 text-destructive" />
                <p className="text-sm text-destructive font-semibold">{error}</p>
                <button
                    onClick={() => window.location.reload()}
                    className="text-xs font-bold text-primary hover:underline"
                >
                    Retry
                </button>
            </div>
        )
    }

    const kpis = data?.kpis
    const velocity = data?.request_velocity ?? []
    const categories = data?.category_distribution ?? []
    const topCreators = data?.top_creators ?? []
    const topBusinesses = data?.top_businesses ?? []

    // Compute chart values
    const maxVel = Math.max(...velocity.map((v) => Number(v.request_count || 0)), 1)
    const maxCat = Math.max(...categories.map((c) => Number(c.creator_count || 0)), 1)

    // SVG line chart for velocity (simple polyline)
    const chartW = 560
    const chartH = 160
    const velPoints = velocity.slice(-6)
    const svgPoints = velPoints.map((v, i) => {
        const x = velPoints.length <= 1 ? chartW / 2 : (i / (velPoints.length - 1)) * chartW
        const y = chartH - ((Number(v.request_count) / maxVel) * (chartH - 20) + 10)
        return `${x},${y}`
    })
    const polylineStr = svgPoints.join(' ')

    return (
        <main className="space-y-8">
            {/* Page Header */}
            <div className="space-y-1">
                <div className="flex items-center gap-2">
                    <span className="inline-flex items-center gap-1.5 bg-primary/10 border border-primary/20 px-2.5 py-0.5 text-[10px] font-bold text-primary uppercase tracking-wider">
                        <ShieldAlert className="size-3" />
                        ADMIN OVERVIEW
                    </span>
                </div>
                <h1 className="text-2xl sm:text-3xl font-black text-foreground tracking-tight">
                    Platform Control Center
                </h1>
                <p className="text-sm text-muted-foreground">
                    GoaConnect platform-wide metrics, verification queue, and ecosystem health.
                </p>
            </div>

            {/* KPI Cards */}
            <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
                {[
                    {
                        title: 'Total Creators',
                        value: kpis?.total_creators ?? 0,
                        icon: Users,
                        sub: `${kpis?.verified_users ?? 0} verified`,
                    },
                    {
                        title: 'Businesses',
                        value: kpis?.total_businesses ?? 0,
                        icon: Building2,
                        sub: 'Registered on platform',
                    },
                    {
                        title: 'Total Requests',
                        value: kpis?.total_requests ?? 0,
                        icon: TrendingUp,
                        sub: 'All-time collab requests',
                    },
                    {
                        title: 'Completed Deals',
                        value: kpis?.completed_deals ?? 0,
                        icon: Handshake,
                        sub: `₹${Number(kpis?.total_completed_deal_volume ?? 0).toLocaleString()} volume`,
                    },
                    {
                        title: 'Pending Verifications',
                        value: kpis?.pending_verifications ?? 0,
                        icon: ShieldAlert,
                        sub: 'Accounts + metrics',
                        highlight: true,
                    },
                ].map((card) => {
                    const Icon = card.icon
                    return (
                        <div key={card.title} className="border border-border bg-card p-5">
                            <div className="flex items-center justify-between">
                                <div
                                    className={`size-8 flex items-center justify-center ${
                                        card.highlight
                                            ? 'bg-warning/10 border border-warning/20'
                                            : 'bg-primary/10 border border-primary/10'
                                    }`}
                                >
                                    <Icon
                                        className={`size-4 ${card.highlight ? 'text-warning' : 'text-primary'}`}
                                    />
                                </div>
                                {card.highlight && card.value > 0 && (
                                    <span className="inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-bold bg-warning/10 text-warning border border-warning/20">
                                        ACTION NEEDED
                                    </span>
                                )}
                            </div>
                            <div className="text-2xl sm:text-3xl font-black text-foreground mt-3 tracking-tight">
                                {Number(card.value).toLocaleString()}
                            </div>
                            <div className="text-[10px] font-bold text-foreground uppercase tracking-wider mt-1">
                                {card.title}
                            </div>
                            <div className="text-[11px] text-muted-foreground mt-0.5">{card.sub}</div>
                        </div>
                    )
                })}
            </section>

            {/* Charts Row */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                {/* Request Velocity Line Chart */}
                <div className="lg:col-span-7 border border-border bg-card p-5">
                    <div className="flex items-center justify-between mb-4">
                        <div>
                            <h2 className="text-sm font-bold text-foreground">6-Month Request Velocity</h2>
                            <p className="text-[10px] text-muted-foreground uppercase tracking-wider mt-0.5">
                                Collaboration requests per month
                            </p>
                        </div>
                        <span className="text-[10px] font-bold text-muted-foreground uppercase">
                            {velPoints.length > 0
                                ? `${velPoints[0]?.month} → ${velPoints[velPoints.length - 1]?.month}`
                                : 'No data'}
                        </span>
                    </div>

                    {velPoints.length === 0 ? (
                        <div className="h-40 flex items-center justify-center text-xs text-muted-foreground border border-dashed border-border">
                            No velocity data available
                        </div>
                    ) : (
                        <div className="relative h-40">
                            <svg
                                viewBox={`0 0 ${chartW} ${chartH}`}
                                className="w-full h-full"
                                preserveAspectRatio="none"
                            >
                                <defs>
                                    <linearGradient id="velGrad" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="0%" stopColor="#0C4E40" stopOpacity="0.18" />
                                        <stop offset="100%" stopColor="#0C4E40" stopOpacity="0" />
                                    </linearGradient>
                                </defs>
                                {/* Grid lines */}
                                {[0.25, 0.5, 0.75, 1].map((frac) => (
                                    <line
                                        key={frac}
                                        x1="0"
                                        y1={chartH * frac}
                                        x2={chartW}
                                        y2={chartH * frac}
                                        stroke="var(--border)"
                                        strokeWidth="1"
                                        strokeDasharray="4 4"
                                    />
                                ))}
                                {/* Fill area */}
                                {velPoints.length > 1 && (
                                    <polygon
                                        points={`${polylineStr} ${chartW},${chartH} 0,${chartH}`}
                                        fill="url(#velGrad)"
                                    />
                                )}
                                {/* Line */}
                                {velPoints.length > 1 && (
                                    <polyline
                                        points={polylineStr}
                                        fill="none"
                                        stroke="#0C4E40"
                                        strokeWidth="2"
                                    />
                                )}
                                {/* Points & labels */}
                                {velPoints.map((v, i) => {
                                    const x =
                                        velPoints.length <= 1
                                            ? chartW / 2
                                            : (i / (velPoints.length - 1)) * chartW
                                    const y =
                                        chartH - ((Number(v.request_count) / maxVel) * (chartH - 20) + 10)
                                    return (
                                        <g key={i}>
                                            <circle cx={x} cy={y} r="4" fill="#0C4E40" />
                                            <text
                                                x={x}
                                                y={chartH + 14}
                                                textAnchor="middle"
                                                fontSize="10"
                                                fill="var(--muted-foreground)"
                                            >
                                                {v.month?.slice(5) ?? ''}
                                            </text>
                                            <text
                                                x={x}
                                                y={y - 8}
                                                textAnchor="middle"
                                                fontSize="9"
                                                fill="var(--primary)"
                                                fontWeight="bold"
                                            >
                                                {v.request_count}
                                            </text>
                                        </g>
                                    )
                                })}
                                <line x1="0" y1={chartH} x2={chartW} y2={chartH} stroke="var(--border)" strokeWidth="1" />
                            </svg>
                        </div>
                    )}
                </div>

                {/* Category Distribution Bar Chart */}
                <div className="lg:col-span-5 border border-border bg-card p-5">
                    <div className="mb-4">
                        <h2 className="text-sm font-bold text-foreground">Category Distribution</h2>
                        <p className="text-[10px] text-muted-foreground uppercase tracking-wider mt-0.5">
                            Creators per niche
                        </p>
                    </div>
                    {categories.length === 0 ? (
                        <div className="flex items-center justify-center h-32 text-xs text-muted-foreground border border-dashed border-border">
                            No category data
                        </div>
                    ) : (
                        <div className="space-y-2.5">
                            {categories.slice(0, 7).map((cat) => {
                                const pct = Math.round((Number(cat.creator_count) / maxCat) * 100)
                                return (
                                    <div key={cat.category_name} className="space-y-1">
                                        <div className="flex items-center justify-between text-[11px]">
                                            <span className="font-semibold text-foreground truncate max-w-[70%]">
                                                {cat.category_name}
                                            </span>
                                            <span className="text-muted-foreground font-bold">
                                                {cat.creator_count}
                                            </span>
                                        </div>
                                        <div className="h-1.5 bg-muted w-full">
                                            <div
                                                className="h-full bg-primary transition-all"
                                                style={{ width: `${pct}%` }}
                                            />
                                        </div>
                                    </div>
                                )
                            })}
                        </div>
                    )}
                </div>
            </div>

            {/* Top Tables Row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Top Creators */}
                <div className="border border-border bg-card">
                    <div className="flex items-center justify-between p-5 border-b border-border">
                        <div>
                            <h2 className="text-sm font-bold text-foreground">Top Creators</h2>
                            <p className="text-[10px] text-muted-foreground uppercase tracking-wider">
                                By completed campaigns
                            </p>
                        </div>
                        <Star className="size-4 text-primary" />
                    </div>
                    {topCreators.length === 0 ? (
                        <div className="p-8 text-center text-xs text-muted-foreground">No creator data available</div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-xs border-collapse">
                                <thead>
                                    <tr className="border-b border-border text-muted-foreground">
                                        <th className="py-2.5 px-4 font-semibold">#</th>
                                        <th className="py-2.5 px-4 font-semibold">Creator</th>
                                        <th className="py-2.5 px-4 font-semibold">Location</th>
                                        <th className="py-2.5 px-4 font-semibold text-right">Campaigns</th>
                                        <th className="py-2.5 px-4 font-semibold text-right">Rating</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-border">
                                    {topCreators.map((creator, i) => (
                                        <tr key={creator.creator_id} className="hover:bg-muted/30">
                                            <td className="py-3 px-4 text-muted-foreground font-bold">
                                                {i + 1}
                                            </td>
                                            <td className="py-3 px-4">
                                                <div className="font-semibold text-foreground">
                                                    {creator.full_name}
                                                </div>
                                                {creator.handle && (
                                                    <div className="text-[10px] text-muted-foreground">
                                                        @{creator.handle}
                                                    </div>
                                                )}
                                            </td>
                                            <td className="py-3 px-4 text-muted-foreground">
                                                {creator.taluka || '—'}
                                            </td>
                                            <td className="py-3 px-4 text-right font-bold text-foreground">
                                                {creator.completed_campaigns ?? 0}
                                            </td>
                                            <td className="py-3 px-4 text-right">
                                                <span className="inline-flex items-center gap-0.5 text-primary font-bold">
                                                    <Star className="size-3 fill-primary" />
                                                    {Number(creator.avg_rating ?? 0).toFixed(1)}
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>

                {/* Top Businesses */}
                <div className="border border-border bg-card">
                    <div className="flex items-center justify-between p-5 border-b border-border">
                        <div>
                            <h2 className="text-sm font-bold text-foreground">Top Businesses</h2>
                            <p className="text-[10px] text-muted-foreground uppercase tracking-wider">
                                By total requests
                            </p>
                        </div>
                        <Building2 className="size-4 text-primary" />
                    </div>
                    {topBusinesses.length === 0 ? (
                        <div className="p-8 text-center text-xs text-muted-foreground">
                            No business data available
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-xs border-collapse">
                                <thead>
                                    <tr className="border-b border-border text-muted-foreground">
                                        <th className="py-2.5 px-4 font-semibold">#</th>
                                        <th className="py-2.5 px-4 font-semibold">Business</th>
                                        <th className="py-2.5 px-4 font-semibold">Location</th>
                                        <th className="py-2.5 px-4 font-semibold text-right">Requests</th>
                                        <th className="py-2.5 px-4 font-semibold text-right">Completed</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-border">
                                    {topBusinesses.map((biz, i) => (
                                        <tr key={biz.business_id} className="hover:bg-muted/30">
                                            <td className="py-3 px-4 text-muted-foreground font-bold">
                                                {i + 1}
                                            </td>
                                            <td className="py-3 px-4 font-semibold text-foreground">
                                                {biz.business_name}
                                            </td>
                                            <td className="py-3 px-4 text-muted-foreground">
                                                {biz.taluka || '—'}
                                            </td>
                                            <td className="py-3 px-4 text-right font-bold text-foreground">
                                                {biz.total_requests ?? 0}
                                            </td>
                                            <td className="py-3 px-4 text-right">
                                                <span className="inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-bold bg-primary/10 border border-primary/20 text-primary">
                                                    <CheckCircle2 className="size-3" />
                                                    {biz.completed_requests ?? 0}
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>
        </main>
    )
}
