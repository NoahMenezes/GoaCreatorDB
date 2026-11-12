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
            accent: 'border-l-4 border-l-[#0f766e]',
            iconBg: 'bg-[#0f766e]/10 text-[#0f766e] dark:text-teal-400',
        },
        {
            title: 'Total Creators Booked',
            value: '18 Deals',
            sub: '100% on-time milestone delivery',
            icon: Users,
            accent: 'border-l-4 border-l-[#0f766e]',
            iconBg: 'bg-[#0f766e]/10 text-[#0f766e] dark:text-teal-400',
        },
        {
            title: 'Escrow Funds Secured',
            value: '₹42,000',
            sub: 'Protected until deliverables verified',
            icon: ShieldCheck,
            accent: 'border-l-4 border-l-[#0ea5e9]',
            iconBg: 'bg-[#0ea5e9]/10 text-[#0ea5e9] dark:text-sky-400',
        },
        {
            title: 'Avg Campaign Engagement',
            value: '8.4%',
            sub: '3.1x higher than Goan baseline ads',
            icon: TrendingUp,
            accent: 'border-l-4 border-l-[#f97316]',
            iconBg: 'bg-[#f97316]/10 text-[#f97316] dark:text-orange-400',
        },
    ]

    const collabRows = [
        {
            name: 'Sneha Fernandes',
            handle: '@sneha_.tastesgoa',
            desc: 'Monsoon Weekend Tasting Menu & Heritage Sourdough Reel',
            type: 'Hybrid (₹14,000 + Brunch)',
            status: 'ACCEPTED',
            statusColor: 'bg-[#0f766e]/10 text-[#0f766e] dark:text-teal-300 border border-[#0f766e]/30',
            date: 'Shoot: Oct 28, 2026',
            avatarGrad: 'from-teal-500 to-emerald-700',
        },
        {
            name: 'Rahul Naik',
            handle: '@rahul_eats_goa',
            desc: 'Traditional Goan Poe Sliders & Taverna Story Sequence',
            type: 'Paid (₹6,500)',
            status: 'PENDING',
            statusColor: 'bg-[#f97316]/10 text-[#f97316] dark:text-orange-300 border border-[#f97316]/30',
            date: 'Responded: 4h ago',
            avatarGrad: 'from-amber-500 to-orange-700',
        },
        {
            name: 'Alisha D\'Cruz',
            handle: '@alishacafecrawls',
            desc: 'Morning Artisanal Cold Brew & Courtyard Walkthrough',
            type: 'Hybrid (₹5,500 + Pastry)',
            status: 'COMPLETED',
            statusColor: 'bg-[#0ea5e9]/10 text-[#0ea5e9] dark:text-sky-300 border border-[#0ea5e9]/30',
            date: 'Completed Oct 15 • 54K Views',
            avatarGrad: 'from-sky-500 to-blue-700',
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
            avatarGrad: 'from-pink-500 to-rose-700',
        },
        {
            name: 'Kabir Sawant',
            location: 'Calangute, North Goa',
            tags: ['Café Culture', 'Cocktails'],
            reach: '120K',
            engagement: '7.4%',
            baseRate: '₹14,000 / collab',
            avatarGrad: 'from-cyan-500 to-teal-700',
        },
        {
            name: 'Tara Mascarenhas',
            location: 'Anjuna, North Goa',
            tags: ['Food Photography', 'Artisan Bakery'],
            reach: '54K',
            engagement: '8.2%',
            baseRate: '₹7,000 / collab',
            avatarGrad: 'from-amber-500 to-yellow-600',
        },
    ]

    return (
        <main className="space-y-8">
            {/* 1. Header Banner - Sharp Pointed */}
            <div className="border border-border/80 bg-card p-6 flex flex-col md:flex-row md:items-center justify-between gap-4 rounded-none shadow-none">
                <div className="space-y-1">
                    <div className="flex items-center gap-2">
                        <Store className="size-5 text-teal-700 dark:text-teal-400" />
                        <h1 className="text-xl sm:text-2xl font-extrabold text-foreground tracking-tight">
                            Welcome back, Café Palmeira
                        </h1>
                    </div>
                    <p className="text-xs sm:text-sm text-muted-foreground">
                        Calangute, North Goa &nbsp;•&nbsp; Verified Goan Partner Establishment &nbsp;•&nbsp; Current Season: Peak Coastal Hospitality
                    </p>
                </div>

                <div className="flex items-center gap-3">
                    <Link
                        href="/business/discover"
                        className="bg-[#0c4e40] hover:bg-[#08382e] text-white font-bold text-xs px-5 py-2.5 flex items-center gap-1.5 transition-colors rounded-none shadow-none"
                    >
                        <span>Discover Creators</span>
                        <ChevronRight className="size-4" />
                    </Link>

                    <Link
                        href="/business/requests"
                        className="border border-border bg-background hover:bg-muted font-bold text-xs px-4 py-2.5 flex items-center gap-1.5 transition-colors text-foreground rounded-none shadow-none"
                    >
                        <Send className="size-4" />
                        <span>View Requests</span>
                    </Link>
                </div>
            </div>

            {/* 2. 4 Stat KPI Cards - Sharp Pointed */}
            <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {statCards.map((card) => {
                    const Icon = card.icon
                    return (
                        <div
                            key={card.title}
                            className={`border border-border/80 bg-card p-5 space-y-2 rounded-none shadow-none hover:border-teal-700 transition-colors ${card.accent}`}
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
                                <div className={`size-8 flex items-center justify-center shrink-0 rounded-none ${card.iconBg}`}>
                                    <Icon className="size-4" />
                                </div>
                            </div>
                            <div className="text-3xl font-black text-foreground tracking-tight pt-1">
                                {card.value}
                            </div>
                        </div>
                    )
                })}
            </section>

            {/* 3. Active Collaboration Workflow - Sharp Pointed */}
            <section className="border border-border/80 bg-card p-6 space-y-6 rounded-none shadow-none">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border/60 pb-4">
                    <div>
                        <h2 className="text-base font-bold text-foreground">
                            Active Collaboration Workflow
                        </h2>
                        <p className="text-xs text-muted-foreground">
                            Realtime status of campaign briefs, dates, and escrow payment milestones
                        </p>
                    </div>

                    <Link
                        href="/business/requests"
                        className="text-xs font-bold text-teal-700 dark:text-teal-400 hover:underline flex items-center gap-1"
                    >
                        <span>Manage All Requests ({collabRows.length})</span>
                        <ChevronRight className="size-3.5" />
                    </Link>
                </div>

                <div className="space-y-3">
                    {collabRows.map((row) => (
                        <div
                            key={row.name}
                            className="border border-border p-4 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:border-teal-700 transition-colors bg-background rounded-none"
                        >
                            <div className="flex items-center gap-3.5 flex-1 min-w-0">
                                <div className={`size-10 shrink-0 bg-gradient-to-br ${row.avatarGrad} flex items-center justify-center text-white font-bold text-xs rounded-none border border-border`}>
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

                                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-none uppercase tracking-wider ${row.statusColor}`}>
                                    {row.status}
                                </span>

                                <span className="text-xs text-muted-foreground">
                                    {row.date}
                                </span>

                                <Link
                                    href="/business/profile"
                                    className="border border-border bg-muted/60 hover:bg-muted text-foreground text-xs font-bold px-3 py-1.5 transition-colors rounded-none flex items-center gap-1"
                                >
                                    <span>View Profile</span>
                                    <ExternalLink className="size-3" />
                                </Link>
                            </div>
                        </div>
                    ))}
                </div>
            </section>

            {/* 4. Curated Recommendations for Café Palmeira - Sharp Pointed */}
            <section className="border border-border/80 bg-card p-6 space-y-4 rounded-none shadow-none">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-border/60 pb-3">
                    <div>
                        <h2 className="text-base font-bold text-foreground">
                            Curated Recommendations for Café Palmeira
                        </h2>
                        <p className="text-xs text-muted-foreground">
                            Creators matching Calangute bistro gastronomy, heritage courtyard aesthetics, and artisanal coffee
                        </p>
                    </div>

                    <Link
                        href="/business/discover"
                        className="text-xs font-bold text-teal-700 dark:text-teal-400 hover:underline flex items-center gap-1"
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
                                className="border border-border p-5 space-y-4 bg-background hover:border-teal-700 transition-colors rounded-none flex flex-col justify-between"
                            >
                                <div className="space-y-3">
                                    {/* Creator Meta Top */}
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2.5">
                                            <div className={`size-9 shrink-0 bg-gradient-to-br ${creator.avatarGrad} flex items-center justify-center text-white font-bold text-xs rounded-none border border-border`}>
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
                                            className={`size-8 border flex items-center justify-center cursor-pointer transition-colors rounded-none ${
                                                isShortlisted
                                                    ? 'border-teal-700 text-teal-700 dark:text-teal-400 bg-teal-50/20'
                                                    : 'border-border text-muted-foreground hover:text-foreground'
                                            }`}
                                        >
                                            <Bookmark className={`size-4 ${isShortlisted ? 'fill-current' : ''}`} />
                                        </button>
                                    </div>

                                    {/* Tags */}
                                    <div className="flex flex-wrap gap-1.5">
                                        {creator.tags.map((tag) => (
                                            <span
                                                key={tag}
                                                className="px-2 py-0.5 text-[10px] font-semibold bg-muted/60 border border-border/80 text-muted-foreground rounded-none"
                                            >
                                                {tag}
                                            </span>
                                        ))}
                                    </div>

                                    {/* Stats Grid */}
                                    <div className="grid grid-cols-2 gap-2 pt-1">
                                        <div className="bg-muted/40 p-2.5 border border-border/70 rounded-none">
                                            <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider block">
                                                Reach
                                            </span>
                                            <span className="text-base font-extrabold text-foreground">
                                                {creator.reach}
                                            </span>
                                        </div>
                                        <div className="bg-muted/40 p-2.5 border border-border/70 rounded-none">
                                            <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider block">
                                                Engagement
                                            </span>
                                            <span className="text-base font-extrabold text-teal-700 dark:text-teal-400">
                                                {creator.engagement}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Base Rate */}
                                    <div className="bg-muted/40 p-2.5 border border-border/70 rounded-none flex items-center justify-between text-xs">
                                        <span className="font-bold text-muted-foreground uppercase text-[10px]">
                                            Base Rate
                                        </span>
                                        <span className="font-extrabold text-foreground">
                                            {creator.baseRate}
                                        </span>
                                    </div>
                                </div>

                                {/* Send Request Button */}
                                <Link
                                    href="/business/requests"
                                    className="w-full bg-[#0c4e40] hover:bg-[#08382e] text-white font-bold text-xs py-2.5 flex items-center justify-center gap-2 transition-colors rounded-none shadow-none mt-2"
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
