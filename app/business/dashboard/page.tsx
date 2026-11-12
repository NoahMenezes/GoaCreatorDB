'use client'

import { useState } from 'react'
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
    const [savedBookmarks, setSavedBookmarks] = useState<Record<string, boolean>>({
        'Elena Pinto': true,
        'Kabir Sawant': true,
        'Tara Mascarenhas': false,
    })

    const toggleBookmark = (name: string) => {
        setSavedBookmarks((prev) => ({ ...prev, [name]: !prev[name] }))
    }

    const statCards = [
        {
            title: 'Active Collaborations',
            value: '2 Ongoing',
            sub: '1 in review, 1 shooting this weekend',
            icon: Rocket,
        },
        {
            title: 'Total Creators Booked',
            value: '18 Deals',
            sub: '100% on-time milestone delivery',
            icon: Users,
        },
        {
            title: 'Escrow Funds Secured',
            value: '₹42,000',
            sub: 'Protected until deliverables verified',
            icon: ShieldCheck,
        },
        {
            title: 'Avg Campaign Engagement',
            value: '8.4%',
            sub: '3.1x higher than baseline',
            icon: TrendingUp,
        },
    ]

    const collabRows = [
        {
            name: 'Sneha Fernandes',
            handle: '@sneha_.tastesgoa',
            desc: 'Monsoon Weekend Tasting Menu & Heritage Sourdough Reel',
            type: 'Hybrid · ₹14,000 + Brunch',
            status: 'ACCEPTED',
            date: 'Shoot: Oct 28, 2026',
        },
        {
            name: 'Rahul Naik',
            handle: '@rahul_eats_goa',
            desc: 'Traditional Goan Poe Sliders & Taverna Story Sequence',
            type: 'Paid · ₹6,500',
            status: 'PENDING',
            date: 'Responded: 4h ago',
        },
        {
            name: 'Alisha D\'Cruz',
            handle: '@alishacafecrawls',
            desc: 'Morning Artisanal Cold Brew & Courtyard Walkthrough',
            type: 'Hybrid · ₹5,500 + Pastry',
            status: 'COMPLETED',
            date: 'Completed Oct 15 · 54K Views',
        },
    ]

    const recommendations = [
        {
            name: 'Elena Pinto',
            location: 'Assagao, North Goa',
            tags: ['Food & Dining', 'Monsoon Stays'],
            reach: '85K',
            engagement: '6.8%',
            baseRate: '₹9,500 / collab',
        },
        {
            name: 'Kabir Sawant',
            location: 'Calangute, North Goa',
            tags: ['Café Culture', 'Cocktails'],
            reach: '120K',
            engagement: '7.4%',
            baseRate: '₹14,000 / collab',
        },
        {
            name: 'Tara Mascarenhas',
            location: 'Anjuna, North Goa',
            tags: ['Food Photography', 'Artisan Bakery'],
            reach: '54K',
            engagement: '8.2%',
            baseRate: '₹7,000 / collab',
        },
    ]

    return (
        <main className="space-y-8">
            {/* 1. Header Banner */}
            <div className="border border-border bg-card p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="space-y-1">
                    <div className="flex items-center gap-2">
                        <Store className="size-5 text-primary" />
                        <h1 className="text-xl sm:text-2xl font-extrabold text-foreground tracking-tight">
                            Welcome back, Café Palmeira
                        </h1>
                    </div>
                    <p className="text-xs sm:text-sm text-muted-foreground">
                        Calangute, North Goa · Verified Partner · Peak Season
                    </p>
                </div>

                <div className="flex items-center gap-3">
                    <Link
                        href="/business/discover"
                        className="bg-primary hover:bg-primary/90 text-primary-foreground font-bold text-xs px-5 py-2.5 flex items-center gap-1.5 transition-colors"
                    >
                        <span>Discover Creators</span>
                        <ChevronRight className="size-4" />
                    </Link>

                    <Link
                        href="/business/requests"
                        className="border border-border bg-background hover:bg-muted font-bold text-xs px-4 py-2.5 flex items-center gap-1.5 transition-colors text-foreground"
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
                            className="border border-border bg-card p-5 space-y-2"
                        >
                            <div className="flex items-start justify-between gap-2">
                                <div className="space-y-0.5">
                                    <span className="text-[11px] font-bold uppercase text-muted-foreground tracking-wider block">
                                        {card.title}
                                    </span>
                                    <span className="text-[11px] text-muted-foreground block">
                                        {card.sub}
                                    </span>
                                </div>
                                <div className="size-8 flex items-center justify-center border border-border bg-background">
                                    <Icon className="size-4 text-primary" />
                                </div>
                            </div>
                            <div className="text-3xl font-black text-foreground tracking-tight pt-1">
                                {card.value}
                            </div>
                        </div>
                    )
                })}
            </section>

            {/* 3. Active Collaboration Workflow */}
            <section className="border border-border bg-card p-6 space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border pb-4">
                    <div>
                        <h2 className="text-base font-bold text-foreground">
                            Active Collaborations
                        </h2>
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
                    {collabRows.map((row) => (
                        <div
                            key={row.name}
                            className="border border-border p-4 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:border-primary transition-colors bg-background"
                        >
                            <div className="flex items-center gap-3.5 flex-1 min-w-0">
                                <div className="size-10 shrink-0 bg-secondary text-secondary-foreground flex items-center justify-center text-white font-bold text-xs border border-border">
                                    {row.name.split(' ').map((n) => n[0]).join('')}
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

                                <span className="text-[10px] font-bold px-2 py-0.5 uppercase tracking-wider border border-border text-primary border-primary">
                                    {row.status}
                                </span>

                                <span className="text-xs text-muted-foreground">
                                    {row.date}
                                </span>

                                <Link
                                    href="/business/profile"
                                    className="border border-border bg-background hover:bg-muted text-foreground text-xs font-bold px-3 py-1.5 transition-colors flex items-center gap-1"
                                >
                                    <span>View Profile</span>
                                    <ExternalLink className="size-3" />
                                </Link>
                            </div>
                        </div>
                    ))}
                </div>
            </section>

            {/* 4. Curated Recommendations */}
            <section className="border border-border bg-card p-6 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-border pb-3">
                    <div>
                        <h2 className="text-base font-bold text-foreground">
                            Recommended Creators
                        </h2>
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
                                className="border border-border p-5 space-y-4 bg-background hover:border-primary transition-colors flex flex-col justify-between"
                            >
                                <div className="space-y-3">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2.5">
                                            <div className="size-9 shrink-0 bg-secondary text-secondary-foreground flex items-center justify-center text-white font-bold text-xs border border-border">
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
                                            className={`size-8 border flex items-center justify-center cursor-pointer transition-colors ${isShortlisted
                                                ? 'border-primary text-primary'
                                                : 'border-border text-muted-foreground hover:text-foreground'
                                            }`}
                                        >
                                            <Bookmark className={`size-4 ${isShortlisted ? 'fill-current' : ''}`} />
                                        </button>
                                    </div>

                                    <div className="flex flex-wrap gap-1.5">
                                        {creator.tags.map((tag) => (
                                            <span
                                                key={tag}
                                                className="px-2 py-0.5 text-[10px] font-semibold bg-muted border border-border text-muted-foreground"
                                            >
                                                {tag}
                                            </span>
                                        ))}
                                    </div>

                                    <div className="grid grid-cols-2 gap-2 pt-1">
                                        <div className="bg-muted p-2.5 border border-border">
                                            <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider block">
                                                Reach
                                            </span>
                                            <span className="text-base font-extrabold text-foreground">
                                                {creator.reach}
                                            </span>
                                        </div>
                                        <div className="bg-muted p-2.5 border border-border">
                                            <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider block">
                                                Engagement
                                            </span>
                                            <span className="text-base font-extrabold text-primary">
                                                {creator.engagement}
                                            </span>
                                        </div>
                                    </div>

                                    <div className="bg-muted p-2.5 border border-border flex items-center justify-between text-xs">
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
                                    className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-bold text-xs py-2.5 flex items-center justify-center gap-2 transition-colors"
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
