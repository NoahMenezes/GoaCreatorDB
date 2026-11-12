'use client'

import Link from 'next/link'
import Image from 'next/image'
import {
    Compass,
    Send,
    ShieldCheck,
    Store,
    TrendingUp,
    Users,
} from 'lucide-react'

export default function BusinessDashboardPage() {
    const kpis = [
        {
            label: 'Active Collaborations',
            value: '2 Ongoing',
            sub: '1 in review, 1 shooting this weekend',
            icon: Send,
            color: 'border-l-4 border-l-teal-600',
        },
        {
            label: 'Total Creators Booked',
            value: '18 Deals',
            sub: '100% on-time milestone delivery',
            icon: Users,
            color: 'border-l-4 border-l-emerald-600',
        },
        {
            label: 'Escrow Funds Secured',
            value: '₹42,000',
            sub: 'Protected until deliverables verified',
            icon: ShieldCheck,
            color: 'border-l-4 border-l-sky-600',
        },
        {
            label: 'Avg Campaign Engagement',
            value: '8.4%',
            sub: '3.1x higher than Goan baseline ads',
            icon: TrendingUp,
            color: 'border-l-4 border-l-amber-500',
        },
    ]

    const recentCollabs = [
        {
            creator: 'Sneha Fernandes',
            handle: '@sneha.tastesgoa',
            avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=200&auto=format&fit=crop',
            campaign: 'Monsoon Weekend Tasting Menu & Heritage Sourdough Reel',
            type: 'Hybrid (₹14,000 + Brunch)',
            status: 'Accepted',
            statusColor: 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/30',
            date: 'Shoot: Oct 28, 2026',
        },
        {
            creator: 'Rahul Naik',
            handle: '@rahul_eats_goa',
            avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=200&auto=format&fit=crop',
            campaign: 'Traditional Goan Poee Sliders & Taverna Story Sequence',
            type: 'Paid (₹6,500)',
            status: 'Pending',
            statusColor: 'bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-500/30',
            date: 'Responded: 4h ago',
        },
        {
            creator: 'Alisha D\'Cruz',
            handle: '@alishacafecrawls',
            avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=200&auto=format&fit=crop',
            campaign: 'Morning Artisanal Cold Brew & Courtyard Walkthrough',
            type: 'Hybrid (₹5,500 + Pastry)',
            status: 'Completed',
            statusColor: 'bg-sky-500/10 text-sky-700 dark:text-sky-300 border border-sky-500/30',
            date: 'Completed Oct 15 • 54K Views',
        },
    ]

    return (
        <main className="space-y-8">
            {/* 1. Welcome Banner - Sharp */}
            <div className="border border-border/80 bg-card p-6 flex flex-col md:flex-row md:items-center justify-between gap-4 rounded-none shadow-none">
                <div className="space-y-1">
                    <div className="flex items-center gap-2">
                        <Store className="size-5 text-teal-700 dark:text-teal-400" />
                        <h1 className="text-xl sm:text-2xl font-extrabold text-foreground tracking-tight">
                            Welcome back, Café Palmeira
                        </h1>
                    </div>
                    <p className="text-xs sm:text-sm text-muted-foreground">
                        Calangute, North Goa • Verified Goan Partner Establishment • Current Season: Peak Coastal Hospitality
                    </p>
                </div>

                <div className="flex items-center gap-3">
                    <Link
                        href="/business/discover"
                        className="bg-[#0c4e40] hover:bg-[#08382e] text-white font-bold text-xs px-4 py-2.5 flex items-center gap-1.5 transition-colors rounded-none shadow-none"
                    >
                        <Compass className="size-4" />
                        <span>Discover Creators &rarr;</span>
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

            {/* 2. 4 KPI Metric Cards - Sharp */}
            <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {kpis.map((kpi) => {
                    const Icon = kpi.icon
                    return (
                        <div
                            key={kpi.label}
                            className={`border border-border/80 bg-card p-5 space-y-2 rounded-none shadow-none ${kpi.color}`}
                        >
                            <div className="flex items-center justify-between">
                                <span className="text-[11px] font-bold uppercase text-muted-foreground tracking-wider">
                                    {kpi.label}
                                </span>
                                <Icon className="size-4 text-teal-700 dark:text-teal-400" />
                            </div>
                            <div className="text-2xl font-black text-foreground tracking-tight">
                                {kpi.value}
                            </div>
                            <div className="text-[11px] text-muted-foreground">
                                {kpi.sub}
                            </div>
                        </div>
                    )
                })}
            </section>

            {/* 3. Recent Collaboration Requests & Status Tracking - Sharp */}
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
                        className="text-xs font-bold text-teal-700 dark:text-teal-400 hover:underline"
                    >
                        Manage All Requests ({recentCollabs.length}) &rarr;
                    </Link>
                </div>

                <div className="space-y-3">
                    {recentCollabs.map((collab) => (
                        <div
                            key={collab.creator}
                            className="border border-border p-4 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:border-teal-700 transition-colors bg-background rounded-none"
                        >
                            <div className="flex items-center gap-3">
                                <div className="size-12 overflow-hidden border border-border shrink-0 rounded-none relative">
                                    <Image
                                        unoptimized
                                        src={collab.avatar}
                                        alt={collab.creator}
                                        width={80}
                                        height={80}
                                        className="size-full object-cover rounded-none"
                                    />
                                </div>
                                <div className="space-y-0.5">
                                    <div className="flex items-center gap-2">
                                        <h3 className="text-sm font-bold text-foreground">
                                            {collab.creator}
                                        </h3>
                                        <span className="text-xs text-muted-foreground font-mono">
                                            {collab.handle}
                                        </span>
                                    </div>
                                    <p className="text-xs text-muted-foreground">
                                        {collab.campaign}
                                    </p>
                                </div>
                            </div>

                            <div className="flex flex-wrap items-center gap-3 self-start md:self-auto shrink-0">
                                <span className="text-xs font-medium text-muted-foreground">
                                    {collab.type}
                                </span>

                                <span className={`text-[10px] font-bold px-2.5 py-1 uppercase tracking-wider rounded-none ${collab.statusColor}`}>
                                    {collab.status}
                                </span>

                                <span className="text-xs text-muted-foreground">
                                    {collab.date}
                                </span>

                                <Link
                                    href="/business/profile"
                                    className="border border-border bg-muted/60 hover:bg-muted text-foreground text-xs font-bold px-3 py-1.5 transition-colors rounded-none"
                                >
                                    View Profile &rarr;
                                </Link>
                            </div>
                        </div>
                    ))}
                </div>
            </section>

            {/* 4. Recommended Goan Creators for Weekend Tapas - Sharp */}
            <section className="border border-border/80 bg-card p-6 space-y-4 rounded-none shadow-none">
                <div className="flex items-center justify-between">
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
                        className="text-xs font-bold text-teal-700 dark:text-teal-400 hover:underline"
                    >
                        Explore All &rarr;
                    </Link>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {[
                        {
                            name: 'Sneha Fernandes',
                            handle: '@sneha.tastesgoa',
                            niche: 'Boutique Stays & Food',
                            followers: '120K',
                            rate: '₹8,000 / reel',
                            avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=200&auto=format&fit=crop',
                        },
                        {
                            name: 'Rahul Naik',
                            handle: '@rahul_eats_goa',
                            niche: 'Local Heritage Seafood',
                            followers: '85K',
                            rate: '₹6,500 / reel',
                            avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=200&auto=format&fit=crop',
                        },
                        {
                            name: 'Alisha D\'Cruz',
                            handle: '@alishacafecrawls',
                            niche: 'Goan Coffee Culture',
                            followers: '68K',
                            rate: '₹5,500 / reel',
                            avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=200&auto=format&fit=crop',
                        },
                    ].map((creator) => (
                        <div
                            key={creator.name}
                            className="border border-border p-4 space-y-3 bg-background hover:border-teal-700 transition-colors rounded-none"
                        >
                            <div className="flex items-center gap-3">
                                <div className="size-10 overflow-hidden border border-border shrink-0 rounded-none relative">
                                    <Image
                                        unoptimized
                                        src={creator.avatar}
                                        alt={creator.name}
                                        width={60}
                                        height={60}
                                        className="size-full object-cover rounded-none"
                                    />
                                </div>
                                <div>
                                    <h4 className="text-xs font-bold text-foreground">
                                        {creator.name}
                                    </h4>
                                    <span className="text-[11px] text-muted-foreground">
                                        {creator.niche}
                                    </span>
                                </div>
                            </div>

                            <div className="flex items-center justify-between text-xs pt-1 border-t border-border/60">
                                <span className="font-semibold text-muted-foreground">{creator.followers} reach</span>
                                <span className="font-bold text-foreground">{creator.rate}</span>
                            </div>

                            <Link
                                href="/business/profile"
                                className="w-full bg-[#0c4e40] hover:bg-[#08382e] text-white text-center font-bold text-xs py-2 block transition-colors rounded-none"
                            >
                                View Creator Profile &rarr;
                            </Link>
                        </div>
                    ))}
                </div>
            </section>
        </main>
    )
}
