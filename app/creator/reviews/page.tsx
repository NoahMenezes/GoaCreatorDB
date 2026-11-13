'use client'

import Link from 'next/link'
import Image from 'next/image'
import {
    FileText,
    ExternalLink,
    CheckCircle2,
    Star,
    ShieldCheck as ShieldCheckIcon,
} from 'lucide-react'

const tabs = [
    { id: 'all', label: 'All Completed (18)', active: true },
    { id: 'with-reviews', label: 'With Reviews (16)' },
    { id: 'repeat', label: 'Repeat Partners (4)' },
]

const collabRows = [
    {
        id: 'c-1',
        business: 'Café Bodega',
        verified: true,
        location: 'Altinho, Panjim',
        niche: 'Food & Heritage',
        deliverables: [
            { label: '1x Reel', checked: true },
            { label: '2x Stories', checked: true },
        ],
        completed: 'Aug 2024',
        earnings: '₹12,000',
        earningsStatus: 'Cleared',
        rating: '5.0',
        reviewStatus: 'Received',
    },
    {
        id: 'c-2',
        business: 'The Project Assagao',
        verified: true,
        location: 'Assagao',
        niche: 'Boutique Stay',
        deliverables: [
            { label: '1x Reel', checked: true },
            { label: '1x Carousel', checked: true },
        ],
        completed: 'Sep 2024',
        earnings: '₹14,000',
        earningsStatus: 'Cleared',
        rating: '5.0',
        reviewStatus: 'Received',
    },
    {
        id: 'c-3',
        business: 'Jamun Goa',
        verified: true,
        location: 'Assagao',
        niche: 'Dining & Cocktails',
        deliverables: [
            { label: '1x Reel', checked: true },
        ],
        completed: 'Jul 2024',
        earnings: '₹12,000',
        earningsStatus: 'Cleared',
        rating: '5.0',
        reviewStatus: 'Received',
    },
    {
        id: 'c-4',
        business: 'Soro - The Village Pub',
        verified: true,
        location: 'Siolim',
        niche: 'Nightlife',
        deliverables: [
            { label: '2x Reels', checked: true },
            { label: '4x Stories', checked: true },
        ],
        completed: 'Jun 2024',
        earnings: '₹18,000',
        earningsStatus: 'Cleared',
        rating: '5.0',
        reviewStatus: 'Received',
    },
]

const reviews = [
    {
        id: 'r-1',
        business: 'Café Bodega',
        verified: true,
        location: 'Altinho, Panjim',
        rating: 5.0,
        quote:
            'Sneha created an incredible reel on our monsoon dessert menu. Resulted in our busiest Sunday brunch of the season. She understood our heritage courtyard lighting perfectly and delivered without disrupting our seated guests.',
        campaign: 'Verified Campaign · AUG 2024',
        result: '42K Organic Reach',
    },
    {
        id: 'r-2',
        business: 'The Project Assagao',
        verified: true,
        location: 'Boutique Villa Stay Collab',
        rating: 5.0,
        quote:
            'Super professional, timely delivery of raw footage, and highly engaged Goan audience. We gained over 280 direct room inquiries over the weekend following her carousel post. Would definitely book again for our winter festival.',
        campaign: 'Verified Campaign · SEP 2024',
        result: '18 Direct Bookings',
    },
    {
        id: 'r-3',
        business: 'Antares Beach Club',
        verified: true,
        location: 'Vagator',
        rating: 5.0,
        quote:
            'Sneha is our go-to creator for coastal lifestyle vibes. High quality 4K reels and prompt communication. Highly recommended for any beachside brand needing elevated visuals.',
        campaign: 'Verified Campaign · MAY 2024',
        result: '4K UHD Master',
    },
]

export default function CreatorReviewsPage() {
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
                        Collaboration History & Verified Reviews
                    </h1>
                    <p className="text-sm text-muted-foreground mt-1">
                        Track all fulfilled brand campaigns, escrow earnings, and feedback received from Goan venues.
                    </p>
                </div>

                <div className="flex items-center gap-2">
                    <Link
                        href="#"
                        className="flex items-center gap-2 border border-border bg-background px-3.5 py-2 text-xs font-bold text-foreground hover:bg-muted transition-colors rounded-sm cursor-pointer"
                    >
                        <FileText className="size-3.5" />
                        <span>Export PDF</span>
                    </Link>
                    <button
                        className="bg-primary hover:bg-primary/90 text-primary-foreground text-xs font-bold px-4 py-2.5 rounded-sm shadow-sm transition-colors cursor-pointer"
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
                    <div className="text-3xl font-black text-foreground tracking-tight leading-none">5.0</div>
                    <div className="flex items-center gap-1 text-primary font-bold text-xs mt-2">
                        ★★★★★
                    </div>
                    <div className="text-[11px] text-muted-foreground mt-1 leading-tight">
                        5-star across 16 verified venue ratings
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
                    <div className="text-3xl font-black text-foreground tracking-tight mt-1 leading-none">18</div>
                    <div className="text-sm font-bold text-primary mt-2">Hospitality & Dining</div>
                    <div className="flex items-center gap-2 mt-4 text-[11px] text-muted-foreground">
                        <span className="size-2 bg-primary rounded-full" />
                        <span>4 repeat North Goa brand partners</span>
                    </div>
                </div>

                <div className="border border-border bg-card p-5 sm:p-6 rounded-sm shadow-sm">
                    <div className="space-y-0.5">
                        <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                            Escrow Settled
                        </span>
                    </div>
                    <div className="text-3xl font-black text-foreground tracking-tight mt-1 leading-none">₹2,14,000</div>
                    <div className="text-[11px] text-muted-foreground mt-2 leading-tight">
                        Total settled escrow volume across completed collaborations
                    </div>
                </div>
            </section>

            {/* 3. TABS + TABLE */}
            <div className="border border-border bg-card rounded-sm shadow-sm overflow-hidden">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border p-5 sm:p-6">
                    <div className="flex gap-1.5">
                        {tabs.map((t) => (
                            <button
                                key={t.id}
                                className={`px-4 py-2 text-xs font-bold rounded-sm transition-colors ${
                                    t.active
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
                                placeholder="Filter by venue or niche…"
                                className="w-64 pl-3 pr-9 py-2 text-xs border border-border bg-background rounded-sm focus:outline-none focus:ring-1 focus:ring-ring"
                            />
                            <div className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground">
                                <svg className="size-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M21 21l-6-6m2-4a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="border-b border-border bg-muted/50">
                                <th className="px-6 py-4 text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Business Name & Venue</th>
                                <th className="px-6 py-4 text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Campaign Niche</th>
                                <th className="px-6 py-4 text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Deliverables Fulfilled</th>
                                <th className="px-6 py-4 text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Completed</th>
                                <th className="px-6 py-4 text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Earnings</th>
                                <th className="px-6 py-4 text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Review Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border">
                            {collabRows.map((row) => (
                                <tr key={row.id} className="hover:bg-muted/50 transition-colors group">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <Image
                                                src={`https://images.unsplash.com/photo-${[
                                                    '1517248135467-4c7edcad34c4',
                                                    '1445019980590-050d113bca01',
                                                    '1559339352-12d053aa8a79',
                                                    '1512917774080-9991f1c4c750',
                                                ][Number(row.id.slice(-1)) - 1]}?q=80&w=200&auto=format&fit=crop`}
                                                alt={row.business}
                                                width={36}
                                                height={36}
                                                className="size-10 object-cover rounded-md border border-border/60"
                                            />
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-1.5">
                                                    <span className="text-xs font-bold text-foreground truncate">{row.business}</span>
                                                    {row.verified && (
                                                        <span className="flex items-center gap-1 text-[9px] text-primary">
                                                            <CheckCircle2 className="size-2.5" />
                                                            <span>Verified</span>
                                                        </span>
                                                    )}
                                                </div>
                                                <div className="text-[10px] text-muted-foreground">{row.location}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="inline-flex items-center gap-2 px-2 py-1 rounded-md border border-primary/20 text-[9px] font-bold text-primary bg-primary/5">
                                            {row.niche}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex gap-1">
                                            {row.deliverables.map((d, i) => (
                                                <span
                                                    key={i}
                                                    className={`px-2 py-0.5 rounded-md border text-[9px] font-medium ${d.checked ? 'border-primary/20 text-primary bg-primary/5' : 'border-border text-muted-foreground bg-background'}`}
                                                >
                                                    {d.label}
                                                </span>
                                            ))}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-xs text-foreground font-medium">{row.completed}</td>
                                    <td className="px-6 py-4">
                                        <div className="text-xs font-black text-foreground">{row.earnings}</div>
                                        <div className="text-[10px] text-muted-foreground">{row.earningsStatus}</div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md border border-primary/20 text-[9px] font-bold text-primary bg-primary/5">
                                            <Star className="size-3 fill-primary" />
                                            <span>{row.rating}</span>
                                            <span>· {row.reviewStatus}</span>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
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
                        <span>All 16 venues authenticated via Goa Trade Registry</span>
                    </span>
                </div>
                <p className="text-sm text-muted-foreground max-w-2xl">
                    Feedback and quantified commercial outcomes recorded directly into the GoaConnect escrow ledger.
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                    {reviews.map((rev) => (
                        <div key={rev.id} className="border border-border bg-card p-5 sm:p-6 rounded-sm shadow-sm">
                            <div className="flex items-center gap-3 mb-4">
                                <Image
                                    src={`https://images.unsplash.com/photo-${[
                                        '1517248135467-4c7edcad34c4',
                                        '1445019980590-050d113bca01',
                                        '1559339352-12d053aa8a79',
                                    ][Number(rev.id.slice(-1)) - 1]}?q=80&w=200&auto=format&fit=crop`}
                                    alt={rev.business}
                                    width={36}
                                    height={36}
                                    className="size-10 object-cover rounded-md border border-border/60"
                                />
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-1.5">
                                        <span className="text-xs font-bold text-foreground">{rev.business}</span>
                                        {rev.verified && (
                                            <span className="flex items-center gap-1 text-[9px] text-primary">
                                                <CheckCircle2 className="size-2.5" />
                                                <span>Verified Partner</span>
                                            </span>
                                        )}
                                    </div>
                                    <div className="text-[10px] text-muted-foreground">{rev.location}</div>
                                </div>
                            </div>

                            <div className="flex text-primary text-sm mb-3">
                                {'★'.repeat(rev.rating)}
                                <span className="ml-1 text-xs font-black text-foreground">{rev.rating}</span>
                            </div>

                            <p className="text-xs text-muted-foreground leading-relaxed mb-4 italic">
                                &ldquo;{rev.quote}&rdquo;
                            </p>

                            <div className="flex items-center justify-between pt-3 border-t border-border text-muted-foreground">
                                <div className="text-[10px] font-bold uppercase tracking-wider">Verified Campaign</div>
                                <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md border border-primary/20 text-[9px] font-bold text-primary bg-primary/5">
                                    <span>{rev.result}</span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </section>

            {/* 5. ESCROW SHIELD CTA */}
            <section className="border border-primary/30 bg-primary/10 text-primary p-6 sm:p-8 rounded-sm shadow-sm relative overflow-hidden">
                <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="space-y-1">
                        <span className="text-[10px] font-bold text-primary uppercase tracking-wider">
                            Verified Goa Escrow Shield
                        </span>
                        <h3 className="text-xl sm:text-2xl font-black text-primary tracking-tight">
                            Ready to pitch new coastal brands with your 5.0 reputation?
                        </h3>
                        <p className="text-primary/80 text-xs sm:text-sm mt-1 leading-relaxed">
                            Your credentials include 18 completed collaborations, 0 escrow disputes, and ₹2,14,000 in volume.
                        </p>
                    </div>

                    <div className="flex gap-3 sm:flex-col sm:gap-3">
                        <Link
                            href="#"
                            className="flex items-center gap-2 border border-primary/30 bg-background/50 px-3.5 py-2.5 text-primary text-xs font-bold hover:bg-primary/20 transition-colors cursor-pointer"
                        >
                            <FileText className="size-3.5" />
                            <span>Export Portfolio & Reviews PDF</span>
                        </Link>
                        <button
                            className="flex items-center gap-2 bg-primary hover:bg-primary/90 text-primary-foreground text-xs font-bold px-4 py-2.5 rounded-sm shadow-sm transition-colors cursor-pointer"
                        >
                            <ExternalLink className="size-3.5" />
                            <span>Embed Reviews Widget</span>
                        </button>
                    </div>
                </div>
            </section>
        </main>
    )
}
