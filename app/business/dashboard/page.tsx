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
} from 'lucide-react'

export default function BusinessDashboardPage() {
    const [stats, setStats] = useState<Record<string, unknown>>({})
    const [requests, setRequests] = useState<Record<string, unknown>[]>([])
    const [savedBookmarks, setSavedBookmarks] = useState<Record<string, boolean>>({})

    const toggleBookmark = (name: string) => {
        setSavedBookmarks((prev) => ({ ...prev, [name]: !prev[name] }))
    }

    useEffect(() => {
        const loadData = async () => {
            try {
                const [statsRes, reqRes] = await Promise.all([
                    fetch('/api/dashboard/stats', { credentials: 'include' }),
                    fetch('/api/requests?status=all', { credentials: 'include' }),
                ])
                if (statsRes.ok) {
                    const data = await statsRes.json()
                    setStats(data.data || {})
                }
                if (reqRes.ok) {
                    const data = await reqRes.json()
                    setRequests(data.data || [])
                }
            } catch (err) {
                console.error('Dashboard load error:', err)
            }
        }
        loadData()
    }, [])

    const statCards = [
        {
            title: 'Active Collaborations',
            value: `${stats.accepted_collaborations || 0} Ongoing`,
            sub: 'Accepted collaborations awaiting production',
            icon: Rocket,
        },
        {
            title: 'Total Creators Booked',
            value: `${stats.completed_campaigns || 0} Deals`,
            sub: 'Completed campaigns',
            icon: Users,
        },
        {
            title: 'Escrow Funds Secured',
            value: `₹${(stats.total_earnings || 0).toLocaleString()}`,
            sub: 'Protected until deliverables verified',
            icon: ShieldCheck,
        },
        {
            title: 'Avg Campaign Engagement',
            value: `${stats.average_rating || 0} / 5`,
            sub: 'Average creator rating',
            icon: TrendingUp,
        },
    ]

    const collabRows: { name: string; handle: string; desc: string; type: string; status: string; date: string }[] = requests.map((req) => {
        const r = req as {
            business_email: string
            objective: string
            compensation_type: string
            compensation_amount: number
            status: string
            deadline: string | null
        }
        return {
            name: r.business_email.split('@')[0] || 'Business',
            handle: `@${r.business_email.split('@')[0] || 'biz'}`,
            desc: r.objective,
            type: `${r.compensation_type.charAt(0).toUpperCase() + r.compensation_type.slice(1)} · ₹${r.compensation_amount}`,
            status: r.status.toUpperCase(),
            date: r.deadline ? `Deadline: ${r.deadline}` : 'No deadline',
        }
    })

    const recommendations = [
        {
            name: 'Sneha Fernandes',
            location: 'Assagao, North Goa',
            tags: ['Food & Dining', 'Monsoon Stays'],
            reach: '120K',
            engagement: '7.8%',
            baseRate: '₹8,000 / collab',
        },
        {
            name: 'Rahul Naik',
            location: 'Panjim, North Goa',
            tags: ['Café Culture', 'Cocktails'],
            reach: '85K',
            engagement: '9.2%',
            baseRate: '₹6,500 / collab',
        },
        {
            name: 'Alisha D\'Cruz',
            location: 'Fontainhas, North Goa',
            tags: ['Food Photography', 'Artisan Bakery'],
            reach: '68K',
            engagement: '8.4%',
            baseRate: '₹5,500 / collab',
        },
    ]

    return (
        <main className="space-y-10">
            {/* 1. Header Banner */}
            <div className="border border-border bg-card p-6 rounded-sm shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="space-y-1.5">
                    <div className="flex items-center gap-2">
                        <Store className="size-5 text-primary" />
                        <h1 className="text-xl sm:text-2xl font-bold text-foreground tracking-tight">
                            Welcome back, Café Palmeira
                        </h1>
                    </div>
                    <p className="text-sm text-muted-foreground">
                        Calangute, North Goa · Verified Partner · Peak Season
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
                        <h2 className="text-sm font-bold text-foreground">Active Collaborations</h2>
                        <p className="text-xs text-muted-foreground">
                            Campaign briefs, dates, and escrow milestones
                        </p>
                    </div>

                    <Link
                        href="/business/requests"
                        className="text-xs font-bold text-primary hover:underline flex items-center gap-1"
                    >
                        <span>Manage All Requests ({collabRows.length})</span>
                        <ChevronRight className="size-3.5" />
                    </Link>
                </div>

                <div className="space-y-3">
                    {collabRows.length === 0 ? (
                        <div className="border border-border bg-muted/30 p-8 rounded-sm text-center">
                            <p className="text-sm text-muted-foreground">No active collaborations.</p>
                        </div>
                    ) : (
                        collabRows.map((row) => (
                            <div
                                key={row.name}
                                className="border border-border p-4 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:border-primary/50 transition-colors bg-background"
                            >
                                <div className="flex items-center gap-3.5 flex-1 min-w-0">
                                    <div className="size-10 shrink-0 rounded-sm bg-primary text-primary-foreground flex items-center justify-center text-white font-bold text-xs border border-primary/20">
                                        {row.name.split(' ').map((n: string) => n[0]).join('')}
                                    </div>
                                    <div className="min-w-0 flex-1">
                                        <div className="flex items-center gap-2">
                                            <h3 className="text-sm font-bold text-foreground truncate">
                                                {row.name}
                                            </h3>
                                            <span className="text-xs text-muted-foreground font-mono">
                                                {row.handle}
                                            </span>
                                        </div>
                                        <p className="text-xs text-muted-foreground truncate">
                                            {row.desc}
                                        </p>
                                    </div>
                                </div>

                                <div className="flex flex-wrap items-center gap-3 self-start md:self-auto shrink-0">
                                    <span className="text-xs text-muted-foreground font-medium">
                                        {row.type}
                                    </span>

                                    <span className="text-[10px] font-bold px-2 py-0.5 uppercase tracking-wider border border-primary/20 text-primary bg-primary/5">
                                        {row.status}
                                    </span>

                                    <span className="text-xs text-muted-foreground">
                                        {row.date}
                                    </span>

                                    <Link
                                        href="/business/profile"
                                        className="border border-border bg-background hover:bg-muted text-foreground text-xs font-bold px-3 py-1.5 transition-colors flex items-center gap-1 rounded-sm"
                                    >
                                        <span>View Profile</span>
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
                            Creators for Calangute gastronomy, heritage courtyards, artisanal coffee
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
                        const isShortlisted = savedBookmarks[creator.name]

                        return (
                            <div
                                key={creator.name}
                                className="border border-border p-5 space-y-4 bg-background rounded-sm shadow-sm hover:border-primary/50 transition-colors flex flex-col justify-between"
                            >
                                <div className="space-y-3">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2.5">
                                            <div className="size-9 shrink-0 rounded-sm bg-primary text-primary-foreground flex items-center justify-center text-white font-bold text-xs border border-primary/20">
                                                {creator.name.split(' ').map((n) => n[0]).join('')}
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
                                            onClick={() => toggleBookmark(creator.name)}
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
                                    href="/business/requests"
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
        </main>
    )
}
