'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Plus, ShieldCheck } from 'lucide-react'

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
        <main className="space-y-8">
            <div className="border border-border bg-card p-6 rounded-sm shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-xl sm:text-2xl font-bold text-foreground tracking-tight">
                        Collaboration Requests & Deals
                    </h1>
                    <p className="text-sm text-muted-foreground">
                        Track campaign briefs, dates, status, deliverables, and escrow milestones
                    </p>
                </div>

                <Link
                    href="/business/discover"
                    className="bg-primary hover:bg-primary/90 text-primary-foreground font-medium text-sm px-5 py-3 flex items-center gap-2 transition-colors rounded-sm shadow-sm self-start md:self-auto"
                >
                    <Plus className="size-4" />
                    <span>New Booking Request</span>
                </Link>
            </div>

            <div className="flex flex-wrap gap-2 border-b border-border pb-3">
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
                        className={`px-4 py-2 text-xs font-bold transition-colors cursor-pointer rounded-sm border ${
                            statusFilter === tab.id
                                ? 'bg-primary text-primary-foreground border-primary'
                                : 'bg-background text-muted-foreground border-border hover:text-foreground hover:bg-muted'
                        }`}
                    >
                        {tab.label}
                    </button>
                ))}
            </div>

            <div className="space-y-4">
                {filteredRequests.map((req) => (
                    <div
                        key={req.id}
                        className="border border-border bg-card p-5 rounded-sm shadow-sm space-y-4 hover:border-primary/50 transition-colors"
                    >
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border pb-3">
                            <div className="flex items-center gap-3">
                                <div className="size-12 overflow-hidden border border-border shrink-0 relative rounded-md">
                                    <Image
                                        unoptimized
                                        src={req.avatar}
                                        alt={req.creator}
                                        width={80}
                                        height={80}
                                        className="size-full object-cover"
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
                                        <span className="text-[10px] text-muted-foreground border border-border px-1.5 py-0.5 font-mono">
                                            {req.id}
                                        </span>
                                    </div>
                                    <div className="text-xs text-muted-foreground">
                                        Collab Type: <strong className="text-foreground">{req.collabType}</strong> &bull; Offer: <strong className="text-foreground">{req.offeredAmount}</strong>
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-center gap-3">
                                <span className={`text-[10px] font-bold px-2.5 py-1 uppercase tracking-wider rounded-sm border ${
                                    req.status === 'accepted'
                                        ? 'border-primary/20 text-primary bg-primary/5'
                                        : req.status === 'pending'
                                        ? 'border-border text-muted-foreground bg-background'
                                        : 'border-primary/20 text-primary bg-primary/5'
                                }`}>
                                    {req.statusLabel}
                                </span>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <h4 className="text-sm font-bold text-foreground">
                                {req.title}
                            </h4>
                            <div className="flex flex-wrap gap-2 text-xs">
                                {req.deliverables.map((deliv) => (
                                    <span
                                        key={deliv}
                                        className="border border-border bg-muted px-2.5 py-1 rounded-sm text-muted-foreground font-medium"
                                    >
                                        ✓ {deliv}
                                    </span>
                                ))}
                            </div>
                        </div>

                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-3 border-t border-border text-xs">
                            <div className="flex items-center gap-4 text-muted-foreground">
                                <div className="flex items-center gap-1.5 font-semibold text-primary">
                                    <ShieldCheck className="size-4" />
                                    <span>{req.escrowStatus}</span>
                                </div>
                                <span>{req.date}</span>
                                <span className="font-medium text-foreground">{req.deadline}</span>
                            </div>

                            <div className="flex items-center gap-2">
                                <Link
                                    href="/business/profile"
                                    className="border border-border bg-background hover:bg-muted font-medium text-xs px-3 py-1.5 text-foreground transition-colors rounded-sm"
                                >
                                    Creator Profile &rarr;
                                </Link>
                                <button
                                    type="button"
                                    onClick={() => alert(`Direct escrow messaging opened for ${req.id}`)}
                                    className="bg-primary hover:bg-primary/90 text-primary-foreground font-medium text-xs px-3 py-1.5 transition-colors cursor-pointer rounded-sm"
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
