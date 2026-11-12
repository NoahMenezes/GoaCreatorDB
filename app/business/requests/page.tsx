'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import {
    Plus,
    ShieldCheck,
} from 'lucide-react'

export default function BusinessRequestsPage() {
    const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'accepted' | 'completed'>('all')

    const requests = [
        {
            id: 'REQ-1042',
            creator: 'Sneha Fernandes',
            handle: '@sneha.tastesgoa',
            avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=200&auto=format&fit=crop',
            title: 'Monsoon Weekend Tasting Menu & Heritage Sourdough Reel',
            deliverables: ['1 Dedicated Reel (30–60s)', 'Photo Carousel (6 slides)', 'Story Sequence (3x frames)'],
            collabType: 'Hybrid',
            offeredAmount: '₹14,000 + Weekend Brunch Table',
            status: 'accepted',
            statusLabel: 'Accepted • Shoot Scheduled',
            statusBadge: 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/30',
            date: 'Shoot: Oct 28, 2026',
            escrowStatus: '₹14,000 Locked in Escrow',
            deadline: 'Final Draft Due: Nov 02, 2026',
        },
        {
            id: 'REQ-1041',
            creator: 'Rahul Naik',
            handle: '@rahul_eats_goa',
            avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=200&auto=format&fit=crop',
            title: 'Traditional Goan Poee Sliders & Taverna Story Sequence',
            deliverables: ['1 Dedicated Reel', '2 Story Frames'],
            collabType: 'Paid',
            offeredAmount: '₹6,500',
            status: 'pending',
            statusLabel: 'Pending Creator Response',
            statusBadge: 'bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-500/30',
            date: 'Requested: Yesterday',
            escrowStatus: '₹6,500 Reserved',
            deadline: 'Response Window: 24h Remaining',
        },
        {
            id: 'REQ-1039',
            creator: 'Alisha D\'Cruz',
            handle: '@alishacafecrawls',
            avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=200&auto=format&fit=crop',
            title: 'Morning Artisanal Cold Brew & Courtyard Walkthrough',
            deliverables: ['1 Dedicated Reel', 'High-Res Photo Exports'],
            collabType: 'Hybrid',
            offeredAmount: '₹5,500 + Pastry Box',
            status: 'completed',
            statusLabel: 'Completed & Escrow Paid',
            statusBadge: 'bg-sky-500/10 text-sky-700 dark:text-sky-300 border border-sky-500/30',
            date: 'Published: Oct 15, 2026',
            escrowStatus: '₹5,500 Released via Escrow',
            deadline: 'Result: 54,200 Organic Views • 8.4% ER',
        },
        {
            id: 'REQ-1035',
            creator: 'Keith Sequeira',
            handle: '@chefkeith_goa',
            avatar: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?q=80&w=200&auto=format&fit=crop',
            title: 'Sunset Tapas Live Fire Grill Experience',
            deliverables: ['1 Reel + Chef Collaboration Tag'],
            collabType: 'Hybrid',
            offeredAmount: '₹11,000 + Chef Tasting Table',
            status: 'completed',
            statusLabel: 'Completed & Escrow Paid',
            statusBadge: 'bg-sky-500/10 text-sky-700 dark:text-sky-300 border border-sky-500/30',
            date: 'Published: Sep 29, 2026',
            escrowStatus: '₹11,000 Released via Escrow',
            deadline: 'Result: 72,100 Organic Views • 5.0 Rating Left',
        },
    ]

    const filteredRequests = requests.filter((r) => {
        if (statusFilter === 'all') return true
        return r.status === statusFilter
    })

    return (
        <main className="space-y-6">
            {/* Header - Sharp */}
            <div className="border border-border/80 bg-card p-6 flex flex-col md:flex-row md:items-center justify-between gap-4 rounded-none shadow-none">
                <div>
                    <h1 className="text-xl sm:text-2xl font-extrabold text-foreground tracking-tight">
                        Collaboration Requests &amp; Deals
                    </h1>
                    <p className="text-xs sm:text-sm text-muted-foreground">
                        Track campaign briefs, dates, status, deliverables, and escrow milestones
                    </p>
                </div>

                <Link
                    href="/business/discover"
                    className="bg-[#0c4e40] hover:bg-[#08382e] text-white font-bold text-xs px-4 py-2.5 flex items-center gap-1.5 transition-colors self-start md:self-auto rounded-none shadow-none"
                >
                    <Plus className="size-4" />
                    <span>New Booking Request</span>
                </Link>
            </div>

            {/* Filter Tabs - Sharp */}
            <div className="flex flex-wrap gap-2 border-b border-border/80 pb-2">
                {[
                    { id: 'all', label: `All Requests (${requests.length})` },
                    { id: 'pending', label: 'Pending Response (1)' },
                    { id: 'accepted', label: 'Active & Accepted (1)' },
                    { id: 'completed', label: 'Completed Deals (2)' },
                ].map((tab) => (
                    <button
                        key={tab.id}
                        type="button"
                        onClick={() => setStatusFilter(tab.id as typeof statusFilter)}
                        className={`px-4 py-2 text-xs font-bold transition-colors cursor-pointer rounded-none border ${
                            statusFilter === tab.id
                                ? 'bg-[#0c4e40] text-white border-[#0c4e40]'
                                : 'bg-card text-muted-foreground border-border/80 hover:text-foreground'
                        }`}
                    >
                        {tab.label}
                    </button>
                ))}
            </div>

            {/* Requests List - Sharp */}
            <div className="space-y-4">
                {filteredRequests.map((req) => (
                    <div
                        key={req.id}
                        className="border border-border/80 bg-card p-6 space-y-4 rounded-none shadow-none hover:border-teal-700 transition-colors"
                    >
                        {/* Top Meta Row */}
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border/60 pb-3">
                            <div className="flex items-center gap-3">
                                <div className="size-12 overflow-hidden border border-border shrink-0 rounded-none relative">
                                    <Image
                                        unoptimized
                                        src={req.avatar}
                                        alt={req.creator}
                                        width={80}
                                        height={80}
                                        className="size-full object-cover rounded-none"
                                    />
                                </div>
                                <div>
                                    <div className="flex items-center gap-2">
                                        <h3 className="text-sm font-bold text-foreground">
                                            {req.creator}
                                        </h3>
                                        <span className="text-xs text-muted-foreground font-mono">
                                            {req.handle}
                                        </span>
                                        <span className="text-[10px] text-muted-foreground border border-border px-1.5 py-0.5 font-mono rounded-none">
                                            {req.id}
                                        </span>
                                    </div>
                                    <div className="text-xs text-muted-foreground">
                                        Collab Type: <strong className="text-foreground">{req.collabType}</strong> • Offer: <strong className="text-foreground">{req.offeredAmount}</strong>
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-center gap-3">
                                <span className={`text-[10px] font-bold px-2.5 py-1 uppercase tracking-wider rounded-none ${req.statusBadge}`}>
                                    {req.statusLabel}
                                </span>
                            </div>
                        </div>

                        {/* Title & Deliverables */}
                        <div className="space-y-2">
                            <h4 className="text-sm font-bold text-foreground">
                                {req.title}
                            </h4>
                            <div className="flex flex-wrap gap-2 text-xs">
                                {req.deliverables.map((deliv) => (
                                    <span
                                        key={deliv}
                                        className="border border-border bg-muted/40 px-2.5 py-1 text-muted-foreground font-medium rounded-none"
                                    >
                                        ✓ {deliv}
                                    </span>
                                ))}
                            </div>
                        </div>

                        {/* Escrow & Dates Footer */}
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-3 border-t border-border/60 text-xs">
                            <div className="flex items-center gap-4 text-muted-foreground">
                                <div className="flex items-center gap-1.5 font-semibold text-emerald-700 dark:text-emerald-400">
                                    <ShieldCheck className="size-4" />
                                    <span>{req.escrowStatus}</span>
                                </div>
                                <span>{req.date}</span>
                                <span className="font-medium text-foreground">{req.deadline}</span>
                            </div>

                            <div className="flex items-center gap-2">
                                <Link
                                    href="/business/profile"
                                    className="border border-border bg-background hover:bg-muted font-bold text-xs px-3 py-1.5 text-foreground transition-colors rounded-none"
                                >
                                    Creator Profile &rarr;
                                </Link>
                                <button
                                    type="button"
                                    onClick={() => alert(`Direct escrow messaging opened for ${req.id}`)}
                                    className="bg-[#0c4e40] hover:bg-[#08382e] text-white font-bold text-xs px-3 py-1.5 transition-colors cursor-pointer rounded-none"
                                >
                                    Campaign Chat
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </main>
    )
}
